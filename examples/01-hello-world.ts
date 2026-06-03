/**
 * Hello World — la app más simple posible.
 * Un título y un botón que muestra un toast.
 *
 * Ejecutar:
 *   LOWCODER_BASE_URL=... LOWCODER_API_KEY=... LOWCODER_ORG_ID=... \
 *     npx tsx examples/01-hello-world.ts
 */
import { LowcoderApp, LowcoderClient } from "@aorizondo/lowcoder-agent-sdk-core";

const app = new LowcoderApp("Hello World")
  .addText("title", {
    text: "## 👋 Hola Lowcoder!\n*Tu primera app generada desde código.*",
    at: { x: 0, y: 0, w: 24, h: 12 },
  })
  .addButton("helloBtn", {
    text: "Saludar",
    type: "submit",
    onClick: "sayHello",
    at: { x: 0, y: 12, w: 6, h: 8 },
  })
  .addJsQuery("sayHello", {
    script: `message.success("¡Hola desde el SDK!"); return true;`,
    triggerType: "manual",
  });

const client = new LowcoderClient({
  baseUrl: process.env.LOWCODER_BASE_URL!,
  apiKey: process.env.LOWCODER_API_KEY!,
});

const result = await app.deploy(client);
const appId = result.applicationInfoView.applicationId;
console.log(`✅ App creada`);
console.log(`   ${process.env.LOWCODER_BASE_URL}/apps/${appId}/edit`);
