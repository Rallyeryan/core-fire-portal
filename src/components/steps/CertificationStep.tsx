import { useSpec } from '@/context/SpecContext';
import { Checkbox } from '@/components/ui/checkbox';

const CERTS = [
  { key: 'bs5839Design' as const, label: 'BS 5839-1 Design Certificate' },
  { key: 'bs5839Installation' as const, label: 'BS 5839-1 Installation Certificate' },
  { key: 'bs5839Commissioning' as const, label: 'BS 5839-1 Commissioning Certificate' },
  { key: 'bs5839Acceptance' as const, label: 'BS 5839-1 Acceptance Certificate' },
  { key: 'bs7273_4' as const, label: 'BS 7273-4 Commissioning Certificate' },
  { key: 'bs7273_6' as const, label: 'BS 7273-6 Commissioning Certificate' },
  { key: 'bafeSP203Modular' as const, label: 'BAFE SP203-1 Modular Certificate(s)' },
  { key: 'bafeSP203Compliance' as const, label: 'BAFE SP203-1 Certificate of Compliance' },
  { key: 'bs7671Electrical' as const, label: 'BS 7671 Electrical Test Certificate' },
];

export function CertificationStep() {
  const { data, updateData } = useSpec();

  const updateCert = (certKey: string, provider: string, checked: boolean) => {
    updateData({
      certificates: {
        ...data.certificates,
        [certKey]: { ...(data.certificates as any)[certKey], [provider]: checked },
      },
    });
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="spec-section-title text-xl mb-1">Certification</h2>
        <p className="text-sm text-muted-foreground">Select applicable certificates and indicate the signatory/provision responsibility.</p>
      </div>

      <div className="spec-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 pr-4 font-semibold">Certificate</th>
              <th className="text-center py-2 px-3 font-semibold">Core Fire</th>
              <th className="text-center py-2 px-3 font-semibold">Client</th>
              <th className="text-center py-2 px-3 font-semibold">Others</th>
            </tr>
          </thead>
          <tbody>
            {CERTS.map(cert => (
              <tr key={cert.key} className="border-b border-border/50">
                <td className="py-2.5 pr-4">{cert.label}</td>
                {['coreFire', 'client', 'others'].map(p => (
                  <td key={p} className="text-center py-2.5 px-3">
                    <Checkbox
                      checked={(data.certificates[cert.key] as any)[p]}
                      onCheckedChange={checked => updateCert(cert.key, p, !!checked)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
