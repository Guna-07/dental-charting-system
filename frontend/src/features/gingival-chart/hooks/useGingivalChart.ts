import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { notify } from "@/components/feedback/notify";
import { queryKeys } from "@/services/query-client";
import { ApiError } from "@/types/api.types";

import { gingivalChartService } from "../services/gingival-chart.service";
import type {
  GingivalChart,
  GingivalChartUpdate,
} from "../types/gingival-chart.types";

export function useGingivalChart(patientId: string) {
  return useQuery({
    queryKey: queryKeys.gingivalChart(patientId),
    queryFn: () => gingivalChartService.get(patientId),
    enabled: Boolean(patientId),
  });
}

export function useSaveGingivalChart(patientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: GingivalChartUpdate) =>
      gingivalChartService.save(patientId, body),
    onSuccess: (chart: GingivalChart) => {
      qc.setQueryData(queryKeys.gingivalChart(patientId), chart);
      notify.success("Periodontal chart saved");
    },
    onError: (error) =>
      notify.error(error instanceof ApiError ? error.message : "Save failed"),
  });
}
