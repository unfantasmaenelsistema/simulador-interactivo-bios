import React, { useState, useEffect } from 'react';
import { BiosType, BiosConfigState, HardwareMetrics } from '../types/bios';
import { calculateHardwareMetrics } from '../utils/benchmark';
import { soundManager } from '../utils/audio';
import { 
  Activity, 
  Cpu, 
  Layers, 
  Fan, 
  Zap, 
  Thermometer, 
  ShieldCheck, 
  AlertTriangle, 
  X, 
  Minimize2, 
  Maximize2, 
  Gauge, 
  Flame,
  Radio,
  CheckCircle2,
  HeartPulse
} from 'lucide-react';

interface DiagnosticOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  biosType: BiosType;
  config: BiosConfigState;
}

export const DiagnosticOverlay: React.FC<DiagnosticOverlayProps> = ({
  isOpen,
  onClose,
  biosType,
  config
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<'cpu' | 'ram' | 'fans' | 'power'>('cpu');
  const [tick, setTick] = useState(0);

  // Subtle real-time oscillation for live sensor authenticity
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setTick((t) => (t + 1) % 100);
    }, 1200);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const metrics: HardwareMetrics = calculateHardwareMetrics(config);

  // Calculate detailed virtual component voltages and temperatures
  const cpuRatio = config['cpu_ratio'] || 'Auto';
  const cpuVoltSetting = config['cpu_voltage'] || 'Auto';
  const fanProfile = config['fan_profile'] || 'Standard';
  const xmp = config['xmp_docp'] || 'Disabled';

  // 1. CPU Voltage calculation (VCore)
  let vcoreBase = 1.220;
  if (cpuVoltSetting.includes('Offset -0.050V')) {
    vcoreBase = 1.170;
  } else if (cpuVoltSetting.includes('Manual 1.250V')) {
    vcoreBase = 1.250;
  } else if (cpuVoltSetting.includes('Manual 1.385V')) {
    vcoreBase = 1.385;
  } else if (cpuRatio.includes('x48')) {
    vcoreBase = 1.285;
  } else if (cpuRatio.includes('x51')) {
    vcoreBase = 1.340;
  }
  // Subtle sensor jitter (±0.004V)
  const vcoreJitter = ((tick % 5) - 2) * 0.002;
  const currentVcore = Number((vcoreBase + vcoreJitter).toFixed(3));

  // 2. RAM Voltage calculation (DRAM VDD)
  let dramVoltBase = 1.200; // JEDEC standard
  let dramTemp = 36;
  if (xmp.includes('Profile 1')) {
    dramVoltBase = 1.350;
    dramTemp = 44;
  } else if (xmp.includes('Profile 2')) {
    dramVoltBase = 1.350;
    dramTemp = 41;
  }
  const dramVoltage = Number((dramVoltBase + ((tick % 3) - 1) * 0.002).toFixed(3));

  // 3. Fan RPM calculations
  let cpuFanRpmBase = 1250;
  let fanNoiseDba = 26;
  let fanAnimationSpeed = '1.8s'; // CSS animation duration

  if (fanProfile.includes('Silent')) {
    cpuFanRpmBase = 720;
    fanNoiseDba = 18;
    fanAnimationSpeed = '3s';
  } else if (fanProfile.includes('Turbo')) {
    cpuFanRpmBase = 2050;
    fanNoiseDba = 36;
    fanAnimationSpeed = '0.9s';
  } else if (fanProfile.includes('Full Speed')) {
    cpuFanRpmBase = 2850;
    fanNoiseDba = 45;
    fanAnimationSpeed = '0.45s';
  }
  const cpuFanRpm = Math.round(cpuFanRpmBase + ((tick % 7) - 3) * 15);
  const pumpRpm = Math.round(3100 + ((tick % 5) - 2) * 20);

  // 4. VRM & Motherboard temperatures
  const vrmTemp = Math.round(metrics.cpuTempIdle + (currentVcore > 1.30 ? 16 : 8));
  const tjMaxDistance = Math.max(0, 100 - metrics.cpuTempIdle);

  // Health diagnosis
  const isVcoreDangerous = currentVcore > 1.370;
  const isTempCritical = metrics.cpuTempIdle > 75 || metrics.cpuTempLoad > 90;
  const isUndervoltRisky = cpuVoltSetting.includes('Offset -0.050V') && cpuRatio.includes('x51');

  const isLegacy = biosType === 'legacy';

  return (
    <div className={`fixed z-50 transition-all duration-200 select-none ${
      isMinimized 
        ? 'bottom-4 right-4 w-72' 
        : 'bottom-4 right-4 sm:right-6 w-[94vw] sm:w-[480px] max-h-[85vh]'
    }`}>
      <div className={`rounded-2xl border shadow-2xl flex flex-col overflow-hidden backdrop-blur-md ${
        isLegacy 
          ? 'bg-[#000066]/95 border-yellow-400 text-yellow-300 font-dos' 
          : 'bg-slate-900/95 border-cyan-500/40 text-slate-100 font-sans'
      }`}>
        
        {/* Header */}
        <div className={`p-3 border-b flex items-center justify-between ${
          isLegacy 
            ? 'bg-[#0000aa] border-yellow-400 text-white' 
            : 'bg-slate-950 border-slate-800'
        }`}>
          <div className="flex items-center gap-2">
            <HeartPulse className={`w-4 h-4 ${
              isTempCritical || isVcoreDangerous ? 'text-rose-400 animate-pulse' : isLegacy ? 'text-yellow-300' : 'text-cyan-400'
            }`} />
            <div>
              <span className="font-bold text-xs tracking-wider uppercase block">
                {isLegacy ? 'MONITOR DE HARDWARE EN VIVO (HUD)' : 'DIAGNÓSTICO Y SALUD EN TIEMPO REAL'}
              </span>
              <span className={`text-[10px] ${isLegacy ? 'text-cyan-200' : 'text-slate-400'} font-mono`}>
                Sensores de CPU, Memoria, VRM y Ventiladores
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                soundManager.playKeyTick();
                setIsMinimized(!isMinimized);
              }}
              className={`p-1 rounded hover:bg-white/10 ${isLegacy ? 'text-yellow-300' : 'text-slate-400 hover:text-white'}`}
              title={isMinimized ? 'Expandir' : 'Minimizar'}
            >
              {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => {
                soundManager.playKeyTick();
                onClose();
              }}
              className={`p-1 rounded hover:bg-white/10 ${isLegacy ? 'text-yellow-300' : 'text-slate-400 hover:text-white'}`}
              title="Cerrar HUD"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Minimized Quick Pill Bar */}
        {isMinimized ? (
          <div className="p-3 flex items-center justify-between text-xs font-mono">
            <span className="flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
              <span>{metrics.cpuTempIdle}°C</span>
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentVcore}V</span>
            </span>
            <span className="flex items-center gap-1">
              <Fan className="w-3.5 h-3.5 text-emerald-400" />
              <span>{cpuFanRpm} RPM</span>
            </span>
          </div>
        ) : (
          /* ================= EXPANDED DETAILED DASHBOARD ================= */
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs">
            
            {/* Sensor Navigation Tabs */}
            <div className={`grid grid-cols-4 gap-1 p-1 rounded-xl text-center text-[11px] font-semibold ${
              isLegacy ? 'bg-blue-950 border border-yellow-400/40' : 'bg-slate-950 border border-slate-800'
            }`}>
              {[
                { id: 'cpu', label: 'CPU & VRM', icon: Cpu },
                { id: 'ram', label: 'DRAM RAM', icon: Layers },
                { id: 'fans', label: 'Ventilación', icon: Fan },
                { id: 'power', label: 'Voltajes PSU', icon: Zap }
              ].map((t) => {
                const Icon = t.icon;
                const isCur = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      soundManager.playKeyTick();
                      setActiveTab(t.id as any);
                    }}
                    className={`py-1.5 px-1 rounded-lg flex items-center justify-center gap-1 transition-all ${
                      isCur
                        ? isLegacy 
                          ? 'bg-yellow-400 text-blue-950 font-bold shadow' 
                          : 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-950'
                        : isLegacy 
                          ? 'text-yellow-300 hover:bg-blue-900' 
                          : 'text-slate-400 hover:text-white hover:bg-slate-850'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span className="hidden xs:inline">{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: CPU & VRM */}
            {activeTab === 'cpu' && (
              <div className="space-y-2.5">
                {/* Primary Gauges Grid */}
                <div className="grid grid-cols-2 gap-2">
                  
                  {/* VCore */}
                  <div className={`p-2.5 rounded-xl border ${
                    isLegacy ? 'bg-blue-950/80 border-yellow-400/60' : 'bg-slate-950/80 border-slate-800'
                  }`}>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      Voltaje CPU Core (VCore)
                    </span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className={`text-lg font-bold font-mono ${
                        isVcoreDangerous ? 'text-rose-400' : isLegacy ? 'text-white' : 'text-amber-400'
                      }`}>
                        {currentVcore} V
                      </span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                        isVcoreDangerous ? 'bg-rose-500/20 text-rose-300' :
                        currentVcore < 1.20 ? 'bg-sky-500/20 text-sky-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {isVcoreDangerous ? 'Alto' : currentVcore < 1.20 ? 'Bajo' : 'Normal'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Ajuste: {cpuVoltSetting}
                    </span>
                  </div>

                  {/* Temp */}
                  <div className={`p-2.5 rounded-xl border ${
                    isLegacy ? 'bg-blue-950/80 border-yellow-400/60' : 'bg-slate-950/80 border-slate-800'
                  }`}>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      Temp CPU (Empaquetado)
                    </span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className={`text-lg font-bold font-mono ${
                        isTempCritical ? 'text-rose-400 animate-pulse' : isLegacy ? 'text-white' : 'text-cyan-400'
                      }`}>
                        {metrics.cpuTempIdle}°C
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        (Carga: {metrics.cpuTempLoad}°C)
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Margen a TjMax: {tjMaxDistance}°C
                    </span>
                  </div>

                </div>

                {/* VRM & Package Power */}
                <div className={`p-2.5 rounded-xl border text-[11px] font-mono space-y-1.5 ${
                  isLegacy ? 'bg-blue-950/50 border-yellow-400/40' : 'bg-slate-950/60 border-slate-800'
                }`}>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Frecuencia Todos los Núcleos:</span>
                    <span className="font-bold text-white">
                      {cpuRatio.includes('x51') ? '5.10 GHz' : cpuRatio.includes('x48') ? '4.80 GHz' : cpuRatio.includes('x45') ? '4.50 GHz' : '4.20 GHz'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Consumo CPU Package Power:</span>
                    <span className="text-amber-300 font-bold">{metrics.idleWatts} W (Reposo) / {metrics.loadWatts} W (Carga)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Temperatura Fases VRM Placa:</span>
                    <span className={vrmTemp > 80 ? 'text-rose-400' : 'text-slate-300'}>{vrmTemp}°C (Mosfets 16+1)</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: DRAM MEMORY */}
            {activeTab === 'ram' && (
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  
                  {/* DRAM Voltage */}
                  <div className={`p-2.5 rounded-xl border ${
                    isLegacy ? 'bg-blue-950/80 border-yellow-400/60' : 'bg-slate-950/80 border-slate-800'
                  }`}>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      Voltaje DRAM (VDD)
                    </span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className={`text-lg font-bold font-mono ${isLegacy ? 'text-white' : 'text-violet-400'}`}>
                        {dramVoltage} V
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {xmp.includes('Profile') ? 'XMP 1.35V' : 'JEDEC 1.20V'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Slots A2 & B2 (Dual-Channel)
                    </span>
                  </div>

                  {/* DRAM Temp */}
                  <div className={`p-2.5 rounded-xl border ${
                    isLegacy ? 'bg-blue-950/80 border-yellow-400/60' : 'bg-slate-950/80 border-slate-800'
                  }`}>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      Temperatura Módulos RAM
                    </span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className={`text-lg font-bold font-mono ${isLegacy ? 'text-white' : 'text-cyan-400'}`}>
                        {dramTemp}°C
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        Seguro ✓
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Disipador de aluminio
                    </span>
                  </div>

                </div>

                <div className={`p-2.5 rounded-xl border text-[11px] font-mono space-y-1.5 ${
                  isLegacy ? 'bg-blue-950/50 border-yellow-400/40' : 'bg-slate-950/60 border-slate-800'
                }`}>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Velocidad Efectiva:</span>
                    <span className="font-bold text-violet-300">{metrics.ramSpeedMHz} MHz</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Latencia Acceso a Memoria:</span>
                    <span className="text-white font-bold">{metrics.ramLatencyNs} ns</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ancho de Banda Teórico:</span>
                    <span className="text-emerald-300">{metrics.ramBandwidthGBs} GB/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Estado Perfil XMP / DOCP:</span>
                    <span className={xmp.includes('Profile') ? 'text-emerald-400' : 'text-slate-400'}>
                      {xmp.includes('Profile') ? 'Habilitado (Overclock Fábrica)' : 'Desactivado (JEDEC Estándar)'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: FANS & COOLING */}
            {activeTab === 'fans' && (
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  
                  {/* CPU Fan RPM */}
                  <div className={`p-2.5 rounded-xl border ${
                    isLegacy ? 'bg-blue-950/80 border-yellow-400/60' : 'bg-slate-950/80 border-slate-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                        CPU_FAN (Disipador)
                      </span>
                      <Fan 
                        className="w-4 h-4 text-cyan-400 animate-spin" 
                        style={{ animationDuration: fanAnimationSpeed }}
                      />
                    </div>
                    <span className={`text-lg font-bold font-mono mt-1 block ${isLegacy ? 'text-white' : 'text-cyan-400'}`}>
                      {cpuFanRpm} RPM
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Perfil: {fanProfile.split(' ')[0]}
                    </span>
                  </div>

                  {/* AIO Pump */}
                  <div className={`p-2.5 rounded-xl border ${
                    isLegacy ? 'bg-blue-950/80 border-yellow-400/60' : 'bg-slate-950/80 border-slate-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                        AIO_PUMP (Bomba Líquida)
                      </span>
                      <Activity className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className={`text-lg font-bold font-mono mt-1 block ${isLegacy ? 'text-white' : 'text-emerald-400'}`}>
                      {pumpRpm} RPM
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Flujo: 2.6 Litros/min
                    </span>
                  </div>

                </div>

                <div className={`p-2.5 rounded-xl border text-[11px] font-mono space-y-1.5 ${
                  isLegacy ? 'bg-blue-950/50 border-yellow-400/40' : 'bg-slate-950/60 border-slate-800'
                }`}>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Nivel de Ruido Acústico Estimado:</span>
                    <span className={fanNoiseDba > 40 ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                      ~{fanNoiseDba} dBA {fanNoiseDba < 22 ? '(Silencioso)' : fanNoiseDba > 40 ? '(Turbina Ruidosa)' : '(Moderado)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ventilador Chasis CHA_FAN1:</span>
                    <span className="text-slate-300">950 RPM (PWM 45%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ventilador Chasis CHA_FAN2:</span>
                    <span className="text-slate-300">920 RPM (PWM 45%)</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: PSU DC RAILS */}
            {activeTab === 'power' && (
              <div className="space-y-2.5">
                <div className={`p-3 rounded-xl border space-y-2 ${
                  isLegacy ? 'bg-blue-950/80 border-yellow-400/60' : 'bg-slate-950/80 border-slate-800'
                }`}>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Líneas de Tensión de la Fuente de Alimentación (ATX 12V Spec)
                  </span>

                  <div className="space-y-1.5 font-mono text-xs">
                    {/* +12V Rail */}
                    <div className="flex items-center justify-between p-1.5 rounded-lg bg-black/40">
                      <span className="text-slate-300">+12V Rail (GPU & CPU):</span>
                      <span className="text-emerald-400 font-bold">
                        {(12.096 + ((tick % 4) - 2) * 0.012).toFixed(3)} V <span className="text-[10px] text-slate-500">(±1.2%)</span>
                      </span>
                    </div>

                    {/* +5V Rail */}
                    <div className="flex items-center justify-between p-1.5 rounded-lg bg-black/40">
                      <span className="text-slate-300">+5V Rail (Discos & USB):</span>
                      <span className="text-emerald-400 font-bold">
                        {(5.040 + ((tick % 3) - 1) * 0.005).toFixed(3)} V <span className="text-[10px] text-slate-500">(±0.8%)</span>
                      </span>
                    </div>

                    {/* +3.3V Rail */}
                    <div className="flex items-center justify-between p-1.5 rounded-lg bg-black/40">
                      <span className="text-slate-300">+3.3V Rail (Chipset PCH):</span>
                      <span className="text-emerald-400 font-bold">
                        {(3.328 + ((tick % 3) - 1) * 0.003).toFixed(3)} V <span className="text-[10px] text-slate-500">(±0.6%)</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className={`p-2.5 rounded-xl border text-[11px] font-mono flex items-center justify-between ${
                  isLegacy ? 'bg-blue-950/50 border-yellow-400/40 text-yellow-300' : 'bg-slate-950/60 border-slate-800 text-slate-300'
                }`}>
                  <span>Tolerancia de Rizado ATX:</span>
                  <span className="text-emerald-400 font-bold">Excelente (Dentro de tolerancia ±5%)</span>
                </div>
              </div>
            )}

            {/* Real-time Health Verdict Banner */}
            <div className={`p-2.5 rounded-xl border flex items-start gap-2.5 text-xs ${
              isVcoreDangerous || isTempCritical || isUndervoltRisky
                ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                : metrics.stabilityStatus === 'Advertencia de Inestabilidad'
                ? 'bg-amber-950/30 border-amber-500/50 text-amber-200'
                : isLegacy 
                ? 'bg-blue-900/60 border-yellow-400/50 text-yellow-200'
                : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
            }`}>
              {isVcoreDangerous || isTempCritical || isUndervoltRisky ? (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-bold block text-[11px] uppercase tracking-wide">
                  {isVcoreDangerous ? '¡AVISO DE VOLTAJE VCORE EXCESIVO!' :
                   isTempCritical ? '¡AVISO DE TEMPERATURA CRÍTICA!' :
                   isUndervoltRisky ? '¡RIESGO DE SUBVOLTAJE Y BSOD!' :
                   'ESTADO DE SALUD DEL HARDWARE: ÓPTIMO'}
                </span>
                <p className="text-[11px] leading-snug mt-0.5">
                  {isVcoreDangerous
                    ? `El voltaje VCore (${currentVcore}V) supera 1.35V. Riesgo de degradación de transistores.`
                    : isTempCritical
                    ? `Temperatura elevada (${metrics.cpuTempIdle}°C en reposo). Se recomienda aumentar la curva de ventilación.`
                    : isUndervoltRisky
                    ? 'Multiplicador x51 con Offset negativo causará congelamientos bajo carga pesada.'
                    : `Componentes estables. Relación voltaje-frecuencia segura a ${currentVcore}V.`}
                </p>
              </div>
            </div>

          </div>
        )}

        {/* Footer with Hint */}
        <div className={`px-3 py-1.5 border-t text-[10px] flex items-center justify-between ${
          isLegacy 
            ? 'bg-[#0000aa] border-yellow-400 text-yellow-300' 
            : 'bg-slate-950 border-slate-800 text-slate-500'
        }`}>
          <a
            href="https://www.unfantasmaenelsistema.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline flex items-center gap-1 text-cyan-300 font-mono"
          >
            <span>unfantasmaenelsistema.com</span>
          </a>
          <span className="font-mono">Tecla F8: Alternar HUD</span>
        </div>

      </div>
    </div>
  );
};
