import { useState, useEffect } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { useRateLibraryStore } from '@/stores/rateLibraryStore';
import { BOQTable } from '@/components/boq/BOQTable';
import { BOQToolbar } from '@/components/boq/BOQToolbar';
import { BOQSummary } from '@/components/boq/BOQSummary';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table2, FolderOpen, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { generatePricingSuggestions } from '@/lib/aiPricing';
import type { AIPricingSuggestion } from '@/types';

export function BOQEditor() {
  const projects = useProjectStore((s) => s.projects);
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const setActiveProject = useProjectStore((s) => s.setActiveProject);
  const updateItem = useProjectStore((s) => s.updateItem);
  const rates = useRateLibraryStore((s) => s.rates);

  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showSummary, setShowSummary] = useState(true);
  const [suggestions, setSuggestions] = useState<AIPricingSuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Auto-select first project if none active
  useEffect(() => {
    if (!activeProjectId && projects.length > 0) {
      setActiveProject(projects[0].id);
    }
  }, [activeProjectId, projects, setActiveProject]);

  const project = projects.find((p) => p.id === activeProjectId);

  const handleAutoPrice = () => {
    if (!project) return;
    setIsGenerating(true);
    setTimeout(() => {
      const generated = generatePricingSuggestions(project, rates);
      setSuggestions(generated);
      setIsGenerating(false);
    }, 800);
  };

  const handleAcceptSuggestion = (suggestionId: string) => {
    const suggestion = suggestions.find((s) => s.id === suggestionId);
    if (!suggestion || !project) return;
    updateItem(project.id, suggestion.sectionId, suggestion.boqItemId, {
      materialsRate: suggestion.suggestedRates.materialsRate,
      labourRate: suggestion.suggestedRates.labourRate,
      plantRate: suggestion.suggestedRates.plantRate,
      subcontractRate: suggestion.suggestedRates.subcontractRate,
      confidence: 'Estimated',
      isCustomRate: false,
    });
    setSuggestions((prev) =>
      prev.map((s) => (s.id === suggestionId ? { ...s, status: 'accepted' } : s)),
    );
  };

  const handleDismissSuggestion = (suggestionId: string) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === suggestionId ? { ...s, status: 'dismissed' } : s)),
    );
  };

  const handleAcceptAllHigh = () => {
    if (!project) return;
    const highPending = suggestions.filter(
      (s) => s.status === 'pending' && s.confidenceLevel === 'high',
    );
    highPending.forEach((suggestion) => {
      updateItem(project.id, suggestion.sectionId, suggestion.boqItemId, {
        materialsRate: suggestion.suggestedRates.materialsRate,
        labourRate: suggestion.suggestedRates.labourRate,
        plantRate: suggestion.suggestedRates.plantRate,
        subcontractRate: suggestion.suggestedRates.subcontractRate,
        confidence: 'Estimated',
        isCustomRate: false,
      });
    });
    setSuggestions((prev) =>
      prev.map((s) =>
        s.status === 'pending' && s.confidenceLevel === 'high'
          ? { ...s, status: 'accepted' }
          : s,
      ),
    );
  };

  const handleDismissAll = () => {
    setSuggestions((prev) =>
      prev.map((s) => (s.status === 'pending' ? { ...s, status: 'dismissed' } : s)),
    );
  };

  const handleClearSuggestions = () => {
    setSuggestions([]);
  };

  // No projects at all
  if (projects.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="mb-6">
          <h1 className="text-2xl font-heading font-bold text-navy-900">BOQ Editor</h1>
          <p className="text-sm text-slate-500 mt-1">Spreadsheet-like bill of quantities editor</p>
        </div>
        <Card padding="lg">
          <EmptyState
            icon={<FolderOpen size={28} />}
            title="No projects yet"
            description="Create a project from the Dashboard first, then come back to edit the BOQ."
          />
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-navy-900">BOQ Editor</h1>
          <p className="text-sm text-slate-500 mt-0.5">Spreadsheet-like bill of quantities editor</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Project selector */}
          <select
            value={activeProjectId || ''}
            onChange={(e) => setActiveProject(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 max-w-[250px]"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {/* Summary toggle */}
          <Button
            size="sm"
            variant="ghost"
            icon={showSummary ? <PanelRightClose size={14} /> : <PanelRightOpen size={14} />}
            onClick={() => setShowSummary(!showSummary)}
          >
            Summary
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      {project && (
        <div className="mb-3">
          <BOQToolbar
            project={project}
            showBreakdown={showBreakdown}
            onToggleBreakdown={() => setShowBreakdown(!showBreakdown)}
            onAutoPrice={handleAutoPrice}
            isGenerating={isGenerating}
            suggestions={suggestions}
            onAcceptAllHigh={handleAcceptAllHigh}
            onDismissAll={handleDismissAll}
            onClearSuggestions={handleClearSuggestions}
          />
        </div>
      )}

      {/* Main content */}
      <div className={cn('grid gap-4', showSummary ? 'grid-cols-1 xl:grid-cols-[1fr_280px]' : 'grid-cols-1')}>
        {/* Table */}
        <div className="min-w-0">
          {project ? (
            <BOQTable
              project={project}
              showBreakdown={showBreakdown}
              suggestions={suggestions}
              onAcceptSuggestion={handleAcceptSuggestion}
              onDismissSuggestion={handleDismissSuggestion}
            />
          ) : (
            <Card padding="lg">
              <EmptyState
                icon={<Table2 size={28} />}
                title="Select a project"
                description="Choose a project from the dropdown to start editing the BOQ."
              />
            </Card>
          )}
        </div>

        {/* Summary panel */}
        {showSummary && project && (
          <div className="min-w-0">
            <BOQSummary project={project} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
