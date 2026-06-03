import { z } from "zod";
import { LowcoderApp, LowcoderClient } from "@aorizondo/lowcoder-agent-sdk-core";
import { ComponentSpecSchema, QuerySpecSchema, AppSettingsSchema } from "./create_app.js";

export const UpdateAppInputSchema = z.object({
  appId: z.string().describe("ID de la aplicación a actualizar"),
  components: z.array(ComponentSpecSchema).optional(),
  queries: z.array(QuerySpecSchema).optional(),
  settings: AppSettingsSchema.optional(),
  publish: z.boolean().optional().default(false),
});

export async function handleUpdateApp(
  input: z.infer<typeof UpdateAppInputSchema>,
  client: LowcoderClient
): Promise<string> {
  const existing = await client.getApp(input.appId);
  const existingDsl = existing.applicationDSL;
  const existingTitle = existing.applicationInfoView.name;

  const app = new LowcoderApp(existingTitle);

  for (const comp of input.components ?? []) {
    const { at, ...opts } = { at: comp.layout, ...comp.options };
    app.addComponent(comp.id, comp.type, { ...opts, at });
  }

  for (const query of input.queries ?? []) {
    if (query.type === "fetch") {
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

  const newDsl = app.build();

  // Combinar: conservar items/queries existentes y añadir los nuevos
  const merged = {
    ...existingDsl,
    ui: {
      items: { ...existingDsl.ui.items, ...newDsl.ui.items },
      layout: { ...existingDsl.ui.layout, ...newDsl.ui.layout },
    },
    queries: [
      ...existingDsl.queries,
      ...newDsl.queries,
    ],
    settings: { ...existingDsl.settings, ...newDsl.settings },
  };

  await client.updateApp(input.appId, merged, { publish: input.publish });

  return JSON.stringify({
    appId: input.appId,
    success: true,
    addedComponents: input.components?.length ?? 0,
    addedQueries: input.queries?.length ?? 0,
  }, null, 2);
}
