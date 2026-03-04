import { useState } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { ProjectForm } from '@/components/dashboard/ProjectForm';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Plus, FolderOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export function Dashboard() {
  const projects = useProjectStore((s) => s.projects);
  const [showNewProject, setShowNewProject] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-navy-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Overview of your BOQ pricing projects</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setShowNewProject(true)}>
          New Project
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="mb-8">
        <QuickStats />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects - 2 columns */}
        <div className="lg:col-span-2">
          <Card padding="lg">
            <CardHeader
              title="Projects"
              subtitle={`${projects.length} project${projects.length !== 1 ? 's' : ''}`}
              action={
                <Button variant="ghost" size="sm" icon={<Plus size={14} />} onClick={() => setShowNewProject(true)}>
                  Add
                </Button>
              }
            />

            {projects.length === 0 ? (
              <EmptyState
                icon={<FolderOpen size={28} />}
                title="No projects yet"
                description="Create your first BOQ project to get started with pricing."
                action={
                  <Button size="sm" icon={<Plus size={14} />} onClick={() => setShowNewProject(true)}>
                    Create Project
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Activity - 1 column */}
        <div>
          <Card padding="lg">
            <CardHeader title="Recent Activity" subtitle="Latest updates across projects" />
            <RecentActivity />
          </Card>
        </div>
      </div>

      {/* New Project Modal */}
      <Modal
        open={showNewProject}
        onClose={() => setShowNewProject(false)}
        title="Create New Project"
        size="lg"
      >
        <ProjectForm
          onSuccess={() => setShowNewProject(false)}
          onCancel={() => setShowNewProject(false)}
        />
      </Modal>
    </motion.div>
  );
}
