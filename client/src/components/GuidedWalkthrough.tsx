import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, X, Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface FormField {
  id: string;
  label: string;
  instruction: string;
  section: string;
  required: boolean;
  validate?: () => boolean;
  errorMessage?: string;
}

interface GuidedWalkthroughProps {
  isActive: boolean;
  onClose: () => void;
  fields: FormField[];
}

export function GuidedWalkthrough({ isActive, onClose, fields }: GuidedWalkthroughProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedFields, setCompletedFields] = useState<Set<string>>(new Set());

  const currentField = fields[currentIndex];
  const progress = ((currentIndex + 1) / fields.length) * 100;

  // Keyboard shortcuts
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
        case "Enter":
          e.preventDefault();
          handleNext();
          break;
        case "ArrowLeft":
          e.preventDefault();
          handlePrevious();
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, currentIndex, currentField]);

  useEffect(() => {
    if (!isActive || !currentField) return;

    // Scroll to and highlight current field
    const element = document.getElementById(currentField.id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add("guided-highlight");
      
      // Focus the input
      const input = element.querySelector("input, textarea, select") as HTMLElement;
      if (input) {
        setTimeout(() => input.focus(), 300);
      }
    }

    return () => {
      if (element) {
        element.classList.remove("guided-highlight");
      }
    };
  }, [currentIndex, currentField, isActive]);

  const handleNext = () => {
    if (currentField.validate && !currentField.validate()) {
      return;
    }

    setCompletedFields(prev => new Set(Array.from(prev).concat(currentField.id)));

    if (currentIndex < fields.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Completed all fields
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSkip = () => {
    if (currentIndex < fields.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (!isActive || !currentField) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40 pointer-events-none" />

      {/* Instruction Card */}
      <Card className="fixed top-20 right-6 w-96 shadow-2xl z-50 p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <span>{currentField.section}</span>
                {currentField.required && (
                  <span className="text-destructive">*Required</span>
                )}
              </div>
              <h3 className="font-semibold text-lg">{currentField.label}</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Field {currentIndex + 1} of {fields.length}
              </span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Instruction */}
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm">{currentField.instruction}</p>
          </div>

          {/* Navigation */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="flex-1"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            
            {!currentField.required && (
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="flex-1"
              >
                Skip
              </Button>
            )}

            <Button
              onClick={handleNext}
              className="flex-1"
            >
              {currentIndex === fields.length - 1 ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Complete
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>

          {/* Completed Fields Counter */}
          <div className="text-center text-sm text-muted-foreground">
            {completedFields.size} fields completed
          </div>

          {/* Keyboard Shortcuts Hint */}
          <div className="border-t pt-3 mt-3">
            <p className="text-xs text-muted-foreground text-center">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">→</kbd> or <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Enter</kbd> Next · 
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">←</kbd> Previous · 
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Esc</kbd> Exit
            </p>
          </div>
        </div>
      </Card>

      {/* Global Styles for Highlighting */}
      <style>{`
        .guided-highlight {
          position: relative;
          z-index: 45 !important;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3) !important;
          border-radius: 8px;
          background: white !important;
        }
        
        .guided-highlight input,
        .guided-highlight textarea,
        .guided-highlight select {
          background: white !important;
        }
      `}</style>
    </>
  );
}
