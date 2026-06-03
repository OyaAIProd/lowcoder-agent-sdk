/**
 * MCP tools para gestión de datasources.
 *
 * Doc oficial: https://docs.lowcoder.cloud/lowcoder-documentation/connect-your-data
 */
import { z } from "zod";
import { LowcoderClient } from "@aorizondo/lowcoder-agent-sdk-core";

// ─── Schemas comunes ────────────────────────────────────────────────────────

const DatasourceTypeEnum = z.string().describe(
  "Tipo de datasource. Valores comunes: postgres, mysql, mariadb, mssql, oracle, " +
    "clickHouse, snowflake, mongodb, redis, es (Elasticsearch), smtp, restApi, graphql, " +
    "googleSheets. O cualquier plugin JS del node-service: s3, slack, jira, openAi, stripe, etc."
);

const DatasourceConfigSchema = z.record(z.unknown()).describe(
  "Configuración específica del tipo. Ejemplos:\n" +
    "- postgres/mysql/mariadb/mssql/clickHouse: { host, port?, database, username, password, usingSsl?, extParams? }\n" +
    "- oracle: { host, port?, username, password, sid? OR serviceName? OR jdbcUrl? }\n" +
    "- mongodb: { usingUri?: true, uri } OR { host, port, database, username, password, authMechanism? }\n" +
    "- redis: { host, port, username?, password?, usingSsl? } OR { usingUri: true, uri }\n" +
    "- es: { connectionString, username?, password?, usingSsl? }\n" +
    "- smtp: { host, port, username?, password? }\n" +
    "- restApi/graphql: { url, headers?, params?, authConfig?: { type: 'NO_AUTH'|'BASIC_AUTH'|... } }\n" +
    "- googleSheets: { serviceAccount: '<json-stringified-service-account-key>' }\n" +
    "- JS plugins: depende del plugin. Usa list_js_plugins para descubrir su schema."
);

// ─── list_datasources ──────────────────────────────────────────────────────

export const ListDatasourcesInputSchema = z.object({
  orgId: z.string().optional().describe(
    "ID de la organización. Si se omite, se auto-detecta el workspace activo del usuario."
  ),
  type: z.string().optional().describe("Filtrar por tipo (ej: 'postgres', 'restApi')"),
  name: z.string().optional().describe("Filtrar por nombre (substring match)"),
});

export async function handleListDatasources(
  input: z.infer<typeof ListDatasourcesInputSchema>,
  client: LowcoderClient
): Promise<string> {
  const orgId = input.orgId ?? (await client.getCurrentOrgId());
  const page = await client.listDatasourcesByOrg({
    orgId,
    type: input.type,
    name: input.name,
    pageSize: 0,
  });
  const summary = page.data.map((v) => {
    const ds = (v as { datasource?: unknown }).datasource ?? v;
    const d = ds as {
      id: string;
      gid?: string;
      name: string;
      type: string;
      organizationId: string;
      createTime?: number;
    };
    return {
      id: d.id,
      gid: d.gid,
      name: d.name,
      type: d.type,
      createdAt: d.createTime ? new Date(d.createTime).toISOString() : undefined,
    };
  });
  return JSON.stringify({ orgId, count: summary.length, datasources: summary }, null, 2);
}

// ─── list_datasource_types ─────────────────────────────────────────────────

export const ListDatasourceTypesInputSchema = z.object({
  orgId: z.string().optional(),
});

export async function handleListDatasourceTypes(
  input: z.infer<typeof ListDatasourceTypesInputSchema>,
  client: LowcoderClient
): Promise<string> {
  const orgId = input.orgId ?? (await client.getCurrentOrgId());
  const types = await client.listDatasourceTypes(orgId);
  return JSON.stringify(
    {
      orgId,
      count: types.length,
      types: types.map((t) => ({
        id: t.id,
        name: t.name,
        version: t.version,
        hasStructureInfo: t.hasStructureInfo,
      })),
    },
    null,
    2
  );
}

// ─── list_js_plugins ───────────────────────────────────────────────────────

export const ListJsPluginsInputSchema = z.object({
  appId: z.string().describe(
    "Un appId existente en la org (necesario para que el server cargue los plugins JS). " +
      "Usa list_apps para obtener uno."
  ),
  type: z.string().optional(),
});

export async function handleListJsPlugins(
  input: z.infer<typeof ListJsPluginsInputSchema>,
  client: LowcoderClient
): Promise<string> {
  const page = await client.listJsPlugins({ appId: input.appId, type: input.type, pageSize: 0 });
  const summary = page.data.map((v) => {
    const meta = (v as { datasource?: { pluginDefinition?: unknown } }).datasource
      ?.pluginDefinition as
      | { id?: string; name?: string; category?: string; description?: string; version?: string; dataSourceConfig?: { params?: unknown[] } }
      | undefined;
    return meta
      ? {
          id: meta.id,
          name: meta.name,
          category: meta.category,
          version: meta.version,
          description: meta.description,
          configParams: meta.dataSourceConfig?.params,
        }
      : v;
  });
  return JSON.stringify({ count: summary.length, plugins: summary }, null, 2);
}

// ─── create_datasource ─────────────────────────────────────────────────────

