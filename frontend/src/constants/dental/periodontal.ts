/** Periodontal charting vocabulary and ranges — must match the backend. */

export type PerioAspect = "buccal" | "lingual";
export type PerioSite = "mesial" | "mid" | "distal";

export const PERIO_ASPECTS: PerioAspect[] = ["buccal", "lingual"];
export const PERIO_SITES: PerioSite[] = ["mesial", "mid", "distal"];

export const SITE_ABBREV: Record<PerioSite, string> = {
  mesial: "M",
  mid: "Mid",
  distal: "D",
};

export const PD_RANGE = { min: 0, max: 15 } as const;
export const GM_RANGE = { min: -5, max: 10 } as const;
export const MOBILITY_RANGE = { min: 0, max: 3 } as const;
export const FURCATION_RANGE = { min: 0, max: 3 } as const;

/** Rows rendered per aspect in the periodontal grid, in display order. */
export const SITE_MEASURE_ROWS = [
  { key: "pd", label: "Pocket Depth (PD)", kind: "number" as const, range: PD_RANGE },
  { key: "gm", label: "Gingival Margin (GM)", kind: "number" as const, range: GM_RANGE },
  { key: "cal", label: "Attachment Level (CAL)", kind: "computed" as const },
  { key: "bop", label: "Bleeding on Probing", kind: "bool" as const },
  { key: "plaque", label: "Plaque", kind: "bool" as const },
  { key: "suppuration", label: "Suppuration", kind: "bool" as const },
] as const;

export type SiteMeasureRowKey = (typeof SITE_MEASURE_ROWS)[number]["key"];

export const MOBILITY_OPTIONS = [0, 1, 2, 3];
export const FURCATION_OPTIONS = [0, 1, 2, 3];

/** CAL = PD + GM, with GM recorded as recession (see README). */
export function calcCal(
  pd: number | null | undefined,
  gm: number | null | undefined,
): number | null {
  if (pd === null || pd === undefined || gm === null || gm === undefined) {
    return null;
  }
  return pd + gm;
}
