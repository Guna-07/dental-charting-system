import type { PerioAspect, PerioSite } from "@/constants/dental/periodontal";

export interface SiteMeasurement {
  pd: number | null;
  gm: number | null;
  bop: boolean;
  plaque: boolean;
  suppuration: boolean;
  /** present only on responses (computed server-side) */
  cal?: number | null;
}

export type AspectSites = Partial<Record<PerioSite, SiteMeasurement>>;

export interface ToothPerio {
  tooth_number: string;
  buccal: AspectSites;
  lingual: AspectSites;
  mobility: number | null;
  furcation: number | null;
  notes: string;
  updated_at: string;
}

export interface GingivalChart {
  patient_id: string;
  teeth: Record<string, ToothPerio>;
  created_at: string;
  updated_at: string;
}

// ---- draft (client-side, before Save) ----

export interface ToothPerioDraft {
  buccal: Record<PerioSite, SiteMeasurement>;
  lingual: Record<PerioSite, SiteMeasurement>;
  mobility: number | null;
  furcation: number | null;
  notes: string;
}

export type GingivalDraft = Record<string, ToothPerioDraft>;

export interface GingivalChartUpdate {
  teeth: Record<
    string,
    {
      buccal: AspectSites;
      lingual: AspectSites;
      mobility: number | null;
      furcation: number | null;
      notes: string;
    }
  >;
}

export type { PerioAspect, PerioSite };
