import { BiosOption } from '../types/bios';

export const BIOS_OPTIONS: BiosOption[] = [
  // ================= MAIN =================
  {
    id: 'system_date',
    label: 'System Date (Fecha del Sistema)',
    category: 'Main',
    availableIn: ['legacy', 'modern'],
    defaultValue: '10/11/2026',
    options: ['10/11/2026', '01/01/2026', '12/31/2025', '01/01/2000'],
    description: 'Configura la fecha en el chip RTC (Real-Time Clock) de la placa base, respaldado por la pila de botón CR2032.',
    purpose: 'Mantiene la sincronía temporal del hardware antes de cargar el sistema operativo. Si la pila se agota, la fecha se restablece al año de fabricación.',
    hardwareImpact: {
      cpuPerformance: 'Nulo. No afecta a la frecuencia ni cómputo de la CPU.',
      ramPerformance: 'Nulo.',
      bootTime: 'Sin impacto directo en velocidad.',
      temperatures: 'Sin impacto térmico.',
      powerConsumption: 'Mínimo consumo en reposo suministrado por la batería CR2032 (3V).',
      security: 'Crítico: una fecha desfasada invalida certificados SSL/HTTPS de navegación y firmas criptográficas de arranque.',
      stability: 'Totalmente seguro.'
    },
    recommendedFor: 'Mantener siempre actualizada con la hora real local.',
    technicalNotes: 'Cuando un PC pierde la fecha al desconectarlo de la pared, indica que la pila CR2032 ha caído por debajo de 2.8V y debe ser sustituida.'
  },
  {
    id: 'system_time',
    label: 'System Time (Hora del Sistema)',
    category: 'Main',
    availableIn: ['legacy', 'modern'],
    defaultValue: '14:30:00',
    options: ['14:30:00', '00:00:00', '08:00:00', '12:00:00'],
    description: 'Ajusta la hora militar (HH:MM:SS) almacenada en el oscilador de cuarzo de 32.768 kHz de la placa madre.',
    purpose: 'Establece la marca de tiempo base con la que el kernel del sistema operativo iniciará su reloj interno.',
    hardwareImpact: {
      cpuPerformance: 'Nulo.',
      ramPerformance: 'Nulo.',
      bootTime: 'Sin impacto.',
      temperatures: 'Sin variación.',
      powerConsumption: 'Sin variación.',
      security: 'Evita errores de autenticación Kerberos en dominios Windows Active Directory.',
      stability: 'Alta estabilidad.'
    },
    recommendedFor: 'Configurar en hora UTC o local según el sistema operativo.'
  },
  {
    id: 'bios_language',
    label: 'System Language (Idioma de la Interfaz)',
    category: 'Main',
    availableIn: ['modern'],
    defaultValue: 'Español',
    options: ['Español', 'English', 'Deutsch', 'Français', '日本語'],
    description: 'Selecciona el idioma del firmware UEFI para los textos y menús de ayuda.',
    purpose: 'Facilita la navegación para técnicos y estudiantes en su lengua nativa.',
    hardwareImpact: {
      cpuPerformance: 'Nulo.',
      ramPerformance: 'Nulo.',
      bootTime: 'Sin impacto.',
      temperatures: 'Sin cambio.',
      powerConsumption: 'Sin cambio.',
      security: 'Neutral.',
      stability: 'Estable.'
    },
    recommendedFor: 'Español para aprendizaje didáctico.'
  },

  // ================= AI TWEAKER / OVERCLOCKING =================
  {
    id: 'xmp_docp',
    label: 'X.M.P. / D.O.C.P. / EXPO Profile',
    category: 'Ai_Tweaker',
    availableIn: ['modern'],
    defaultValue: 'Disabled',
    options: ['Disabled (JEDEC 2133/2666 MHz)', 'Profile 1 (DDR4-3600 CL16 / 1.35V)', 'Profile 2 (DDR4-3200 CL14 / 1.35V)'],
    description: 'Extreme Memory Profile (Intel) / DOCP/EXPO (AMD). Lee los perfiles overclock de fábrica pregrabados por el fabricante en el chip SPD de los módulos de RAM.',
    purpose: 'Permite que las memorias RAM funcionen a su velocidad comercial prometida (ej. 3200 o 3600 MHz) en lugar de la velocidad genérica y lenta JEDEC (2133 o 2400 MHz).',
    hardwareImpact: {
      cpuPerformance: '+5% a +12% en IPC y respuesta del procesador gracias a un controlador de memoria más rápido (Infinity Fabric en AMD / Ring Bus en Intel).',
      ramPerformance: 'Aumento masivo de ancho de banda (+35% a +50% en GB/s) y reducción drástica de latencia (baja de ~85ns a ~64ns).',
      gpuPerformance: '+8% a +18% FPS mínimos (1% low) en juegos dependientes de CPU y memoria.',
      bootTime: 'Puede añadir 1-2 segundos en el primer POST para el entrenamiento de memoria (Memory Training).',
      temperatures: 'Aumento leve de temperatura en los módulos de RAM y el SoC (+3°C a +5°C).',
      powerConsumption: 'Aumenta el voltaje DRAM de 1.20V estándar a 1.35V - 1.40V (~3W a 5W extra).',
      security: 'Neutral.',
      stability: 'Requiere que la placa y la CPU soporten la frecuencia. En kits incompatibles puede causar bucles de reinicio (Boot Loop).'
    },
    recommendedFor: 'Cualquier equipo de juegos o trabajo multimedia. ¡Indispensable tras armar un PC nuevo!',
    warning: 'Si el equipo no arranca tras activarlo, la placa base restaurará los valores JEDEC por seguridad o requerirá un Clear CMOS.',
    technicalNotes: 'Más del 60% de los usuarios compran RAM rápida pero la usan durante años a 2133 MHz por no entrar a la BIOS a encender esta opción.'
  },
  {
    id: 'cpu_ratio',
    label: 'CPU Core Ratio (Multiplicador de CPU)',
    category: 'Ai_Tweaker',
    availableIn: ['modern'],
    defaultValue: 'Auto (Stock)',
    options: ['Auto (Stock x42 - 4.2 GHz)', 'All Core x45 (4.5 GHz)', 'All Core x48 (4.8 GHz)', 'All Core x51 (5.1 GHz - OC Extremo)'],
    description: 'Multiplicador que, junto con el reloj base (BCLK normalmente 100 MHz), determina la frecuencia final a la que operan los núcleos de la CPU.',
    purpose: 'Realizar overclocking manual al procesador fijando una frecuencia continua superior a la de fábrica en todos los núcleos.',
    hardwareImpact: {
      cpuPerformance: 'Incremento directo proporcional en cómputo mononúcleo y multinúcleo (+15% a +25% en pruebas Cinebench/Blender a x48/x51).',
      ramPerformance: 'Sin cambio directo.',
      gpuPerformance: 'Mejora los FPS en juegos con cuello de botella en CPU.',
      bootTime: 'Sin variación.',
      temperatures: 'Incremento exponencial de temperatura: a x48 sube ~15°C; a x51 puede superar los 95°C provocando Thermal Throttling sin refrigeración líquida.',
      powerConsumption: 'El consumo pasa de 65W/105W a 160W - 220W bajo carga pesada.',
      security: 'Neutral.',
      stability: 'Riesgo de cuelgues (BSOD) si el voltaje VCore no es suficiente para sostener la frecuencia.'
    },
    recommendedFor: 'Entusiastas del rendimiento y creadores de contenido con disipadores de alto rendimiento.',
    warning: 'Un multiplicador demasiado alto sin disipación adecuada degradará el chip o apagará el PC por protección térmica.'
  },
  {
    id: 'cpu_voltage',
    label: 'CPU Core Voltage (VCore)',
    category: 'Ai_Tweaker',
    availableIn: ['modern'],
    defaultValue: 'Auto',
    options: ['Auto (Control Dinámico VID)', 'Offset -0.050V (Undervolting Eficiente)', 'Manual 1.250V (Estable)', 'Manual 1.385V (Alto Voltaje / Riesgo)'],
    description: 'Controla el voltaje continuo de alimentación que el VRM de la placa base suministra a los transistores del núcleo del procesador.',
    purpose: 'Estabilizar frecuencias elevadas de CPU o realizar "Undervolting" para reducir el calor y el consumo sin perder rendimiento.',
    hardwareImpact: {
      cpuPerformance: 'Indirecto: el undervolt mantiene frecuencias boost más tiempo al no chocar con el límite térmico.',
      ramPerformance: 'Sin cambio.',
      bootTime: 'Sin cambio.',
      temperatures: 'Con Offset -0.050V las temperaturas bajan de 6°C a 10°C. Con 1.385V suben peligrosamente por encima de 90°C.',
      powerConsumption: 'El voltaje al cuadrado define la potencia (P ∝ V²). Subir voltaje dispara los vatios; bajarlo ahorra hasta 25W.',
      security: 'Neutral.',
      stability: 'Un voltaje excesivo degrada la silicona (electromigración). Un voltaje insuficiente provoca congelamientos instantáneos.'
    },
    recommendedFor: 'Se recomienda "Auto" para usuarios estándar o "Offset Negativo" para equipos silenciosos y portátiles.',
    warning: 'Superar 1.40V en procesadores modernos de 7nm/5nm/3nm puede dañar permanentemente la CPU.'
  },
  {
    id: 'memory_frequency',
    label: 'Manual DRAM Frequency (Frecuencia de RAM)',
    category: 'Ai_Tweaker',
    availableIn: ['legacy', 'modern'],
    defaultValue: 'Auto',
    options: ['Auto', 'DDR-2133 MHz', 'DDR-2666 MHz', 'DDR-3200 MHz', 'DDR-3600 MHz'],
    description: 'Ajuste manual de la velocidad de transferencia de datos del bus de memoria RAM.',
    purpose: 'Permite afinar la velocidad cuando no se dispone de perfil XMP o se busca un ajuste personalizado de latencias.',
    hardwareImpact: {
      cpuPerformance: 'Mejora la velocidad de intercambio con el bus interno.',
      ramPerformance: 'Mayor frecuencia eleva el ancho de banda.',
      bootTime: 'Sin impacto.',
      temperatures: 'Leve subida en los módulos de memoria.',
      powerConsumption: 'Mínimo incremento (+2W).',
      security: 'Neutral.',
      stability: 'Frecuencias elevadas sin ajustar los timings principales (CL, tRCD, tRP, tRAS) provocarán fallos de arranque.'
    },
    recommendedFor: 'Técnicos avanzados.'
  },

  // ================= ADVANCED =================
  {
    id: 'virtualization_tech',
    label: 'Intel Virtualization Tech (VT-x / AMD-V)',
    category: 'Advanced',
    availableIn: ['legacy', 'modern'],
    defaultValue: 'Enabled',
    options: ['Enabled (Habilitado)', 'Disabled (Deshabilitado)'],
    description: 'Instrucciones por hardware añadidas al juego de instrucciones x86 que permiten a un hipervisor ejecutar múltiples sistemas operativos en paralelo con acceso directo a la CPU.',
    purpose: 'Indispensable para usar VMware, VirtualBox, Hyper-V, Docker, WSL2 (Subsistema de Windows para Linux) y emuladores de Android (BlueStacks).',
    hardwareImpact: {
      cpuPerformance: 'Sin penalización en tareas nativas. Acelera las máquinas virtuales hasta un 600% respecto a la emulación por software.',
      ramPerformance: 'Sin impacto.',
      bootTime: 'Sin impacto.',
      temperatures: 'Sin cambio.',
      powerConsumption: 'Sin variación apreciable.',
      security: 'Permite tecnologías de aislamiento de seguridad como Windows VBS (Virtualization-based Security) y protección contra ransomware.',
      stability: '100% Estable.'
    },
    recommendedFor: '¡Siempre Habilitado! Casi todos los entornos modernos de desarrollo y seguridad lo exigen.',
    technicalNotes: 'Muchos técnicos novatos no entienden por qué VirtualBox o Docker arrojan error 0x80004005 hasta que descubren esta casilla en la BIOS.'
  },
  {
    id: 'iommu_vtd',
    label: 'Intel VT-d / AMD IOMMU (Direct I/O)',
    category: 'Advanced',
    availableIn: ['modern'],
    defaultValue: 'Enabled',
    options: ['Enabled', 'Disabled'],
    description: 'Unidad de gestión de memoria de entrada/salida (Input-Output Memory Management Unit). Permite asignar hardware físico real (como una tarjeta gráfica secundaria) directamente a una máquina virtual (GPU Passthrough).',
    purpose: 'Fundamental para servidores de virtualización como Proxmox VE, ESXi o Unraid donde se necesita rendimiento nativo de GPU dentro de una VM.',
    hardwareImpact: {
      cpuPerformance: 'Sin impacto en el host.',
      ramPerformance: 'Protección de accesos DMA no autorizados en memoria.',
      bootTime: 'Sin variación.',
      temperatures: 'Sin cambio.',
      powerConsumption: 'Sin cambio.',
      security: 'Excelente protección contra ataques DMA (Direct Memory Access) a través de periféricos Thunderbolt o PCIe.',
      stability: 'Estable.'
    },
    recommendedFor: 'Servidores, laboratorios de virtualización y gaming en máquinas virtuales Linux.'
  },
  {
    id: 'rebar_support',
    label: 'Resizable BAR / Smart Access Memory (ReBAR)',
    category: 'Advanced',
    availableIn: ['modern'],
    defaultValue: 'Auto',
    options: ['Auto (Habilitado si GPU compatible)', 'Disabled (Límite 256MB Legacy)'],
    description: 'Modifica la especificación PCI Express para permitir que la CPU acceda a toda la memoria VRAM de la tarjeta gráfica de una sola vez, en lugar de en pequeños bloques limitados de 256 Megabytes.',
    purpose: 'Elimina cuellos de botella en transferencias de texturas y shaders entre el procesador y la GPU moderna (RTX serie 30/40/50, Radeon RX 6000/7000/8000, Intel Arc).',
    hardwareImpact: {
      cpuPerformance: 'Optimiza la cola de llamadas de dibujado de la CPU.',
      ramPerformance: 'Mejor coordinación con el bus PCIe.',
      gpuPerformance: 'Aumento de entre +3% y +16% en FPS en videojuegos compatibles (imprescindible en tarjetas Intel Arc donde sin ReBAR pierden hasta el 40% de rendimiento).',
      bootTime: 'Sin variación.',
      temperatures: 'Sin cambio.',
      powerConsumption: 'Sin incremento perceptible.',
      security: 'Neutral.',
      stability: 'Requiere que "CSM Support" esté DESHABILITADO y "Above 4G Decoding" HABILITADO.'
    },
    recommendedFor: 'Cualquier PC moderno con GPU dedicada y placa base compatible con UEFI.',
    warning: 'Si activas ReBAR con discos en formato MBR antiguo o CSM activo, la pantalla puede quedarse en negro al reiniciar.'
  },
  {
    id: 'above_4g_decoding',
    label: 'Above 4G Decoding (Decodificación >4GB)',
    category: 'Advanced',
    availableIn: ['modern'],
    defaultValue: 'Enabled',
    options: ['Enabled', 'Disabled'],
    description: 'Permite a los dispositivos de 64 bits asignar su espacio de direcciones de memoria por encima del límite tradicional de los 4 Gigabytes de memoria física.',
    purpose: 'Requisito técnico previo obligatorio para activar Resizable BAR y para ordenadores con múltiples tarjetas gráficas o aceleradoras de cómputo/IA.',
    hardwareImpact: {
      cpuPerformance: 'Sin variación.',
      ramPerformance: 'Apertura de espacio de direccionamiento MMIO de 64 bits.',
      gpuPerformance: 'Permite el funcionamiento de GPUs de más de 4GB con Resizable BAR.',
      bootTime: 'Sin impacto.',
      temperatures: 'Sin cambio.',
      powerConsumption: 'Sin cambio.',
      security: 'Neutral.',
      stability: 'Estable en sistemas operativos de 64 bits modernos (Windows 10/11 y Linux moderno).'
    },
    recommendedFor: 'Siempre activo en equipos de 64 bits.'
  },
  {
    id: 'sata_mode',
    label: 'SATA Controller Mode',
    category: 'Advanced',
    availableIn: ['legacy', 'modern'],
    defaultValue: 'AHCI',
    options: ['AHCI (Advanced Host Controller Interface)', 'RAID (Arreglo de discos redundantes)', 'IDE / Compatibility (Modo Legacy Antiguo)'],
    description: 'Define el protocolo de comunicación entre el chipset y las unidades de almacenamiento conectadas a los puertos SATA.',
    purpose: 'AHCI permite características avanzadas como NCQ (Native Command Queuing) y conexión en caliente (Hot-Plug). IDE solo se usa para instalar sistemas vetustos como Windows XP sin drivers SATA.',
    hardwareImpact: {
      cpuPerformance: 'AHCI reduce la sobrecarga de interrupciones en la CPU al transferir datos.',
      ramPerformance: 'Sin impacto directo.',
      bootTime: 'AHCI es sensiblemente más rápido que IDE. RAID añade ~3 segundos de escaneo de volúmenes durante el POST.',
      temperatures: 'Sin cambio.',
      powerConsumption: 'AHCI soporta gestión de energía HIPM/DIPM para discos en reposo.',
      security: 'Neutral.',
      stability: '¡CRÍTICO!: Cambiar de IDE a AHCI o a RAID tras haber instalado Windows provocará un pantallazo azul inmediato (BSOD: INACCESSIBLE_BOOT_DEVICE).'
    },
    recommendedFor: 'AHCI siempre para SSDs y discos SATA modernos. RAID solo si se montan volúmenes en espejo (RAID 1) o stripe (RAID 0).',
    warning: 'No cambies este parámetro si ya tienes Windows instalado a menos que actives previamente el modo seguro con comando bcdedit.'
  },
  {
    id: 'hyper_threading',
    label: 'Hyper-Threading Technology (SMT)',
    category: 'Advanced',
    availableIn: ['legacy', 'modern'],
    defaultValue: 'Enabled',
    options: ['Enabled (Habilitado)', 'Disabled (Deshabilitado)'],
    description: 'Tecnología de Intel (Hyper-Threading) y AMD (SMT) que permite a cada núcleo físico ejecutar dos hilos de procesamiento lógicos independientes compartiendo recursos de ejecución.',
    purpose: 'Duplica el número de hilos detectados por el sistema operativo (ej. un procesador de 8 núcleos pasa a verse como 16 hilos de trabajo).',
    hardwareImpact: {
      cpuPerformance: '+20% a +40% de rendimiento en renderizado 3D, compresión, edición de video y multitarea pesada. En algunos juegos muy viejos puede haber ligeras variaciones de latencia.',
      ramPerformance: 'Mayor concurrencia de memoria caché L3.',
      bootTime: 'Sin cambio.',
      temperatures: 'Eleva la temperatura bajo carga máxima entre 5°C y 10°C debido a una mayor utilización de los núcleos.',
      powerConsumption: 'Aumenta el consumo bajo el 100% de carga (+15W a 25W).',
      security: 'En entornos de servidores extremos se deshabilitó históricamente por vulnerabilidades teóricas de canal lateral (MDS/Spectre), pero en usuarios domésticos es imprescindible.',
      stability: 'Totalmente estable.'
    },
    recommendedFor: 'Siempre "Enabled" salvo benchmarking mononúcleo competitivo o aislamiento estricto en servidores.'
  },
  {
    id: 'c_states',
    label: 'CPU C-States & C1E Support',
    category: 'Advanced',
    availableIn: ['legacy', 'modern'],
    defaultValue: 'Enabled',
    options: ['Enabled (Ahorro de Energía Inteligente)', 'Disabled (Máximo Rendimiento / Latencia Cero)'],
    description: 'Estados de suspensión profunda del procesador (C1, C3, C6, C7, C8). Permiten desconectar la energía de núcleos inactivos cuando no hay carga de trabajo.',
    purpose: 'Disminuir radicalmente el consumo en reposo (Idle) y enfriar la CPU cuando no estás haciendo tareas exigentes.',
    hardwareImpact: {
      cpuPerformance: 'En "Enabled", la CPU tarda unos microsegundos en despertar del estado profundo. En "Disabled", la respuesta es instantánea pero no baja la frecuencia.',
      ramPerformance: 'Sin cambio.',
      bootTime: 'Sin impacto.',
      temperatures: 'En reposo, la temperatura baja de ~50°C a ~35°C con C-States activos.',
      powerConsumption: 'Reduce el consumo en reposo de 35W a menos de 8W. Ahorra cientos de vatios a lo largo del año.',
      security: 'Neutral.',
      stability: 'Algunas configuraciones extremas de overclock desactivan los C-States para evitar caídas de voltaje transitorio (Vdroop).'
    },
    recommendedFor: 'Habilitado para el 99% de los usuarios. Solo los jugadores profesionales de esports obsesionados con la latencia mínima lo apagan.'
  },

  // ================= SECURITY =================
  {
    id: 'tpm_device',
    label: 'TPM 2.0 / Intel PTT / AMD fTPM',
    category: 'Security',
    availableIn: ['modern'],
    defaultValue: 'Enabled',
    options: ['Enabled (Firmware TPM 2.0)', 'Disabled (Desactivado)', 'Discrete TPM (Módulo Físico SPI/LPC)'],
    description: 'Trusted Platform Module versión 2.0. Microcontrolador de seguridad (integrado en el firmware de la CPU como Intel PTT o AMD fTPM) que almacena claves de cifrado, hashes de integridad y credenciales biométricas.',
    purpose: 'Requisito de hardware imprescindible para instalar y actualizar a Windows 11. Soporta el cifrado de disco BitLocker, Windows Hello y sistemas antitrampas (Vanguard de Valorant).',
    hardwareImpact: {
      cpuPerformance: 'Sin impacto en juegos o aplicaciones cotidianas.',
      ramPerformance: 'Aislamiento seguro de memoria protegida.',
      bootTime: 'Añade unos 0.2 segundos para calcular las mediciones PCR de integridad del arranque.',
      temperatures: 'Sin cambio.',
      powerConsumption: 'Sin cambio.',
      security: 'Máximo nivel de protección criptográfica: previene el robo de contraseñas y claves si extraen físicamente el disco duro.',
      stability: 'En versiones de BIOS muy antiguas de AMD (2021) provocaba microtirones (stuttering), solucionado con la actualización AGESA 1.2.0.7.'
    },
    recommendedFor: 'Imprescindible activado para Windows 11, seguridad corporativa y juegos competitivos.',
    technicalNotes: 'Si vas a cambiar de procesador en una máquina con BitLocker activo, debes suspender BitLocker antes para no perder el acceso a tus archivos.'
  },
  {
    id: 'secure_boot',
    label: 'Secure Boot (Arranque Seguro)',
    category: 'Security',
    availableIn: ['modern'],
    defaultValue: 'Enabled',
    options: ['Enabled (Solo Firmas Autorizadas)', 'Disabled (Permite Cualquier Bootloader)', 'Custom / Setup Mode (Gestión de Claves PK/KEK)'],
    description: 'Protocolo de seguridad estándar de UEFI que valida criptográficamente que cada componente del software de arranque (controladores UEFI, cargador del sistema y kernel) esté firmado por una entidad certificadora de confianza (generalmente Microsoft CA).',
    purpose: 'Impide la infección por Bootkits y Rootkits que intentan cargarse antes que el antivirus o el propio sistema operativo. Requisito obligatorio para Windows 11.',
    hardwareImpact: {
      cpuPerformance: 'Sin impacto en rendimiento operativo.',
      ramPerformance: 'Sin cambio.',
      bootTime: 'Sin variación apreciable.',
      temperatures: 'Sin cambio.',
      powerConsumption: 'Sin variación.',
      security: 'Defensa crítica ante malware persistente a nivel de firmware.',
      stability: 'Puede bloquear el arranque de distribuciones Linux que no usan Shim firmado, discos USB con utilidades antiguas (Hirens Boot CD clásico) o tarjetas gráficas de hace 15 años sin GOP (Graphics Output Protocol).'
    },
    recommendedFor: 'Activado por defecto en Windows 10 y 11. Desactivar temporalmente solo si vas a clonar discos o probar Live USBs no firmados.',
    warning: 'Si instalaste Windows en modo CSM/Legacy, activar Secure Boot hará que el PC no encuentre el disco de arranque.'
  },
  {
    id: 'bios_admin_password',
    label: 'Administrator Password (Contraseña de Supervisor)',
    category: 'Security',
    availableIn: ['legacy', 'modern'],
    defaultValue: 'Not Installed',
    options: ['Not Installed', 'Installed (Protegida)'],
    description: 'Bloquea el acceso al menú de configuración de la BIOS con una clave de acceso.',
    purpose: 'Evita que alumnos, empleados o usuarios no autorizados cambien el orden de arranque, desactiven la seguridad o modifiquen voltajes.',
    hardwareImpact: {
      cpuPerformance: 'Nulo.',
      ramPerformance: 'Nulo.',
      bootTime: 'Detiene el arranque para solicitar la contraseña en caso de configurarse a nivel de sistema.',
      temperatures: 'Sin cambio.',
      powerConsumption: 'Sin cambio.',
      security: 'Evita sabotajes físicos locales.',
      stability: 'Si se olvida la contraseña, requiere abrir la caja del PC para mover el jumper CLRTC (Clear CMOS) o retirar la pila 5 minutos.'
    },
    recommendedFor: 'Aulas de informática, oficinas públicas y cibercafés.'
  },

  // ================= BOOT =================
  {
    id: 'csm_support',
    label: 'CSM Support (Compatibility Support Module)',
    category: 'Boot',
    availableIn: ['modern'],
    defaultValue: 'Disabled',
    options: ['Disabled (Modo UEFI Puro)', 'Enabled (Compatibilidad Legacy MBR)'],
    description: 'Módulo de compatibilidad dentro de la UEFI que emula el entorno de interrupciones INT 10h/INT 13h de una BIOS tradicional de 16 bits.',
    purpose: 'Permite arrancar sistemas operativos antiguos o discos duros con tabla de particiones MBR (Master Boot Record) en lugar de GPT (GUID Partition Table).',
    hardwareImpact: {
      cpuPerformance: 'Sin cambio directo.',
      ramPerformance: 'Sin cambio.',
      gpuPerformance: 'Incompatible con Resizable BAR. No aprovecha el estándar UEFI GOP moderno.',
      bootTime: 'CSM añade entre 3 y 8 segundos al tiempo de arranque debido a la inicialización de Option ROMs antiguas.',
      temperatures: 'Sin variación.',
      powerConsumption: 'Sin variación.',
      security: 'Al activar CSM, se desactiva obligatoriamente el "Secure Boot", dejando el equipo desprotegido contra bootkits.',
      stability: 'Incompatible con la certificación de Windows 11.'
    },
    recommendedFor: '"Disabled" (UEFI puro) para todos los PCs modernos con Windows 10/11 y Linux actual. "Enabled" solo para rescatar discos viejos con Windows 7 o utilidades DOS.',
    warning: 'Desactivar CSM si tu disco tiene Windows instalado en partición MBR provocará que el equipo no reconozca el disco para arrancar.'
  },
  {
    id: 'fast_boot',
    label: 'Fast Boot (Arranque Rápido de BIOS)',
    category: 'Boot',
    availableIn: ['modern'],
    defaultValue: 'Enabled',
    options: ['Enabled (Omitir Comprobaciones Secundarias)', 'Disabled (POST Completo y Minucioso)', 'Ultra Fast (Solo Dispositivos de Inicio)'],
    description: 'Instruye a la BIOS para que omita el escaneo exhaustivo de puertos USB, controladores RAID y puertos SATA vacíos durante el encendido en frío.',
    purpose: 'Reducir los segundos que transcurren desde que pulsas el botón de encendido hasta que aparece el logotipo del sistema operativo.',
    hardwareImpact: {
      cpuPerformance: 'Sin cambio.',
      ramPerformance: 'En "Ultra Fast" puede saltarse el re-entrenamiento de timings de memoria.',
      bootTime: 'Reduce el tiempo de POST de ~14 segundos a ~4-6 segundos.',
      temperatures: 'Sin impacto.',
      powerConsumption: 'Sin impacto.',
      security: 'En "Ultra Fast" puede no inicializar el teclado USB hasta que carga Windows, impidiendo entrar a la BIOS con la tecla SUPR.',
      stability: 'Si conectas un nuevo disco duro USB, puede no ser detectado hasta que el sistema operativo inicie.'
    },
    recommendedFor: '"Enabled" es la opción ideal equilibrada para uso diario.'
  },
  {
    id: 'boot_priority_1',
    label: '1st Boot Device (Primer Dispositivo de Arranque)',
    category: 'Boot',
    availableIn: ['legacy', 'modern'],
    defaultValue: 'Windows Boot Manager (NVMe SSD)',
    options: [
      'Windows Boot Manager (NVMe SSD)', 
      'USB Flash Drive (UEFI Installer)', 
      'SATA HDD 2TB (Almacenamiento)', 
      'Network Boot (PXE IPv4/IPv6)', 
      'Disabled'
    ],
    description: 'Determina qué unidad de almacenamiento revisará la BIOS en primer lugar en busca de un sector de arranque válido o un archivo EFI (bootx64.efi).',
    purpose: 'Crucial para formatear e instalar sistemas operativos: cuando vas a instalar Windows desde un pendrive, debes poner el USB como 1er dispositivo.',
    hardwareImpact: {
      cpuPerformance: 'Sin impacto.',
      ramPerformance: 'Sin impacto.',
      bootTime: 'Si pones "Network Boot (PXE)" antes que el SSD, el PC tardará 20-30 segundos buscando un servidor de red DHCP antes de arrancar Windows.',
      temperatures: 'Sin cambio.',
      powerConsumption: 'Sin cambio.',
      security: 'Permitir arranque por USB sin contraseña de BIOS permite a extraños iniciar un sistema Linux portátil para copiar tus archivos locales.',
      stability: 'Totalmente estable.'
    },
    recommendedFor: 'Tener siempre como primera opción el "Windows Boot Manager" o tu SSD principal. Para arrancar un USB puntual, usa el Boot Menu (F11/F12) sin alterar la BIOS permanente.'
  },
  {
    id: 'boot_priority_2',
    label: '2nd Boot Device (Segundo Dispositivo)',
    category: 'Boot',
    availableIn: ['legacy', 'modern'],
    defaultValue: 'USB Flash Drive (UEFI Installer)',
    options: ['USB Flash Drive (UEFI Installer)', 'SATA HDD 2TB (Almacenamiento)', 'Network Boot (PXE)', 'Disabled'],
    description: 'Dispositivo al que acudirá la BIOS si el primer dispositivo falla, no tiene sistema operativo o está desconectado.',
    purpose: 'Crea una ruta de respaldo para el arranque del equipo.',
    hardwareImpact: {
      cpuPerformance: 'Sin impacto.',
      ramPerformance: 'Sin impacto.',
      bootTime: 'Sin variación si el primer dispositivo arranca con éxito.',
      temperatures: 'Sin cambio.',
      powerConsumption: 'Sin cambio.',
      security: 'Neutral.',
      stability: 'Estable.'
    },
    recommendedFor: 'USB Flash Drive o Disabled.'
  },
  {
    id: 'boot_numlock',
    label: 'Bootup NumLock State',
    category: 'Boot',
    availableIn: ['legacy', 'modern'],
    defaultValue: 'On',
    options: ['On (Activado)', 'Off (Desactivado)'],
    description: 'Define si el LED del teclado numérico (Bloq Num) debe encenderse automáticamente nada más finalizar el POST.',
    purpose: 'Comodidad para escribir códigos PIN numéricos en la pantalla de inicio de sesión de Windows sin tener que pulsar Bloq Num a mano.',
    hardwareImpact: {
      cpuPerformance: 'Nulo.',
      ramPerformance: 'Nulo.',
      bootTime: 'Nulo.',
      temperatures: 'Sin cambio.',
      powerConsumption: 'Insignificante (un solo micro-LED).',
      security: 'Neutral.',
      stability: 'Estable.'
    },
    recommendedFor: '"On" para teclados con teclado numérico lateral.'
  },

  // ================= MONITOR / HARDWARE HEALTH =================
  {
    id: 'fan_profile',
    label: 'CPU Q-Fan / Smart Fan Profile',
    category: 'Monitor',
    availableIn: ['modern'],
    defaultValue: 'Standard',
    options: ['Standard (Equilibrado)', 'Silent (Silencioso)', 'Turbo (Alto Flujo de Aire)', 'Full Speed (100% Continuo)', 'Manual (Curva PWM Personalizada)'],
    description: 'Controla el ciclo de trabajo PWM (modulación por ancho de pulso) o voltaje DC de la cabecera del ventilador de la CPU (CPU_FAN) según la temperatura leída por el diodo interno.',
    purpose: 'Encontrar el equilibrio deseado entre silencio acústico en la habitación y refrigeración de la CPU bajo estrés.',
    hardwareImpact: {
      cpuPerformance: 'En "Silent", si la CPU sube de 85°C el procesador reducirá sus frecuencias boost para protegerse (Throttling). En "Turbo/Full", la CPU mantiene frecuencias máximas.',
      ramPerformance: 'Sin impacto.',
      bootTime: 'Sin impacto.',
      temperatures: 'En "Turbo", las temperaturas bajan entre 7°C y 14°C respecto a "Silent". En "Full Speed" se obtiene la refrigeración más fría a costa de ruido de turbina.',
      powerConsumption: 'Los ventiladores consumen entre 1.5W y 4W cada uno.',
      security: 'Neutral.',
      stability: 'Un perfil demasiado silencioso en un ambiente caluroso de verano puede provocar apagados de emergencia por sobrecalentamiento.'
    },
    recommendedFor: '"Standard" para la mayoría; "Turbo" para sesiones intensivas de render o juego.'
  },
  {
    id: 'cpu_temp_warning',
    label: 'CPU Warning Temperature',
    category: 'Monitor',
    availableIn: ['legacy', 'modern'],
    defaultValue: '80°C / 176°F',
    options: ['Disabled', '70°C / 158°F', '80°C / 176°F', '90°C / 194°F'],
    description: 'Umbral térmico a partir del cual el zumbador (speaker) de la placa emitirá un pitido continuo de alarma para avisar al usuario de sobrecalentamiento.',
    purpose: 'Avisar precozmente si la bomba de refrigeración líquida ha fallado o si el ventilador de la CPU se ha detenido por polvo o avería.',
    hardwareImpact: {
      cpuPerformance: 'Alerta antes de que el procesador entre en estrangulamiento térmico o apagado forzoso.',
      ramPerformance: 'Sin cambio.',
      bootTime: 'Sin impacto.',
      temperatures: 'Informativo y de salvaguarda.',
      powerConsumption: 'Sin impacto.',
      security: 'Neutral.',
      stability: 'Protección esencial del hardware.'
    },
    recommendedFor: '80°C o 85°C.'
  },

  // ================= POWER MANAGEMENT =================
  {
    id: 'power_loss_action',
    label: 'Restore on AC Power Loss (Estado tras corte eléctrico)',
    category: 'Power',
    availableIn: ['legacy', 'modern'],
    defaultValue: 'Power Off',
    options: ['Power Off (Quedarse Apagado)', 'Power On (Encenderse Automáticamente)', 'Last State (Volver al Estado Previo)'],
    description: 'Decide qué debe hacer el equipo cuando vuelve el suministro eléctrico tras un apagón, corte de luz o tras encender una regleta.',
    purpose: 'En servidores y máquinas de laboratorio se configura en "Power On" para que el equipo vuelva a estar operativo en la red de inmediato sin intervención humana.',
    hardwareImpact: {
      cpuPerformance: 'Sin impacto.',
      ramPerformance: 'Sin impacto.',
      bootTime: 'Sin cambio.',
      temperatures: 'Sin cambio.',
      powerConsumption: 'Si se enciende solo, comenzará a consumir energía inmediatamente.',
      security: 'Si está en "Power On", el equipo se encenderá incluso si el usuario no está presente.',
      stability: 'Estable.'
    },
    recommendedFor: '"Power Off" para ordenadores domésticos; "Power On" para servidores remotos, mineros o domótica.'
  },
  {
    id: 'wake_on_lan',
    label: 'Wake on LAN (WOL / PME Event)',
    category: 'Power',
    availableIn: ['legacy', 'modern'],
    defaultValue: 'Disabled',
    options: ['Disabled (Desactivado)', 'Enabled (Encendido por Magic Packet)'],
    description: 'Mantiene la tarjeta de red Ethernet (NIC) en estado de bajo consumo alimentada por la línea de 5VSB (Standby) a la espera de un paquete especial de red ("Magic Packet").',
    purpose: 'Permite a administradores de sistemas y técnicos encender ordenadores a distancia desde la red local enviando un comando de red.',
    hardwareImpact: {
      cpuPerformance: 'Sin impacto.',
      ramPerformance: 'Sin impacto.',
      bootTime: 'Sin cambio.',
      temperatures: 'Sin cambio.',
      powerConsumption: 'Aumenta el consumo con el PC apagado de ~0.5W a ~1.8W en la toma de corriente.',
      security: 'Riesgo leve: un atacante dentro de la red local podría encender ordenadores apagados.',
      stability: 'Estable.'
    },
    recommendedFor: 'Equipos de soporte remoto, aulas informáticas y servidores domésticos (NAS).'
  },
  {
    id: 'erp_ready',
    label: 'ErP Ready (Directiva Europea de Eficiencia Energética)',
    category: 'Power',
    availableIn: ['modern'],
    defaultValue: 'Disabled',
    options: ['Disabled (Puertos USB cargan con PC apagado)', 'Enabled S4+S5 (Consumo <0.5W, USBs apagados)'],
    description: 'Cumple con la norma europea ErP/EuP Lot 6 cortando la alimentación de 5V en puertos USB, tarjetas de red y luces RGB cuando el ordenador está apagado.',
    purpose: 'Evitar el "consumo fantasma" o vampiro de electricidad. También apaga los ratones y teclados que se quedan con luces encendidas por la noche.',
    hardwareImpact: {
      cpuPerformance: 'Sin impacto.',
      ramPerformance: 'Sin impacto.',
      bootTime: 'Sin cambio.',
      temperatures: 'Sin cambio.',
      powerConsumption: 'Reduce el consumo en apagado a menos de 0.5 Watts (ahorro energético total).',
      security: 'Neutral.',
      stability: 'Impide cargar móviles por USB con el PC apagado y desactiva el Wake on LAN.'
    },
    recommendedFor: 'Quienes quieren que los periféricos se apaguen por completo al apagar el PC y ahorrar en la factura eléctrica.'
  },

  // ================= TOOLS & UTILITIES =================
  {
    id: 'ez_flash_utility',
    label: 'ASUS EZ Flash 3 / Q-Flash Utility (F11)',
    category: 'Tool',
    availableIn: ['modern', 'legacy'],
    defaultValue: 'Enabled',
    options: ['Enabled', 'Disabled (Bloquear Flasheo)'],
    description: 'Permite iniciar la utilidad gráfica integrada para flashear y reprogramar la memoria SPI Flash EEPROM de la placa base desde una memoria USB FAT32.',
    purpose: 'Actualizar microcódigos de CPU para solucionar fallos de estabilidad, añadir compatibilidad con nuevos procesadores y parches de seguridad.',
    hardwareImpact: {
      cpuPerformance: 'Permite instalar microcódigos actualizados (ej. parche Vmin Shift 0x12B contra degradación).',
      ramPerformance: 'Mejora perfiles de memoria y estabilidad con kits DDR5 de alta frecuencia.',
      bootTime: 'Sin variación en arranque normal.',
      temperatures: 'Las nuevas revisiones suelen incluir curvas térmicas más optimizadas.',
      powerConsumption: 'Ajusta tablas de voltaje VID de fábrica.',
      security: 'Corrige vulnerabilidades de nivel Ring-0 (LogoFAIL, Sinkclose, Meltdown/Spectre).',
      stability: 'CRÍTICO: Si se flashea con una configuración inestable o se corta la energía, la placa madre puede quedar brickeada.'
    },
    recommendedFor: 'Mantener habilitada y actualizar cuando existan parches de seguridad o estabilidad críticos.'
  },
  {
    id: 'armoury_crate_injection',
    label: 'ASUS Armoury Crate / App Center Auto-Install',
    category: 'Tool',
    availableIn: ['modern'],
    defaultValue: 'Disabled',
    options: ['Disabled (Recomendado)', 'Enabled (Inyectar en Windows)'],
    description: 'Instruye a la BIOS para inyectar un ejecutable en Windows mediante la tabla ACPI WPBT (Windows Platform Binary Table) nada más instalar el sistema operativo.',
    purpose: 'Descargar e instalar automáticamente software del fabricante de la placa base sin intervención del usuario.',
    hardwareImpact: {
      cpuPerformance: 'En "Enabled", Armoury Crate instala servicios en segundo plano que consumen entre 2% y 5% de uso continuo de CPU.',
      ramPerformance: 'Consume entre 400 MB y 800 MB de memoria RAM por múltiples procesos secundarios.',
      bootTime: 'Aumenta el tiempo de inicio de Windows en 3-5 segundos debido a servicios auxiliares.',
      temperatures: 'Sin impacto relevante.',
      powerConsumption: 'Leve aumento por telemetría activa.',
      security: 'Controvertido: inyecta binarios a nivel de firmware en el kernel del SO (considerado bloatware por entusiastas).',
      stability: 'Puede entrar en conflicto con otras utilidades de iluminación RGB (OpenRGB).'
    },
    recommendedFor: 'Disabled para mantener Windows limpio y sin programas no solicitados en segundo plano.'
  },
  {
    id: 'nvme_secure_erase',
    label: 'SSD Secure Erase / Sanitize Tool',
    category: 'Tool',
    availableIn: ['modern'],
    defaultValue: 'Standby',
    options: ['Standby', 'Execute Erase (Borrado Criptográfico)'],
    description: 'Herramienta de borrado seguro que envía comandos ATA Sanitize o NVMe Format a las unidades de estado sólido.',
    purpose: 'Borrar de manera irreversible y definitiva todos los bloques NAND flash antes de vender un PC o reinstalar de cero, restaurando el rendimiento de fábrica.',
    hardwareImpact: {
      cpuPerformance: 'Nulo.',
      ramPerformance: 'Nulo.',
      bootTime: 'Restaura la velocidad de escritura sostenida del SSD si estaba degradado por celdas sucias.',
      temperatures: 'Sin cambio.',
      powerConsumption: 'Sin cambio.',
      security: 'Máxima seguridad: destruye claves de cifrado internas del controlador SSD, imposibilitando la recuperación forense de datos.',
      stability: 'Irreversible: elimina todas las particiones del disco seleccionado.'
    },
    recommendedFor: 'Solo cuando se desea limpiar un SSD a bajo nivel antes de desecharlo o venderlo.'
  },

  // ================= LEGACY EXCLUSIVES =================
  {
    id: 'floppy_drive_a',
    label: 'Legacy Floppy Drive A (Disquetera 3.5")',
    category: 'Main',
    availableIn: ['legacy'],
    defaultValue: '1.44M, 3.5 in.',
    options: ['None', '1.44M, 3.5 in.', '720K, 3.5 in.', '1.2M, 5.25 in.'],
    description: 'Configura la controladora de disquetes FDC (Floppy Disk Controller) y el tipo de unidad conectada por cable plano de 34 pines.',
    purpose: 'Lectura de disquetes magnéticos de arranque MS-DOS y herramientas de recuperación clásicas.',
    hardwareImpact: {
      cpuPerformance: 'Nulo.',
      ramPerformance: 'Nulo.',
      bootTime: 'Si está habilitada y no hay disquetera física conectada, la BIOS perderá 5 segundos rascando el cabezal durante el POST ("Floppy seek").',
      temperatures: 'Sin cambio.',
      powerConsumption: 'Mínimo.',
      security: 'Permite arrancar desde medios físicos externos.',
      stability: 'Configurar en "None" si no tienes disquetera para acelerar el inicio.'
    },
    recommendedFor: 'Equipos retro y simulaciones históricas.'
  },
  {
    id: 'primary_ide_master',
    label: 'Primary IDE Master (Disco Duro IDE)',
    category: 'Main',
    availableIn: ['legacy'],
    defaultValue: 'Auto (LBA Mode)',
    options: ['Auto (LBA Mode)', 'Manual (CHS: Cylinders/Heads/Sectors)', 'None'],
    description: 'Detecta los parámetros geométricos del disco duro conectado al conector IDE 1 en configuración Maestro (Master mediante jumper físico).',
    purpose: 'En los años 90 y 2000, si la BIOS no detectaba los Cilindros, Cabezas y Sectores (CHS) o LBA (Logical Block Addressing), el disco era inaccesible.',
    hardwareImpact: {
      cpuPerformance: 'Nulo.',
      ramPerformance: 'Nulo.',
      bootTime: '"Auto" realiza una consulta ATA Identify Device de 1 segundo.',
      temperatures: 'Sin cambio.',
      powerConsumption: 'Sin cambio.',
      security: 'Neutral.',
      stability: 'Fundamental para la visibilidad del sistema operativo en placas Legacy.'
    },
    recommendedFor: 'Dejar siempre en "Auto".'
  },
  {
    id: 'quick_power_on_self_test',
    label: 'Quick Power On Self Test (Quick POST)',
    category: 'Advanced',
    availableIn: ['legacy'],
    defaultValue: 'Enabled',
    options: ['Enabled', 'Disabled (Verificación Triple de RAM)'],
    description: 'En BIOS antiguas, al apagar esta opción la máquina realizaba un conteo y testeo minucioso de cada celda de memoria RAM hasta 3 veces consecutivas en pantalla.',
    purpose: 'Detectar chips de memoria SIMM/DIMM dañados en una época donde la RAM fallaba con relativa frecuencia.',
    hardwareImpact: {
      cpuPerformance: 'Sin cambio en Windows/DOS.',
      ramPerformance: 'Sin cambio.',
      bootTime: 'En "Disabled" con 512MB o 1GB de RAM, ¡el arranque tardaba más de 45 segundos solo contando memoria!',
      temperatures: 'Sin cambio.',
      powerConsumption: 'Sin cambio.',
      security: 'Neutral.',
      stability: 'Aseguraba integridad en servidores antiguos.'
    },
    recommendedFor: 'Enabled para no esperar un minuto cada vez que se enciende la máquina.'
  },
  {
    id: 'virus_warning',
    label: 'Boot Sector Virus Warning',
    category: 'Security',
    availableIn: ['legacy'],
    defaultValue: 'Disabled',
    options: ['Disabled', 'Enabled (Interrumpe escritura en MBR)'],
    description: 'Monitorea las llamadas a la interrupción BIOS INT 13h Función 03h (escribir sectores) y detiene el equipo con una alarma roja si algún programa intenta escribir en el Master Boot Record (MBR).',
    purpose: 'Proteger el disco contra virus destructores legendarios de los 90 como Chernobyl (CIH), Michelangelo o Stoned.',
    hardwareImpact: {
      cpuPerformance: 'Nulo.',
      ramPerformance: 'Nulo.',
      bootTime: 'Sin cambio.',
      temperatures: 'Sin cambio.',
      powerConsumption: 'Sin cambio.',
      security: 'Aviso contra modificaciones de sector cero.',
      stability: '¡CUIDADO!: Debe deshabilitarse al instalar un nuevo sistema operativo (Windows 98/XP/Linux) o la instalación fallará al intentar escribir el gestor de arranque.'
    },
    recommendedFor: 'Deshabilitado durante instalaciones; habilitado para protección retro estricta.'
  }
];

export const INITIAL_CONFIG: Record<string, string> = BIOS_OPTIONS.reduce((acc, opt) => {
  acc[opt.id] = opt.defaultValue;
  return acc;
}, {} as Record<string, string>);
