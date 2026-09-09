import { useQueries } from "@tanstack/react-query";

import {
  investigationFinding,
  surfaceFinding,
  type InvestigationFindingType,
  type SurfaceFindingType,
} from "@/constants/dental/findings";
import { surfaceLabel, type Surface } from "@/constants/dental/surfaces";
import { apiClient } from "@/services/api-client";
import { endpoints } from "@/services/endpoints";
import { queryKeys } from "@/services/query-client";

/**
 * Cross-chart roll-up for the patient Overview. Reads the three chart documents
 * (sharing the same query keys / cache as the chart tabs) and derives a small
 * summary: how much has been recorded on each chart, and which findings are
 * clinically notable.
 */

interface DentalFindingLite {
  type: InvestigationFindingType;
  status: "current" | "planned";
}
interface DentalChartLite {
  teeth: Record<string, { findings: DentalFindingLite[] }>;
}
interface SurfaceChartLite {
  teeth: Record<
    string,
    { surfaces: Record<string, { finding: SurfaceFindingType }> }
  >;
}
interface PerioSiteLite {
  pd: number | null;
  gm: number | null;
  bop: boolean;
  plaque: boolean;
  suppuration: boolean;
}
interface PerioToothLite {
  buccal: Record<string, PerioSiteLite>;
  lingual: Record<string, PerioSiteLite>;
  mobility: number | null;
  furcation: number | null;
}
interface GingivalChartLite {
  teeth: Record<string, PerioToothLite>;
}

export type ConcernSource = "Dental" | "Surface" | "Periodontal";

export interface Concern {
  tooth: string;
  source: ConcernSource;
  label: string;
  detail?: string;
}

export interface PatientSummary {
  loading: boolean;
  isError: boolean;
  dentalCount: number;
  surfaceCount: number;
  periodontalCount: number;
  concerns: Concern[];
}

const siteHasData = (s: PerioSiteLite) =>
  s.pd !== null || s.gm !== null || s.bop || s.plaque || s.suppuration;

export function usePatientSummary(patientId: string): PatientSummary {
  const results = useQueries({
    queries: [
      {
        queryKey: queryKeys.dentalChart(patientId),
        queryFn: () =>
          apiClient.get<DentalChartLite>(endpoints.dentalChart.root(patientId)),
        enabled: Boolean(patientId),
      },
      {
        queryKey: queryKeys.surfaceChart(patientId),
        queryFn: () =>
          apiClient.get<SurfaceChartLite>(
            endpoints.surfaceChart.root(patientId),
          ),
        enabled: Boolean(patientId),
      },
      {
        queryKey: queryKeys.gingivalChart(patientId),
        queryFn: () =>
          apiClient.get<GingivalChartLite>(
            endpoints.gingivalChart.root(patientId),
          ),
        enabled: Boolean(patientId),
      },
    ],
  });

  const [dental, surface, gingival] = results;
  const loading = results.some((r) => r.isLoading);
  const isError = results.some((r) => r.isError);

  const dentalTeeth = dental.data?.teeth ?? {};
  const surfaceTeeth = surface.data?.teeth ?? {};
  const perioTeeth = gingival.data?.teeth ?? {};

  const dentalCount = Object.values(dentalTeeth).reduce(
    (n, t) => n + t.findings.length,
    0,
  );
  const surfaceCount = Object.values(surfaceTeeth).reduce(
    (n, t) => n + Object.keys(t.surfaces).length,
    0,
  );
  const periodontalCount = Object.values(perioTeeth).reduce((n, t) => {
    const sites =
      Object.values(t.buccal).filter(siteHasData).length +
      Object.values(t.lingual).filter(siteHasData).length;
    return (
      n +
      sites +
      (t.mobility !== null ? 1 : 0) +
      (t.furcation !== null ? 1 : 0)
    );
  }, 0);

  const concerns: Concern[] = [];

  for (const [tooth, t] of Object.entries(dentalTeeth)) {
    for (const f of t.findings) {
      if (f.type === "healthy") continue;
      concerns.push({
        tooth,
        source: "Dental",
        label: investigationFinding(f.type).label,
        detail: f.status === "planned" ? "Treatment required" : "Current",
      });
    }
  }

  // group a tooth's surface findings of the same type into one row
  const surfaceGroups = new Map<
    string,
    { tooth: string; label: string; surfaces: string[] }
  >();
  for (const [tooth, t] of Object.entries(surfaceTeeth)) {
    for (const [surf, entry] of Object.entries(t.surfaces)) {
      if (entry.finding === "healthy") continue;
      const key = `${tooth}|${entry.finding}`;
      const g = surfaceGroups.get(key) ?? {
        tooth,
        label: surfaceFinding(entry.finding).label,
        surfaces: [],
      };
      g.surfaces.push(surfaceLabel(tooth, surf as Surface));
      surfaceGroups.set(key, g);
    }
  }
  for (const g of surfaceGroups.values()) {
    concerns.push({
      tooth: g.tooth,
      source: "Surface",
      label: g.label,
      detail: g.surfaces.join(", "),
    });
  }

  for (const [tooth, t] of Object.entries(perioTeeth)) {
    const allSites = [
      ...Object.values(t.buccal),
      ...Object.values(t.lingual),
    ];
    if (allSites.some((s) => (s.pd ?? 0) >= 4)) {
      concerns.push({ tooth, source: "Periodontal", label: "Pocket depth ≥ 4 mm" });
    }
    if (allSites.some((s) => s.suppuration)) {
      concerns.push({ tooth, source: "Periodontal", label: "Suppuration" });
    }
    if ((t.mobility ?? 0) >= 2) {
      concerns.push({
        tooth,
        source: "Periodontal",
        label: `Mobility ${t.mobility}`,
      });
    }
  }

  concerns.sort(
    (a, b) => Number(a.tooth) - Number(b.tooth) || a.source.localeCompare(b.source),
  );

  return {
    loading,
    isError,
    dentalCount,
    surfaceCount,
    periodontalCount,
    concerns,
  };
}
