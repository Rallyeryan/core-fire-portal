import { useSpec } from '@/context/SpecContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ProjectDetailsStep() {
  const { data, updateData } = useSpec();

  const field = (label: string, key: keyof typeof data, placeholder?: string) => (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      <Input
        value={data[key] as string}
        onChange={e => updateData({ [key]: e.target.value })}
        placeholder={placeholder}
        className="bg-background"
      />
    </div>
  );

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="spec-section-title text-xl mb-1">Project Details</h2>
        <p className="text-sm text-muted-foreground">Enter the client and site information for this specification.</p>
      </div>

      <div className="spec-card space-y-4">
        <h3 className="spec-section-title">Client Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {field('Customer Name', 'customerName', 'Company or individual name')}
          {field('Specification Reference No.', 'specReference', 'e.g. SF_FDA_001-05')}
          {field('Site Name', 'siteName', 'Building or site name')}
          {field('Date', 'specDate')}
        </div>
        <div>
          {field('Site Address', 'siteAddress', 'Full site address')}
        </div>
      </div>

      <div className="spec-card space-y-4">
        <h3 className="spec-section-title">Produced By</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {field('Name', 'producedBy', 'Engineer name')}
          {field('Email', 'email', 'email@example.com')}
          {field('Mobile No.', 'mobileNo', '07xxx xxx xxx')}
          {field('Tel No.', 'telNo', '0141 xxx xxxx')}
        </div>
      </div>

      <div className="spec-card space-y-4">
        <h3 className="spec-section-title">Basis of Design</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {field('Enquiry Specification Ref.', 'enquirySpecRef')}
          {field('Tender Drawings Ref.', 'tenderDrawingsRef')}
          {field('Other Reference', 'otherRef')}
          {field('Site Survey Details', 'siteSurveyDetails', 'Date and attendees')}
        </div>
      </div>
    </div>
  );
}
