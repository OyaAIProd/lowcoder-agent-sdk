import type {
  ApplicationMeta,
  ApplicationView,
  CreateAppRequest,
  CurrentUserResponse,
  LowcoderDSL,
  OrgInfo,
} from "./dsl/types.js";
import type {
  BatchAddPermissionRequest,
  Datasource,
  DatasourcePermissionRole,
  DatasourcePermissionsView,
  DatasourceStructure,
  DatasourceType,
  DatasourceView,
  ListDatasourcesOptions,
  PageResponse,
  UpsertDatasourceRequest,
} from "./datasources/types.js";

export interface LowcoderClientConfig {
  baseUrl: string;
  apiKey?: string;
  email?: string;
  password?: string;
}

interface ApiResponse<T = unknown> {
  code: number;
  message?: string;
  data: T;
}

export class LowcoderClient {
  private config: LowcoderClientConfig;
  private token?: string;

  constructor(config: LowcoderClientConfig) {
    this.config = {
      ...config,
      baseUrl: config.baseUrl.replace(/\/$/, ""),
    };
    if (config.apiKey) {
      this.token = config.apiKey;
    }
  }

  async authenticate(): Promise<void> {
    if (this.token) return;
    if (!this.config.email || !this.config.password) {
      throw new Error("Se requiere apiKey o email+password para autenticar");
    }
    const res = await this.post<{ token: string }>("/api/v1/auth/login", {
      loginId: this.config.email,
      password: this.config.password,
      loginType: "EMAIL",
      register: false,
    });
    this.token = res.token;
  }

  /**
   * Obtiene el usuario actualmente autenticado, junto con TODAS las organizaciones
   * a las que pertenece y la `currentOrgId` (workspace activo seleccionado en la UI).
   *
   * **Caso de uso principal:** descubrir tu `orgId` cuando no lo sabes.
   * El campo `currentOrgId` es exactamente el que necesitas para `createApp`.
   */
  async getCurrentUser(): Promise<CurrentUserResponse> {
    await this.authenticate();
    return this.get<CurrentUserResponse>("/api/v1/users/me");
  }

  /**
   * Atajo: devuelve solo la lista de organizaciones del usuario, ordenadas
   * con la `currentOrgId` primero.
   *
   * @example
   *   const orgs = await client.listMyOrgs();
   *   console.log("Tu orgId actual:", orgs[0].id);
   */
  async listMyOrgs(): Promise<Array<OrgInfo & { role: string; isCurrent: boolean }>> {
    const me = await this.getCurrentUser();
    return me.orgAndRoles.map((entry) => ({
      ...entry.org,
      role: entry.role,
      isCurrent: entry.org.id === me.currentOrgId,
    })).sort((a, b) => Number(b.isCurrent) - Number(a.isCurrent));
  }

  /** Atajo aún más simple: solo devuelve el orgId activo */
  async getCurrentOrgId(): Promise<string> {
    const me = await this.getCurrentUser();
    return me.currentOrgId;
  }

  async createApp(req: CreateAppRequest): Promise<ApplicationView> {
    await this.authenticate();
    return this.post<ApplicationView>("/api/v1/applications", {
      orgId: req.orgId,
      name: req.name,
      applicationType: req.applicationType,
      editingApplicationDSL: req.editingApplicationDSL,
      ...(req.folderId ? { folderId: req.folderId } : {}),
      ...(req.publicToAll !== undefined ? { publicToAll: req.publicToAll } : {}),
    });
  }

  async updateApp(
    appId: string,
    dsl: LowcoderDSL,
    opts?: { publish?: boolean }
  ): Promise<ApplicationView> {
    await this.authenticate();
    const body: Record<string, unknown> = { editingApplicationDSL: dsl };
    if (opts?.publish) {
      body.publishedApplicationDSL = dsl;
    }
    return this.put<ApplicationView>(`/api/v1/applications/${appId}`, body);
  }

