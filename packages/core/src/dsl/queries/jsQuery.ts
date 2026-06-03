export interface JsQueryOptions {
  /**
   * Código JavaScript a ejecutar. Debe terminar con `return <value>`.
   * Puede usar `await fetch(...)`, acceder a otras queries (e.g. `await otherQuery.run()`),
   * y leer/escribir tempStates.
   */
  script: string;
  triggerType?: "automatic" | "manual" | "onPageLoad";
  timeout?: number;
}

export function jsQueryDSL(opts: JsQueryOptions): Record<string, unknown> {
  return {
    script: opts.script,
  };
}

// ─── Helpers para generar scripts comunes ─────────────────────────────────────

/**
 * Genera un script JS query que hace fetch a una URL pública y devuelve el JSON.
 * Útil cuando no hay un datasource REST configurado en la instancia.
 *
 * IMPORTANTE: Lowcoder envuelve el script en `function(){...}` NO-async, así que
 * no podemos usar `await` a nivel superior. Devolvemos una Promise directamente
 * (Lowcoder espera Promises retornadas en queries JS).
 */
export function jsFetchScript(opts: {
  url: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
}): string {
  const { url, method = "GET", headers = {}, body } = opts;
  const hasBody = body !== undefined && method !== "GET";
  const headerLines = Object.entries({ "Content-Type": "application/json", ...headers })
    .map(([k, v]) => `    ${JSON.stringify(k)}: ${JSON.stringify(v)}`)
    .join(",\n");
  return `return fetch(${JSON.stringify(url)}, {
  method: ${JSON.stringify(method)},
  headers: {
${headerLines}
  }${hasBody ? `,
  body: JSON.stringify(${JSON.stringify(body)})` : ""}
}).then(function(res) {
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
});`;
}
