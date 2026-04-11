import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export type FileCategory = 'document' | 'image' | 'spreadsheet' | 'cad' | 'other';

export interface ProjectFile {
  id: string;
  user_id: string;
  project_id: string | null;
  folder_id: string | null;
  file_name: string;
  original_name: string;
  file_type: string;
  file_size: number;
  category: FileCategory;
  description: string;
  storage_path: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectFolder {
  id: string;
  user_id: string;
  name: string;
  parent_id: string | null;
  color: string;
  created_at: string;
  updated_at: string;
}

export const FILE_CATEGORIES: { value: FileCategory; label: string; extensions: string[] }[] = [
  { value: 'document', label: 'Documents', extensions: ['pdf', 'docx', 'doc', 'txt', 'rtf'] },
  { value: 'image', label: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'] },
  { value: 'spreadsheet', label: 'Spreadsheets', extensions: ['xlsx', 'xls', 'csv'] },
  { value: 'cad', label: 'CAD/Drawings', extensions: ['dwg', 'dxf'] },
  { value: 'other', label: 'Other', extensions: [] },
];

const MAX_FILE_SIZE = 20 * 1024 * 1024;

function detectCategory(ext: string): FileCategory {
  for (const cat of FILE_CATEGORIES) {
    if (cat.extensions.includes(ext.toLowerCase())) return cat.value;
  }
  return 'other';
}

export function useProjectFiles(projectId?: string) {
  const { user } = useAuth();
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [folders, setFolders] = useState<ProjectFolder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) { setFiles([]); setFolders([]); setLoading(false); return; }
    try {
      const [filesRes, foldersRes] = await Promise.all([
        (() => {
          let q = supabase.from('project_files').select('*').order('created_at', { ascending: false });
          if (projectId) q = q.eq('project_id', projectId);
          return q;
        })(),
        supabase.from('project_folders').select('*').order('name'),
      ]);
      if (filesRes.error) throw filesRes.error;
      if (foldersRes.error) throw foldersRes.error;
      setFiles((filesRes.data as unknown as ProjectFile[]) || []);
      setFolders((foldersRes.data as unknown as ProjectFolder[]) || []);
    } catch (err: any) {
      console.error('Failed to load files:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId, user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // --- Folder CRUD ---
  const createFolder = useCallback(async (name: string, parentId?: string | null) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('project_folders')
      .insert({ user_id: user.id, name, parent_id: parentId || null } as any)
      .select()
      .single();
    if (error) { toast.error('Failed to create folder'); return; }
    setFolders(prev => [...prev, data as unknown as ProjectFolder]);
    toast.success(`Folder "${name}" created`);
  }, [user]);

  const renameFolder = useCallback(async (id: string, name: string) => {
    const { error } = await supabase.from('project_folders').update({ name } as any).eq('id', id);
    if (error) { toast.error('Failed to rename'); return; }
    setFolders(prev => prev.map(f => f.id === id ? { ...f, name } : f));
  }, []);

  const deleteFolder = useCallback(async (id: string) => {
    // Move files out of folder first
    await supabase.from('project_files').update({ folder_id: null } as any).eq('folder_id', id);
    const { error } = await supabase.from('project_folders').delete().eq('id', id);
    if (error) { toast.error('Failed to delete folder'); return; }
    setFolders(prev => prev.filter(f => f.id !== id));
    setFiles(prev => prev.map(f => f.folder_id === id ? { ...f, folder_id: null } : f));
    toast.success('Folder deleted');
  }, []);

  // --- File CRUD ---
  const uploadFile = useCallback(async (file: File, targetProjectId?: string | null, description = '', folderId?: string | null) => {
    if (!user) { toast.error('Sign in to upload files'); return; }
    if (file.size > MAX_FILE_SIZE) { toast.error('Max file size is 20MB'); return; }

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const uniqueName = `${crypto.randomUUID()}.${ext}`;
    const folder = targetProjectId || '_general';
    const storagePath = `${user.id}/${folder}/${uniqueName}`;

    const { error: uploadErr } = await supabase.storage
      .from('project-files')
      .upload(storagePath, file, { cacheControl: '3600', upsert: false });
    if (uploadErr) { toast.error('Upload failed'); console.error(uploadErr); return; }

    const { data: row, error: insertErr } = await supabase
      .from('project_files')
      .insert({
        user_id: user.id,
        project_id: targetProjectId || null,
        folder_id: folderId || null,
        file_name: uniqueName,
        original_name: file.name,
        file_type: ext,
        file_size: file.size,
        category: detectCategory(ext),
        description,
        storage_path: storagePath,
      } as any)
      .select()
      .single();
    if (insertErr) { toast.error('Failed to save file record'); return; }
    setFiles(prev => [row as unknown as ProjectFile, ...prev]);
    toast.success(`Uploaded ${file.name}`);
  }, [user]);

  const deleteFile = useCallback(async (id: string) => {
    const file = files.find(f => f.id === id);
    if (!file) return;
    await supabase.storage.from('project-files').remove([file.storage_path]);
    const { error } = await supabase.from('project_files').delete().eq('id', id);
    if (error) { toast.error('Failed to delete'); return; }
    setFiles(prev => prev.filter(f => f.id !== id));
    toast.success('File deleted');
  }, [files]);

  const updateFile = useCallback(async (id: string, updates: Partial<Pick<ProjectFile, 'description' | 'category' | 'project_id' | 'folder_id'>>) => {
    const { error } = await supabase.from('project_files').update(updates as any).eq('id', id);
    if (error) { toast.error('Failed to update'); return; }
    setFiles(prev => prev.map(f => f.id === id ? { ...f, ...updates } as ProjectFile : f));
  }, []);

  const getSignedUrl = useCallback(async (storagePath: string): Promise<string | null> => {
    const { data } = await supabase.storage.from('project-files').createSignedUrl(storagePath, 3600);
    return data?.signedUrl ?? null;
  }, []);

  return {
    files, folders, loading,
    uploadFile, deleteFile, updateFile, getSignedUrl,
    createFolder, renameFolder, deleteFolder,
    refetch: fetchAll,
  };
}
