import React, { useState, useEffect, useRef } from 'react';
import { BiosConfigState, BiosType } from '../types/bios';
import { evaluateBiosStressCapability } from '../utils/stressTestSimulator';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Zap, 
  Cpu, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Play, 
  RotateCcw, 
  ShieldAlert, 
  ShieldCheck, 
  Layers, 
  HardDrive, 
  FileCode, 
  Sparkles, 
  ExternalLink,
  Flame,
  Thermometer,
  Wrench,
  Radio,
  ArrowRight,
  RefreshCw,
  FolderOpen
} from 'lucide-react';

export interface FirmwareRom {
  id: string;
  filename: string;
  version: string;
  releaseDate: string;
  sizeMB: number;
  crc32: string;
  biosType: BiosType | 'both';
  isBeta?: boolean;
  title: string;
  description: string;
  improvements: string[];
}

export const AVAILABLE_FIRMWARES: FirmwareRom[] = [
  {
    id: 'fw-modern-3401',
    filename: 'ROG-MAXIMUS-Z790-CAP-3401.CAP',
    version: 'v3.40 (Microcode 0x12B)',
    releaseDate: '11/10/2026',
    sizeMB: 32,
    crc32: '0x9FA4B210',
    biosType: 'modern',
    title: 'Firmware Oficial Z790 - Parche Vmin Shift & Microcódigo 0x12B',
    description: 'Actualización crítica que mitiga la degradación por picos de sobrevoltaje en procesadores Intel 13ª y 14ª Gen. Mejora compatibilidad con módulos DDR5 XMP 8000+ MHz.',
    improvements: [
      'Nuevo microcódigo de CPU 0x12B para prevenir sobrevoltajes transitorios',
      'Optimización de entrenamiento de latencias de memoria DRAM',
      'Actualización de Intel CSME Firmware a v16.1.30.2307',
      'Compatibilidad con perfiles de potencia Intel Baseline / Extreme'
    ]
  },
  {
    id: 'fw-modern-3502-beta',
    filename: 'ROG-MAXIMUS-Z790-BETA-3502.CAP',
    version: 'v3.50-BETA (AGESA/ME Experimental)',
    releaseDate: '15/10/2026',
    sizeMB: 32,
    crc32: '0x7C118EA3',
    biosType: 'modern',
    isBeta: true,
    title: 'Firmware Experimental Beta - Desbloqueo Agresivo de BCLK',
    description: 'Versión preliminar para entusiastas de overclocking extremo. Tablas de voltajes más agresivas con curvas de calibración LLC nivel 8.',
    improvements: [
      'Microcódigo experimental desbloqueado para BCLK Overclock',
      'Ajustes de sub-timings tREFI aumentados a 65535',
      'Advertencia: No recomendado para uso en servidores ni entornos de producción'
    ]
  },
  {
    id: 'fw-legacy-600pg-rev2',
    filename: 'AWARD-600PG-AC97-REV2.BIN',
    version: 'Award v2.10 (LBA-48 Support)',
    releaseDate: '04/05/2003',
    sizeMB: 0.5,
    crc32: '0x4A8F21D0',
    biosType: 'legacy',
    title: 'Award Modular BIOS v6.00PG - Revisión 2.10',
    description: 'Actualización histórica que incorpora direccionamiento LBA de 48 bits para discos duros de más de 137 GB y corrige suspensión ACPI S3 en Windows XP.',
    improvements: [
      'Soporte completo para discos duros IDE ATA-133 mayores a 137 Gigabytes',
      'Corrección de bug en suspensión ACPI STR (Suspend-to-RAM) en chipset i865/i875',
      'Parche para compatibilidad con procesadores Pentium 4 Prescott con Hyper-Threading'
    ]
  }
];

interface BiosUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: BiosConfigState;
  biosType: BiosType;
  currentBiosVersion: string;
  onFirmwareUpdated: (newVersion: string) => void;
  onRebootToPost: () => void;
  onLoadSafeDefaults?: () => void;
}

