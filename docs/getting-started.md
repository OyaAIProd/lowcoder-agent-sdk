# Getting Started

Guía paso a paso para crear tu primera app Lowcoder desde código en ~10 minutos.

## Pre-requisitos

- Node.js >= 18
- Una instancia de Lowcoder ≥ **2.7.0** (versiones anteriores tienen un bug crítico con queries JS)
- Tu `LOWCODER_BASE_URL`, `LOWCODER_API_KEY` y `LOWCODER_ORG_ID`

### Cómo obtener las credenciales

| Variable | Cómo |
| --- | --- |
| `LOWCODER_BASE_URL` | URL pública de tu instancia, sin trailing slash. Ej: `https://lowcoder.empresa.com` |
| `LOWCODER_API_KEY` | Tu avatar (esquina superior derecha) → **Profile** → **API Keys** → **Create new key** → copia el token |
| `LOWCODER_ORG_ID` | Aparece en cualquier app listada (campo `orgId`). Alternativamente: Settings → Organization |

## 1. Instala el SDK

```bash
npm install @aorizondo/lowcoder-agent-sdk-core
```

## 2. Crea tu primera app

Guarda esto como `mi-primera-app.ts`:

```typescript
import { LowcoderApp, LowcoderClient } from "@aorizondo/lowcoder-agent-sdk-core";

const app = new LowcoderApp("Mi Primera App")
  .addText("title", {
    text: "## Hola desde código",
    at: { x: 0, y: 0, w: 24, h: 8 },
  })
  .addButton("loadBtn", {
    text: "Cargar usuarios",
    type: "submit",
    onClick: "loadUsers",
    loading: "{{loadUsers.isFetching}}",
    at: { x: 0, y: 8, w: 6, h: 6 },
  })
  .addTable("usersTable", {
    data: "{{loadUsers.data}}",
    columns: [
      { title: "ID", dataIndex: "id" },
      { title: "Nombre", dataIndex: "name" },
      { title: "Email", dataIndex: "email" },
      { title: "Empresa", dataIndex: "company.name" },
    ],
    pageSize: 10,
    at: { x: 0, y: 14, w: 24, h: 50 },
  })
  .addFetchQuery("loadUsers", {
    url: "https://jsonplaceholder.typicode.com/users",
    triggerType: "automatic",
  });

const client = new LowcoderClient({
  baseUrl: process.env.LOWCODER_BASE_URL!,
  apiKey: process.env.LOWCODER_API_KEY!,
});

const result = await app.deploy(client, process.env.LOWCODER_ORG_ID!);
const appId = result.applicationInfoView.applicationId;
console.log(`✅ App creada`);
console.log(`   Editor:  ${process.env.LOWCODER_BASE_URL}/apps/${appId}/edit`);
console.log(`   Preview: ${process.env.LOWCODER_BASE_URL}/apps/${appId}/view`);
```

## 3. Ejecuta

```bash
export LOWCODER_BASE_URL="https://tu-lowcoder.ejemplo.com"
export LOWCODER_API_KEY="tu-token"
export LOWCODER_ORG_ID="tu-org-id"

npx tsx mi-primera-app.ts
```

Output esperado:

```
✅ App creada
   Editor:  https://tu-lowcoder.ejemplo.com/apps/abc123/edit
   Preview: https://tu-lowcoder.ejemplo.com/apps/abc123/view
```

## 4. Abre la app

- **`/edit`** = modo editor (las queries automáticas NO se ejecutan)
- **`/view`** = modo preview (las queries SÍ se ejecutan, ves la app "viva")

Abre `/view` para ver la tabla con datos reales.

## Siguientes pasos

- **Más componentes:** ver [sdk-reference.md](sdk-reference.md)
- **Configurar el MCP** para que un agente IA cree apps por ti: [mcp-server.md](mcp-server.md)
- **Tema visual + animaciones:** sección [Tema visual](sdk-reference.md#tema-visual-preload-css--animaciones) del SDK reference
- **SEO completo:** ver [mcp-server.md#configure_seo](mcp-server.md)
- **Crear tus propios componentes:** [plugin-creation.md](plugin-creation.md)
- **Algo no funciona:** [troubleshooting.md](troubleshooting.md)

## Patrones recomendados

### Para apps pequeñas (1-15 componentes)

Usa el MCP server directamente desde tu agente IA (Claude Code, Cursor, etc.). Ver [mcp-server.md](mcp-server.md).

### Para apps complejas o repetibles

Escribe un script TypeScript y versionarlo en git. Permite reusar componentes con funciones, generar contenido programáticamente, y tener la app como código.

### Para iteración rápida

```bash
# Watch + redeploy automático al guardar
npx tsx watch mi-app.ts
```

## Variables de entorno recomendadas en `.env`

```bash
# .env (no commitees)
LOWCODER_BASE_URL=https://tu-lowcoder.ejemplo.com
LOWCODER_API_KEY=eyJhbGc...
LOWCODER_ORG_ID=69b44d7a4cf2e872dae12536
```

Cárgalo en tu script con `import "dotenv/config"` (necesitarás `npm i dotenv`).
