import { BiosConfigState, HardwareMetrics } from '../types/bios';

export function calculateHardwareMetrics(config: BiosConfigState): HardwareMetrics {
  // Base baseline values (Modern 8-Core / 16-Thread CPU like Ryzen 7 7800X3D or Core i7-14700)
  let cpuScore = 1520;
  let cpuMultiScore = 12400;
  let ramSpeedMHz = 2400;
  let ramLatencyNs = 82.5;
  let ramBandwidthGBs = 38.4;
  let gamingFpsEstimate = 135;
  let bootTimeSeconds = 12.0;
  let idleWatts = 42;
  let loadWatts = 115;
  let cpuTempIdle = 38;
  let cpuTempLoad = 68;
  let securityScore = 40;
  let stabilityPercentage = 99;
  let stabilityStatus: 'Estable' | 'Advertencia de Inestabilidad' | 'Crítico / Riesgo BSOD' = 'Estable';

  // 1. RAM / XMP impact
  const xmpVal = config['xmp_docp'] || 'Disabled';
  const memFreq = config['memory_frequency'] || 'Auto';

  if (xmpVal.includes('Profile 1 (DDR4-3600')) {
    ramSpeedMHz = 3600;
    ramLatencyNs = 64.2;
    ramBandwidthGBs = 57.6;
    cpuScore += 95;
    cpuMultiScore += 750;
    gamingFpsEstimate += 18;
    idleWatts += 3;
    loadWatts += 6;
    cpuTempIdle += 2;
    cpuTempLoad += 3;
    bootTimeSeconds += 0.8; // Memory training
  } else if (xmpVal.includes('Profile 2 (DDR4-3200')) {
    ramSpeedMHz = 3200;
    ramLatencyNs = 70.1;
    ramBandwidthGBs = 51.2;
    cpuScore += 65;
    cpuMultiScore += 520;
    gamingFpsEstimate += 12;
    idleWatts += 2;
    loadWatts += 4;
  } else if (memFreq.includes('3600')) {
    ramSpeedMHz = 3600;
    ramLatencyNs = 72.0; // Auto timings loose
    ramBandwidthGBs = 56.0;
    cpuScore += 70;
    gamingFpsEstimate += 14;
  } else if (memFreq.includes('3200')) {
    ramSpeedMHz = 3200;
    ramLatencyNs = 75.0;
    ramBandwidthGBs = 50.0;
    cpuScore += 50;
    gamingFpsEstimate += 9;
  }

  // 2. CPU Ratio (Multiplier)
  const cpuRatio = config['cpu_ratio'] || 'Auto (Stock)';
  const cpuVoltage = config['cpu_voltage'] || 'Auto';

  if (cpuRatio.includes('x45')) {
    cpuScore += 110;
    cpuMultiScore += 890;
    gamingFpsEstimate += 7;
    loadWatts += 22;
    cpuTempLoad += 7;
  } else if (cpuRatio.includes('x48')) {
    cpuScore += 220;
    cpuMultiScore += 1750;
    gamingFpsEstimate += 14;
    loadWatts += 52;
    cpuTempLoad += 16;
  } else if (cpuRatio.includes('x51')) {
    cpuScore += 330;
    cpuMultiScore += 2600;
    gamingFpsEstimate += 21;
    loadWatts += 95;
    cpuTempLoad += 28;
  }

  // Voltage interplay
  if (cpuVoltage.includes('Offset -0.050V')) {
    loadWatts -= 18;
    idleWatts -= 4;
    cpuTempIdle -= 3;
    cpuTempLoad -= 8;
  } else if (cpuVoltage.includes('Manual 1.385V')) {
    loadWatts += 45;
    idleWatts += 8;
    cpuTempIdle += 5;
    cpuTempLoad += 14;
  }

  // Stability calculation (e.g. high multiplier with stock or undervolt causes instability!)
  if (cpuRatio.includes('x51')) {
    if (cpuVoltage.includes('Offset -0.050V') || cpuVoltage.includes('Auto')) {
      stabilityPercentage = 45;
      stabilityStatus = 'Crítico / Riesgo BSOD';
    } else if (cpuVoltage.includes('Manual 1.250V')) {
      stabilityPercentage = 68;
      stabilityStatus = 'Advertencia de Inestabilidad';
    } else {
      stabilityPercentage = 88;
      stabilityStatus = 'Advertencia de Inestabilidad'; // Too hot
    }
  } else if (cpuRatio.includes('x48') && cpuVoltage.includes('Offset -0.050V')) {
    stabilityPercentage = 75;
    stabilityStatus = 'Advertencia de Inestabilidad';
  }

  // 3. Resizable BAR & Above 4G Decoding
  const rebar = config['rebar_support'] || 'Auto';
  const csm = config['csm_support'] || 'Disabled';
  const above4G = config['above_4g_decoding'] || 'Enabled';

  const rebarActive = (rebar.includes('Auto') || rebar.includes('Enabled')) && 
                      csm.includes('Disabled') && 
                      above4G.includes('Enabled');

  if (rebarActive) {
    gamingFpsEstimate += 16;
  }

  // 4. Hyper-Threading
  const ht = config['hyper_threading'] || 'Enabled';
  if (ht.includes('Disabled')) {
    cpuMultiScore = Math.round(cpuMultiScore * 0.72); // -28% multi-core
    loadWatts -= 20;
    cpuTempLoad -= 7;
  }

  // 5. C-States
  const cStates = config['c_states'] || 'Enabled';
  if (cStates.includes('Disabled')) {
    idleWatts += 22;
    cpuTempIdle += 9;
    cpuScore += 15; // lower wake latency
  }

  // 6. Fan Profile
  const fanProf = config['fan_profile'] || 'Standard';
  if (fanProf.includes('Silent')) {
    cpuTempLoad += 11;
    cpuTempIdle += 5;
    if (cpuTempLoad > 88) {
      // Thermal throttling
      cpuScore -= 80;
      cpuMultiScore -= 600;
      gamingFpsEstimate -= 8;
    }
  } else if (fanProf.includes('Turbo')) {
    cpuTempLoad -= 8;
    cpuTempIdle -= 4;
  } else if (fanProf.includes('Full Speed')) {
    cpuTempLoad -= 14;
    cpuTempIdle -= 7;
  }

  // 7. Boot Time calculation
  const fastBoot = config['fast_boot'] || 'Enabled';
  const sataMode = config['sata_mode'] || 'AHCI';
  const bootDev = config['boot_priority_1'] || 'Windows Boot Manager';
  const floppyA = config['floppy_drive_a'] || 'None';
  const quickPost = config['quick_power_on_self_test'] || 'Enabled';

  if (fastBoot.includes('Ultra Fast')) {
    bootTimeSeconds = 4.2;
  } else if (fastBoot.includes('Enabled')) {
    bootTimeSeconds = 6.8;
  } else {
    bootTimeSeconds = 14.5;
  }

  if (csm.includes('Enabled')) {
    bootTimeSeconds += 4.5;
  }

  if (sataMode.includes('RAID')) {
    bootTimeSeconds += 3.2;
  } else if (sataMode.includes('IDE')) {
    bootTimeSeconds += 2.0;
  }

  if (bootDev.includes('Network Boot')) {
    bootTimeSeconds += 18.0; // Searching for PXE DHCP
  }

  if (floppyA && !floppyA.includes('None')) {
    bootTimeSeconds += 3.5; // Floppy seek noise & check
  }

  if (quickPost.includes('Disabled')) {
    bootTimeSeconds += 15.0; // Triple memory test
  }

  // 8. Security Score & Windows 11 Readiness
  const tpm = config['tpm_device'] || 'Enabled';
  const secureBoot = config['secure_boot'] || 'Enabled';
  const virtTech = config['virtualization_tech'] || 'Enabled';
  const iommu = config['iommu_vtd'] || 'Enabled';
  const adminPass = config['bios_admin_password'] || 'Not Installed';

  let currentSecurity = 10;
  const tpmEnabled = tpm.includes('Enabled') || tpm.includes('Discrete');
  const secureBootEnabled = secureBoot.includes('Enabled') && csm.includes('Disabled');
  const virtEnabled = virtTech.includes('Enabled');
  const iommuEnabled = iommu.includes('Enabled');

  if (tpmEnabled) currentSecurity += 30;
  if (secureBootEnabled) currentSecurity += 25;
  if (virtEnabled) currentSecurity += 15;
  if (iommuEnabled) currentSecurity += 10;
  if (adminPass.includes('Installed')) currentSecurity += 10;

  securityScore = Math.min(100, currentSecurity);

  const win11Ready = tpmEnabled && secureBootEnabled && csm.includes('Disabled');
  const virtualizationReady = virtEnabled;

  return {
    cpuScore: Math.round(cpuScore),
    cpuMultiScore: Math.round(cpuMultiScore),
    ramSpeedMHz,
    ramLatencyNs: Number(ramLatencyNs.toFixed(1)),
    ramBandwidthGBs: Number(ramBandwidthGBs.toFixed(1)),
    gamingFpsEstimate: Math.round(gamingFpsEstimate),
    bootTimeSeconds: Number(bootTimeSeconds.toFixed(1)),
    idleWatts: Math.round(idleWatts),
    loadWatts: Math.round(loadWatts),
    cpuTempIdle: Math.round(cpuTempIdle),
    cpuTempLoad: Math.round(cpuTempLoad),
    securityScore,
    stabilityPercentage,
    win11Ready,
    virtualizationReady,
    stabilityStatus
  };
}
