import { BrandKeyInfo } from '../types/bios';

export const BRAND_BIOS_KEYS: BrandKeyInfo[] = [
  {
    brand: 'ASUS / ROG / TUF',
    biosKey: 'F2 o SUPR / DEL',
    bootMenuKey: 'F8 o ESC',
    recoveryKey: 'F9',
    description: 'Placas base de sobremesa y portátiles ASUS Republic of Gamers y ZenBook.',
    tips: 'En portátiles ASUS, mantener pulsada la tecla F2 antes de presionar el botón de encendido.'
  },
  {
    brand: 'HP / Compaq / OMEN',
    biosKey: 'F10 (o ESC para menú de inicio)',
    bootMenuKey: 'F9',
    recoveryKey: 'F11',
    description: 'Equipos de escritorio Pavilion, All-in-One, portátiles ProBook, EliteBook y OMEN.',
    tips: 'Al encender, pulsar repetidamente ESC abre el "Startup Menu" desde donde se puede seleccionar F10 Setup.'
  },
  {
    brand: 'Dell / Alienware',
    biosKey: 'F2',
    bootMenuKey: 'F12',
    recoveryKey: 'F12 (opción SupportAssist OS Recovery)',
    description: 'Portátiles XPS, Inspiron, Latitude, y estaciones Alienware / Precision.',
    tips: 'Dell incluye una excelente herramienta de diagnóstico de hardware accesible desde el menú F12.'
  },
  {
    brand: 'Lenovo / ThinkPad / Legion',
    biosKey: 'F2 o Fn + F2 (o tecla Enter en ThinkPad)',
    bootMenuKey: 'F12 o Fn + F12',
    recoveryKey: 'Botón NOVO o Fn + F11',
    description: 'ThinkPad, IdeaPad, Yoga y torres gaming Legion.',
    tips: 'Muchos modelos ThinkPad piden pulsar ENTER durante el logo de Lenovo para mostrar el menú de interrupción. Portátiles IdeaPad suelen tener el pequeño orificio "Novo Button".'
  },
  {
    brand: 'MSI (Micro-Star International)',
    biosKey: 'SUPR / DEL',
    bootMenuKey: 'F11',
    recoveryKey: 'F3',
    description: 'Placas base de gama alta, portátiles Gaming Stealth, Raider y Creator.',
    tips: 'En placas base MSI, la tecla SUPR (Delete) debe presionarse nada más escuchar el pitido de arranque.'
  },
  {
    brand: 'Gigabyte / AORUS',
    biosKey: 'SUPR / DEL',
    bootMenuKey: 'F12',
    recoveryKey: 'End (Q-Flash) o F9',
    description: 'Placas base para procesadores Intel y AMD y portátiles AORUS / Aero.',
    tips: 'La tecla "End" en la pantalla de POST abre directamente Q-Flash para actualizar el firmware.'
  },
  {
    brand: 'Acer / Predator / Nitro',
    biosKey: 'F2 o SUPR / DEL',
    bootMenuKey: 'F12 (requiere habilitarse antes en BIOS)',
    recoveryKey: 'Alt + F10',
    description: 'Portátiles Aspire, Swift, Nitro y equipos gaming Predator.',
    tips: 'Nota importante: en la mayoría de portátiles Acer, el menú de arranque F12 viene desactivado por defecto en BIOS por seguridad.'
  },
  {
    brand: 'ASRock',
    biosKey: 'F2 o SUPR / DEL',
    bootMenuKey: 'F11',
    recoveryKey: 'F6 (Instant Flash)',
    description: 'Placas base populares Taichi, Steel Legend y Phantom Gaming.',
    tips: 'F6 enciende la utilidad de actualización de firmware desde un pendrive USB formateado en FAT32.'
  },
  {
    brand: 'Microsoft Surface',
    biosKey: 'Mantener Volumen Arriba (+) y pulsar Botón Encendido',
    bootMenuKey: 'Mantener Volumen Abajo (-) y pulsar Botón Encendido',
    recoveryKey: 'Descargar imagen de recuperación Surface',
    description: 'Surface Pro, Surface Laptop, Surface Studio y Surface Go.',
    tips: 'Soltar el botón de volumen solo cuando aparezca el logotipo de Microsoft o los puntos giratorios.'
  },
  {
    brand: 'Apple Mac (Intel)',
    biosKey: 'No tiene BIOS tradicional (Usa Open Firmware / Apple EFI)',
    bootMenuKey: 'Mantener tecla OPTION / ALT al encender',
    recoveryKey: 'CMD + R (Recuperación local) o CMD + OPTION + R (Internet)',
    description: 'Equipos Mac basados en procesadores Intel (MacBook, iMac, Mac Pro anteriores a M1).',
    tips: 'En Macs con Apple Silicon (M1/M2/M3/M4), mantener pulsado el botón de encendido hasta ver "Cargando opciones de inicio".'
  },
  {
    brand: 'Samsung',
    biosKey: 'F2',
    bootMenuKey: 'F10 o ESC',
    recoveryKey: 'F4',
    description: 'Portátiles Galaxy Book, ATIV y ordenadores todo en uno de Samsung.',
    tips: 'F4 inicia el software Samsung Recovery integrado en la partición oculta de fábrica.'
  },
  {
    brand: 'Toshiba / Dynabook',
    biosKey: 'F2 o F12',
    bootMenuKey: 'F12',
    recoveryKey: 'Mantener tecla 0 (cero) al pulsar encendido',
    description: 'Portátiles Satellite, Tecra y Portege.',
    tips: 'En modelos antiguos, mantener la tecla ESC pulsada y luego pulsar F1 cuando el sistema pite.'
  }
];

export const GENERAL_BIOS_TIPS = [
  {
    title: '¿Windows 10/11 arranca demasiado rápido y no te da tiempo a pulsar la tecla?',
    solution: 'Windows usa "Inicio rápido" (hibernación del núcleo). Para entrar sin reiniciar 10 veces: mantén pulsada la tecla MAYÚS (Shift) y haz clic en "Reiniciar" desde el menú de Windows. Ve a Solucionar problemas > Opciones avanzadas > Configuración de firmware UEFI.'
  },
  {
    title: 'Diferencia entre Tecla de BIOS y Tecla de Boot Menu',
    solution: 'La tecla de BIOS (F2 / DEL) entra a la configuración permanente. La tecla de Boot Menu (F8, F11, F12) solo te deja elegir qué dispositivo arrancar esa vez puntual (USB, SSD, Red PXE) sin cambiar los ajustes del sistema.'
  },
  {
    title: 'Portátiles con teclas de función invertidas (Fn)',
    solution: 'Si pulsar F2 sube el volumen o baja el brillo en lugar de entrar en BIOS, debes pulsar "Fn + F2" simultáneamente.'
  }
];
