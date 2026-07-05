export type ActionProvider = 'aura' | 'argus' | 'system';

export type ActionStatus = 'queued' | 'running' | 'completed' | 'failed';

export type ActionKind =
  | 'document.create'
  | 'file.prepare_download'
  | 'tool.list_capabilities';

export type DocumentFormat = 'md' | 'html' | 'txt' | 'csv' | 'json' | 'svg' | 'doc';

export type ActionCapability = {
  id: ActionKind | string;
  title: string;
  description: string;
  provider: ActionProvider;
  status: 'active' | 'planned' | 'disabled';
  formats?: string[];
};

export type ExecuteActionRequest = {
  action: ActionKind;
  projectId?: string | null;
  persona?: 'aura' | 'argus';
  title?: string;
  content?: string;
  format?: DocumentFormat;
  metadata?: Record<string, unknown>;
};

export type ActionArtifact = {
  id?: string;
  fileName: string;
  mimeType: string;
  extension: string;
  sizeBytes: number;
  contentBase64: string;
  dataUrl: string;
};

export type ExecuteActionResult = {
  ok: boolean;
  action: ActionKind;
  status: ActionStatus;
  runId?: string;
  artifact?: ActionArtifact;
  message: string;
  warnings?: string[];
};
