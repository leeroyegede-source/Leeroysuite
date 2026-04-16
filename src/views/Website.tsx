import Hero from '@/components/website/Hero'
import React from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { constructFullHtml } from '@/utils/htmlProcessor';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const Website = () => {
  return (
    <div>
      <Hero />
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Your Projects</h2>
          <a href="/playground" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition">
            + New Project
          </a>
        </div>
        <ProjectsList />
      </div>
    </div>
  )
}

const ProjectsList = () => {
  const [projects, setProjects] = React.useState<any[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [projectToDelete, setProjectToDelete] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const fetchProjects = () => {
    fetch('/api/website/save').then(res => res.json()).then(data => {
      if (Array.isArray(data)) setProjects(data);
    })
  };

  React.useEffect(() => {
    fetchProjects();
  }, []);

  const triggerDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setProjectToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/website/save?id=${projectToDelete}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Project deleted");
        fetchProjects();
      } else {
        toast.error("Failed to delete project");
      }
    } catch (error: any) {
      toast.error("Error deleting project");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map(p => (
        <div key={p.id} className="border bg-card text-card-foreground p-5 rounded-xl hover:shadow-lg transition relative group overflow-hidden">

          {/* Preview Iframe */}
          <div className="w-full h-40 mb-4 bg-muted rounded-lg overflow-hidden border relative">
            <iframe
              srcDoc={constructFullHtml(p.code)}
              className="w-[200%] h-[200%] origin-top-left scale-50 pointer-events-none border-0"
              title={p.name}
              tabIndex={-1}
              sandbox="allow-scripts" // Minimal permission for rendering styling but no navigation/forms actions ideally
            />
            {/* Overlay to catch clicks if pointer-events-none fails or for extra safety */}
            <div className="absolute inset-0 bg-transparent" />
          </div>

          <h3 className="font-bold text-base mb-1 truncate" title={p.name}>{p.name}</h3>
          <p className="text-xs text-muted-foreground mb-4">Last updated: {new Date(p.updatedAt).toLocaleDateString()}</p>

          <div className="flex justify-between items-center mt-4">
            <a href={`/playground?projectId=${p.id}&userprompt=${encodeURIComponent(p.name)}`} className="text-sm font-medium text-blue-500 hover:text-blue-600">
              Edit Project
            </a>
            <button
              onClick={(e) => triggerDelete(p.id, e)}
              className="text-red-500 hover:bg-red-50 p-2 rounded-md transition"
              title="Delete Project"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
      {projects.length === 0 && (
        <div className="col-span-full text-center py-10 text-muted-foreground">
          <p>No projects yet. Create your first AI website!</p>
        </div>
      )}

      <ConfirmDialog 
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Project"
        description="Are you sure you want to delete this project? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  )
}

export default Website
