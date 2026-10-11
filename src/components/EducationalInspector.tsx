import React from 'react';
import { BiosOption } from '../types/bios';
import { 
  Cpu, 
  Zap, 
  Thermometer, 
  ShieldCheck, 
  Clock, 
  Activity, 
  HelpCircle, 
  AlertTriangle, 
  Flame, 
  Layers, 
  X,
  Gauge
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface EducationalInspectorProps {
  option: BiosOption | null;
  currentValue?: string;
  onClose?: () => void;
  isFloating?: boolean;
}

export const EducationalInspector: React.FC<EducationalInspectorProps> = ({
  option,
  currentValue,
  onClose,
  isFloating = false
}) => {
  if (!option) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-500 bg-slate-900/60 border border-slate-800 rounded-xl">
        <HelpCircle className="w-12 h-12 text-slate-600 mb-3 animate-pulse" />
        <h4 className="text-sm font-semibold text-slate-400">Inspector Pedagógico de Hardware</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          Selecciona o navega sobre cualquier parámetro de la BIOS para analizar su función, propósito e impacto real en el hardware.
        </p>
      </div>
    );
  }

  const activeVal = currentValue || option.defaultValue;
  const isModified = activeVal !== option.defaultValue;

  return (
    <div className={`flex flex-col h-full bg-slate-900/95 border border-slate-800 rounded-xl overflow-hidden shadow-xl text-slate-200 ${
      isFloating ? 'max-w-xl w-full' : ''
    }`}>
      
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Categoría: {option.category}
            </span>
            {isModified && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Modificado
              </span>
            )}
          </div>
          <h3 className="text-base font-bold text-white font-uefi tracking-wide">
            {option.label}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-xs">
            <span className="text-slate-400">Valor actual:</span>
            <span className="font-mono font-semibold text-cyan-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              {activeVal}
            </span>
            {isModified && (
              <span className="text-[11px] text-slate-500">
                (Por defecto: {option.defaultValue})
              </span>
            )}
          </div>
        </div>

        {onClose && (
          <button
            onClick={() => {
              soundManager.playKeyTick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Scrollable details */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        
        {/* Description - ¿Qué hace? */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-cyan-400 font-semibold mb-1 text-[11px] uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>¿Qué hace esta opción?</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-xs">
            {option.description}
          </p>
        </div>

        {/* Purpose - ¿Para qué sirve? */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-indigo-400 font-semibold mb-1 text-[11px] uppercase tracking-wider">
            <Gauge className="w-3.5 h-3.5" />
            <span>¿Para qué sirve y cuándo modificarla?</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-xs">
            {option.purpose}
          </p>
        </div>

        {/* Warnings if any */}
        {option.warning && (
          <div className="bg-amber-950/30 border border-amber-600/40 rounded-xl p-3 text-amber-200 flex gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300 block mb-0.5 text-xs">Advertencia de Seguridad:</span>
              <p className="text-[11px] leading-relaxed">{option.warning}</p>
            </div>
          </div>
        )}

        {/* Hardware Impact Section */}
        <div>
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-2 text-xs uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Impacto en el Rendimiento del Hardware</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            
            {/* CPU */}
            <div className="bg-slate-950/80 border border-slate-800/90 rounded-lg p-2.5">
              <div className="flex items-center gap-1.5 text-sky-400 font-medium mb-1 text-[11px]">
                <Cpu className="w-3.5 h-3.5" />
                <span>Rendimiento CPU</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-snug">
                {option.hardwareImpact.cpuPerformance}
              </p>
            </div>

            {/* RAM */}
            <div className="bg-slate-950/80 border border-slate-800/90 rounded-lg p-2.5">
              <div className="flex items-center gap-1.5 text-violet-400 font-medium mb-1 text-[11px]">
                <Layers className="w-3.5 h-3.5" />
                <span>Memoria RAM y Ancho de Banda</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-snug">
                {option.hardwareImpact.ramPerformance}
              </p>
            </div>

            {/* Temperatures */}
            <div className="bg-slate-950/80 border border-slate-800/90 rounded-lg p-2.5">
              <div className="flex items-center gap-1.5 text-rose-400 font-medium mb-1 text-[11px]">
                <Thermometer className="w-3.5 h-3.5" />
                <span>Temperaturas y Disipación</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-snug">
                {option.hardwareImpact.temperatures}
              </p>
            </div>

            {/* Power Consumption */}
            <div className="bg-slate-950/80 border border-slate-800/90 rounded-lg p-2.5">
              <div className="flex items-center gap-1.5 text-amber-400 font-medium mb-1 text-[11px]">
                <Zap className="w-3.5 h-3.5" />
                <span>Consumo Eléctrico (Watts)</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-snug">
                {option.hardwareImpact.powerConsumption}
              </p>
            </div>

            {/* Boot Time */}
            <div className="bg-slate-950/80 border border-slate-800/90 rounded-lg p-2.5">
              <div className="flex items-center gap-1.5 text-teal-400 font-medium mb-1 text-[11px]">
                <Clock className="w-3.5 h-3.5" />
                <span>Tiempo de Arranque (POST)</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-snug">
                {option.hardwareImpact.bootTime}
              </p>
            </div>

            {/* Security */}
            <div className="bg-slate-950/80 border border-slate-800/90 rounded-lg p-2.5">
              <div className="flex items-center gap-1.5 text-emerald-400 font-medium mb-1 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Seguridad del Sistema</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-snug">
                {option.hardwareImpact.security}
              </p>
            </div>

          </div>
        </div>

        {/* Recommended For */}
        <div className="p-3 bg-cyan-950/20 border border-cyan-800/40 rounded-xl">
          <span className="font-semibold text-cyan-300 block mb-1 text-[11px] uppercase tracking-wider">
            Recomendación para el alumno / técnico:
          </span>
          <p className="text-slate-300 text-xs">
            {option.recommendedFor}
          </p>
        </div>

        {/* Technical notes */}
        {option.technicalNotes && (
          <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl text-slate-400 text-[11px]">
            <span className="font-semibold text-slate-300 block mb-0.5">Dato Técnico Curioso:</span>
            {option.technicalNotes}
          </div>
        )}

      </div>
    </div>
  );
};
