export class ApiClientError extends Error {
  status: number;
  code?: string;
  data?: unknown;

  constructor(message: string, status: number, code?: string, data?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

export async function apiFetch<T>(
  input: string | URL | Request,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(input, init);

  if (!res.ok) {
    const json = await res.json().catch(() => null);
    const errorMessage = json?.error || res.statusText || `HTTP Error ${res.status}`;
    throw new ApiClientError(errorMessage, res.status, json?.code, json);
  }

  return (await res.json()) as T;
}
