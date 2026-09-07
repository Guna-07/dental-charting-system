import type { SurfaceFindingType } from "@/constants/dental/findings";
import type { Surface } from "@/constants/dental/surfaces";

export interface SurfaceFindingEntry {
  finding: SurfaceFindingType;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface ToothSurfaces {
  tooth_number: string;
  surfaces: Partial<Record<Surface, SurfaceFindingEntry>>;
  updated_at: string;
}

export interface SurfaceChart {
  patient_id: string;
  teeth: Record<string, ToothSurfaces>;
  created_at: string;
  updated_at: string;
}

/** PUT body — only listed surfaces change; `null` clears one. */
export interface ToothSurfaceUpdate {
  surfaces: Partial<
    Record<Surface, { finding: SurfaceFindingType; notes: string } | null>
  >;
}
