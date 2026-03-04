// ── Project Types ────────────────────────────────────

export type ProjectStatus = 'draft' | 'priced' | 'submitted' | 'awarded';
export type ContractType = 'JBCC' | 'NEC' | 'FIDIC' | 'GCC' | 'Other';
export type Currency = 'ZAR' | 'USD' | 'EUR' | 'GBP' | 'SZL';
export type MeasurementStandard = 'SA' | 'International';

export interface Project {
  id: string;
  name: string;
  client: string;
  location: string;
  industryId: string;
  contractType: ContractType;
  contractPeriodMonths: number;
  currency: Currency;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  totalValue: number;
  boqSections: BOQSection[];
}

// ── BOQ Types ────────────────────────────────────────

export type MeasurementUnit =
  | 'm' | 'm²' | 'm³' | 'kg' | 't'
  | 'nr' | 'item' | 'sum'
  | 'prov sum' | 'pc sum'
  | 'linear m' | 'pair' | 'set'
  | 'l' | 'kW' | 'kVA' | 'hr';

export type ConfidenceLevel = 'Verified' | 'Estimated' | 'Budget';

export interface BOQItem {
  id: string;
  itemNo: string;
  description: string;
  unit: MeasurementUnit | string;
  quantity: number;
  // Rate breakdown
  materialsRate: number;
  labourRate: number;
  plantRate: number;
  subcontractRate: number;
  overheadsPct: number;
  profitPct: number;
  // Computed (always derived, never edited directly)
  totalRate: number;
  totalAmount: number;
  // Metadata
  rateItemId: string;
  confidence: ConfidenceLevel;
  isCustomRate: boolean;
  notes: string;
}

export interface BOQSection {
  id: string;
  sectionNo: string;
  name: string;
  items: BOQItem[];
}

// ── Rate Library Types ───────────────────────────────

export interface RateEntry {
  id: string;
  industryId: string;
  tradeSection: string;
  description: string;
  unit: string;
  materialsRate: number;
  labourRate: number;
  plantRate: number;
  subcontractRate: number;
  totalRate: number;
  source: 'user' | 'imported' | 'historical';
  lastUpdated: string;
  region: string;
  confidence: ConfidenceLevel;
}

// ── Industry Types ───────────────────────────────────

export interface TradeTemplate {
  sectionNo: string;
  name: string;
  defaultItems: Array<{
    description: string;
    unit: MeasurementUnit | string;
  }>;
}

export interface Industry {
  id: string;
  name: string;
  description: string;
  icon: string;
  standards: string[];
  typicalPreliminariesPct: string;
  measurementNotes: string;
  trades: TradeTemplate[];
}

// ── Analysis Types ───────────────────────────────────

export type FlagSeverity = 'info' | 'warning' | 'critical';

export interface AnalysisFlag {
  id: string;
  severity: FlagSeverity;
  category: string;
  message: string;
  affectedItemId?: string;
  sectionName?: string;
}

// ── AI Pricing Types ────────────────────────────────

export interface AIPricingSuggestion {
  id: string;
  boqItemId: string;
  sectionId: string;
  matchedRateId: string;
  matchedDescription: string;
  confidence: number; // 0–100
  confidenceLevel: 'high' | 'medium' | 'low';
  suggestedRates: {
    materialsRate: number;
    labourRate: number;
    plantRate: number;
    subcontractRate: number;
  };
  matchReason: string;
  status: 'pending' | 'accepted' | 'dismissed';
}

// ── Settings Types ───────────────────────────────────

export interface CompanyProfile {
  name: string;
  registrationNo: string;
  vatNo: string;
  logoUrl: string;
}

export interface AppSettings {
  companyProfile: CompanyProfile;
  defaultCurrency: Currency;
  defaultVatRate: number;
  defaultOverheadsPct: number;
  defaultProfitPct: number;
  measurementStandard: MeasurementStandard;
  autoSaveIntervalMs: number;
  tableDensity: 'compact' | 'normal' | 'comfortable';
}

// ── Activity Types ───────────────────────────────────

export interface ActivityEntry {
  id: string;
  projectId: string;
  projectName: string;
  action: string;
  timestamp: string;
}
