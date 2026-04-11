import { supabase } from '@/integrations/supabase/client';
import { type CertificateRecord, type JobData } from '@/types/jobData';
import { generateCertificateHTML } from './certificateExport';

export async function saveCertificateToCloud(
  projectId: string,
  cert: CertificateRecord,
  jobData: JobData
): Promise<{ success: boolean; error?: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const html = generateCertificateHTML(cert, jobData);

  const { error } = await supabase
    .from('completed_certificates')
    .upsert({
      user_id: user.id,
      project_id: projectId,
      certificate_type: cert.type,
      certificate_data: cert as any,
      html_content: html,
      status: cert.status,
    }, {
      onConflict: 'user_id,project_id,certificate_type',
    });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function loadCertificatesFromCloud(
  projectId: string
): Promise<CertificateRecord[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('completed_certificates')
    .select('certificate_type, certificate_data')
    .eq('user_id', user.id)
    .eq('project_id', projectId);

  if (error || !data) return [];
  return data.map(row => row.certificate_data as unknown as CertificateRecord);
}

export async function syncAllCertificatesToCloud(
  projectId: string,
  certificates: CertificateRecord[],
  jobData: JobData
): Promise<{ saved: number; errors: number }> {
  let saved = 0;
  let errors = 0;

  const completedOrInProgress = certificates.filter(c =>
    c.status === 'complete' || c.status === 'inProgress'
  );

  for (const cert of completedOrInProgress) {
    const result = await saveCertificateToCloud(projectId, cert, jobData);
    if (result.success) saved++;
    else errors++;
  }

  return { saved, errors };
}
