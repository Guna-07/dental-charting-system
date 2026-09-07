import { apiClient } from "@/services/api-client";
import { endpoints } from "@/services/endpoints";

import type {
  DentalChart,
  ToothInvestigationInput,
} from "../types/dental-chart.types";

export const dentalChartService = {
  get(patientId: string): Promise<DentalChart> {
    return apiClient.get<DentalChart>(endpoints.dentalChart.root(patientId));
  },

  upsertTooth(
    patientId: string,
    toothNumber: string,
    body: ToothInvestigationInput,
  ): Promise<DentalChart> {
    return apiClient.put<DentalChart>(
      endpoints.dentalChart.tooth(patientId, toothNumber),
      body,
    );
  },

  clearTooth(patientId: string, toothNumber: string): Promise<DentalChart> {
    return apiClient.delete<DentalChart>(
      endpoints.dentalChart.tooth(patientId, toothNumber),
    );
  },
};
