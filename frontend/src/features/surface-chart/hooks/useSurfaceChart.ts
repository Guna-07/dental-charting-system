import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { notify } from "@/components/feedback/notify";
import { queryKeys } from "@/services/query-client";
import { ApiError } from "@/types/api.types";

import { surfaceChartService } from "../services/surface-chart.service";
import type {
  SurfaceChart,
  ToothSurfaceUpdate,
} from "../types/surface-chart.types";

export function useSurfaceChart(patientId: string) {
  return useQuery({
    queryKey: queryKeys.surfaceChart(patientId),
    queryFn: () => surfaceChartService.get(patientId),
    enabled: Boolean(patientId),
  });
}

export function useUpdateToothSurfaces(patientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { toothNumber: string; update: ToothSurfaceUpdate }) =>
      surfaceChartService.updateTooth(patientId, vars.toothNumber, vars.update),
    onSuccess: (chart: SurfaceChart) => {
      qc.setQueryData(queryKeys.surfaceChart(patientId), chart);
      notify.success("Surface findings saved");
    },
    onError: (error) =>
      notify.error(error instanceof ApiError ? error.message : "Save failed"),
  });
}
