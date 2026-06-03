import { z } from "zod";
import { LowcoderClient } from "@aorizondo/lowcoder-agent-sdk-core";

export const DeployAppInputSchema = z.object({
  appId: z.string().describe("ID de la aplicación a publicar"),
});

export async function handleDeployApp(
  input: z.infer<typeof DeployAppInputSchema>,
  client: LowcoderClient,
  baseUrl: string
): Promise<string> {
  await client.publishApp(input.appId);
  return JSON.stringify({
    appId: input.appId,
    published: true,
    viewUrl: `${baseUrl}/apps/${input.appId}`,
  }, null, 2);
}
