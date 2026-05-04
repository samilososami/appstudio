export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export type DeviceType = 'phone' | 'watch';

export interface AppSettings {
  apiKey: string;
  model: string;
}

export interface SnackData {
  snackId: string;
  url: string;
}
