'use client';

import { useState, useEffect, useCallback } from 'react';
import { useProjectsStore } from '@/stores/projects-store';
import { Dialog } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Mail, Shield, UserX, UserCheck, Loader } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShareDialogProps {
  projectId: string;
  open: boolean;
  onClose: () => void;
}

export function ShareDialog({ projectId, open, onClose }: ShareDialogProps) {
  const { shareProject, fetchProjectShares, removeProjectShare } = useProjectsStore();

  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'read' | 'write'>('read');
  const [shares, setShares] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load current shares on dialog mount/open
  const loadShares = useCallback(async () => {
    setLoading(true);
    const data = await fetchProjectShares(projectId);
    setShares(data);
    setLoading(false);
  }, [projectId, fetchProjectShares]);

  useEffect(() => {
    if (open) {
      loadShares();
      setErrorMsg(null);
      setSuccessMsg(null);
      setEmail('');
      setPermission('read');
    }
  }, [open, loadShares]);

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = email.trim().toLowerCase();
    if (!targetEmail) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    setSubmitting(true);

    const success = await shareProject(projectId, targetEmail, permission);
    setSubmitting(false);

    if (success) {
      setSuccessMsg(`Proyecto compartido con ${targetEmail} exitosamente.`);
      setEmail('');
      loadShares();
    } else {
      setErrorMsg('No se pudo compartir. Comprueba si el usuario ya está invitado.');
    }
  };

  const handleRemove = async (shareId: string, email: string) => {
    if (!confirm(`¿Revocar acceso para ${email}?`)) return;
    
    setErrorMsg(null);
    setSuccessMsg(null);
    
    const success = await removeProjectShare(shareId);
    if (success) {
      setSuccessMsg(`Se revocó el acceso de ${email}.`);
      loadShares();
    } else {
      setErrorMsg('No se pudo revocar el acceso. Inténtalo de nuevo.');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Compartir Proyecto"
      className="max-w-md"
    >
      <div className="space-y-6">
        {/* Share Form */}
        <form onSubmit={handleShare} className="space-y-4">
          <p className="text-xs text-content-muted leading-relaxed">
            Invita a otros usuarios a colaborar en esta pizarra compartiéndola por correo electrónico. Deben estar registrados en NodeIDs.
          </p>

          <div className="flex flex-col gap-3">
            <Input
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              label="Correo Electrónico"
              className="text-xs"
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-content">Permisos</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPermission('read')}
                  className={cn(
                    'px-3 py-2 rounded-panel border text-xs font-medium transition-all text-center cursor-pointer',
                    permission === 'read'
                      ? 'border-accent bg-accent/5 text-accent font-semibold ring-1 ring-accent'
                      : 'border-border bg-surface text-content hover:bg-surface-secondary'
                  )}
                >
                  Solo Lectura (Ver)
                </button>
                <button
                  type="button"
                  onClick={() => setPermission('write')}
                  className={cn(
                    'px-3 py-2 rounded-panel border text-xs font-medium transition-all text-center cursor-pointer',
                    permission === 'write'
                      ? 'border-accent bg-accent/5 text-accent font-semibold ring-1 ring-accent'
                      : 'border-border bg-surface text-content hover:bg-surface-secondary'
                  )}
                >
                  Lectura y Escritura (Editar)
                </button>
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="text-xs text-red-600 bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded border border-red-200/30">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="text-xs text-green-600 bg-green-50 dark:bg-green-950/20 px-3 py-2 rounded border border-green-200/30">
              {successMsg}
            </div>
          )}

          <Button type="submit" loading={submitting} className="w-full text-xs h-9">
            <UserCheck className="w-4 h-4 mr-2" />
            Invitar Usuario
          </Button>
        </form>

        {/* Invited Users List */}
        <div className="border-t border-border pt-4 space-y-3">
          <h4 className="text-xs font-bold text-content uppercase tracking-wider">
            Colaboradores con acceso
          </h4>

          {loading ? (
            <div className="flex items-center justify-center py-6 text-content-muted text-xs gap-1.5">
              <Loader className="w-4 h-4 animate-spin text-accent" />
              <span>Cargando colaboradores...</span>
            </div>
          ) : shares.length === 0 ? (
            <p className="text-xs text-content-muted/70 italic py-4 text-center bg-surface-secondary/20 rounded border border-dashed border-border/50">
              Esta pizarra no está compartida con nadie aún.
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {shares.map((share) => (
                <div
                  key={share.id}
                  className="flex items-center justify-between gap-2 p-2 hover:bg-surface-secondary/40 rounded-panel border border-border/40 group transition-all duration-150"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Mail className="w-4 h-4 text-content-muted shrink-0" />
                    <div className="truncate min-w-0">
                      <span className="text-xs text-content block truncate font-medium" title={share.user_email}>
                        {share.user_email}
                      </span>
                      <span className="text-[10px] text-content-muted block leading-none">
                        {share.permission === 'write' ? 'Editar' : 'Ver'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(share.id, share.user_email)}
                    className="p-1 text-content-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-colors shrink-0"
                    title="Revocar acceso"
                  >
                    <UserX className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}
