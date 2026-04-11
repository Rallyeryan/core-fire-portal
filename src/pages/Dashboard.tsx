import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listProjects, createProject, deleteProject, duplicateProject, exportProject, importProject, exportAllProjects, importBulk, type SavedProject } from '@/lib/projectStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, FileText, Wrench, Trash2, Clock, Search, Copy, Download, Upload, LogIn, LogOut, User, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SplineScene } from '@/components/ui/splite';
import { Card } from '@/components/ui/card';
import { Spotlight } from '@/components/ui/spotlight';
import { useAuth } from '@/context/AuthContext';
import FileLibrary from '@/components/FileLibrary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const DeckGlyph = () => (
  <svg viewBox="0 0 120 120" className="h-10 w-10" aria-hidden>
    <circle
      cx="60" cy="60" r="46" fill="none" stroke="currentColor" strokeWidth="1.4"
      style={{ strokeDasharray: "18 14" }}
    />
    <rect x="34" y="34" width="52" height="52" rx="14" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1.2" />
    <circle cx="60" cy="60" r="7" fill="currentColor" />
    <path d="M60 30v10M60 80v10M30 60h10M80 60h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [projects, setProjects] = useState<SavedProject[]>(listProjects());
  const [newName, setNewName] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [search, setSearch] = useState('');
  const [dupSource, setDupSource] = useState<SavedProject | null>(null);
  const [dupName, setDupName] = useState('');
  const [activeTab, setActiveTab] = useState('projects');

  // Build project name map for file library
  const projectNames = projects.reduce<Record<string, string>>((acc, p) => { acc[p.id] = p.name; return acc; }, {});
  const handleCreate = () => {
    if (!newName.trim()) return;
    const id = createProject(newName.trim());
    setNewName('');
    setShowNew(false);
    navigate(`/spec/${id}`);
  };

  const handleDelete = (id: string) => {
    deleteProject(id);
    setProjects(listProjects());
  };

  const handleDuplicate = () => {
    if (!dupSource || !dupName.trim()) return;
    const newId = duplicateProject(dupSource.id, dupName.trim());
    setDupSource(null);
    setDupName('');
    setProjects(listProjects());
    navigate(`/spec/${newId}`);
  };

  const handleExportAll = () => {
    const data = exportAllProjects();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FDA_Backup_${new Date().toISOString().split('T')[0]}.fda.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${data.projects.length} project(s)`);
  };

  const handleExport = (id: string, name: string) => {
    const data = exportProject(id);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.replace(/[^a-zA-Z0-9-_ ]/g, '')}.fda.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Project exported');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (data.type === 'bulk' && Array.isArray(data.projects)) {
          const count = importBulk(data);
          setProjects(listProjects());
          toast.success(`Imported ${count} project(s) from backup`);
        } else if (data.version && data.project) {
          importProject(data);
          setProjects(listProjects());
          toast.success(`Imported "${data.project.name}"`);
        } else {
          toast.error('Invalid project file');
        }
      } catch {
        toast.error('Failed to import — invalid JSON file');
      }
    };
    input.click();
  };

  const filtered = projects.filter(p =>
    [p.name, p.customerName, p.siteName, p.specReference]
      .some(f => f.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <DeckGlyph />
            <div>
              <h1 className="font-heading text-xl font-bold tracking-tight">FD&A Project Manager</h1>
              <p className="text-xs text-muted-foreground tracking-wider uppercase">
                Fire Detection & Alarm — BS5839-1:2025
              </p>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            {user ? (
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={() => { signOut(); toast.success('Signed out'); }}>
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline truncate max-w-[100px]">{user.email}</span>
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <Button variant="outline" size="sm" className="gap-1.5 text-xs uppercase tracking-wider" onClick={() => navigate('/auth')}>
                <LogIn className="w-3.5 h-3.5" /> Sign In
              </Button>
            )}
            <ThemeToggle />
            {projects.length > 0 && (
              <Button variant="outline" className="gap-2 text-xs uppercase tracking-wider" onClick={handleExportAll}>
                <Download className="w-3.5 h-3.5" /> Backup All
              </Button>
            )}
            <Button variant="outline" className="gap-2 text-xs uppercase tracking-wider" onClick={handleImport}>
              <Upload className="w-3.5 h-3.5" /> Import
            </Button>
            <Dialog open={showNew} onOpenChange={setShowNew}>
              <DialogTrigger asChild>
                <Button className="gap-2 text-xs uppercase tracking-wider">
                  <Plus className="w-3.5 h-3.5" /> New Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>Give your project a name. You can update details later in the specification builder.</DialogDescription>
                </DialogHeader>
                <Input
                  placeholder="e.g. Acme HQ Fire Alarm Upgrade"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                  autoFocus
                />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
                  <Button onClick={handleCreate} disabled={!newName.trim()}>Create & Open</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Hero / Cover */}
      <Card className="w-full max-w-6xl mx-auto mt-8 rounded-xl border border-border bg-background/50 backdrop-blur overflow-hidden relative">
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" size={300} />
        <div className="flex flex-col md:flex-row h-[400px]">
          {/* Left content */}
          <div className="flex-1 p-8 md:p-12 relative z-10 flex flex-col justify-center">
            <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight">
              Fire Detection<br />& Alarm System
            </h2>
            <p className="mt-4 text-sm text-muted-foreground max-w-md leading-relaxed">
              Design, specify, and manage BS5839-1:2025 compliant fire detection & alarm systems.
              From specification to commissioning — all in one place.
            </p>
            <div className="flex gap-3 mt-6">
              <Button onClick={() => setShowNew(true)} className="gap-2 text-xs uppercase tracking-wider">
                <Plus className="w-3.5 h-3.5" /> New Project
              </Button>
              <Button variant="outline" className="gap-2 text-xs uppercase tracking-wider" onClick={handleImport}>
                <Upload className="w-3.5 h-3.5" /> Import
              </Button>
            </div>
          </div>

          {/* Right 3D scene */}
          <div className="flex-1 relative hidden md:block">
            <SplineScene
              scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
              className="w-full h-full"
            />
          </div>
        </div>
      </Card>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="projects" className="gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Projects
            </TabsTrigger>
            <TabsTrigger value="files" className="gap-1.5">
              <FolderOpen className="w-3.5 h-3.5" /> File Library
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-6 mt-4">
            {projects.length > 0 && (
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
              </div>
            )}

            {projects.length === 0 && (
              <div className="text-center py-24 space-y-5 animate-fade-in">
                <div className="w-20 h-20 rounded-2xl border border-border flex items-center justify-center mx-auto">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <h2 className="font-heading text-lg font-semibold">No projects yet</h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">Create your first project to start building a fire detection & alarm specification.</p>
                <Button onClick={() => setShowNew(true)} className="gap-2"><Plus className="w-4 h-4" /> Create First Project</Button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(project => (
                <div key={project.id} className="spec-card mono-spotlight group relative flex flex-col animate-fade-in"
                  onMouseMove={e => { const rect = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--hero3-x', `${e.clientX - rect.left}px`); e.currentTarget.style.setProperty('--hero3-y', `${e.clientY - rect.top}px`); }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-heading font-semibold text-sm truncate">{project.name}</h3>
                      {project.customerName && <p className="text-xs text-muted-foreground truncate">{project.customerName}</p>}
                    </div>
                    {project.hasJob && project.jobStatus && (
                      <Badge variant="secondary" className="text-[10px] shrink-0 uppercase tracking-wider">{project.jobStatus}</Badge>
                    )}
                  </div>
                  {(project.siteName || project.specReference) && (
                    <div className="text-xs text-muted-foreground space-y-0.5 mb-3">
                      {project.siteName && <p>Site: {project.siteName}</p>}
                      {project.specReference && <p>Ref: {project.specReference}</p>}
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-4">
                    <Clock className="w-3 h-3" />
                    {new Date(project.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <Button size="sm" variant="outline" className="flex-1 gap-1.5 text-xs" onClick={() => navigate(`/spec/${project.id}`)}><FileText className="w-3.5 h-3.5" /> Specification</Button>
                    <Button size="sm" variant="outline" className="flex-1 gap-1.5 text-xs" onClick={() => navigate(`/job/${project.id}`)}><Wrench className="w-3.5 h-3.5" /> Job Mgmt</Button>
                    <Button size="sm" variant="ghost" className="px-2 text-muted-foreground hover:text-foreground" onClick={() => handleExport(project.id, project.name)} title="Export as JSON"><Download className="w-3.5 h-3.5" /></Button>
                    <Button size="sm" variant="ghost" className="px-2 text-muted-foreground hover:text-foreground" onClick={() => { setDupSource(project); setDupName(`${project.name} (Copy)`); }} title="Duplicate project"><Copy className="w-3.5 h-3.5" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button size="sm" variant="ghost" className="px-2 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button></AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Delete "{project.name}"?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the specification and job data.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(project.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="files" className="mt-4">
            {user ? (
              <FileLibrary projectNames={projectNames} />
            ) : (
              <div className="text-center py-16 space-y-4">
                <FolderOpen className="w-10 h-10 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">Sign in to access the file library</p>
                <Button variant="outline" onClick={() => navigate('/auth')}>Sign In</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Duplicate dialog */}
        <Dialog open={!!dupSource} onOpenChange={open => { if (!open) setDupSource(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Duplicate Project</DialogTitle>
              <DialogDescription>
                Create a copy of "{dupSource?.name}" with all specification data. Job management data is not copied.
              </DialogDescription>
            </DialogHeader>
            <Input
              placeholder="New project name"
              value={dupName}
              onChange={e => setDupName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleDuplicate()}
              autoFocus
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setDupSource(null)}>Cancel</Button>
              <Button onClick={handleDuplicate} disabled={!dupName.trim()} className="gap-2">
                <Copy className="w-4 h-4" /> Duplicate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
