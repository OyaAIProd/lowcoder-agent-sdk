export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type BodyType =
  | "none"
  | "application/json"
  | "text/plain"
  | "application/x-www-form-urlencoded"
  | "multipart/form-data";

export interface RestApiQueryOptions {
  url: string;
  method?: HttpMethod;
  headers?: Record<string, string>;
  params?: Record<string, string>;
  body?: string | Record<string, unknown>;
  bodyType?: "json" | "raw" | "form" | "urlencoded" | "none" | BodyType;
  triggerType?: "automatic" | "manual" | "onPageLoad";
  datasourceId?: string;
  timeout?: number;
}

// Mapeo de aliases amigables al valor real del DSL
function resolveBodyType(t: RestApiQueryOptions["bodyType"]): BodyType {
  if (!t) return "none";
  switch (t) {
    case "json": return "application/json";
    case "raw": return "text/plain";
    case "form": return "multipart/form-data";
    case "urlencoded": return "application/x-www-form-urlencoded";
    default: return t as BodyType;
  }
}

export function restApiQueryDSL(opts: RestApiQueryOptions): Record<string, unknown> {
  const headers = Object.entries(opts.headers ?? {}).map(([key, value]) => ({ key, value }));
  const params = Object.entries(opts.params ?? {}).map(([key, value]) => ({ key, value }));

  let bodyType = resolveBodyType(opts.bodyType);
  // Si no se especifica bodyType pero hay body en POST/PUT/PATCH, auto-detect json
  const method = opts.method ?? "GET";
  const writable = method === "POST" || method === "PUT" || method === "PATCH";
  if (!opts.bodyType && opts.body !== undefined && writable) {
    bodyType = "application/json";
  }

  let body: string = "";
  if (opts.body !== undefined && bodyType !== "none") {
    body = typeof opts.body === "object" ? JSON.stringify(opts.body, null, 2) : String(opts.body);
  }

  return {
    httpMethod: method,
    path: opts.url,
    headers,
    params,
    bodyType,
    body,
    bodyFormData: [{ key: "", value: "", type: "text" }],
  };
}
