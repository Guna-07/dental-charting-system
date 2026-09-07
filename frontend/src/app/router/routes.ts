/** Typed path builders for client-side navigation. */

export const routes = {
  patients: () => "/",
  patientProfile: (patientId: string) => `/patients/${patientId}`,
} as const;

export type ProfileTab = "overview" | "dental" | "surface" | "gingival";

export const PROFILE_TABS: { value: ProfileTab; label: string }[] = [
  { value: "overview", label: "Overview" },
  { value: "dental", label: "Dental Investigation" },
  { value: "surface", label: "Surface Chart" },
  { value: "gingival", label: "Gingival Examination" },
];
