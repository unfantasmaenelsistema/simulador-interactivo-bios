import React, { useState } from 'react';
import { StudentMission, BiosConfigState } from '../types/bios';
import { STUDENT_MISSIONS } from '../data/missions';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Award, 
  CheckCircle2, 
  Circle, 
  HelpCircle, 
  Sparkles, 
  X, 
  ArrowRight, 
  BookOpen,
  Check
} from 'lucide-react';

interface MissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: BiosConfigState;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({
  isOpen,
  onClose,
  currentConfig
}) => {
  const [selectedMission, setSelectedMission] = useState<StudentMission>(STUDENT_MISSIONS[0]);
  const [showHint, setShowHint] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  // Verify if a mission is completed given currentConfig
  const isMissionCompleted = (mission: StudentMission): boolean => {
    return Object.entries(mission.targetConfigRequirements).every(([key, expectedVal]) => {
      const actualVal = currentConfig[key];
      if (!actualVal) return false;
      if (Array.isArray(expectedVal)) {
        return expectedVal.includes(actualVal);
      }
      return actualVal === expectedVal;
    });
  };

  const currentIsCompleted = isMissionCompleted(selectedMission);

  const handleClaimSuccess = () => {
    soundManager.playPostSuccessBeep();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const completedCount = STUDENT_MISSIONS.filter(isMissionCompleted).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 text-slate-100">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-emerald-500/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a
              href="https://www.unfantasmaenelsistema.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-emerald-500/60 transition-all shrink-0"
              title="Un Fantasma en el Sistema"
            >
              <img src="/icono.png" alt="Logo" className="w-8 h-8 object-contain" />
            </a>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold font-uefi tracking-wide text-white flex items-center gap-2">
                  Retos y Misiones Educativas de BIOS
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                    {completedCount} / {STUDENT_MISSIONS.length} Completadas
                  </span>
                </h2>
                <a
                  href="https://www.unfantasmaenelsistema.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden md:inline text-[11px] font-mono text-emerald-400 hover:underline"
                >
                  unfantasmaenelsistema.com
                </a>
              </div>
              <p className="text-xs text-slate-400">
                Ponte a prueba configurando la BIOS para resolver problemas reales del mundo laboral y técnico.
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-5">
          
          {/* Mission list */}
          <div className="md:col-span-5 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Lista de Casos Prácticos:
            </h3>

            {STUDENT_MISSIONS.map((mission) => {
              const completed = isMissionCompleted(mission);
              const isSelected = selectedMission.id === mission.id;

              return (
                <button
                  key={mission.id}
                  onClick={() => {
                    soundManager.playKeyTick();
                    setSelectedMission(mission);
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-lg'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-xs truncate">{mission.title}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                        mission.difficulty === 'Fácil' ? 'bg-emerald-500/20 text-emerald-300' :
                        mission.difficulty === 'Intermedio' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-rose-500/20 text-rose-300'
                      }`}>
                        {mission.difficulty}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {mission.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Mission Details Card */}
          <div className="md:col-span-7 bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white font-uefi">{selectedMission.title}</h3>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 ${
                    currentIsCompleted 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}>
                    {currentIsCompleted ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> ¡Cumplida en BIOS!
                      </>
                    ) : (
                      'Pendiente de configurar'
                    )}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {selectedMission.description}
                </p>
              </div>

              {/* Objective */}
              <div className="p-3 bg-slate-900 border border-cyan-500/30 rounded-xl">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                  Objetivo Técnico:
                </span>
                <p className="text-xs text-slate-200">
                  {selectedMission.objective}
                </p>
              </div>

              {/* Required settings breakdown */}
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Requisitos de Configuración Específicos:
                </span>
                <div className="space-y-1.5">
                  {Object.entries(selectedMission.targetConfigRequirements).map(([key, expectedVal]) => {
                    const actualVal = currentConfig[key];
                    const isMatched = Array.isArray(expectedVal)
                      ? expectedVal.includes(actualVal)
                      : actualVal === expectedVal;

                    return (
                      <div 
                        key={key} 
                        className={`p-2 rounded-lg text-xs flex items-center justify-between border ${
                          isMatched 
                            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200' 
                            : 'bg-slate-900/60 border-slate-800 text-slate-400'
                        }`}
                      >
                        <span className="font-mono">{key}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400">Actual: {actualVal}</span>
                          {isMatched ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Technical explanation */}
              <div className="p-3 bg-indigo-950/20 border border-indigo-800/30 rounded-xl text-xs text-indigo-200">
                <span className="font-semibold text-indigo-300 block mb-0.5">Explicación para el Alumno:</span>
                <p className="text-[11px] leading-relaxed">{selectedMission.explanation}</p>
              </div>

              {/* Hint toggle */}
              <div>
                <button
                  onClick={() => {
                    soundManager.playKeyTick();
                    setShowHint(prev => ({ ...prev, [selectedMission.id]: !prev[selectedMission.id] }));
                  }}
                  className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1.5 transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{showHint[selectedMission.id] ? 'Ocultar Pista' : '¿Necesitas una pista?'}</span>
                </button>
                {showHint[selectedMission.id] && (
                  <p className="mt-1.5 p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-cyan-300">
                    💡 {selectedMission.hint}
                  </p>
                )}
              </div>
            </div>

            {/* Bottom action button */}
            <div className="pt-4 border-t border-slate-800 mt-4 flex items-center justify-between">
              {currentIsCompleted ? (
                <button
                  onClick={handleClaimSuccess}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>¡Celebrar Misión Completada!</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    soundManager.playKeyTick();
                    onClose();
                  }}
                  className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-950 transition-colors"
                >
                  <span>Ir a la BIOS y configurar estos parámetros</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>

        </div>

        {/* Footer with website credit */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <a
            href="https://www.unfantasmaenelsistema.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-slate-400 hover:text-emerald-300 transition-colors"
          >
            <img src="/icono.png" alt="Logo" className="w-4 h-4 object-contain" />
            <span>Casos prácticos de formación • <strong>Un Fantasma en el Sistema (www.unfantasmaenelsistema.com)</strong></span>
          </a>
          <span className="text-slate-500">Misiones de Hardware</span>
        </div>

      </div>
    </div>
  );
};
