import { JobProvider, useJob } from '@/context/JobContext';
import { JobSidebar } from '@/components/JobSidebar';
import { JobOverviewSection } from '@/components/job/JobOverviewSection';
import { DocumentTrackerSection } from '@/components/job/DocumentTrackerSection';
import { CertificatesSection } from '@/components/job/CertificatesSection';
import { CommissioningSection } from '@/components/job/CommissioningSection';
import { DrawingsSection } from '@/components/job/DrawingsSection';
import { LogBookSection } from '@/components/job/LogBookSection';
import { OperatingManualSection } from '@/components/job/OperatingManualSection';
import { type JobSectionId } from '@/types/jobData';
import { useParams, Navigate } from 'react-router-dom';
import { getProject } from '@/lib/projectStorage';

function SectionContent() {
  const { currentSection } = useJob();

  const sections: Record<JobSectionId, React.ReactNode> = {
    overview: <JobOverviewSection />,
    documents: <DocumentTrackerSection />,
    certificates: <CertificatesSection />,
    commissioning: <CommissioningSection />,
    drawings: <DrawingsSection />,
    logbook: <LogBookSection />,
    manual: <OperatingManualSection />,
  };

  return <>{sections[currentSection]}</>;
}

function JobLayout() {
  return (
    <div className="flex min-h-screen w-full">
      <JobSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-8">
          <SectionContent />
        </div>
      </main>
    </div>
  );
}

const JobManagement = () => {
  const { projectId } = useParams<{ projectId: string }>();

  if (!projectId || !getProject(projectId)) {
    return <Navigate to="/" replace />;
  }

  return (
    <JobProvider projectId={projectId}>
      <JobLayout />
    </JobProvider>
  );
};

export default JobManagement;
