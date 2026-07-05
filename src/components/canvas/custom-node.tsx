'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { NodeData } from '@/types/node';
import { useNodesStore } from '@/stores/nodes-store';
import { cn } from '@/lib/utils';
import { ClipboardList, FileText, AlertTriangle, Trash2 } from 'lucide-react';

const priorityConfig = {
  urgent: {
    label: 'Urgente',
    classes: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-300 dark:border-red-900/30',
  },
  high: {
    label: 'Alto',
    classes: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/20 dark:text-orange-300 dark:border-orange-900/30',
  },
  medium: {
    label: 'Medio',
    classes: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-300 dark:border-yellow-900/30',
  },
  low: {
    label: 'Bajo',
    classes: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-900/30',
  },
};

export function CustomNode({ id, data, selected }: NodeProps & { data: NodeData }) {
  // Sincronizar en tiempo real el conteo de checklist items de este nodo
  const items = useNodesStore((s) => s.checklistItems[id]) || [];
  const totalItems = items.length;
  const completedItems = items.filter((i) => i.completed).length;
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const priority = data.priority || 'medium';
  const priorityInfo = priorityConfig[priority];

  return (
    <div
      className={cn(
        'w-72 rounded-2xl border bg-surface text-content shadow-sm transition-all duration-200 ease-in-out select-none',
        'hover:shadow-md hover:border-content-muted/30',
        selected ? 'border-accent ring-2 ring-accent/30 scale-[1.01]' : 'border-border'
      )}
      style={{
        borderTop: `6px solid ${data.color || '#6366f1'}`,
      }}
    >
      {/* Botón flotante para eliminar cuando está seleccionado */}
      {selected && (
        <button
          type="button"
          onClick={async (e) => {
            e.stopPropagation();
            if (confirm('¿Deseas eliminar este nodo?')) {
              const removeNodeDb = useNodesStore.getState().removeNodeDb;
              await removeNodeDb(id);
            }
          }}
          className="absolute -top-3.5 -right-3.5 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-md z-20 cursor-pointer hover:scale-110 active:scale-95 transition-transform"
          title="Eliminar Nodo"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Target and Source Handles in 4 directions */}
      <Handle
        type="target"
        position={Position.Top}
        id="t-top"
        className="!w-3 !h-3 !bg-accent !border-2 !border-surface !rounded-full transition-transform hover:scale-125"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="s-bottom"
        className="!w-3 !h-3 !bg-accent !border-2 !border-surface !rounded-full transition-transform hover:scale-125"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="t-left"
        className="!w-3 !h-3 !bg-accent !border-2 !border-surface !rounded-full transition-transform hover:scale-125"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="s-right"
        className="!w-3 !h-3 !bg-accent !border-2 !border-surface !rounded-full transition-transform hover:scale-125"
      />

      <div className="p-4 space-y-3">
        {/* Node Header (Priority & Indicators) */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              'px-2 py-0.5 rounded-full text-[10px] font-semibold border uppercase tracking-wider',
              priorityInfo.classes
            )}
          >
            {priorityInfo.label}
          </span>
          <div className="flex items-center gap-1.5 text-content-muted">
            {data.notes && (
              <span title="Tiene notas">
                <FileText className="w-3.5 h-3.5" />
              </span>
            )}
            {totalItems > 0 && (
              <div className="flex items-center gap-0.5 text-[11px] font-medium">
                <ClipboardList className="w-3.5 h-3.5 text-content-muted" />
                <span>
                  {completedItems}/{totalItems}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Title and Description */}
        <div>
          <h4 className="font-bold text-sm tracking-tight text-content line-clamp-1 leading-snug">
            {data.title || 'Sin Título'}
          </h4>
          <p className="text-xs text-content-muted mt-1.5 line-clamp-3 leading-relaxed whitespace-pre-wrap">
            {data.description || 'Haga doble clic en la pizarra para editar propiedades.'}
          </p>
        </div>

        {/* Tags Row */}
        {data.tags && data.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {data.tags.map((tag, i) => (
              <span
                key={i}
                className="px-2 py-0.5 text-[9px] font-semibold bg-surface-secondary text-content-muted border border-border rounded-md"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Progress Bar */}
        {totalItems > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between items-center text-[10px] text-content-muted font-medium">
              <span>Progreso de tareas</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-1.5 w-full bg-surface-tertiary rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
