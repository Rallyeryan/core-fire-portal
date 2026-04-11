import { useSpec } from '@/context/SpecContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EQUIPMENT_CATEGORIES } from '@/types/specData';
import { Plus, Trash2 } from 'lucide-react';

export function EquipmentStep() {
  const { data, updateData } = useSpec();

  const addItem = (category: string, description: string) => {
    updateData({
      equipment: [...data.equipment, { id: crypto.randomUUID(), category, description, qty: 0, unitPrice: 0 }]
    });
  };

  const updateItem = (id: string, qty: number) => {
    updateData({
      equipment: data.equipment.map(e => e.id === id ? { ...e, qty } : e)
    });
  };

  const removeItem = (id: string) => {
    updateData({ equipment: data.equipment.filter(e => e.id !== id) });
  };

  const addAllFromCategory = (category: string, items: string[]) => {
    const existing = data.equipment.filter(e => e.category === category).map(e => e.description);
    const newItems = items.filter(i => !existing.includes(i)).map(i => ({
      id: crypto.randomUUID(), category, description: i, qty: 0, unitPrice: 0,
    }));
    if (newItems.length > 0) {
      updateData({ equipment: [...data.equipment, ...newItems] });
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="spec-section-title text-xl mb-1">Equipment Schedule</h2>
        <p className="text-sm text-muted-foreground">Build the bill of materials. Add equipment items and specify quantities.</p>
      </div>

      {EQUIPMENT_CATEGORIES.map(cat => {
        const catItems = data.equipment.filter(e => e.category === cat.name);

        return (
          <div key={cat.name} className="spec-card space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="spec-section-title">{cat.name}</h3>
              <button
                className="text-xs font-medium text-primary hover:underline"
                onClick={() => addAllFromCategory(cat.name, cat.items)}
              >
                + Add All
              </button>
            </div>

            {catItems.length > 0 && (
              <div className="space-y-2">
                {catItems.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <Input
                      type="number"
                      className="w-20 bg-background text-center"
                      value={item.qty || ''}
                      min={0}
                      placeholder="Qty"
                      onChange={e => updateItem(item.id, parseInt(e.target.value) || 0)}
                    />
                    <span className="text-sm flex-1">{item.description}</span>
                    <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-1.5 pt-1">
              {cat.items.filter(i => !catItems.some(ci => ci.description === i)).map(item => (
                <button
                  key={item}
                  onClick={() => addItem(cat.name, item)}
                  className="text-xs px-2 py-1 rounded border border-dashed text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
                >
                  + {item}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
