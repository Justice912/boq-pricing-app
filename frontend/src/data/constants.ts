import type { Currency, ContractType, MeasurementUnit } from '@/types';

export const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: 'ZAR', label: 'South African Rand', symbol: 'R' },
  { value: 'SZL', label: 'Eswatini Lilangeni', symbol: 'E' },
  { value: 'USD', label: 'US Dollar', symbol: '$' },
  { value: 'GBP', label: 'British Pound', symbol: '£' },
  { value: 'EUR', label: 'Euro', symbol: '€' },
];

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  ZAR: 'R',
  SZL: 'E',
  USD: '$',
  GBP: '£',
  EUR: '€',
};

export const CONTRACT_TYPES: { value: ContractType; label: string }[] = [
  { value: 'JBCC', label: 'JBCC (Joint Building Contracts Committee)' },
  { value: 'NEC', label: 'NEC (New Engineering Contract)' },
  { value: 'FIDIC', label: 'FIDIC (International)' },
  { value: 'GCC', label: 'GCC (General Conditions of Contract)' },
  { value: 'Other', label: 'Other' },
];

export const MEASUREMENT_UNITS: { value: MeasurementUnit; label: string }[] = [
  { value: 'm', label: 'm (metre)' },
  { value: 'm²', label: 'm² (square metre)' },
  { value: 'm³', label: 'm³ (cubic metre)' },
  { value: 'kg', label: 'kg (kilogram)' },
  { value: 't', label: 't (tonne)' },
  { value: 'nr', label: 'nr (number)' },
  { value: 'item', label: 'Item' },
  { value: 'sum', label: 'Sum' },
  { value: 'prov sum', label: 'Provisional Sum' },
  { value: 'pc sum', label: 'Prime Cost Sum' },
  { value: 'linear m', label: 'Linear metre' },
  { value: 'pair', label: 'Pair' },
  { value: 'set', label: 'Set' },
  { value: 'l', label: 'l (litre)' },
  { value: 'kW', label: 'kW (kilowatt)' },
  { value: 'kVA', label: 'kVA' },
  { value: 'hr', label: 'hr (hour)' },
];

export const PROJECT_STATUSES = [
  { value: 'draft' as const, label: 'Draft', color: 'slate' },
  { value: 'priced' as const, label: 'Priced', color: 'amber' },
  { value: 'submitted' as const, label: 'Submitted', color: 'blue' },
  { value: 'awarded' as const, label: 'Awarded', color: 'emerald' },
];

export const DEFAULT_VAT_RATE = 15;
export const DEFAULT_OVERHEADS_PCT = 10;
export const DEFAULT_PROFIT_PCT = 10;
