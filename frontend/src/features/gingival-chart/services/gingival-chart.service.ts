import { apiClient } from "@/services/api-client";
import { endpoints } from "@/services/endpoints";

import type {
  GingivalChart,
  GingivalChartUpdate,
} from "../types/gingival-chart.types";

export const gingivalChartService = {
  get(patientId: string): Promise<GingivalChart> {
    return apiClient.get<GingivalChart>(endpoints.gingivalChart.root(patientId));
  },

  save(patientId: string, body: GingivalChartUpdate): Promise<GingivalChart> {
    return apiClient.put<GingivalChart>(
      endpoints.gingivalChart.root(patientId),
      body,
    );
  },
};
