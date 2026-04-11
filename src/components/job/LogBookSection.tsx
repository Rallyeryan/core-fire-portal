import { useJob } from '@/context/JobContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { type DocumentStatus } from '@/types/jobData';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const statusOptions: { value: DocumentStatus; label: string }[] = [
  { value: 'notStarted', label: 'Not Started' },
  { value: 'inProgress', label: 'In Progress' },
  { value: 'complete', label: 'Complete' },
];

export function LogBookSection() {
  const { data, updateData, updateNested } = useJob();

  const addPerson = () => {
    updateData({
      logBook: {
        ...data.logBook,
        competentPersons: [...data.logBook.competentPersons, { id: crypto.randomUUID(), name: '', dept: '', tel: '' }],
      },
    });
  };

  const removePerson = (id: string) => {
    updateData({
      logBook: {
        ...data.logBook,
        competentPersons: data.logBook.competentPersons.filter(p => p.id !== id),
      },
    });
  };

  const updatePerson = (id: string, updates: Partial<{ name: string; dept: string; tel: string }>) => {
    updateData({
      logBook: {
        ...data.logBook,
        competentPersons: data.logBook.competentPersons.map(p => p.id === id ? { ...p, ...updates } : p),
      },
    });
  };

  const updateContacts = (updates: Partial<typeof data.logBook.emergencyContacts>) => {
    updateData({
      logBook: {
        ...data.logBook,
        emergencyContacts: { ...data.logBook.emergencyContacts, ...updates },
      },
    });
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="spec-section-title text-xl mb-1">Fire Safety Log Book</h2>
        <p className="text-sm text-muted-foreground">
          Competent persons, emergency contacts, and log book setup details.
        </p>
      </div>

      <div className="spec-card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="spec-section-title">Log Book Status</h3>
          <Select
            value={data.logBook.status}
            onValueChange={(v: DocumentStatus) => updateData({ logBook: { ...data.logBook, status: v } })}
          >
            <SelectTrigger className="w-36 h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              {statusOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="spec-card space-y-4">
        <h3 className="spec-section-title">Competent Persons / Fire Wardens</h3>
        {data.logBook.competentPersons.map(person => (
          <div key={person.id} className="grid grid-cols-[1fr_1fr_120px_32px] gap-2 items-center">
            <Input className="h-8 text-sm" value={person.name} placeholder="Name" onChange={e => updatePerson(person.id, { name: e.target.value })} />
            <Input className="h-8 text-sm" value={person.dept} placeholder="Department" onChange={e => updatePerson(person.id, { dept: e.target.value })} />
            <Input className="h-8 text-sm" value={person.tel} placeholder="Tel" onChange={e => updatePerson(person.id, { tel: e.target.value })} />
            <button onClick={() => removePerson(person.id)} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addPerson} className="gap-1">
          <Plus className="w-3 h-3" /> Add Person
        </Button>
      </div>

      <div className="spec-card space-y-4">
        <h3 className="spec-section-title">Emergency Contacts</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-xs">Fire Alarm Maintenance</Label>
            <Input className="h-8" value={data.logBook.emergencyContacts.fireAlarmMaintenance} onChange={e => updateContacts({ fireAlarmMaintenance: e.target.value })} placeholder="Core Fire Protection - 0141 433 1934" />
          </div>
          <div>
            <Label className="text-xs">Emergency Lighting</Label>
            <Input className="h-8" value={data.logBook.emergencyContacts.emergencyLighting} onChange={e => updateContacts({ emergencyLighting: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">Building Maintenance</Label>
            <Input className="h-8" value={data.logBook.emergencyContacts.buildingMaintenance} onChange={e => updateContacts({ buildingMaintenance: e.target.value })} />
          </div>
        </div>
      </div>
    </div>
  );
}
