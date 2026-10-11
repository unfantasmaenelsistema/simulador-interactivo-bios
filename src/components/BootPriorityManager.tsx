import React, { useState } from 'react';
import { BiosType, BiosConfigState } from '../types/bios';
import { soundManager } from '../utils/audio';
import { 
  HardDrive, 
  GripVertical, 
  ArrowUp, 
  ArrowDown, 
  RotateCcw, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  HelpCircle, 
  Info, 
  Radio, 
  Disc, 
  Sparkles 
} from 'lucide-react';

export interface BootDevice {
  id: string;
  biosConfigVal: string;
  name: string;
  shortLabel: string;
  type: 'nvme' | 'usb' | 'hdd' | 'network' | 'optical';
  latencySeconds: number;
  description: string;
  startupImpact: string;
  recommendation: string;
}

const DEFAULT_BOOT_DEVICES: BootDevice[] = [
  {
    id: 'nvme_ssd',
    biosConfigVal: 'Windows Boot Manager (NVMe SSD)',
    name: 'Windows Boot Manager (Samsung 990 PRO NVMe SSD 1TB)',
    shortLabel: 'NVMe SSD 1TB (PCIe 4.0)',
    type: 'nvme',
    latencySeconds: 4.8,
    description: 'Unidad de estado sólido M.2 PCIe Gen 4 x4 conectada directamente a los carriles del procesador.',
    startupImpact: 'Latencia mínima: 0 ms de giro mecánico. Carga los archivos binarios del cargador de Windows (bootx64.efi) de forma instantánea a más de 7000 MB/s.',
    recommendation: 'Recomendado como #1 para uso diario.'
  },
  {
    id: 'usb_flash',
    biosConfigVal: 'USB Flash Drive (UEFI Installer)',
    name: 'Kingston DataTraveler 32GB (Live USB / Instalador)',
    shortLabel: 'USB Flash Drive 32GB',
    type: 'usb',
    latencySeconds: 7.2,
    description: 'Memoria USB conectada al bus USB 3.2 de la placa base.',
    startupImpact: 'Añade 2.4s de tiempo de inicialización de la controladora xHCI USB. Si contiene un instalador, iniciará la instalación del sistema operativo.',
    recommendation: 'Colocar como #1 solo cuando se vaya a formatear o reparar el equipo.'
  },
  {
    id: 'sata_hdd',
    biosConfigVal: 'SATA HDD 2TB (Almacenamiento)',
    name: 'WDC WD20EZAZ SATA-III 2TB 5400 RPM (Disco Secundario)',
    shortLabel: 'SATA HDD 2TB (Mecánico)',
    type: 'hdd',
    latencySeconds: 16.5,
    description: 'Disco duro tradicional de platos magnéticos conectado por cable SATA de 6 Gbps.',
    startupImpact: 'Añade ~11.5s de retardo. El motor del disco debe acelerar los platos de 0 a 5400 RPM (tiempo de spin-up) y calibrar los cabezales antes de responder a la BIOS.',
    recommendation: 'Mantener después del SSD para evitar esperas innecesarias.'
  },
  {
    id: 'pxe_network',
    biosConfigVal: 'Network Boot (PXE IPv4/IPv6)',
    name: 'Intel I225-V 2.5GbE LAN (Arranque PXE de Red)',
    shortLabel: 'Red PXE Ethernet (DHCP)',
    type: 'network',
    latencySeconds: 26.0,
    description: 'Inicialización de la pila de red UEFI y envío de solicitudes DHCP para localizar un servidor TFTP/WDS.',
    startupImpact: 'Añade ~21.2s de retraso crítico. El firmware esperará varias respuestas de red local antes de rendirse y pasar al siguiente dispositivo.',
    recommendation: 'Útil solo en empresas o aulas con arranque centralizado. En uso doméstico debe estar al final o desactivado.'
  },
  {
    id: 'optical_dvd',
    biosConfigVal: 'ATAPI DVD-ROM 16X',
    name: 'HL-DT-ST DVDRAM SATA 16X (Unidad Óptica)',
    shortLabel: 'DVD-ROM 16X SATA',
    type: 'optical',
    latencySeconds: 9.8,
    description: 'Lector óptico de CD/DVD conectado al puerto SATA.',
    startupImpact: 'Añade ~5.0s comprobando si la bandeja contiene un disco grabado con sector El Torito ejecutable.',
    recommendation: 'Secundario o desactivado.'
  }
];

interface BootPriorityManagerProps {
  config: BiosConfigState;
  onChangeOption: (optionId: string, newValue: string) => void;
  biosType: BiosType;
  compact?: boolean;
}

