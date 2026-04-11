import { SpecProvider, useSpec } from '@/context/SpecContext';
import { SpecSidebar } from '@/components/SpecSidebar';
import { ProjectDetailsStep } from '@/components/steps/ProjectDetailsStep';
import { ModulesStep } from '@/components/steps/ModulesStep';
import { DesignStandardStep } from '@/components/steps/DesignStandardStep';
import { CategoriesStep } from '@/components/steps/CategoriesStep';
import { InterfacesStep } from '@/components/steps/InterfacesStep';
import { SystemDesignStep } from '@/components/steps/SystemDesignStep';
import { DesignDrawingsStep } from '@/components/steps/DesignDrawingsStep';
import { EquipmentStep } from '@/components/steps/EquipmentStep';
import { QuotationStep } from '@/components/steps/QuotationStep';
import { CertificationStep } from '@/components/steps/CertificationStep';
import { ClarificationsStep } from '@/components/steps/ClarificationsStep';
import { PreviewStep } from '@/components/steps/PreviewStep';
import { Button } from '@/components/ui/button';
import { SPEC_STEPS, type StepId } from '@/types/specData';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useParams, Navigate } from 'react-router-dom';
import { getProject } from '@/lib/projectStorage';

function StepContent() {
  const { currentStep } = useSpec();

  const steps: Record<StepId, React.ReactNode> = {
    project: <ProjectDetailsStep />,
    modules: <ModulesStep />,
    design: <DesignStandardStep />,
    categories: <CategoriesStep />,
    interfaces: <InterfacesStep />,
    system: <SystemDesignStep />,
    drawings: <DesignDrawingsStep />,
    equipment: <EquipmentStep />,
    quotation: <QuotationStep />,
    certification: <CertificationStep />,
    clarifications: <ClarificationsStep />,
    preview: <PreviewStep />,
  };

  return <>{steps[currentStep]}</>;
}

function StepNavigation() {
  const { currentStep, setCurrentStep, markStepComplete } = useSpec();
  const currentIndex = SPEC_STEPS.findIndex(s => s.id === currentStep);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === SPEC_STEPS.length - 1;

  const goNext = () => {
    markStepComplete(currentStep);
    if (!isLast) setCurrentStep(SPEC_STEPS[currentIndex + 1].id as StepId);
  };

  const goPrev = () => {
    if (!isFirst) setCurrentStep(SPEC_STEPS[currentIndex - 1].id as StepId);
  };

  return (
    <div className="flex items-center justify-between pt-6 border-t mt-8">
      <Button variant="outline" onClick={goPrev} disabled={isFirst} className="gap-2">
        <ChevronLeft className="w-4 h-4" /> Previous
      </Button>
      <span className="text-sm text-muted-foreground">
        Step {currentIndex + 1} of {SPEC_STEPS.length}
      </span>
      <Button onClick={goNext} disabled={isLast} className="gap-2">
        {isLast ? 'Complete' : 'Next'} <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

function SpecBuilderLayout() {
  return (
    <div className="flex min-h-screen w-full">
      <SpecSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-8">
          <StepContent />
          <StepNavigation />
        </div>
      </main>
    </div>
  );
}

const Index = () => {
  const { projectId } = useParams<{ projectId: string }>();

  if (!projectId || !getProject(projectId)) {
    return <Navigate to="/" replace />;
  }

  return (
    <SpecProvider projectId={projectId}>
      <SpecBuilderLayout />
    </SpecProvider>
  );
};

export default Index;
