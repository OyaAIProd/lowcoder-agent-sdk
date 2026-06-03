# Ejemplos

Ejecuta cualquier ejemplo con:

```bash
LOWCODER_BASE_URL="https://tu-lowcoder.ejemplo.com" \
LOWCODER_API_KEY="tu-token" \
LOWCODER_ORG_ID="tu-org-id" \
npx tsx examples/01-hello-world.ts
```

## Catálogo

| # | Archivo | Cubre | Tiempo |
| --- | --- | --- | --- |
| 01 | [hello-world.ts](01-hello-world.ts) | App mínima: title + botón + toast | 30s |
| 02 | [dashboard-simple.ts](02-dashboard-simple.ts) | KPIs + chart + tabla con API pública | 1 min |
| 03 | [crud-users.ts](03-crud-users.ts) | Form de creación + tabla + filtros + loading states | 2 min |
| 04 | [with-seo.ts](04-with-seo.ts) | SEO completo via preload (Open Graph + Twitter + JSON-LD) | 1 min |
| 05 | [themed-dashboard.ts](05-themed-dashboard.ts) | Tema premium: glass effect, gradientes, animaciones, responsive | 2 min |
| 06 | [mega-demo.ts](06-mega-demo.ts) | ~50 componentes: Analytics + DevOps + E-commerce + Mermaid | 5 min |

## Recomendado

Empieza con `01` → `02` → `03`. Cuando entiendas la base, prueba `05` para ver hasta dónde llega el tema visual.

## Estructura de un ejemplo típico

```typescript
import { LowcoderApp, LowcoderClient } from "@aorizondo/lowcoder-agent-sdk-core";

// 1. Construir la app
const app = new LowcoderApp("Título")
  .addText(...)
  .addTable(...)
  .addFetchQuery(...);

// 2. Conectar al servidor
const client = new LowcoderClient({
  baseUrl: process.env.LOWCODER_BASE_URL!,
  apiKey: process.env.LOWCODER_API_KEY!,
});

// 3. Deploy
const result = await app.deploy(client, process.env.LOWCODER_ORG_ID!);
console.log(result.applicationInfoView.applicationId);
```

## Tips

- **Modo edit** (`/edit`): ves el layout pero las queries automáticas NO se ejecutan
- **Modo view** (`/view`): las queries SÍ se ejecutan — usa este modo para ver datos reales
- **Inspecciona el DSL** sin desplegar: `console.log(app.toJSON())`
- **Hot reload** durante desarrollo: `npx tsx watch examples/03-crud-users.ts`
