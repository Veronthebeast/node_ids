'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useNodesStore } from '@/stores/nodes-store';
import { useProjectsStore } from '@/stores/projects-store';
import { useUIStore } from '@/stores/ui-store';
import { useReactFlow, type Node } from '@xyflow/react';
import { Button } from '../ui/button';
import {
  Search,
  FolderOpen,
  Tag,
  SlidersHorizontal,
  ChevronRight,
  Plus,
  Compass,
  CheckCircle,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function LeftPanel({ projectId }: { projectId: string }) {
  const router = useRouter();
  const { setCenter } = useReactFlow();

  // Stores
  const nodes = useNodesStore((s) => s.nodes);
  const addNodeDb = useNodesStore((s) => s.addNodeDb);
  const setSelectedNodes = useNodesStore((s) => s.setSelectedNodes);
  const projects = useProjectsStore((s) => s.projects);
  const toggleLeftPanel = useUIStore((s) => s.toggleLeftPanel);

  // Local state
  const [activeTab, setActiveTab] = useState<'nodes' | 'projects'>('nodes');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Gather all unique tags in the project nodes
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    nodes.forEach((n) => {
      n.data?.tags?.forEach((t) => tagsSet.add(t));
    });
    return Array.from(tagsSet);
  }, [nodes]);

  // Filters the node list based on user criteria
  const filteredNodes = useMemo(() => {
    return nodes.filter((node) => {
      const title = (node.data?.title || '').toLowerCase();
      const desc = (node.data?.description || '').toLowerCase();
      const notes = (node.data?.notes || '').toLowerCase();
      const tags = (node.data?.tags || []).map((t) => t.toLowerCase());

      const queryMatch =
        searchQuery === '' ||
        title.includes(searchQuery.toLowerCase()) ||
        desc.includes(searchQuery.toLowerCase()) ||
        notes.includes(searchQuery.toLowerCase()) ||
        tags.some((t) => t.includes(searchQuery.toLowerCase()));

      const priorityMatch =
        !selectedPriority || node.data?.priority === selectedPriority;

      const tagMatch = !selectedTag || node.data?.tags?.includes(selectedTag);

      return queryMatch && priorityMatch && tagMatch;
    });
  }, [nodes, searchQuery, selectedPriority, selectedTag]);

  // Center canvas on node coordinates smoothly
  const handleFocusNode = (node: Node) => {
    // 144 is half of custom node width (72 * 4 = w-72 = 288px / 2 = 144)
    // 70 is rough estimate of node height/2
    setCenter(node.position.x + 144, node.position.y + 70, {
      zoom: 1.3,
      duration: 600,
    });
    setSelectedNodes([node.id]);
    if (window.innerWidth < 768) {
      toggleLeftPanel();
    }
  };

  const handleCreateQuickNode = () => {
    // Add quick node in center context
    addNodeDb(projectId, { x: 100, y: 150 }, {
      title: 'Nota rápida',
      description: 'Edite esta descripción en el panel derecho.',
    });
  };

  return (
    <aside className="w-[85vw] max-w-[320px] md:w-80 border-r border-border bg-surface flex flex-col h-full shrink-0 shadow-lg animate-in slide-in-from-left duration-200 md:relative absolute inset-y-0 left-0 z-20">
      {/* Cabecera Móvil */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0 md:hidden bg-surface-secondary/40">
        <span className="text-xs font-bold text-content-muted">Buscador y Pizarras</span>
        <button
          type="button"
          onClick={() => toggleLeftPanel()}
          className="p-1 hover:bg-surface-secondary rounded-md cursor-pointer"
          title="Cerrar panel"
        >
          <X className="w-5 h-5 text-content" />
        </button>
      </div>

      {/* Tabs headers */}
      <div className="flex border-b border-border shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('nodes')}
          className={cn(
            'flex-1 py-3 text-xs font-semibold uppercase tracking-wider text-center border-b-2 transition-colors cursor-pointer',
            activeTab === 'nodes'
              ? 'border-accent text-accent'
              : 'border-transparent text-content-muted hover:text-content hover:bg-surface-secondary/50'
          )}
        >
          Nodos
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('projects')}
          className={cn(
            'flex-1 py-3 text-xs font-semibold uppercase tracking-wider text-center border-b-2 transition-colors cursor-pointer',
            activeTab === 'projects'
              ? 'border-accent text-accent'
              : 'border-transparent text-content-muted hover:text-content hover:bg-surface-secondary/50'
          )}
        >
          Pizarras
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'nodes' ? (
        <div className="flex-1 flex flex-col overflow-hidden p-4 space-y-4">
          {/* Quick Node Trigger */}
          <Button onClick={handleCreateQuickNode} size="sm" className="w-full shrink-0">
            <Plus className="w-4 h-4 mr-1.5" />
            Añadir Nodo Rápido
          </Button>

          {/* Search Field */}
          <div className="relative shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" />
            <input
              type="text"
              placeholder="Buscar nodos o etiquetas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-panel border border-border bg-surface pl-9 pr-4 text-xs text-content focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/40"
            />
          </div>

          {/* Quick Filters */}
          <div className="space-y-2 shrink-0">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-content-muted uppercase tracking-wider">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Prioridad</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['low', 'medium', 'high', 'urgent'].map((p) => {
                const isActive = selectedPriority === p;
                const labels: Record<string, string> = {
                  low: 'Baja',
                  medium: 'Media',
                  high: 'Alta',
                  urgent: 'Urgente',
                };
                return (
                  <button
                    key={p}
                    onClick={() => setSelectedPriority(isActive ? null : p)}
                    className={cn(
                      'px-2.5 py-1 rounded text-[10px] font-medium border transition-colors cursor-pointer',
                      isActive
                        ? 'bg-accent text-white border-accent'
                        : 'border-border bg-surface text-content-muted hover:bg-surface-secondary hover:text-content'
                    )}
                  >
                    {labels[p]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags Filter */}
          {allTags.length > 0 && (
            <div className="space-y-2 shrink-0">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-content-muted uppercase tracking-wider">
                <Tag className="w-3.5 h-3.5" />
                <span>Etiquetas</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {allTags.map((tag) => {
                  const isActive = selectedTag === tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(isActive ? null : tag)}
                      className={cn(
                        'px-2 py-0.5 rounded-md text-[9px] border transition-colors font-medium cursor-pointer',
                        isActive
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'border-border bg-surface-secondary text-content-muted hover:text-content'
                      )}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search list title */}
          <div className="border-t border-border pt-3 shrink-0 flex justify-between items-center">
            <span className="text-[10px] font-bold text-content-muted uppercase tracking-wider">
              Nodos ({filteredNodes.length})
            </span>
          </div>

          {/* Nodes list */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredNodes.length === 0 ? (
              <p className="text-xs text-content-muted italic text-center py-8">
                No se encontraron nodos.
              </p>
            ) : (
              filteredNodes.map((node) => (
                <div
                  key={node.id}
                  onClick={() => handleFocusNode(node)}
                  className="p-3 rounded-panel border border-border bg-surface-secondary/30 hover:bg-surface-secondary/70 hover:border-accent/40 cursor-pointer flex items-center justify-between group transition-all duration-150"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: node.data?.color || '#6366f1' }}
                      />
                      <span className="font-semibold text-xs text-content truncate block">
                        {node.data?.title || 'Sin Título'}
                      </span>
                    </div>
                    {node.data?.description && (
                      <p className="text-[10px] text-content-muted mt-1 truncate">
                        {node.data.description}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-content-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Tab Proyectos */
        <div className="flex-1 flex flex-col overflow-hidden p-4 space-y-4">
          <span className="text-[10px] font-bold text-content-muted uppercase tracking-wider shrink-0">
            Cambiar de Pizarra
          </span>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {projects.map((p) => {
              const isActive = p.id === projectId;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    if (!isActive) {
                      toggleLeftPanel();
                      router.push(`/project/${p.id}/canvas`);
                    }
                  }}
                  className={cn(
                    'p-3 rounded-panel border text-left cursor-pointer flex items-center justify-between group transition-all duration-150',
                    isActive
                      ? 'border-accent bg-accent/5 text-accent font-semibold'
                      : 'border-border bg-surface hover:bg-surface-secondary hover:border-content-muted/30 text-content'
                  )}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-2">
                      <FolderOpen className={cn('w-4 h-4 shrink-0', isActive ? 'text-accent' : 'text-content-muted')} />
                      <span className="text-xs truncate block">{p.name}</span>
                    </div>
                  </div>
                  {!isActive && (
                    <ChevronRight className="w-3.5 h-3.5 text-content-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}
