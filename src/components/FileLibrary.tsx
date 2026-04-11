import { useState, useRef } from 'react';
import { useProjectFiles, FILE_CATEGORIES, type ProjectFile, type ProjectFolder, type FileCategory } from '@/hooks/useProjectFiles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Upload, Download, Trash2, Search, FileText, Image, Table2, PenTool,
  File, FolderOpen, Tag, FolderPlus, Folder, ChevronRight, ArrowLeft, Pencil,
} from 'lucide-react';
import { toast } from 'sonner';

const CATEGORY_ICONS: Record<FileCategory, React.ReactNode> = {
  document: <FileText className="w-4 h-4" />,
  image: <Image className="w-4 h-4" />,
  spreadsheet: <Table2 className="w-4 h-4" />,
  cad: <PenTool className="w-4 h-4" />,
  other: <File className="w-4 h-4" />,
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface FileLibraryProps {
  projectId?: string;
  projectNames?: Record<string, string>;
  compact?: boolean;
}

export default function FileLibrary({ projectId, projectNames, compact }: FileLibraryProps) {
  const {
    files, folders, loading,
    uploadFile, deleteFile, updateFile, getSignedUrl,
    createFolder, renameFolder, deleteFolder,
  } = useProjectFiles(projectId);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Folder navigation
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  // Upload dialog
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploadProjectTag, setUploadProjectTag] = useState<string>('none');
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  // New folder dialog
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Rename folder
  const [renamingFolder, setRenamingFolder] = useState<ProjectFolder | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // --- Handlers ---
  const handleUpload = () => fileInputRef.current?.click();

  const onFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected || selected.length === 0) return;
    if (projectId) {
      Array.from(selected).forEach(f => uploadFile(f, projectId, '', currentFolderId));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setPendingFiles(Array.from(selected));
    setUploadProjectTag('none');
    setShowUploadDialog(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const confirmUpload = async () => {
    const tagProject = uploadProjectTag === 'none' ? null : uploadProjectTag;
    for (const file of pendingFiles) {
      await uploadFile(file, tagProject, '', currentFolderId);
    }
    setPendingFiles([]);
    setShowUploadDialog(false);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    await createFolder(newFolderName.trim(), currentFolderId);
    setNewFolderName('');
    setShowNewFolder(false);
  };

  const handleRename = async () => {
    if (!renamingFolder || !renameValue.trim()) return;
    await renameFolder(renamingFolder.id, renameValue.trim());
    setRenamingFolder(null);
    setRenameValue('');
  };

  const handleDownload = async (file: ProjectFile) => {
    const url = await getSignedUrl(file.storage_path);
    if (!url) { toast.error('Could not generate download link'); return; }
    const a = document.createElement('a');
    a.href = url;
    a.download = file.original_name;
    a.click();
  };

  const handleMoveFile = async (fileId: string, folderId: string) => {
    const val = folderId === 'root' ? null : folderId;
    await updateFile(fileId, { folder_id: val });
  };

  const handleRetagProject = async (fileId: string, newProjectId: string) => {
    const val = newProjectId === 'none' ? null : newProjectId;
    await updateFile(fileId, { project_id: val } as any);
  };

  // --- Derived data ---
  const currentFolders = folders.filter(f => f.parent_id === currentFolderId);
  const currentFiles = files.filter(f => {
    if ((f.folder_id || null) !== currentFolderId) return false;
    if (categoryFilter !== 'all' && f.category !== categoryFilter) return false;
    if (!projectId && projectFilter !== 'all') {
      if (projectFilter === 'untagged') { if (f.project_id) return false; }
      else if (f.project_id !== projectFilter) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      return f.original_name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q);
    }
    return true;
  });

  // Breadcrumb path
  const breadcrumb: ProjectFolder[] = [];
  let walkId = currentFolderId;
  while (walkId) {
    const f = folders.find(fd => fd.id === walkId);
    if (f) { breadcrumb.unshift(f); walkId = f.parent_id; } else break;
  }

  const uniqueProjects = !projectId
    ? [...new Set(files.map(f => f.project_id).filter(Boolean) as string[])]
    : [];
  const allProjectIds = projectNames
    ? [...new Set([...Object.keys(projectNames), ...uniqueProjects])]
    : uniqueProjects;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search files..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-9" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[140px] h-9"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {FILE_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
        {!projectId && (
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-[180px] h-9"><SelectValue placeholder="Project" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Files</SelectItem>
              <SelectItem value="untagged">Untagged (General)</SelectItem>
              {allProjectIds.map(pid => <SelectItem key={pid} value={pid}>{projectNames?.[pid] || pid.slice(0, 8)}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        <Button size="sm" variant="outline" className="gap-1.5 text-xs uppercase tracking-wider" onClick={() => { setNewFolderName(''); setShowNewFolder(true); }}>
          <FolderPlus className="w-3.5 h-3.5" /> New Folder
        </Button>
        <Button size="sm" className="gap-1.5 text-xs uppercase tracking-wider" onClick={handleUpload}>
          <Upload className="w-3.5 h-3.5" /> Upload
        </Button>
        <input ref={fileInputRef} type="file" multiple className="hidden" onChange={onFilesSelected}
          accept=".pdf,.docx,.doc,.txt,.rtf,.jpg,.jpeg,.png,.gif,.bmp,.svg,.webp,.xlsx,.xls,.csv,.dwg,.dxf" />
      </div>

      {/* Breadcrumb */}
      {currentFolderId && (
        <div className="flex items-center gap-1 text-sm">
          <Button variant="ghost" size="sm" className="gap-1 px-2 h-7 text-xs" onClick={() => setCurrentFolderId(null)}>
            <ArrowLeft className="w-3 h-3" /> Root
          </Button>
          {breadcrumb.map((bc, i) => (
            <span key={bc.id} className="flex items-center gap-1">
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
              <button
                className={`text-xs hover:underline ${i === breadcrumb.length - 1 ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}
                onClick={() => setCurrentFolderId(bc.id)}
              >
                {bc.name}
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Loading files...</p>
      ) : (
        <div className="border rounded-lg divide-y divide-border">
          {/* Folders */}
          {currentFolders.map(folder => (
            <div key={folder.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors cursor-pointer group"
              onClick={() => setCurrentFolderId(folder.id)}>
              <Folder className="w-5 h-5 text-primary shrink-0" />
              <span className="text-sm font-medium flex-1 truncate">{folder.name}</span>
              <span className="text-[11px] text-muted-foreground">
                {files.filter(f => f.folder_id === folder.id).length} file{files.filter(f => f.folder_id === folder.id).length !== 1 ? 's' : ''}
              </span>
              <Button size="sm" variant="ghost" className="px-2 opacity-0 group-hover:opacity-100" title="Rename"
                onClick={e => { e.stopPropagation(); setRenamingFolder(folder); setRenameValue(folder.name); }}>
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="ghost" className="px-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                    onClick={e => e.stopPropagation()} title="Delete folder">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent onClick={e => e.stopPropagation()}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete folder "{folder.name}"?</AlertDialogTitle>
                    <AlertDialogDescription>Files inside will be moved to the root level. Sub-folders will also be deleted.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteFolder(folder.id)}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}

          {/* Files */}
          {currentFiles.map(file => (
            <div key={file.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors">
              <span className="text-muted-foreground shrink-0">{CATEGORY_ICONS[file.category as FileCategory] || CATEGORY_ICONS.other}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{file.original_name}</p>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span>{formatSize(file.file_size)}</span>
                  <span>·</span>
                  <span>{new Date(file.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
              {/* Move to folder */}
              <Select value={file.folder_id || 'root'} onValueChange={v => handleMoveFile(file.id, v)}>
                <SelectTrigger className="w-[120px] h-8 text-[11px]">
                  <Folder className="w-3 h-3 mr-1 shrink-0" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="root">Root</SelectItem>
                  {folders.map(fd => <SelectItem key={fd.id} value={fd.id}>{fd.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {/* Project tag */}
              {!projectId && (
                <Select value={file.project_id || 'none'} onValueChange={v => handleRetagProject(file.id, v)}>
                  <SelectTrigger className="w-[130px] h-8 text-[11px]">
                    <Tag className="w-3 h-3 mr-1 shrink-0" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Project</SelectItem>
                    {allProjectIds.map(pid => <SelectItem key={pid} value={pid}>{projectNames?.[pid] || pid.slice(0, 8)}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
              <Badge variant="secondary" className="text-[10px] uppercase tracking-wider shrink-0">{file.file_type}</Badge>
              <Button size="sm" variant="ghost" className="px-2" onClick={() => handleDownload(file)} title="Download">
                <Download className="w-3.5 h-3.5" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="ghost" className="px-2 text-muted-foreground hover:text-destructive" title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete "{file.original_name}"?</AlertDialogTitle>
                    <AlertDialogDescription>This file will be permanently removed from storage.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteFile(file.id)}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}

          {/* Empty */}
          {currentFolders.length === 0 && currentFiles.length === 0 && (
            <div className="text-center py-12 space-y-3">
              <FolderOpen className="w-10 h-10 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">
                {files.length === 0 && folders.length === 0 ? 'No files or folders yet' : 'This folder is empty'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* New Folder dialog */}
      <Dialog open={showNewFolder} onOpenChange={setShowNewFolder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Folder</DialogTitle>
            <DialogDescription>
              {currentFolderId
                ? `Create a sub-folder inside "${breadcrumb[breadcrumb.length - 1]?.name || ''}"`
                : 'Create a new folder at the root level'}
            </DialogDescription>
          </DialogHeader>
          <Input placeholder="Folder name" value={newFolderName} onChange={e => setNewFolderName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreateFolder()} autoFocus />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewFolder(false)}>Cancel</Button>
            <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()} className="gap-1.5">
              <FolderPlus className="w-3.5 h-3.5" /> Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Folder dialog */}
      <Dialog open={!!renamingFolder} onOpenChange={open => { if (!open) setRenamingFolder(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
          </DialogHeader>
          <Input value={renameValue} onChange={e => setRenameValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleRename()} autoFocus />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenamingFolder(null)}>Cancel</Button>
            <Button onClick={handleRename} disabled={!renameValue.trim()}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload dialog — choose project tag */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload {pendingFiles.length} file{pendingFiles.length !== 1 ? 's' : ''}</DialogTitle>
            <DialogDescription>Optionally tag these files to a project, or store them independently.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground truncate">{pendingFiles.map(f => f.name).join(', ')}</div>
            <Select value={uploadProjectTag} onValueChange={setUploadProjectTag}>
              <SelectTrigger><Tag className="w-3.5 h-3.5 mr-2 shrink-0" /><SelectValue placeholder="Tag to project (optional)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Project (General Library)</SelectItem>
                {allProjectIds.map(pid => <SelectItem key={pid} value={pid}>{projectNames?.[pid] || pid.slice(0, 8)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowUploadDialog(false); setPendingFiles([]); }}>Cancel</Button>
            <Button onClick={confirmUpload} className="gap-1.5"><Upload className="w-3.5 h-3.5" /> Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
