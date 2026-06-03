#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { LowcoderClient } from "@aorizondo/lowcoder-agent-sdk-core";

import {
  CreateAppInputSchema,
  handleCreateApp,
} from "./tools/create_app.js";
import {
  UpdateAppInputSchema,
  handleUpdateApp,
} from "./tools/update_app.js";
import { ListAppsInputSchema, handleListApps } from "./tools/list_apps.js";
import { GetAppDslInputSchema, handleGetAppDsl } from "./tools/get_app_dsl.js";
import { DeployAppInputSchema, handleDeployApp } from "./tools/deploy_app.js";
import {
  GetComponentTypesInputSchema,
  handleGetComponentTypes,
} from "./tools/get_component_types.js";
import {
  ConfigureSeoInputSchema,
  handleConfigureSeo,
} from "./tools/configure_seo.js";
import {
  GetMyOrgsInputSchema,
  handleGetMyOrgs,
} from "./tools/get_my_orgs.js";
import {
  ListDatasourcesInputSchema, handleListDatasources,
  ListDatasourceTypesInputSchema, handleListDatasourceTypes,
  ListJsPluginsInputSchema, handleListJsPlugins,
  CreateDatasourceInputSchema, handleCreateDatasource,
  UpdateDatasourceInputSchema, handleUpdateDatasource,
  DeleteDatasourceInputSchema, handleDeleteDatasource,
  TestDatasourceInputSchema, handleTestDatasource,
  GetDatasourceStructureInputSchema, handleGetDatasourceStructure,
  ListDatasourcePermissionsInputSchema, handleListDatasourcePermissions,
  GrantDatasourcePermissionInputSchema, handleGrantDatasourcePermission,
} from "./tools/datasources.js";

// ─── Configuración desde variables de entorno ────────────────────────────────

const BASE_URL = process.env.LOWCODER_BASE_URL ?? "http://localhost:3000";
const API_KEY = process.env.LOWCODER_API_KEY;
const EMAIL = process.env.LOWCODER_EMAIL;
const PASSWORD = process.env.LOWCODER_PASSWORD;

if (!API_KEY && (!EMAIL || !PASSWORD)) {
  console.error(
    "Error: Se requiere LOWCODER_API_KEY o LOWCODER_EMAIL+LOWCODER_PASSWORD"
  );
  process.exit(1);
}

const client = new LowcoderClient({
  baseUrl: BASE_URL,
  apiKey: API_KEY,
  email: EMAIL,
  password: PASSWORD,
});

// ─── Servidor MCP ────────────────────────────────────────────────────────────

const server = new McpServer({
  name: "lowcoder-agent",
  version: "0.1.0",
});

server.tool(
  "create_app",
  "Crea una nueva aplicación Lowcoder con componentes UI y queries de datos. " +
    "Usa este tool cuando el usuario pida crear un dashboard, formulario, o cualquier app en Lowcoder.",
  CreateAppInputSchema.shape,
  async (input) => {
    const result = await handleCreateApp(input, client, BASE_URL);
    return { content: [{ type: "text", text: result }] };
  }
);

server.tool(
  "update_app",
  "Añade o modifica componentes y queries en una aplicación Lowcoder existente.",
  UpdateAppInputSchema.shape,
  async (input) => {
    const result = await handleUpdateApp(input, client);
    return { content: [{ type: "text", text: result }] };
  }
);

server.tool(
  "list_apps",
  "Lista todas las aplicaciones disponibles en la instancia de Lowcoder.",
  ListAppsInputSchema.shape,
  async (input) => {
    const result = await handleListApps(input, client);
    return { content: [{ type: "text", text: result }] };
  }
);

server.tool(
  "get_app_dsl",
  "Obtiene el DSL (estructura JSON) de una aplicación Lowcoder. " +
    "Usa simplified=true para obtener una versión legible con componentes y queries listados.",
  GetAppDslInputSchema.shape,
  async (input) => {
    const result = await handleGetAppDsl(input, client);
    return { content: [{ type: "text", text: result }] };
  }
);

server.tool(
  "deploy_app",
  "Publica una aplicación Lowcoder para que sea accesible a los usuarios finales.",
  DeployAppInputSchema.shape,
  async (input) => {
    const result = await handleDeployApp(input, client, BASE_URL);
    return { content: [{ type: "text", text: result }] };
  }
);

server.tool(
  "get_component_types",
  "Lista todos los tipos de componentes disponibles en Lowcoder con sus opciones y tamaños por defecto. " +
    "Úsalo antes de crear una app para saber qué tipos puedes usar.",
  GetComponentTypesInputSchema.shape,
  async () => {
    const result = handleGetComponentTypes();
    return { content: [{ type: "text", text: result }] };
  }
);

