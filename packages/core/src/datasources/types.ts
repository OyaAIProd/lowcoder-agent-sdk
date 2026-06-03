/**
 * Tipos para gestión de datasources.
 *
 * Confirmado contra el código fuente Java de Lowcoder:
 * - server/api-service/lowcoder-server/.../UpsertDatasourceRequest.java
 * - server/api-service/lowcoder-sdk/.../plugin/{mysql,restapi,graphql,...}/*DatasourceConfig.java
 *
 * Doc oficial:
 * https://docs.lowcoder.cloud/lowcoder-documentation/connect-your-data/data-source-basics
 */

/** Tipos de datasource soportados por Lowcoder. */
export type DatasourceType =
  // SQL family (Java plugins)
  | "mysql"
  | "mariadb"
  | "postgres"
  | "mssql"
  | "oracle"
  | "clickHouse"
  | "snowflake"
  // NoSQL / search / cache
  | "mongodb"
  | "redis"
  | "es"
  // Mail
  | "smtp"
  // HTTP
  | "restApi"
  | "graphql"
  // SaaS
  | "googleSheets"
  // Cualquier otro plugin JS del node-service:
  // dynamodb, couchdb, duckdb, fauna, turso, firebirdsql, athena, bigQuery,
  // openAi, huggingFaceEndpoint, huggingFaceInference, did, appconfig, datadog,
  // circleCi, openApi, postmanEcho, lowcoder, github, gitlab, lambda, firebase,
  // supabaseApi, n8n, boomi, twilio, sendGrid, oneSignal, s3, googleCloudStorage,
  // supabase, cloudinary, aliyunOss, asana, jira, notion, slack, apiTemplate,
  // carboneIo, front, stripe, shopify, woocommerce, serpApi, eodhdApi, uiPath, ...
  | (string & {});

/** Status interno del datasource (soft-delete). */
export type DatasourceStatus = "NORMAL" | "DELETED";

/** Una entrada key/value usada en headers, params, body form-data. */
export interface KeyValueEntry {
  key: string;
  value: string;
  /** Solo en bodyFormData: `"text" | "file"` */
  type?: "text" | "file";
}

// ─── Config bases ───────────────────────────────────────────────────────────

/** Config base para todos los SQL (mysql, mariadb, postgres, mssql, clickHouse, snowflake) */
export interface SqlDatasourceConfig {
  host: string;
  port?: number;
  database?: string;
  username?: string;
  /** Si omites en update, se preserva el anterior. */
  password?: string;
  usingSsl?: boolean;
  serverTimezone?: string;
  isReadonly?: boolean;
  enableTurnOffPreparedStatement?: boolean;
  /** Parámetros extra inyectados al driver JDBC (sslmode, ApplicationName, etc.) */
  extParams?: Record<string, string>;
}

/** Oracle requiere sid o serviceName, o jdbcUrl. */
export interface OracleDatasourceConfig {
  host: string;
  port?: number;
  username?: string;
  password?: string;
  /** SID (formato `jdbc:oracle:thin:@host:port:sid`). Mutuamente exclusivo con serviceName. */
  sid?: string;
  /** Service name (formato `jdbc:oracle:thin:@//host:port/serviceName`). Toma precedencia si ambos están vacíos. */
  serviceName?: string;
  /** Si se especifica, sobrescribe todo lo demás. */
  jdbcUrl?: string;
  enableTurnOffPreparedStatement?: boolean;
  isReadonly?: boolean;
  extParams?: Record<string, string>;
}

export interface MongoEndpoint {
  host: string;
  port: number;
}
export type MongoAuthMechanism =
  | "SCRAM_SHA_1"
  | "SCRAM_SHA_256"
  | "MONGODB_CR"
  | "MONGODB_X509"
  | "GSSAPI"
  | "PLAIN";

export interface MongoDatasourceConfig {
  /** Si true, solo se usa `uri` y se ignora todo lo demás. */
  usingUri?: boolean;
  /** Connection string completa (incluye creds). Si la usas omite los demás campos. */
  uri?: string;
  srvMode?: boolean;
  ssl?: boolean;
  /** Para conexión simple (1 nodo). */
  host?: string;
  port?: number;
  /** Para replica sets. */
  endpoints?: MongoEndpoint[];
  database?: string;
  username?: string;
  password?: string;
  authMechanism?: MongoAuthMechanism;
}

