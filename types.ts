
export type Role = 'user' | 'model';

export type ChatMode = 'standard' | 'fast' | 'deepThought' | 'webSearch';

export interface Source {
  title: string;
  uri: string;
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  sources?: Source[];
}

export interface Bookmark {
  id: string; // Corresponds to Message.id
  text: string;
  notes?: string;
}

export interface User {
  name: string;
  email: string;
}
