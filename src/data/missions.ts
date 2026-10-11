import { StudentMission } from '../types/bios';

export const STUDENT_MISSIONS: StudentMission[] = [
  {
    id: 'mission-win11',
    title: 'Misión 1: Requisitos de Windows 11',
    difficulty: 'Fácil',
    description: 'Un cliente necesita actualizar su equipo a Windows 11, pero el instalador de Microsoft arroja el error: "Este equipo no cumple con los requisitos mínimos de hardware".',
    objective: 'Configura la BIOS para cumplir los tres requisitos críticos de Windows 11: Activar TPM 2.0, Desactivar CSM (UEFI puro) y Activar Secure Boot.',
    targetConfigRequirements: {
      'tpm_device': ['Enabled (Firmware TPM 2.0)', 'Discrete TPM (Módulo Físico SPI/LPC)'],
      'csm_support': 'Disabled (Modo UEFI Puro)',
      'secure_boot': 'Enabled (Solo Firmas Autorizadas)'
    },
    explanation: 'Windows 11 exige el estándar UEFI moderno (sin soporte CSM de emulación de 16 bits), Secure Boot para evitar rootkits en el arranque y un procesador criptográfico TPM 2.0 para salvaguardar claves y BitLocker.',
    hint: 'Busca en las pestañas "Security" (para TPM y Secure Boot) y "Boot" (para CSM Support).'
  },
  {
    id: 'mission-xmp',
    title: 'Misión 2: Activar Perfil de Memoria XMP / DOCP',
    difficulty: 'Fácil',
    description: 'Has comprado dos módulos de memoria RAM de 3600 MHz, pero en el Administrador de Tareas de Windows aparecen funcionando a tan solo 2133 MHz.',
    objective: 'Activa el perfil X.M.P. / D.O.C.P. en Profile 1 para desbloquear el ancho de banda y reducir la latencia.',
    targetConfigRequirements: {
      'xmp_docp': 'Profile 1 (DDR4-3600 CL16 / 1.35V)'
    },
    explanation: 'Por normativa del estándar JEDEC, las memorias siempre arrancan a la frecuencia base mínima segura. Para aprovechar la velocidad anunciada en la caja, el usuario debe habilitar explícitamente el perfil XMP/EXPO en la BIOS.',
    hint: 'En la BIOS Moderna, entra en "Ai Tweaker / OC" o usa el interruptor rápido de XMP en EZ Mode.'
  },
  {
    id: 'mission-virtualization',
    title: 'Misión 3: Entorno para Docker y Máquinas Virtuales',
    difficulty: 'Intermedio',
    description: 'El departamento de desarrollo necesita levantar contenedores con Docker Desktop y máquinas virtuales en VirtualBox, pero las aplicaciones devuelven el error "VT-x/AMD-V is disabled in BIOS".',
    objective: 'Habilita la tecnología de virtualización de hardware (VT-x / AMD-V) y la protección IOMMU / VT-d.',
    targetConfigRequirements: {
      'virtualization_tech': 'Enabled (Habilitado)',
      'iommu_vtd': 'Enabled'
    },
    explanation: 'Las extensiones VT-x y AMD-V permiten que el hipervisor ejecute el sistema invitado directamente en el procesador físico sin traducción costosa por software, acelerando las VMs de forma colosal.',
    hint: 'Revisa la pestaña "Advanced" (Configuración avanzada de CPU y Chipset).'
  },
  {
    id: 'mission-fast-boot',
    title: 'Misión 4: Optimización de Tiempo de Arranque',
    difficulty: 'Intermedio',
    description: 'El ordenador de un directivo tarda casi medio minuto en arrancar. Quiere que esté en el escritorio en menos de 7 segundos.',
    objective: 'Activa Fast Boot, asegúrate de que el primer dispositivo de arranque sea el NVMe SSD (Windows Boot Manager) y desactiva comprobaciones redundantes.',
    targetConfigRequirements: {
      'fast_boot': ['Enabled (Omitir Comprobaciones Secundarias)', 'Ultra Fast (Solo Dispositivos de Inicio)'],
      'boot_priority_1': 'Windows Boot Manager (NVMe SSD)',
      'csm_support': 'Disabled (Modo UEFI Puro)'
    },
    explanation: 'Omitir la inicialización de puertos no usados y saltarse la búsqueda de red PXE recorta drásticamente el tiempo de POST.',
    hint: 'Dirígete a la pestaña "Boot" y revisa las prioridades de arranque y la opción Fast Boot.'
  },
  {
    id: 'mission-gaming-rebar',
    title: 'Misión 5: Rendimiento Gráfico Máximo (Resizable BAR)',
    difficulty: 'Avanzado',
    description: 'El alumno quiere exprimir al máximo una tarjeta gráfica moderna activando Resizable BAR / SAM para que la CPU acceda a toda la memoria VRAM simultáneamente.',
    objective: 'Para que Resizable BAR funcione correctamente, debes activar Resizable BAR, activar Above 4G Decoding y tener CSM Support deshabilitado (UEFI Puro).',
    targetConfigRequirements: {
      'rebar_support': 'Auto (Habilitado si GPU compatible)',
      'above_4g_decoding': 'Enabled',
      'csm_support': 'Disabled (Modo UEFI Puro)'
    },
    explanation: 'Resizable BAR requiere espacio de direccionamiento MMIO de 64 bits por encima de los 4GB y no puede coexistir con el módulo de compatibilidad CSM.',
    hint: 'Encuentra "Resizable BAR" y "Above 4G Decoding" en la pestaña "Advanced", y confirma en "Boot" que CSM esté apagado.'
  }
];
