export interface Message {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
  workflow?: WorkflowStep[];
  deviceType?: DeviceType;
  watchShape?: WatchShape;
  workingStartedAt?: number;
  workedMs?: number;
}

export type DeviceType = 'phone' | 'watch';
export type WatchShape = 'round';
export type ResponseMode = 'fast' | 'balanced' | 'deep';

export interface DeviceSpec {
  deviceType: DeviceType;
  watchShape: WatchShape;
  title?: string;
}

export interface WorkflowStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'done' | 'error';
  timestamp?: number;
}

export interface AppSettings {
  apiKey: string;
  model: string;
  responseMode: ResponseMode;
}

export interface SnackData {
  snackId: string;
  url: string;
  runtimeUrl?: string;
  savedId?: string;
}
