import { BiosProfile } from '../types/bios';
import { INITIAL_CONFIG } from './biosOptions';

export const PRESET_PROFILES: BiosProfile[] = [
  {
    id: 'preset-defaults',
    name: 'Valores de Fábrica (Safe Defaults)',
    description: 'Configuración estándar segura de fábrica sin overclocking ni optimizaciones agresivas. Ideal para diagnosticar problemas de arranque.',
    biosType: 'modern',
    createdAt: '2026-10-11',
    author: 'Sistema BIOS',
    isPreset: true,
    config: {
      ...INITIAL_CONFIG,
      'xmp_docp': 'Disabled (JEDEC 2133/2666 MHz)',
      'cpu_ratio': 'Auto (Stock)',
      'cpu_voltage': 'Auto',
      'fan_profile': 'Standard (Equilibrado)',
      'csm_support': 'Disabled',
      'secure_boot': 'Enabled (Solo Firmas Autorizadas)',
      'tpm_device': 'Enabled (Firmware TPM 2.0)',
      'fast_boot': 'Enabled',
      'rebar_support': 'Auto',
      'c_states': 'Enabled'
    }
  },
  {
    id: 'preset-gaming-oc',
    name: 'Perfil Gaming Máximo Rendimiento',
    description: 'Optimizado para jugadores y creadores: Perfil XMP DDR4-3600 CL16 activo, Resizable BAR, Multiplicador x48 y curva de ventilador Turbo para bajas temperaturas.',
    biosType: 'modern',
    createdAt: '2026-10-11',
    author: 'Profesor de Hardware',
    isPreset: true,
    config: {
      ...INITIAL_CONFIG,
      'xmp_docp': 'Profile 1 (DDR4-3600 CL16 / 1.35V)',
      'cpu_ratio': 'All Core x48 (4.8 GHz)',
      'cpu_voltage': 'Manual 1.250V (Estable)',
      'fan_profile': 'Turbo (Alto Flujo de Aire)',
      'rebar_support': 'Auto (Habilitado si GPU compatible)',
      'above_4g_decoding': 'Enabled',
      'fast_boot': 'Enabled',
      'csm_support': 'Disabled (Modo UEFI Puro)',
      'secure_boot': 'Enabled (Solo Firmas Autorizadas)',
      'tpm_device': 'Enabled (Firmware TPM 2.0)',
      'c_states': 'Enabled'
    }
  },
  {
    id: 'preset-virtualization',
    name: 'Servidor y Virtualización Pro',
    description: 'Configurado para Proxmox, VMware ESXi o Docker: Virtualización VT-x habilitada, IOMMU/VT-d activo para GPU Passthrough y reanudación automática tras apagón.',
    biosType: 'modern',
    createdAt: '2026-10-11',
    author: 'Administrador de Sistemas',
    isPreset: true,
    config: {
      ...INITIAL_CONFIG,
      'virtualization_tech': 'Enabled (Habilitado)',
      'iommu_vtd': 'Enabled',
      'hyper_threading': 'Enabled (Habilitado)',
      'power_loss_action': 'Power On (Encenderse Automáticamente)',
      'wake_on_lan': 'Enabled (Encendido por Magic Packet)',
      'sata_mode': 'AHCI (Advanced Host Controller Interface)',
      'csm_support': 'Disabled (Modo UEFI Puro)',
      'fan_profile': 'Standard (Equilibrado)',
      'secure_boot': 'Enabled (Solo Firmas Autorizadas)'
    }
  },
  {
    id: 'preset-eco-silent',
    name: 'Oficina ECO & Ultralsilencioso',
    description: 'Ahorro energético máximo y cero ruido: Undervolting de -0.050V, perfil de ventilador Silent, C-States activos y apagado de puertos USB en reposo (ErP Ready).',
    biosType: 'modern',
    createdAt: '2026-10-11',
    author: 'Técnico Medioambiental',
    isPreset: true,
    config: {
      ...INITIAL_CONFIG,
      'cpu_ratio': 'Auto (Stock)',
      'cpu_voltage': 'Offset -0.050V (Undervolting Eficiente)',
      'fan_profile': 'Silent (Silencioso)',
      'c_states': 'Enabled (Ahorro de Energía Inteligente)',
      'erp_ready': 'Enabled S4+S5 (Consumo <0.5W, USBs apagados)',
      'fast_boot': 'Enabled',
      'wake_on_lan': 'Disabled',
      'xmp_docp': 'Profile 2 (DDR4-3200 CL14 / 1.35V)'
    }
  },
  {
    id: 'preset-legacy-compat',
    name: 'Compatibilidad Legacy MBR / Retro OS',
    biosType: 'legacy',
    description: 'Modo tradicional de compatibilidad: Módulo CSM habilitado, Secure Boot desactivado e inicialización de periféricos antiguos para arrancar sistemas en partición MBR.',
    createdAt: '2026-10-11',
    author: 'Especialista en Mantenimiento',
    isPreset: true,
    config: {
      ...INITIAL_CONFIG,
      'csm_support': 'Enabled (Compatibilidad Legacy MBR)',
      'secure_boot': 'Disabled (Permite Cualquier Bootloader)',
      'tpm_device': 'Disabled (Desactivado)',
      'sata_mode': 'AHCI (Advanced Host Controller Interface)',
      'fast_boot': 'Disabled (POST Completo y Minucioso)',
      'quick_power_on_self_test': 'Enabled'
    }
  }
];
