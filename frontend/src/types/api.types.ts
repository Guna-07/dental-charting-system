/** Shapes shared with the backend response envelope. */

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  error_code: string;
  details: unknown[];
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface Paginated<T> {
  items: T[];
  meta: PageMeta;
}

/** Normalised error thrown by the API client. */
export class ApiError extends Error {
  readonly errorCode: string;
  readonly details: unknown[];
  readonly status: number;

  constructor(
    message: string,
    options: { errorCode?: string; details?: unknown[]; status?: number } = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.errorCode = options.errorCode ?? "UNKNOWN";
    this.details = options.details ?? [];
    this.status = options.status ?? 0;
  }
}
