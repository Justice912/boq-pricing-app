import { useState } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { ProjectForm } from '@/components/dashboard/ProjectForm';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Plus, FolderOpen, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ProjectStatus } from '@/types';

export function Projects() {
  const projects = useProjectStore((s) => s.projects);
  const [showNewProject, setShowNewProject] = useState(false);
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = projects.filter((p) => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.client.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const statusTabs: { value: ProjectStatus | 'all'; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: projects.length },
    { value: 'draft', label: 'Draft', count: projects.filter((p) => p.status === 'draft').length },
    { value: 'priced', label: 'Priced', count: projects.filter((p) => p.status === 'priced').length },
    { value: 'submitted', label: 'Submitted', count: projects.filter((p) => p.status === 'submitted').length },
    { value: 'awarded', label: 'Awarded', count: projects.filter((p) => p.status === 'awarded').length },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-navy-900">Projects</h1>
          <p className="text-sm text-slate-500 mt-1">Manage all your BOQ pricing projects</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setShowNewProject(true)}>
          New Project
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        {/* Status Tabs */}
        <div className="flex items-center bg-slate-100 rounded-lg p-1 gap-0.5">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterStatus(tab.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                filterStatus === tab.value
                  ? 'bg-white text-navy-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1.5 text-[10px] opacity-60">({tab.count})</span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-8 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg placeholder:text-slate-400 text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
          />
        </div>
      </div>

      {/* Project Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <EmptyState
            icon={<FolderOpen size={28} />}
            title={searchQuery ? 'No matching projects' : 'No projects yet'}
            description={
              searchQuery
                ? 'Try adjusting your search or filter criteria.'
                : 'Create your first BOQ project to get started.'
            }
            action={
              !searchQuery ? (
                <Button size="sm" icon={<Plus size={14} />} onClick={() => setShowNewProject(true)}>
                  Create Project
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* New Project Modal */}
      <Modal open={showNewProject} onClose={() => setShowNewProject(false)} title="Create New Project" size="lg">
        <ProjectForm onSuccess={() => setShowNewProject(false)} onCancel={() => setShowNewProject(false)} />
      </Modal>
    </motion.div>
  );
}
