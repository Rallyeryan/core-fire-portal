import { useSpec } from '@/context/SpecContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trash2 } from 'lucide-react';

export function ClarificationsStep() {
  const { data, updateData } = useSpec();

  const addVariation = () => {
    const num = `V-${String(data.variations.length + 1).padStart(2, '0')}`;
    updateData({
      variations: [...data.variations, { id: crypto.randomUUID(), number: num, detail: '', clauseRef: '' }]
    });
  };

  const addClarification = () => {
    updateData({
      clarifications: [...data.clarifications, { id: crypto.randomUUID(), text: '' }]
    });
  };

  const addBasis = () => {
    updateData({
      proposalBasis: [...data.proposalBasis, { id: crypto.randomUUID(), text: '' }]
    });
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="spec-section-title text-xl mb-1">Clarifications & Variations</h2>
        <p className="text-sm text-muted-foreground">Record design variations, points of clarification, and proposal basis items.</p>
      </div>

      {/* Design Variations */}
      <div className="spec-card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="spec-section-title">Schedule of Design Variations</h3>
          <button className="text-xs font-medium text-primary hover:underline" onClick={addVariation}>+ Add Variation</button>
        </div>
        {data.variations.length === 0 && <p className="text-sm text-muted-foreground italic">None</p>}
        {data.variations.map((v, i) => (
          <div key={v.id} className="flex gap-3 items-start">
            <Input className="w-20 bg-background shrink-0" value={v.number} readOnly />
            <Textarea className="flex-1 bg-background" rows={2} placeholder="Variation detail..." value={v.detail}
              onChange={e => { const u = [...data.variations]; u[i] = { ...v, detail: e.target.value }; updateData({ variations: u }); }} />
            <Input className="w-20 bg-background shrink-0" placeholder="Clause" value={v.clauseRef}
              onChange={e => { const u = [...data.variations]; u[i] = { ...v, clauseRef: e.target.value }; updateData({ variations: u }); }} />
            <button onClick={() => updateData({ variations: data.variations.filter(x => x.id !== v.id) })} className="text-muted-foreground hover:text-destructive mt-2">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Points of Clarification */}
      <div className="spec-card space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="spec-section-title">Points of Clarification</h3>
          <button className="text-xs font-medium text-primary hover:underline" onClick={addClarification}>+ Add Point</button>
        </div>
        {data.clarifications.map((c, i) => (
          <div key={c.id} className="flex gap-3 items-start">
            <span className="text-sm font-medium text-muted-foreground mt-2 w-6 shrink-0">{i + 1}.</span>
            <Textarea className="flex-1 bg-background" rows={2} placeholder="Clarification..." value={c.text}
              onChange={e => { const u = [...data.clarifications]; u[i] = { ...c, text: e.target.value }; updateData({ clarifications: u }); }} />
            <button onClick={() => updateData({ clarifications: data.clarifications.filter(x => x.id !== c.id) })} className="text-muted-foreground hover:text-destructive mt-2">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Basis of Proposal */}
      <div className="spec-card space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="spec-section-title">Proposal Basis</h3>
          <button className="text-xs font-medium text-primary hover:underline" onClick={addBasis}>+ Add Item</button>
        </div>
        {data.proposalBasis.map((b, i) => (
          <div key={b.id} className="flex gap-3 items-start">
            <span className="text-sm font-medium text-muted-foreground mt-2 w-6 shrink-0">{i + 1}.</span>
            <Textarea className="flex-1 bg-background" rows={2} value={b.text}
              onChange={e => { const u = [...data.proposalBasis]; u[i] = { ...b, text: e.target.value }; updateData({ proposalBasis: u }); }} />
            <button onClick={() => updateData({ proposalBasis: data.proposalBasis.filter(x => x.id !== b.id) })} className="text-muted-foreground hover:text-destructive mt-2">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
