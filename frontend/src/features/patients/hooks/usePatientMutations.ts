import { useMutation, useQueryClient } from "@tanstack/react-query";

import { notify } from "@/components/feedback/notify";
import { ApiError } from "@/types/api.types";

import { patientService } from "../services/patient.service";
import type { Patient } from "../types/patient.types";

function reportError(error: unknown) {
  notify.error(error instanceof ApiError ? error.message : "Request failed");
}

export function useCreatePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => patientService.create(body),
    onSuccess: (patient: Patient) => {
      qc.invalidateQueries({ queryKey: ["patients"] });
      notify.success(`Patient ${patient.patient_id} created`);
    },
    onError: reportError,
  });
}

export function useUpdatePatient(patientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => patientService.update(patientId, body),
    onSuccess: (patient: Patient) => {
      qc.setQueryData(["patient", patientId], patient);
      qc.invalidateQueries({ queryKey: ["patients"] });
      notify.success("Patient updated");
    },
    onError: reportError,
  });
}

export function useDeletePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patientId: string) => patientService.remove(patientId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patients"] });
      notify.success("Patient deleted");
    },
    onError: reportError,
  });
}
