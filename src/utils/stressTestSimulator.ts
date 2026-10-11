import { BiosConfigState, StressTestDiagnostics, StressTestMode } from '../types/bios';

export function evaluateBiosStressCapability(
  config: BiosConfigState,
  mode: StressTestMode
): {
  willCrash: boolean;
  crashAtProgress: number; // e.g. 42%
  diagnostics: StressTestDiagnostics;
} {
  const cpuRatio = config['cpu_ratio'] || 'Auto (Stock)';
  const cpuVoltage = config['cpu_voltage'] || 'Auto';
  const fanProfile = config['fan_profile'] || 'Standard';
  const xmp = config['xmp_docp'] || 'Disabled';
  const memFreq = config['memory_frequency'] || 'Auto';

  // Base metrics under stress
  let maxTemp = 68;
  let maxWatts = 115;
  let effectiveClock = 4.2;
  let stabilityPct = 99;

  // 1. Calculate clock & power
  if (cpuRatio.includes('x45')) {
    effectiveClock = 4.5;
    maxWatts += 25;
    maxTemp += 8;
  } else if (cpuRatio.includes('x48')) {
    effectiveClock = 4.8;
    maxWatts += 55;
    maxTemp += 17;
  } else if (cpuRatio.includes('x51')) {
    effectiveClock = 5.1;
    maxWatts += 105;
    maxTemp += 30;
  }

  // 2. Voltage impact
  if (cpuVoltage.includes('Offset -0.050V')) {
    maxWatts -= 18;
    maxTemp -= 9;
  } else if (cpuVoltage.includes('Manual 1.385V')) {
    maxWatts += 50;
    maxTemp += 16;
  } else if (cpuVoltage.includes('Manual 1.250V')) {
    maxWatts += 10;
    maxTemp += 4;
  }

  // 3. Fan cooling impact
  if (fanProfile.includes('Silent')) {
    maxTemp += 14;
  } else if (fanProfile.includes('Turbo')) {
    maxTemp -= 9;
  } else if (fanProfile.includes('Full Speed')) {
    maxTemp -= 15;
  }

  // ================= CRASH CONDITIONS =================

  // Scenario A: Extreme Ratio x51 with Undervolt or Auto VID (Insufficient Voltage Crash)
  if (cpuRatio.includes('x51') && (cpuVoltage.includes('Offset -0.050V') || cpuVoltage.includes('Auto'))) {
    stabilityPct = 35;
    return {
      willCrash: true,
      crashAtProgress: 38,
      diagnostics: {
        status: 'crashed_bsod',
        maxTempReached: Math.min(92, maxTemp),
        maxWattsReached: maxWatts,
        effectiveClockGHz: effectiveClock,
        stabilityPercentage: stabilityPct,
        failureCode: 'WHEA_UNCORRECTABLE_ERROR (0x00000124)',
        failureReason: 'Caída de voltaje transitorio (Vdroop) en núcleo #2 al ejecutar instrucciones AVX2 pesadas.',
        technicalDiagnosis: 'Has configurado un multiplicador x51 (5.10 GHz) pero mantienes el voltaje en modo Auto o con Offset negativo (-0.050V). Los transistores del silicio demandan más tensión para conmutar a 5.1 GHz. La falta de electrones causó un fallo aritmético en las compuertas lógicas (Kernel Hardware Error).',
        suggestedFix: 'Baja el multiplicador a "All Core x48" o "Stock", o establece un voltaje manual estable como 1.250V - 1.300V.'
      }
    };
  }

  // Scenario B: Extreme Ratio x51 + High Voltage (1.385V) + Silent/Standard Fan (Thermal Meltdown)
  if (cpuRatio.includes('x51') && maxTemp >= 96) {
    stabilityPct = 25;
    return {
      willCrash: true,
      crashAtProgress: 52,
      diagnostics: {
        status: 'crashed_thermal',
        maxTempReached: 102,
        maxWattsReached: maxWatts,
        effectiveClockGHz: effectiveClock,
        stabilityPercentage: stabilityPct,
        failureCode: 'PROCHOT_THERMAL_SHUTDOWN (102°C)',
        failureReason: 'Disparo del circuito de protección térmica interna (Tjunction Max superado a 100°C).',
        technicalDiagnosis: 'El procesador ha alcanzado 102°C debido al alto voltaje combinado con una disipación o perfil de ventilador insuficiente. Para evitar fundir el silicio o provocar electromigración irreparable, el firmware de la placa madre forzó el apagado inmediato del equipo.',
        suggestedFix: 'Configura la curva de ventilación en "Turbo" o "Full Speed" y reduce el voltaje a valores inferiores a 1.30V.'
      }
    };
  }

  // Scenario C: Ratio x48 with Undervolting (-0.050V) under heavy AVX
  if (cpuRatio.includes('x48') && cpuVoltage.includes('Offset -0.050V') && mode !== 'ram_memtest') {
    stabilityPct = 65;
    return {
      willCrash: true,
      crashAtProgress: 68,
      diagnostics: {
        status: 'crashed_bsod',
        maxTempReached: maxTemp,
        maxWattsReached: maxWatts,
        effectiveClockGHz: effectiveClock,
        stabilityPercentage: stabilityPct,
        failureCode: 'CLOCK_WATCHDOG_TIMEOUT (0x00000101)',
        failureReason: 'Un hilo del procesador dejó de responder a las interrupciones del reloj del sistema por subvoltaje.',
        technicalDiagnosis: 'A 4.80 GHz la CPU resiste tareas normales de escritorio, pero la prueba de estrés de punto flotante exige voltajes más altos. El offset de -0.050V dejó a uno de los hilos sin energía suficiente para terminar la matriz de cálculo en el tiempo límite.',
        suggestedFix: 'Restablece el voltaje a "Auto" o utiliza un perfil de voltaje fijo de 1.250V.'
      }
    };
  }

  // Scenario D: Manual DDR-3600 frequency without XMP timings profile
  if (mode === 'ram_memtest' && memFreq.includes('3600') && xmp.includes('Disabled')) {
    stabilityPct = 50;
    return {
      willCrash: true,
      crashAtProgress: 46,
      diagnostics: {
        status: 'crashed_bsod',
        maxTempReached: maxTemp,
        maxWattsReached: maxWatts,
        effectiveClockGHz: effectiveClock,
        stabilityPercentage: stabilityPct,
        failureCode: 'MEMORY_MANAGEMENT (0x0000001A)',
        failureReason: 'Error de paridad de memoria DRAM. Fallo en el patrón de testeo 0x55AA55AA.',
        technicalDiagnosis: 'Forzaste la memoria a 3600 MHz de forma manual, pero el perfil XMP está desactivado. Esto provocó que los sub-timings primarios y el voltaje de DRAM (1.20V en lugar de 1.35V) no estuvieran calibrados, corrompiendo datos en tránsito.',
        suggestedFix: 'Habilita "X.M.P Profile 1" para que la BIOS cargue automáticamente tanto la frecuencia como los voltajes DRAM de 1.35V y latencias correctas.'
      }
    };
  }

  // Scenario E: Thermal Throttling (Does not crash completely, but throttles clocks down)
  if (maxTemp >= 88) {
    stabilityPct = 78;
    effectiveClock = Math.max(3.2, Number((effectiveClock - 0.9).toFixed(1)));
    return {
      willCrash: false,
      crashAtProgress: 100,
      diagnostics: {
        status: 'throttled',
        maxTempReached: maxTemp,
        maxWattsReached: maxWatts,
        effectiveClockGHz: effectiveClock,
        stabilityPercentage: stabilityPct,
        failureReason: 'Estrangulamiento Térmico (Thermal Throttling) Activo: la CPU bajó frecuencias para no quemarse.',
        technicalDiagnosis: `La temperatura trepó hasta los ${maxTemp}°C durante la prueba. El procesador redujo su frecuencia de ${config['cpu_ratio']?.includes('x48') ? '4.80 GHz' : '4.50 GHz'} a ${effectiveClock} GHz para proteger el empaquetado. El test no se colgó, pero has perdido hasta un 25% de rendimiento por falta de refrigeración.`,
        suggestedFix: 'Cambia el perfil de ventiladores de "Silent" a "Turbo" o "Standard", o disminuye el multiplicador.'
      }
    };
  }

  // ================= SUCCESS PASS =================
  return {
    willCrash: false,
    crashAtProgress: 100,
    diagnostics: {
      status: 'passed',
      maxTempReached: maxTemp,
      maxWattsReached: maxWatts,
      effectiveClockGHz: effectiveClock,
      stabilityPercentage: 99,
      technicalDiagnosis: `¡Excelente configuración! El sistema completó 100% de la carga de estrés sin errores de cálculo ni inestabilidades de voltaje. Las temperaturas máximas se mantuvieron en un rango seguro de ${maxTemp}°C y el consumo en ${maxWatts}W.`
    }
  };
}
