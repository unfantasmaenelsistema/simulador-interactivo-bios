export type BiosType = 'legacy' | 'modern';

export type OptionCategory = 
  | 'Main' 
  | 'Advanced' 
  | 'Ai_Tweaker' 
  | 'Security' 
  | 'Power' 
  | 'Monitor' 
  | 'Boot' 
  | 'Tool' 
  | 'Exit';

export interface BiosOption {
  id: string;
  label: string;
  category: OptionCategory;
  availableIn: BiosType[]; // whether it appears in legacy, modern, or both
  defaultValue: string;
  options: string[];
  description: string; // ¿Qué hace?
  purpose: string; // ¿Para qué sirve?
  hardwareImpact: {
    cpuPerformance: string; // Impacto en procesador
    ramPerformance: string; // Impacto en memoria RAM
    gpuPerformance?: string; // Impacto en tarjeta gráfica
    bootTime: string; // Impacto en tiempo de arranque
    temperatures: string; // Impacto en temperaturas y refrigeración
    powerConsumption: string; // Consumo en Watts
    security: string; // Impacto en seguridad y arranque seguro
    stability: string; // Nivel de riesgo o estabilidad
  };
  recommendedFor: string; // Casos de uso recomendados
  technicalNotes?: string; // Curiosidad o detalle técnico para estudiantes
  warning?: string; // Advertencia si se toca sin cuidado
}

export type BiosConfigState = Record<string, string>;

export interface HardwareMetrics {
  cpuScore: number; // e.g. 1540 pts
  cpuMultiScore: number; // e.g. 12800 pts
  ramSpeedMHz: number; // e.g. 3600 MHz
  ramLatencyNs: number; // e.g. 64.2 ns
  ramBandwidthGBs: number; // e.g. 52.4 GB/s
  gamingFpsEstimate: number; // e.g. 142 fps
  bootTimeSeconds: number; // e.g. 7.4s
  idleWatts: number; // e.g. 48W
  loadWatts: number; // e.g. 145W
  cpuTempIdle: number; // e.g. 36°C
  cpuTempLoad: number; // e.g. 74°C
  securityScore: number; // 0 to 100%
  stabilityPercentage: number; // 0 to 100%
  win11Ready: boolean;
  virtualizationReady: boolean;
  stabilityStatus: 'Estable' | 'Advertencia de Inestabilidad' | 'Crítico / Riesgo BSOD';
}

export interface BiosProfile {
  id: string;
  name: string;
  description: string;
  biosType: BiosType;
  createdAt: string;
  author: string;
  isPreset?: boolean;
  config: BiosConfigState;
}

export interface BrandKeyInfo {
  brand: string;
  logoIcon?: string;
  biosKey: string;
  bootMenuKey: string;
  recoveryKey: string;
  description: string;
  tips: string;
}

export interface StudentMission {
  id: string;
  title: string;
  difficulty: 'Fácil' | 'Intermedio' | 'Avanzado';
  description: string;
  objective: string;
  targetConfigRequirements: Record<string, string | string[]>;
  explanation: string;
  hint: string;
}

export type StressTestMode = 'cpu_heavy' | 'ram_memtest' | 'full_system';

export type StressTestStatus = 'idle' | 'running' | 'passed' | 'throttled' | 'crashed_bsod' | 'crashed_thermal';

export interface StressTestLogEntry {
  timestamp: string;
  type: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

export interface StressTestDiagnostics {
  status: StressTestStatus;
  maxTempReached: number;
  maxWattsReached: number;
  effectiveClockGHz: number;
  stabilityPercentage: number;
  failureReason?: string;
  failureCode?: string;
  technicalDiagnosis?: string;
  suggestedFix?: string;
}