  async getApp(appId: string): Promise<ApplicationView> {
    await this.authenticate();
    return this.get<ApplicationView>(`/api/v1/applications/${appId}`);
  }

  async publishApp(appId: string): Promise<void> {
    await this.authenticate();
    await this.post<unknown>(`/api/v1/applications/${appId}/publish`, {});
  }

  /**
   * Marca la app como pública (cualquier visitante anónimo puede verla).
   * Imprescindible para apps de login/registro o landing pages.
   * Path: `PUT /api/v1/applications/{id}/public-to-all`
   */
  async setAppPublicToAll(appId: string, publicToAll: boolean): Promise<boolean> {
    await this.authenticate();
    return this.put<boolean>(`/api/v1/applications/${appId}/public-to-all`, { publicToAll });
  }

  /**
   * Marca la app como pública en el marketplace de Lowcoder.
   * Path: `PUT /api/v1/applications/{id}/public-to-marketplace`
   */
  async setAppPublicToMarketplace(appId: string, publicToMarketplace: boolean): Promise<boolean> {
    await this.authenticate();
    return this.put<boolean>(`/api/v1/applications/${appId}/public-to-marketplace`, { publicToMarketplace });
  }

  async listApps(orgId?: string): Promise<ApplicationMeta[]> {
    await this.authenticate();
    const qs = orgId ? `?orgId=${orgId}` : "";
    const data = await this.get<{ applications: ApplicationMeta[] } | ApplicationMeta[]>(
      `/api/v1/applications/list${qs}`
    );
    return Array.isArray(data) ? data : (data as { applications: ApplicationMeta[] }).applications ?? [];
  }

  /**
   * Mueve la app a la papelera (soft-delete). En Lowcoder, las apps pasan primero
   * por la papelera y solo desde ahí se pueden borrar permanentemente.
   *
   * Path correcto en Lowcoder 2.7.x: `PUT /api/v1/applications/recycle/{id}`
   * (NO `/{id}/recycle` — eso devuelve 5000 "Service is busy" que en realidad
   * es un 404 disfrazado).
   */
  async recycleApp(appId: string): Promise<boolean> {
    await this.authenticate();
    return this.put<boolean>(`/api/v1/applications/recycle/${appId}`, undefined);
  }

  /** Alias de `recycleApp` — DELETE en la API permanente requiere recycle primero. */
  async deleteApp(appId: string): Promise<void> {
    await this.recycleApp(appId);
  }

  /** Restaura una app desde la papelera. */
  async restoreApp(appId: string): Promise<boolean> {
    await this.authenticate();
    return this.put<boolean>(`/api/v1/applications/restore/${appId}`, undefined);
  }

  /** Lista las apps en la papelera (status RECYCLED). */
  async listRecycledApps(): Promise<ApplicationMeta[]> {
    await this.authenticate();
    const data = await this.get<{ applications: ApplicationMeta[] } | ApplicationMeta[]>(
      `/api/v1/applications/recycle/list`
    );
    return Array.isArray(data)
      ? data
      : (data as { applications: ApplicationMeta[] }).applications ?? [];
  }

