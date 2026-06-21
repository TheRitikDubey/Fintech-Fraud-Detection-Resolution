import type {
  AlertDTO,
  AlertStatus,
  CustomerSummaryDTO,
  Paginated,
  Severity,
  TransactionDTO,
  TransactionDetailDTO,
} from "./types";

// Configurable via VITE_API_BASE_URL; defaults to the api PORT in api/.env.
const env = import.meta.env as unknown as { VITE_API_BASE_URL?: string };
const BASE_URL = env.VITE_API_BASE_URL ?? "http://localhost:9529";

export class ApiError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type QueryValue = string | number | undefined;

async function getJSON<T>(path: string, params?: Record<string, QueryValue>): Promise<T> {
  const url = new URL(path, BASE_URL);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  const res = await fetch(url.toString(), { headers: { Accept: "application/json" } });
  if (!res.ok) {
    const message = await res.text().catch(() => res.statusText);
    throw new ApiError(res.status, message);
  }
  return (await res.json()) as T;
}

// Type aliases (not interfaces) so they satisfy the Record<string, QueryValue> index signature.
export type TransactionListParams = {
  customerId?: string;
  from?: string;
  to?: string;
  cursor?: string;
  limit?: number;
};

export type AlertListParams = {
  status?: AlertStatus;
  risk?: Severity;
  cursor?: string;
  limit?: number;
};

export const api = {
  listTransactions: (params: TransactionListParams = {}) =>
    getJSON<Paginated<TransactionDTO>>("/api/transactions", params),

  listCustomerTransactions: (
    customerId: string,
    params: Omit<TransactionListParams, "customerId"> = {},
  ) => getJSON<Paginated<TransactionDTO>>(`/api/customer/${customerId}/transactions`, params),

  getTransaction: (id: string) => getJSON<TransactionDetailDTO>(`/api/transaction/${id}`),

  listAlerts: (params: AlertListParams = {}) => getJSON<Paginated<AlertDTO>>("/api/alerts", params),

  getCustomerSummary: (id: string) => getJSON<CustomerSummaryDTO>(`/api/customer/${id}/summary`),
};
