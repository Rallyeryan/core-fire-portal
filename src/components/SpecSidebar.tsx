import { useSpec } from '@/context/SpecContext';
import { SPEC_STEPS, type StepId } from '@/types/specData';
import { Building2, CheckSquare, Ruler, Layers, Cable, Settings, Package, Award, FileText, Eye, Check, PoundSterling, PenTool, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';

const iconMap: Record<string, React.ElementType> = {
  Building2, CheckSquare, Ruler, Layers, Cable, Settings, Package, Award, FileText, Eye, PoundSterling, PenTool,
};

const DeckGlyph = () => (
  <svg viewBox="0 0 120 120" className="h-9 w-9" aria-hidden>
    <circle
      cx="60" cy="60" r="46" fill="none" stroke="currentColor" strokeWidth="1.4"
      style={{ strokeDasharray: "18 14" }}
    />
    <rect x="34" y="34" width="52" height="52" rx="14" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1.2" />
    <circle cx="60" cy="60" r="7" fill="currentColor" />
  </svg>
);

export function SpecSidebar() {
  const { projectId, currentStep, setCurrentStep, completedSteps } = useSpec();
  const navigate = useNavigate();

  return (
    <aside className="w-72 min-h-screen bg-sidebar text-sidebar-foreground flex flex-col shrink-0">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <DeckGlyph />
          <div>
            <h1 className="font-heading text-sm font-bold tracking-tight">FD&A Spec Builder</h1>
            <p className="text-[10px] text-sidebar-foreground/50 uppercase tracking-[0.25em]">BS5839-1:2025</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-0.5">
        {SPEC_STEPS.map((step, index) => {
          const Icon = iconMap[step.icon] || FileText;
          const isActive = currentStep === step.id;
          const isComplete = completedSteps.has(step.id);

          return (
            <button
              key={step.id}
              onClick={() => setCurrentStep(step.id as StepId)}
              className={`sidebar-step w-full text-left ${isActive ? 'sidebar-step-active' : ''} ${isComplete && !isActive ? 'sidebar-step-complete' : ''}`}
            >
              <span className={`step-number ${isActive ? 'step-number-active' : ''} ${isComplete && !isActive ? 'step-number-complete' : ''}`}>
                {isComplete && !isActive ? <Check className="w-3.5 h-3.5" /> : index + 1}
              </span>
              <span className="truncate text-xs">{step.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border space-y-2">
        <button
          onClick={() => navigate(`/job/${projectId}`)}
          className="w-full text-[10px] font-semibold uppercase tracking-[0.25em] text-sidebar-foreground/70 hover:text-sidebar-foreground py-2.5 px-3 rounded-lg hover:bg-sidebar-accent transition-colors text-center"
        >
          → Job Management
        </button>
        <button
          onClick={() => navigate('/')}
          className="w-full text-[10px] text-sidebar-foreground/40 hover:text-sidebar-foreground/70 transition-colors py-2 px-3 rounded-lg hover:bg-sidebar-accent flex items-center gap-1.5 justify-center uppercase tracking-wider"
        >
          <Home className="w-3 h-3" /> Dashboard
        </button>
        <ThemeToggle variant="sidebar" />
        <p className="text-[10px] text-sidebar-foreground/25 text-center tracking-wider">
          Core Fire Protection © 2025
        </p>
      </div>
    </aside>
  );
}
