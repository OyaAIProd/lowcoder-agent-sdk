import type {
  ApplicationMeta,
  ApplicationView,
  CreateAppRequest,
  LowcoderDSL,
} from "./dsl/types.js";

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

  async listApps(orgId?: string): Promise<ApplicationMeta[]> {
    await this.authenticate();
    const qs = orgId ? `?orgId=${orgId}` : "";
    const data = await this.get<{ applications: ApplicationMeta[] } | ApplicationMeta[]>(
      `/api/v1/applications/list${qs}`
    );
    return Array.isArray(data) ? data : (data as { applications: ApplicationMeta[] }).applications ?? [];
  }

  async deleteApp(appId: string): Promise<void> {
    await this.authenticate();
    await this.request("DELETE", `/api/v1/applications/${appId}`);
  }

  // ─── HTTP helpers ────────────────────────────────────────────────────────

  private async get<T>(path: string): Promise<T> {
    return this.request<T>("GET", path);
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
