import { useSpec } from '@/context/SpecContext';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export function DesignStandardStep() {
  const { data, updateData } = useSpec();

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="spec-section-title text-xl mb-1">Design & Standard</h2>
        <p className="text-sm text-muted-foreground">Specify the design authority and applicable British Standard.</p>
      </div>

      <div className="spec-card space-y-4">
        <h3 className="spec-section-title">Design Authority</h3>
        <RadioGroup value={data.designedBy} onValueChange={v => updateData({ designedBy: v as any })}>
          <label className="spec-checkbox-item cursor-pointer">
            <RadioGroupItem value="coreFire" />
            <div>
              <span className="text-sm font-medium">Designed by Core Fire</span>
              <p className="text-xs text-muted-foreground">System designed by Core Fire to comply with the standard and category detailed.</p>
            </div>
          </label>
          <label className="spec-checkbox-item cursor-pointer">
            <RadioGroupItem value="customer" />
            <div>
              <span className="text-sm font-medium">Designed by Customer / Other</span>
              <p className="text-xs text-muted-foreground">System designed by the customer to comply with the standard and category detailed.</p>
            </div>
          </label>
          <label className="spec-checkbox-item cursor-pointer">
            <RadioGroupItem value="noRiskAssessment" />
            <div>
              <span className="text-sm font-medium">No Risk Assessment Provided</span>
              <p className="text-xs text-muted-foreground">Fire detection system designed in the absence of risk assessment — should be reviewed by a fire safety professional.</p>
            </div>
          </label>
        </RadioGroup>
      </div>

      <div className="spec-card space-y-4">
        <h3 className="spec-section-title">Applicable Standard</h3>
        <RadioGroup value={data.standard} onValueChange={v => updateData({ standard: v as any })}>
          <label className="spec-checkbox-item cursor-pointer">
            <RadioGroupItem value="bs5839_2025" />
            <div>
              <span className="text-sm font-medium">BS 5839-1: 2025</span>
              <p className="text-xs text-muted-foreground">Current standard — Fire detection and fire alarm systems for buildings.</p>
            </div>
          </label>
          <label className="spec-checkbox-item cursor-pointer">
            <RadioGroupItem value="bs5839_2017" />
            <div>
              <span className="text-sm font-medium">BS 5839-1: 2017</span>
              <p className="text-xs text-muted-foreground">Previous standard — for previously quoted or existing projects.</p>
            </div>
          </label>
        </RadioGroup>
      </div>

      <div className="spec-card space-y-4">
        <h3 className="spec-section-title">Property Type</h3>
        <RadioGroup value={data.propertyType} onValueChange={v => updateData({ propertyType: v as any })}>
          <label className="spec-checkbox-item cursor-pointer">
            <RadioGroupItem value="nonDomestic" />
            <span className="text-sm font-medium">Non-Domestic Premises</span>
          </label>
          <label className="spec-checkbox-item cursor-pointer">
            <RadioGroupItem value="domestic" />
            <span className="text-sm font-medium">Domestic Premises (BS 5839-6)</span>
          </label>
        </RadioGroup>
      </div>
    </div>
  );
}
