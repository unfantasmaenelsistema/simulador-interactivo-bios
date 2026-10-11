import React, { useState } from 'react';
import { BiosProfile, BiosConfigState, HardwareMetrics } from '../types/bios';
import { BIOS_OPTIONS } from '../data/biosOptions';
import { PRESET_PROFILES } from '../data/presetProfiles';
import { calculateHardwareMetrics } from '../utils/benchmark';
import { soundManager } from '../utils/audio';
import { 
  GitCompare, 
  Save, 
  Download, 
  Upload, 
  Cpu, 
  Zap, 
  Thermometer, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Check, 
  Trash2, 
  Play,
  Layers,
  ArrowRight,
  Flame
} from 'lucide-react';

interface ProfileComparatorProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: BiosConfigState;
  onApplyProfile: (profile: BiosProfile) => void;
  customProfiles: BiosProfile[];
  onSaveNewProfile: (profile: BiosProfile) => void;
  onDeleteProfile?: (profileId: string) => void;
  onOpenStressTest?: () => void;
}

export const ProfileComparator: React.FC<ProfileComparatorProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onApplyProfile,
  customProfiles,
  onSaveNewProfile,
  onDeleteProfile,
  onOpenStressTest
}) => {
  const [profileAId, setProfileAId] = useState<string>('current');
  const [profileBId, setProfileBId] = useState<string>('preset-defaults');
  const [activeTab, setActiveTab] = useState<'compare' | 'save' | 'manage'>('compare');

  // Form state for saving new profile
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileDesc, setNewProfileDesc] = useState('');
  const [authorName, setAuthorName] = useState('Estudiante');

  if (!isOpen) return null;

  // Build full profiles list
  const currentProfilePlaceholder: BiosProfile = {
    id: 'current',
    name: '⚡ Configuración Actual en BIOS',
    description: 'Parámetros actualmente configurados y activos en este simulador.',
    biosType: 'modern',
    createdAt: new Date().toISOString().split('T')[0],
    author: 'Usuario Activo',
    config: currentConfig
  };

  const allAvailableProfiles: BiosProfile[] = [
    currentProfilePlaceholder,
    ...PRESET_PROFILES,
    ...customProfiles
  ];

  const profileA = allAvailableProfiles.find((p) => p.id === profileAId) || currentProfilePlaceholder;
  const profileB = allAvailableProfiles.find((p) => p.id === profileBId) || PRESET_PROFILES[0];

  const metricsA: HardwareMetrics = calculateHardwareMetrics(profileA.config);
  const metricsB: HardwareMetrics = calculateHardwareMetrics(profileB.config);

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;

    const newProfile: BiosProfile = {
      id: `custom-${Date.now()}`,
      name: newProfileName.trim(),
      description: newProfileDesc.trim() || 'Perfil personalizado de rendimiento',
      biosType: 'modern',
      createdAt: new Date().toISOString().split('T')[0],
      author: authorName.trim() || 'Estudiante',
      config: { ...currentConfig }
    };

    soundManager.playValueChangeSound();
    onSaveNewProfile(newProfile);
    setNewProfileName('');
    setNewProfileDesc('');
    setProfileBId(newProfile.id);
    setActiveTab('compare');
  };

  // Export profiles as JSON
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify([...PRESET_PROFILES, ...customProfiles], null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'bios-perfiles-configuracion.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 text-slate-100 font-sans">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
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
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <GitCompare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold font-uefi tracking-wide text-white flex items-center gap-2">
                  Comparador de Perfiles y Rendimiento de Hardware
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                    Benchmarking
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
                Compara métricas de CPU, latencias de memoria, temperaturas, tiempos de arranque y parámetros BIOS entre dos configuraciones.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playKeyTick();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 py-2.5 bg-slate-950/70 border-b border-slate-800 flex items-center gap-2">
          <button
            onClick={() => {
              soundManager.playKeyTick();
              setActiveTab('compare');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'compare'
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-950 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Comparativa Frente a Frente</span>
          </button>

          <button
            onClick={() => {
              soundManager.playKeyTick();
              setActiveTab('save');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'save'
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-950 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>Guardar Perfil Actual</span>
          </button>

          <button
            onClick={() => {
              soundManager.playKeyTick();
              setActiveTab('manage');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'manage'
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-950 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Biblioteca de Perfiles ({allAvailableProfiles.length})</span>
          </button>
        </div>

        {/* Tab 1: Compare View */}
        {activeTab === 'compare' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
            
            {/* Selectors Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
              
              {/* Profile A Selector */}
              <div>
                <label className="text-xs font-semibold text-cyan-400 mb-1.5 block">
                  Perfil A (Base de Comparación):
                </label>
                <select
                  value={profileAId}
                  onChange={(e) => {
                    soundManager.playKeyTick();
                    setProfileAId(e.target.value);
                  }}
                  className="w-full bg-slate-900 border border-cyan-500/40 rounded-lg px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-cyan-400"
                >
                  {allAvailableProfiles.map((p) => (
                    <option key={`a-${p.id}`} value={p.id}>
                      {p.name} {p.isPreset ? '(Predefinido)' : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                  {profileA.description}
                </p>
              </div>

              {/* Profile B Selector */}
              <div>
                <label className="text-xs font-semibold text-indigo-400 mb-1.5 block">
                  Perfil B (Contra quién comparar):
                </label>
                <select
                  value={profileBId}
                  onChange={(e) => {
                    soundManager.playKeyTick();
                    setProfileBId(e.target.value);
                  }}
                  className="w-full bg-slate-900 border border-indigo-500/40 rounded-lg px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-indigo-400"
                >
                  {allAvailableProfiles.map((p) => (
                    <option key={`b-${p.id}`} value={p.id}>
                      {p.name} {p.isPreset ? '(Predefinido)' : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                  {profileB.description}
                </p>
              </div>
            </div>

            {/* Metrics Delta Cards */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Resultados de Rendimiento y Telemetría Simulada
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                
                {/* CPU Multi */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
                    <Cpu className="w-3.5 h-3.5 text-cyan-400" /> CPU Multi-Core
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-bold font-mono text-cyan-300">{metricsA.cpuMultiScore} pts</span>
                    <span className="text-xs text-slate-500">vs</span>
                    <span className="text-sm font-bold font-mono text-indigo-300">{metricsB.cpuMultiScore} pts</span>
                  </div>
                  <div className="mt-1 text-[11px] font-mono">
                    {metricsA.cpuMultiScore > metricsB.cpuMultiScore ? (
                      <span className="text-emerald-400">+{metricsA.cpuMultiScore - metricsB.cpuMultiScore} pts en A</span>
                    ) : metricsA.cpuMultiScore < metricsB.cpuMultiScore ? (
                      <span className="text-indigo-400">+{metricsB.cpuMultiScore - metricsA.cpuMultiScore} pts en B</span>
                    ) : (
                      <span className="text-slate-500">Idéntico</span>
                    )}
                  </div>
                </div>

                {/* RAM Speed & Latency */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
                    <Layers className="w-3.5 h-3.5 text-violet-400" /> Latencia de RAM
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-bold font-mono text-cyan-300">{metricsA.ramLatencyNs} ns</span>
                    <span className="text-xs text-slate-500">vs</span>
                    <span className="text-sm font-bold font-mono text-indigo-300">{metricsB.ramLatencyNs} ns</span>
                  </div>
                  <div className="mt-1 text-[11px] font-mono">
                    {metricsA.ramLatencyNs < metricsB.ramLatencyNs ? (
                      <span className="text-emerald-400">A es {(metricsB.ramLatencyNs - metricsA.ramLatencyNs).toFixed(1)}ns más rápida</span>
                    ) : metricsA.ramLatencyNs > metricsB.ramLatencyNs ? (
                      <span className="text-indigo-400">B es {(metricsA.ramLatencyNs - metricsB.ramLatencyNs).toFixed(1)}ns más rápida</span>
                    ) : (
                      <span className="text-slate-500">Idéntico</span>
                    )}
                  </div>
                </div>

                {/* Boot Time */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
                    <Clock className="w-3.5 h-3.5 text-teal-400" /> Tiempo de Arranque
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-bold font-mono text-cyan-300">{metricsA.bootTimeSeconds} s</span>
                    <span className="text-xs text-slate-500">vs</span>
                    <span className="text-sm font-bold font-mono text-indigo-300">{metricsB.bootTimeSeconds} s</span>
                  </div>
                  <div className="mt-1 text-[11px] font-mono">
                    {metricsA.bootTimeSeconds < metricsB.bootTimeSeconds ? (
                      <span className="text-emerald-400">A arranca {(metricsB.bootTimeSeconds - metricsA.bootTimeSeconds).toFixed(1)}s antes</span>
                    ) : metricsA.bootTimeSeconds > metricsB.bootTimeSeconds ? (
                      <span className="text-indigo-400">B arranca {(metricsA.bootTimeSeconds - metricsB.bootTimeSeconds).toFixed(1)}s antes</span>
                    ) : (
                      <span className="text-slate-500">Idéntico</span>
                    )}
                  </div>
                </div>

                {/* Temps & Watts */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
                    <Thermometer className="w-3.5 h-3.5 text-rose-400" /> Temp CPU en Carga
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className={`text-sm font-bold font-mono ${metricsA.cpuTempLoad > 85 ? 'text-rose-400' : 'text-cyan-300'}`}>
                      {metricsA.cpuTempLoad} °C
                    </span>
                    <span className="text-xs text-slate-500">vs</span>
                    <span className={`text-sm font-bold font-mono ${metricsB.cpuTempLoad > 85 ? 'text-rose-400' : 'text-indigo-300'}`}>
                      {metricsB.cpuTempLoad} °C
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] font-mono text-slate-400">
                    Carga: {metricsA.loadWatts}W vs {metricsB.loadWatts}W
                  </div>
                </div>

              </div>

              {/* Security & OS Compatibility Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Nivel de Seguridad Criptográfica:</span>
                  </div>
                  <div className="flex items-center gap-4 font-mono font-bold">
                    <span className="text-cyan-400">Perfil A: {metricsA.securityScore}%</span>
                    <span className="text-indigo-400">Perfil B: {metricsB.securityScore}%</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-sky-400" />
                    <span>Apto para Windows 11:</span>
                  </div>
                  <div className="flex items-center gap-4 font-mono font-bold">
                    <span className={metricsA.win11Ready ? 'text-emerald-400' : 'text-rose-400'}>
                      A: {metricsA.win11Ready ? 'SÍ (Cumple)' : 'NO (Falta TPM/UEFI)'}
                    </span>
                    <span className={metricsB.win11Ready ? 'text-emerald-400' : 'text-rose-400'}>
                      B: {metricsB.win11Ready ? 'SÍ (Cumple)' : 'NO (Falta TPM/UEFI)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Parameter Differences Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Comparación Detallada de Parámetros de BIOS
                </h3>
                <span className="text-[11px] text-slate-500">
                  Resaltados en amarillo los valores que difieren
                </span>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/80">
                <div className="grid grid-cols-12 bg-slate-900 p-2.5 text-[11px] font-semibold text-slate-300 border-b border-slate-800">
                  <div className="col-span-4">Parámetro BIOS</div>
                  <div className="col-span-4 text-cyan-400 truncate">Perfil A: {profileA.name}</div>
                  <div className="col-span-4 text-indigo-400 truncate">Perfil B: {profileB.name}</div>
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/60 text-xs">
                  {BIOS_OPTIONS.map((opt) => {
                    const valA = profileA.config[opt.id] || opt.defaultValue;
                    const valB = profileB.config[opt.id] || opt.defaultValue;
                    const isDiff = valA !== valB;

                    return (
                      <div 
                        key={opt.id}
                        className={`grid grid-cols-12 p-2.5 items-center transition-colors ${
                          isDiff ? 'bg-amber-950/20 hover:bg-amber-950/30' : 'hover:bg-slate-900/50'
                        }`}
                      >
                        <div className="col-span-4 pr-2">
                          <span className="font-medium text-slate-200 block text-xs truncate">
                            {opt.label}
                          </span>
                          <span className="text-[10px] text-slate-500">{opt.category}</span>
                        </div>
                        <div className="col-span-4 pr-2 font-mono text-[11px]">
                          <span className={isDiff ? 'text-yellow-300 font-semibold' : 'text-slate-400'}>
                            {valA}
                          </span>
                        </div>
                        <div className="col-span-4 pr-2 font-mono text-[11px]">
                          <span className={isDiff ? 'text-indigo-300 font-semibold' : 'text-slate-400'}>
                            {valB}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Actions Footer for Tab 1 */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="text-xs text-slate-400">
                ¿Deseas probar la estabilidad o aplicar la configuración del Perfil B?
              </div>
              <div className="flex items-center gap-2">
                {onOpenStressTest && (
                  <button
                    onClick={() => {
                      soundManager.playKeyTick();
                      onClose();
                      onOpenStressTest();
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/50 text-rose-200 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Flame className="w-3.5 h-3.5 text-rose-400" />
                    <span>Test de Estrés</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    soundManager.playValueChangeSound();
                    onApplyProfile(profileB);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-950 transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Cargar "{profileB.name}" en la BIOS</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Save Profile Form */}
        {activeTab === 'save' && (
          <div className="flex-1 overflow-y-auto p-5 max-w-2xl mx-auto w-full">
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Save className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Guardar Configuración Actual como Perfil</h3>
                  <p className="text-xs text-slate-400">
                    Crea una instantánea de tus ajustes actuales para compararla más tarde o compartirla con alumnos.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nombre del Perfil *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Overclock Seguro 4.8GHz, Servidor Laboratorio..."
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Autor / Alumno
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Descripción / Notas Técnicas
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Explica qué ajustes clave cambiaste y para qué propósito..."
                    value={newProfileDesc}
                    onChange={(e) => setNewProfileDesc(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('compare')}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-950"
                  >
                    <Check className="w-4 h-4" />
                    <span>Guardar Perfil</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tab 3: Manage / Library */}
        {activeTab === 'manage' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Todos los Perfiles Registrados</h3>
                <p className="text-xs text-slate-400">
                  Explora perfiles predefinidos del sistema y perfiles creados por ti.
                </p>
              </div>

              <button
                onClick={handleExportJson}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar JSON</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {allAvailableProfiles.map((prof) => (
                <div
                  key={prof.id}
                  className="bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-4 flex flex-col justify-between transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-white">{prof.name}</span>
                      {prof.isPreset ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                          Predefinido
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                          Personalizado
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-2">
                      {prof.description}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span>Autor: {prof.author}</span>
                      <span>•</span>
                      <span>Fecha: {prof.createdAt}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-800/80">
                    {onDeleteProfile && !prof.isPreset && prof.id !== 'current' && (
                      <button
                        onClick={() => onDeleteProfile(prof.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Eliminar perfil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        soundManager.playValueChangeSound();
                        onApplyProfile(prof);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Cargar en BIOS</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
