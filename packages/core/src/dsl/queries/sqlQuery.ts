export interface SqlQueryOptions {
  sql: string;
  datasourceId: string;
  triggerType?: "automatic" | "manual" | "onPageLoad";
  timeout?: number;
}

export function sqlQueryDSL(opts: SqlQueryOptions): Record<string, unknown> {
  return {
    sql: opts.sql,
  };
}
