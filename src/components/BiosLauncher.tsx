import React from 'react';
import { BiosType, BrandKeyInfo } from '../types/bios';
import { BRAND_BIOS_KEYS } from '../data/biosKeys';
import { soundManager } from '../utils/audio';
import { 
  Monitor, 
  Terminal, 
  Key, 
  Play, 
  Cpu, 
  GitCompare, 
  Award, 
  HelpCircle, 
  Sparkles, 
  ChevronRight,
  Shield,
  Layers,
  Zap,
  Info,
  Flame,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

interface BiosLauncherProps {
  onStartSimulation: (biosType: BiosType, simulatePost: boolean, brand?: BrandKeyInfo) => void;
  onOpenBrandKeysGuide: () => void;
  onOpenProfiles: () => void;
  onOpenMissions: () => void;
  onOpenStressTest: () => void;
  onOpenBiosUpdate: () => void;
}

export const BiosLauncher: React.FC<BiosLauncherProps> = ({
  onStartSimulation,
  onOpenBrandKeysGuide,
  onOpenProfiles,
  onOpenMissions,
  onOpenStressTest,
  onOpenBiosUpdate
}) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-black">
      
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 flex-1 flex flex-col justify-center">
        
        {/* Top Brand Banner: Un Fantasma en el Sistema */}
        <div className="flex justify-center mb-6">
          <a
            href="https://www.unfantasmaenelsistema.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-700/80 hover:border-cyan-500/60 shadow-xl transition-all transform hover:scale-[1.02]"
            title="Visitar Un Fantasma en el Sistema (www.unfantasmaenelsistema.com)"
          >
            <img 
              src={`${import.meta.env.BASE_URL}icono.png`} 
              alt="Logo Un Fantasma en el Sistema" 
              className="w-9 h-9 sm:w-10 sm:scale-105 object-contain filter drop-shadow group-hover:rotate-6 transition-transform" 
            />
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs sm:text-sm tracking-wide text-white group-hover:text-cyan-300 transition-colors">
                  Un Fantasma en el Sistema
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-300" />
              </div>
              <span className="text-[11px] text-slate-400 font-mono block">
                www.unfantasmaenelsistema.com
              </span>
            </div>
          </a>
        </div>

        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto mb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulador Educativo de Hardware y Firmware v2.0</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold font-uefi tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-300">
            Simulador Interactivo de BIOS
          </h1>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Aprende qué hace cada opción de la placa base, para qué sirve y qué impacto real causa en el rendimiento, temperaturas, estabilidad y seguridad del hardware.
          </p>
        </div>

        {/* BIOS Selection Cards: Legacy vs Modern */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Card 1: BIOS Antigua (Legacy) */}
          <div className="group relative bg-slate-900/80 border border-slate-800 hover:border-yellow-400/60 rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 shadow-xl hover:shadow-yellow-500/10">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
                  <Terminal className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded bg-yellow-400/20 text-yellow-300 border border-yellow-400/30">
                  1984 - 2012 • 16 BITS
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold font-dos text-white group-hover:text-yellow-300 transition-colors">
                BIOS Antigua (Legacy / Phoenix-Award)
              </h2>

              <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                Interfaz clásica en modo texto con fondo azul y letras amarillas. Navegación 100% por teclado con flechas, teclas de función [F1-F10] y efecto CRT scanlines opcional.
              </p>

              <div className="my-5 p-3.5 rounded-2xl bg-black/50 border border-slate-800 font-mono text-xs text-slate-300 space-y-1.5">
                <div className="text-yellow-400 font-bold">Características clave:</div>
                <div>• Controladoras IDE / CHS y disqueteras 1.44MB</div>
                <div>• Partición MBR y llamadas por interrupción INT 13h</div>
                <div>• POST detallado con testeo de memoria y beeper</div>
                <div>• Diagnóstico y arranque paso a paso retro</div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  soundManager.playKeyTick();
                  onStartSimulation('legacy', true);
                }}
                className="w-full py-3 px-4 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-blue-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-yellow-950 transition-all transform hover:scale-[1.01]"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Simular Encendido (POST) y Entrar a BIOS Antigua</span>
              </button>
              <button
                onClick={() => {
                  soundManager.playKeyTick();
                  onStartSimulation('legacy', false);
                }}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                Entrar directamente sin secuencia POST
              </button>
            </div>
          </div>

          {/* Card 2: BIOS Moderna (UEFI) */}
          <div className="group relative bg-slate-900/80 border border-slate-800 hover:border-cyan-400/60 rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 shadow-xl hover:shadow-cyan-500/10">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <Monitor className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                  2012 - HOY • 64 BITS UEFI
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold font-uefi text-white group-hover:text-cyan-300 transition-colors">
                BIOS Moderna (UEFI Gaming / GUI)
              </h2>

              <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                Firmware moderno de alta definición con soporte para ratón y teclado, gráficos interactivos, modo EZ Mode de inicio rápido y Modo Avanzado de Overclocking.
              </p>

              <div className="my-5 p-3.5 rounded-2xl bg-black/50 border border-slate-800 font-mono text-xs text-slate-300 space-y-1.5">
                <div className="text-cyan-400 font-bold">Características clave:</div>
                <div>• Perfiles X.M.P / D.O.C.P / EXPO y Resizable BAR</div>
                <div>• Requisitos de Windows 11 (TPM 2.0 y Secure Boot)</div>
                <div>• Curvas de ventilación inteligentes (Q-Fan) y voltajes</div>
                <div>• Unidades NVMe PCIe Gen 4/5 y tabla GPT</div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  soundManager.playKeyTick();
                  onStartSimulation('modern', true);
                }}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-950 transition-all transform hover:scale-[1.01]"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Simular Encendido (POST) y Entrar a BIOS UEFI</span>
              </button>
              <button
                onClick={() => {
                  soundManager.playKeyTick();
                  onStartSimulation('modern', false);
                }}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                Entrar directamente sin secuencia POST
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Interactive Toolbar: Brand Keys Guide, Profiles, Missions, Stress Test & BIOS Update */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
          
          {/* Brand BIOS Keys Guide */}
          <button
            onClick={() => {
              soundManager.playKeyTick();
              onOpenBrandKeysGuide();
            }}
            className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 text-left flex items-start gap-3 transition-all group"
          >
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs sm:text-sm text-white block group-hover:text-cyan-300 transition-colors">
                Teclas por Marca
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block line-clamp-1">
                ASUS, HP, Dell, Lenovo...
              </span>
            </div>
          </button>

          {/* Profile Comparator */}
          <button
            onClick={() => {
              soundManager.playKeyTick();
              onOpenProfiles();
            }}
            className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/40 text-left flex items-start gap-3 transition-all group"
          >
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
              <GitCompare className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs sm:text-sm text-white block group-hover:text-indigo-300 transition-colors">
                Perfiles & Benchmarks
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block line-clamp-1">
                Compara CPU, latencias y watts.
              </span>
            </div>
          </button>

          {/* Student Missions */}
          <button
            onClick={() => {
              soundManager.playKeyTick();
              onOpenMissions();
            }}
            className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/40 text-left flex items-start gap-3 transition-all group"
          >
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs sm:text-sm text-white block group-hover:text-emerald-300 transition-colors">
                Retos y Misiones
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block line-clamp-1">
                Win11, XMP, Servidor VMs...
              </span>
            </div>
          </button>

          {/* Hardware Stress Test */}
          <button
            onClick={() => {
              soundManager.playKeyTick();
              onOpenStressTest();
            }}
            className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-rose-500/40 text-left flex items-start gap-3 transition-all group"
          >
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 group-hover:scale-110 transition-transform">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs sm:text-sm text-white block group-hover:text-rose-300 transition-colors">
                Test de Estrés
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block line-clamp-1">
                Estabilidad, AVX2 y cuelgues.
              </span>
            </div>
          </button>

          {/* BIOS Update Utility */}
          <button
            onClick={() => {
              soundManager.playKeyTick();
              onOpenBiosUpdate();
            }}
            className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/40 text-left flex items-start gap-3 transition-all group"
          >
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs sm:text-sm text-white block group-hover:text-amber-300 transition-colors">
                  Actualizar BIOS
                </span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                  Q-Flash
                </span>
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block line-clamp-1">
                Flasheo SPI y riesgos de brickeo.
              </span>
            </div>
          </button>

        </div>

      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 py-4 px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between max-w-6xl mx-auto w-full gap-3">
        <a 
          href="https://www.unfantasmaenelsistema.com/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 text-slate-400 hover:text-cyan-300 transition-colors group"
        >
          <img 
            src={`${import.meta.env.BASE_URL}icono.png`} 
            alt="Un Fantasma en el Sistema" 
            className="w-5 h-5 object-contain group-hover:rotate-6 transition-transform" 
          />
          <span className="font-semibold text-slate-300 group-hover:text-cyan-300">
            Un Fantasma en el Sistema
          </span>
          <span className="text-slate-500 font-mono text-[11px]">
            (www.unfantasmaenelsistema.com)
          </span>
        </a>

        <div className="flex items-center gap-4 text-slate-400">
          <span>Teclado: Flechas, Enter, +/-, Esc, F1-F10</span>
          <span>•</span>
          <span>Simulador Educativo de Hardware</span>
        </div>
      </footer>

    </div>
  );
};