export const BootPriorityManager: React.FC<BootPriorityManagerProps> = ({
  config,
  onChangeOption,
  biosType,
  compact = false
}) => {
  // Initialize device order based on current config priority 1 & 2
  const [deviceList, setDeviceList] = useState<BootDevice[]>(() => {
    const p1 = config['boot_priority_1'] || 'Windows Boot Manager (NVMe SSD)';
    const p2 = config['boot_priority_2'] || 'USB Flash Drive (UEFI Installer)';

    const sorted = [...DEFAULT_BOOT_DEVICES];
    // Put matching p1 first
    const idx1 = sorted.findIndex(d => d.biosConfigVal === p1);
    if (idx1 > 0) {
      const [item1] = sorted.splice(idx1, 1);
      sorted.unshift(item1);
    }
    // Put matching p2 second
    const idx2 = sorted.findIndex((d, i) => i > 0 && d.biosConfigVal === p2);
    if (idx2 > 1) {
      const [item2] = sorted.splice(idx2, 1);
      sorted.splice(1, 0, item2);
    }
    return sorted;
  });

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<BootDevice>(deviceList[0]);

  // Sync with BIOS config when order changes
  const applyNewOrder = (newList: BootDevice[]) => {
    setDeviceList(newList);
    soundManager.playValueChangeSound();
    
    // Update BIOS options
    if (newList[0]) {
      onChangeOption('boot_priority_1', newList[0].biosConfigVal);
    }
    if (newList[1]) {
      onChangeOption('boot_priority_2', newList[1].biosConfigVal);
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const updated = [...deviceList];
    const [movedItem] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, movedItem);

    setDraggedIndex(null);
    applyNewOrder(updated);
  };

  // Keyboard / Button move helpers
  const moveItem = (fromIndex: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (targetIndex < 0 || targetIndex >= deviceList.length) return;

    const updated = [...deviceList];
    const [movedItem] = updated.splice(fromIndex, 1);
    updated.splice(targetIndex, 0, movedItem);

    applyNewOrder(updated);
  };

  // Presets
  const applyFastSsdPreset = () => {
    const updated = [...deviceList];
    const ssdIdx = updated.findIndex(d => d.type === 'nvme');
    if (ssdIdx > 0) {
      const [ssd] = updated.splice(ssdIdx, 1);
      updated.unshift(ssd);
    }
    applyNewOrder(updated);
  };

  const applyUsbInstallPreset = () => {
    const updated = [...deviceList];
    const usbIdx = updated.findIndex(d => d.type === 'usb');
    if (usbIdx > 0) {
      const [usb] = updated.splice(usbIdx, 1);
      updated.unshift(usb);
    }
    applyNewOrder(updated);
  };

  const applyPxeNetworkPreset = () => {
    const updated = [...deviceList];
    const pxeIdx = updated.findIndex(d => d.type === 'network');
    if (pxeIdx > 0) {
      const [pxe] = updated.splice(pxeIdx, 1);
      updated.unshift(pxe);
    }
    applyNewOrder(updated);
  };

  // Calculate estimated total startup time based on priority order
  // Primary device boots. If primary is slow or network, time increases drastically!
  const firstDevice = deviceList[0];
  let calculatedStartupTime = firstDevice ? firstDevice.latencySeconds : 5.0;

  // Add Fast Boot modifier
  const fastBoot = config['fast_boot'] || 'Enabled';
  if (fastBoot.includes('Ultra Fast')) {
    calculatedStartupTime -= 1.2;
  } else if (fastBoot.includes('Disabled')) {
    calculatedStartupTime += 4.5;
  }
  calculatedStartupTime = Number(Math.max(3.8, calculatedStartupTime).toFixed(1));

  const isLegacy = biosType === 'legacy';

  return (
    <div className={`rounded-2xl border p-4 shadow-xl select-none ${
      isLegacy 
        ? 'bg-[#000088] border-yellow-400 text-white font-dos' 
        : 'bg-slate-900/90 border-slate-800 text-slate-100 font-sans'
    }`}>
      
      {/* Header & Estimated Time Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-3 mb-4 border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <HardDrive className={`w-5 h-5 ${isLegacy ? 'text-yellow-300' : 'text-cyan-400'}`} />
            <h3 className="text-base font-bold tracking-wide">
              {isLegacy ? 'ORDEN DE PRIORIDAD DE ARRANQUE (BOOT SEQUENCE)' : 'Gestor Visual de Prioridad de Arranque (Drag & Drop)'}
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Arrastra los dispositivos o usa las flechas para cambiar qué medio revisa la BIOS primero.
          </p>
        </div>

        {/* Estimated Startup Time Widget */}
        <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2.5 ${
          calculatedStartupTime > 20 
            ? 'bg-rose-950/40 border-rose-500/50 text-rose-300' 
            : calculatedStartupTime > 10 
            ? 'bg-amber-950/40 border-amber-500/50 text-amber-300' 
            : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
        }`}>
          <Clock className="w-4 h-4 shrink-0" />
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold tracking-wider block">
              Tiempo Estimado de Arranque:
            </span>
            <span className="text-base font-extrabold font-mono">
              {calculatedStartupTime} s
            </span>
          </div>
        </div>
      </div>

      {/* Main Drag-and-Drop Area & Device Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: Reorderable List (7 Cols) */}
        <div className="lg:col-span-7 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1 px-1">
            <span className="font-semibold uppercase tracking-wider text-[11px]">
              Posición y Dispositivo de Arranque
            </span>
            <span className="text-[11px] text-slate-500">
              Arrastra o pulsa [↑] [↓]
            </span>
          </div>

          <div className="space-y-2">
            {deviceList.map((device, index) => {
              const isFirst = index === 0;
              const isSecond = index === 1;
              const isSelected = selectedDevice.id === device.id;

              return (
                <div
                  key={device.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onClick={() => {
                    soundManager.playKeyTick();
                    setSelectedDevice(device);
                  }}
                  className={`p-2.5 rounded-xl border transition-all cursor-grab active:cursor-grabbing flex items-center justify-between gap-3 ${
                    draggedIndex === index ? 'opacity-40 scale-95 border-dashed border-cyan-400' : ''
                  } ${
                    isFirst 
                      ? 'bg-cyan-950/50 border-cyan-400 ring-1 ring-cyan-400/50 shadow-lg shadow-cyan-950/40 text-white' 
                      : isSecond 
                      ? 'bg-slate-950/80 border-slate-700 text-slate-200' 
                      : 'bg-slate-950/50 border-slate-800/80 text-slate-400 hover:bg-slate-900'
                  } ${isSelected ? 'ring-2 ring-indigo-500' : ''}`}
                >
                  {/* Drag Handle & Position Badge */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="text-slate-500 hover:text-white cursor-grab p-1">
                      <GripVertical className="w-4 h-4" />
                    </div>

                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                      isFirst 
                        ? 'bg-cyan-500 text-black shadow-md shadow-cyan-950 font-extrabold' 
                        : isSecond 
                        ? 'bg-slate-800 text-cyan-300' 
                        : 'bg-slate-900 text-slate-500'
                    }`}>
                      #{index + 1}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs truncate text-white">
                          {device.shortLabel}
                        </span>
                        {isFirst && (
                          <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-bold">
                            PRIORIDAD #1 (ACTIVO)
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 truncate block">
                        {device.name}
                      </span>
                    </div>
                  </div>

                  {/* Reorder Buttons & Latency Badge */}
                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <span className="text-[11px] font-mono text-slate-400 mr-1 hidden sm:inline">
                      +{device.latencySeconds}s
                    </span>

                    <button
                      disabled={index === 0}
                      onClick={() => moveItem(index, 'up')}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white disabled:opacity-25 transition-colors"
                      title="Mover arriba"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>

                    <button
                      disabled={index === deviceList.length - 1}
                      onClick={() => moveItem(index, 'down')}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white disabled:opacity-25 transition-colors"
                      title="Mover abajo"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Preset Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 text-[11px]">Plantillas de prueba:</span>
            <button
              onClick={applyFastSsdPreset}
              className="px-2.5 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-700/50 text-cyan-300 font-medium text-[11px] transition-colors"
            >
              🚀 Recomendado (SSD #1)
            </button>
            <button
              onClick={applyUsbInstallPreset}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
            >
              💾 Instalación (USB #1)
            </button>
            <button
              onClick={applyPxeNetworkPreset}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
            >
              🌐 Laboratorio (Red PXE #1)
            </button>
          </div>
        </div>

        {/* Right Column: Educational Hardware Impact Inspector (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between text-xs space-y-3">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
              <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                <Info className="w-4 h-4 text-cyan-400" />
                <span>Impacto Técnico del Dispositivo</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-cyan-400">
                {selectedDevice.type.toUpperCase()}
              </span>
            </div>

            <div className="space-y-2.5">
              <div>
                <span className="text-white font-bold block text-sm">
                  {selectedDevice.name}
                </span>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                  {selectedDevice.description}
                </p>
              </div>

              {/* Startup Impact Breakdown */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                  Impacto en Tiempo de Arranque:
                </span>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {selectedDevice.startupImpact}
                </p>
              </div>

              {/* Recommendation */}
              <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-800/40 text-cyan-200">
                <span className="font-bold text-cyan-300 block mb-0.5 text-[11px] uppercase tracking-wider">
                  Consejo del Profesor / Técnico:
                </span>
                <p className="text-xs leading-relaxed">
                  {selectedDevice.recommendation}
                </p>
              </div>
            </div>
          </div>

          {/* Educational Note about Network PXE & Spin-up */}
          {firstDevice.type === 'network' && (
            <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/50 text-rose-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-[11px]">
                <strong>¡Alerta de Retardo de Arranque!:</strong> Al poner la Red PXE de primera, el equipo tardará más de 25 segundos antes de mostrar el escritorio esperando una respuesta de red.
              </div>
            </div>
          )}

          {firstDevice.type === 'nvme' && (
            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-200 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-[11px]">
                <strong>Arranque Eficiente:</strong> La CPU localiza el gestor de arranque en NVMe SSD en menos de 5 segundos.
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
