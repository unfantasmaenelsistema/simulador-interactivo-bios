import React, { useState, useEffect, useRef } from 'react';
import { BiosConfigState, StressTestMode, StressTestStatus, StressTestLogEntry } from '../types/bios';
import { evaluateBiosStressCapability } from '../utils/stressTestSimulator';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Flame, 
  Cpu, 
  Zap, 
  Thermometer, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Play, 
  RotateCcw, 
  Activity, 
  Terminal, 
  Sparkles, 
  ShieldAlert, 
  ArrowRight,
  SlidersHorizontal,
  Gauge
} from 'lucide-react';

interface StressTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: BiosConfigState;
  onAdjustBiosOption?: (category: string) => void;
}

export const StressTestModal: React.FC<StressTestModalProps> = ({
  isOpen,
  onClose,
  config,
  onAdjustBiosOption
}) => {
  const [selectedMode, setSelectedMode] = useState<StressTestMode>('cpu_heavy');
  const [testStatus, setTestStatus] = useState<StressTestStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [currentTemp, setCurrentTemp] = useState(38);
  const [currentWatts, setCurrentWatts] = useState(45);
  const [currentClock, setCurrentClock] = useState(4.2);
  const [logs, setLogs] = useState<StressTestLogEntry[]>([]);
  const [showBsodScreen, setShowBsodScreen] = useState(false);

  const logsEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const evaluation = evaluateBiosStressCapability(config, selectedMode);

  const addLog = (message: string, type: 'info' | 'warn' | 'error' | 'success' = 'info') => {
    const now = new Date();
    const timeStr = `${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(Math.floor(now.getMilliseconds() / 100))}`;
    setLogs((prev) => [...prev, { timestamp: timeStr, type, message }]);
  };

  const handleStartTest = () => {
    soundManager.playKeyTick();
    setTestStatus('running');
    setProgress(0);
    setShowBsodScreen(false);
    setLogs([]);

    // Initialize telemetry
    setCurrentTemp(38);
    setCurrentWatts(55);
    setCurrentClock(evaluation.diagnostics.effectiveClockGHz);

    addLog(`Iniciando prueba de estrés: [${
      selectedMode === 'cpu_heavy' ? 'CPU AVX2 / Small FFTs' :
      selectedMode === 'ram_memtest' ? 'Integridad DRAM & Latencias' : 'Carga Integral de Sistema'
    }]`, 'info');
    addLog(`Configuración activa: Multiplicador ${config['cpu_ratio'] || 'Stock'} | VCore ${config['cpu_voltage'] || 'Auto'} | Fan ${config['fan_profile'] || 'Standard'}`, 'info');
    addLog('Asignando 16 hilos de cómputo en todos los núcleos de CPU...', 'info');

    let currentProgress = 0;
    const intervalTime = 120; // total test duration ~12 seconds
    const targetCrash = evaluation.willCrash ? evaluation.crashAtProgress : 100;

    timerRef.current = setInterval(() => {
      currentProgress += 1;
      setProgress(currentProgress);

      // Simulate rising temperature and watts towards target under load
      const progressFraction = Math.min(1, currentProgress / 100);
      const targetLoadTemp = evaluation.diagnostics.maxTempReached;
      const targetLoadWatts = evaluation.diagnostics.maxWattsReached;

      setCurrentTemp(Math.round(38 + (targetLoadTemp - 38) * progressFraction));
      setCurrentWatts(Math.round(55 + (targetLoadWatts - 55) * progressFraction));

      // Phase logs
      if (currentProgress === 15) {
        addLog('Fase 1 completada: Memoria reservada y vectores SIMD cargados en registros L1/L2.', 'info');
      } else if (currentProgress === 30) {
        addLog(`Calentando empaquetado térmico. Temperatura actual: ${Math.round(38 + (targetLoadTemp - 38) * 0.3)}°C. VRM estable.`, 'info');
      } else if (currentProgress === 50) {
        addLog('Fase 2: Ejecutando iteraciones de transformadas rápidas de Fourier (FFT)...', 'info');
      } else if (currentProgress === 75) {
        addLog('Fase 3: Verificación de paridad y cálculo de punto flotante en punto álgido.', 'info');
      }

      // Check if crash threshold reached
      if (evaluation.willCrash && currentProgress >= targetCrash) {
        if (timerRef.current) clearInterval(timerRef.current);
        soundManager.playCrashBuzz();
        setTestStatus(evaluation.diagnostics.status);

        addLog(`[ERROR CRÍTICO]: ${evaluation.diagnostics.failureReason}`, 'error');
        addLog(`Código de Parada de Hardware: ${evaluation.diagnostics.failureCode}`, 'error');
        addLog('¡EL SISTEMA HA COLAPSADO! Generando volcado de memoria minidump...', 'error');

        // Show BSOD after short dramatic delay
        setTimeout(() => {
          setShowBsodScreen(true);
        }, 600);
        return;
      }

      // Completed 100% successfully
      if (currentProgress >= 100) {
        if (timerRef.current) clearInterval(timerRef.current);

        if (evaluation.diagnostics.status === 'throttled') {
          soundManager.playWarningBeep();
          setTestStatus('throttled');
          addLog('AVISO: Estrangulamiento térmico activado. La CPU redujo reloj para evitar apagarse.', 'warn');
          addLog(`Frecuencia de reloj bajó a ${evaluation.diagnostics.effectiveClockGHz} GHz.`, 'warn');
        } else {
          soundManager.playPostSuccessBeep();
          setTestStatus('passed');
          addLog('¡TEST COMPLETADO CON ÉXITO! Cero errores de hardware detectados.', 'success');
          addLog(`Puntuación de estabilidad: 100% estable a ${evaluation.diagnostics.maxTempReached}°C máximos.`, 'success');
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        }
      }
    }, intervalTime);
  };

  const handleStopTest = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    soundManager.playKeyTick();
    setTestStatus('idle');
    setProgress(0);
    addLog('Prueba de estrés abortada manualmente por el usuario.', 'warn');
  };

  const handleResetTest = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    soundManager.playKeyTick();
    setTestStatus('idle');
    setProgress(0);
    setShowBsodScreen(false);
    setLogs([]);
    setCurrentTemp(38);
    setCurrentWatts(45);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 text-slate-100 font-sans">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-rose-500/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* ================= SIMULATED WINDOWS BSOD OVERLAY ================= */}
        {showBsodScreen && (
          <div className="absolute inset-0 z-50 bg-[#0078d7] text-white p-6 sm:p-12 flex flex-col justify-between select-none animate-in fade-in duration-100 font-sans">
            <div className="max-w-3xl space-y-6">
              <div className="text-6xl sm:text-8xl font-light">:(</div>
              <h2 className="text-2xl sm:text-3xl font-medium leading-snug">
                Se ha producido un problema en tu equipo y necesita reiniciarse.
              </h2>
              <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
                El sistema operativo ha detectado una excepción crítica en el hardware provocada por la inestabilidad de los ajustes de la BIOS.
              </p>

              {/* Error Details */}
              <div className="bg-black/25 border border-white/20 rounded-xl p-4 font-mono text-xs sm:text-sm space-y-1">
                <div>Código para el técnico: <strong className="text-yellow-300">{evaluation.diagnostics.failureCode}</strong></div>
                <div>Causa registrada: <span className="text-white">{evaluation.diagnostics.failureReason}</span></div>
              </div>

              {/* Pedagogical Explanation */}
              <div className="bg-white/10 rounded-xl p-4 text-xs leading-relaxed text-blue-50 space-y-1.5">
                <div className="font-bold text-white text-sm">💡 Diagnóstico Pedagógico de Hardware:</div>
                <p>{evaluation.diagnostics.technicalDiagnosis}</p>
                <div className="font-bold text-yellow-300 pt-1">
                  Solución sugerida en BIOS: {evaluation.diagnostics.suggestedFix}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/20">
              <button
                onClick={() => {
                  soundManager.playKeyTick();
                  setShowBsodScreen(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-white text-[#0078d7] font-bold text-xs sm:text-sm hover:bg-blue-50 transition-colors shadow-lg"
              >
                Volver a la Consola de Diagnóstico
              </button>
              <button
                onClick={() => {
                  soundManager.playKeyTick();
                  onClose();
                  if (onAdjustBiosOption) onAdjustBiosOption('Ai_Tweaker');
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-900/80 hover:bg-blue-900 text-white font-bold text-xs sm:text-sm border border-white/40 transition-colors flex items-center gap-2"
              >
                <span>Ajustar Parámetros en la BIOS</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a
              href="https://www.unfantasmaenelsistema.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-cyan-500/60 transition-all shrink-0"
              title="Un Fantasma en el Sistema"
            >
              <img src="/icono.png" alt="Logo" className="w-8 h-8 object-contain" />
            </a>
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold font-uefi tracking-wide text-white flex items-center gap-2">
                  Test de Estrés y Estabilidad de Hardware
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">
                    Stress Tester
                  </span>
                </h2>
                <a
                  href="https://www.unfantasmaenelsistema.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden md:inline text-[11px] font-mono text-cyan-400 hover:underline"
                >
                  unfantasmaenelsistema.com
                </a>
              </div>
              <p className="text-xs text-slate-400">
                Somete tu procesador, memoria RAM y voltajes al 100% de carga continua para comprobar si tus cambios en la BIOS son estables o causan cuelgues.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playKeyTick();
              if (timerRef.current) clearInterval(timerRef.current);
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* Top Controls: Mode Selection & Quick BIOS Snapshot */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            
            {/* Mode selection buttons (7 cols) */}
            <div className="md:col-span-7 bg-slate-950/70 border border-slate-800 rounded-xl p-3">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Tipo de Prueba de Estrés:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'cpu_heavy', label: 'CPU AVX2', desc: 'Prime95 / Small FFTs' },
                  { id: 'ram_memtest', label: 'Memoria RAM', desc: 'MemTest86 / Timings' },
                  { id: 'full_system', label: 'Sistema Completo', desc: 'CPU + VRM + RAM' }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    disabled={testStatus === 'running'}
                    onClick={() => {
                      soundManager.playKeyTick();
                      setSelectedMode(mode.id as StressTestMode);
                    }}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      selectedMode === mode.id
                        ? 'bg-rose-950/40 border-rose-500 text-white shadow-md shadow-rose-950/50'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                    } ${testStatus === 'running' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className="font-bold text-xs block">{mode.label}</span>
                    <span className="text-[10px] text-slate-400 block truncate">{mode.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Active BIOS Config Snapshot (5 cols) */}
            <div className="md:col-span-5 bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col justify-between text-xs">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Parámetros BIOS Bajo Prueba:
                </span>
                <div className="space-y-1 font-mono text-[11px] text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Multiplicador:</span>
                    <span className="text-cyan-300 font-bold">{config['cpu_ratio'] || 'Stock (Auto)'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Voltaje VCore:</span>
                    <span className="text-amber-300 font-bold">{config['cpu_voltage'] || 'Auto'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ventilación:</span>
                    <span className="text-emerald-300">{config['fan_profile']?.split(' ')[0] || 'Standard'}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Telemetry Dials & Live Gauges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            {/* Temp Gauge */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Temp Núcleo CPU
                </span>
                <span className={`text-xl font-bold font-mono ${
                  currentTemp >= 95 ? 'text-rose-400 animate-pulse' :
                  currentTemp >= 82 ? 'text-amber-400' : 'text-cyan-400'
                }`}>
                  {currentTemp}°C
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {currentTemp >= 95 ? 'Límite Crítico TjMax' : currentTemp >= 82 ? 'Caliente' : 'Seguro'}
                </span>
              </div>
              <Thermometer className={`w-6 h-6 ${
                currentTemp >= 95 ? 'text-rose-400' : currentTemp >= 82 ? 'text-amber-400' : 'text-cyan-400'
              }`} />
            </div>

            {/* Power Meter */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Consumo Paquete
                </span>
                <span className="text-xl font-bold font-mono text-amber-400">
                  {currentWatts} W
                </span>
                <span className="text-[10px] text-slate-500 block">TDP Estimado</span>
              </div>
              <Zap className="w-6 h-6 text-amber-400" />
            </div>

            {/* Clock Speed */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Frecuencia CPU
                </span>
                <span className="text-xl font-bold font-mono text-indigo-400">
                  {currentClock} GHz
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {testStatus === 'throttled' ? 'Throttling Activo' : 'All-Core Clocks'}
                </span>
              </div>
              <Cpu className="w-6 h-6 text-indigo-400" />
            </div>

            {/* Stability Index */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Estado de Prueba
                </span>
                <span className={`text-sm font-bold font-mono uppercase ${
                  testStatus === 'passed' ? 'text-emerald-400' :
                  testStatus === 'crashed_bsod' || testStatus === 'crashed_thermal' ? 'text-rose-400' :
                  testStatus === 'throttled' ? 'text-amber-400' :
                  testStatus === 'running' ? 'text-cyan-400 animate-pulse' : 'text-slate-400'
                }`}>
                  {testStatus === 'idle' ? 'En Espera' :
                   testStatus === 'running' ? 'Ejecutando...' :
                   testStatus === 'passed' ? 'Estable ✓' :
                   testStatus === 'throttled' ? 'Estrangulado' : 'Colapso / Fallo'}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {testStatus === 'running' ? `${progress}% Completado` : '16 Hilos AVX2'}
                </span>
              </div>
              <Activity className="w-6 h-6 text-emerald-400" />
            </div>

          </div>

          {/* ================= ANIMATED PROGRESS BAR ================= */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-rose-400" />
                <span>Progreso de la Prueba de Estrés:</span>
              </span>
              <span className="font-mono font-bold text-sm text-cyan-300">
                {progress}%
              </span>
            </div>

            {/* Outer Bar */}
            <div className="w-full h-4 bg-slate-900 border border-slate-700 rounded-full overflow-hidden p-0.5 relative">
              <div
                className={`h-full rounded-full transition-all duration-150 relative ${
                  testStatus === 'crashed_bsod' || testStatus === 'crashed_thermal'
                    ? 'bg-rose-600'
                    : testStatus === 'throttled'
                    ? 'bg-amber-500'
                    : testStatus === 'passed'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : 'bg-gradient-to-r from-cyan-500 via-indigo-500 to-rose-500'
                }`}
                style={{ width: `${progress}%` }}
              >
                {testStatus === 'running' && (
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                )}
              </div>
            </div>

            {/* Current Phase Description */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
              <span>
                {progress < 25 ? 'Fase 1: Asignación de memoria y preparación de subprocesos' :
                 progress < 50 ? 'Fase 2: Estrés de punto flotante AVX2 y temperatura ascendente' :
                 progress < 75 ? 'Fase 3: Cálculos de matrices pesadas y comprobación de Vdroop' :
                 progress < 100 ? 'Fase 4: Máxima disipación sostenida y validación de paridad' :
                 'Fase 5: Validación completa y certificación'}
              </span>
              <span className="font-mono text-slate-500">
                {testStatus === 'running' ? '100% Carga Activa' : 'Parado'}
              </span>
            </div>
          </div>

          {/* Diagnostic Console Terminal */}
          <div className="bg-black/90 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-300 space-y-1">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-1.5 text-slate-500 text-[11px]">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>Consola de Diagnóstico de Hardware (Event Log)</span>
              </span>
              <span>Buffer: {logs.length} eventos</span>
            </div>

            <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
              {logs.length > 0 ? (
                logs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-slate-500 text-[10px] shrink-0 font-mono">[{log.timestamp}]</span>
                    <span className={`text-[11px] ${
                      log.type === 'error' ? 'text-rose-400 font-bold' :
                      log.type === 'warn' ? 'text-amber-300 font-semibold' :
                      log.type === 'success' ? 'text-emerald-300 font-bold' :
                      'text-slate-300'
                    }`}>
                      {log.message}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-slate-600 text-xs">
                  Pulsa "Iniciar Test de Estrés" para ejecutar la simulación de carga continua.
                </div>
              )}
              <div ref={logsEndRef} />
            </div>
          </div>

          {/* Failure Alert Banner if crashed */}
          {(testStatus === 'crashed_bsod' || testStatus === 'crashed_thermal') && (
            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-white text-sm block">
                    ¡Fallo Detectado! El equipo ha colapsado: {evaluation.diagnostics.failureCode}
                  </span>
                  <p className="text-rose-200 text-xs mt-0.5">
                    {evaluation.diagnostics.failureReason}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowBsodScreen(true)}
                className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shrink-0 transition-colors"
              >
                Ver Pantalla Azul (BSOD) y Diagnóstico
              </button>
            </div>
          )}

          {/* Success Banner if passed */}
          {testStatus === 'passed' && (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/50 flex items-center justify-between gap-3 text-xs text-emerald-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-white text-sm block">
                    ¡Certificado de Estabilidad Obtenido!
                  </span>
                  <p className="text-emerald-300 text-xs mt-0.5">
                    {evaluation.diagnostics.technicalDiagnosis}
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetTest}
              disabled={testStatus === 'running'}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reiniciar Valores</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {testStatus === 'running' ? (
              <button
                onClick={handleStopTest}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-lg shadow-rose-950"
              >
                <span>Detener Prueba</span>
              </button>
            ) : (
              <button
                onClick={handleStartTest}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-500 hover:to-orange-400 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-rose-950 flex items-center gap-2 transform hover:scale-[1.01]"
              >
                <Flame className="w-4 h-4 fill-white" />
                <span>Iniciar Test de Estrés (100% Carga)</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
