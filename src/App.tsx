import React, { useState, useEffect } from 'react';
import { BiosType, BiosConfigState, BiosProfile, BrandKeyInfo } from './types/bios';
import { INITIAL_CONFIG } from './data/biosOptions';
import { PRESET_PROFILES } from './data/presetProfiles';
import { BiosLauncher } from './components/BiosLauncher';
import { PostScreen } from './components/PostScreen';
import { LegacyBios } from './components/LegacyBios';
import { ModernUefiBios } from './components/ModernUefiBios';
import { BrandKeysModal } from './components/BrandKeysModal';
import { ProfileComparator } from './components/ProfileComparator';
import { MissionsModal } from './components/MissionsModal';
import { SaveExitDialog } from './components/SaveExitDialog';
import { StressTestModal } from './components/StressTestModal';
import { BiosUpdateModal } from './components/BiosUpdateModal';
import { soundManager } from './utils/audio';

type AppViewState = 'launcher' | 'post' | 'bios';

export default function App() {
  const [viewState, setViewState] = useState<AppViewState>('launcher');
  const [activeBiosType, setActiveBiosType] = useState<BiosType>('modern');
  const [currentConfig, setCurrentConfig] = useState<BiosConfigState>(INITIAL_CONFIG);
  const [savedConfigSnapshot, setSavedConfigSnapshot] = useState<BiosConfigState>(INITIAL_CONFIG);
  const [selectedBrand, setSelectedBrand] = useState<BrandKeyInfo | null>(null);
  const [currentBiosVersion, setCurrentBiosVersion] = useState<string>('v2.80-X64');

  // Modals state
  const [isBrandKeysModalOpen, setIsBrandKeysModalOpen] = useState(false);
  const [isProfilesModalOpen, setIsProfilesModalOpen] = useState(false);
  const [isMissionsModalOpen, setIsMissionsModalOpen] = useState(false);
  const [isStressTestModalOpen, setIsStressTestModalOpen] = useState(false);
  const [isBiosUpdateModalOpen, setIsBiosUpdateModalOpen] = useState(false);
  const [isSaveExitDialogOpen, setIsSaveExitDialogOpen] = useState(false);

  // Custom user profiles in localStorage
  const [customProfiles, setCustomProfiles] = useState<BiosProfile[]>(() => {
    try {
      const saved = localStorage.getItem('bios_custom_profiles');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save custom profiles to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bios_custom_profiles', JSON.stringify(customProfiles));
    } catch {
      // Ignore
    }
  }, [customProfiles]);

  // Start simulation flow from launcher
  const handleStartSimulation = (biosType: BiosType, simulatePost: boolean, brand?: BrandKeyInfo) => {
    setActiveBiosType(biosType);
    if (brand) setSelectedBrand(brand);
    setSavedConfigSnapshot({ ...currentConfig });

    if (simulatePost) {
      setViewState('post');
    } else {
      setViewState('bios');
    }
  };

  // Change individual BIOS option
  const handleChangeOption = (optionId: string, newValue: string) => {
    setCurrentConfig((prev) => ({
      ...prev,
      [optionId]: newValue
    }));
  };

  // Reset to optimized factory defaults (F9)
  const handleResetDefaults = () => {
    const defaultsProfile = PRESET_PROFILES.find((p) => p.id === 'preset-defaults');
    if (defaultsProfile) {
      setCurrentConfig({ ...defaultsProfile.config });
    } else {
      setCurrentConfig({ ...INITIAL_CONFIG });
    }
  };

  // Save & Exit (F10)
  const handleConfirmSaveAndExit = () => {
    setSavedConfigSnapshot({ ...currentConfig });
    setIsSaveExitDialogOpen(false);
    // Cold reboot to post sequence
    setViewState('post');
  };

  // Discard changes & exit (ESC)
  const handleDiscardAndExit = () => {
    setCurrentConfig({ ...savedConfigSnapshot });
    setIsSaveExitDialogOpen(false);
    setViewState('launcher');
  };

  // Apply a loaded profile from the comparator
  const handleApplyProfile = (profile: BiosProfile) => {
    setCurrentConfig({ ...profile.config });
  };

  // Save new custom profile
  const handleSaveNewProfile = (newProfile: BiosProfile) => {
    setCustomProfiles((prev) => [newProfile, ...prev]);
  };

  const handleDeleteProfile = (profileId: string) => {
    setCustomProfiles((prev) => prev.filter((p) => p.id !== profileId));
  };

  return (
    <div className="w-full min-h-screen bg-black text-slate-100 font-sans select-none">
      
      {/* 1. Launcher Screen */}
      {viewState === 'launcher' && (
        <BiosLauncher
          onStartSimulation={handleStartSimulation}
          onOpenBrandKeysGuide={() => setIsBrandKeysModalOpen(true)}
          onOpenProfiles={() => setIsProfilesModalOpen(true)}
          onOpenMissions={() => setIsMissionsModalOpen(true)}
          onOpenStressTest={() => setIsStressTestModalOpen(true)}
          onOpenBiosUpdate={() => setIsBiosUpdateModalOpen(true)}
        />
      )}

      {/* 2. Cold Boot / POST Screen */}
      {viewState === 'post' && (
        <PostScreen
          biosType={activeBiosType}
          brand={selectedBrand}
          biosVersion={currentBiosVersion}
          onEnterBios={() => setViewState('bios')}
          onRebootToPost={() => setViewState('post')}
        />
      )}

      {/* 3. BIOS Configuration Screen (Legacy or Modern) */}
      {viewState === 'bios' && (
        <>
          {activeBiosType === 'legacy' ? (
            <LegacyBios
              config={currentConfig}
              onChangeOption={handleChangeOption}
              onResetDefaults={handleResetDefaults}
              onRequestSaveExit={() => setIsSaveExitDialogOpen(true)}
              onExitWithoutSave={() => setViewState('launcher')}
              onOpenProfiles={() => setIsProfilesModalOpen(true)}
              onOpenMissions={() => setIsMissionsModalOpen(true)}
              onOpenStressTest={() => setIsStressTestModalOpen(true)}
              onSwitchBiosType={() => setActiveBiosType('modern')}
              onOpenBiosUpdate={() => setIsBiosUpdateModalOpen(true)}
            />
          ) : (
            <ModernUefiBios
              config={currentConfig}
              onChangeOption={handleChangeOption}
              onResetDefaults={handleResetDefaults}
              onRequestSaveExit={() => setIsSaveExitDialogOpen(true)}
              onExitWithoutSave={() => setViewState('launcher')}
              onOpenProfiles={() => setIsProfilesModalOpen(true)}
              onOpenMissions={() => setIsMissionsModalOpen(true)}
              onOpenStressTest={() => setIsStressTestModalOpen(true)}
              onSwitchBiosType={() => setActiveBiosType('legacy')}
              onOpenBiosUpdate={() => setIsBiosUpdateModalOpen(true)}
              currentBiosVersion={currentBiosVersion}
            />
          )}
        </>
      )}

      {/* Global Modals & Dialogs */}
      <BrandKeysModal
        isOpen={isBrandKeysModalOpen}
        onClose={() => setIsBrandKeysModalOpen(false)}
        onSelectBrandForPost={(brand) => {
          setIsBrandKeysModalOpen(false);
          handleStartSimulation(activeBiosType, true, brand);
        }}
      />

      <ProfileComparator
        isOpen={isProfilesModalOpen}
        onClose={() => setIsProfilesModalOpen(false)}
        currentConfig={currentConfig}
        onApplyProfile={handleApplyProfile}
        customProfiles={customProfiles}
        onSaveNewProfile={handleSaveNewProfile}
        onDeleteProfile={handleDeleteProfile}
        onOpenStressTest={() => setIsStressTestModalOpen(true)}
      />

      <MissionsModal
        isOpen={isMissionsModalOpen}
        onClose={() => setIsMissionsModalOpen(false)}
        currentConfig={currentConfig}
      />

      <StressTestModal
        isOpen={isStressTestModalOpen}
        onClose={() => setIsStressTestModalOpen(false)}
        config={currentConfig}
        onAdjustBiosOption={() => {
          setIsStressTestModalOpen(false);
          setViewState('bios');
        }}
      />

      <BiosUpdateModal
        isOpen={isBiosUpdateModalOpen}
        onClose={() => setIsBiosUpdateModalOpen(false)}
        config={currentConfig}
        biosType={activeBiosType}
        currentBiosVersion={currentBiosVersion}
        onFirmwareUpdated={(newVer) => setCurrentBiosVersion(newVer)}
        onRebootToPost={() => {
          setIsBiosUpdateModalOpen(false);
          setViewState('post');
        }}
        onLoadSafeDefaults={handleResetDefaults}
      />

      <SaveExitDialog
        isOpen={isSaveExitDialogOpen}
        biosType={activeBiosType}
        currentConfig={currentConfig}
        initialConfig={savedConfigSnapshot}
        onConfirmSave={handleConfirmSaveAndExit}
        onCancel={() => setIsSaveExitDialogOpen(false)}
        onDiscardAndExit={handleDiscardAndExit}
      />

    </div>
  );
}
