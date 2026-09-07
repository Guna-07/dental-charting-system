import { QueryClient } from "@tanstack/react-query";

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}

/** Central registry of query keys so invalidation stays consistent. */
export const queryKeys = {
  patients: (search?: string, page?: number) =>
    ["patients", { search: search ?? "", page: page ?? 1 }] as const,
  patient: (patientId: string) => ["patient", patientId] as const,
  dentalChart: (patientId: string) => ["dental-chart", patientId] as const,
  surfaceChart: (patientId: string) => ["surface-chart", patientId] as const,
  gingivalChart: (patientId: string) => ["gingival-chart", patientId] as const,
};
