import { useState } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { useIndustryStore } from '@/stores/industryStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { INDUSTRIES } from '@/data/industries';
import { CURRENCIES, CONTRACT_TYPES } from '@/data/constants';
import { Button } from '@/components/ui/Button';
import type { ContractType, Currency } from '@/types';

interface ProjectFormProps {
  onSuccess: (id: string) => void;
  onCancel: () => void;
}

export function ProjectForm({ onSuccess, onCancel }: ProjectFormProps) {
  const createProject = useProjectStore((s) => s.createProject);
  const selectedIndustryId = useIndustryStore((s) => s.selectedIndustryId);
  const defaultCurrency = useSettingsStore((s) => s.settings.defaultCurrency);

  const [name, setName] = useState('');
  const [client, setClient] = useState('');
  const [location, setLocation] = useState('');
  const [industryId, setIndustryId] = useState(selectedIndustryId);
  const [contractType, setContractType] = useState<ContractType>('JBCC');
  const [contractPeriod, setContractPeriod] = useState(12);
  const [currency, setCurrency] = useState<Currency>(defaultCurrency);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const id = createProject({
      name: name.trim(),
      client: client.trim(),
      location: location.trim(),
      industryId,
      contractType,
      contractPeriodMonths: contractPeriod,
      currency,
    });

    onSuccess(id);
  };

  const inputClass =
    'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all';
  const labelClass = 'block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Project Name */}
      <div>
        <label className={labelClass}>Project Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Sandton Office Block Phase 2"
          className={inputClass}
          autoFocus
          required
        />
      </div>

      {/* Client + Location row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Client</label>
          <input
            type="text"
            value={client}
            onChange={(e) => setClient(e.target.value)}
            placeholder="Client name"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Johannesburg, Gauteng"
            className={inputClass}
          />
        </div>
      </div>

      {/* Industry */}
      <div>
        <label className={labelClass}>Industry / Discipline</label>
        <select value={industryId} onChange={(e) => setIndustryId(e.target.value)} className={inputClass}>
          {INDUSTRIES.map((ind) => (
            <option key={ind.id} value={ind.id}>
              {ind.name}
            </option>
          ))}
        </select>
      </div>

      {/* Contract Type + Period */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Contract Type</label>
          <select
            value={contractType}
            onChange={(e) => setContractType(e.target.value as ContractType)}
            className={inputClass}
          >
            {CONTRACT_TYPES.map((ct) => (
              <option key={ct.value} value={ct.value}>
                {ct.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Contract Period (months)</label>
          <input
            type="number"
            value={contractPeriod}
            onChange={(e) => setContractPeriod(parseInt(e.target.value) || 0)}
            min={1}
            max={120}
            className={inputClass}
          />
        </div>
      </div>

      {/* Currency */}
      <div>
        <label className={labelClass}>Currency</label>
        <select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} className={inputClass}>
          {CURRENCIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.symbol} — {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!name.trim()}>
          Create Project
        </Button>
      </div>
    </form>
  );
}
