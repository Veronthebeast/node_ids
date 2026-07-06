'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  ReactFlowProvider,
  useReactFlow,
  type NodeChange,
  type EdgeChange,
  type Connection,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useNodesStore } from '@/stores/nodes-store';
import { useConnectionsStore } from '@/stores/connections-store';
import { useProjectsStore } from '@/stores/projects-store';
import { useUIStore } from '@/stores/ui-store';
import { CustomNode } from './custom-node';
import { LeftPanel } from '../panels/left-panel';
import { cn } from '@/lib/utils';
import { PropertiesPanel } from '../panels/properties-panel';
import { Button } from '../ui/button';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { useAuth } from '@/hooks/use-auth';
import { ShareDialog } from '../panels/share-dialog';
import {
  ArrowLeft,
  Plus,
  CloudLightning,
  CheckCircle,
  Loader,
  Menu,
  Share2,
  Lock,
  Unlock,
} from 'lucide-react';

function CanvasInner({ projectId }: { projectId: string }) {
  const router = useRouter();
  const { screenToFlowPosition } = useReactFlow();

  // Stores state
  const nodes = useNodesStore((s) => s.nodes);
  const setNodes = useNodesStore((s) => s.setNodes);
  const setSelectedNodes = useNodesStore((s) => s.setSelectedNodes);
  const fetchNodes = useNodesStore((s) => s.fetchNodes);
  const addNodeDb = useNodesStore((s) => s.addNodeDb);
  const updateNodePositionDb = useNodesStore((s) => s.updateNodePositionDb);

  const edges = useConnectionsStore((s) => s.edges);
  const setEdges = useConnectionsStore((s) => s.setEdges);
  const setSelectedEdges = useConnectionsStore((s) => s.setSelectedEdges);
  const fetchEdges = useConnectionsStore((s) => s.fetchEdges);
  const addEdgeDb = useConnectionsStore((s) => s.addEdgeDb);

  const { projects, fetchProjects } = useProjectsStore();
  const {
    leftPanelOpen,
    rightPanelOpen,
    toggleLeftPanel,
    toggleRightPanel,
    theme,
    setMobileSidebarOpen,
    nodesLocked,
    toggleNodesLocked,
  } = useUIStore();

  const [saving, setSaving] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const { user } = useAuth();

  // Bind keyboard shortcuts to project canvas context
  useKeyboardShortcuts(projectId);

  // Load project details, nodes and edges
  useEffect(() => {
    fetchProjects();
    fetchNodes(projectId);
    fetchEdges(projectId);
  }, [projectId, fetchProjects, fetchNodes, fetchEdges]);

  const currentProject = useMemo(() => {
    return projects.find((p) => p.id === projectId);
  }, [projects, projectId]);

  // Node type registration
  const nodeTypes = useMemo(() => ({
    customNode: CustomNode,
  }), []);

  // React Flow Node Change Event (Drag, Select, Delete)
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const nextNodes = applyNodeChanges(changes, useNodesStore.getState().nodes);
      setNodes(nextNodes as any);

      // Track positions for auto-save (when dragging ends)
      changes.forEach((change) => {
        if (change.type === 'position' && change.position) {
          const node = nextNodes.find((n) => n.id === change.id);
          if (node && !change.dragging) {
            setSaving(true);
            updateNodePositionDb(change.id, node.position).then(() => {
              setSaving(false);
            });
          }
        }
        if (change.type === 'select') {
          const selected = nextNodes.filter((n) => n.selected).map((n) => n.id);
          setSelectedNodes(selected);
          if (change.selected && selected.length > 0) {
            useUIStore.setState({ rightPanelOpen: true });
          }
        }
      });
    },
    [setNodes, setSelectedNodes, updateNodePositionDb]
  );

  // React Flow Edge Change Event (Select, Delete)
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const nextEdges = applyEdgeChanges(changes, useConnectionsStore.getState().edges);
      setEdges(nextEdges as any);

      changes.forEach((change) => {
        if (change.type === 'select') {
          const selected = nextEdges.filter((e) => e.selected).map((e) => e.id);
          setSelectedEdges(selected);
        }
      });
    },
    [setEdges, setSelectedEdges]
  );

  // React Flow connection creation
  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      setSaving(true);
      addEdgeDb(
        projectId,
        connection.source,
        connection.sourceHandle || null,
        connection.target,
        connection.targetHandle || null
      ).then(() => {
        setSaving(false);
      });
    },
    [projectId, addEdgeDb]
  );

  // Add node via double-click on canvas pane
  const onPaneDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      const flowPos = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      setSaving(true);
      addNodeDb(projectId, flowPos).then(() => {
        setSaving(false);
      });
    },
    [projectId, addNodeDb, screenToFlowPosition]
  );

  // Add node from floating center trigger
  const handleAddNodeAtCenter = () => {
    const flowPos = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });
    setSaving(true);
    addNodeDb(projectId, flowPos).then(() => {
      setSaving(false);
    });
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-surface">
      {/* Canvas Page Header */}
      <header className="h-14 border-b border-border bg-surface px-4 flex justify-between items-center shrink-0 z-10">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 hover:bg-surface-secondary text-content-muted hover:text-content rounded-xl border border-border bg-surface shadow-sm cursor-pointer transition-all duration-150 active:scale-95"
            title="Volver al Tablero"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="h-4 w-px bg-border" />
          <div>
            <h1 className="font-semibold text-content text-sm md:text-base leading-none">
              {currentProject ? currentProject.name : 'Cargando pizarra...'}
            </h1>
            <p className="text-xs text-content-muted mt-1 leading-none hidden sm:block">
              {currentProject?.description || 'Lienzo infinito interactivo'}
            </p>
          </div>
        </div>

        {/* Save Sync indicators and Theme Toggle */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs">
            {saving ? (
              <>
                <Loader className="w-3.5 h-3.5 text-accent animate-spin" />
                <span className="text-accent font-medium hidden md:inline">Guardando cambios...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                <span className="text-content-muted hidden md:inline">Guardado en Supabase</span>
              </>
            )}
          </div>

          {currentProject && user && currentProject.ownerId === user.id && (
            <Button
              id="share-project-header-btn"
              variant="secondary"
              size="sm"
              onClick={() => setShareDialogOpen(true)}
              className="text-xs h-8 px-2 md:px-3"
            >
              <Share2 className="w-4 h-4 md:mr-1.5 mr-0" />
              <span className="hidden md:inline">Compartir</span>
            </Button>
          )}
          
          <Button
            id="add-node-header-btn"
            variant="primary"
            size="sm"
            onClick={handleAddNodeAtCenter}
            className="px-2 md:px-3"
          >
            <Plus className="w-4 h-4 md:mr-1.5 mr-0" />
            <span className="hidden md:inline">Nodo</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLeftPanel}
            className="p-1.5 h-auto"
            title="Panel Izquierdo"
          >
            <Menu className="w-5 h-5 text-content" />
          </Button>
        </div>
      </header>

      {/* Main workspace layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Panel Mobile Overlay */}
        {leftPanelOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-10 md:hidden animate-in fade-in duration-200"
            onClick={toggleLeftPanel}
          />
        )}

        {/* Left Side Panel */}
        {leftPanelOpen && <LeftPanel projectId={projectId} />}

        {/* Whiteboard Canvas */}
        <main className="flex-1 h-full relative" onDoubleClick={onPaneDoubleClick}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.25}
            maxZoom={4}
            nodesDraggable={!nodesLocked}
            colorMode={theme === 'dark' ? 'dark' : 'light'}
            className="bg-surface-secondary/20"
          >
            <Background
              gap={16}
              size={1}
              color={theme === 'dark' ? '#333' : '#ddd'}
            />
            <Controls className="!bg-surface !border-border !shadow-md [&_button]:!bg-surface [&_button]:!border-border [&_button]:!text-content hover:[&_button]:!bg-surface-secondary" />
            <MiniMap
              zoomable
              pannable
              className="!bg-surface !border-border !shadow-lg hidden md:block"
              nodeColor={(n: any) => n.data?.color || '#6366f1'}
            />
          </ReactFlow>

          {/* Floating Padlock Toggle (Modo Paneo) */}
          <button
            type="button"
            onClick={toggleNodesLocked}
            className={cn(
              "absolute bottom-[72px] left-4 z-10 p-2.5 rounded-panel border shadow-md cursor-pointer transition-all duration-150 active:scale-95 flex items-center justify-center gap-1.5",
              nodesLocked
                ? "bg-red-500 border-red-500 text-white hover:bg-red-600"
                : "bg-surface border-border text-content hover:bg-surface-secondary"
            )}
            title={nodesLocked ? "Desbloquear movimiento de nodos" : "Bloquear movimiento de nodos (Modo Paneo)"}
          >
            {nodesLocked ? (
              <>
                <Lock className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Paneo</span>
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4 text-content-muted" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-content-muted">Edición</span>
              </>
            )}
          </button>
        </main>

        {/* Right Panel Mobile Overlay */}
        {rightPanelOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-10 md:hidden animate-in fade-in duration-200"
            onClick={toggleRightPanel}
          />
        )}

        {/* Right Side Panel */}
        {rightPanelOpen && <PropertiesPanel />}
      </div>

      {/* Share Dialog */}
      <ShareDialog
        projectId={projectId}
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
      />
    </div>
  );
}

export function CanvasContainer({ projectId }: { projectId: string }) {
  return (
    <ReactFlowProvider>
      <CanvasInner projectId={projectId} />
    </ReactFlowProvider>
  );
}
