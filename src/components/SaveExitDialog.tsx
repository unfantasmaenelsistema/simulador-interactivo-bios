import React from 'react';
import { BiosType, BiosConfigState } from '../types/bios';
import { BIOS_OPTIONS } from '../data/biosOptions';
import { soundManager } from '../utils/audio';
import { Save, AlertTriangle, RotateCcw, X, Check } from 'lucide-react';

interface SaveExitDialogProps {
  isOpen: boolean;
  biosType: BiosType;
  currentConfig: BiosConfigState;
  initialConfig: BiosConfigState;
  onConfirmSave: () => void;
  onCancel: () => void;
  onDiscardAndExit: () => void;
}

export const SaveExitDialog: React.FC<SaveExitDialogProps> = ({
  isOpen,
  biosType,
  currentConfig,
  initialConfig,
  onConfirmSave,
  onCancel,
  onDiscardAndExit
}) => {
  if (!isOpen) return null;

  // Find all modified options to display the real BIOS diff summary
  const modifiedChanges = Object.keys(currentConfig)
    .filter((key) => currentConfig[key] !== initialConfig[key])
    .map((key) => {
      const opt = BIOS_OPTIONS.find((o) => o.id === key);
      return {
        id: key,
        label: opt?.label || key,
        oldValue: initialConfig[key] || 'Default',
        newValue: currentConfig[key]
      };
    });

  if (biosType === 'legacy') {
    // Classic Phoenix / Award Blue & Red Dialog Box
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 font-dos">
        <div className="w-full max-w-lg bg-[#0000aa] border-4 border-double border-white shadow-2xl p-6 text-center select-none text-white">
          <div className="bg-[#aa0000] text-yellow-300 font-bold px-4 py-1 text-base tracking-widest border border-white mb-4">
            SAVE to CMOS and EXIT (Y/N)?
          </div>

          <p className="text-sm text-slate-200 mb-4 leading-relaxed font-mono">
            {modifiedChanges.length > 0 
              ? `Se han detectado ${modifiedChanges.length} cambios en los registros CMOS. ¿Guardar la configuración actual y reiniciar el equipo?`
              : 'No se han realizado modificaciones. ¿Desea reiniciar el sistema?'}
          </p>

          {modifiedChanges.length > 0 && (
            <div className="max-h-36 overflow-y-auto bg-black/50 border border-white/40 p-2 text-left text-xs font-mono mb-4 space-y-1">
              {modifiedChanges.map((change) => (
                <div key={change.id} className="text-slate-300">
                  <span className="text-yellow-300">• {change.label}:</span>{' '}
                  <span className="text-red-300 line-through">{change.oldValue}</span>{' '}
                  <span className="text-white">→</span>{' '}
                  <span className="text-green-300 font-bold">{change.newValue}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-center gap-4 pt-2">
            <button
              onClick={() => {
                soundManager.playKeyTick();
                onConfirmSave();
              }}
              className="px-6 py-2 bg-yellow-400 text-blue-950 font-bold text-sm hover:bg-yellow-300 border-2 border-white focus:outline-none"
            >
              [ Y ] SÍ, GUARDAR Y REINICIAR
            </button>
            <button
              onClick={() => {
                soundManager.playKeyTick();
                onCancel();
              }}
              className="px-6 py-2 bg-slate-700 text-white font-bold text-sm hover:bg-slate-600 border border-white"
            >
              [ N ] CANCELAR
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Modern UEFI Dialog Box
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100">
        
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-cyan-400 font-bold font-uefi tracking-wider text-base">
            <Save className="w-5 h-5 text-cyan-400" />
            <span>Guardar Cambios y Reiniciar Firmware (Save & Reset)</span>
          </div>
          <button
            onClick={() => {
              soundManager.playKeyTick();
              onCancel();
            }}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            El sistema se reiniciará para aplicar los nuevos parámetros en el controlador de la placa base (PCH/Chipset) y la CPU.
          </p>

          {/* Change diff summary */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Resumen de Modificaciones ({modifiedChanges.length})
              </span>
              {modifiedChanges.length === 0 && (
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Sin cambios pendientes
                </span>
              )}
            </div>

            {modifiedChanges.length > 0 ? (
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {modifiedChanges.map((change) => (
                  <div 
                    key={change.id}
                    className="p-2 rounded-lg bg-slate-900/90 border border-slate-800/80 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                  >
                    <span className="font-medium text-slate-300">{change.label}</span>
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <span className="text-rose-400 line-through bg-rose-950/40 px-1.5 py-0.5 rounded">
                        {change.oldValue}
                      </span>
                      <span className="text-slate-500">→</span>
                      <span className="text-emerald-300 font-bold bg-emerald-950/40 px-1.5 py-0.5 rounded">
                        {change.newValue}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-slate-500">
                La configuración coincide exactamente con los valores de inicio.
              </div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-800/30 text-xs text-cyan-300 flex gap-2">
            <AlertTriangle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              Al guardar, se recalculará el rendimiento de hardware y se actualizarán las métricas de prueba.
            </span>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => {
              soundManager.playKeyTick();
              onDiscardAndExit();
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Descartar Cambios y Salir</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundManager.playKeyTick();
                onCancel();
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                soundManager.playKeyTick();
                onConfirmSave();
              }}
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs tracking-wider uppercase transition-colors shadow-lg shadow-cyan-950 flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar y Reiniciar</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
