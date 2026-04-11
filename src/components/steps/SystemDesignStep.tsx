import { useSpec } from '@/context/SpecContext';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

export function SystemDesignStep() {
  const { data, updateData, updateNested } = useSpec();

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="spec-section-title text-xl mb-1">System Design Particulars</h2>
        <p className="text-sm text-muted-foreground">Configure power supply, cabling, evacuation strategy, communications and visual devices.</p>
      </div>

      {/* Power Supply */}
      <div className="spec-card space-y-4">
        <h3 className="spec-section-title">Power Supply — Standby Duration</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Standby operational hours</p>
            <RadioGroup value={data.standbyHours} onValueChange={v => updateData({ standbyHours: v as any })} className="flex gap-4">
              {['24', '48', '72'].map(h => (
                <label key={h} className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value={h} />
                  <span className="text-sm font-medium">{h} hours</span>
                </label>
              ))}
            </RadioGroup>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Alarm sounding duration</p>
            <RadioGroup value={data.alarmMinutes} onValueChange={v => updateData({ alarmMinutes: v as any })} className="flex gap-4">
              {['15', '30', '60'].map(m => (
                <label key={m} className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value={m} />
                  <span className="text-sm font-medium">{m} mins</span>
                </label>
              ))}
            </RadioGroup>
          </div>
        </div>
      </div>

      {/* Cabling */}
      <div className="spec-card space-y-3">
        <h3 className="spec-section-title">Cabling</h3>
        {[
          { key: 'softSkinStandard' as const, label: "Soft skin fire-resistant — 'standard' requirements" },
          { key: 'softSkinEnhanced' as const, label: "Soft skin fire-resistant — 'enhanced' requirements" },
          { key: 'mineralInsulated' as const, label: "Mineral insulated fire-resistant — 'enhanced' requirements" },
          { key: 'swa' as const, label: "SWA fire-resistant — 'enhanced' requirements" },
          { key: 'other' as const, label: 'Other (specify)' },
        ].map(item => (
          <div key={item.key}>
            <label className="spec-checkbox-item cursor-pointer">
              <Checkbox
                checked={data.cabling[item.key]}
                onCheckedChange={checked => updateNested('cabling', { [item.key]: !!checked })}
              />
              <span className="text-sm">{item.label}</span>
            </label>
            {item.key === 'other' && data.cabling.other && (
              <Input
                className="ml-8 mt-1 bg-background"
                placeholder="Specify cable type..."
                value={data.cabling.otherDetail}
                onChange={e => updateNested('cabling', { otherDetail: e.target.value })}
              />
            )}
          </div>
        ))}
      </div>

      {/* Evacuation */}
      <div className="spec-card space-y-3">
        <h3 className="spec-section-title">Evacuation / Cause & Effect</h3>
        <RadioGroup value={data.evacuation.type} onValueChange={v => updateNested('evacuation', { type: v as any })}>
          <label className="spec-checkbox-item cursor-pointer">
            <RadioGroupItem value="simultaneous" />
            <span className="text-sm">Simultaneous evacuation</span>
          </label>
          <label className="spec-checkbox-item cursor-pointer">
            <RadioGroupItem value="causeEffect" />
            <span className="text-sm">Programmed per customer's cause & effect matrix</span>
          </label>
          <label className="spec-checkbox-item cursor-pointer">
            <RadioGroupItem value="other" />
            <span className="text-sm">Other (specify)</span>
          </label>
        </RadioGroup>
        {data.evacuation.type === 'other' && (
          <Input className="ml-8 bg-background" placeholder="Specify..." value={data.evacuation.otherDetail} onChange={e => updateNested('evacuation', { otherDetail: e.target.value })} />
        )}
      </div>

      {/* Visual Devices */}
      <div className="spec-card space-y-3">
        <h3 className="spec-section-title">Visual Alarm Devices</h3>
        {[
          { key: 'vad' as const, label: 'VAD — Visual Alarm Devices (Primary, BS EN 54-23)', locKey: 'vadLocations' as const },
          { key: 'vid' as const, label: 'VID — Visual Indicating Devices (Supplementary)', locKey: 'vidLocations' as const },
          { key: 'none' as const, label: 'None', locKey: null },
        ].map(item => (
          <div key={item.key}>
            <label className="spec-checkbox-item cursor-pointer">
              <Checkbox
                checked={data.visualDevices[item.key]}
                onCheckedChange={checked => updateNested('visualDevices', { [item.key]: !!checked })}
              />
              <span className="text-sm">{item.label}</span>
            </label>
            {item.locKey && data.visualDevices[item.key] && (
              <Textarea className="ml-8 mt-1 bg-background" rows={2} placeholder="Specify areas / locations..." value={data.visualDevices[item.locKey]} onChange={e => updateNested('visualDevices', { [item.locKey]: e.target.value })} />
            )}
          </div>
        ))}
      </div>

      {/* Communications */}
      <div className="spec-card space-y-4">
        <h3 className="spec-section-title">Communications & Signalling</h3>
        <RadioGroup value={data.communications.type} onValueChange={v => updateNested('communications', { type: v as any })}>
          <label className="spec-checkbox-item cursor-pointer">
            <RadioGroupItem value="audibleOnly" />
            <div>
              <span className="text-sm font-medium">Audible Only</span>
              <p className="text-xs text-muted-foreground">No automatic communication — manual 999/112 required.</p>
            </div>
          </label>
          <label className="spec-checkbox-item cursor-pointer">
            <RadioGroupItem value="auto" />
            <div>
              <span className="text-sm font-medium">Automatic Communications</span>
              <p className="text-xs text-muted-foreground">System communicates automatically with fire & rescue via ARC.</p>
            </div>
          </label>
        </RadioGroup>

        {data.communications.type === 'auto' && (
          <div className="ml-8 space-y-3 pt-2">
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div />
              <div className="font-medium text-center">GPRS</div>
              <div className="font-medium text-center">IP</div>
              {['single', 'dualPrimary', 'dualSecondary'].map(path => (
                <>
                  <div key={path} className="text-sm capitalize">{path === 'single' ? 'Single path' : path === 'dualPrimary' ? 'Dual path (primary)' : 'Dual path (secondary)'}</div>
                  <div className="flex justify-center">
                    <Checkbox checked={(data.communications.gprs as any)[path]} onCheckedChange={checked => updateNested('communications', { gprs: { ...data.communications.gprs, [path]: !!checked } } as any)} />
                  </div>
                  <div className="flex justify-center">
                    <Checkbox checked={(data.communications.ip as any)[path]} onCheckedChange={checked => updateNested('communications', { ip: { ...data.communications.ip, [path]: !!checked } } as any)} />
                  </div>
                </>
              ))}
            </div>
            <Input className="bg-background" placeholder="Transmitter location — e.g. Adjacent fire alarm panel" value={data.communications.transmitterLocation} onChange={e => updateNested('communications', { transmitterLocation: e.target.value })} />
          </div>
        )}
      </div>
    </div>
  );
}
