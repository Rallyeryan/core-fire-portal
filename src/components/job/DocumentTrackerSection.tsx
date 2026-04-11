import { useJob } from '@/context/JobContext';
import { type DocumentStatus, CERTIFICATE_SHORT_LABELS } from '@/types/jobData';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Clock, MinusCircle } from 'lucide-react';

const statusConfig: Record<DocumentStatus, { label: string; icon: React.ElementType; className: string }> = {
  notStarted: { label: 'Not Started', icon: Circle, className: 'bg-muted text-muted-foreground' },
  inProgress: { label: 'In Progress', icon: Clock, className: 'bg-yellow-100 text-yellow-800' },
  complete: { label: 'Complete', icon: CheckCircle2, className: 'bg-green-100 text-green-800' },
  notApplicable: { label: 'N/A', icon: MinusCircle, className: 'bg-muted/50 text-muted-foreground' },
};

interface TrackerRow {
  section: string;
  label: string;
  status: DocumentStatus;
}

export function DocumentTrackerSection() {
  const { data } = useJob();

  const rows: TrackerRow[] = [
    { section: 'Section 2', label: 'Project Overview', status: data.projectOverview.status },
    { section: 'Section 3', label: 'System Overview & Equipment Schedule', status: data.systemOverview.status },
    ...data.certificates.map(c => ({
      section: 'Section 4',
      label: CERTIFICATE_SHORT_LABELS[c.type] || c.type,
      status: c.status,
    })),
    { section: 'Section 5', label: 'Maintenance Procedures', status: data.maintenanceProcedures.status },
    { section: 'Section 6', label: 'Warranty Information', status: data.warranty.status },
    { section: 'Section 7', label: 'Health & Safety Information', status: data.healthSafety.status },
    { section: 'Section 8', label: 'Control Panel User Manual', status: data.userManuals.controlPanelManual.status },
    { section: 'Section 8', label: 'Equipment Data Sheets', status: data.userManuals.datasheets.status },
    { section: 'Section 9', label: 'For Approval Drawings', status: data.drawings.forApproval.status },
    { section: 'Section 9', label: 'As Fitted Drawings', status: data.drawings.asFitted.status },
    { section: 'Section 9', label: 'Zone Chart / Diagram', status: data.drawings.zoneChart.status },
    { section: 'Log Book', label: 'Fire Safety Log Book', status: data.logBook.status },
  ];

  const completedCount = rows.filter(r => r.status === 'complete').length;
  const totalCount = rows.filter(r => r.status !== 'notApplicable').length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="spec-section-title text-xl mb-1">Document Tracker</h2>
        <p className="text-sm text-muted-foreground">
          Track completion status of all required operating manual documentation per QP_102.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="spec-card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold">Overall Progress</span>
          <span className="text-sm font-bold text-primary">{progressPercent}%</span>
        </div>
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {completedCount} of {totalCount} documents complete
        </p>
      </div>

      {/* Document Table */}
      <div className="spec-card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider">Section</th>
              <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider">Document</th>
              <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const config = statusConfig[row.status];
              const Icon = config.icon;
              return (
                <tr key={i} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-4 text-muted-foreground text-xs">{row.section}</td>
                  <td className="py-3 px-4">{row.label}</td>
                  <td className="py-3 px-4">
                    <Badge variant="secondary" className={`gap-1 ${config.className}`}>
                      <Icon className="w-3 h-3" />
                      {config.label}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
