import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import { computeTotalRate } from '@/lib/utils';
import { INDUSTRIES } from '@/data/industries';
import type { Project, ProjectStatus, BOQSection, BOQItem, ActivityEntry } from '@/types';

interface ProjectState {
  projects: Project[];
  activities: ActivityEntry[];
  activeProjectId: string | null;

  // CRUD
  createProject: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'totalValue' | 'boqSections' | 'status'>) => string;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setActiveProject: (id: string | null) => void;
  updateProjectStatus: (id: string, status: ProjectStatus) => void;

  // BOQ sections on a project
  setProjectSections: (projectId: string, sections: BOQSection[]) => void;
  updateProjectTotal: (projectId: string, total: number) => void;

  // ── Granular BOQ operations ──────────────────────────
  addSection: (projectId: string, name: string, sectionNo?: string) => string;
  removeSection: (projectId: string, sectionId: string) => void;
  updateSection: (projectId: string, sectionId: string, data: Partial<Pick<BOQSection, 'name' | 'sectionNo'>>) => void;

  addItem: (projectId: string, sectionId: string, item?: Partial<BOQItem>) => string;
  removeItem: (projectId: string, sectionId: string, itemId: string) => void;
  updateItem: (projectId: string, sectionId: string, itemId: string, data: Partial<BOQItem>) => void;
  duplicateItem: (projectId: string, sectionId: string, itemId: string) => string;

  loadTemplate: (projectId: string, industryId: string, defaultOverheads: number, defaultProfit: number) => void;
  recalcProject: (projectId: string) => void;

  // Activity log
  addActivity: (projectId: string, projectName: string, action: string) => void;

  // Derived
  getProject: (id: string) => Project | undefined;
}

function makeBlankItem(sectionNo: string, index: number, overrides?: Partial<BOQItem>): BOQItem {
  return {
    id: uuid(),
    itemNo: `${sectionNo}.${String(index).padStart(2, '0')}`,
    description: '',
    unit: 'nr',
    quantity: 0,
    materialsRate: 0,
    labourRate: 0,
    plantRate: 0,
    subcontractRate: 0,
    overheadsPct: 10,
    profitPct: 10,
    totalRate: 0,
    totalAmount: 0,
    rateItemId: '',
    confidence: 'Estimated',
    isCustomRate: true,
    notes: '',
    ...overrides,
  };
}

function recalcItem(item: BOQItem): BOQItem {
  const totalRate = computeTotalRate(
    item.materialsRate,
    item.labourRate,
    item.plantRate,
    item.subcontractRate,
    item.overheadsPct,
    item.profitPct,
  );
  return { ...item, totalRate, totalAmount: item.quantity * totalRate };
}

function recalcSections(sections: BOQSection[]): { sections: BOQSection[]; total: number } {
  let total = 0;
  const updated = sections.map((sec) => {
    const items = sec.items.map(recalcItem);
    const sectionTotal = items.reduce((sum, it) => sum + it.totalAmount, 0);
    total += sectionTotal;
    return { ...sec, items };
  });
  return { sections: updated, total };
}

