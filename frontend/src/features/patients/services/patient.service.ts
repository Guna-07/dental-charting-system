import { apiClient } from "@/services/api-client";
import { endpoints } from "@/services/endpoints";

import type {
  Patient,
  PatientListParams,
  PatientListResponse,
} from "../types/patient.types";

export const patientService = {
  list(params: PatientListParams): Promise<PatientListResponse> {
    return apiClient.get<PatientListResponse>(endpoints.patients.root, {
      search: params.search || undefined,
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    });
  },

  get(patientId: string): Promise<Patient> {
    return apiClient.get<Patient>(endpoints.patients.byId(patientId));
  },

  create(body: unknown): Promise<Patient> {
    return apiClient.post<Patient>(endpoints.patients.root, body);
  },

  update(patientId: string, body: unknown): Promise<Patient> {
    return apiClient.put<Patient>(endpoints.patients.byId(patientId), body);
  },

  remove(patientId: string): Promise<null> {
    return apiClient.delete<null>(endpoints.patients.byId(patientId));
  },
};
