import React, { useState } from 'react';
import { BRAND_BIOS_KEYS, GENERAL_BIOS_TIPS } from '../data/biosKeys';
import { BrandKeyInfo } from '../types/bios';
import { soundManager } from '../utils/audio';
import { Search, Monitor, Key, Sparkles, AlertCircle, X, ArrowRight, Laptop } from 'lucide-react';

interface BrandKeysModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBrandForPost?: (brand: BrandKeyInfo) => void;
}

export const BrandKeysModal: React.FC<BrandKeysModalProps> = ({
  isOpen,
  onClose,
  onSelectBrandForPost
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<BrandKeyInfo | null>(BRAND_BIOS_KEYS[0]);

  if (!isOpen) return null;

  const filteredBrands = BRAND_BIOS_KEYS.filter(b => 
    b.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.biosKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a
              href="https://www.unfantasmaenelsistema.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-cyan-500/60 transition-all shrink-0"
              title="Un Fantasma en el Sistema"
            >
              <img src={`${import.meta.env.BASE_URL}icono.png`} alt="Logo" className="w-8 h-8 object-contain" />
            </a>
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-uefi tracking-wide text-white flex items-center gap-2">
                  Guía de Teclas de Acceso a BIOS (BIOS Keys)
                  <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                    Referencia Técnica
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
                Aprende qué tecla presionar según el fabricante del equipo o placa base para ingresar a la configuración o al menú de arranque.
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-12 gap-5">
          
          {/* Brand list sidebar */}
          <div className="md:col-span-5 flex flex-col gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar marca (ASUS, HP, Dell, Lenovo...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            <div className="space-y-1.5 overflow-y-auto max-h-[380px] pr-1">
              {filteredBrands.map((brand) => {
                const isSelected = selectedBrand?.brand === brand.brand;
                return (
                  <button
                    key={brand.brand}
                    onClick={() => {
                      soundManager.playKeyTick();
                      setSelectedBrand(brand);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-lg shadow-cyan-950/50'
                        : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Laptop className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                      <span className="font-medium text-sm">{brand.brand}</span>
                    </div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-cyan-900/50">
                      {brand.biosKey.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
              {filteredBrands.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No se encontraron marcas con ese término.
                </div>
              )}
            </div>
          </div>

          {/* Brand Detail view */}
          <div className="md:col-span-7 flex flex-col justify-between bg-slate-950/70 border border-slate-800 rounded-2xl p-5">
            {selectedBrand ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      {selectedBrand.brand}
                    </h3>
                    <p className="text-xs text-slate-400">{selectedBrand.description}</p>
                  </div>
                </div>

                {/* Key Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-cyan-500/30">
                    <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider block mb-1">
                      Tecla de Acceso a BIOS / UEFI
                    </span>
                    <span className="text-base font-bold font-mono text-white bg-slate-950 px-2.5 py-1 rounded inline-block border border-slate-800">
                      {selectedBrand.biosKey}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1.5">
                      Pulsar intermitentemente nada más encender el equipo.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-indigo-500/30">
                    <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider block mb-1">
                      Menú de Arranque (Boot Menu)
                    </span>
                    <span className="text-base font-bold font-mono text-white bg-slate-950 px-2.5 py-1 rounded inline-block border border-slate-800">
                      {selectedBrand.bootMenuKey}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1.5">
                      Permite elegir disco o USB puntual sin entrar a la BIOS.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-amber-500/30 sm:col-span-2">
                    <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block mb-1">
                      Recuperación del Sistema / Utilidad Firmware
                    </span>
                    <span className="text-sm font-bold font-mono text-slate-200">
                      {selectedBrand.recoveryKey}
                    </span>
                  </div>
                </div>

                {/* Pro Tips */}
                <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-800/40 text-xs text-cyan-200/90 flex gap-2.5">
                  <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-cyan-300 block mb-0.5">Consejo del Técnico:</span>
                    {selectedBrand.tips}
                  </div>
                </div>

                {/* Simulated POST with this brand */}
                {onSelectBrandForPost && (
                  <button
                    onClick={() => {
                      soundManager.playKeyTick();
                      onSelectBrandForPost(selectedBrand);
                    }}
                    className="w-full mt-2 py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-cyan-950"
                  >
                    <span>Simular Encendido de este equipo ({selectedBrand.brand})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-16 text-slate-500">
                Selecciona una marca para ver sus teclas de configuración.
              </div>
            )}
          </div>
        </div>

        {/* Footer with general troubleshooting tips and brand link */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-col md:flex-row gap-3 items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <a
              href="https://www.unfantasmaenelsistema.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-slate-300 hover:text-cyan-300 transition-colors"
            >
              <img src={`${import.meta.env.BASE_URL}icono.png`} alt="Logo" className="w-5 h-5 object-contain" />
              <span className="font-semibold">Un Fantasma en el Sistema</span>
            </a>
            <span className="hidden sm:inline text-slate-600">•</span>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <AlertCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span><strong>Tip:</strong> Mayús + Reiniciar para entrar directo en UEFI.</span>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playKeyTick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Entendido, volver
          </button>
        </div>

      </div>
    </div>
  );
};
