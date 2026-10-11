import React, { useState, useEffect, useCallback } from 'react';
import { BiosOption, BiosConfigState, OptionCategory } from '../types/bios';
import { BIOS_OPTIONS } from '../data/biosOptions';
import { soundManager } from '../utils/audio';
import { EducationalInspector } from './EducationalInspector';
import { 
  Tv, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Save, 
  Keyboard, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  CornerDownLeft,
  HeartPulse
} from 'lucide-react';
import { DiagnosticOverlay } from './DiagnosticOverlay';
import { BootPriorityManager } from './BootPriorityManager';

interface LegacyBiosProps {
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
}

const CATEGORIES: OptionCategory[] = ['Main', 'Advanced', 'Security', 'Power', 'Boot', 'Exit'];

export const LegacyBios: React.FC<LegacyBiosProps> = ({
  config,
  onChangeOption,
  onResetDefaults,
  onRequestSaveExit,
  onExitWithoutSave,
  onOpenProfiles,
  onOpenMissions,
  onOpenStressTest,
  onSwitchBiosType,
  onOpenBiosUpdate
}) => {
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [selectorOptionIndex, setSelectorOptionIndex] = useState(0);
  const [showFullInspector, setShowFullInspector] = useState(false);
  const [enableCrtEffect, setEnableCrtEffect] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(soundManager.isSoundEnabled());
  const [isDiagnosticOverlayOpen, setIsDiagnosticOverlayOpen] = useState(false);
  const [isBootPriorityOpen, setIsBootPriorityOpen] = useState(false);

  const currentCategory = CATEGORIES[selectedCategoryIndex];

  // Options available in legacy mode for the active category
  const activeOptions = BIOS_OPTIONS.filter(
    (opt) => opt.availableIn.includes('legacy') && opt.category === currentCategory
  );

  const selectedOption: BiosOption | undefined = activeOptions[selectedRowIndex] || activeOptions[0];

  // Change value helper
  const cycleOptionValue = useCallback((delta: number) => {
    if (!selectedOption) return;
    const currentVal = config[selectedOption.id] || selectedOption.defaultValue;
    const currentIndex = selectedOption.options.indexOf(currentVal);
    let nextIndex = currentIndex + delta;
    if (nextIndex < 0) nextIndex = selectedOption.options.length - 1;
    if (nextIndex >= selectedOption.options.length) nextIndex = 0;
    
    soundManager.playValueChangeSound();
    onChangeOption(selectedOption.id, selectedOption.options[nextIndex]);
  }, [selectedOption, config, onChangeOption]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.key)) {
        e.preventDefault();
      }

      if (isSelectorOpen && selectedOption) {
        if (e.key === 'ArrowUp') {
          soundManager.playKeyTick();
          setSelectorOptionIndex((prev) => (prev > 0 ? prev - 1 : selectedOption.options.length - 1));
        } else if (e.key === 'ArrowDown') {
          soundManager.playKeyTick();
          setSelectorOptionIndex((prev) => (prev < selectedOption.options.length - 1 ? prev + 1 : 0));
        } else if (e.key === 'Enter') {
          soundManager.playValueChangeSound();
          onChangeOption(selectedOption.id, selectedOption.options[selectorOptionIndex]);
          setIsSelectorOpen(false);
        } else if (e.key === 'Escape') {
          soundManager.playKeyTick();
          setIsSelectorOpen(false);
        }
        return;
      }

      // Normal navigation
      if (e.key === 'ArrowLeft') {
        soundManager.playKeyTick();
        setSelectedCategoryIndex((prev) => (prev > 0 ? prev - 1 : CATEGORIES.length - 1));
        setSelectedRowIndex(0);
      } else if (e.key === 'ArrowRight') {
        soundManager.playKeyTick();
        setSelectedCategoryIndex((prev) => (prev < CATEGORIES.length - 1 ? prev + 1 : 0));
        setSelectedRowIndex(0);
      } else if (e.key === 'ArrowUp') {
        soundManager.playKeyTick();
        setSelectedRowIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, activeOptions.length - 1)));
      } else if (e.key === 'ArrowDown') {
        soundManager.playKeyTick();
        setSelectedRowIndex((prev) => (prev < activeOptions.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'Enter') {
        if (selectedOption) {
          soundManager.playKeyTick();
          const currentVal = config[selectedOption.id] || selectedOption.defaultValue;
          const currIdx = selectedOption.options.indexOf(currentVal);
          setSelectorOptionIndex(currIdx >= 0 ? currIdx : 0);
          setIsSelectorOpen(true);
        }
      } else if (e.key === '+' || e.key === '=' || e.key === 'PageUp') {
        cycleOptionValue(1);
      } else if (e.key === '-' || e.key === '_' || e.key === 'PageDown') {
        cycleOptionValue(-1);
      } else if (e.key === 'F1') {
        e.preventDefault();
        soundManager.playKeyTick();
        setShowFullInspector((prev) => !prev);
      } else if (e.key === 'F6') {
        e.preventDefault();
        soundManager.playKeyTick();
        setIsBootPriorityOpen((prev) => !prev);
      } else if (e.key === 'F8') {
        e.preventDefault();
        soundManager.playKeyTick();
        setIsDiagnosticOverlayOpen((prev) => !prev);
      } else if (e.key === 'F11') {
        e.preventDefault();
        soundManager.playKeyTick();
        if (onOpenBiosUpdate) onOpenBiosUpdate();
      } else if (e.key === 'F9') {
        e.preventDefault();
        soundManager.playValueChangeSound();
        onResetDefaults();
      } else if (e.key === 'F10') {
        e.preventDefault();
        soundManager.playKeyTick();
        onRequestSaveExit();
      } else if (e.key === 'Escape') {
        soundManager.playKeyTick();
        if (showFullInspector) {
          setShowFullInspector(false);
        } else if (isBootPriorityOpen) {
          setIsBootPriorityOpen(false);
        } else {
          onRequestSaveExit();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isSelectorOpen, 
    selectedOption, 
    selectorOptionIndex, 
    activeOptions.length, 
    cycleOptionValue, 
    config, 
    onChangeOption, 
    onResetDefaults, 
    onRequestSaveExit, 
    showFullInspector,
    isBootPriorityOpen,
    onOpenBiosUpdate
  ]);

  return (
    <div className="relative w-full h-full min-h-screen bg-[#000088] text-white select-none font-dos flex flex-col justify-between overflow-x-hidden p-2 sm:p-4">
      
      {/* CRT Scanline Overlay */}
      {enableCrtEffect && (
        <div className="absolute inset-0 crt-overlay pointer-events-none z-30 opacity-60" />
      )}

      {/* Top Outer Banner */}
      <div className="z-20 border-2 border-white bg-[#0000aa] p-2 text-center shadow-lg">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <a
            href="https://www.unfantasmaenelsistema.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 group hover:opacity-95"
            title="Un Fantasma en el Sistema (www.unfantasmaenelsistema.com)"
          >
            <img src={`${import.meta.env.BASE_URL}icono.png`} alt="Logo" className="w-6 h-6 object-contain group-hover:scale-105 transition-transform" />
            <span className="text-yellow-300 font-bold tracking-widest text-sm text-left">
              Phoenix - AwardBIOS CMOS Setup Utility
            </span>
          </a>
          <div className="flex items-center gap-2">
            <a
              href="https://www.unfantasmaenelsistema.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-300 hover:text-white hover:underline text-[11px]"
            >
              www.unfantasmaenelsistema.com
            </a>
            <span className="px-2 py-0.5 bg-yellow-400 text-blue-950 font-bold rounded text-[10px]">
              MODO LEGACY BIOS
            </span>
          </div>
        </div>

        {/* Categories Tab Bar */}
        <div className="mt-2 pt-2 border-t border-white/40 flex flex-wrap justify-center gap-1 sm:gap-4 text-xs tracking-wider">
          {CATEGORIES.map((cat, idx) => {
            const isActive = idx === selectedCategoryIndex;
            return (
              <button
                key={cat}
                onClick={() => {
                  soundManager.playKeyTick();
                  setSelectedCategoryIndex(idx);
                  setSelectedRowIndex(0);
                }}
                className={`px-3 py-1 font-bold transition-colors ${
                  isActive
                    ? 'bg-white text-[#0000aa] shadow'
                    : 'text-yellow-300 hover:text-white hover:bg-blue-900'
                }`}
              >
                [ {cat.toUpperCase()} ]
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Two-Column BIOS Screen */}
      <div className="z-20 my-2 flex-1 grid grid-cols-1 md:grid-cols-12 gap-3 min-h-[440px]">
        
        {/* Left Column: Menu Options List */}
        <div className="md:col-span-8 border-2 border-white bg-[#0000aa] p-3 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-1">
            <div className="border-b border-white/30 pb-1.5 mb-2 text-yellow-300 font-bold text-xs flex justify-between">
              <span>Opción de Hardware ({currentCategory})</span>
              <span>Valor Configurado</span>
            </div>

            {currentCategory === 'Boot' && (
              <div className="mb-2 p-2 bg-[#000066] border border-yellow-300 text-yellow-300 text-xs flex flex-wrap items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <span className="font-bold block">► ORDEN VISUAL DE DISPOSITIVOS DE ARRANQUE</span>
                  <span className="text-[11px] text-cyan-200 block">
                    Reordena SSD, USB, HDD mecánico y Red PXE con cálculo de latencia de inicio.
                  </span>
                </div>
                <button
                  onClick={() => {
                    soundManager.playKeyTick();
                    setIsBootPriorityOpen(true);
                  }}
                  className="px-2.5 py-1 bg-yellow-400 text-blue-950 font-bold hover:bg-yellow-300 border border-white text-xs shadow"
                >
                  [F6] Abrir Gestor Drag & Drop
                </button>
              </div>
            )}

            {activeOptions.length > 0 ? (
              activeOptions.map((opt, idx) => {
                const isSelected = idx === selectedRowIndex;
                const currentVal = config[opt.id] || opt.defaultValue;
                const isDefault = currentVal === opt.defaultValue;

                return (
                  <div
                    key={opt.id}
                    onClick={() => {
                      soundManager.playKeyTick();
                      setSelectedRowIndex(idx);
                    }}
                    onDoubleClick={() => {
                      setSelectedRowIndex(idx);
                      const currIdx = opt.options.indexOf(currentVal);
                      setSelectorOptionIndex(currIdx >= 0 ? currIdx : 0);
                      setIsSelectorOpen(true);
                    }}
                    className={`cursor-pointer px-2 py-1 text-xs flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-[#ffffff] text-[#0000aa] font-bold shadow'
                        : 'text-white hover:bg-blue-900'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate pr-2">
                      <span className={isSelected ? 'text-[#0000aa]' : 'text-yellow-300'}>
                        {isSelected ? '►' : ' '}
                      </span>
                      <span className="truncate">{opt.label}</span>
                    </div>

                    <div className="shrink-0 font-mono flex items-center gap-2">
                      <span className={isSelected ? 'text-[#0000aa]' : isDefault ? 'text-cyan-300' : 'text-yellow-300 font-bold'}>
                        [ {currentVal} ]
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-slate-300 text-xs">
                {currentCategory === 'Exit' ? (
                  <div className="space-y-3">
                    <p className="text-yellow-300 font-bold">Opciones de Salida de BIOS:</p>
                    <div className="flex flex-col gap-2 max-w-xs mx-auto">
                      <button
                        onClick={onRequestSaveExit}
                        className="p-2 border border-white bg-blue-900 hover:bg-yellow-400 hover:text-blue-950 font-bold"
                      >
                        ► Guardar Cambios y Reiniciar (F10)
                      </button>
                      <button
                        onClick={onExitWithoutSave}
                        className="p-2 border border-white bg-blue-900 hover:bg-yellow-400 hover:text-blue-950"
                      >
                        ► Descartar Cambios y Salir (ESC)
                      </button>
                      <button
                        onClick={onResetDefaults}
                        className="p-2 border border-white bg-blue-900 hover:bg-yellow-400 hover:text-blue-950"
                      >
                        ► Restaurar Valores de Fábrica (F9)
                      </button>
                    </div>
                  </div>
                ) : (
                  'No hay opciones adicionales en esta sección.'
                )}
              </div>
            )}
          </div>

          {/* Quick value cycle helper on click */}
          {selectedOption && (
            <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[11px] text-slate-300">
              <span>Tip: Pulsa Enter o doble clic para abrir la lista de valores.</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => cycleOptionValue(-1)}
                  className="px-2 py-0.5 border border-white/60 bg-blue-900 hover:bg-white hover:text-blue-950"
                >
                  [ - Anterior ]
                </button>
                <button
                  onClick={() => cycleOptionValue(1)}
                  className="px-2 py-0.5 border border-white/60 bg-blue-900 hover:bg-white hover:text-blue-950"
                >
                  [ + Siguiente ]
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Item Specific Help & Educational Preview */}
        <div className="md:col-span-4 border-2 border-white bg-[#0000aa] p-3 flex flex-col justify-between">
          <div>
            <div className="text-yellow-300 font-bold text-xs uppercase tracking-wider border-b border-white/30 pb-1 mb-2">
              Item Specific Help
            </div>

            {selectedOption ? (
              <div className="space-y-3 text-xs leading-relaxed text-slate-200">
                <p className="font-bold text-white">
                  {selectedOption.label}
                </p>

                <p className="text-cyan-200 text-xs">
                  {selectedOption.description}
                </p>

                <div className="bg-blue-950/80 border border-white/30 p-2 text-[11px]">
                  <span className="text-yellow-300 font-bold block mb-0.5">¿Para qué sirve?</span>
                  <p className="text-slate-300">{selectedOption.purpose}</p>
                </div>

                <div className="text-[11px] space-y-1">
                  <p>
                    <span className="text-yellow-300 font-bold">• CPU:</span>{' '}
                    {selectedOption.hardwareImpact.cpuPerformance}
                  </p>
                  <p>
                    <span className="text-yellow-300 font-bold">• RAM:</span>{' '}
                    {selectedOption.hardwareImpact.ramPerformance}
                  </p>
                  <p>
                    <span className="text-yellow-300 font-bold">• Arranque:</span>{' '}
                    {selectedOption.hardwareImpact.bootTime}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-slate-400 text-xs py-8 text-center">
                Usa las flechas [↑] [↓] para seleccionar un parámetro.
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-white/20 space-y-2">
            <button
              onClick={() => {
                soundManager.playKeyTick();
                setShowFullInspector(true);
              }}
              className="w-full py-1.5 px-3 bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-bold text-xs border border-white flex items-center justify-center gap-1.5 shadow"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>[F1] Abrir Inspector Pedagógico Completo</span>
            </button>
          </div>
        </div>

      </div>

      {/* Value Selector Popup Dialog */}
      {isSelectorOpen && selectedOption && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-sm bg-[#0000aa] border-4 border-double border-white shadow-2xl p-4 text-white">
            <div className="text-yellow-300 font-bold text-center border-b border-white pb-1 mb-2 text-xs">
              {selectedOption.label}
            </div>

            <div className="space-y-1 my-3">
              {selectedOption.options.map((optVal, idx) => {
                const isSelected = idx === selectorOptionIndex;
                const isCurrent = (config[selectedOption.id] || selectedOption.defaultValue) === optVal;

                return (
                  <div
                    key={optVal}
                    onClick={() => {
                      setSelectorOptionIndex(idx);
                      onChangeOption(selectedOption.id, optVal);
                      setIsSelectorOpen(false);
                    }}
                    className={`cursor-pointer px-3 py-1.5 text-xs flex items-center justify-between ${
                      isSelected
                        ? 'bg-white text-[#0000aa] font-bold'
                        : 'hover:bg-blue-900 text-white'
                    }`}
                  >
                    <span>{isSelected ? '► ' : '  '}{optVal}</span>
                    {isCurrent && <span className="text-[10px] text-yellow-300">(Actual)</span>}
                  </div>
                );
              })}
            </div>

            <div className="text-center text-[10px] text-slate-300 border-t border-white/40 pt-2 flex justify-between">
              <span>[↑↓] Mover</span>
              <span>[Enter] Elegir</span>
              <span>[ESC] Cancelar</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Full Educational Inspector Modal */}
      {showFullInspector && selectedOption && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh]">
            <EducationalInspector
              option={selectedOption}
              currentValue={config[selectedOption.id]}
              onClose={() => setShowFullInspector(false)}
              isFloating={true}
            />
          </div>
        </div>
      )}

      {/* Floating Boot Priority Manager Modal */}
      {isBootPriorityOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto">
            <div className="mb-2 flex justify-end">
              <button
                onClick={() => setIsBootPriorityOpen(false)}
                className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-bold text-xs border border-white flex items-center gap-1 shadow"
              >
                [ESC] Cerrar Gestor de Arranque
              </button>
            </div>
            <BootPriorityManager
              config={config}
              onChangeOption={onChangeOption}
              biosType="legacy"
            />
          </div>
        </div>
      )}

      {/* Bottom Keyboard Shortcuts Legend (Authentic BIOS Footer) */}
      <div className="z-20 border-2 border-white bg-[#0000aa] p-2 text-center text-[11px] text-yellow-300 space-y-1">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
          <span><strong>↑↓→←</strong>: Mover</span>
          <span><strong>Enter</strong>: Seleccionar</span>
          <span><strong>+/-</strong>: Cambiar Valor</span>
          <span><strong>F1</strong>: Ayuda</span>
          <span><strong className="text-cyan-300">F6</strong>: Orden Boot</span>
          <span><strong className="text-emerald-300">F8</strong>: HUD Salud</span>
          <span><strong className="text-amber-300">F11</strong>: Flashear BIOS</span>
          <span><strong>F9</strong>: Defaults</span>
          <span><strong>F10</strong>: Guardar</span>
          <span><strong>ESC</strong>: Salir</span>
        </div>

        {/* Educational Toolbar Controls */}
        <div className="pt-1.5 border-t border-white/20 flex flex-wrap items-center justify-between gap-2 text-white">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEnableCrtEffect(!enableCrtEffect);
              }}
              className="px-2 py-0.5 border border-white/40 bg-blue-900 hover:bg-white hover:text-blue-950 flex items-center gap-1 text-[10px]"
            >
              <Tv className="w-3 h-3" />
              <span>Efecto CRT: {enableCrtEffect ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={() => {
                const newState = !soundEnabled;
                setSoundEnabled(newState);
                soundManager.setSoundEnabled(newState);
              }}
              className="px-2 py-0.5 border border-white/40 bg-blue-900 hover:bg-white hover:text-blue-950 flex items-center gap-1 text-[10px]"
            >
              {soundEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
              <span>Beeper: {soundEnabled ? 'ON' : 'MUTE'}</span>
            </button>

            <button
              onClick={() => {
                soundManager.playKeyTick();
                setIsDiagnosticOverlayOpen(!isDiagnosticOverlayOpen);
              }}
              className={`px-2 py-0.5 border text-[10px] font-bold flex items-center gap-1 ${
                isDiagnosticOverlayOpen 
                  ? 'border-yellow-400 bg-yellow-400 text-blue-950 shadow' 
                  : 'border-emerald-400 bg-emerald-700 hover:bg-emerald-600 text-white'
              }`}
            >
              <HeartPulse className="w-3 h-3" />
              <span>[F8] HUD Salud</span>
            </button>

            <button
              onClick={() => {
                soundManager.playKeyTick();
                setIsBootPriorityOpen(!isBootPriorityOpen);
              }}
              className={`px-2 py-0.5 border text-[10px] font-bold flex items-center gap-1 ${
                isBootPriorityOpen 
                  ? 'border-yellow-400 bg-yellow-400 text-blue-950 shadow' 
                  : 'border-cyan-400 bg-cyan-700 hover:bg-cyan-600 text-white'
              }`}
            >
              <span>[F6] Orden Boot</span>
            </button>

            <button
              onClick={() => {
                soundManager.playKeyTick();
                if (onOpenBiosUpdate) onOpenBiosUpdate();
              }}
              className="px-2 py-0.5 border border-amber-300 bg-amber-500 hover:bg-amber-400 text-blue-950 font-bold text-[10px] flex items-center gap-1"
            >
              <span>[F11] Flashear BIOS</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenStressTest}
              className="px-2.5 py-1 bg-red-600 text-white font-bold hover:bg-red-500 text-[11px]"
            >
              Test de Estrés
            </button>
            <button
              onClick={onOpenProfiles}
              className="px-2.5 py-1 bg-yellow-400 text-blue-950 font-bold hover:bg-yellow-300 text-[11px]"
            >
              Comparar Perfiles
            </button>
            <button
              onClick={onOpenMissions}
              className="px-2.5 py-1 bg-green-500 text-black font-bold hover:bg-green-400 text-[11px]"
            >
              Retos / Misiones
            </button>
            <button
              onClick={onSwitchBiosType}
              className="px-2.5 py-1 bg-cyan-400 text-blue-950 font-bold hover:bg-cyan-300 text-[11px]"
            >
              Cambiar a BIOS Moderna (UEFI)
            </button>
          </div>
        </div>

        {/* Touch / On-Screen Keypad for Mobile or Users without full Keyboard */}
        <div className="pt-1.5 flex justify-center items-center gap-1 text-[10px] text-white sm:hidden">
          <button
            onClick={() => {
              soundManager.playKeyTick();
              setSelectedCategoryIndex((prev) => (prev > 0 ? prev - 1 : CATEGORIES.length - 1));
            }}
            className="p-1 border border-white bg-blue-900"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              soundManager.playKeyTick();
              setSelectedRowIndex((prev) => (prev > 0 ? prev - 1 : activeOptions.length - 1));
            }}
            className="p-1 border border-white bg-blue-900"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              soundManager.playKeyTick();
              setSelectedRowIndex((prev) => (prev < activeOptions.length - 1 ? prev + 1 : 0));
            }}
            className="p-1 border border-white bg-blue-900"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              soundManager.playKeyTick();
              setSelectedCategoryIndex((prev) => (prev < CATEGORIES.length - 1 ? prev + 1 : 0));
            }}
            className="p-1 border border-white bg-blue-900"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              if (selectedOption) {
                soundManager.playKeyTick();
                setIsSelectorOpen(true);
              }
            }}
            className="px-2 py-1 border border-white bg-yellow-400 text-blue-950 font-bold"
          >
            ENTER
          </button>
          <button
            onClick={() => cycleOptionValue(1)}
            className="px-2 py-1 border border-white bg-blue-900"
          >
            +/-
          </button>
        </div>
      </div>

      {/* Real-time Hardware Diagnostic HUD Overlay */}
      <DiagnosticOverlay
        isOpen={isDiagnosticOverlayOpen}
        onClose={() => setIsDiagnosticOverlayOpen(false)}
        biosType="legacy"
        config={config}
      />

    </div>
  );
};
