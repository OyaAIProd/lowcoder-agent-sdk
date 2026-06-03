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

// ─── Arrancar servidor con transporte stdio ──────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