export interface RedisDatasourceConfig {
  usingUri?: boolean;
  uri?: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  usingSsl?: boolean;
}

export interface EsDatasourceConfig {
  /** Comma-separated, ej: `"https://es-1:9200,https://es-2:9200"`. */
  connectionString: string;
  username?: string;
  password?: string;
  usingSsl?: boolean;
}

export interface SmtpDatasourceConfig {
  host: string;
  port: number;
  username?: string;
  password?: string;
}

export interface GoogleSheetsDatasourceConfig {
  /** JSON-stringified service account key (descargado de Google Cloud Console). */
  serviceAccount: string;
}

// ─── REST API / GraphQL ──────────────────────────────────────────────────────

export type RestApiAuthType =
  | "NO_AUTH"
  | "BASIC_AUTH"
  | "DIGEST_AUTH"
  | "BEARER_TOKEN_AUTH"
  | "OAUTH2"
  | "OAUTH2_INHERIT_FROM_LOGIN";

export type RestApiAuthConfig =
  | { type: "NO_AUTH" }
  | { type: "BASIC_AUTH" | "DIGEST_AUTH"; username: string; password: string }
  | { type: "BEARER_TOKEN_AUTH"; /* no subtype implementado en OSS */ }
  | { type: "OAUTH2"; /* no subtype implementado en OSS */ }
  | { type: "OAUTH2_INHERIT_FROM_LOGIN"; authId: string };

export type SslCertVerificationType =
  | "VERIFY_CA_CERT"
  | "VERIFY_SELF_SIGNED_CERT"
  | "DISABLED";

export interface SslConfig {
  sslCertVerificationType: SslCertVerificationType;
  /** PEM string, solo si `sslCertVerificationType === "VERIFY_SELF_SIGNED_CERT"`. */
  selfSignedCert?: string;
}

export interface RestApiDatasourceConfig {
  url: string;
  headers?: KeyValueEntry[];
  params?: KeyValueEntry[];
  body?: string;
  bodyFormData?: KeyValueEntry[];
  forwardCookies?: string[];
  forwardAllCookies?: boolean;
  authConfig?: RestApiAuthConfig;
  sslConfig?: SslConfig;
}

export interface GraphQLDatasourceConfig {
  url: string;
  headers?: KeyValueEntry[];
  params?: KeyValueEntry[];
  body?: string;
  bodyFormData?: KeyValueEntry[];
  forwardCookies?: string[];
  forwardAllCookies?: boolean;
  authConfig?: RestApiAuthConfig;
}

// ─── JS plugins (node-service) ───────────────────────────────────────────────

/**
 * Config para datasources servidos por el node-service (s3, slack, jira, openAi, etc).
 * El shape exacto depende del plugin — usa `listJsPlugins({ appId })` y mira
 * `pluginDefinition.dataSourceConfig.params[]` para descubrir los campos esperados.
 */
export type JsPluginDatasourceConfig = Record<string, unknown> & {
  extra?: Record<string, unknown>;
  dynamicParamsConfig?: Record<string, unknown>;
  dynamicParamsDef?: unknown[];
  /** Si el plugin soporta OAuth inherit-from-login */
  authConfig?: {
    type: "OAUTH2_INHERIT_FROM_LOGIN";
    authId: string;
  };
};

// ─── Union de todas las configs ──────────────────────────────────────────────

export type DatasourceConfig =
  | SqlDatasourceConfig
  | OracleDatasourceConfig
  | MongoDatasourceConfig
  | RedisDatasourceConfig
  | EsDatasourceConfig
  | SmtpDatasourceConfig
  | GoogleSheetsDatasourceConfig
  | RestApiDatasourceConfig
  | GraphQLDatasourceConfig
  | JsPluginDatasourceConfig;

// ─── Requests / Responses de la API ──────────────────────────────────────────

