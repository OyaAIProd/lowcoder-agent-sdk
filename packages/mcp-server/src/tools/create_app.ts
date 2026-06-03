import { z } from "zod";
import { LowcoderApp, LowcoderClient } from "@aorizondo/lowcoder-agent-sdk-core";

export const ComponentSpecSchema = z.object({
  id: z.string().describe("Identificador único del componente (ej: btn1, tbl1)"),
  type: z.string().describe("Tipo de componente: button, input, table, text, select, chart, image, container, divider, numberInput, checkbox, textArea"),
  options: z.record(z.unknown()).optional().default({}).describe("Opciones del componente según su tipo"),
  layout: z
    .object({
      x: z.number().optional(),
      y: z.number().optional(),
      w: z.number().optional(),
      h: z.number().optional(),
    })
    .optional()
    .describe("Posición y tamaño manual en el grid de 24 columnas"),
});

export const QuerySpecSchema = z.object({
  id: z.string().describe("Nombre de la query (ej: loadData, saveRecord)"),
  type: z
    .enum(["fetch", "restApi", "js", "mysql", "postgres", "mssql", "oracle", "snowflake"])
    .describe(
      "Tipo de query. PREFIERE 'fetch' para APIs públicas (genera JS query con fetch internamente, sin requerir datasource). " +
        "Usa 'restApi' SOLO si la instancia tiene un datasource REST configurado (requiere datasourceId). " +
        "Usa 'js' para lógica custom. SQL types requieren datasourceId."
    ),
  options: z
    .record(z.unknown())
    .describe(
      "Configuración. Para fetch: {url, method?, headers?, body?, triggerType?}. " +
        "Para restApi: {url, method?, datasourceId, ...}. " +
        "Para js: {script, triggerType?}. " +
        "Para sql: {sql, datasourceId, triggerType?}."
    ),
});

export const AppSettingsSchema = z.object({
  description: z.string().optional(),
  category: z.string().optional(),
  gridPaddingX: z.number().optional(),
  gridPaddingY: z.number().optional(),
  showHeaderInPublic: z.boolean().optional(),
});

export const CreateAppInputSchema = z.object({
  title: z.string().describe("Título de la aplicación"),
  orgId: z.string().describe("ID de la organización donde crear la app"),
  components: z
    .array(ComponentSpecSchema)
    .describe("Lista de componentes UI de la aplicación"),
  queries: z.array(QuerySpecSchema).optional().describe("Queries de datos"),
  settings: AppSettingsSchema.optional().describe("Configuración general"),
  publish: z
    .boolean()
    .optional()
    .default(false)
    .describe("Si publicar la app inmediatamente"),
  folderId: z.string().optional().describe("ID de carpeta destino"),
});

export async function handleCreateApp(
  input: z.infer<typeof CreateAppInputSchema>,
  client: LowcoderClient,
  baseUrl: string
): Promise<string> {
  const app = new LowcoderApp(input.title);

  for (const comp of input.components) {
    const { at, ...opts } = { at: comp.layout, ...comp.options };
    app.addComponent(comp.id, comp.type, { ...opts, at });
  }

  for (const query of input.queries ?? []) {
    if (query.type === "fetch") {
      // Atajo: convierte a JS query con fetch interno
      app.addFetchQuery(query.id, query.options as Parameters<typeof app.addFetchQuery>[1]);
    } else {
      app.addQuery(
        query.id,
        query.type as Parameters<typeof app.addQuery>[1],
        query.options as Record<string, unknown>
      );
    }
  }

  if (input.settings) {
    app.withSettings(input.settings);
  }

  const result = await app.deploy(client, input.orgId, {
    folderId: input.folderId,
    publish: input.publish,
  });

  const appId = result.applicationInfoView.applicationId;
  const name = result.applicationInfoView.name;
  const url = `${baseUrl}/apps/${appId}/edit`;

  return JSON.stringify({ appId, name, url, success: true }, null, 2);
}
