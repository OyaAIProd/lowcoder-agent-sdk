# Getting Started

Guía paso a paso para crear tu primera app Lowcoder desde código en ~10 minutos.

## Pre-requisitos

- Node.js >= 18
- Una instancia de Lowcoder ≥ **2.7.0** (versiones anteriores tienen un bug crítico con queries JS)
- Tu `LOWCODER_BASE_URL` y `LOWCODER_API_KEY` (el `orgId` se auto-detecta)

### Cómo obtener las credenciales

#### `LOWCODER_BASE_URL`

URL pública de tu instancia, sin trailing slash. Ejemplos:
- Self-hosted: `https://lowcoder.empresa.com`
- Lowcoder Cloud: `https://app.lowcoder.cloud`
- Docker local: `http://localhost:3000`

#### `LOWCODER_API_KEY`

1. Abre Lowcoder en el navegador
2. Click en tu **avatar** (esquina superior derecha)
3. Selecciona **My Profile**
4. Ve a la pestaña **API Keys**
5. Click **Create new** → dale un nombre (ej: "agent-sdk")
6. Copia el **JWT token** completo (empieza con `eyJ...`)

⚠️ El token NO se vuelve a mostrar. Guárdalo seguro inmediatamente.

#### `LOWCODER_ORG_ID` (opcional — auto-detect)

**No necesitas obtenerla manualmente.** El SDK la descubre llamando a `/api/v1/users/me`:

```typescript
const orgId = await client.getCurrentOrgId();
// "69b44d7a4cf2e872dae12536"
```

Si **prefieres ponerla explícita** (más rápido — ahorra una llamada API), hay 3 formas:

**Opción 1 — Desde el SDK:**

```bash
npx -p @aorizondo/lowcoder-agent-sdk-core node -e "
import('@aorizondo/lowcoder-agent-sdk-core').then(async m => {
  const c = new m.LowcoderClient({
    baseUrl: process.env.LOWCODER_BASE_URL,
    apiKey: process.env.LOWCODER_API_KEY,
  });
  const orgs = await c.listMyOrgs();
  orgs.forEach(o => console.log(o.id, '|', o.name, o.isCurrent ? '← activa' : ''));
});
"
```

**Opción 2 — curl directo:**

```bash
curl -s -H "Authorization: Bearer $LOWCODER_API_KEY" \
  "$LOWCODER_BASE_URL/api/v1/users/me" \
  | jq -r '.data | "\(.currentOrgId)\t\(.username)"'
```

**Opción 3 — Desde la URL del navegador:**

Cuando estás logueado en Lowcoder, navega a tu home y mira la URL — algunas versiones la incluyen, ej: `/org/{orgId}/...`. Si no aparece ahí, usa Opción 1 o 2.

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

// orgId opcional — si no lo pasas, se auto-detecta
const result = await app.deploy(client);
const appId = result.applicationInfoView.applicationId;
console.log(`✅ App creada`);
console.log(`   Editor:  ${process.env.LOWCODER_BASE_URL}/apps/${appId}/edit`);
console.log(`   Preview: ${process.env.LOWCODER_BASE_URL}/apps/${appId}/view`);
```

## 3. Ejecuta

```bash
export LOWCODER_BASE_URL="https://tu-lowcoder.ejemplo.com"
export LOWCODER_API_KEY="tu-token"

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
# .env (no commitees — añade .env a .gitignore)
LOWCODER_BASE_URL=https://tu-lowcoder.ejemplo.com
LOWCODER_API_KEY=eyJhbGc...

# Opcional — solo si tienes varios workspaces y quieres especificar uno
# LOWCODER_ORG_ID=69b44d7a4cf2e872dae12536
```

Cárgalo en tu script con `import "dotenv/config"` (necesitarás `npm i dotenv`).
