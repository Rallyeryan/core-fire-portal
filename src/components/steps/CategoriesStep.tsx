import { useSpec } from '@/context/SpecContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const CATEGORIES = [
  {
    key: 'M' as const, group: 'Manual', label: 'Category M — Manual System',
    desc: 'A system incorporating only manual call points (break glass units). No automatic fire detection is provided. Suitable where the primary objective is to allow occupants to raise the alarm manually upon discovering a fire. Typically used where automatic detection is not required by a fire risk assessment.',
  },
  {
    key: 'P1' as const, group: 'Property', label: 'Category P1 — Full Property Protection',
    desc: 'Automatic fire detection installed throughout all areas of the building to provide the earliest possible warning of fire and thus minimise the time between ignition and the attendance of the fire brigade, minimising damage to property. Detection is required in all rooms, areas, and accessible spaces.',
  },
  {
    key: 'P2' as const, group: 'Property', label: 'Category P2 — Property Protection (Defined Areas)',
    desc: 'Automatic fire detection installed in defined parts of the building only, typically the areas of highest risk or value. The areas to be protected are determined by the fire risk assessment or by agreement with interested parties. P2 coverage can complement a Category M or L system.',
    hasArea: true,
  },
  {
    key: 'L1' as const, group: 'Life', label: 'Category L1 — Full Life Protection',
    desc: 'Automatic fire detection installed throughout all areas of the building to provide the earliest possible warning of fire to occupants, ensuring maximum time for escape. L1 provides the highest level of automatic fire detection for the protection of life and includes all the requirements of Categories L2, L3 and L4.',
  },
  {
    key: 'L2' as const, group: 'Life', label: 'Category L2 — Life Protection (Defined Areas)',
    desc: 'Automatic fire detection installed in defined rooms and areas of the building, as identified by a fire risk assessment. L2 includes all the requirements of Category L3. Detection is typically extended beyond escape routes to rooms that present a higher fire risk or where a fire could develop undetected and subsequently threaten occupants.',
    hasArea: true,
  },
  {
    key: 'L3' as const, group: 'Life', label: 'Category L3 — Escape Route Protection',
    desc: 'Automatic fire detection installed in escape routes, all rooms or areas that open onto escape routes, and in all circulation areas that form part of the escape routes. L3 is designed to warn occupants of smoke and fire in escape routes before those routes become impassable. Detectors are not normally required in rooms that do not open onto escape routes.',
  },
  {
    key: 'L4' as const, group: 'Life', label: 'Category L4 — Circulation Areas Only',
    desc: 'Automatic fire detection installed only within escape routes comprising circulation areas (corridors, stairways, landings) and rooms that open directly onto them. L4 provides a lower level of protection than L3 as it does not extend to all rooms opening onto escape routes.',
  },
  {
    key: 'L5' as const, group: 'Life', label: 'Category L5 — Specific Life Risk',
    desc: 'A system in which the category of protection and the location of detectors are determined by a specific fire safety risk, as identified by a fire risk assessment. L5 addresses particular dangers such as a fire risk to sleeping occupants in a specific room. The system is custom-designed to mitigate the identified risk(s).',
    hasArea: true,
  },
  {
    key: 'mixed' as const, group: 'Other', label: 'Mixed Category',
    desc: 'A system combining multiple categories across different areas of the same building. For example, Category L1 in the main building with Category P1 in an adjoining warehouse. Each area should be clearly identified with its applicable category.',
    hasArea: true,
  },
  {
    key: 'other' as const, group: 'Other', label: 'Other Standard',
    desc: 'System designed to an alternative or additional standard, such as SHTM 82 (Scottish Health Technical Memorandum) for healthcare premises, HTM 05-03 for NHS England, or other sector-specific guidance.',
    hasArea: true,
  },
];

const areaKeys: Record<string, keyof ReturnType<typeof useSpec>['data']> = {
  P2: 'categoryP2Areas',
  L2: 'categoryL2Areas',
  L5: 'categoryL5Details',
  mixed: 'categoryMixedDetails',
  other: 'categoryOtherDetails',
};

export function CategoriesStep() {
  const { data, updateData, updateNested } = useSpec();

  let currentGroup = '';

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="spec-section-title text-xl mb-1">System Categories</h2>
        <p className="text-sm text-muted-foreground">Select the fire alarm system category as defined by BS 5839-1. Multiple categories can be selected for mixed systems.</p>
      </div>

      <div className="spec-card space-y-1">
        {CATEGORIES.map(cat => {
          const showGroup = cat.group !== currentGroup;
          currentGroup = cat.group;
          const areaKey = areaKeys[cat.key];

          return (
            <div key={cat.key}>
              {showGroup && (
                <div className="pt-3 pb-1 first:pt-0">
                  <span className="spec-badge">{cat.group}</span>
                </div>
              )}
              <label className="spec-checkbox-item cursor-pointer">
                <Checkbox
                  checked={data.categories[cat.key]}
                  onCheckedChange={checked => updateNested('categories', { [cat.key]: !!checked })}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium">{cat.label}</span>
                  <p className="text-xs text-muted-foreground leading-relaxed">{cat.desc}</p>
                  {cat.hasArea && data.categories[cat.key] && areaKey && (
                    <Textarea
                      className="mt-2 bg-background text-sm"
                      rows={2}
                      placeholder={cat.key === 'mixed' ? 'e.g. Category M within Workshop, Category L1 within Office' : 'Specify areas / details...'}
                      value={data[areaKey] as string}
                      onChange={e => updateData({ [areaKey]: e.target.value })}
                      onClick={e => e.stopPropagation()}
                    />
                  )}
                </div>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
