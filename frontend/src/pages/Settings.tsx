import { motion } from 'framer-motion';
import { useSettingsStore } from '@/stores/settingsStore';
import { CURRENCIES } from '@/data/constants';
import { Card, CardHeader } from '@/components/ui/Card';
import type { Currency, MeasurementStandard } from '@/types';
import { Save } from 'lucide-react';

export function Settings() {
  const { settings, updateSettings, updateCompanyProfile } = useSettingsStore();

  const inputClass =
    'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all';
  const labelClass = 'block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5';

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-navy-900">Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Configure your workspace preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
        {/* Company Profile */}
        <Card padding="lg">
          <CardHeader title="Company Profile" subtitle="Your company details for reports" />
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Company Name</label>
              <input
                type="text"
                value={settings.companyProfile.name}
                onChange={(e) => updateCompanyProfile({ name: e.target.value })}
                placeholder="Your Company (Pty) Ltd"
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Registration No.</label>
                <input
                  type="text"
                  value={settings.companyProfile.registrationNo}
                  onChange={(e) => updateCompanyProfile({ registrationNo: e.target.value })}
                  placeholder="2024/000000/07"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>VAT No.</label>
                <input
                  type="text"
                  value={settings.companyProfile.vatNo}
                  onChange={(e) => updateCompanyProfile({ vatNo: e.target.value })}
                  placeholder="4000000000"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Pricing Defaults */}
        <Card padding="lg">
          <CardHeader title="Pricing Defaults" subtitle="Default values for new projects" />
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Default Currency</label>
                <select
                  value={settings.defaultCurrency}
                  onChange={(e) => updateSettings({ defaultCurrency: e.target.value as Currency })}
                  className={inputClass}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.symbol} {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>VAT Rate (%)</label>
                <input
                  type="number"
                  value={settings.defaultVatRate}
                  onChange={(e) => updateSettings({ defaultVatRate: parseFloat(e.target.value) || 0 })}
                  className={inputClass}
                  min={0}
                  max={100}
                  step={0.5}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Default Overheads (%)</label>
                <input
                  type="number"
                  value={settings.defaultOverheadsPct}
                  onChange={(e) => updateSettings({ defaultOverheadsPct: parseFloat(e.target.value) || 0 })}
                  className={inputClass}
                  min={0}
                  max={50}
                  step={0.5}
                />
              </div>
              <div>
                <label className={labelClass}>Default Profit (%)</label>
                <input
                  type="number"
                  value={settings.defaultProfitPct}
                  onChange={(e) => updateSettings({ defaultProfitPct: parseFloat(e.target.value) || 0 })}
                  className={inputClass}
                  min={0}
                  max={50}
                  step={0.5}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Measurement Standards */}
        <Card padding="lg">
          <CardHeader title="Measurement Standard" subtitle="Default standard for new projects" />
          <div className="space-y-3">
            {(['SA', 'International'] as MeasurementStandard[]).map((std) => (
              <label
                key={std}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  settings.measurementStandard === std
                    ? 'border-amber-400 bg-amber-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="standard"
                  value={std}
                  checked={settings.measurementStandard === std}
                  onChange={() => updateSettings({ measurementStandard: std })}
                  className="accent-amber-600"
                />
                <div>
                  <p className="text-sm font-medium text-navy-800">
                    {std === 'SA' ? 'South African (ASAQS / JBCC)' : 'International (RICS NRM)'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {std === 'SA'
                      ? 'ASAQS Model Preambles, COLTO standards'
                      : 'NRM1 (cost planning), NRM2 (detailed measurement)'}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </Card>

        {/* Display Preferences */}
        <Card padding="lg">
          <CardHeader title="Display Preferences" subtitle="Customize your workspace" />
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Table Density</label>
              <select
                value={settings.tableDensity}
                onChange={(e) =>
                  updateSettings({ tableDensity: e.target.value as 'compact' | 'normal' | 'comfortable' })
                }
                className={inputClass}
              >
                <option value="compact">Compact</option>
                <option value="normal">Normal</option>
                <option value="comfortable">Comfortable</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Auto-save Interval</label>
              <select
                value={settings.autoSaveIntervalMs}
                onChange={(e) => updateSettings({ autoSaveIntervalMs: parseInt(e.target.value) })}
                className={inputClass}
              >
                <option value={15000}>15 seconds</option>
                <option value={30000}>30 seconds</option>
                <option value={60000}>1 minute</option>
                <option value={300000}>5 minutes</option>
              </select>
            </div>
          </div>
        </Card>
      </div>

      {/* Save indicator */}
      <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
        <Save size={14} />
        Settings are saved automatically to local storage
      </div>
    </motion.div>
  );
}
