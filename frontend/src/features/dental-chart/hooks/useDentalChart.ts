import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { notify } from "@/components/feedback/notify";
import { queryKeys } from "@/services/query-client";
import { ApiError } from "@/types/api.types";

import { dentalChartService } from "../services/dental-chart.service";
import type {
  DentalChart,
  ToothInvestigationInput,
} from "../types/dental-chart.types";

export function useDentalChart(patientId: string) {
  return useQuery({
    queryKey: queryKeys.dentalChart(patientId),
    queryFn: () => dentalChartService.get(patientId),
    enabled: Boolean(patientId),
  });
}

export function useUpsertTooth(patientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { toothNumber: string; input: ToothInvestigationInput }) =>
      dentalChartService.upsertTooth(patientId, vars.toothNumber, vars.input),
    onSuccess: (chart: DentalChart) => {
      qc.setQueryData(queryKeys.dentalChart(patientId), chart);
      notify.success("Tooth findings saved");
    },
    onError: (error) =>
      notify.error(error instanceof ApiError ? error.message : "Save failed"),
  });
}

export function useClearTooth(patientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (toothNumber: string) =>
      dentalChartService.clearTooth(patientId, toothNumber),
    onSuccess: (chart: DentalChart) => {
      qc.setQueryData(queryKeys.dentalChart(patientId), chart);
      notify.success("Tooth cleared");
    },
    onError: (error) =>
      notify.error(error instanceof ApiError ? error.message : "Clear failed"),
  });
}
