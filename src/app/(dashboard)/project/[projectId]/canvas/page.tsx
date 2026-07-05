'use client';

import { useParams } from 'next/navigation';
import { CanvasContainer } from '@/components/canvas/canvas-container';

export default function ProjectCanvasPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  return <CanvasContainer projectId={projectId} />;
}