server.tool(
  "get_my_orgs",
  "Devuelve las organizaciones (workspaces) del usuario autenticado, marcando cuál " +
    "es la activa actualmente. Úsalo cuando NO sepas qué orgId usar para crear apps. " +
    "El campo `currentOrgId` es el que necesitas en create_app.",
  GetMyOrgsInputSchema.shape,
  async () => {
    const result = await handleGetMyOrgs(client);
    return { content: [{ type: "text", text: result }] };
  }
);

server.tool(
  "configure_seo",
  "Configura SEO completo para una app: title, meta description, Open Graph (Facebook/LinkedIn), Twitter Card, " +
    "JSON-LD structured data, canonical URL, theme-color, robots. Inyecta JS en el preload de la app que " +
    "ejecuta setMeta() y document.title al cargar. Idempotente: si ya hay SEO previo lo reemplaza con marker.",
  ConfigureSeoInputSchema.shape,
  async (input) => {
    const result = await handleConfigureSeo(input, client);
    return { content: [{ type: "text", text: result }] };
  }
);

// ─── Datasources ────────────────────────────────────────────────────────────

server.tool(
  "list_datasources",
  "Lista los datasources configurados en la organización. Usa esto antes de crear " +
    "una query REST/SQL para ver qué datasources ya existen y reusar IDs.",
  ListDatasourcesInputSchema.shape,
  async (input) => ({ content: [{ type: "text", text: await handleListDatasources(input, client) }] })
);

server.tool(
  "list_datasource_types",
  "Lista los tipos de datasource disponibles en la instancia, incluyendo plugins JS " +
    "registrados dinámicamente (s3, slack, jira, openAi, stripe, etc.). " +
    "Útil para descubrir qué se puede conectar.",
  ListDatasourceTypesInputSchema.shape,
  async (input) => ({ content: [{ type: "text", text: await handleListDatasourceTypes(input, client) }] })
);

server.tool(
  "list_js_plugins",
  "Lista plugins JS del node-service junto con el SCHEMA EXACTO de su config (params requeridos). " +
    "Usa esto antes de crear un datasource de tipo s3, slack, jira, openAi, etc.",
  ListJsPluginsInputSchema.shape,
  async (input) => ({ content: [{ type: "text", text: await handleListJsPlugins(input, client) }] })
);

server.tool(
  "create_datasource",
  "Crea un nuevo datasource (postgres, mysql, mongodb, redis, restApi, graphql, " +
    "googleSheets, smtp, s3, slack, openAi, etc.). Por defecto prueba la conexión antes " +
    "de crear (testFirst=true).",
  CreateDatasourceInputSchema.shape,
  async (input) => ({ content: [{ type: "text", text: await handleCreateDatasource(input, client) }] })
);

server.tool(
  "update_datasource",
  "Actualiza un datasource existente. IMPORTANTE: omite los campos sensibles " +
    "(password, uri, serviceAccount) para preservar los valores guardados.",
  UpdateDatasourceInputSchema.shape,
  async (input) => ({ content: [{ type: "text", text: await handleUpdateDatasource(input, client) }] })
);

server.tool(
  "delete_datasource",
  "Elimina (soft-delete) un datasource. Las queries que lo usaban dejarán de funcionar.",
  DeleteDatasourceInputSchema.shape,
  async (input) => ({ content: [{ type: "text", text: await handleDeleteDatasource(input, client) }] })
);

server.tool(
  "test_datasource",
  "Prueba conexión a un datasource SIN crearlo. Útil para validar credenciales antes de guardar.",
  TestDatasourceInputSchema.shape,
  async (input) => ({ content: [{ type: "text", text: await handleTestDatasource(input, client) }] })
);

server.tool(
  "get_datasource_structure",
  "Obtiene la estructura del datasource (tablas, columnas, foreign keys). " +
    "Solo funciona para tipos con esquema: SQL, MongoDB.",
  GetDatasourceStructureInputSchema.shape,
  async (input) => ({ content: [{ type: "text", text: await handleGetDatasourceStructure(input, client) }] })
);

server.tool(
  "list_datasource_permissions",
  "Lista usuarios y grupos con permisos sobre un datasource.",
  ListDatasourcePermissionsInputSchema.shape,
  async (input) => ({ content: [{ type: "text", text: await handleListDatasourcePermissions(input, client) }] })
);

server.tool(
  "grant_datasource_permission",
  "Otorga permisos (viewer/editor/owner) a usuarios o grupos sobre un datasource.",
  GrantDatasourcePermissionInputSchema.shape,
  async (input) => ({ content: [{ type: "text", text: await handleGrantDatasourcePermission(input, client) }] })
);

// ─── Arrancar servidor con transporte stdio ──────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
