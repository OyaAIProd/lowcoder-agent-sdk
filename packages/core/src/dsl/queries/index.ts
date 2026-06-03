export * from "./restApiQuery.js";
export * from "./jsQuery.js";
export * from "./sqlQuery.js";

import type { ResourceType } from "../types.js";
import { restApiQueryDSL, type RestApiQueryOptions } from "./restApiQuery.js";
import { jsQueryDSL, type JsQueryOptions } from "./jsQuery.js";
import { sqlQueryDSL, type SqlQueryOptions } from "./sqlQuery.js";

export type AnyQueryOptions =
  | (RestApiQueryOptions & { type: "restApi" })
  | (JsQueryOptions & { type: "js" })
  | (SqlQueryOptions & { type: "mysql" | "postgres" | "mssql" | "oracle" | "snowflake" });

type DslFn = (opts: Record<string, unknown>) => Record<string, unknown>;

export const QUERY_DSL_MAP: Partial<Record<ResourceType, DslFn>> = {
  restApi: restApiQueryDSL as unknown as DslFn,
  js: jsQueryDSL as unknown as DslFn,
  mysql: sqlQueryDSL as unknown as DslFn,
  postgres: sqlQueryDSL as unknown as DslFn,
  mssql: sqlQueryDSL as unknown as DslFn,
  oracle: sqlQueryDSL as unknown as DslFn,
  snowflake: sqlQueryDSL as unknown as DslFn,
};
