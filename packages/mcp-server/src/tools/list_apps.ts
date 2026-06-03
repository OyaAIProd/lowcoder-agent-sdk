import { z } from "zod";
import { LowcoderClient } from "@aorizondo/lowcoder-agent-sdk-core";

export const ListAppsInputSchema = z.object({
  orgId: z.string().optional().describe("Filtrar por ID de organización"),
});

export async function handleListApps(
  input: z.infer<typeof ListAppsInputSchema>,
  client: LowcoderClient
): Promise<string> {
  const apps = await client.listApps(input.orgId);
  const summary = apps.map((a) => ({
    appId: a.applicationId,
    name: a.name,
    type: a.applicationType,
    status: a.applicationStatus,
    createdAt: new Date(a.createAt).toISOString(),
  }));
  return JSON.stringify(summary, null, 2);
}