  /**
   * Borra permanentemente una app que YA está en la papelera.
   * Si la app está NORMAL, primero llama `recycleApp` y luego este método.
   */
  async deleteAppPermanently(appId: string): Promise<void> {
    await this.authenticate();
    await this.request("DELETE", `/api/v1/applications/${appId}`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DATASOURCES
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Crea un nuevo datasource en una organización.
   *
   * @example
   *   await client.createDatasource({
   *     name: "Prod Postgres",
   *     type: "postgres",
   *     organizationId: orgId,
   *     datasourceConfig: { host: "db.example.com", port: 5432, database: "app", username: "u", password: "p" }
   *   });
   */
  async createDatasource(req: UpsertDatasourceRequest): Promise<Datasource> {
    await this.authenticate();
    return this.post<Datasource>("/api/datasources", req);
  }

  /** Obtiene un datasource por ID (acepta `_id` MongoDB o `gid` público). */
  async getDatasource(idOrGid: string): Promise<Datasource> {
    await this.authenticate();
    return this.get<Datasource>(`/api/datasources/${idOrGid}`);
  }

  /**
   * Actualiza un datasource. PUT con merge: campos omitidos preservan su valor anterior.
   * **IMPORTANTE:** omite los campos `password`/`uri`/`serviceAccount` para
   * preservar los secretos guardados (Lowcoder no los devuelve en GET por seguridad).
   */
  async updateDatasource(
    idOrGid: string,
    req: Partial<UpsertDatasourceRequest>
  ): Promise<Datasource> {
    await this.authenticate();
    return this.put<Datasource>(`/api/datasources/${idOrGid}`, req);
  }

  /** Soft-delete del datasource (marca status=DELETED). */
  async deleteDatasource(idOrGid: string): Promise<boolean> {
    await this.authenticate();
    return this.request<boolean>("DELETE", `/api/datasources/${idOrGid}`);
  }

  /**
   * Prueba conexión SIN crear el datasource.
   * Si la conexión funciona retorna `true`. Si falla, lanza Error con el mensaje del driver.
   */
  async testDatasource(req: UpsertDatasourceRequest): Promise<boolean> {
    await this.authenticate();
    return this.post<boolean>("/api/datasources/test", req);
  }

  /** Lista paginada de datasources de una organización. */
  async listDatasourcesByOrg(
    opts: ListDatasourcesOptions
  ): Promise<PageResponse<DatasourceView>> {
    await this.authenticate();
    const qs = new URLSearchParams({ orgId: opts.orgId });
    if (opts.name) qs.set("name", opts.name);
    if (opts.type) qs.set("type", opts.type);
    qs.set("pageNum", String(opts.pageNum ?? 1));
    qs.set("pageSize", String(opts.pageSize ?? 0));
    return this.getPaginated<DatasourceView>(`/api/datasources/listByOrg?${qs}`);
  }

  /** Atajo: devuelve solo los datasources (DatasourceView) sin paginación. */
  async listDatasources(orgId: string, type?: DatasourceType): Promise<Datasource[]> {
    const page = await this.listDatasourcesByOrg({ orgId, type, pageSize: 0 });
    // `data` puede venir como DatasourceView[] o directamente como Datasource[] según versión
    return (page.data ?? []).map((v) => (v && (v as DatasourceView).datasource) ? (v as DatasourceView).datasource : (v as unknown as Datasource));
  }

  /**
   * Lista los plugins JS disponibles en el node-service junto con su `pluginDefinition`.
   * Útil para descubrir el schema de configuración de un plugin antes de crear el datasource.
   */
  async listJsPlugins(opts: {
    appId: string;
    name?: string;
    type?: string;
    pageNum?: number;
    pageSize?: number;
  }): Promise<PageResponse<DatasourceView>> {
    await this.authenticate();
    const qs = new URLSearchParams({ appId: opts.appId });
    if (opts.name) qs.set("name", opts.name);
    if (opts.type) qs.set("type", opts.type);
    qs.set("pageNum", String(opts.pageNum ?? 1));
    qs.set("pageSize", String(opts.pageSize ?? 0));
    return this.getPaginated<DatasourceView>(`/api/datasources/jsDatasourcePlugins?${qs}`);
  }

  /**
   * Obtiene la estructura (tablas, columnas, foreign keys) del datasource.
   * Solo funciona para tipos con `hasStructureInfo === true` (SQL, MongoDB).
   */
  async getDatasourceStructure(
    idOrGid: string,
    ignoreCache = false
  ): Promise<DatasourceStructure> {
    await this.authenticate();
    return this.get<DatasourceStructure>(
      `/api/datasources/${idOrGid}/structure?ignoreCache=${ignoreCache}`
    );
  }

  /**
   * Lista los tipos de datasource disponibles en la organización (incluye plugins JS dinámicamente registrados).
   */
  async listDatasourceTypes(
    orgId: string
  ): Promise<Array<{ id: string; name: string; version?: string; hasStructureInfo: boolean }>> {
    await this.authenticate();
    return this.get<Array<{ id: string; name: string; version?: string; hasStructureInfo: boolean }>>(
      `/api/organizations/${orgId}/datasourceTypes`
    );
  }

  /**
   * Para plugins JS con `extra()`: ejecuta una función de plugin que devuelve
   * opciones dinámicas (ej: listar buckets S3 después de meter credenciales).
   */
  async getDatasourceDynamicConfig(items: Array<{
    pluginName: string;
    path: string;
    dataSourceConfig: Record<string, unknown>;
    dataSourceId?: string;
  }>): Promise<unknown[]> {
    await this.authenticate();
    return this.post<unknown[]>("/api/datasources/getPluginDynamicConfig", items);
  }

  // ─── Permisos de datasource ──────────────────────────────────────────────

  async listDatasourcePermissions(idOrGid: string): Promise<DatasourcePermissionsView> {
    await this.authenticate();
    return this.get<DatasourcePermissionsView>(`/api/datasources/${idOrGid}/permissions`);
  }

  async grantDatasourcePermissions(
    idOrGid: string,
    req: BatchAddPermissionRequest
  ): Promise<void> {
    await this.authenticate();
    await this.put<unknown>(`/api/datasources/${idOrGid}/permissions`, req);
  }

  async updateDatasourcePermission(
    permissionId: string,
    role: DatasourcePermissionRole
  ): Promise<void> {
    await this.authenticate();
    await this.put<unknown>(`/api/datasources/permissions/${permissionId}`, { role });
  }

  async revokeDatasourcePermission(permissionId: string): Promise<void> {
    await this.authenticate();
    await this.request<unknown>("DELETE", `/api/datasources/permissions/${permissionId}`);
  }

  // ─── HTTP helpers ────────────────────────────────────────────────────────

  private async get<T>(path: string): Promise<T> {
    return this.request<T>("GET", path);
  }

  /**
   * Variante GET para endpoints paginados. El envelope de Lowcoder tiene
   * `{ code, data, total, pageNum, pageSize, success }`.
   * Esta función reconstruye un PageResponse compatible.
   */
  private async getPaginated<T>(path: string): Promise<PageResponse<T>> {
    await this.authenticate();
    const url = `${this.config.baseUrl}${path}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (this.token) headers["Authorization"] = `Bearer ${this.token}`;
    const res = await fetch(url, { method: "GET", headers });
    const text = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
    let parsed: { code?: number; data?: T[]; total?: number; pageNum?: number; pageSize?: number; message?: string };
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error(`Invalid JSON response from ${path}`);
    }
    if (parsed.code !== undefined && parsed.code !== 1 && parsed.code !== 200) {
      throw new Error(`Lowcoder API error ${parsed.code}: ${parsed.message ?? text}`);
    }
    return {
      data: parsed.data ?? [],
      total: parsed.total ?? 0,
      pageNum: parsed.pageNum ?? 1,
      pageSize: parsed.pageSize ?? 0,
    };
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>("POST", path, body);
  }

  private async put<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>("PUT", path, body);
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const url = `${this.config.baseUrl}${path}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const res = await fetch(url, {
      method,
      headers,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });

    const text = await res.text();
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
      }
      return undefined as unknown as T;
    }

    const envelope = parsed as ApiResponse<T>;
    if (envelope && typeof envelope === "object" && "code" in envelope) {
      if (envelope.code !== 1 && envelope.code !== 200) {
        throw new Error(
          `Lowcoder API error ${envelope.code}: ${envelope.message ?? JSON.stringify(envelope)}`
        );
      }
      return envelope.data;
    }

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
    return parsed as T;
  }
}
