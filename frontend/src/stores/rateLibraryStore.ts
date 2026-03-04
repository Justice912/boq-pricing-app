import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import { computeTotalRate } from '@/lib/utils';
import type { RateEntry, ConfidenceLevel } from '@/types';

interface RateLibraryState {
  rates: RateEntry[];
  searchQuery: string;
  filterIndustry: string;
  filterTrade: string;

  // Actions
  setSearchQuery: (q: string) => void;
  setFilterIndustry: (id: string) => void;
  setFilterTrade: (trade: string) => void;
  addRate: (data: Omit<RateEntry, 'id' | 'totalRate' | 'lastUpdated'>) => string;
  updateRate: (id: string, data: Partial<RateEntry>) => void;
  deleteRate: (id: string) => void;
  seedRates: (rates: RateEntry[]) => void;

  // Derived
  getFilteredRates: () => RateEntry[];
  findMatchingRates: (description: string, unit: string, industryId?: string) => RateEntry[];
}

// Seed data derived from the existing Rate_Library.csv
function createSeedRates(): RateEntry[] {
  const raw: Array<{
    desc: string; unit: string; mat: number; lab: number; plant: number; sub: number;
    trade: string; source: string; confidence: ConfidenceLevel;
  }> = [
    // Earthworks
    { desc: 'Trenches excavation in earth not exceeding 3.5m', unit: 'm³', mat: 0, lab: 85, plant: 65, sub: 0, trade: 'Earthworks', source: 'Excavation - localpros.co.za', confidence: 'Verified' },
    { desc: 'Shoring to sides of trench excavations not exceeding 3.5m deep', unit: 'm²', mat: 15, lab: 25, plant: 10, sub: 0, trade: 'Earthworks', source: 'Shoring rates', confidence: 'Verified' },
    { desc: 'Excavation in soft rock', unit: 'm³', mat: 0, lab: 180, plant: 120, sub: 0, trade: 'Earthworks', source: 'Rock excavation', confidence: 'Verified' },
    { desc: 'Excavation in hard rock', unit: 'm³', mat: 0, lab: 350, plant: 250, sub: 0, trade: 'Earthworks', source: 'Rock excavation', confidence: 'Verified' },
    { desc: 'Cart away surplus material to dump', unit: 'm³', mat: 0, lab: 45, plant: 105, sub: 0, trade: 'Earthworks', source: 'Carting away', confidence: 'Verified' },
    { desc: 'Backfilling to trenches compacted to 98% Mod AASHTO', unit: 'm³', mat: 0, lab: 85, plant: 65, sub: 0, trade: 'Earthworks', source: 'Excavation - localpros.co.za', confidence: 'Verified' },
    { desc: 'G5 filling material compacted to 93% Mod AASHTO', unit: 'm³', mat: 200, lab: 75, plant: 25, sub: 0, trade: 'Earthworks', source: 'G5 filling', confidence: 'Verified' },
    { desc: 'Earth filling under floors compacted to 98% Mod AASHTO', unit: 'm³', mat: 180, lab: 65, plant: 55, sub: 0, trade: 'Earthworks', source: 'Fill material', confidence: 'Verified' },
    { desc: 'Course river sand filling under floors 50mm thick', unit: 'm²', mat: 30, lab: 15, plant: 5, sub: 0, trade: 'Earthworks', source: 'Sand blinding', confidence: 'Estimated' },
    { desc: 'Soil insecticide treatment under floors', unit: 'm²', mat: 65, lab: 35, plant: 0, sub: 0, trade: 'Earthworks', source: 'Termite treatment', confidence: 'Estimated' },
    { desc: 'Prescribed density tests (Modified AASHTO)', unit: 'nr', mat: 0, lab: 0, plant: 350, sub: 0, trade: 'Earthworks', source: 'Density test', confidence: 'Verified' },
    // Concrete & Formwork
    { desc: '10MPa/19mm concrete surface blinding under footings', unit: 'm²', mat: 75, lab: 35, plant: 10, sub: 0, trade: 'Concrete & Formwork', source: '10MPa blinding', confidence: 'Verified' },
    { desc: '25MPa/19mm concrete strip footings', unit: 'm³', mat: 1250, lab: 400, plant: 150, sub: 0, trade: 'Concrete & Formwork', source: '25MPa concrete', confidence: 'Verified' },
    { desc: '25MPa/19mm concrete surface beds on waterproofing', unit: 'm³', mat: 1250, lab: 400, plant: 150, sub: 0, trade: 'Concrete & Formwork', source: '25MPa concrete', confidence: 'Verified' },
    { desc: '30MPa/19mm concrete pad bases', unit: 'm³', mat: 1400, lab: 450, plant: 150, sub: 0, trade: 'Concrete & Formwork', source: '30MPa concrete', confidence: 'Verified' },
    { desc: '30MPa/19mm concrete suspended slabs 170mm thick', unit: 'm²', mat: 280, lab: 120, plant: 50, sub: 0, trade: 'Concrete & Formwork', source: '30MPa slab', confidence: 'Verified' },
    { desc: '30MPa/19mm concrete columns 300x300mm', unit: 'm', mat: 380, lab: 180, plant: 60, sub: 0, trade: 'Concrete & Formwork', source: '30MPa column', confidence: 'Estimated' },
    { desc: 'Rough formwork to sides of strip footings ≤500mm high', unit: 'm²', mat: 45, lab: 85, plant: 5, sub: 0, trade: 'Concrete & Formwork', source: 'Formwork rates', confidence: 'Verified' },
    { desc: 'Smooth formwork to soffits of suspended slabs 2.8-3.5m', unit: 'm²', mat: 55, lab: 120, plant: 10, sub: 0, trade: 'Concrete & Formwork', source: 'Formwork rates', confidence: 'Verified' },
    // Reinforcement
    { desc: 'High-tensile reinforcement 10mm diameter', unit: 'kg', mat: 14, lab: 5, plant: 1, sub: 0, trade: 'Reinforcement', source: 'Rebar rates', confidence: 'Verified' },
    { desc: 'High-tensile reinforcement 12mm diameter', unit: 'kg', mat: 14, lab: 4.5, plant: 1, sub: 0, trade: 'Reinforcement', source: 'Rebar rates', confidence: 'Verified' },
    { desc: 'High-tensile reinforcement 16mm diameter', unit: 'kg', mat: 13, lab: 4, plant: 1, sub: 0, trade: 'Reinforcement', source: 'Rebar rates', confidence: 'Verified' },
    { desc: 'Mesh ref 193 (3.95kg/m²)', unit: 'm²', mat: 55, lab: 18, plant: 2, sub: 0, trade: 'Reinforcement', source: 'Mesh rates', confidence: 'Estimated' },
    // Masonry
    { desc: '230mm walls in NFP bricks class II in CM 1:4', unit: 'm²', mat: 280, lab: 180, plant: 5, sub: 0, trade: 'Masonry', source: 'Brick rates', confidence: 'Verified' },
    { desc: '110mm walls in NFP bricks class II in CM 1:4', unit: 'm²', mat: 140, lab: 120, plant: 5, sub: 0, trade: 'Masonry', source: 'Brick rates', confidence: 'Verified' },
    { desc: '190mm hollow block walls in CM 1:4', unit: 'm²', mat: 180, lab: 150, plant: 5, sub: 0, trade: 'Masonry', source: 'Block rates', confidence: 'Verified' },
    { desc: 'DPC 375mm wide bituminous sheeting', unit: 'm', mat: 35, lab: 15, plant: 0, sub: 0, trade: 'Masonry', source: 'DPC rates', confidence: 'Estimated' },
    // Waterproofing
    { desc: 'Torch-on waterproofing membrane to roof', unit: 'm²', mat: 120, lab: 80, plant: 5, sub: 0, trade: 'Waterproofing', source: 'Membrane rates', confidence: 'Verified' },
    { desc: '250 micron DPM under surface beds', unit: 'm²', mat: 12, lab: 8, plant: 0, sub: 0, trade: 'Waterproofing', source: 'DPM rates', confidence: 'Verified' },
    // Roofing
    { desc: 'Roof trusses to manufacturers design (timber)', unit: 'm²', mat: 350, lab: 80, plant: 20, sub: 0, trade: 'Roofing', source: 'Truss rates', confidence: 'Estimated' },
    { desc: 'Concrete roof tiles (standard profile) on battens', unit: 'm²', mat: 120, lab: 65, plant: 10, sub: 0, trade: 'Roofing', source: 'Tile rates', confidence: 'Verified' },
    { desc: 'IBR sheeting 0.5mm galvanised', unit: 'm²', mat: 95, lab: 45, plant: 10, sub: 0, trade: 'Roofing', source: 'Sheeting rates', confidence: 'Verified' },
    // Plastering
    { desc: 'Plaster to walls internally 15mm thick CM 1:4', unit: 'm²', mat: 25, lab: 65, plant: 2, sub: 0, trade: 'Plastering', source: 'Plaster rates', confidence: 'Verified' },
    { desc: 'Plaster to walls externally 20mm thick CM 1:4', unit: 'm²', mat: 35, lab: 75, plant: 3, sub: 0, trade: 'Plastering', source: 'Plaster rates', confidence: 'Verified' },
    { desc: 'Plaster to soffits 10mm thick CM 1:4', unit: 'm²', mat: 20, lab: 80, plant: 5, sub: 0, trade: 'Plastering', source: 'Plaster rates', confidence: 'Estimated' },
    // Tiling
    { desc: 'Floor tiles 300x300mm bedded in adhesive', unit: 'm²', mat: 180, lab: 85, plant: 0, sub: 0, trade: 'Tiling', source: 'Tile rates', confidence: 'Estimated' },
    { desc: 'Wall tiles 200x300mm bedded in adhesive', unit: 'm²', mat: 160, lab: 95, plant: 0, sub: 0, trade: 'Tiling', source: 'Tile rates', confidence: 'Estimated' },
    // Painting
    { desc: 'One coat primer, two coats PVA to internal walls', unit: 'm²', mat: 20, lab: 35, plant: 2, sub: 0, trade: 'Painting', source: 'Paint rates', confidence: 'Verified' },
    { desc: 'One coat primer, two coats acrylic to external walls', unit: 'm²', mat: 25, lab: 40, plant: 2, sub: 0, trade: 'Painting', source: 'Paint rates', confidence: 'Verified' },
    // Plumbing
    { desc: '15mm copper pipe and fittings', unit: 'm', mat: 85, lab: 65, plant: 0, sub: 0, trade: 'Plumbing & Drainage', source: 'Pipe rates', confidence: 'Verified' },
    { desc: '110mm PVC drain pipe', unit: 'm', mat: 45, lab: 55, plant: 5, sub: 0, trade: 'Plumbing & Drainage', source: 'Pipe rates', confidence: 'Verified' },
    { desc: 'Washhand basin white vitreous china complete', unit: 'nr', mat: 1800, lab: 450, plant: 0, sub: 0, trade: 'Plumbing & Drainage', source: 'Sanitary ware', confidence: 'Estimated' },
    { desc: 'WC suite close-coupled white complete', unit: 'nr', mat: 2500, lab: 650, plant: 0, sub: 0, trade: 'Plumbing & Drainage', source: 'Sanitary ware', confidence: 'Estimated' },
    // Electrical
    { desc: 'Single 16A socket outlet complete', unit: 'nr', mat: 180, lab: 250, plant: 0, sub: 0, trade: 'Electrical', source: 'Electrical rates', confidence: 'Verified' },
    { desc: 'Double 16A socket outlet complete', unit: 'nr', mat: 220, lab: 280, plant: 0, sub: 0, trade: 'Electrical', source: 'Electrical rates', confidence: 'Verified' },
    { desc: 'Light point and switch (single) complete', unit: 'nr', mat: 350, lab: 300, plant: 0, sub: 0, trade: 'Electrical', source: 'Electrical rates', confidence: 'Verified' },
    { desc: 'DB board 12-way complete with MCBs', unit: 'nr', mat: 3500, lab: 1200, plant: 0, sub: 0, trade: 'Electrical', source: 'Electrical rates', confidence: 'Estimated' },
  ];

  return raw.map((r) => {
    const total = computeTotalRate(r.mat, r.lab, r.plant, r.sub, 10, 10);
    return {
      id: uuid(),
      industryId: 'building-construction',
      tradeSection: r.trade,
      description: r.desc,
      unit: r.unit,
      materialsRate: r.mat,
      labourRate: r.lab,
      plantRate: r.plant,
      subcontractRate: r.sub,
      totalRate: total,
      source: 'imported' as const,
      lastUpdated: new Date().toISOString(),
      region: 'Gauteng',
      confidence: r.confidence,
    };
  });
}

