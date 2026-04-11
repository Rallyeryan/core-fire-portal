import { useSpec } from '@/context/SpecContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Shield, Wrench, CheckCircle, Package, Settings, Wifi } from 'lucide-react';

const MODULE_OPTIONS = [
  { key: 'design' as const, label: 'Design', desc: 'System design to BS5839-1:2025', icon: Shield },
  { key: 'supply' as const, label: 'Equipment Supply', desc: 'Procurement of all fire alarm equipment', icon: Package },
  { key: 'installation' as const, label: 'Installation', desc: 'Full system installation on site', icon: Wrench },
  { key: 'commissioning' as const, label: 'Commissioning & Handover', desc: 'Testing, commissioning and client handover', icon: CheckCircle },
  { key: 'maintenance' as const, label: 'Planned Preventive Maintenance', desc: 'Ongoing PPM in accordance with BS5839-1', icon: Settings },
  { key: 'monitoring' as const, label: 'Remote Monitoring', desc: 'ARC monitoring and remote access', icon: Wifi },
];

export function ModulesStep() {
  const { data, updateNested } = useSpec();

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="spec-section-title text-xl mb-1">Service Modules</h2>
        <p className="text-sm text-muted-foreground">Select which modules are included in this specification. Only selected items will appear in the final document.</p>
      </div>

      <div className="spec-card space-y-2">
        {MODULE_OPTIONS.map(({ key, label, desc, icon: Icon }) => (
          <label key={key} className="spec-checkbox-item cursor-pointer">
            <Checkbox
              checked={data.modules[key]}
              onCheckedChange={checked => updateNested('modules', { [key]: !!checked })}
              className="mt-0.5"
            />
            <div className="flex items-start gap-3 flex-1">
              <Icon className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <span className="text-sm font-medium">{label}</span>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
