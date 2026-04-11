import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { type SpecData, type StepId, defaultSpecData } from '@/types/specData';
import { saveSpec, loadSpec } from '@/lib/projectStorage';

interface SpecContextType {
  projectId: string;
  data: SpecData;
  updateData: (updates: Partial<SpecData>) => void;
  updateNested: <K extends keyof SpecData>(key: K, updates: Partial<SpecData[K]>) => void;
  currentStep: StepId;
  setCurrentStep: (step: StepId) => void;
  completedSteps: Set<StepId>;
  markStepComplete: (step: StepId) => void;
  resetSpec: () => void;
}

const SpecContext = createContext<SpecContextType | null>(null);

export function SpecProvider({ projectId, children }: { projectId: string; children: ReactNode }) {
  const [data, setData] = useState<SpecData>(() => loadSpec(projectId));
  const [currentStep, setCurrentStep] = useState<StepId>('project');
  const [completedSteps, setCompletedSteps] = useState<Set<StepId>>(new Set());

  // Auto-save on data change
  useEffect(() => {
    const timer = setTimeout(() => saveSpec(projectId, data), 500);
    return () => clearTimeout(timer);
  }, [data, projectId]);

  const updateData = useCallback((updates: Partial<SpecData>) => {
    setData(prev => ({ ...prev, ...updates }));
  }, []);

  const updateNested = useCallback(<K extends keyof SpecData>(key: K, updates: Partial<SpecData[K]>) => {
    setData(prev => ({
      ...prev,
      [key]: { ...(prev[key] as object), ...updates },
    }));
  }, []);

  const markStepComplete = useCallback((step: StepId) => {
    setCompletedSteps(prev => new Set([...prev, step]));
  }, []);

  const resetSpec = useCallback(() => {
    setData(defaultSpecData);
    setCurrentStep('project');
    setCompletedSteps(new Set());
  }, []);

  return (
    <SpecContext.Provider value={{
      projectId, data, updateData, updateNested,
      currentStep, setCurrentStep,
      completedSteps, markStepComplete,
      resetSpec,
    }}>
      {children}
    </SpecContext.Provider>
  );
}

export function useSpec() {
  const ctx = useContext(SpecContext);
  if (!ctx) throw new Error('useSpec must be used within SpecProvider');
  return ctx;
}