export interface UpsertDatasourceRequest {
  /** Opcional en create. Server-generated. */
  id?: string;
  /** Public ID alternativo. */
  gid?: string;
  /** Obligatorio. */
  name: string;
  /** Obligatorio. Ver `DatasourceType`. */
  type: DatasourceType;
  /** Obligatorio. */
  organizationId: string;
  status?: DatasourceStatus;
  datasourceConfig: DatasourceConfig;
}

export interface Datasource {
  id: string;
  gid?: string;
  name: string;
  type: DatasourceType;
  organizationId: string;
  creationSource: 0 | 1 | 2 | 3;
  datasourceStatus: DatasourceStatus;
  createTime: number;
  datasourceConfig: DatasourceConfig;
  pluginDefinition?: DataSourcePluginMeta;
}

/** View que incluye metadata de edición */
export interface DatasourceView {
  datasource: Datasource;
  edit: boolean;
  creatorName?: string;
}

/** Estructura de tablas/columnas devuelta por GET /api/datasources/{id}/structure */
export interface DatasourceStructure {
  tables: Array<{
    type: "TABLE" | "VIEW" | "ALIAS" | "COLLECTION";
    schema?: string;
    name: string;
    columns: Array<{
      name: string;
      type: string;
      defaultValue?: string | null;
      isAutogenerated?: boolean;
    }>;
    keys: Array<
      | { type: "primary key"; name: string; columnNames: string[] }
      | { type: "foreign key"; name: string; fromColumns: string[]; toColumns: string[] }
    >;
  }>;
}

// ─── Plugin meta (para JS plugins) ───────────────────────────────────────────

export interface DataSourcePluginParam {
  type:
    | "textInput"
    | "numberInput"
    | "select"
    | "password"
    | "switch"
    | "file"
    | "json"
    | "groupTitle"
    | (string & {});
  key: string;
  label: string;
  tooltip?: string;
  placeholder?: string;
  defaultValue?: unknown;
  options?: Array<{ value: string; label: string }>;
  rules?: Array<{ required?: boolean; pattern?: string; message?: string }>;
}

export interface DataSourcePluginMeta {
  id: string;
  name: string;
  category?: string;
  icon?: string;
  description?: string;
  shortDescription?: string;
  version?: string;
  dataSourceConfig?: {
    type: string;
    params: DataSourcePluginParam[];
    extra?: unknown;
  };
  queryConfig?: unknown;
}

// ─── Permissions ─────────────────────────────────────────────────────────────

export type DatasourcePermissionRole = "viewer" | "editor" | "owner";

export interface DatasourcePermission {
  permissionId: string;
  role: DatasourcePermissionRole;
  type: "User" | "Group";
  /** ID del usuario o grupo según `type`. */
  targetId: string;
  /** Display name para UI. */
  name?: string;
  avatar?: string;
}

export interface DatasourcePermissionsView {
  orgName: string;
  groupPermissions: DatasourcePermission[];
  userPermissions: DatasourcePermission[];
  creatorId: string;
}

export interface BatchAddPermissionRequest {
  role: DatasourcePermissionRole;
  userIds?: string[];
  groupIds?: string[];
}

// ─── Paginación ──────────────────────────────────────────────────────────────

export interface PageResponse<T> {
  data: T[];
  total: number;
  pageNum: number;
  pageSize: number;
}

// ─── Listado/filtros ─────────────────────────────────────────────────────────

export interface ListDatasourcesOptions {
  orgId: string;
  name?: string;
  type?: DatasourceType;
  pageNum?: number;
  /** 0 = sin paginar (devuelve todos). */
  pageSize?: number;
}

// ─── IDs especiales (system static) ──────────────────────────────────────────

/**
 * IDs de datasources "system static" — existen solo en memoria del api-service,
 * no en MongoDB. Acepta queries pero no se pueden crear/modificar/eliminar.
 */
export const SYSTEM_STATIC_DATASOURCE_IDS = {
  JS_CODE: "#JS_CODE",
  QUICK_REST_API: "#QUICK_REST_API",
  QUICK_GRAPHQL: "#QUICK_GRAPHQL",
} as const;

export function isSystemStaticDatasourceId(id: string): boolean {
  return id.startsWith("#");
}
