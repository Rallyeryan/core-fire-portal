import { useSpec } from '@/context/SpecContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export function InterfacesStep() {
  const { data, updateNested, updateData } = useSpec();

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="spec-section-title text-xl mb-1">Interfaces & Door Release</h2>
        <p className="text-sm text-muted-foreground">Configure door release mechanisms (BS 7273-4) and ancillary system interfaces (BS 7273-6).</p>
      </div>

      {/* Door Release */}
      <div className="spec-card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="spec-section-title">Door Release Mechanisms (BS 7273-4)</h3>
          <Switch
            checked={data.doorRelease.enabled}
            onCheckedChange={checked => updateNested('doorRelease', { enabled: checked })}
          />
        </div>

        {data.doorRelease.enabled && (
          <div className="space-y-3 pt-2">
            {[
              { key: 'categoryA' as const, label: 'Category A — Critical actuation', locKey: 'categoryALocations' as const },
              { key: 'categoryB' as const, label: 'Category B — Standard actuation', locKey: 'categoryBLocations' as const },
              { key: 'categoryC' as const, label: 'Category C — Indirect actuation', locKey: 'categoryCLocations' as const },
            ].map(item => (
              <div key={item.key} className="space-y-2">
                <label className="spec-checkbox-item cursor-pointer">
                  <Checkbox
                    checked={data.doorRelease[item.key]}
                    onCheckedChange={checked => updateNested('doorRelease', { [item.key]: !!checked })}
                  />
                  <span className="text-sm font-medium">{item.label}</span>
                </label>
                {data.doorRelease[item.key] && (
                  <Input
                    className="ml-8 bg-background"
                    placeholder="Locations — e.g. Refer to FD&FA design drawings"
                    value={data.doorRelease[item.locKey]}
                    onChange={e => updateNested('doorRelease', { [item.locKey]: e.target.value })}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ancillary Interfaces */}
      <div className="spec-card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="spec-section-title">Ancillary System Interfaces (BS 7273-6)</h3>
          <Switch
            checked={data.ancillaryInterfaces.enabled}
            onCheckedChange={checked => updateNested('ancillaryInterfaces', { enabled: checked })}
          />
        </div>

        {data.ancillaryInterfaces.enabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1 pt-2">
            {[
              { key: 'smokeControl' as const, label: 'Smoke control systems' },
              { key: 'lifts' as const, label: 'Lifts and other lifting appliances' },
              { key: 'gasValves' as const, label: 'Gas valves' },
              { key: 'fireShutters' as const, label: 'Fire-resisting shutters and active fire curtains' },
              { key: 'electricalSupplies' as const, label: 'Electrical supplies' },
              { key: 'ventilation' as const, label: 'Ventilation systems' },
              { key: 'lighting' as const, label: 'Lighting' },
              { key: 'signage' as const, label: 'Intelligent signage and wayfinding' },
              { key: 'paging' as const, label: 'Paging systems' },
            ].map(item => (
              <label key={item.key} className="spec-checkbox-item cursor-pointer">
                <Checkbox
                  checked={data.ancillaryInterfaces[item.key]}
                  onCheckedChange={checked => updateNested('ancillaryInterfaces', { [item.key]: !!checked })}
                />
                <span className="text-sm">{item.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Interface Schedule */}
      <div className="spec-card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="spec-section-title">Interface Schedule</h3>
          <button
            className="text-xs font-medium text-primary hover:underline"
            onClick={() => updateData({
              interfaces: [...data.interfaces, { id: crypto.randomUUID(), qty: 1, use: '' }]
            })}
          >
            + Add Interface
          </button>
        </div>

        {data.interfaces.length === 0 && (
          <p className="text-sm text-muted-foreground italic">No interfaces added. Click "Add Interface" to begin.</p>
        )}

        {data.interfaces.map((iface, i) => (
          <div key={iface.id} className="flex items-center gap-3">
            <Input
              type="number"
              className="w-20 bg-background"
              value={iface.qty}
              min={1}
              onChange={e => {
                const updated = [...data.interfaces];
                updated[i] = { ...iface, qty: parseInt(e.target.value) || 1 };
                updateData({ interfaces: updated });
              }}
            />
            <Input
              className="flex-1 bg-background"
              placeholder="e.g. Output interface – to operate door holder transformer rectifier units"
              value={iface.use}
              onChange={e => {
                const updated = [...data.interfaces];
                updated[i] = { ...iface, use: e.target.value };
                updateData({ interfaces: updated });
              }}
            />
            <button
              className="text-xs text-destructive hover:underline shrink-0"
              onClick={() => updateData({ interfaces: data.interfaces.filter(x => x.id !== iface.id) })}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
