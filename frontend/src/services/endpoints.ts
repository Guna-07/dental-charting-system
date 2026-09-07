/** Single source of truth for backend URL paths (relative to API_BASE_URL). */

export const endpoints = {
  patients: {
    root: "/patients",
    byId: (patientId: string) => `/patients/${patientId}`,
  },
  dentalChart: {
    root: (patientId: string) => `/patients/${patientId}/dental-chart`,
    tooth: (patientId: string, toothNumber: string) =>
      `/patients/${patientId}/dental-chart/teeth/${toothNumber}`,
  },
  surfaceChart: {
    root: (patientId: string) => `/patients/${patientId}/surface-chart`,
    tooth: (patientId: string, toothNumber: string) =>
      `/patients/${patientId}/surface-chart/teeth/${toothNumber}`,
  },
  gingivalChart: {
    root: (patientId: string) => `/patients/${patientId}/gingival-chart`,
    tooth: (patientId: string, toothNumber: string) =>
      `/patients/${patientId}/gingival-chart/teeth/${toothNumber}`,
  },
} as const;
