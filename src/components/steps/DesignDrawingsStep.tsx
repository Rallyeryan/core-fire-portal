import { useSpec } from '@/context/SpecContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, FileImage, Upload, Eye, Download, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getDrawingSignedUrl } from '@/hooks/useProjectDrawings';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { DrawingLibrary as DrawingLibraryComponent } from '@/components/job/DrawingLibrary';

const DRAWING_STATUSES = [
  { value: 'draft' as const, label: 'Draft' },
  { value: 'forApproval' as const, label: 'For Approval' },
  { value: 'approved' as const, label: 'Approved' },
  { value: 'clientProvided' as const, label: 'Client Provided Design Drawings' },
  { value: 'asFitted' as const, label: 'As Fitted' },
];

const ACCEPTED_TYPES = '.pdf,.dwg,.jpg,.jpeg,.png';
const ACCEPTED_MIME = ['application/pdf', 'image/jpeg', 'image/png', 'application/octet-stream', 'application/acad', 'image/vnd.dwg'];
const MAX_SIZE = 20 * 1024 * 1024; // 20MB

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DesignDrawingsStep() {
  const { data, updateData, projectId } = useSpec();
  const drawings = data.designDrawings || [];
  const [uploading, setUploading] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState('');
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const addDrawing = () => {
    updateData({
      designDrawings: [
        ...drawings,
        { id: crypto.randomUUID(), name: '', status: 'draft' as const, notes: '' },
      ],
    });
  };

  const updateDrawing = (id: string, updates: Partial<typeof drawings[0]>) => {
    updateData({
      designDrawings: drawings.map(d => d.id === id ? { ...d, ...updates } : d),
    });
  };

  const removeDrawing = async (id: string) => {
    const drawing = drawings.find(d => d.id === id);
    // Delete file from storage if it exists
    if (drawing?.fileName) {
      const path = `${projectId}/${drawing.fileName}`;
      await supabase.storage.from('drawings').remove([path]);
    }
    updateData({
      designDrawings: drawings.filter(d => d.id !== id),
    });
  };

  const handleFileUpload = async (drawingId: string, file: File) => {
    if (file.size > MAX_SIZE) {
      toast.error('File too large', { description: 'Maximum file size is 20MB.' });
      return;
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!['pdf', 'dwg', 'jpg', 'jpeg', 'png'].includes(ext)) {
      toast.error('Unsupported file type', { description: 'Please upload PDF, DWG, JPEG, or PNG files.' });
      return;
    }

    setUploading(drawingId);
    try {
      const uniqueName = `${drawingId}_${Date.now()}.${ext}`;
      const path = `${projectId}/${uniqueName}`;

      const { error } = await supabase.storage.from('drawings').upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      });

      if (error) throw error;

      updateDrawing(drawingId, {
        fileName: uniqueName,
        fileUrl: path,
        fileType: ext,
        fileSize: file.size,
        name: drawings.find(d => d.id === drawingId)?.name || file.name.replace(`.${ext}`, ''),
      });

      toast.success('File uploaded', { description: file.name });
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error('Upload failed', { description: err.message || 'Please try again.' });
    } finally {
      setUploading(null);
    }
  };

  const openPreview = async (drawing: typeof drawings[0]) => {
    if (!drawing.fileName) return;
    const url = await getDrawingSignedUrl(projectId, drawing.fileName);
    if (!url) { toast.error('Could not load file'); return; }
    if (drawing.fileType === 'dwg') {
      window.open(url, '_blank');
      return;
    }
    setPreviewUrl(url);
    setPreviewName(drawing.name || drawing.fileName || 'Drawing');
  };

  const downloadDrawingFile = async (drawing: typeof drawings[0]) => {
    if (!drawing.fileName) return;
    const url = await getDrawingSignedUrl(projectId, drawing.fileName);
    if (url) window.open(url, '_blank');
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="spec-section-title text-xl mb-1">Design Drawings</h2>
        <p className="text-sm text-muted-foreground">
          Track and upload design drawings for this project. Supported formats: PDF, DWG, JPEG, PNG (max 20MB each).
        </p>
      </div>

      {/* Cloud Drawing Library */}
      {projectId && (
        <div className="spec-card space-y-3">
          <h3 className="spec-section-title text-sm">Cloud Drawing Library</h3>
          <p className="text-xs text-muted-foreground">
            Drawings stored here persist across sessions and are available in Job Management and the Operating Manual.
          </p>
          <DrawingLibraryComponent projectId={projectId} />
        </div>
      )}

      <div className="spec-card space-y-1">
        <h3 className="spec-section-title text-sm">Local Drawing References</h3>
        <p className="text-xs text-muted-foreground mb-3">Quick drawing references saved with this specification.</p>
      </div>

      <div className="spec-card space-y-4">
        {drawings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileImage className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No design drawings added yet.</p>
            <p className="text-xs">Click the button below to add a drawing reference.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="hidden md:grid grid-cols-[1fr_160px_1fr_auto] gap-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
              <span>Drawing Name / Reference</span>
              <span>Status</span>
              <span>Notes</span>
              <span>Actions</span>
            </div>
            {drawings.map(drawing => (
              <div key={drawing.id} className="grid grid-cols-1 md:grid-cols-[1fr_160px_1fr_auto] gap-3 items-start p-3 rounded-lg border bg-muted/20">
                <div className="space-y-2">
                  <Label className="text-xs md:hidden">Drawing Name / Reference</Label>
                  <Input
                    className="h-9 text-sm"
                    value={drawing.name}
                    onChange={e => updateDrawing(drawing.id, { name: e.target.value })}
                    placeholder="e.g. Ground Floor Fire Alarm Layout"
                  />
                  {/* File upload area */}
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept={ACCEPTED_TYPES}
                      className="hidden"
                      ref={el => { fileInputRefs.current[drawing.id] = el; }}
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(drawing.id, file);
                        e.target.value = '';
                      }}
                    />
                    {drawing.fileUrl ? (
                      <div className="flex items-center gap-2 text-xs bg-background rounded px-2 py-1 border flex-1 min-w-0">
                        <FileImage className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="truncate flex-1">{drawing.fileName}</span>
                        <span className="text-muted-foreground shrink-0">
                          {drawing.fileSize ? formatFileSize(drawing.fileSize) : ''}
                        </span>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 text-xs h-7"
                        disabled={uploading === drawing.id}
                        onClick={() => fileInputRefs.current[drawing.id]?.click()}
                      >
                        {uploading === drawing.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Upload className="w-3 h-3" />
                        )}
                        {uploading === drawing.id ? 'Uploading…' : 'Upload File'}
                      </Button>
                    )}
                    {drawing.fileUrl && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          title="View"
                          onClick={() => openPreview(drawing)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          title="Download"
                          onClick={() => downloadDrawingFile(drawing)}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          title="Replace file"
                          disabled={uploading === drawing.id}
                          onClick={() => fileInputRefs.current[drawing.id]?.click()}
                        >
                          <Upload className="w-3.5 h-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-xs md:hidden">Status</Label>
                  <Select
                    value={drawing.status}
                    onValueChange={(v: typeof drawing.status) => updateDrawing(drawing.id, { status: v })}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DRAWING_STATUSES.map(s => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs md:hidden">Notes</Label>
                  <Textarea
                    className="text-sm min-h-[36px]"
                    rows={1}
                    value={drawing.notes}
                    onChange={e => updateDrawing(drawing.id, { notes: e.target.value })}
                    placeholder="Revision, sheet number, notes..."
                  />
                </div>
                <div className="flex gap-1 items-start">
                  <button
                    onClick={() => removeDrawing(drawing.id)}
                    className="text-muted-foreground hover:text-destructive mt-1"
                    title="Remove drawing"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Button variant="outline" size="sm" onClick={addDrawing} className="gap-1">
          <Plus className="w-3 h-3" /> Add Drawing
        </Button>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewUrl} onOpenChange={open => { if (!open) setPreviewUrl(null); }}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{previewName}</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[75vh]">
            {previewUrl && (
              previewUrl.match(/\.(jpg|jpeg|png)$/i) ? (
                <img src={previewUrl} alt={previewName} className="w-full h-auto" />
              ) : (
                <iframe
                  src={previewUrl}
                  className="w-full h-[70vh] border-0 rounded"
                  title={previewName}
                />
              )
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