export const useRateLibraryStore = create<RateLibraryState>()(
  persist(
    (set, get) => ({
      rates: createSeedRates(),
      searchQuery: '',
      filterIndustry: '',
      filterTrade: '',

      setSearchQuery: (q) => set({ searchQuery: q }),
      setFilterIndustry: (id) => set({ filterIndustry: id }),
      setFilterTrade: (trade) => set({ filterTrade: trade }),

      addRate: (data) => {
        const id = uuid();
        const totalRate = computeTotalRate(data.materialsRate, data.labourRate, data.plantRate, data.subcontractRate, 10, 10);
        set((state) => ({
          rates: [{ ...data, id, totalRate, lastUpdated: new Date().toISOString() }, ...state.rates],
        }));
        return id;
      },

      updateRate: (id, data) =>
        set((state) => ({
          rates: state.rates.map((r) => {
            if (r.id !== id) return r;
            const updated = { ...r, ...data, lastUpdated: new Date().toISOString() };
            updated.totalRate = computeTotalRate(updated.materialsRate, updated.labourRate, updated.plantRate, updated.subcontractRate, 10, 10);
            return updated;
          }),
        })),

      deleteRate: (id) =>
        set((state) => ({ rates: state.rates.filter((r) => r.id !== id) })),

      seedRates: (rates) => set({ rates }),

      getFilteredRates: () => {
        const { rates, searchQuery, filterIndustry, filterTrade } = get();
        let filtered = rates;
        if (filterIndustry) filtered = filtered.filter((r) => r.industryId === filterIndustry);
        if (filterTrade) filtered = filtered.filter((r) => r.tradeSection === filterTrade);
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (r) =>
              r.description.toLowerCase().includes(q) ||
              r.tradeSection.toLowerCase().includes(q) ||
              r.unit.toLowerCase().includes(q),
          );
        }
        return filtered;
      },

      findMatchingRates: (description, unit, industryId) => {
        const { rates } = get();
        const words = description.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
        return rates
          .filter((r) => {
            if (industryId && r.industryId !== industryId) return false;
            const desc = r.description.toLowerCase();
            const matchCount = words.filter((w) => desc.includes(w)).length;
            return matchCount >= Math.min(2, words.length);
          })
          .slice(0, 5);
      },
    }),
    { name: 'boq-rate-library' },
  ),
);
