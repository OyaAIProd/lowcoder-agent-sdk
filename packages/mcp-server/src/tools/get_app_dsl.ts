import { z } from "zod";
import { LowcoderClient } from "@aorizondo/lowcoder-agent-sdk-core";

export const GetAppDslInputSchema = z.object({
  appId: z.string().describe("ID de la aplicación"),
  simplified: z
    .boolean()
    .optional()
    .default(false)
    .describe("Si true, retorna solo los componentes y queries sin el layout completo"),
});

export async function handleGetAppDsl(
  input: z.infer<typeof GetAppDslInputSchema>,
  client: LowcoderClient
): Promise<string> {
  const app = await client.getApp(input.appId);
  const dsl = app.applicationDSL;

  if (!input.simplified) {
    return JSON.stringify(dsl, null, 2);
  }

  // Versión simplificada: lista de componentes con su nombre y tipo
  const components = Object.values(dsl.ui?.items ?? {}).map((item) => ({
    name: item.name,
    type: item.compType,
    options: item.comp,
  }));

  const queries = (dsl.queries ?? []).map((q) => ({
    name: q.name,
    type: q.compType,
    triggerType: q.triggerType,
    comp: q.comp,
  }));

  return JSON.stringify({
    title: dsl.settings?.title,
    components,
    queries,
  }, null, 2);
}
