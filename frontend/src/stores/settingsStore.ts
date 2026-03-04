import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings, Currency, MeasurementStandard } from '@/types';

interface SettingsState {
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;
  updateCompanyProfile: (partial: Partial<AppSettings['companyProfile']>) => void;
}

const defaultSettings: AppSettings = {
  companyProfile: {
    name: '',
    registrationNo: '',
    vatNo: '',
    logoUrl: '',
  },
  defaultCurrency: 'ZAR' as Currency,
  defaultVatRate: 15,
  defaultOverheadsPct: 10,
  defaultProfitPct: 10,
  measurementStandard: 'SA' as MeasurementStandard,
  autoSaveIntervalMs: 30000,
  tableDensity: 'compact',
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,

      updateSettings: (partial) =>
        set((state) => ({
          settings: { ...state.settings, ...partial },
        })),

      updateCompanyProfile: (partial) =>
        set((state) => ({
          settings: {
            ...state.settings,
            companyProfile: { ...state.settings.companyProfile, ...partial },
          },
        })),
    }),
    { name: 'boq-settings' },
  ),
);
