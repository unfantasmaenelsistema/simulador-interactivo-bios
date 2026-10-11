import React, { useState, useEffect } from 'react';
import { BiosOption, BiosConfigState, OptionCategory, HardwareMetrics } from '../types/bios';
import { BIOS_OPTIONS } from '../data/biosOptions';
import { calculateHardwareMetrics } from '../utils/benchmark';
import { soundManager } from '../utils/audio';
import { EducationalInspector } from './EducationalInspector';
import { 
  Cpu, 
  Layers, 
  Activity, 
  Thermometer, 
  Zap, 
  Clock, 
  ShieldCheck, 
  Search, 
  SlidersHorizontal, 
  Power, 
  RotateCcw, 
  Save, 
  Volume2, 
  VolumeX, 
  HelpCircle, 
  Gauge, 
  HardDrive, 
  Fan, 
  ChevronRight, 
  X,
  Play,
  Flame,
  Award,
  HeartPulse,
  RefreshCw
} from 'lucide-react';
import { DiagnosticOverlay } from './DiagnosticOverlay';
import { BootPriorityManager } from './BootPriorityManager';

interface ModernUefiBiosProps {
  config: BiosConfigState;
  onChangeOption: (optionId: string, newValue: string) => void;
  onResetDefaults: () => void;
  onRequestSaveExit: () => void;
  onExitWithoutSave: () => void;
  onOpenProfiles: () => void;
  onOpenMissions: () => void;
  onOpenStressTest: () => void;
  onSwitchBiosType: () => void;
  onOpenBiosUpdate?: () => void;
  currentBiosVersion?: string;
}

const ADVANCED_CATEGORIES: { id: OptionCategory; label: string }[] = [
  { id: 'Main', label: 'Main' },
  { id: 'Ai_Tweaker', label: 'Ai Tweaker / OC' },
  { id: 'Advanced', label: 'Advanced' },
  { id: 'Monitor', label: 'Monitor' },
  { id: 'Boot', label: 'Boot' },
  { id: 'Tool', label: 'Tool' },
  { id: 'Exit', label: 'Exit' }
];

