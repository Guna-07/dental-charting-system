import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/services/query-client";

import { patientService } from "../services/patient.service";
import type { PatientListParams } from "../types/patient.types";

export function usePatients(params: PatientListParams) {
  return useQuery({
    queryKey: queryKeys.patients(params.search, params.page),
    queryFn: () => patientService.list(params),
    placeholderData: keepPreviousData,
  });
}

export function usePatient(patientId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.patient(patientId ?? "unknown"),
    queryFn: () => patientService.get(patientId as string),
    enabled: Boolean(patientId),
  });
}
