import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { type JobData, type JobSectionId, defaultJobData } from '@/types/jobData';
import { saveJob, loadJob, loadSpec } from '@/lib/projectStorage';
import { mapSpecToJob } from '@/lib/specToJob';

interface JobContextType {
  projectId: string;
  data: JobData;
  updateData: (updates: Partial<JobData>) => void;
  updateNested: <K extends keyof JobData>(key: K, updates: Partial<JobData[K]>) => void;
  currentSection: JobSectionId;
  setCurrentSection: (section: JobSectionId) => void;
  resetJob: () => void;
  importFromSpec: (specData: {
    specReference: string;
    customerName: string;
    siteName: string;
    siteAddress: string;
    producedBy: string;
  }) => void;
}

const JobContext = createContext<JobContextType | null>(null);

export function JobProvider({ projectId, children }: { projectId: string; children: ReactNode }) {
  const [data, setData] = useState<JobData>(() => {
    const hasBeenSaved = !!localStorage.getItem(`fda_job_${projectId}`);
    if (!hasBeenSaved) {
      const spec = loadSpec(projectId);
      if (spec) {
        const mapped = mapSpecToJob(spec);
        return { ...defaultJobData, ...mapped };
      }
    }
    return loadJob(projectId);
  });
  const [currentSection, setCurrentSection] = useState<JobSectionId>('overview');

  // Auto-save on data change
  useEffect(() => {
    const timer = setTimeout(() => saveJob(projectId, data), 500);
    return () => clearTimeout(timer);
  }, [data, projectId]);

  const updateData = useCallback((updates: Partial<JobData>) => {
    setData(prev => ({ ...prev, ...updates }));
  }, []);

  const updateNested = useCallback(<K extends keyof JobData>(key: K, updates: Partial<JobData[K]>) => {
    setData(prev => ({
      ...prev,
      [key]: { ...(prev[key] as object), ...updates },
    }));
  }, []);

  const resetJob = useCallback(() => {
    setData(defaultJobData);
    setCurrentSection('overview');
  }, []);

  const importFromSpec = useCallback((specData: {
    specReference: string;
    customerName: string;
    siteName: string;
    siteAddress: string;
    producedBy: string;
  }) => {
    setData(prev => ({
      ...prev,
      specReference: specData.specReference,
      customerName: specData.customerName,
      siteName: specData.siteName,
      siteAddress: specData.siteAddress,
      projectManager: specData.producedBy,
    }));
  }, []);

  return (
    <JobContext.Provider value={{
      projectId, data, updateData, updateNested,
      currentSection, setCurrentSection,
      resetJob, importFromSpec,
    }}>
      {children}
    </JobContext.Provider>
  );
}

export function useJob() {
  const ctx = useContext(JobContext);
  if (!ctx) throw new Error('useJob must be used within JobProvider');
  return ctx;
}