export const ModernUefiBios: React.FC<ModernUefiBiosProps> = ({
  config,
  onChangeOption,
  onResetDefaults,
  onRequestSaveExit,
  onExitWithoutSave,
  onOpenProfiles,
  onOpenMissions,
  onOpenStressTest,
  onSwitchBiosType,
  onOpenBiosUpdate,
  currentBiosVersion
}) => {
  const [viewMode, setViewMode] = useState<'ez' | 'advanced'>('ez');
  const [activeCategory, setActiveCategory] = useState<OptionCategory>('Ai_Tweaker');
  const [selectedOptionId, setSelectedOptionId] = useState<string>('xmp_docp');
  const [searchQuery, setSearchQuery] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(soundManager.isSoundEnabled());
  const [isDiagnosticOverlayOpen, setIsDiagnosticOverlayOpen] = useState(false);

  const metrics: HardwareMetrics = calculateHardwareMetrics(config);

  const selectedOption = BIOS_OPTIONS.find((o) => o.id === selectedOptionId) || BIOS_OPTIONS[0];

  // Options filtering for Advanced mode
  const filteredOptions = BIOS_OPTIONS.filter((opt) => {
    if (!opt.availableIn.includes('modern')) return false;
    if (searchQuery.trim()) {
      return (
        opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opt.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return opt.category === activeCategory;
  });

  // Hotkey listener (F7 for EZ/Advanced, F8 for HUD, F11 for Flasher, F10 Save, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F6') {
        e.preventDefault();
        soundManager.playKeyTick();
        setViewMode('advanced');
        setActiveCategory('Boot');
      } else if (e.key === 'F7') {
        e.preventDefault();
        soundManager.playKeyTick();
        setViewMode((prev) => (prev === 'ez' ? 'advanced' : 'ez'));
      } else if (e.key === 'F8') {
        e.preventDefault();
        soundManager.playKeyTick();
        setIsDiagnosticOverlayOpen((prev) => !prev);
      } else if (e.key === 'F11') {
        e.preventDefault();
        soundManager.playKeyTick();
        if (onOpenBiosUpdate) onOpenBiosUpdate();
      } else if (e.key === 'F10') {
        e.preventDefault();
        soundManager.playKeyTick();
        onRequestSaveExit();
      } else if (e.key === 'F9') {
        e.preventDefault();
        // Focus search if in advanced mode
        setViewMode('advanced');
      } else if (e.key === 'Escape') {
        soundManager.playKeyTick();
        onRequestSaveExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRequestSaveExit, onOpenBiosUpdate]);

  return (
    <div className="relative w-full h-full min-h-screen bg-slate-950 text-slate-100 select-none font-sans flex flex-col justify-between overflow-x-hidden">
      
      {/* Top Gaming UEFI Header Bar */}
      <header className="z-20 border-b border-slate-800 bg-slate-950/90 backdrop-blur px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <a
            href="https://www.unfantasmaenelsistema.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 group border-r border-slate-800 pr-3"
            title="Visitar Un Fantasma en el Sistema (www.unfantasmaenelsistema.com)"
          >
            <img 
              src={`${import.meta.env.BASE_URL}icono.png`} 
              alt="Logo Un Fantasma en el Sistema" 
              className="w-8 h-8 object-contain group-hover:scale-110 transition-transform drop-shadow" 
            />
          </a>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm sm:text-base font-uefi tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-indigo-300">
                  REPUBLIC OF HARDWARE UEFI BIOS
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  {currentBiosVersion || 'v2.80-X64'}
                </span>
                <a
                  href="https://www.unfantasmaenelsistema.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono text-slate-400 hover:text-cyan-300 transition-colors"
                >
                  <span>unfantasmaenelsistema.com</span>
                </a>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Intel(R) Core(TM) i7-14700K | DDR4 32GB Dual-Channel | NVIDIA RTX 4080
              </p>
            </div>
          </div>
        </div>

        {/* Top Controls: Mode Switch, Sounds, Profiles, Missions, Stress Test */}
        <div className="flex items-center gap-2">
          
          <button
            onClick={() => {
              soundManager.playKeyTick();
              setViewMode(viewMode === 'ez' ? 'advanced' : 'ez');
            }}
            className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-lg shadow-cyan-950"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{viewMode === 'ez' ? 'Modo Avanzado (F7)' : 'EZ Mode (F7)'}</span>
          </button>

          <button
            onClick={() => {
              soundManager.playKeyTick();
              setIsDiagnosticOverlayOpen(!isDiagnosticOverlayOpen);
            }}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm ${
              isDiagnosticOverlayOpen
                ? 'bg-emerald-600 text-white border-emerald-400 font-bold shadow-md shadow-emerald-950'
                : 'bg-emerald-950/40 hover:bg-emerald-900/60 border-emerald-500/40 text-emerald-300'
            }`}
            title="Alternar HUD de Sensores y Salud (Tecla F8)"
          >
            <HeartPulse className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">HUD Salud (F8)</span>
          </button>

          <button
            onClick={() => {
              soundManager.playKeyTick();
              onOpenStressTest();
            }}
            className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Test de Estrés</span>
          </button>

          <button
            onClick={() => {
              soundManager.playKeyTick();
              onOpenProfiles();
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Perfiles / Benchmarks</span>
          </button>

          <button
            onClick={() => {
              soundManager.playKeyTick();
              onOpenMissions();
            }}
            className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Award className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Misiones</span>
          </button>

          <button
            onClick={() => {
              soundManager.playKeyTick();
              if (onOpenBiosUpdate) onOpenBiosUpdate();
            }}
            className="px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            title="Utilidad de Flasheo de BIOS (Tecla F11)"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">EZ Flash (F11)</span>
          </button>

          <button
            onClick={() => {
              const newState = !soundEnabled;
              setSoundEnabled(newState);
              soundManager.setSoundEnabled(newState);
            }}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            title="Sonido de Beep"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={onSwitchBiosType}
            className="px-2.5 py-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-700 text-indigo-300 text-xs font-mono"
            title="Cambiar a BIOS Antigua"
          >
            BIOS Legacy
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 p-3 sm:p-5 overflow-y-auto">
        {viewMode === 'ez' ? (
          /* ========================================================================= */
          /* ============================ EZ MODE (DASHBOARD) ======================== */
          /* ========================================================================= */
          <div className="max-w-7xl mx-auto space-y-4 animate-in fade-in duration-150">
            
            {/* Top Stat Gauges Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              
              {/* CPU Temp & Clock */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xl">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Temperatura CPU
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className={`text-2xl font-extrabold font-mono ${
                      metrics.cpuTempLoad > 85 ? 'text-rose-400 animate-pulse' : 'text-cyan-400'
                    }`}>
                      {metrics.cpuTempIdle}°C
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      (Carga: {metrics.cpuTempLoad}°C)
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Frecuencia: {config['cpu_ratio']?.includes('x51') ? '5.10 GHz' : config['cpu_ratio']?.includes('x48') ? '4.80 GHz' : config['cpu_ratio']?.includes('x45') ? '4.50 GHz' : '4.20 GHz'}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <Thermometer className="w-7 h-7" />
                </div>
              </div>

              {/* Memory / XMP Gauge */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xl">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Velocidad Memoria RAM
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-extrabold font-mono text-indigo-400">
                      {metrics.ramSpeedMHz} MHz
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Latencia: {metrics.ramLatencyNs} ns | {metrics.ramBandwidthGBs} GB/s
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <Layers className="w-7 h-7" />
                </div>
              </div>

              {/* Power / Voltage */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xl">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Consumo TDP & Voltaje
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-extrabold font-mono text-amber-400">
                      {metrics.loadWatts} W
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      (Idle: {metrics.idleWatts}W)
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block font-mono">
                    VCore: {config['cpu_voltage'] || 'Auto'}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Zap className="w-7 h-7" />
                </div>
              </div>

              {/* Boot Time & Fast Boot */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xl">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Tiempo de POST / Inicio
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-extrabold font-mono text-teal-400">
                      {metrics.bootTimeSeconds} s
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Fast Boot: {config['fast_boot']?.split(' ')[0] || 'Enabled'}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
                  <Clock className="w-7 h-7" />
                </div>
              </div>

            </div>

            {/* Quick Interactive Toggles Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Card 1: XMP One-Click Switcher */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-white flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-400" />
                      Perfil X.M.P / DOCP
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      config['xmp_docp']?.includes('Profile') 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {config['xmp_docp']?.includes('Profile') ? 'ACTIVO' : 'DESACTIVADO'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">
                    Desbloquea las frecuencias de fábrica certificadas de tu memoria RAM con un solo clic.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      soundManager.playValueChangeSound();
                      onChangeOption('xmp_docp', 'Disabled (JEDEC 2133/2666 MHz)');
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                      config['xmp_docp']?.includes('Disabled')
                        ? 'bg-slate-700 text-white border border-slate-500'
                        : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    Desactivado (JEDEC)
                  </button>
                  <button
                    onClick={() => {
                      soundManager.playValueChangeSound();
                      onChangeOption('xmp_docp', 'Profile 1 (DDR4-3600 CL16 / 1.35V)');
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                      config['xmp_docp']?.includes('Profile 1')
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-950 font-bold'
                        : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    Profile 1 (3600MHz)
                  </button>
                </div>
              </div>

              {/* Card 2: Smart Fan Curve Profile */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-white flex items-center gap-2">
                      <Fan className="w-4 h-4 text-cyan-400 animate-spin" />
                      Q-Fan / Curva de Ventilación
                    </span>
                    <span className="text-xs font-mono text-cyan-400">
                      {config['fan_profile']?.split(' ')[0] || 'Standard'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">
                    Ajusta la relación entre el flujo de aire refrigerante y el nivel de ruido en decibelios.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {['Silent (Silencioso)', 'Standard (Equilibrado)', 'Turbo (Alto Flujo de Aire)'].map((p) => {
                    const isCur = config['fan_profile'] === p;
                    const label = p.split(' ')[0];
                    return (
                      <button
                        key={p}
                        onClick={() => {
                          soundManager.playValueChangeSound();
                          onChangeOption('fan_profile', p);
                        }}
                        className={`py-1.5 px-2 rounded-xl text-xs font-medium transition-all ${
                          isCur
                            ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-950'
                            : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Card 3: Windows 11 & Security Status */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Compatibilidad Windows 11
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      metrics.win11Ready 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {metrics.win11Ready ? 'COMPATIBLE' : 'INCOMPATIBLE'}
                    </span>
                  </div>
                  <div className="text-xs space-y-1 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">TPM 2.0:</span>
                      <span className={config['tpm_device']?.includes('Enabled') ? 'text-emerald-400' : 'text-rose-400'}>
                        {config['tpm_device']?.includes('Enabled') ? 'Activo ✓' : 'Inactivo ✗'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Secure Boot:</span>
                      <span className={config['secure_boot']?.includes('Enabled') ? 'text-emerald-400' : 'text-rose-400'}>
                        {config['secure_boot']?.includes('Enabled') ? 'Activo ✓' : 'Inactivo ✗'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Modo CSM:</span>
                      <span className={config['csm_support']?.includes('Disabled') ? 'text-emerald-400' : 'text-amber-400'}>
                        {config['csm_support']?.includes('Disabled') ? 'UEFI Puro (OK)' : 'Legacy CSM'}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    soundManager.playKeyTick();
                    setViewMode('advanced');
                    setActiveCategory('Security');
                  }}
                  className="mt-2 py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                >
                  <span>Ajustar Parámetros de Seguridad en Modo Avanzado</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

            {/* Boot Priority Drag & Drop Section with Startup Impact Analysis */}
            <BootPriorityManager
              config={config}
              onChangeOption={onChangeOption}
              biosType="modern"
            />

            {/* Bottom Callout to Advanced Mode & Stress Test */}
            <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-white text-sm block">
                  ¿Quieres comprobar si tu configuración es estable o afinar voltajes?
                </span>
                <span className="text-slate-400">
                  Prueba la estabilidad del silicio con el Test de Estrés o accede a la totalidad de parámetros en Modo Avanzado.
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    soundManager.playKeyTick();
                    if (onOpenBiosUpdate) onOpenBiosUpdate();
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-amber-200 font-bold tracking-wide shadow-lg flex items-center gap-1.5"
                  title="Utilidad de Flasheo de Firmware (F11)"
                >
                  <RefreshCw className="w-4 h-4 text-amber-400" />
                  <span>EZ Flash (F11)</span>
                </button>
                <button
                  onClick={() => {
                    soundManager.playKeyTick();
                    onOpenStressTest();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-500 hover:to-orange-400 text-white font-bold tracking-wide shadow-lg shadow-rose-950 flex items-center gap-1.5"
                >
                  <Flame className="w-4 h-4 fill-white" />
                  <span>Test de Estrés</span>
                </button>
                <button
                  onClick={() => {
                    soundManager.playKeyTick();
                    setViewMode('advanced');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold tracking-wide shadow-lg shadow-cyan-950 shrink-0"
                >
                  Modo Avanzado (F7)
                </button>
              </div>
            </div>

          </div>
        ) : (
          /* ========================================================================= */
          /* ========================== ADVANCED MODE ================================ */
          /* ========================================================================= */
          <div className="max-w-7xl mx-auto space-y-3 animate-in fade-in duration-150">
            
            {/* Top Navigation Tabs & Search */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2 flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg">
              
              {/* Category tabs */}
              <div className="flex flex-wrap items-center gap-1">
                {ADVANCED_CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat.id && !searchQuery.trim();
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        soundManager.playKeyTick();
                        setActiveCategory(cat.id);
                        setSearchQuery('');
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-950'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar ajuste (F9)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-7 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Split Content: Options Table (Left) + Right Telemetry Sidebar & Inspector */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-[500px]">
              
              {/* Options Table (Left 7 Cols) */}
              <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="border-b border-slate-800 pb-2 mb-3 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-400 uppercase tracking-wider">
                      {searchQuery ? `Resultados para "${searchQuery}"` : `Configuración de ${activeCategory}`}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Haz clic en un parámetro para inspeccionarlo
                    </span>
                  </div>

                  {activeCategory === 'Boot' && !searchQuery && (
                    <div className="mb-4">
                      <BootPriorityManager
                        config={config}
                        onChangeOption={onChangeOption}
                        biosType="modern"
                      />
                    </div>
                  )}

                  {activeCategory === 'Tool' && !searchQuery && (
                    <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          <RefreshCw className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-white">ASUS EZ Flash 3 / Q-Flash Utility</h4>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">F11</span>
                          </div>
                          <p className="text-xs text-slate-300">
                            Reprograma la memoria SPI Flash EEPROM con nuevas cápsulas de firmware (.CAP/.BIN).
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          soundManager.playKeyTick();
                          if (onOpenBiosUpdate) onOpenBiosUpdate();
                        }}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shrink-0"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Abrir EZ Flash 3 (F11)</span>
                      </button>
                    </div>
                  )}

                  <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                    {filteredOptions.length > 0 ? (
                      filteredOptions.map((opt) => {
                        const isSelected = selectedOptionId === opt.id;
                        const currentVal = config[opt.id] || opt.defaultValue;
                        const isModified = currentVal !== opt.defaultValue;

                        return (
                          <div
                            key={opt.id}
                            onClick={() => {
                              soundManager.playKeyTick();
                              setSelectedOptionId(opt.id);
                            }}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                              isSelected
                                ? 'bg-cyan-950/40 border-cyan-400 shadow-md shadow-cyan-950/30 ring-1 ring-cyan-500/50'
                                : 'bg-slate-950/50 border-slate-800 hover:bg-slate-800/60'
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-xs text-white truncate">
                                  {opt.label}
                                </span>
                                {isModified && (
                                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                                    Modificado
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                                {opt.description}
                              </p>
                            </div>

                            {/* Dropdown selector */}
                            <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                              <select
                                value={currentVal}
                                onChange={(e) => {
                                  soundManager.playValueChangeSound();
                                  setSelectedOptionId(opt.id);
                                  onChangeOption(opt.id, e.target.value);
                                }}
                                className={`bg-slate-900 border rounded-lg px-2.5 py-1.5 text-xs font-mono font-medium focus:outline-none focus:border-cyan-400 ${
                                  isModified 
                                    ? 'border-cyan-500 text-cyan-300 shadow-sm' 
                                    : 'border-slate-700 text-slate-200'
                                }`}
                              >
                                {opt.options.map((val) => (
                                  <option key={val} value={val}>
                                    {val}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-16 text-center text-slate-500 text-xs">
                        {activeCategory === 'Exit' ? (
                          <div className="space-y-4 max-w-sm mx-auto">
                            <p className="text-white font-bold text-sm">Opciones de Salida y Guardado:</p>
                            <button
                              onClick={onRequestSaveExit}
                              className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2"
                            >
                              <Save className="w-4 h-4" />
                              <span>Guardar Cambios y Reiniciar (F10)</span>
                            </button>
                            <button
                              onClick={onExitWithoutSave}
                              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
                            >
                              Descartar Cambios y Salir (ESC)
                            </button>
                            <button
                              onClick={onResetDefaults}
                              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-2"
                            >
                              <RotateCcw className="w-4 h-4" />
                              <span>Restaurar Valores de Fábrica (Optimized Defaults)</span>
                            </button>
                          </div>
                        ) : (
                          'No hay opciones para el filtro actual.'
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer hints */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Seleccionado: <strong className="text-cyan-300">{selectedOption.label}</strong></span>
                  <span>F10: Guardar • ESC: Salir</span>
                </div>
              </div>

              {/* Inspector & Hardware Monitor (Right 5 Cols) */}
              <div className="lg:col-span-5 flex flex-col gap-3">
                
                {/* Hardware Monitor Quick Readout Widget */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-cyan-400" />
                      Telemetría en Vivo (Hardware Monitor)
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.2 rounded-full font-bold ${
                      metrics.stabilityStatus === 'Estable' ? 'bg-emerald-500/20 text-emerald-400' :
                      metrics.stabilityStatus === 'Advertencia de Inestabilidad' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-rose-500/20 text-rose-400'
                    }`}>
                      {metrics.stabilityStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">CPU Temp</span>
                      <span className={`font-mono font-bold ${metrics.cpuTempLoad > 85 ? 'text-rose-400' : 'text-cyan-300'}`}>
                        {metrics.cpuTempIdle}°C
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">CPU Score</span>
                      <span className="font-mono font-bold text-indigo-300">
                        {metrics.cpuScore}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">FPS Juegos</span>
                      <span className="font-mono font-bold text-emerald-300">
                        ~{metrics.gamingFpsEstimate}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Seguridad</span>
                      <span className="font-mono font-bold text-teal-300">
                        {metrics.securityScore}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Educational Inspector Panel */}
                <div className="flex-1 min-h-[380px]">
                  <EducationalInspector
                    option={selectedOption}
                    currentValue={config[selectedOption.id]}
                  />
                </div>

              </div>

            </div>

          </div>
        )}
      </main>

      {/* Bottom Footer Shortcuts Bar */}
      <footer className="z-20 border-t border-slate-800 bg-slate-950/95 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 font-mono">
        <div className="flex flex-wrap items-center gap-3">
          <span><strong className="text-white">F1</strong>: Ayuda</span>
          <span><strong className="text-cyan-400">F6</strong>: Orden Boot</span>
          <span><strong className="text-white">F7</strong>: EZ/Advanced</span>
          <span><strong className="text-emerald-400">F8</strong>: HUD Salud</span>
          <span><strong className="text-white">F9</strong>: Buscar</span>
          <span><strong className="text-amber-400">F11</strong>: EZ Flash</span>
          <span><strong className="text-white">F10</strong>: Guardar y Reset</span>
          <span><strong className="text-white">ESC</strong>: Salir</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onResetDefaults}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-sans"
          >
            Valores por Defecto
          </button>
          <button
            onClick={onRequestSaveExit}
            className="px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] font-sans shadow-md shadow-cyan-950 flex items-center gap-1"
          >
            <Save className="w-3 h-3" />
            <span>Guardar y Reiniciar</span>
          </button>
        </div>
      </footer>

      {/* Real-time Virtual Component Health Diagnostic Overlay */}
      <DiagnosticOverlay
        isOpen={isDiagnosticOverlayOpen}
        onClose={() => setIsDiagnosticOverlayOpen(false)}
        biosType="modern"
        config={config}
      />

    </div>
  );
};
