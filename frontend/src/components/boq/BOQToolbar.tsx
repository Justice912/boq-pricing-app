import { useState } from 'react';
import { Plus, Layers, Eye, EyeOff, Sparkles, CheckCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useProjectStore } from '@/stores/projectStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { INDUSTRIES } from '@/data/industries';
import { suggestionStats } from '@/lib/aiPricing';
import { cn } from '@/lib/utils';
import type { Project, AIPricingSuggestion } from '@/types';

interface BOQToolbarProps {
  project: Project;
  showBreakdown: boolean;
  onToggleBreakdown: () => void;
  // AI pricing props
  onAutoPrice?: () => void;
  isGenerating?: boolean;
  suggestions?: AIPricingSuggestion[];
  onAcceptAllHigh?: () => void;
  onDismissAll?: () => void;
  onClearSuggestions?: () => void;
}

export function BOQToolbar({
  project,
  showBreakdown,
  onToggleBreakdown,
  onAutoPrice,
  isGenerating = false,
  suggestions = [],
  onAcceptAllHigh,
  onDismissAll,
  onClearSuggestions,
}: BOQToolbarProps) {
  const { addSection, loadTemplate } = useProjectStore();
  const settings = useSettingsStore((s) => s.settings);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);
  const [sectionName, setSectionName] = useState('');

  const handleAddSection = () => {
    if (!sectionName.trim()) return;
    addSection(project.id, sectionName.trim());
    setSectionName('');
    setShowAddSection(false);
  };

  const handleLoadTemplate = (industryId: string) => {
    loadTemplate(project.id, industryId, settings.defaultOverheadsPct, settings.defaultProfitPct);
    setShowTemplateModal(false);
  };

  const currentIndustry = INDUSTRIES.find((i) => i.id === project.industryId);

  const stats = suggestionStats(suggestions);
  const hasPending = stats.pending > 0;
  const hasHighPending = stats.highConfidence > 0;
  const hasSuggestions = suggestions.length > 0;

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        {/* Add Section */}
        {showAddSection ? (
          <div className="flex items-center gap-2">
            <input
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddSection(); if (e.key === 'Escape') setShowAddSection(false); }}
              placeholder="Section name..."
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              autoFocus
            />
            <Button size="sm" onClick={handleAddSection} disabled={!sectionName.trim()}>Add</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowAddSection(false)}>Cancel</Button>
          </div>
        ) : (
          <Button size="sm" variant="secondary" icon={<Plus size={14} />} onClick={() => setShowAddSection(true)}>
            Add Section
          </Button>
        )}

        {/* Load Template */}
        <Button size="sm" variant="secondary" icon={<Layers size={14} />} onClick={() => setShowTemplateModal(true)}>
          Load Template
        </Button>

        {/* Auto-Price button */}
        <button
          onClick={onAutoPrice}
          disabled={isGenerating}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all',
            'bg-gradient-to-r from-amber-500 to-amber-400 text-white shadow-sm',
            'hover:from-amber-600 hover:to-amber-500 hover:shadow-md',
            'disabled:opacity-60 disabled:cursor-not-allowed',
            'focus:outline-none focus:ring-2 focus:ring-amber-500/40',
          )}
        >
          <Sparkles
            size={14}
            className={cn(isGenerating && 'animate-spin')}
          />
          {isGenerating ? 'Generating...' : 'Auto-Price'}
        </button>

        {/* Suggestion controls — shown when suggestions exist and have pending items */}
        {hasSuggestions && hasPending && (
          <>
            {/* Stats pill */}
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
              {stats.pending} suggestion{stats.pending !== 1 ? 's' : ''}
            </span>

            {/* Accept All High — only when high-confidence pending exist */}
            {hasHighPending && (
              <button
                onClick={onAcceptAllHigh}
                className={cn(
                  'inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg transition-all',
                  'bg-emerald-100 text-emerald-700 border border-emerald-200',
                  'hover:bg-emerald-200 hover:border-emerald-300',
                  'focus:outline-none focus:ring-2 focus:ring-emerald-500/30',
                )}
              >
                <CheckCheck size={12} />
                Accept All High
              </button>
            )}

            {/* Dismiss All */}
            <button
              onClick={onDismissAll}
              className={cn(
                'inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg transition-all',
                'text-slate-600 border border-slate-200 bg-white',
                'hover:bg-slate-50 hover:border-slate-300',
                'focus:outline-none focus:ring-2 focus:ring-slate-400/30',
              )}
            >
              Dismiss All
            </button>
          </>
        )}

        {/* Clear — shown when suggestions exist (even if all accepted/dismissed) */}
        {hasSuggestions && (
          <button
            onClick={onClearSuggestions}
            className={cn(
              'inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg transition-all',
              'text-slate-500 border border-slate-200 bg-white',
              'hover:bg-slate-50 hover:text-slate-700',
              'focus:outline-none focus:ring-2 focus:ring-slate-400/30',
            )}
          >
            <X size={12} />
            Clear
          </button>
        )}

        <div className="flex-1" />

        {/* Toggle Breakdown */}
        <Button
          size="sm"
          variant="ghost"
          icon={showBreakdown ? <EyeOff size={14} /> : <Eye size={14} />}
          onClick={onToggleBreakdown}
        >
          {showBreakdown ? 'Hide Breakdown' : 'Show Breakdown'}
        </Button>
      </div>

      {/* Load Template Modal */}
      <Modal open={showTemplateModal} onClose={() => setShowTemplateModal(false)} title="Load Industry Template" size="lg">
        <div className="space-y-3">
          <p className="text-sm text-slate-500">
            Choose an industry template to populate the BOQ with standard trade sections and items.
            {project.boqSections.length > 0 && (
              <span className="block mt-1 text-orange-600 font-medium">
                Warning: This will replace existing sections and items.
              </span>
            )}
          </p>

          {/* Quick load for current industry */}
          {currentIndustry && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-navy-800">{currentIndustry.name}</p>
                  <p className="text-xs text-slate-500">
                    {currentIndustry.trades.length} sections, {currentIndustry.trades.reduce((sum, t) => sum + t.defaultItems.length, 0)} items
                  </p>
                </div>
                <Button size="sm" onClick={() => handleLoadTemplate(currentIndustry.id)}>
                  Load This
                </Button>
              </div>
            </div>
          )}

          {/* All industries */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto">
            {INDUSTRIES.filter((i) => i.id !== project.industryId).map((industry) => (
              <button
                key={industry.id}
                onClick={() => handleLoadTemplate(industry.id)}
                className="p-3 text-left border border-slate-200 rounded-lg hover:border-amber-400 hover:bg-amber-50 transition-all"
              >
                <p className="text-sm font-medium text-navy-800">{industry.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {industry.trades.length} sections, {industry.trades.reduce((sum, t) => sum + t.defaultItems.length, 0)} items
                </p>
              </button>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="secondary" onClick={() => setShowTemplateModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
