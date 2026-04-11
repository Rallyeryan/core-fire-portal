import type { SpecData } from '@/types/specData';
import type { JobData } from '@/types/jobData';
import { defaultSpecData } from '@/types/specData';
import { defaultJobData } from '@/types/jobData';

export interface SavedProject {
  id: string;
  name: string;
  customerName: string;
  siteName: string;
  specReference: string;
  createdAt: string;
  updatedAt: string;
  hasSpec: boolean;
  hasJob: boolean;
  jobStatus?: JobData['status'];
}

const PROJECTS_KEY = 'fda_projects';
const SPEC_PREFIX = 'fda_spec_';
const JOB_PREFIX = 'fda_job_';

// --- Project index ---

function getProjects(): SavedProject[] {
  try {
    return JSON.parse(localStorage.getItem(PROJECTS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveProjects(projects: SavedProject[]) {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export function listProjects(): SavedProject[] {
  return getProjects().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getProject(id: string): SavedProject | undefined {
  return getProjects().find(p => p.id === id);
}

export function createProject(name: string): string {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const projects = getProjects();
  projects.push({
    id, name, customerName: '', siteName: '', specReference: '',
    createdAt: now, updatedAt: now, hasSpec: false, hasJob: false,
  });
  saveProjects(projects);
  return id;
}

export function updateProjectMeta(id: string, updates: Partial<SavedProject>) {
  const projects = getProjects();
  const idx = projects.findIndex(p => p.id === id);
  if (idx === -1) return;
  projects[idx] = { ...projects[idx], ...updates, updatedAt: new Date().toISOString() };
  saveProjects(projects);
}

export function deleteProject(id: string) {
  saveProjects(getProjects().filter(p => p.id !== id));
  localStorage.removeItem(SPEC_PREFIX + id);
  localStorage.removeItem(JOB_PREFIX + id);
}

export function duplicateProject(sourceId: string, newName: string): string {
  const newId = crypto.randomUUID();
  const now = new Date().toISOString();
  const source = getProject(sourceId);
  const projects = getProjects();

  projects.push({
    id: newId,
    name: newName,
    customerName: source?.customerName || '',
    siteName: source?.siteName || '',
    specReference: '',
    createdAt: now,
    updatedAt: now,
    hasSpec: source?.hasSpec || false,
    hasJob: false,
  });
  saveProjects(projects);

  // Copy spec data if exists
  const specRaw = localStorage.getItem(SPEC_PREFIX + sourceId);
  if (specRaw) {
    localStorage.setItem(SPEC_PREFIX + newId, specRaw);
  }

  return newId;
}

// --- Spec data ---

export function saveSpec(projectId: string, data: SpecData) {
  localStorage.setItem(SPEC_PREFIX + projectId, JSON.stringify(data));
  updateProjectMeta(projectId, {
    hasSpec: true,
    customerName: data.customerName,
    siteName: data.siteName,
    specReference: data.specReference,
  });
}

export function loadSpec(projectId: string): SpecData {
  try {
    const raw = localStorage.getItem(SPEC_PREFIX + projectId);
    if (raw) return JSON.parse(raw);
  } catch { /* fallthrough */ }
  return { ...defaultSpecData };
}

// --- Job data ---

export function saveJob(projectId: string, data: JobData) {
  localStorage.setItem(JOB_PREFIX + projectId, JSON.stringify(data));
  updateProjectMeta(projectId, {
    hasJob: true,
    jobStatus: data.status,
    customerName: data.customerName || undefined,
    siteName: data.siteName || undefined,
  });
}

export function loadJob(projectId: string): JobData {
  try {
    const raw = localStorage.getItem(JOB_PREFIX + projectId);
    if (raw) return JSON.parse(raw);
  } catch { /* fallthrough */ }
  return { ...defaultJobData };
}

// --- Export / Import ---

export interface ProjectExport {
  version: 1;
  exportedAt: string;
  project: SavedProject;
  spec: SpecData | null;
  job: JobData | null;
}

export function exportProject(projectId: string): ProjectExport {
  const project = getProject(projectId);
  if (!project) throw new Error('Project not found');

  const specRaw = localStorage.getItem(SPEC_PREFIX + projectId);
  const jobRaw = localStorage.getItem(JOB_PREFIX + projectId);

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    project,
    spec: specRaw ? JSON.parse(specRaw) : null,
    job: jobRaw ? JSON.parse(jobRaw) : null,
  };
}

export function importProject(data: ProjectExport): string {
  const newId = crypto.randomUUID();
  const now = new Date().toISOString();
  const projects = getProjects();

  projects.push({
    ...data.project,
    id: newId,
    createdAt: now,
    updatedAt: now,
  });
  saveProjects(projects);

  if (data.spec) {
    localStorage.setItem(SPEC_PREFIX + newId, JSON.stringify(data.spec));
  }
  if (data.job) {
    localStorage.setItem(JOB_PREFIX + newId, JSON.stringify(data.job));
  }

  return newId;
}

// --- Bulk Export / Import ---

export interface BulkExport {
  version: 1;
  type: 'bulk';
  exportedAt: string;
  projects: ProjectExport[];
}

export function exportAllProjects(): BulkExport {
  const all = getProjects();
  return {
    version: 1,
    type: 'bulk',
    exportedAt: new Date().toISOString(),
    projects: all.map(p => exportProject(p.id)),
  };
}

export function importBulk(data: BulkExport): number {
  let count = 0;
  for (const proj of data.projects) {
    importProject(proj);
    count++;
  }
  return count;
}
