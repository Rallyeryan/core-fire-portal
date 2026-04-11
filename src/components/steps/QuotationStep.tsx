import { useSpec } from '@/context/SpecContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, PoundSterling } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value);
}

export function QuotationStep() {
  const { data, updateData, updateNested } = useSpec();

  // Calculations
  const equipmentSubtotal = data.equipment.reduce((sum, e) => sum + e.qty * e.unitPrice, 0);
  const installationSubtotal = data.quotation.installationLabour;
  const commissioningSubtotal = data.quotation.commissioningItems.reduce(
    (sum, c) => sum + c.qty * c.unitPrice, 0
  );
  const grossSubtotal = equipmentSubtotal + installationSubtotal + commissioningSubtotal;
  const discountAmount = data.quotation.discountType === 'percentage'
    ? grossSubtotal * (data.quotation.discount / 100)
    : data.quotation.discount;
  const netSubtotal = grossSubtotal - discountAmount;
  const vatAmount = netSubtotal * (data.quotation.vatRate / 100);
  const grandTotal = netSubtotal + vatAmount;

  // Maintenance calculations
  const maintenanceInspectionTotal = data.maintenance.inspectionPerVisit * data.maintenance.visitsPerYear;
  const maintenanceAdditionalTotal = data.maintenance.additionalItems.reduce(
    (sum, i) => sum + i.qty * i.unitPrice, 0
  );
  const maintenanceSubtotal = maintenanceInspectionTotal + maintenanceAdditionalTotal;

  const updateEquipmentPrice = (id: string, unitPrice: number) => {
    updateData({
      equipment: data.equipment.map(e => e.id === id ? { ...e, unitPrice } : e),
    });
  };

  const updateCommissioningItem = (id: string, updates: Partial<{ description: string; qty: number; unitPrice: number }>) => {
    updateNested('quotation', {
      commissioningItems: data.quotation.commissioningItems.map(c =>
        c.id === id ? { ...c, ...updates } : c
      ),
    });
  };

  const addCommissioningItem = () => {
    updateNested('quotation', {
      commissioningItems: [
        ...data.quotation.commissioningItems,
        { id: crypto.randomUUID(), description: '', qty: 1, unitPrice: 0 },
      ],
    });
  };

  const removeCommissioningItem = (id: string) => {
    updateNested('quotation', {
      commissioningItems: data.quotation.commissioningItems.filter(c => c.id !== id),
    });
  };

  const addMaintenanceItem = () => {
    updateNested('maintenance', {
      additionalItems: [
        ...data.maintenance.additionalItems,
        { id: crypto.randomUUID(), description: '', qty: 1, unitPrice: 0 },
      ],
    });
  };

  const removeMaintenanceItem = (id: string) => {
    updateNested('maintenance', {
      additionalItems: data.maintenance.additionalItems.filter(i => i.id !== id),
    });
  };

  const updateMaintenanceItem = (id: string, updates: Partial<{ description: string; qty: number; unitPrice: number }>) => {
    updateNested('maintenance', {
      additionalItems: data.maintenance.additionalItems.map(i =>
        i.id === id ? { ...i, ...updates } : i
      ),
    });
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="spec-section-title text-xl mb-1">Quotation & Pricing</h2>
        <p className="text-sm text-muted-foreground">
          Set unit prices for equipment, installation labour, commissioning charges, and optional maintenance contract pricing.
        </p>
      </div>

      {/* Quotation Reference */}
      <div className="spec-card space-y-4">
        <h3 className="spec-section-title">Quotation Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Quotation Reference</Label>
            <Input
              value={data.quotation.reference}
              onChange={e => updateNested('quotation', { reference: e.target.value })}
              placeholder="e.g. CORE-9398"
            />
          </div>
          <div>
            <Label>Revision</Label>
            <Input
              value={data.quotation.revisionLetter}
              onChange={e => updateNested('quotation', { revisionLetter: e.target.value })}
              placeholder="A"
              className="w-20"
            />
          </div>
          <div>
            <Label>VAT Rate (%)</Label>
            <Input
              type="number"
              value={data.quotation.vatRate || ''}
              onChange={e => updateNested('quotation', { vatRate: parseFloat(e.target.value) || 0 })}
              className="w-24"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Payment Terms</Label>
            <Input
              value={data.quotation.paymentTerms}
              onChange={e => updateNested('quotation', { paymentTerms: e.target.value })}
            />
          </div>
          <div>
            <Label>Quotation Validity (days)</Label>
            <Input
              type="number"
              value={data.quotation.validityDays || ''}
              onChange={e => updateNested('quotation', { validityDays: parseInt(e.target.value) || 0 })}
              className="w-24"
            />
          </div>
        </div>
      </div>

      {/* Equipment Pricing */}
      <div className="spec-card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="spec-section-title">Equipment Supply</h3>
          <span className="text-sm font-semibold text-primary">{formatCurrency(equipmentSubtotal)}</span>
        </div>
        {data.equipment.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No equipment added yet. Add items in the Equipment Schedule step first.
          </p>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_80px_100px_100px] gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
              <span>Description</span>
              <span className="text-center">Qty</span>
              <span className="text-right">Unit Price</span>
              <span className="text-right">Total</span>
            </div>
            {data.equipment.filter(e => e.qty > 0).map(item => (
              <div key={item.id} className="grid grid-cols-[1fr_80px_100px_100px] gap-2 items-center">
                <span className="text-sm truncate" title={item.description}>{item.description}</span>
                <span className="text-sm text-center">{item.qty}</span>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  className="h-8 text-right text-sm"
                  value={item.unitPrice || ''}
                  placeholder="0.00"
                  onChange={e => updateEquipmentPrice(item.id, parseFloat(e.target.value) || 0)}
                />
                <span className="text-sm text-right font-medium">
                  {formatCurrency(item.qty * item.unitPrice)}
                </span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-end gap-4 text-sm font-semibold">
              <span>Sub-Total ex VAT:</span>
              <span>{formatCurrency(equipmentSubtotal)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Installation Labour */}
      <div className="spec-card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="spec-section-title">BAFE Approved Installation</h3>
          <span className="text-sm font-semibold text-primary">{formatCurrency(installationSubtotal)}</span>
        </div>
        <div>
          <Label>Installation Title</Label>
          <Input
            value={data.quotation.installationDescription}
            onChange={e => updateNested('quotation', { installationDescription: e.target.value })}
            placeholder="BAFE Approved Electrical & Mechanical Installation RevA"
          />
        </div>
        <div>
          <Label>Installation Scope Description</Label>
          <Textarea
            rows={4}
            value={data.quotation.installationScopeDetail || ''}
            onChange={e => updateNested('quotation', { installationScopeDetail: e.target.value })}
            placeholder="The installation includes attendance, preliminaries, and project management..."
          />
        </div>
        <Separator />
        <h4 className="text-sm font-semibold">Containment Installation</h4>
        <Textarea
          rows={3}
          value={data.quotation.containmentDetail || ''}
          onChange={e => updateNested('quotation', { containmentDetail: e.target.value })}
          placeholder="Appropriate containment (catenary wire, steel and PVC conduit, and cable trays)..."
        />
        <h4 className="text-sm font-semibold">Fire-Rated Cabling & Mechanical Protection</h4>
        <Textarea
          rows={5}
          value={data.quotation.cablingDetail || ''}
          onChange={e => updateNested('quotation', { cablingDetail: e.target.value })}
          placeholder="Standard fire-rated cables below 2.1m must be mechanically protected..."
        />
        <Separator />
        <div>
          <Label>Installation Labour (£ ex VAT)</Label>
          <Input
            type="number"
            step="0.01"
            min={0}
            className="w-48"
            value={data.quotation.installationLabour || ''}
            placeholder="0.00"
            onChange={e => updateNested('quotation', { installationLabour: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      {/* Commissioning & Handover */}
      <div className="spec-card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="spec-section-title">Commissioning & Handover</h3>
          <span className="text-sm font-semibold text-primary">{formatCurrency(commissioningSubtotal)}</span>
        </div>
        <div className="space-y-2">
          <div className="grid grid-cols-[1fr_80px_120px_100px_32px] gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
            <span>Description</span>
            <span className="text-center">Qty</span>
            <span className="text-right">Unit Price</span>
            <span className="text-right">Total</span>
            <span />
          </div>
          {data.quotation.commissioningItems.map(item => (
            <div key={item.id} className="grid grid-cols-[1fr_80px_120px_100px_32px] gap-2 items-center">
              <Input
                className="h-8 text-sm"
                value={item.description}
                onChange={e => updateCommissioningItem(item.id, { description: e.target.value })}
              />
              <Input
                type="number"
                min={0}
                className="h-8 text-center text-sm"
                value={item.qty || ''}
                onChange={e => updateCommissioningItem(item.id, { qty: parseInt(e.target.value) || 0 })}
              />
              <Input
                type="number"
                step="0.01"
                min={0}
                className="h-8 text-right text-sm"
                value={item.unitPrice || ''}
                placeholder="0.00"
                onChange={e => updateCommissioningItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
              />
              <span className="text-sm text-right font-medium">
                {formatCurrency(item.qty * item.unitPrice)}
              </span>
              <button onClick={() => removeCommissioningItem(item.id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={addCommissioningItem} className="gap-1">
          <Plus className="w-3 h-3" /> Add Item
        </Button>
      </div>

      {/* Totals Summary */}
      <div className="spec-card space-y-3 bg-muted/30">
        <h3 className="spec-section-title">Quotation Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Equipment Supply</span>
            <span>{formatCurrency(equipmentSubtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Installation</span>
            <span>{formatCurrency(installationSubtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Commissioning & Handover</span>
            <span>{formatCurrency(commissioningSubtotal)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Gross Sub-Total</span>
            <span>{formatCurrency(grossSubtotal)}</span>
          </div>

          {/* Discount */}
          <div className="flex items-center gap-3">
            <Label className="whitespace-nowrap text-xs">Discount</Label>
            <Select
              value={data.quotation.discountType}
              onValueChange={(v: 'fixed' | 'percentage') => updateNested('quotation', { discountType: v })}
            >
              <SelectTrigger className="w-28 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">£ Fixed</SelectItem>
                <SelectItem value="percentage">% Rate</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              step="0.01"
              min={0}
              className="w-28 h-8 text-right"
              value={data.quotation.discount || ''}
              placeholder="0"
              onChange={e => updateNested('quotation', { discount: parseFloat(e.target.value) || 0 })}
            />
            {discountAmount > 0 && (
              <span className="text-sm text-destructive">-{formatCurrency(discountAmount)}</span>
            )}
          </div>

          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Sub-Total ex VAT</span>
            <span>{formatCurrency(netSubtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>VAT ({data.quotation.vatRate}%)</span>
            <span>{formatCurrency(vatAmount)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total inc VAT</span>
            <span className="text-primary">{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Optional Maintenance */}
      <div className="spec-card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="spec-section-title">Optional Maintenance Contract</h3>
          <Switch
            checked={data.maintenance.enabled}
            onCheckedChange={v => updateNested('maintenance', { enabled: v })}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Inspection & Maintenance of Fire Detection & Alarm System in accordance with BS 5839-1:2025
        </p>

        {data.maintenance.enabled && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Inspection Per Visit (£)</Label>
                <Input
                  type="number" step="0.01" min={0}
                  value={data.maintenance.inspectionPerVisit || ''}
                  placeholder="595.00"
                  onChange={e => updateNested('maintenance', { inspectionPerVisit: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Visits Per Year</Label>
                <Input
                  type="number" min={1}
                  value={data.maintenance.visitsPerYear || ''}
                  onChange={e => updateNested('maintenance', { visitsPerYear: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Contract Term (years)</Label>
                <Input
                  type="number" min={1}
                  value={data.maintenance.contractTermYears || ''}
                  onChange={e => updateNested('maintenance', { contractTermYears: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <Separator />
            <h4 className="text-sm font-semibold">Reactive & Support Rates</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>24/7 Callout Charge (£)</Label>
                <Input
                  type="number" step="0.01" min={0}
                  value={data.maintenance.calloutCharge || ''}
                  placeholder="150.00"
                  onChange={e => updateNested('maintenance', { calloutCharge: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Normal Hours Hourly Rate (£)</Label>
                <Input
                  type="number" step="0.01" min={0}
                  value={data.maintenance.normalHourlyRate || ''}
                  placeholder="65.00"
                  onChange={e => updateNested('maintenance', { normalHourlyRate: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Outside Hours Hourly Rate (£)</Label>
                <Input
                  type="number" step="0.01" min={0}
                  value={data.maintenance.outsideHoursRate || ''}
                  placeholder="95.00"
                  onChange={e => updateNested('maintenance', { outsideHoursRate: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Remote Support Rate (£ per {data.maintenance.remoteSupportIncrement})</Label>
                <Input
                  type="number" step="0.01" min={0}
                  value={data.maintenance.remoteSupportRate || ''}
                  placeholder="16.25"
                  onChange={e => updateNested('maintenance', { remoteSupportRate: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            {/* Additional maintenance items */}
            <Separator />
            <h4 className="text-sm font-semibold">Additional Maintenance Items</h4>
            {data.maintenance.additionalItems.map(item => (
              <div key={item.id} className="grid grid-cols-[1fr_80px_120px_32px] gap-2 items-center">
                <Input
                  className="h-8 text-sm"
                  value={item.description}
                  placeholder="Description"
                  onChange={e => updateMaintenanceItem(item.id, { description: e.target.value })}
                />
                <Input
                  type="number" min={0}
                  className="h-8 text-center text-sm"
                  value={item.qty || ''}
                  onChange={e => updateMaintenanceItem(item.id, { qty: parseInt(e.target.value) || 0 })}
                />
                <Input
                  type="number" step="0.01" min={0}
                  className="h-8 text-right text-sm"
                  value={item.unitPrice || ''}
                  placeholder="0.00"
                  onChange={e => updateMaintenanceItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                />
                <button onClick={() => removeMaintenanceItem(item.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addMaintenanceItem} className="gap-1">
              <Plus className="w-3 h-3" /> Add Item
            </Button>

            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Inspection ({data.maintenance.visitsPerYear} visits × {formatCurrency(data.maintenance.inspectionPerVisit)})</span>
                <span>{formatCurrency(maintenanceInspectionTotal)}</span>
              </div>
              {maintenanceAdditionalTotal > 0 && (
                <div className="flex justify-between">
                  <span>Additional Items</span>
                  <span>{formatCurrency(maintenanceAdditionalTotal)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Annual Maintenance Sub-Total ex VAT</span>
                <span>{formatCurrency(maintenanceSubtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>VAT ({data.quotation.vatRate}%)</span>
                <span>{formatCurrency(maintenanceSubtotal * (data.quotation.vatRate / 100))}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Annual Total inc VAT</span>
                <span className="text-primary">
                  {formatCurrency(maintenanceSubtotal * (1 + data.quotation.vatRate / 100))}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
