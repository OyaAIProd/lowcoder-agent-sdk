/**
 * Helpers fluidos para construir requests `UpsertDatasourceRequest`
 * sin tener que recordar los nombres exactos de cada `datasourceConfig`.
 *
 * Uso:
 *   const ds = datasource("Prod DB")
 *     .postgres({ host: "...", database: "...", username: "u", password: "p" })
 *     .inOrg(orgId)
 *     .build();
 *   await client.createDatasource(ds);
 */
import type {
  DatasourceType,
  EsDatasourceConfig,
  GoogleSheetsDatasourceConfig,
  GraphQLDatasourceConfig,
  JsPluginDatasourceConfig,
  MongoDatasourceConfig,
  OracleDatasourceConfig,
  RedisDatasourceConfig,
  RestApiDatasourceConfig,
  SmtpDatasourceConfig,
  SqlDatasourceConfig,
  UpsertDatasourceRequest,
} from "./types.js";

export class DatasourceBuilder {
  private readonly name: string;
  private orgId?: string;
  private id?: string;
  private gid?: string;
  private type?: DatasourceType;
  private config?: Record<string, unknown>;

  constructor(name: string) {
    if (!name) throw new Error("Datasource name required");
    this.name = name;
  }

  inOrg(organizationId: string): this {
    this.orgId = organizationId;
    return this;
  }

  withId(id: string): this {
    this.id = id;
    return this;
  }

  withGid(gid: string): this {
    this.gid = gid;
    return this;
  }

  // ─── SQL family ──────────────────────────────────────────────────────────

  postgres(cfg: SqlDatasourceConfig): this {
    this.type = "postgres";
    this.config = { port: 5432, ...cfg };
    return this;
  }

  mysql(cfg: SqlDatasourceConfig): this {
    this.type = "mysql";
    this.config = { port: 3306, ...cfg };
    return this;
  }

  mariadb(cfg: SqlDatasourceConfig): this {
    this.type = "mariadb";
    this.config = { port: 3306, ...cfg };
    return this;
  }

  mssql(cfg: SqlDatasourceConfig): this {
    this.type = "mssql";
    this.config = { port: 1433, ...cfg };
    return this;
  }

  oracle(cfg: OracleDatasourceConfig): this {
    if (!cfg.sid && !cfg.serviceName && !cfg.jdbcUrl) {
      throw new Error("Oracle: must specify one of sid, serviceName, or jdbcUrl");
    }
    this.type = "oracle";
    this.config = { port: 1521, ...cfg };
    return this;
  }

  clickHouse(cfg: SqlDatasourceConfig): this {
    this.type = "clickHouse";
    this.config = { port: 8123, ...cfg };
    return this;
  }

  snowflake(cfg: SqlDatasourceConfig & { warehouse?: string; schema?: string; role?: string }): this {
    this.type = "snowflake";
    const { warehouse, schema, role, ...rest } = cfg;
    const extParams = { ...(rest.extParams ?? {}), ...(warehouse ? { warehouse } : {}), ...(schema ? { schema } : {}), ...(role ? { role } : {}) };
    this.config = { ...rest, extParams };
    return this;
  }

  // ─── NoSQL ────────────────────────────────────────────────────────────────

  mongodb(cfg: MongoDatasourceConfig): this {
    this.type = "mongodb";
    this.config = { authMechanism: "SCRAM_SHA_1", ...cfg };
    return this;
  }

  redis(cfg: RedisDatasourceConfig): this {
    this.type = "redis";
    this.config = { port: 6379, ...cfg };
    return this;
  }

  // ─── Search ───────────────────────────────────────────────────────────────

  elasticsearch(cfg: EsDatasourceConfig): this {
    this.type = "es";
    this.config = cfg as unknown as Record<string, unknown>;
    return this;
  }

  // ─── Mail ─────────────────────────────────────────────────────────────────

  smtp(cfg: SmtpDatasourceConfig): this {
    this.type = "smtp";
    this.config = cfg.port ? { ...cfg } : { ...cfg, port: 587 };
    return this;
  }

  // ─── HTTP ─────────────────────────────────────────────────────────────────

  restApi(cfg: RestApiDatasourceConfig): this {
    this.type = "restApi";
    this.config = { authConfig: { type: "NO_AUTH" }, ...cfg };
    return this;
  }

  graphql(cfg: GraphQLDatasourceConfig): this {
    this.type = "graphql";
    this.config = { authConfig: { type: "NO_AUTH" }, ...cfg };
    return this;
  }

  // ─── SaaS ─────────────────────────────────────────────────────────────────

  googleSheets(cfg: GoogleSheetsDatasourceConfig): this {
    this.type = "googleSheets";
    this.config = cfg as unknown as Record<string, unknown>;
    return this;
  }

  // ─── JS plugins (cualquiera) ──────────────────────────────────────────────

  /**
   * Configurar un datasource de cualquier plugin JS del node-service:
   * s3, slack, jira, openAi, stripe, shopify, etc.
   *
   * El shape exacto de `cfg` depende del plugin — usa `client.listJsPlugins`
   * para descubrir los campos esperados.
   */
  jsPlugin(pluginId: string, cfg: JsPluginDatasourceConfig): this {
    this.type = pluginId;
    this.config = cfg;
    return this;
  }

  // ─── Output ───────────────────────────────────────────────────────────────

  build(): UpsertDatasourceRequest {
    if (!this.type) throw new Error("Tipo de datasource no especificado. Usa .postgres(), .mysql(), .restApi(), etc.");
    if (!this.config) throw new Error("Config no especificada");
    if (!this.orgId) throw new Error("orgId no especificado. Llama .inOrg(orgId) o pásalo a deploy");
    return {
      name: this.name,
      type: this.type,
      organizationId: this.orgId,
      datasourceConfig: this.config as never,
      ...(this.id ? { id: this.id } : {}),
      ...(this.gid ? { gid: this.gid } : {}),
    };
  }
}

/** Factory shortcut: `datasource("My DB").postgres({...}).inOrg(orgId).build()`. */
export function datasource(name: string): DatasourceBuilder {
  return new DatasourceBuilder(name);
}
