
export interface Kol {
  id: string;
  name: string;
  hospital: string;
  dept: string;
  level: number;
}

export interface Visit {
  id: string;
  kolId: string;
  date: string;
  content: string;
  level: number;
  products: string[];
  diseaseAreas: string[];
  competitor?: string | null;
  efficacyInfo: string;
  safetyInfo: string;
  timestamp: number;
}

export interface LevelDef {
  id: number;
  label: string;
}

export type ViewTab = 'dashboard' | 'list' | 'competitors';
