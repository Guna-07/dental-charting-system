/**
 * Centralised HTTP client.
 *
 * Every feature service calls through here. Responsibilities:
 *  - base URL + JSON defaults
 *  - unwrap the `{ success, data, message }` envelope so callers get `data`
 *  - normalise every failure (transport or `success: false`) into `ApiError`
 */

import axios, { AxiosError, type AxiosInstance } from "axios";

import { env } from "@/app/config/env";
import { ApiError, type ApiEnvelope } from "@/types/api.types";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: env.API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

function toApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    const body = error.response?.data as
      | { message?: string; error_code?: string; details?: unknown[] }
      | undefined;
    return new ApiError(body?.message ?? error.message ?? "Request failed", {
      errorCode: body?.error_code,
      details: body?.details,
      status: error.response?.status,
    });
  }
  return new ApiError("Unexpected error");
}

async function request<T>(
  fn: (client: AxiosInstance) => Promise<{ data: ApiEnvelope<T> }>,
): Promise<T> {
  try {
    const response = await fn(axiosInstance);
    return response.data.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export const apiClient = {
  get: <T>(url: string, params?: Record<string, unknown>) =>
    request<T>((c) => c.get(url, { params })),
  post: <T>(url: string, body?: unknown) => request<T>((c) => c.post(url, body)),
  put: <T>(url: string, body?: unknown) => request<T>((c) => c.put(url, body)),
  patch: <T>(url: string, body?: unknown) => request<T>((c) => c.patch(url, body)),
  delete: <T>(url: string) => request<T>((c) => c.delete(url)),
};
