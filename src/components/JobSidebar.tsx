import { useJob } from '@/context/JobContext';
import { JOB_SECTIONS, type JobSectionId } from '@/types/jobData';
import { ClipboardList, FileCheck, Award, CheckCircle, FileImage, BookOpen, Book, Check, Flame, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';

const iconMap: Record<string, React.ElementType> = {
  ClipboardList, FileCheck, Award, CheckCircle, FileImage, BookOpen, Book,
};

export function JobSidebar() {
  const { projectId, currentSection, setCurrentSection } = useJob();
  const navigate = useNavigate();

  return (
    <aside className="w-72 min-h-screen bg-sidebar text-sidebar-foreground flex flex-col shrink-0">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Flame className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-heading text-base font-bold tracking-tight">Job Management</h1>
            <p className="text-xs text-sidebar-foreground/60">BS5839-1:2025</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {JOB_SECTIONS.map((section, index) => {
          const Icon = iconMap[section.icon] || FileCheck;
          const isActive = currentSection === section.id;

          return (
            <button
              key={section.id}
              onClick={() => setCurrentSection(section.id as JobSectionId)}
              className={`sidebar-step w-full text-left ${isActive ? 'sidebar-step-active' : ''}`}
            >
              <span className={`step-number ${isActive ? 'step-number-active' : ''}`}>
                {index + 1}
              </span>
              <span className="truncate">{section.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border space-y-2">
        <button
          onClick={() => navigate(`/spec/${projectId}`)}
          className="w-full text-xs text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors py-2 px-3 rounded-md hover:bg-sidebar-accent"
        >
          ← Back to Spec Builder
        </button>
        <button
          onClick={() => navigate('/')}
          className="w-full text-xs text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors py-2 px-3 rounded-md hover:bg-sidebar-accent flex items-center gap-1.5 justify-center"
        >
          <Home className="w-3 h-3" /> Dashboard
        </button>
        <ThemeToggle variant="sidebar" />
        <p className="text-xs text-sidebar-foreground/40 text-center">
          Core Fire Protection © 2025
        </p>
      </div>
    </aside>
  );
}
