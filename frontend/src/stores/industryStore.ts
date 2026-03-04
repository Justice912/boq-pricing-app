import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface IndustryState {
  selectedIndustryId: string;
  setSelectedIndustry: (id: string) => void;
}

export const useIndustryStore = create<IndustryState>()(
  persist(
    (set) => ({
      selectedIndustryId: 'building-construction',
      setSelectedIndustry: (id) => set({ selectedIndustryId: id }),
    }),
    { name: 'boq-industry' },
  ),
);
