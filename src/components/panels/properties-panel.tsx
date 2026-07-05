'use client';

import { useState } from 'react';
import { useNodesStore } from '@/stores/nodes-store';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  X,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  Tag as TagIcon,
  AlertCircle,
  FileText,
  Palette,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const COLOR_PALETTE = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#f43f5e', // Rose
  '#8b5cf6', // Violet
  '#f59e0b', // Amber
  '#3b82f6', // Blue
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#64748b', // Slate
];

const PRIORITIES = [
  { value: 'low', label: 'Baja', color: 'text-blue-500 bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:text-blue-300' },
  { value: 'medium', label: 'Media', color: 'text-yellow-500 bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-300' },
  { value: 'high', label: 'Alta', color: 'text-orange-500 bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:text-orange-300' },
  { value: 'urgent', label: 'Urgente', color: 'text-red-500 bg-red-50 border-red-200 dark:bg-red-950/20 dark:text-red-300' },
];

export function PropertiesPanel() {
  const nodes = useNodesStore((s) => s.nodes);
  const selectedNodeIds = useNodesStore((s) => s.selectedNodeIds);
  const updateNodeDb = useNodesStore((s) => s.updateNodeDb);
  const removeNodeDb = useNodesStore((s) => s.removeNodeDb);
  const toggleRightPanel = useUIStore((s) => s.toggleRightPanel);

  // Checklist actions
  const checklistItems = useNodesStore((s) => s.checklistItems);
  const addChecklistItemDb = useNodesStore((s) => s.addChecklistItemDb);
  const updateChecklistItemDb = useNodesStore((s) => s.updateChecklistItemDb);
  const deleteChecklistItemDb = useNodesStore((s) => s.deleteChecklistItemDb);

  const [newTag, setNewTag] = useState('');
  const [newTodoText, setNewTodoText] = useState('');

  // Find currently selected node
  const selectedNode = selectedNodeIds.length > 0
    ? nodes.find((n) => n.id === selectedNodeIds[0])
    : null;

  if (!selectedNode) {
    return (
      <aside className="w-80 border-l border-border bg-surface flex flex-col h-full shrink-0 md:relative absolute inset-y-0 right-0 z-20">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h3 className="font-semibold text-content text-sm">Propiedades</h3>
          <Button variant="ghost" size="sm" onClick={toggleRightPanel} className="p-1 h-auto">
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-content-muted">
          <AlertCircle className="w-12 h-12 text-content-muted/40 mb-3" />
          <p className="text-sm font-medium">Ningún nodo seleccionado</p>
          <p className="text-xs mt-1 max-w-[200px]">
            Selecciona un nodo en la pizarra para ver y editar sus detalles.
          </p>
        </div>
      </aside>
    );
  }

  const { data } = selectedNode;
  const items = checklistItems[selectedNode.id] || [];

  const handleFieldChange = (field: string, value: any) => {
    updateNodeDb(selectedNode.id, { [field]: value });
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const tag = newTag.trim().toLowerCase();
    if (!tag) return;
    const currentTags = data.tags || [];
    if (!currentTags.includes(tag)) {
      handleFieldChange('tags', [...currentTags, tag]);
    }
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = data.tags || [];
    handleFieldChange('tags', currentTags.filter((t) => t !== tagToRemove));
  };

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    const text = newTodoText.trim();
    if (!text) return;
    addChecklistItemDb(selectedNode.id, text);
    setNewTodoText('');
  };

  return (
    <aside className="w-80 border-l border-border bg-surface flex flex-col h-full shrink-0 shadow-lg animate-in slide-in-from-right duration-200 md:relative absolute inset-y-0 right-0 z-20">
      {/* Header */}
      <div className="p-4 border-b border-border flex justify-between items-center shrink-0">
        <div>
          <h3 className="font-bold text-content text-sm">Editar Nodo</h3>
          <span className="text-[10px] text-content-muted font-mono">{selectedNode.id}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={async () => {
              if (confirm('¿Estás seguro de que deseas eliminar este nodo?')) {
                await removeNodeDb(selectedNode.id);
              }
            }}
            className="p-1.5 text-content-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition-colors cursor-pointer"
            title="Eliminar Nodo"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={toggleRightPanel}
            className="p-1.5 text-content-muted hover:text-content hover:bg-surface-secondary rounded-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-content-muted uppercase tracking-wider">
            Título
          </label>
          <input
            type="text"
            value={data.title}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            placeholder="Título del nodo..."
            className="w-full rounded-panel border border-border bg-surface px-3 py-2 text-sm text-content font-semibold focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/40 transition-colors"
          />
        </div>

        {/* Color Picker */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-content-muted uppercase tracking-wider">
            <Palette className="w-3.5 h-3.5" />
            <span>Color de Acento</span>
          </div>
          <div className="grid grid-cols-5 gap-2 pt-1">
            {COLOR_PALETTE.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => handleFieldChange('color', color)}
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer shadow-sm relative"
                style={{ backgroundColor: color }}
              >
                {data.color === color && (
                  <Check className="w-4 h-4 text-white drop-shadow-md" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Priority Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-content-muted uppercase tracking-wider">
            Prioridad
          </label>
          <div className="grid grid-cols-2 gap-2 pt-1">
            {PRIORITIES.map((p) => {
              const isActive = data.priority === p.value;
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => handleFieldChange('priority', p.value)}
                  className={cn(
                    'px-3 py-2 rounded-panel border text-xs font-medium transition-all text-center',
                    isActive
                      ? p.color + ' border-current font-semibold ring-1 ring-current'
                      : 'border-border bg-surface text-content hover:bg-surface-secondary'
                  )}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-content-muted uppercase tracking-wider">
            Descripción
          </label>
          <textarea
            rows={3}
            value={data.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            placeholder="Escribe una descripción sobre este nodo..."
            className="w-full rounded-panel border border-border bg-surface px-3 py-2 text-xs text-content focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/40 transition-colors resize-none leading-relaxed"
          />
        </div>

        {/* Notes (Markdown Area) */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-content-muted uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5" />
            <span>Notas de Texto Libre</span>
          </div>
          <textarea
            rows={5}
            value={data.notes}
            onChange={(e) => handleFieldChange('notes', e.target.value)}
            placeholder="Notas detalladas, enlaces o anotaciones extras..."
            className="w-full rounded-panel border border-border bg-surface px-3 py-2 text-xs text-content font-mono focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/40 transition-colors resize-y leading-relaxed"
          />
        </div>

        {/* Hashtags */}
        <div className="space-y-2 border-t border-border pt-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-content-muted uppercase tracking-wider">
            <TagIcon className="w-3.5 h-3.5" />
            <span>Etiquetas</span>
          </div>
          <form onSubmit={handleAddTag} className="flex gap-2">
            <input
              type="text"
              placeholder="Nueva etiqueta..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className="h-8 flex-1 rounded-panel border border-border bg-surface px-3 text-xs text-content focus:border-accent focus:outline-none"
            />
            <Button type="submit" size="sm" className="h-8 px-2.5">
              <Plus className="w-4 h-4" />
            </Button>
          </form>
          {data.tags && data.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {data.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-secondary text-content-muted border border-border"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="p-0.5 hover:bg-surface-tertiary rounded-full text-content-muted/80 hover:text-content"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Checklist Section */}
        <div className="space-y-3 border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-content-muted uppercase tracking-wider">
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Checklist</span>
            </div>
            {items.length > 0 && (
              <span className="text-[10px] text-green-500 font-bold bg-green-50 dark:bg-green-950/20 px-2 py-0.5 rounded border border-green-200/30">
                {data.checklistProgress}%
              </span>
            )}
          </div>

          {/* New Todo Form */}
          <form onSubmit={handleAddTodo} className="flex gap-2">
            <input
              type="text"
              placeholder="Nueva tarea..."
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              className="h-8 flex-1 rounded-panel border border-border bg-surface px-3 text-xs text-content focus:border-accent focus:outline-none"
            />
            <Button type="submit" size="sm" className="h-8 px-2.5 bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4" />
            </Button>
          </form>

          {/* Todo List */}
          {items.length === 0 ? (
            <p className="text-xs text-content-muted/70 italic text-center py-4 bg-surface-secondary/20 rounded border border-dashed border-border/60">
              No hay tareas en el checklist.
            </p>
          ) : (
            <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 p-2 hover:bg-surface-secondary/40 rounded-panel border border-transparent hover:border-border group/todo transition-all duration-150"
                >
                  <button
                    type="button"
                    onClick={() =>
                      updateChecklistItemDb(item.id, selectedNode.id, {
                        completed: !item.completed,
                      })
                    }
                    className="text-content-muted hover:text-content shrink-0"
                  >
                    {item.completed ? (
                      <CheckSquare className="w-4 h-4 text-green-500" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                  <span
                    className={cn(
                      'text-xs text-content flex-1 break-all truncate line-clamp-2 leading-tight',
                      item.completed && 'line-through text-content-muted'
                    )}
                    title={item.text}
                  >
                    {item.text}
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteChecklistItemDb(item.id, selectedNode.id)}
                    className="p-1 hover:bg-red-50 text-content-muted hover:text-red-600 rounded opacity-0 group-hover/todo:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