export const CreateDatasourceInputSchema = z.object({
  name: z.string().describe("Nombre legible para el datasource (ej: 'Prod Postgres')"),
  type: DatasourceTypeEnum,
  orgId: z.string().optional().describe("Si se omite, auto-detect"),
  datasourceConfig: DatasourceConfigSchema,
  testFirst: z
    .boolean()
    .optional()
    .default(true)
    .describe(
      "Si true (default), prueba conexión antes de crear. Si la conexión falla, lanza error sin crear."
    ),
});

export async function handleCreateDatasource(
  input: z.infer<typeof CreateDatasourceInputSchema>,
  client: LowcoderClient
): Promise<string> {
  const orgId = input.orgId ?? (await client.getCurrentOrgId());
  const req = {
    name: input.name,
    type: input.type,
    organizationId: orgId,
    datasourceConfig: input.datasourceConfig as never,
  };

  if (input.testFirst) {
    try {
      await client.testDatasource(req);
    } catch (e) {
      throw new Error(
        `Test connection failed: ${(e as Error).message}. ` +
          `Datasource NOT created. Set testFirst=false to skip pre-check.`
      );
    }
  }

  const ds = await client.createDatasource(req);
  return JSON.stringify(
    {
      created: true,
      id: ds.id,
      gid: ds.gid,
      name: ds.name,
      type: ds.type,
      hint: `Para usarlo en queries de tu app, pasa datasourceId: "${ds.id}"`,
    },
    null,
    2
  );
}

// ─── update_datasource ─────────────────────────────────────────────────────

export const UpdateDatasourceInputSchema = z.object({
  id: z.string().describe("ID o gid del datasource"),
  name: z.string().optional(),
  type: DatasourceTypeEnum.optional(),
  datasourceConfig: DatasourceConfigSchema.optional().describe(
    "Solo los campos a modificar. OMITE los campos sensibles (password, uri) " +
      "para preservar los valores ya guardados — Lowcoder no los devuelve en GET."
  ),
});

export async function handleUpdateDatasource(
  input: z.infer<typeof UpdateDatasourceInputSchema>,
  client: LowcoderClient
): Promise<string> {
  const { id, ...rest } = input;
  const ds = await client.updateDatasource(id, {
    ...(rest.name ? { name: rest.name } : {}),
    ...(rest.type ? { type: rest.type } : {}),
    ...(rest.datasourceConfig ? { datasourceConfig: rest.datasourceConfig as never } : {}),
  });
  return JSON.stringify({ updated: true, id: ds.id, name: ds.name, type: ds.type }, null, 2);
}

// ─── delete_datasource ─────────────────────────────────────────────────────

export const DeleteDatasourceInputSchema = z.object({
  id: z.string().describe("ID o gid del datasource a eliminar (soft-delete)"),
});

export async function handleDeleteDatasource(
  input: z.infer<typeof DeleteDatasourceInputSchema>,
  client: LowcoderClient
): Promise<string> {
  const ok = await client.deleteDatasource(input.id);
  return JSON.stringify({ deleted: ok, id: input.id }, null, 2);
}

// ─── test_datasource ───────────────────────────────────────────────────────

export const TestDatasourceInputSchema = z.object({
  name: z.string().optional().default("Test"),
  type: DatasourceTypeEnum,
  orgId: z.string().optional(),
  datasourceConfig: DatasourceConfigSchema,
});

export async function handleTestDatasource(
  input: z.infer<typeof TestDatasourceInputSchema>,
  client: LowcoderClient
): Promise<string> {
  const orgId = input.orgId ?? (await client.getCurrentOrgId());
  try {
    const ok = await client.testDatasource({
      name: input.name ?? "Test",
      type: input.type,
      organizationId: orgId,
      datasourceConfig: input.datasourceConfig as never,
    });
    return JSON.stringify({ success: ok, message: "Connection OK" }, null, 2);
  } catch (e) {
    return JSON.stringify({ success: false, error: (e as Error).message }, null, 2);
  }
}

// ─── get_datasource_structure ──────────────────────────────────────────────

export const GetDatasourceStructureInputSchema = z.object({
  id: z.string().describe("ID o gid del datasource"),
  ignoreCache: z.boolean().optional().default(false),
});

export async function handleGetDatasourceStructure(
  input: z.infer<typeof GetDatasourceStructureInputSchema>,
  client: LowcoderClient
): Promise<string> {
  const structure = await client.getDatasourceStructure(input.id, input.ignoreCache);
  return JSON.stringify(structure, null, 2);
}

// ─── permissions ───────────────────────────────────────────────────────────

export const ListDatasourcePermissionsInputSchema = z.object({
  id: z.string().describe("ID o gid del datasource"),
});

export async function handleListDatasourcePermissions(
  input: z.infer<typeof ListDatasourcePermissionsInputSchema>,
  client: LowcoderClient
): Promise<string> {
  const perms = await client.listDatasourcePermissions(input.id);
  return JSON.stringify(perms, null, 2);
}

export const GrantDatasourcePermissionInputSchema = z.object({
  id: z.string().describe("ID o gid del datasource"),
  role: z.enum(["viewer", "editor", "owner"]),
  userIds: z.array(z.string()).optional(),
  groupIds: z.array(z.string()).optional(),
});

export async function handleGrantDatasourcePermission(
  input: z.infer<typeof GrantDatasourcePermissionInputSchema>,
  client: LowcoderClient
): Promise<string> {
  await client.grantDatasourcePermissions(input.id, {
    role: input.role,
    userIds: input.userIds,
    groupIds: input.groupIds,
  });
  return JSON.stringify({ granted: true, datasourceId: input.id, role: input.role }, null, 2);
}
