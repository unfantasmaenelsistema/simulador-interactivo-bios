import React, { useState, useEffect } from 'react';
import { BiosType, BrandKeyInfo } from '../types/bios';
import { soundManager } from '../utils/audio';
import { Terminal, Shield, Cpu, HardDrive, Key, Play } from 'lucide-react';

interface PostScreenProps {
  biosType: BiosType;
  brand?: BrandKeyInfo | null;
  biosVersion?: string;
  onEnterBios: () => void;
  onRebootToPost?: () => void;
}

export const PostScreen: React.FC<PostScreenProps> = ({
  biosType,
  brand,
  biosVersion,
  onEnterBios
}) => {
  const [memoryCount, setMemoryCount] = useState(0);
  const [postStep, setPostStep] = useState(0);
  const [hasEntered, setHasEntered] = useState(false);

  // Trigger POST beep once on mount
  useEffect(() => {
    soundManager.playPostSuccessBeep();
  }, []);

  // Memory counter animation for legacy POST
  useEffect(() => {
    if (biosType === 'legacy') {
      const targetMem = 32768; // 32GB in MB
      const interval = setInterval(() => {
        setMemoryCount((prev) => {
          if (prev >= targetMem) {
            clearInterval(interval);
            setPostStep(3);
            return targetMem;
          }
          return prev + 4096;
        });
      }, 70);
      return () => clearInterval(interval);
    } else {
      // Modern fast sequence
      const timer = setTimeout(() => {
        setPostStep(2);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [biosType]);

  // Keyboard listener for DEL / F2 / Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'F2' || e.key === 'F10' || e.key === 'Enter') {
        e.preventDefault();
        triggerEnterBios();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const triggerEnterBios = () => {
    if (hasEntered) return;
    setHasEntered(true);
    soundManager.playKeyTick();
    setTimeout(() => {
      onEnterBios();
    }, 250);
  };

  const hotkeyText = brand?.biosKey || (biosType === 'legacy' ? 'SUPR / DEL' : 'DEL o F2');

  return (
    <div className="relative w-full h-full min-h-screen bg-black flex flex-col justify-between p-6 select-none font-dos overflow-hidden">
      
      {/* CRT scanlines effect for authentic retro immersion */}
      {biosType === 'legacy' && (
        <div className="absolute inset-0 crt-overlay pointer-events-none z-10 opacity-70" />
      )}

      {/* Main POST Content */}
      <div className="z-20 max-w-5xl mx-auto w-full flex-1 flex flex-col justify-center">
        {biosType === 'legacy' ? (
          /* ================= LEGACY AWARD / PHOENIX POST SCREEN ================= */
          <div className="text-white text-sm md:text-base leading-relaxed tracking-wider space-y-3 font-mono">
            {/* Top Header */}
            <div className="flex justify-between items-start border-b border-white/20 pb-4">
              <div>
                <p className="text-yellow-400 font-bold text-lg">
                  Award Modular BIOS v6.00PG, An Energy Star Ally
                </p>
                <p className="text-slate-400 text-xs">
                  Copyright (C) 1984-2003, Award Software, Inc.
                </p>
                <p className="text-slate-300 text-xs mt-1">
                  MOTHERBOARD: INTEL Z790-PLUS ACPI BIOS Revision 1402
                </p>
              </div>
              <div className="text-right text-xs text-green-400 hidden sm:block border border-green-500/30 p-2 rounded bg-green-950/20">
                <span className="block font-bold">ENERGY STAR</span>
                <span className="text-[10px] text-slate-400">EPA POLLUTION PREVENTER</span>
              </div>
            </div>

            {/* Hardware Detection Lines */}
            <div className="space-y-1.5 pt-2 text-slate-200">
              <p>Main Processor : Intel(R) Core(TM) i7-14700K CPU @ 3.40GHz (16 Cores)</p>
              <p className="flex items-center gap-2">
                <span>Memory Testing :</span>
                <span className="text-cyan-400 font-bold">{memoryCount}K OK</span>
                {memoryCount >= 32768 && <span className="text-green-400 text-xs">[Verificación Completa]</span>}
              </p>
              <p>Primary Master Disk   : NVMe PCIe SSD 1000GB (LBA, ATA-100)</p>
              <p>Primary Slave Disk    : SATA-III WDC WD20EZAZ 2000GB</p>
              <p>Secondary Master Drive : ATAPI DVD-ROM 16X Max</p>
              <p>Legacy USB Devices    : 1 Keyboard, 1 Mouse, 1 Storage Device Detected</p>
            </div>

            {/* POST Status */}
            <div className="pt-6 border-t border-white/20">
              <p className="text-yellow-300 font-bold text-base animate-pulse">
                Presione <span className="underline font-mono text-white bg-blue-900 px-2 py-0.5">{hotkeyText}</span> para entrar al SETUP de la BIOS
              </p>
              <p className="text-slate-500 text-xs mt-1">
                Presione ESC para omitir la prueba de memoria y arrancar el disco duro
              </p>
            </div>
          </div>
        ) : (
          /* ================= MODERN UEFI FAST POST SCREEN ================= */
          <div className="flex flex-col items-center justify-center text-center text-white py-12">
            
            {/* Motherboard / Brand Emblem */}
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-fuchsia-600 p-0.5 shadow-2xl shadow-cyan-500/20">
                <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center p-2">
                  <img src={`${import.meta.env.BASE_URL}icono.png`} alt="Logo Un Fantasma en el Sistema" className="w-16 h-16 object-contain drop-shadow animate-pulse" />
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-cyan-500 text-[10px] font-bold text-black uppercase tracking-wider">
                {biosVersion ? `UEFI ${biosVersion}` : 'UEFI 2.80'}
              </div>
            </div>

            <h1 className="text-3xl font-extrabold tracking-widest font-uefi text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-indigo-400">
              {brand ? brand.brand.toUpperCase() : 'REPUBLIC OF HARDWARE UEFI'}
            </h1>
            <a 
              href="https://www.unfantasmaenelsistema.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-cyan-300 hover:text-white font-mono mt-1 tracking-widest flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Un Fantasma en el Sistema • www.unfantasmaenelsistema.com</span>
            </a>

            {/* Spinner */}
            <div className="my-8 flex items-center gap-3 text-slate-400 text-xs font-mono">
              <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <span>Inicializando buses PCIe, memoria DDR4 y firmware de seguridad...</span>
            </div>

            {/* Prompt */}
            <div className="bg-slate-900/80 border border-cyan-500/40 rounded-2xl p-5 max-w-md w-full shadow-2xl shadow-cyan-950">
              <p className="text-xs uppercase tracking-wider text-cyan-400 font-semibold mb-2">
                Instrucción de Arranque
              </p>
              <p className="text-lg font-bold text-white mb-2">
                Presiona <span className="px-2.5 py-1 bg-cyan-950 border border-cyan-400 text-cyan-300 rounded font-mono">{hotkeyText}</span> para entrar al SETUP
              </p>
              <p className="text-xs text-slate-400">
                {brand ? brand.description : 'Accede a la interfaz visual de configuración UEFI.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Bottom Control Bar */}
      <div className="z-20 max-w-5xl mx-auto w-full pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="text-slate-400 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>
            {biosType === 'legacy' ? 'Simulando BIOS Clásica (Legacy MBR)' : 'Simulando BIOS Moderna (UEFI GPT)'}
          </span>
          {brand && (
            <span className="text-cyan-300 font-mono">
              • Marca: {brand.brand}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={triggerEnterBios}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-cyan-950 flex items-center gap-2 transition-all transform hover:scale-[1.02]"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Pulsar tecla [{hotkeyText}] y Entrar a BIOS</span>
          </button>
        </div>
      </div>

    </div>
  );
};
