import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Plus, Trash2, Upload, Eye, Download, FileImage, Loader2, GitBranch, FolderOpen,
} from 'lucide-react';
import {
  useProjectDrawings, DRAWING_CATEGORIES, DRAWING_STATUSES,
  getDrawingSignedUrl,
  type DrawingCategory, type DrawingStatus, type ProjectDrawing,
} from '@/hooks/useProjectDrawings';

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const statusColor: Record<DrawingStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  forApproval: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  issued: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  superseded: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

interface DrawingLibraryProps {
  projectId: string;
  filterCategory?: DrawingCategory;
  readOnly?: boolean;
  compact?: boolean;
}

export function DrawingLibrary({ projectId, filterCategory, readOnly, compact }: DrawingLibraryProps) {
  const { drawings, loading, addDrawing, updateDrawing, deleteDrawing, uploadFile, reviseDrawing } = useProjectDrawings(projectId);
  const [uploading, setUploading] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState('');
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const grouped = DRAWING_CATEGORIES
    .filter(c => !filterCategory || c.value === filterCategory)
    .map(cat => ({
      ...cat,
      items: drawings.filter(d => d.category === cat.value),
    }));

  const activeCount = drawings.filter(d => d.status !== 'superseded' && (!filterCategory || d.category === filterCategory)).length;

  const handleUpload = async (drawingId: string, file: File) => {
    setUploading(drawingId);
    await uploadFile(drawingId, file);
    setUploading(null);
  };

  const openPreview = async (d: ProjectDrawing) => {
    if (!d.file_name) return;
    const url = await getDrawingSignedUrl(projectId, d.file_name);
    if (!url) { toast.error('Could not load file'); return; }
    if (d.file_type === 'dwg') { window.open(url, '_blank'); return; }
    setPreviewUrl(url);
    setPreviewName(d.name || d.file_name || 'Drawing');
  };

  const downloadFile = async (d: ProjectDrawing) => {
    if (!d.file_name) return;
    const url = await getDrawingSignedUrl(projectId, d.file_name);
    if (url) window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading drawings…
      </div>
    );
  }

  if (compact) {
    // Compact view for Operating Manual
    const active = drawings.filter(d => d.status !== 'superseded' && (!filterCategory || d.category === filterCategory));
    if (active.length === 0) return <p className="text-sm text-muted-foreground italic">No drawings uploaded yet.</p>;
    return (
      <div className="space-y-1">
        {DRAWING_CATEGORIES.filter(c => !filterCategory || c.value === filterCategory).map(cat => {
          const catDrawings = active.filter(d => d.category === cat.value);
          if (catDrawings.length === 0) return null;
          return (
            <div key={cat.value}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-2 mb-1">{cat.label}</p>
              {catDrawings.map(d => (
                <div key={d.id} className="flex items-center justify-between py-1 text-sm border-b border-border/50">
                  <span className="truncate flex-1">
                    {d.drawing_number && <span className="font-mono text-xs mr-1">{d.drawing_number}</span>}
                    {d.name || 'Untitled'}
                    <span className="text-xs text-muted-foreground ml-1">Rev {d.revision}</span>
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <Badge variant="secondary" className={`text-[9px] ${statusColor[d.status as DrawingStatus]}`}>
                      {DRAWING_STATUSES.find(s => s.value === d.status)?.label}
                    </Badge>
                    {d.file_name && (
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => downloadFile(d)}>
                        <Download className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!readOnly && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{activeCount} active drawing(s)</p>
        </div>
      )}

      <Accordion type="multiple" defaultValue={DRAWING_CATEGORIES.map(c => c.value)}>
        {grouped.map(cat => (
          <AccordionItem key={cat.value} value={cat.value}>
            <AccordionTrigger className="text-sm font-semibold">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                {cat.label}
                <Badge variant="secondary" className="text-[10px]">{cat.items.filter(d => d.status !== 'superseded').length}</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pt-2">
              {cat.items.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <FileImage className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">No {cat.label.toLowerCase()} drawings yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {cat.items.map(d => (
                    <div
                      key={d.id}
                      className={`p-3 rounded-lg border bg-muted/20 space-y-2 ${d.status === 'superseded' ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={`text-[9px] shrink-0 ${statusColor[d.status as DrawingStatus]}`}>
                          {DRAWING_STATUSES.find(s => s.value === d.status)?.label}
                        </Badge>
                        <span className="font-mono text-xs text-muted-foreground">Rev {d.revision}</span>
                        {d.revision_date && <span className="text-[10px] text-muted-foreground">({d.revision_date})</span>}
                        <div className="flex-1" />
                        {!readOnly && d.status !== 'superseded' && (
                          <>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] gap-1" onClick={() => reviseDrawing(d.id)}>
                              <GitBranch className="w-3 h-3" /> New Revision
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => deleteDrawing(d.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                      {!readOnly && d.status !== 'superseded' ? (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                          <div>
                            <Label className="text-[10px]">Drawing No.</Label>
                            <Input className="h-8 text-xs" value={d.drawing_number} onChange={e => updateDrawing(d.id, { drawing_number: e.target.value })} placeholder="DWG-001" />
                          </div>
                          <div>
                            <Label className="text-[10px]">Sheet</Label>
                            <Input className="h-8 text-xs" value={d.sheet_number} onChange={e => updateDrawing(d.id, { sheet_number: e.target.value })} placeholder="1 of 3" />
                          </div>
                          <div className="md:col-span-2">
                            <Label className="text-[10px]">Drawing Name</Label>
                            <Input className="h-8 text-xs" value={d.name} onChange={e => updateDrawing(d.id, { name: e.target.value })} placeholder="Ground Floor Fire Alarm Layout" />
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm font-medium">
                          {d.drawing_number && <span className="font-mono text-xs mr-2">{d.drawing_number}</span>}
                          {d.name || 'Untitled'}
                          {d.sheet_number && <span className="text-xs text-muted-foreground ml-2">Sheet {d.sheet_number}</span>}
                        </p>
                      )}
                      {!readOnly && d.status !== 'superseded' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div>
                            <Label className="text-[10px]">Status</Label>
                            <Select value={d.status} onValueChange={(v: DrawingStatus) => updateDrawing(d.id, { status: v })}>
                              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {DRAWING_STATUSES.filter(s => s.value !== 'superseded').map(s => (
                                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-[10px]">Notes</Label>
                            <Input className="h-8 text-xs" value={d.notes} onChange={e => updateDrawing(d.id, { notes: e.target.value })} placeholder="Notes…" />
                          </div>
                        </div>
                      )}
                      {/* File upload / display */}
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept=".pdf,.dwg,.jpg,.jpeg,.png"
                          className="hidden"
                          ref={el => { fileInputRefs.current[d.id] = el; }}
                          onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(d.id, f); e.target.value = ''; }}
                        />
                        {d.file_name ? (
                          <div className="flex items-center gap-2 text-xs bg-background rounded px-2 py-1 border flex-1 min-w-0">
                            <FileImage className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="truncate flex-1">{d.file_name}</span>
                            {d.file_size && <span className="text-muted-foreground shrink-0">{formatFileSize(d.file_size)}</span>}
                          </div>
                        ) : !readOnly && d.status !== 'superseded' ? (
                          <Button variant="outline" size="sm" className="gap-1 text-xs h-7" disabled={uploading === d.id} onClick={() => fileInputRefs.current[d.id]?.click()}>
                            {uploading === d.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                            {uploading === d.id ? 'Uploading…' : 'Upload File'}
                          </Button>
                        ) : null}
                        {d.file_name && (
                          <>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="View" onClick={() => openPreview(d)}>
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Download" onClick={() => downloadFile(d)}>
                              <Download className="w-3.5 h-3.5" />
                            </Button>
                            {!readOnly && d.status !== 'superseded' && (
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Replace" disabled={uploading === d.id} onClick={() => fileInputRefs.current[d.id]?.click()}>
                                <Upload className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!readOnly && (
                <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => addDrawing(cat.value)}>
                  <Plus className="w-3 h-3" /> Add {cat.label} Drawing
                </Button>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Preview Dialog */}
      <Dialog open={!!previewUrl} onOpenChange={open => { if (!open) setPreviewUrl(null); }}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader><DialogTitle>{previewName}</DialogTitle></DialogHeader>
          <div className="overflow-auto max-h-[75vh]">
            {previewUrl && (
              previewUrl.match(/\.(jpg|jpeg|png)(\?|$)/i)
                ? <img src={previewUrl} alt={previewName} className="w-full h-auto" />
                : <iframe src={previewUrl} className="w-full h-[70vh] border-0 rounded" title={previewName} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
