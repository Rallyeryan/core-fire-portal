import { useJob } from '@/context/JobContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Import, Check } from 'lucide-react';
import { toast } from 'sonner';
import { getSavedSpec, clearSavedSpec, mapSpecToJob } from '@/lib/specToJob';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';

type JobData = import('@/types/jobData').JobData;

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  onHold: 'bg-yellow-100 text-yellow-800',
  complete: 'bg-blue-100 text-blue-800',
  archived: 'bg-muted text-muted-foreground',
};

export function JobOverviewSection() {
  const { data, updateData } = useJob();
  const [showImport, setShowImport] = useState(false);

  const savedSpec = getSavedSpec();

  const handleImport = () => {
    if (!savedSpec) return;
    const mapped = mapSpecToJob(savedSpec);
    updateData(mapped);
    clearSavedSpec();
    setShowImport(false);
    toast.success('Specification imported successfully', {
      description: `${savedSpec.customerName} — ${savedSpec.siteName}`,
    });
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="spec-section-title text-xl mb-1">Job Overview</h2>
        <p className="text-sm text-muted-foreground">
          Project details and current status. Import from an accepted specification or enter manually.
        </p>
      </div>

      {/* Import Banner */}
      {savedSpec && (
        <div className="spec-card border-primary/30 bg-primary/5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="font-heading font-semibold text-sm flex items-center gap-2">
              <Import className="w-4 h-4 text-primary" />
              Specification Ready to Import
            </p>
            <p className="text-xs text-muted-foreground">
              {savedSpec.customerName} — {savedSpec.siteName} ({savedSpec.specReference})
            </p>
          </div>
          <Dialog open={showImport} onOpenChange={setShowImport}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Import className="w-4 h-4" /> Import
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Specification Data</DialogTitle>
                <DialogDescription>
                  This will pre-populate job details from the completed specification. The following data will be imported:
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-4">
                <ImportItem label="Customer" value={savedSpec.customerName} />
                <ImportItem label="Site" value={savedSpec.siteName} />
                <ImportItem label="Address" value={savedSpec.siteAddress} />
                <ImportItem label="Spec Reference" value={savedSpec.specReference} />
                <ImportItem label="Project Manager" value={savedSpec.producedBy} />
                <ImportItem label="Job Reference" value={savedSpec.quotation.reference || 'From quotation ref'} />
                <ImportItem label="Equipment Items" value={`${savedSpec.equipment.length} items`} />
                <ImportItem label="Certificates" value="Auto-configured from spec" />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowImport(false)}>Cancel</Button>
                <Button onClick={handleImport} className="gap-2">
                  <Check className="w-4 h-4" /> Confirm Import
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      <div className="spec-card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="spec-section-title">Project Details</h3>
          <Badge className={statusColors[data.status]}>{data.status}</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Job Reference</Label>
            <Input value={data.jobReference} onChange={e => updateData({ jobReference: e.target.value })} placeholder="e.g. CORE-9398" />
          </div>
          <div>
            <Label>Spec Reference</Label>
            <Input value={data.specReference} onChange={e => updateData({ specReference: e.target.value })} placeholder="Linked specification" />
          </div>
          <div>
            <Label>Customer Name</Label>
            <Input value={data.customerName} onChange={e => updateData({ customerName: e.target.value })} />
          </div>
          <div>
            <Label>Project Manager</Label>
            <Input value={data.projectManager} onChange={e => updateData({ projectManager: e.target.value })} />
          </div>
          <div>
            <Label>Site Name</Label>
            <Input value={data.siteName} onChange={e => updateData({ siteName: e.target.value })} />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={data.status} onValueChange={(v: JobData['status']) => updateData({ status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="onHold">On Hold</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label>Site Address</Label>
            <Textarea value={data.siteAddress} onChange={e => updateData({ siteAddress: e.target.value })} rows={2} />
          </div>
          <div>
            <Label>Contract Date</Label>
            <Input type="date" value={data.contractDate} onChange={e => updateData({ contractDate: e.target.value })} />
          </div>
          <div>
            <Label>Target Completion</Label>
            <Input type="date" value={data.targetCompletionDate} onChange={e => updateData({ targetCompletionDate: e.target.value })} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ImportItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium truncate max-w-[250px]">{value}</span>
    </div>
  );
}
