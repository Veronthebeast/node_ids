'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProjectsStore } from '@/stores/projects-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Folder,
  MoreVertical,
  Plus,
  Trash,
  Edit3,
  Search,
  Calendar,
  ExternalLink,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const {
    projects,
    isLoading,
    fetchProjects,
    createProject,
    updateProjectDb,
    deleteProjectDb,
  } = useProjectsStore();

  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog state for Creation
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);

  // Dialog state for Edit
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editProjectName, setEditProjectName] = useState('');
  const [editProjectDescription, setEditProjectDescription] = useState('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Dialog state for Delete Confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Filters projects based on search query
  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    setIsSubmittingCreate(true);
    const newId = await createProject(projectName.trim(), projectDescription.trim());
    setIsSubmittingCreate(false);
    if (newId) {
      setCreateDialogOpen(false);
      setProjectName('');
      setProjectDescription('');
      router.push(`/project/${newId}/canvas`);
    }
  };

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProjectId || !editProjectName.trim()) return;
    setIsSubmittingEdit(true);
    await updateProjectDb(
      editingProjectId,
      editProjectName.trim(),
      editProjectDescription.trim()
    );
    setIsSubmittingEdit(false);
    setEditDialogOpen(false);
    setEditingProjectId(null);
  };

  const handleDeleteProject = async () => {
    if (!deletingProjectId) return;
    setIsSubmittingDelete(true);
    await deleteProjectDb(deletingProjectId);
    setIsSubmittingDelete(false);
    setDeleteDialogOpen(false);
    setDeletingProjectId(null);
  };

  const openEditDialog = (id: string, name: string, desc: string) => {
    setEditingProjectId(id);
    setEditProjectName(name);
    setEditProjectDescription(desc);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (id: string) => {
    setDeletingProjectId(id);
    setDeleteDialogOpen(true);
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-surface-secondary/40">
      {/* Premium Gradient Hero Panel */}
      <div className="relative mb-8 rounded-2xl bg-gradient-to-r from-accent/90 via-accent to-purple-600 p-8 text-white shadow-lg overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              Tus Pizarras de NodeIDs
            </h1>
            <p className="mt-2 text-white/80 max-w-xl text-sm md:text-base">
              Crea mapas mentales, organiza tareas en nodos y construye flujos de trabajo infinitos. Todo conectado y en tiempo real.
            </p>
          </div>
          <Button
            id="create-project-hero-btn"
            onClick={() => setCreateDialogOpen(true)}
            className="self-start md:self-auto bg-white text-accent hover:bg-white/90 border-none font-semibold px-5 py-3 h-auto"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nueva Pizarra
          </Button>
        </div>
      </div>

      {/* Control Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" />
          <input
            id="project-search-input"
            type="text"
            placeholder="Buscar proyectos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-panel border border-border bg-surface pl-10 pr-4 text-sm text-content focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/40 transition-colors"
          />
        </div>
        <p className="text-xs text-content-muted self-end sm:self-auto">
          {filteredProjects.length} pizarra(s) encontrada(s)
        </p>
      </div>

      {/* Grid Content */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="p-6 space-y-4">
              <Skeleton className="h-6 w-3/4 rounded" />
              <Skeleton className="h-12 w-full rounded" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-1/3 rounded" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </Card>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-2xl border border-dashed border-border shadow-sm flex flex-col items-center justify-center p-6">
          <Folder className="w-16 h-16 text-content-muted/40 mb-4" />
          <h3 className="text-lg font-semibold text-content">No se encontraron pizarras</h3>
          <p className="text-sm text-content-muted mt-1 max-w-sm">
            {searchQuery
              ? 'Intenta cambiar los términos de búsqueda o crear un nuevo proyecto.'
              : 'Comienza creando tu primer lienzo infinito para organizar tus ideas.'}
          </p>
          <Button
            id="create-project-empty-btn"
            onClick={() => setCreateDialogOpen(true)}
            className="mt-6"
          >
            <Plus className="w-4 h-4 mr-2" />
            Crear Primera Pizarra
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className="flex flex-col justify-between hover:shadow-md hover:border-accent/40 transition-all duration-200 group relative bg-surface border border-border"
            >
              {/* Card Main Area */}
              <div
                className="p-6 cursor-pointer flex-1"
                onClick={() => router.push(`/project/${project.id}/canvas`)}
              >
                <div className="flex justify-between items-start gap-4 mb-2">
                  <h3 className="font-semibold text-lg text-content group-hover:text-accent transition-colors truncate pr-6">
                    {project.name}
                  </h3>
                </div>
                <p className="text-sm text-content-muted line-clamp-3 mb-6 min-h-[4.5rem]">
                  {project.description || 'Sin descripción disponible.'}
                </p>
              </div>

              {/* Options Trigger (Top Right Float) */}
              <div className="absolute top-4 right-4 z-10">
                <DropdownMenu>
                  <DropdownMenuTrigger className="p-1.5 h-auto text-content-muted hover:text-content hover:bg-surface-secondary rounded-md">
                    <MoreVertical className="w-4 h-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => router.push(`/project/${project.id}/canvas`)}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Abrir Lienzo
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        openEditDialog(project.id, project.name, project.description)
                      }
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Renombrar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                      onClick={() => openDeleteDialog(project.id)}
                    >
                      <Trash className="w-4 h-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Card Footer Info */}
              <div className="px-6 py-4 bg-surface-secondary/30 border-t border-border flex items-center justify-between text-xs text-content-muted">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Actualizado: {formatDate(project.updatedAt)}</span>
                </div>
                <span className="font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                  Abrir →
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* dialog CREAR PROYECTO */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        title="Crear Nueva Pizarra"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              id="submit-create-project-btn"
              type="submit"
              form="create-project-form"
              loading={isSubmittingCreate}
            >
              Crear e ir al Canvas
            </Button>
          </>
        }
      >
        <form id="create-project-form" onSubmit={handleCreateProject} className="space-y-4">
          <Input
            id="new-project-name"
            label="Nombre del proyecto"
            placeholder="Ej. Planificación de Software, Arquitectura Web"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            required
            autoFocus
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="new-project-desc" className="text-sm font-medium text-content">
              Descripción (Opcional)
            </label>
            <textarea
              id="new-project-desc"
              rows={3}
              placeholder="Explica de qué trata este espacio de trabajo..."
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="w-full rounded-panel border border-border bg-surface px-3 py-2 text-sm text-content focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/40 transition-colors"
            />
          </div>
        </form>
      </Dialog>

      {/* dialog EDITAR PROYECTO */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        title="Renombrar Pizarra"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              id="submit-edit-project-btn"
              type="submit"
              form="edit-project-form"
              loading={isSubmittingEdit}
            >
              Guardar Cambios
            </Button>
          </>
        }
      >
        <form id="edit-project-form" onSubmit={handleEditProject} className="space-y-4">
          <Input
            id="edit-project-name"
            label="Nombre del proyecto"
            value={editProjectName}
            onChange={(e) => setEditProjectName(e.target.value)}
            required
            autoFocus
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="edit-project-desc" className="text-sm font-medium text-content">
              Descripción
            </label>
            <textarea
              id="edit-project-desc"
              rows={3}
              value={editProjectDescription}
              onChange={(e) => setEditProjectDescription(e.target.value)}
              className="w-full rounded-panel border border-border bg-surface px-3 py-2 text-sm text-content focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/40 transition-colors"
            />
          </div>
        </form>
      </Dialog>

      {/* dialog CONFIRMAR BORRAR */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="¿Eliminar esta pizarra?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              id="submit-delete-project-btn"
              variant="danger"
              onClick={handleDeleteProject}
              loading={isSubmittingDelete}
            >
              Eliminar Permanentemente
            </Button>
          </>
        }
      >
        <p className="text-sm text-content-muted">
          Esta acción no se puede deshacer. Se eliminarán permanentemente la pizarra, todos los nodos creados, las checklists y sus conexiones asociadas.
        </p>
      </Dialog>
    </div>
  );
}
