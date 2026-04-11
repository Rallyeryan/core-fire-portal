import { useJob } from '@/context/JobContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { type DocumentStatus, type DocumentItem } from '@/types/jobData';
import { DrawingLibrary } from './DrawingLibrary';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const statusOptions: { value: DocumentStatus; label: string }[] = [
  { value: 'notStarted', label: 'Not Started' },
  { value: 'inProgress', label: 'In Progress' },
  { value: 'complete', label: 'Complete' },
  { value: 'notApplicable', label: 'N/A' },
];

function DocItemRow({ item, onUpdate }: { item: DocumentItem; onUpdate: (updates: Partial<DocumentItem>) => void }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm flex-1 font-medium">{item.label}</span>
      <div className="flex items-center gap-2">
        <Input className="h-8 w-32 text-xs" value={item.completedBy} onChange={e => onUpdate({ completedBy: e.target.value })} placeholder="Completed by" />
        <Input type="date" className="h-8 w-36 text-xs" value={item.completedDate} onChange={e => onUpdate({ completedDate: e.target.value })} />
        <Select value={item.status} onValueChange={(v: DocumentStatus) => onUpdate({ status: v })}>
          <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {statusOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export function DrawingsSection() {
  const { data, updateNested, updateData, projectId } = useJob();

  const updateDrawing = (key: keyof typeof data.drawings, updates: Partial<DocumentItem>) => {
    updateData({
      drawings: { ...data.drawings, [key]: { ...data.drawings[key], ...updates } },
    });
  };

  const updateManual = (key: 'controlPanelManual' | 'datasheets', updates: Partial<DocumentItem>) => {
    updateData({
      userManuals: { ...data.userManuals, [key]: { ...data.userManuals[key], ...updates } },
    });
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="spec-section-title text-xl mb-1">Drawings & User Manuals</h2>
        <p className="text-sm text-muted-foreground">
          Track submission of system drawings, user manuals, and technical data sheets.
        </p>
      </div>

      {/* Drawing Library */}
      <div className="spec-card space-y-4">
        <h3 className="spec-section-title">Drawing Library</h3>
        <p className="text-xs text-muted-foreground">
          Upload and manage project drawings with revision tracking. Drawings are stored in the cloud and shared across all sections.
        </p>
        <DrawingLibrary projectId={projectId} />
      </div>

      <div className="spec-card space-y-4">
        <h3 className="spec-section-title">Section 9 — Drawing Status Tracker</h3>
        <div className="space-y-3">
          <DocItemRow item={data.drawings.forApproval} onUpdate={u => updateDrawing('forApproval', u)} />
          <DocItemRow item={data.drawings.asFitted} onUpdate={u => updateDrawing('asFitted', u)} />
          <DocItemRow item={data.drawings.zoneChart} onUpdate={u => updateDrawing('zoneChart', u)} />
        </div>
      </div>

      <div className="spec-card space-y-4">
        <h3 className="spec-section-title">Section 8 — User Manuals & Data Sheets</h3>
        <div className="space-y-3">
          <DocItemRow item={data.userManuals.controlPanelManual} onUpdate={u => updateManual('controlPanelManual', u)} />
          <DocItemRow item={data.userManuals.datasheets} onUpdate={u => updateManual('datasheets', u)} />
        </div>
      </div>

      <div className="spec-card space-y-4">
        <h3 className="spec-section-title">Section 6 — Warranty</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label className="text-xs">Warranty Start</Label>
            <Input type="date" className="h-8" value={data.warranty.startDate} onChange={e => updateNested('warranty', { startDate: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">Warranty End</Label>
            <Input type="date" className="h-8" value={data.warranty.endDate} onChange={e => updateNested('warranty', { endDate: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">Status</Label>
            <Select value={data.warranty.status} onValueChange={(v: DocumentStatus) => updateNested('warranty', { status: v })}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {statusOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label className="text-xs">Notes</Label>
          <Textarea rows={2} value={data.warranty.notes} onChange={e => updateNested('warranty', { notes: e.target.value })} />
        </div>
      </div>
    </div>
  );
}
