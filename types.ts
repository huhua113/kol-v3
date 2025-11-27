export interface Kol {
  id: string;
  name: string;
  dept: string;
  level: number;
}

export interface Visit {
  id: number;
  kolId: string;
  date: string;
  content: string;
  level: number;
  competitor?: string | null;
  timestamp: number;
}

export interface LevelDef {
  id: number;
  label: string;
}

export type ViewTab = 'dashboard' | 'list' | 'competitors';