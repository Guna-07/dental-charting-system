/**
 * FDI (ISO 3950) tooth numbering — the single source of truth for chart layout.
 *
 * Row order is anatomical: each arch runs patient-right → patient-left, i.e.
 * quadrant 1|4 (reversed, so it reads outer→midline) then quadrant 2|3.
 */

export type Dentition = "permanent" | "primary";
export type ArchName = "upper" | "lower";
export type ToothClass = "anterior" | "posterior";

export interface ToothMeta {
  number: string;
  dentition: Dentition;
  arch: ArchName;
  toothClass: ToothClass;
  /** true for maxillary teeth — used to label the oral surface "Palatal". */
  isUpper: boolean;
  /** furcation readings are only clinically meaningful on multi-rooted teeth */
  hasFurcation: boolean;
}

const quadrant = (q: number, count: number): string[] =>
  Array.from({ length: count }, (_, i) => `${q}${i + 1}`);

// Upper: q1 outer→midline (18..11) then q2 midline→outer (21..28)
export const PERMANENT_UPPER = [...quadrant(1, 8).reverse(), ...quadrant(2, 8)];
export const PERMANENT_LOWER = [...quadrant(4, 8).reverse(), ...quadrant(3, 8)];
export const PRIMARY_UPPER = [...quadrant(5, 5).reverse(), ...quadrant(6, 5)];
export const PRIMARY_LOWER = [...quadrant(8, 5).reverse(), ...quadrant(7, 5)];

export const PERMANENT_TEETH = [...PERMANENT_UPPER, ...PERMANENT_LOWER];
export const PRIMARY_TEETH = [...PRIMARY_UPPER, ...PRIMARY_LOWER];

function isUpper(n: string): boolean {
  return ["1", "2", "5", "6"].includes(n[0]);
}

function isAnterior(n: string): boolean {
  return ["1", "2", "3"].includes(n[n.length - 1]);
}

function hasFurcation(n: string): boolean {
  const q = n[0];
  const pos = n[n.length - 1];
  if (["1", "2", "3", "4"].includes(q)) {
    if (["6", "7", "8"].includes(pos)) return true;
    if (pos === "4" && ["1", "2"].includes(q)) return true; // upper 1st premolars
    return false;
  }
  return ["4", "5"].includes(pos); // primary molars
}

export function toothMeta(number: string): ToothMeta {
  const dentition: Dentition = PRIMARY_TEETH.includes(number)
    ? "primary"
    : "permanent";
  return {
    number,
    dentition,
    arch: isUpper(number) ? "upper" : "lower",
    toothClass: isAnterior(number) ? "anterior" : "posterior",
    isUpper: isUpper(number),
    hasFurcation: hasFurcation(number),
  };
}

export function archTeeth(dentition: Dentition, arch: ArchName): string[] {
  if (dentition === "primary") {
    return arch === "upper" ? PRIMARY_UPPER : PRIMARY_LOWER;
  }
  return arch === "upper" ? PERMANENT_UPPER : PERMANENT_LOWER;
}

/** Index at which the arch row crosses the midline (for a visual gap). */
export function midlineIndex(dentition: Dentition): number {
  return dentition === "primary" ? 5 : 8;
}
