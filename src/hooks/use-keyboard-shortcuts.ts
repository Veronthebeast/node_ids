'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useNodesStore } from '@/stores/nodes-store';
import { useConnectionsStore } from '@/stores/connections-store';
import { useHistoryStore } from '@/stores/history-store';
import type { Node, Edge } from '@xyflow/react';
import type { NodeData } from '@/types/node';
import type { ConnectionData } from '@/types/connection';
import { createClient } from '@/lib/supabase/client';

export function useKeyboardShortcuts(projectId: string) {
  // Sincronización de Stores
  const nodes = useNodesStore((s) => s.nodes);
  const setNodes = useNodesStore((s) => s.setNodes);
  const selectedNodeIds = useNodesStore((s) => s.selectedNodeIds);
  const removeNodeDb = useNodesStore((s) => s.removeNodeDb);
  const addNodeDb = useNodesStore((s) => s.addNodeDb);
  const setSelectedNodes = useNodesStore((s) => s.setSelectedNodes);

  const edges = useConnectionsStore((s) => s.edges);
  const setEdges = useConnectionsStore((s) => s.setEdges);
  const selectedEdgeIds = useConnectionsStore((s) => s.selectedEdgeIds);
  const removeEdgeDb = useConnectionsStore((s) => s.removeEdgeDb);
  const setSelectedEdges = useConnectionsStore((s) => s.setSelectedEdges);

  const { undo, redo, pushState } = useHistoryStore();

  // Local Clipboard for copy/paste
  const clipboardRef = useRef<Node<NodeData>[]>([]);

  // Capture snapshot helper
  const takeSnapshot = useCallback(() => {
    const currentNodes = useNodesStore.getState().nodes;
    const currentEdges = useConnectionsStore.getState().edges;
    pushState({
      nodes: JSON.parse(JSON.stringify(currentNodes)),
      edges: JSON.parse(JSON.stringify(currentEdges)),
      timestamp: Date.now(),
    });
  }, [pushState]);

  // Batch sync DB after undo/redo
  const syncSnapshotToDb = useCallback(async (snapshotNodes: Node<NodeData>[], snapshotEdges: Edge<ConnectionData>[]) => {
    try {
      const supabase = createClient();
      
      // 1. Wipe database entries for current project
      await supabase.from('nodes').delete().eq('project_id', projectId);
      await supabase.from('edges').delete().eq('project_id', projectId);
      
      // 2. Insert snapshot nodes
      if (snapshotNodes.length > 0) {
        const nodeInserts = snapshotNodes.map((n) => ({
          id: n.id,
          project_id: projectId,
          type: n.type || 'customNode',
          position_x: n.position.x,
          position_y: n.position.y,
          data: n.data,
          updated_at: new Date().toISOString(),
        }));
        await supabase.from('nodes').insert(nodeInserts);
      }

      // 3. Insert snapshot edges
      if (snapshotEdges.length > 0) {
        const edgeInserts = snapshotEdges.map((e) => ({
          id: e.id,
          project_id: projectId,
          source: e.source,
          target: e.target,
          source_handle: e.sourceHandle || null,
          target_handle: e.targetHandle || null,
          type: e.type || 'smoothstep',
          animated: e.animated || false,
          data: e.data,
          updated_at: new Date().toISOString(),
        }));
        await supabase.from('edges').insert(edgeInserts);
      }
    } catch (err) {
      console.error('Error syncing history snapshot to Supabase:', err);
    }
  }, [projectId]);

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Ignore shortcuts if focusing an input or textarea
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.getAttribute('contenteditable') === 'true';

      if (isInput) return;

      const isCtrl = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      // Ctrl + Z: Undo
      if (isCtrl && key === 'z' && !e.shiftKey) {
        e.preventDefault();
        const prev = undo();
        if (prev) {
          const snapshotNodes = prev.nodes as Node<NodeData>[];
          const snapshotEdges = prev.edges as Edge<ConnectionData>[];
          setNodes(snapshotNodes);
          setEdges(snapshotEdges);
          await syncSnapshotToDb(snapshotNodes, snapshotEdges);
        }
      }

      // Ctrl + Shift + Z / Ctrl + Y: Redo
      if ((isCtrl && key === 'z' && e.shiftKey) || (isCtrl && key === 'y')) {
        e.preventDefault();
        const next = redo();
        if (next) {
          const snapshotNodes = next.nodes as Node<NodeData>[];
          const snapshotEdges = next.edges as Edge<ConnectionData>[];
          setNodes(snapshotNodes);
          setEdges(snapshotEdges);
          await syncSnapshotToDb(snapshotNodes, snapshotEdges);
        }
      }

      // Ctrl + S: Force save (Autosave runs in BG, but let's notify user)
      if (isCtrl && key === 's') {
        e.preventDefault();
        // Custom save notification can be logged or visual trigger
        console.log('Forzando guardado manual...');
        takeSnapshot();
        await syncSnapshotToDb(useNodesStore.getState().nodes, useConnectionsStore.getState().edges);
      }

      // Ctrl + A: Select All Nodes
      if (isCtrl && key === 'a') {
        e.preventDefault();
        const allNodeIds = useNodesStore.getState().nodes.map((n) => n.id);
        setSelectedNodes(allNodeIds);
      }

      // Ctrl + C: Copy selected nodes
      if (isCtrl && key === 'c') {
        e.preventDefault();
        const currentNodes = useNodesStore.getState().nodes;
        const selectedNodes = currentNodes.filter((n) => selectedNodeIds.includes(n.id));
        if (selectedNodes.length > 0) {
          clipboardRef.current = JSON.parse(JSON.stringify(selectedNodes));
        }
      }

      // Ctrl + V: Paste copied nodes (with offset)
      if (isCtrl && key === 'v') {
        e.preventDefault();
        const copied = clipboardRef.current;
        if (copied.length > 0) {
          takeSnapshot();
          const newSelectedIds: string[] = [];
          
          for (const node of copied) {
            // Offset position slightly
            const newPos = {
              x: node.position.x + 40,
              y: node.position.y + 40,
            };
            
            // Create in database
            const newId = await addNodeDb(projectId, newPos, node.data);
            if (newId) {
              newSelectedIds.push(newId);
            }
          }

          // Offset the clipboard so consecutive pastes offset progressively
          clipboardRef.current = clipboardRef.current.map((n) => ({
            ...n,
            position: { x: n.position.x + 40, y: n.position.y + 40 },
          }));

          if (newSelectedIds.length > 0) {
            setSelectedNodes(newSelectedIds);
          }
        }
      }

      // Delete / Backspace: Remove selected elements
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const selectedNodes = useNodesStore.getState().selectedNodeIds;
        const selectedEdges = useConnectionsStore.getState().selectedEdgeIds;

        if (selectedNodes.length > 0 || selectedEdges.length > 0) {
          e.preventDefault();
          takeSnapshot();

          // Delete selected nodes
          for (const nid of selectedNodes) {
            await removeNodeDb(nid);
          }
          // Delete selected edges
          for (const eid of selectedEdges) {
            await removeEdgeDb(eid);
          }

          // Deselect
          setSelectedNodes([]);
          setSelectedEdges([]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    projectId,
    nodes,
    selectedNodeIds,
    selectedEdgeIds,
    setNodes,
    setEdges,
    setSelectedNodes,
    setSelectedEdges,
    addNodeDb,
    removeNodeDb,
    removeEdgeDb,
    undo,
    redo,
    takeSnapshot,
    syncSnapshotToDb,
  ]);
}