export const BiosUpdateModal: React.FC<BiosUpdateModalProps> = ({
  isOpen,
  onClose,
  config,
  biosType,
  currentBiosVersion,
  onFirmwareUpdated,
  onRebootToPost,
  onLoadSafeDefaults
}) => {
  const [selectedRom, setSelectedRom] = useState<FirmwareRom>(() => {
    return biosType === 'legacy' ? AVAILABLE_FIRMWARES[2] : AVAILABLE_FIRMWARES[0];
  });

  const [flashStage, setFlashStage] = useState<'inspect' | 'flashing' | 'success' | 'crashed'>('inspect');
  const [flashProgress, setFlashProgress] = useState(0);
  const [currentBlockHex, setCurrentBlockHex] = useState('0x00000000');
  const [currentSectorIndex, setCurrentSectorIndex] = useState(0);
  const [activityStatus, setActivityStatus] = useState<string>('Esperando confirmación...');
  const [failureLog, setFailureLog] = useState<{ reason: string; code: string; diagnosis: string } | null>(null);
  const [isUsingFlashbackRecovery, setIsUsingFlashbackRecovery] = useState(false);
  const [flashbackProgress, setFlashbackProgress] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // When modal opens or biosType changes, select matching ROM
  useEffect(() => {
    if (biosType === 'legacy') {
      setSelectedRom(AVAILABLE_FIRMWARES[2]);
    } else {
      setSelectedRom(AVAILABLE_FIRMWARES[0]);
    }
  }, [biosType]);

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!isOpen) return null;

  // Stability evaluation from stress test parameters
  const evaluation = evaluateBiosStressCapability(config, 'full_system');
  const isLegacy = biosType === 'legacy';

  // Handle starting the firmware flash
  const handleStartFlash = (forceIgnoreWarnings: boolean = false) => {
    soundManager.playKeyTick();
    setFlashStage('flashing');
    setFlashProgress(0);
    setCurrentSectorIndex(0);
    setFailureLog(null);
    setActivityStatus('Iniciando lectura de la cápsula de firmware en buffer RAM...');

    let progress = 0;
    const totalSectors = 256; // 256 blocks of 128KB in a 32MB SPI chip
    const crashProgressTarget = evaluation.willCrash ? evaluation.crashAtProgress : 100;

    timerRef.current = setInterval(() => {
      progress += 1;
      setFlashProgress(progress);

      const sectorNum = Math.floor((progress / 100) * totalSectors);
      setCurrentSectorIndex(sectorNum);
      const hexAddress = '0x' + (sectorNum * 0x00020000).toString(16).toUpperCase().padStart(8, '0');
      setCurrentBlockHex(hexAddress);

      // Play soft sector programming sound tick periodically
      if (progress % 4 === 0) {
        soundManager.playFlashTick();
      }

      // Dynamic phase status updates
      if (progress <= 20) {
        setActivityStatus(`Fase 1/4: Autenticando firma RSA y descifrando bloque en memoria RAM (${progress}%)...`);
      } else if (progress <= 46) {
        setActivityStatus(`Fase 2/4: Borrando bloques físicos de la memoria SPI Flash EEPROM [Sector ${sectorNum}/${totalSectors}]...`);
      } else if (progress <= 78) {
        setActivityStatus(`Fase 3/4: Grabando nuevo Microcódigo de CPU y binarios PEI/DXE en dirección ${hexAddress}...`);
      } else {
        setActivityStatus(`Fase 4/4: Verificando sumas SHA-256 de sectores y sincronizando NVRAM Intel ME...`);
      }

      // Check if system crashes due to unstable hardware parameters
      if (evaluation.willCrash && progress >= crashProgressTarget && !forceIgnoreWarnings) {
        if (timerRef.current) clearInterval(timerRef.current);
        soundManager.playCrashBuzz();
        setFlashStage('crashed');
        setFailureLog({
          reason: evaluation.diagnostics.failureReason || 'Fallo de cálculo en CPU durante la verificación de escritura SPI.',
          code: evaluation.diagnostics.failureCode || 'SPI_WRITE_FATAL_INTEGRITY_MISMATCH',
          diagnosis: evaluation.diagnostics.technicalDiagnosis || 'El procesador demandó una conmutación de estado que provocó una caída de tensión (Vdroop) o estrangulamiento térmico en mitad del ciclo de programación de la memoria ROM.'
        });
        return;
      }

      // Successful completion
      if (progress >= 100) {
        if (timerRef.current) clearInterval(timerRef.current);
        soundManager.playFlashSuccessChime();
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 }
          });
        } catch {
          // Ignore
        }
        setFlashStage('success');
        onFirmwareUpdated(selectedRom.version);
      }
    }, 110);
  };

  // Emergency USB BIOS Flashback procedure
  const handleUsbFlashbackRecovery = () => {
    soundManager.playKeyTick();
    setIsUsingFlashbackRecovery(true);
    setFlashbackProgress(0);

    let p = 0;
    const fbTimer = setInterval(() => {
      p += 2;
      setFlashbackProgress(p);
      if (p % 6 === 0) soundManager.playFlashTick();

      if (p >= 100) {
        clearInterval(fbTimer);
        soundManager.playPostSuccessBeep();
        setIsUsingFlashbackRecovery(false);
        setFlashStage('success');
        onFirmwareUpdated(selectedRom.version);
      }
    }, 80);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className={`w-full max-w-4xl rounded-2xl shadow-2xl border overflow-hidden transition-all my-auto ${
        isLegacy 
          ? 'bg-[#0000aa] border-yellow-400 text-white font-mono' 
          : 'bg-slate-900 border-slate-700/80 text-slate-100 font-sans'
      }`}>

        {/* Modal Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
          isLegacy 
            ? 'bg-[#000088] border-yellow-400/60' 
            : 'bg-slate-950 border-slate-800'
        }`}>
          <div className="flex items-center gap-3">
            <a
              href="https://www.unfantasmaenelsistema.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 group p-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-cyan-400 transition-colors"
              title="Visitar Un Fantasma en el Sistema"
            >
              <img 
                src="/icono.png" 
                alt="Logo Un Fantasma en el Sistema" 
                className="w-7 h-7 sm:w-8 sm:h-8 object-contain group-hover:scale-105 transition-transform" 
              />
              <span className="hidden sm:inline font-bold text-xs text-white group-hover:text-cyan-300">
                unfantasmaenelsistema.com
              </span>
              <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-cyan-300" />
            </a>

            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  isLegacy ? 'bg-yellow-400 text-blue-950' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                }`}>
                  {isLegacy ? 'Award Flash v8.24' : 'ASUS EZ Flash 3 / Q-Flash'}
                </span>
                <h2 className="text-sm sm:text-base font-bold font-uefi tracking-wide text-white">
                  {isLegacy ? 'Utilidad de Flasheo de ROM EEPROM' : 'Utilidad de Actualización de Firmware BIOS'}
                </h2>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Placa Base: Republic of Hardware Z790-F | Chip SPI: Winbond W25Q256 (32MB)
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (flashStage === 'flashing') {
                if (timerRef.current) clearInterval(timerRef.current);
              }
              soundManager.playKeyTick();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-6 max-h-[82vh] overflow-y-auto">

          {/* STAGE 1: Inspection & Stability Pre-Check */}
          {flashStage === 'inspect' && (
            <div className="space-y-6">

              {/* Version Comparison Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Current BIOS Card */}
                <div className={`p-4 rounded-xl border ${
                  isLegacy ? 'bg-[#000088] border-white/20' : 'bg-slate-950/70 border-slate-800'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-400">Versión Actual Instalada</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      En Placa
                    </span>
                  </div>
                  <div className="text-xl font-bold font-mono text-cyan-400 mb-1">
                    {currentBiosVersion || 'v2.80-X64'}
                  </div>
                  <div className="text-xs text-slate-400 space-y-1">
                    <p>Fecha de compilación: 15/01/2024</p>
                    <p>Microcódigo CPU: 0x119 (Vmin Legacy)</p>
                    <p>Integridad SPI Flash: 100% OK</p>
                  </div>
                </div>

                {/* Target BIOS Card */}
                <div className={`p-4 rounded-xl border relative overflow-hidden ${
                  isLegacy ? 'bg-[#000088] border-yellow-400/80' : 'bg-cyan-950/20 border-cyan-500/50'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-cyan-300">Nueva Versión a Flashear</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold font-mono ${
                      selectedRom.isBeta ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}>
                      {selectedRom.isBeta ? 'BETA RELEASE' : 'OFICIAL RECOMENDADO'}
                    </span>
                  </div>
                  <div className="text-xl font-bold font-mono text-white mb-1">
                    {selectedRom.version}
                  </div>
                  <div className="text-xs text-slate-300 space-y-1 font-mono">
                    <p>Archivo: {selectedRom.filename}</p>
                    <p>Tamaño: {selectedRom.sizeMB} MB | CRC32: {selectedRom.crc32}</p>
                    <p className="text-emerald-400">✓ Validación de firma criptográfica OK</p>
                  </div>
                </div>
              </div>

              {/* Firmware Selection Explorer */}
              <div className={`p-4 rounded-xl border ${
                isLegacy ? 'bg-[#000088] border-white/20' : 'bg-slate-950/60 border-slate-800'
              }`}>
                <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-300">
                  <FolderOpen className="w-4 h-4 text-cyan-400" />
                  <span>Explorador de Medios: Unidad USB FAT32 [fs0:\]</span>
                </div>

                <div className="space-y-2">
                  {AVAILABLE_FIRMWARES.map((rom) => {
                    const isSelected = selectedRom.id === rom.id;
                    return (
                      <div
                        key={rom.id}
                        onClick={() => {
                          soundManager.playKeyTick();
                          setSelectedRom(rom);
                        }}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isSelected
                            ? isLegacy
                              ? 'bg-yellow-400 text-blue-950 font-bold border-white'
                              : 'bg-cyan-950/40 border-cyan-400 ring-1 ring-cyan-500/50'
                            : isLegacy
                              ? 'bg-transparent border-white/20 hover:bg-white/10'
                              : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <FileCode className={`w-5 h-5 shrink-0 mt-0.5 ${isSelected && isLegacy ? 'text-blue-950' : 'text-cyan-400'}`} />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold">{rom.filename}</span>
                              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                                isSelected && isLegacy 
                                  ? 'bg-blue-950 text-yellow-300' 
                                  : 'bg-slate-800 text-slate-300'
                              }`}>
                                {rom.sizeMB} MB
                              </span>
                            </div>
                            <p className={`text-[11px] mt-0.5 line-clamp-1 ${
                              isSelected && isLegacy ? 'text-blue-900' : 'text-slate-400'
                            }`}>
                              {rom.title}
                            </p>
                          </div>
                        </div>

                        <div className="text-right sm:shrink-0 text-xs font-mono">
                          <span className={`${isSelected && isLegacy ? 'text-blue-950' : 'text-slate-400'}`}>
                            {rom.releaseDate}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Hardware Stability Pre-Check Gauge based on Stress Test parameters */}
              <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                evaluation.willCrash
                  ? 'bg-rose-950/30 border-rose-500/60 ring-1 ring-rose-500/30'
                  : evaluation.diagnostics.status === 'throttled'
                    ? 'bg-amber-950/30 border-amber-500/60'
                    : 'bg-emerald-950/30 border-emerald-500/60'
              }`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    {evaluation.willCrash ? (
                      <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-sm text-white flex items-center gap-2">
                        <span>Diagnóstico de Estabilidad Pre-Flasheo</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          evaluation.willCrash 
                            ? 'bg-rose-500 text-white font-black' 
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}>
                          {evaluation.willCrash ? 'PELIGRO DE BRICKEO' : 'SISTEMA SEGURO'}
                        </span>
                      </h4>
                      <p className="text-xs text-slate-400">
                        Evaluación en tiempo real según los parámetros activos de CPU, voltajes y refrigeración.
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-semibold text-slate-400">Margen de Estabilidad</div>
                    <div className={`text-xl font-black font-mono ${
                      evaluation.willCrash ? 'text-rose-400' : 'text-emerald-400'
                    }`}>
                      {evaluation.diagnostics.stabilityPercentage}%
                    </div>
                  </div>
                </div>

                {/* Telemetry Indicator Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">VCore CPU</span>
                    <span className={`font-bold ${config['cpu_voltage']?.includes('Offset') ? 'text-amber-400' : 'text-cyan-400'}`}>
                      {config['cpu_voltage'] || 'Auto'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Reloj CPU</span>
                    <span className="font-bold text-slate-200">
                      {config['cpu_ratio'] || 'Stock'} ({evaluation.diagnostics.effectiveClockGHz} GHz)
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Temp Estimada</span>
                    <span className={`font-bold ${evaluation.diagnostics.maxTempReached >= 90 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {evaluation.diagnostics.maxTempReached}°C
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Perfil Ventilador</span>
                    <span className="font-bold text-slate-200">
                      {config['fan_profile'] || 'Standard'}
                    </span>
                  </div>
                </div>

                {/* Educational Warning or Green Light */}
                {evaluation.willCrash ? (
                  <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/50 space-y-2">
                    <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>¡ADVERTENCIA CRÍTICA DE TALLER DE HARDWARE!</span>
                    </div>
                    <p className="text-xs text-rose-200/90 leading-relaxed">
                      Tu configuración actual no superaría el Test de Estrés ({evaluation.diagnostics.failureReason}). 
                      Si procedes a flashear con subvoltaje o overclock inestable, la CPU sufrirá un cuelgue mientras borra la memoria EEPROM, corrompiendo el sector de arranque de la placa madre.
                    </p>
                    {onLoadSafeDefaults && (
                      <div className="pt-1 flex flex-wrap gap-2">
                        <button
                          onClick={() => {
                            soundManager.playKeyTick();
                            onLoadSafeDefaults();
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Cargar Valores Seguros Recomendados (JEDEC)</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>Los voltajes y la estabilidad térmica son idóneos para proceder con la reprogramación del firmware.</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="text-xs text-slate-400">
                  ⚠️ No desconectes la fuente ni reinicies el equipo durante el proceso.
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {evaluation.willCrash && (
                    <button
                      onClick={() => handleStartFlash(false)}
                      className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-rose-900/60 hover:bg-rose-800 border border-rose-500/60 text-rose-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                      title="Simula qué le ocurre a una placa real cuando se flashea con overclock inestable"
                    >
                      <Flame className="w-4 h-4 text-rose-400" />
                      <span>Forzar Flasheo Inestable (Ver Fallo)</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleStartFlash(false)}
                    className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
                      evaluation.willCrash
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                        : 'bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold shadow-cyan-500/20'
                    }`}
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Comenzar Flasheo de BIOS</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* STAGE 2: Flashing In Progress (Progress Bar & Hex Sectors) */}
          {flashStage === 'flashing' && (
            <div className="space-y-6 py-4">
              
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-mono animate-pulse">
                  <Radio className="w-3.5 h-3.5 text-cyan-400" />
                  <span>PROGRAMACIÓN SPI EEPROM EN CURSO</span>
                </div>
                <h3 className="text-2xl font-black font-uefi text-white">
                  Actualizando Firmware: {selectedRom.filename}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {activityStatus}
                </p>
              </div>

              {/* Progress Bar Component */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-cyan-400 font-bold">Progreso Total de Grabación</span>
                  <span className="text-lg font-black text-white">{flashProgress}%</span>
                </div>

                <div className="w-full h-6 rounded-full bg-slate-950 border border-slate-700 p-1 overflow-hidden relative shadow-inner">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-500 transition-all duration-150 relative overflow-hidden"
                    style={{ width: `${flashProgress}%` }}
                  >
                    {/* Animated scanning sheen */}
                    <div className="absolute inset-0 bg-white/20 -skew-x-12 animate-pulse" />
                  </div>
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono pt-1">
                  <span>Bloques Escritos: {currentSectorIndex} / 256</span>
                  <span className="text-cyan-300">Dirección HEX: {currentBlockHex}</span>
                </div>
              </div>

              {/* Hardware Activity Panel */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">LED SPI Flash:</span>
                  <span className="flex items-center gap-1.5 text-amber-400 font-bold animate-pulse">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    ACTIVO (WR)
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Microcódigo CPU:</span>
                  <span className="text-emerald-400 font-bold">
                    {flashProgress > 50 ? '0x12B Inyectado' : 'Cargando...'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Buffer RAM:</span>
                  <span className="text-cyan-400 font-bold">32.0 MB / 32.0 MB</span>
                </div>
              </div>

              {/* Warning Banner */}
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/50 text-amber-200 text-xs flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />
                <span>
                  <strong>PRECAUCIÓN:</strong> Bajo ninguna circunstancia desconectes el cable de alimentación ni presiones el botón de reset. Una interrupción en esta etapa dejará el chip de BIOS sin tabla de descriptores de arranque.
                </span>
              </div>

            </div>
          )}

          {/* STAGE 3: Critical Failure / Soft Brick Screen */}
          {flashStage === 'crashed' && (
            <div className="space-y-5 py-2">
              <div className="p-5 rounded-2xl bg-rose-950/80 border-2 border-rose-500 text-white space-y-4 shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-rose-600 text-white shadow-lg animate-bounce">
                    <ShieldAlert className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black font-uefi tracking-wide text-rose-300">
                      ¡FALLO CRÍTICO DE FLASHEO: CHIP SPI CORRUPTO!
                    </h3>
                    <p className="text-xs text-rose-200 font-mono">
                      Código de Parada: {failureLog?.code}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-black/60 border border-rose-500/40 text-xs font-mono space-y-2">
                  <div className="text-rose-400 font-bold">
                    [ERROR FATAL]: {failureLog?.reason}
                  </div>
                  <div className="text-slate-300 leading-relaxed">
                    {failureLog?.diagnosis}
                  </div>
                  <div className="text-amber-400 text-[11px] pt-1">
                    Dirección afectada: {currentBlockHex} (Sector intermedio {currentSectorIndex}/256 a medio programar).
                  </div>
                </div>

                {/* Educational Takeaway */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-slate-300 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold">
                    <Sparkles className="w-4 h-4" />
                    <span>Lección Práctica de Reparación de Hardware:</span>
                  </div>
                  <p className="leading-relaxed">
                    ¿Por qué ocurrió esto? Los fabricantes de placas base (ASUS, MSI, Gigabyte, ASRock) indican explícitamente en sus manuales: <em>"Cargue los valores por defecto optimizados (F9) antes de actualizar la BIOS"</em>. Si el equipo tiene subvoltaje agresivo o sobrecalentamiento, la CPU falla en la verificación CRC32, abortando el proceso y dejando la placa <strong>"brickada"</strong> (incapaz de dar vídeo al encender).
                  </p>
                </div>

                {/* Recovery Methods */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-slate-300">
                    Opciones de recuperación de emergencia disponibles en placas modernas:
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleUsbFlashbackRecovery}
                      className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg"
                      title="Utiliza el microcontrolador auxiliar para flashear la BIOS sin depender de la CPU ni la RAM"
                    >
                      <Wrench className="w-4 h-4" />
                      <span>Activar USB BIOS Flashback (Recuperación)</span>
                    </button>

                    <button
                      onClick={() => {
                        soundManager.playKeyTick();
                        if (onLoadSafeDefaults) onLoadSafeDefaults();
                        setFlashStage('inspect');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Cargar Defaults y Reintentar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* EMERGENCY FLASHBACK IN PROGRESS */}
          {isUsingFlashbackRecovery && (
            <div className="p-5 rounded-2xl bg-cyan-950/80 border border-cyan-500 text-white space-y-4">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
                <div>
                  <h4 className="font-bold text-sm text-cyan-300">
                    Ejecutando USB BIOS Flashback por Microcontrolador Autónomo
                  </h4>
                  <p className="text-xs text-slate-400">
                    Restaurando chip SPI Flash mediante bus I2C secundario a frecuencias de fábrica seguras.
                  </p>
                </div>
              </div>
              <div className="w-full h-4 rounded-full bg-slate-950 overflow-hidden">
                <div 
                  className="h-full bg-cyan-400 transition-all duration-100"
                  style={{ width: `${flashbackProgress}%` }}
                />
              </div>
              <p className="text-right text-xs font-mono text-cyan-400">{flashbackProgress}%</p>
            </div>
          )}

          {/* STAGE 4: Success Screen */}
          {flashStage === 'success' && (
            <div className="space-y-6 py-4 text-center">
              <div className="inline-flex p-4 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-black font-uefi text-white">
                  ¡Actualización de BIOS Completada con Éxito!
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                  El chip SPI Flash EEPROM ha sido grabado y verificado al 100%. El nuevo microcódigo de CPU y la tabla ACPI están listos para el próximo arranque.
                </p>
              </div>

              {/* Version Badge */}
              <div className="inline-block p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-1.5 font-mono text-xs">
                <div className="flex items-center justify-between gap-6">
                  <span className="text-slate-400">Nueva Versión Activa:</span>
                  <span className="text-emerald-400 font-bold">{selectedRom.version}</span>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <span className="text-slate-400">Checksum de Verificación:</span>
                  <span className="text-cyan-400">{selectedRom.crc32} [VALIDADO]</span>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <span className="text-slate-400">Microcódigo Intel/AMD:</span>
                  <span className="text-white">0x12B (Protección de Degradación Activa)</span>
                </div>
              </div>

              {/* Improvements summary */}
              <div className="max-w-xl mx-auto p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-left">
                <span className="text-xs font-bold text-slate-300 block mb-2">
                  Mejoras aplicadas al hardware:
                </span>
                <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                  {selectedRom.improvements.map((imp, idx) => (
                    <li key={idx}>{imp}</li>
                  ))}
                </ul>
              </div>

              {/* Reboot Action */}
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => {
                    soundManager.playKeyTick();
                    onClose();
                    onRebootToPost();
                  }}
                  className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-sm flex items-center gap-2 shadow-xl shadow-cyan-500/20 transition-all transform hover:scale-105"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reiniciar Equipo (Reboot a POST con Nueva BIOS)</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer with Un Fantasma en el Sistema link */}
        <div className={`p-3.5 border-t text-[11px] flex flex-col sm:flex-row items-center justify-between gap-2 ${
          isLegacy ? 'bg-[#000088] border-yellow-400/40 text-yellow-300' : 'bg-slate-950 border-slate-800 text-slate-400'
        }`}>
          <div className="flex items-center gap-2">
            <span>Herramienta Didáctica de Firmware</span>
            <span>•</span>
            <a 
              href="https://www.unfantasmaenelsistema.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-300 underline font-mono"
            >
              www.unfantasmaenelsistema.com
            </a>
          </div>

          <div className="flex items-center gap-3">
            <span>Tecla rápida: <strong>F11</strong> (Utilidad de Flasheo)</span>
          </div>
        </div>

      </div>
    </div>
  );
};
