export type ProjectStatus = 'active' | 'archived' | 'deleted';

export type ProjectSummary = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: ProjectStatus;
  color: string | null;
  icon: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  lastActivityAt: string | null;
  memoryCount: number;
  sessionCount: number;
};

export type ProjectListResponse = {
  projects: ProjectSummary[];
  activeProject: ProjectSummary | null;
};
