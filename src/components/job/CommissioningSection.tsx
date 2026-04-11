import { useJob } from '@/context/JobContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

export function CommissioningSection() {
  const { data, updateNested, updateData } = useJob();
  const cl = data.commissioningChecklist;

  const updatePower = (updates: Partial<typeof cl.powerSupply>) => {
    updateData({
      commissioningChecklist: {
        ...cl,
        powerSupply: { ...cl.powerSupply, ...updates },
      },
    });
  };

  const updateCable = (updates: Partial<typeof cl.cableTests>) => {
    updateData({
      commissioningChecklist: {
        ...cl,
        cableTests: { ...cl.cableTests, ...updates },
      },
    });
  };

  const updateSystem = (updates: Partial<typeof cl.systemChecks>) => {
    updateData({
      commissioningChecklist: {
        ...cl,
        systemChecks: { ...cl.systemChecks, ...updates },
      },
    });
  };

  const addCircuit = () => {
    updateCable({
      circuits: [...cl.cableTests.circuits, { id: crypto.randomUUID(), description: '', cableType: '', cableSize: '', irResult: '', polarityOk: false }],
    });
  };

  const removeCircuit = (id: string) => {
    updateCable({ circuits: cl.cableTests.circuits.filter(c => c.id !== id) });
  };

  const updateCircuit = (id: string, updates: Partial<typeof cl.cableTests.circuits[0]>) => {
    updateCable({
      circuits: cl.cableTests.circuits.map(c => c.id === id ? { ...c, ...updates } : c),
    });
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="spec-section-title text-xl mb-1">Commissioning Checks</h2>
        <p className="text-sm text-muted-foreground">
          BS 5839-1 Clause 39 commissioning report checklist. Record all power supply, cable test, and system check results.
        </p>
      </div>

      {/* Power Supply */}
      <div className="spec-card space-y-4">
        <h3 className="spec-section-title">Power Supply Checks</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <Label className="text-xs">CIE Charge Voltage</Label>
            <Input className="h-8" value={cl.powerSupply.cieChargeVoltage} onChange={e => updatePower({ cieChargeVoltage: e.target.value })} placeholder="V" />
          </div>
          <div>
            <Label className="text-xs">CIE PSU Output</Label>
            <Input className="h-8" value={cl.powerSupply.ciePsuOutput} onChange={e => updatePower({ ciePsuOutput: e.target.value })} placeholder="V" />
          </div>
          <div>
            <Label className="text-xs">Battery 1 (Vdc)</Label>
            <Input className="h-8" value={cl.powerSupply.battery1Vdc} onChange={e => updatePower({ battery1Vdc: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">Battery 2 (Vdc)</Label>
            <Input className="h-8" value={cl.powerSupply.battery2Vdc} onChange={e => updatePower({ battery2Vdc: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">Standby Required (AHr)</Label>
            <Input className="h-8" value={cl.powerSupply.standbyRequired} onChange={e => updatePower({ standbyRequired: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">Standby Fitted (AHr)</Label>
            <Input className="h-8" value={cl.powerSupply.standbyFitted} onChange={e => updatePower({ standbyFitted: e.target.value })} />
          </div>
        </div>
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <Checkbox checked={cl.powerSupply.batteriesLabelled} onCheckedChange={v => updatePower({ batteriesLabelled: !!v })} />
            <Label className="text-xs">Batteries Labelled</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={cl.powerSupply.standbyConfirmed} onCheckedChange={v => updatePower({ standbyConfirmed: !!v })} />
            <Label className="text-xs">Standby Confirmed Sufficient</Label>
          </div>
        </div>
      </div>

      {/* Cable Tests */}
      <div className="spec-card space-y-4">
        <h3 className="spec-section-title">Cable Tests</h3>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <Checkbox checked={cl.cableTests.irTested} onCheckedChange={v => updateCable({ irTested: !!v })} />
            <Label className="text-xs">IR Tested</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={cl.cableTests.cctrTested} onCheckedChange={v => updateCable({ cctrTested: !!v })} />
            <Label className="text-xs">CCTR Tested</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={cl.cableTests.zsTested} onCheckedChange={v => updateCable({ zsTested: !!v })} />
            <Label className="text-xs">Zs Tested</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={cl.cableTests.separateSheetAttached} onCheckedChange={v => updateCable({ separateSheetAttached: !!v })} />
            <Label className="text-xs">Separate Test Sheet Attached</Label>
          </div>
        </div>

        <Separator />
        <h4 className="text-sm font-semibold">Circuit Test Results</h4>
        {cl.cableTests.circuits.map(circuit => (
          <div key={circuit.id} className="grid grid-cols-[1fr_100px_100px_100px_80px_32px] gap-2 items-center">
            <Input className="h-8 text-sm" value={circuit.description} placeholder="Circuit description" onChange={e => updateCircuit(circuit.id, { description: e.target.value })} />
            <Input className="h-8 text-sm" value={circuit.cableType} placeholder="S / E" onChange={e => updateCircuit(circuit.id, { cableType: e.target.value })} />
            <Input className="h-8 text-sm" value={circuit.cableSize} placeholder="mm²" onChange={e => updateCircuit(circuit.id, { cableSize: e.target.value })} />
            <Input className="h-8 text-sm" value={circuit.irResult} placeholder="MΩ" onChange={e => updateCircuit(circuit.id, { irResult: e.target.value })} />
            <div className="flex items-center gap-1">
              <Checkbox checked={circuit.polarityOk} onCheckedChange={v => updateCircuit(circuit.id, { polarityOk: !!v })} />
              <span className="text-xs">Pol ✓</span>
            </div>
            <button onClick={() => removeCircuit(circuit.id)} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addCircuit} className="gap-1">
          <Plus className="w-3 h-3" /> Add Circuit
        </Button>
      </div>

      {/* System Checks */}
      <div className="spec-card space-y-4">
        <h3 className="spec-section-title">System Checks</h3>
        <div className="space-y-3">
          {[
            { key: 'allDevicesTested' as const, label: 'All equipment operates correctly' },
            { key: 'soundersVerified' as const, label: 'All sounders/beacons verified' },
            { key: 'zoneChartProvided' as const, label: 'Zone chart/plan provided adjacent to CIE' },
            { key: 'causeEffectTested' as const, label: 'Cause & effect tested (where applicable)' },
            { key: 'falseAlarmRiskAssessed' as const, label: 'No obvious potential for unacceptable false alarms' },
          ].map(check => (
            <div key={check.key} className="flex items-center gap-2">
              <Checkbox
                checked={cl.systemChecks[check.key]}
                onCheckedChange={v => updateSystem({ [check.key]: !!v })}
              />
              <Label className="text-xs">{check.label}</Label>
            </div>
          ))}
        </div>
        <div>
          <Label className="text-xs">Soak Test Period (weeks)</Label>
          <Input className="h-8 w-24" value={cl.systemChecks.soakTestWeeks} onChange={e => updateSystem({ soakTestWeeks: e.target.value })} placeholder="e.g. 2" />
        </div>
        <div>
          <Label className="text-xs">Additional Notes</Label>
          <Textarea rows={3} value={cl.systemChecks.notes} onChange={e => updateSystem({ notes: e.target.value })} />
        </div>
      </div>
    </div>
  );
}
