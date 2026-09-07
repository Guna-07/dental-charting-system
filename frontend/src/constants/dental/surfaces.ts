import { toothMeta } from "./teeth";

export type Surface =
  | "mesial"
  | "distal"
  | "buccal"
  | "labial"
  | "lingual"
  | "occlusal"
  | "incisal";

export const POSTERIOR_SURFACES: Surface[] = [
  "mesial",
  "distal",
  "buccal",
  "lingual",
  "occlusal",
];
export const ANTERIOR_SURFACES: Surface[] = [
  "mesial",
  "distal",
  "labial",
  "lingual",
  "incisal",
];

export function surfacesForTooth(toothNumber: string): Surface[] {
  return toothMeta(toothNumber).toothClass === "anterior"
    ? ANTERIOR_SURFACES
    : POSTERIOR_SURFACES;
}

/** Display label — the oral surface reads "Palatal" for maxillary teeth. */
export function surfaceLabel(toothNumber: string, surface: Surface): string {
  if (surface === "lingual" && toothMeta(toothNumber).isUpper) return "Palatal";
  return surface.charAt(0).toUpperCase() + surface.slice(1);
}

export const SURFACE_ABBREV: Record<Surface, string> = {
  mesial: "M",
  distal: "D",
  buccal: "B",
  labial: "F",
  lingual: "L",
  occlusal: "O",
  incisal: "I",
};
