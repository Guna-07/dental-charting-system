/** Finding vocabularies — must match backend `app/constants/dental.py`. */

export type InvestigationFindingType =
  | "caries"
  | "missing"
  | "filled"
  | "crown"
  | "root_canal_treated"
  | "fractured"
  | "implant"
  | "extraction_required"
  | "healthy"
  | "other";

export type FindingStatus = "current" | "planned";

export interface FindingOption {
  value: InvestigationFindingType;
  label: string;
  /** short glyph shown on the tooth */
  abbrev: string;
  /** semantic Mantine colour name */
  color: string;
}

export const INVESTIGATION_FINDINGS: FindingOption[] = [
  { value: "caries", label: "Caries", abbrev: "C", color: "red" },
  { value: "missing", label: "Missing", abbrev: "✕", color: "gray" },
  { value: "filled", label: "Filled", abbrev: "F", color: "blue" },
  { value: "crown", label: "Crown", abbrev: "Cr", color: "yellow" },
  { value: "root_canal_treated", label: "Root Canal Treated", abbrev: "RCT", color: "grape" },
  { value: "fractured", label: "Fractured", abbrev: "Fx", color: "orange" },
  { value: "implant", label: "Implant", abbrev: "Im", color: "teal" },
  { value: "extraction_required", label: "Extraction Required", abbrev: "XLA", color: "pink" },
  { value: "healthy", label: "Healthy", abbrev: "✓", color: "green" },
  { value: "other", label: "Other", abbrev: "?", color: "dark" },
];

export const FINDING_STATUS_OPTIONS: { value: FindingStatus; label: string }[] = [
  { value: "current", label: "Current Condition" },
  { value: "planned", label: "Treatment Required" },
];

export function investigationFinding(
  value: InvestigationFindingType,
): FindingOption {
  return (
    INVESTIGATION_FINDINGS.find((f) => f.value === value) ??
    INVESTIGATION_FINDINGS[INVESTIGATION_FINDINGS.length - 1]
  );
}

// --- surface-level ---------------------------------------------------------

export type SurfaceFindingType =
  | "caries"
  | "restoration"
  | "sealant"
  | "wear"
  | "fracture"
  | "healthy"
  | "other";

export interface SurfaceFindingOption {
  value: SurfaceFindingType;
  label: string;
  color: string;
}

export const SURFACE_FINDINGS: SurfaceFindingOption[] = [
  { value: "caries", label: "Caries", color: "red" },
  { value: "restoration", label: "Restoration", color: "blue" },
  { value: "sealant", label: "Sealant", color: "cyan" },
  { value: "wear", label: "Wear", color: "orange" },
  { value: "fracture", label: "Fracture", color: "grape" },
  { value: "healthy", label: "Healthy", color: "green" },
  { value: "other", label: "Other", color: "gray" },
];

export function surfaceFinding(value: SurfaceFindingType): SurfaceFindingOption {
  return (
    SURFACE_FINDINGS.find((f) => f.value === value) ??
    SURFACE_FINDINGS[SURFACE_FINDINGS.length - 1]
  );
}
