import { apiClient } from "@/services/api-client";
import { endpoints } from "@/services/endpoints";

import type {
  SurfaceChart,
  ToothSurfaceUpdate,
} from "../types/surface-chart.types";

export const surfaceChartService = {
  get(patientId: string): Promise<SurfaceChart> {
    return apiClient.get<SurfaceChart>(endpoints.surfaceChart.root(patientId));
  },

  updateTooth(
    patientId: string,
    toothNumber: string,
    body: ToothSurfaceUpdate,
  ): Promise<SurfaceChart> {
    return apiClient.put<SurfaceChart>(
      endpoints.surfaceChart.tooth(patientId, toothNumber),
      body,
    );
  },
};
