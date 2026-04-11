import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

/** Generate a signed URL for a drawing file (valid 1 hour). */
export async function getDrawingSignedUrl(projectId: string, fileName: string): Promise<string | null> {
  const { data } = await supabase.storage
    .from('drawings')
    .createSignedUrl(`${projectId}/${fileName}`, 3600);
  return data?.signedUrl ?? null;
}

export type DrawingCategory = 'forApproval' | 'forInstallation' | 'asFitted';
export type DrawingStatus = 'draft' | 'forApproval' | 'approved' | 'issued' | 'superseded';

export interface ProjectDrawing {
  id: string;
  user_id: string;
  project_id: string;
  name: string;
  category: DrawingCategory;
  revision: string;
  revision_date: string;
  status: DrawingStatus;
  file_name: string | null;
  file_url: string | null;
  file_type: string | null;
  file_size: number | null;
  notes: string;
  drawing_number: string;
  sheet_number: string;
  created_at: string;
  updated_at: string;
}

export const DRAWING_CATEGORIES: { value: DrawingCategory; label: string }[] = [
  { value: 'forApproval', label: 'For Approval' },
  { value: 'forInstallation', label: 'For Installation' },
  { value: 'asFitted', label: 'As Fitted' },
];

export const DRAWING_STATUSES: { value: DrawingStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'forApproval', label: 'For Approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'issued', label: 'Issued' },
  { value: 'superseded', label: 'Superseded' },
];

export function useProjectDrawings(projectId: string) {
  const { user } = useAuth();
  const [drawings, setDrawings] = useState<ProjectDrawing[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDrawings = useCallback(async () => {
    if (!user) { setDrawings([]); setLoading(false); return; }
    try {
      const { data, error } = await supabase
        .from('project_drawings')
        .select('*')
        .eq('project_id', projectId)
        .order('category')
        .order('drawing_number')
        .order('created_at');
      if (error) throw error;
      setDrawings((data as unknown as ProjectDrawing[]) || []);
    } catch (err: any) {
      console.error('Failed to load drawings:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId, user]);

  useEffect(() => { fetchDrawings(); }, [fetchDrawings]);

  const addDrawing = useCallback(async (category: DrawingCategory) => {
    if (!user) { toast.error('Sign in to add drawings'); return; }
    const { data: row, error } = await supabase
      .from('project_drawings')
      .insert({
        user_id: user.id,
        project_id: projectId,
        category,
        name: '',
        revision: 'A',
        revision_date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single();
    if (error) { toast.error('Failed to add drawing'); return; }
    setDrawings(prev => [...prev, row as unknown as ProjectDrawing]);
  }, [user, projectId]);

  const updateDrawing = useCallback(async (id: string, updates: Partial<ProjectDrawing>) => {
    const { error } = await supabase
      .from('project_drawings')
      .update(updates as any)
      .eq('id', id);
    if (error) { toast.error('Failed to update'); return; }
    setDrawings(prev => prev.map(d => d.id === id ? { ...d, ...updates } as ProjectDrawing : d));
  }, []);

  const deleteDrawing = useCallback(async (id: string) => {
    const drawing = drawings.find(d => d.id === id);
    if (drawing?.file_name) {
      await supabase.storage.from('drawings').remove([`${projectId}/${drawing.file_name}`]);
    }
    const { error } = await supabase.from('project_drawings').delete().eq('id', id);
    if (error) { toast.error('Failed to delete'); return; }
    setDrawings(prev => prev.filter(d => d.id !== id));
  }, [drawings, projectId]);

  const uploadFile = useCallback(async (drawingId: string, file: File) => {
    if (file.size > 20 * 1024 * 1024) { toast.error('Max 20MB'); return; }
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!['pdf', 'dwg', 'jpg', 'jpeg', 'png'].includes(ext)) {
      toast.error('Unsupported file type');
      return;
    }
    const uniqueName = `${drawingId}_${Date.now()}.${ext}`;
    const path = `${projectId}/${uniqueName}`;
    const { error } = await supabase.storage.from('drawings').upload(path, file, { cacheControl: '3600', upsert: true });
    if (error) { toast.error('Upload failed'); return; }
    const storedPath = `${projectId}/${uniqueName}`;
    await updateDrawing(drawingId, {
      file_name: uniqueName,
      file_url: storedPath,
      file_type: ext,
      file_size: file.size,
    });
    toast.success('File uploaded');
  }, [projectId, updateDrawing]);

  const reviseDrawing = useCallback(async (id: string) => {
    const drawing = drawings.find(d => d.id === id);
    if (!drawing || !user) return;
    // Mark current as superseded
    await updateDrawing(id, { status: 'superseded' });
    // Create new revision
    const nextRev = String.fromCharCode(drawing.revision.charCodeAt(0) + 1);
    const { data: row, error } = await supabase
      .from('project_drawings')
      .insert({
        user_id: user.id,
        project_id: projectId,
        category: drawing.category,
        name: drawing.name,
        drawing_number: drawing.drawing_number,
        sheet_number: drawing.sheet_number,
        revision: nextRev,
        revision_date: new Date().toISOString().split('T')[0],
        notes: '',
      })
      .select()
      .single();
    if (error) { toast.error('Failed to create revision'); return; }
    setDrawings(prev => [...prev, row as unknown as ProjectDrawing]);
    toast.success(`Revision ${nextRev} created`);
  }, [drawings, user, projectId, updateDrawing]);

  return { drawings, loading, addDrawing, updateDrawing, deleteDrawing, uploadFile, reviseDrawing, refetch: fetchDrawings };
}