/** Helper: update sections for a project, recalculate, and persist */
function withSections(
  state: { projects: Project[] },
  projectId: string,
  fn: (sections: BOQSection[], project: Project) => BOQSection[],
): Partial<{ projects: Project[] }> {
  return {
    projects: state.projects.map((p) => {
      if (p.id !== projectId) return p;
      const newSections = fn(p.boqSections, p);
      const { sections, total } = recalcSections(newSections);
      return { ...p, boqSections: sections, totalValue: total, updatedAt: new Date().toISOString() };
    }),
  };
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      activities: [],
      activeProjectId: null,

      createProject: (data) => {
        const id = uuid();
        const now = new Date().toISOString();
        const project: Project = {
          ...data,
          id,
          status: 'draft',
          createdAt: now,
          updatedAt: now,
          totalValue: 0,
          boqSections: [],
        };
        set((state) => ({
          projects: [project, ...state.projects],
        }));
        get().addActivity(id, data.name, 'Project created');
        return id;
      },

      updateProject: (id, data) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p,
          ),
        })),

      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          activeProjectId: state.activeProjectId === id ? null : state.activeProjectId,
        })),

      setActiveProject: (id) => set({ activeProjectId: id }),

      updateProjectStatus: (id, status) => {
        const project = get().projects.find((p) => p.id === id);
        if (project) {
          get().updateProject(id, { status });
          get().addActivity(id, project.name, `Status changed to ${status}`);
        }
      },

      setProjectSections: (projectId, sections) =>
        get().updateProject(projectId, { boqSections: sections }),

      updateProjectTotal: (projectId, total) =>
        get().updateProject(projectId, { totalValue: total }),

      // ── Granular BOQ operations ──────────────────────────

      addSection: (projectId, name, sectionNo) => {
        const sectionId = uuid();
        set((state) => {
          const project = state.projects.find((p) => p.id === projectId);
          const nextNo = sectionNo || String.fromCharCode(65 + (project?.boqSections.length ?? 0));
          return withSections(state, projectId, (sections) => [
            ...sections,
            { id: sectionId, sectionNo: nextNo, name, items: [] },
          ]);
        });
        return sectionId;
      },

      removeSection: (projectId, sectionId) =>
        set((state) => withSections(state, projectId, (sections) =>
          sections.filter((s) => s.id !== sectionId),
        )),

      updateSection: (projectId, sectionId, data) =>
        set((state) => withSections(state, projectId, (sections) =>
          sections.map((s) => (s.id === sectionId ? { ...s, ...data } : s)),
        )),

      addItem: (projectId, sectionId, itemOverrides) => {
        const itemId = uuid();
        set((state) => withSections(state, projectId, (sections) =>
          sections.map((sec) => {
            if (sec.id !== sectionId) return sec;
            const idx = sec.items.length + 1;
            const item = makeBlankItem(sec.sectionNo, idx, { ...itemOverrides, id: itemId });
            return { ...sec, items: [...sec.items, recalcItem(item)] };
          }),
        ));
        return itemId;
      },

      removeItem: (projectId, sectionId, itemId) =>
        set((state) => withSections(state, projectId, (sections) =>
          sections.map((sec) => {
            if (sec.id !== sectionId) return sec;
            return { ...sec, items: sec.items.filter((it) => it.id !== itemId) };
          }),
        )),

      updateItem: (projectId, sectionId, itemId, data) =>
        set((state) => withSections(state, projectId, (sections) =>
          sections.map((sec) => {
            if (sec.id !== sectionId) return sec;
            return {
              ...sec,
              items: sec.items.map((it) =>
                it.id === itemId ? recalcItem({ ...it, ...data }) : it,
              ),
            };
          }),
        )),

      duplicateItem: (projectId, sectionId, itemId) => {
        const newId = uuid();
        set((state) => withSections(state, projectId, (sections) =>
          sections.map((sec) => {
            if (sec.id !== sectionId) return sec;
            const idx = sec.items.findIndex((it) => it.id === itemId);
            if (idx < 0) return sec;
            const clone = { ...sec.items[idx], id: newId, itemNo: `${sec.sectionNo}.${String(sec.items.length + 1).padStart(2, '0')}` };
            const items = [...sec.items];
            items.splice(idx + 1, 0, clone);
            return { ...sec, items };
          }),
        ));
        return newId;
      },

      loadTemplate: (projectId, industryId, defaultOverheads, defaultProfit) => {
        const industry = INDUSTRIES.find((i) => i.id === industryId);
        if (!industry) return;
        const sections: BOQSection[] = industry.trades.map((trade) => ({
          id: uuid(),
          sectionNo: trade.sectionNo,
          name: trade.name,
          items: trade.defaultItems.map((di, idx) =>
            recalcItem(makeBlankItem(trade.sectionNo, idx + 1, {
              description: di.description,
              unit: di.unit,
              overheadsPct: defaultOverheads,
              profitPct: defaultProfit,
            })),
          ),
        }));
        set((state) => withSections(state, projectId, () => sections));
        const project = get().projects.find((p) => p.id === projectId);
        if (project) {
          get().addActivity(projectId, project.name, `Loaded ${industry.name} template (${sections.length} sections)`);
        }
      },

      recalcProject: (projectId) =>
        set((state) => withSections(state, projectId, (sections) => sections)),

      addActivity: (projectId, projectName, action) =>
        set((state) => ({
          activities: [
            {
              id: uuid(),
              projectId,
              projectName,
              action,
              timestamp: new Date().toISOString(),
            },
            ...state.activities.slice(0, 49),
          ],
        })),

      getProject: (id) => get().projects.find((p) => p.id === id),
    }),
    { name: 'boq-projects' },
  ),
);
