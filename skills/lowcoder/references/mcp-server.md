# MCP Server

`@aorizondo/lowcoder-mcp-server` expone Lowcoder a agentes IA via Model Context Protocol.

## ¿Qué es MCP?

[Model Context Protocol](https://modelcontextprotocol.io) es un standard abierto para que agentes IA llamen a tools externos. Clientes compatibles: Claude Desktop, Claude Code, Cursor, Continue, Zed, opencode, etc.

## Setup

### Variables de entorno

```bash
LOWCODER_BASE_URL="https://tu-lowcoder.ejemplo.com"
LOWCODER_API_KEY="tu-token"
# Alternativa: LOWCODER_EMAIL + LOWCODER_PASSWORD
```

### Claude Desktop

Edita `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) o el equivalente en Windows/Linux:

```json
{
  "mcpServers": {
    "lowcoder": {
      "command": "npx",
      "args": ["-y", "@aorizondo/lowcoder-mcp-server"],
      "env": {
        "LOWCODER_BASE_URL": "https://tu-lowcoder.ejemplo.com",
        "LOWCODER_API_KEY": "tu-token"
      }
    }
  }
}
```

Reinicia Claude Desktop.

### Claude Code

```bash
claude mcp add lowcoder npx @aorizondo/lowcoder-mcp-server \
  --env LOWCODER_BASE_URL=https://tu-lowcoder.ejemplo.com \
  --env LOWCODER_API_KEY=tu-token
```

Verifica:

```bash
claude mcp list
```

### Cursor

**Settings → Cursor Settings → MCP → Add server**:

```json
{
  "command": "npx",
  "args": ["-y", "@aorizondo/lowcoder-mcp-server"],
  "env": {
    "LOWCODER_BASE_URL": "https://tu-lowcoder.ejemplo.com",
    "LOWCODER_API_KEY": "tu-token"
  }
}
```

### Continue.dev

En `~/.continue/config.json`:

```json
{
  "experimental": {
    "modelContextProtocolServers": [
      {
        "transport": {
          "type": "stdio",
          "command": "npx",
          "args": ["-y", "@aorizondo/lowcoder-mcp-server"],
          "env": {
            "LOWCODER_BASE_URL": "https://tu-lowcoder.ejemplo.com",
            "LOWCODER_API_KEY": "tu-token"
          }
        }
      }
    ]
  }
}
```

### Test local

```bash
LOWCODER_BASE_URL=... LOWCODER_API_KEY=... npx @aorizondo/lowcoder-mcp-server
```

O con MCP inspector:

```bash
npx @modelcontextprotocol/inspector npx @aorizondo/lowcoder-mcp-server
```

## Tools disponibles

### `get_my_orgs()`

Sin argumentos. Devuelve las organizaciones del usuario autenticado, marcando cuál es la activa.

**Úsalo cuando NO sepas qué `orgId` usar.** El campo `currentOrgId` es el que necesitas para `create_app`.

→ `{ userId, username, currentOrgId, orgs: [...], hint: "..." }`

### `get_component_types()`

Sin argumentos. Retorna lista completa de los ~80 tipos de componentes nativos. Llamar **antes** de crear apps si dudas qué `type` usar.

### `create_app(input)`

```typescript
{
  title: string,
  orgId: string,
  components: ComponentSpec[],
  queries?: QuerySpec[],
  settings?: {
    description?: string,
    category?: string,
    gridPaddingX?: number,
    gridPaddingY?: number,
    showHeaderInPublic?: boolean
  },
  publish?: boolean,
  folderId?: string
}
// → { appId, name, url }
```

Donde `ComponentSpec`:

```typescript
{
  id: string,
  type: string,           // ver get_component_types
  options?: Record<string, unknown>,
  layout?: { x?: number, y?: number, w?: number, h?: number }
}
```

Y `QuerySpec`:

```typescript
{
  id: string,
  type: "fetch" | "js" | "restApi" | "mysql" | "postgres" | "mssql" | "oracle" | "snowflake",
  options: Record<string, unknown>
}
```

**Tip:** usa `type: "fetch"` para APIs públicas — internamente el SDK genera una JS query con `fetch()`, sin necesitar datasource.

### `update_app(input)`

Igual estructura que `create_app` pero usando `appId` en lugar de `title+orgId`. **Añade** componentes/queries sin borrar existentes.

```typescript
{
  appId: string,
  components?: ComponentSpec[],
  queries?: QuerySpec[],
  settings?: {...},
  publish?: boolean
}
```

### `list_apps({ orgId? })`

→ `[{ appId, name, type, status, createdAt }]`

### `get_app_dsl({ appId, simplified? })`

- `simplified: true` → versión legible: lista de componentes y queries con sus options
- `simplified: false` (default) → DSL JSON completo

### `deploy_app({ appId })`

Publica una app para acceso externo (la mueve a "published"). → `{ published: true, viewUrl }`

### `configure_seo(input)`

Inyecta meta tags, Open Graph, Twitter Card, JSON-LD para SEO completo. **Idempotente** — llamadas repetidas reemplazan el bloque previo.

```typescript
{
  appId: string,
  title: string,                  // <60 chars
  description: string,            // <160 chars
  ogImage?: string,               // URL absoluta 1200x630
  canonical?: string,
  siteName?: string,
  themeColor?: string,            // default "#6366f1"
  jsonLdType?: "WebApplication" | "WebPage" | "SoftwareApplication" | "Organization",
  twitterCard?: boolean,          // default true
  preserveCss?: boolean           // default true (no toca tu CSS preload)
}
// → { seoConfigured: true, tags: [...] }
```

## Capacidades del MCP

| Capacidad | Soportado |
| --- | --- |
| Crear apps desde cero | ✅ `create_app` |
| Añadir a apps existentes | ✅ `update_app` |
| Listar apps | ✅ `list_apps` |
| Inspeccionar DSL | ✅ `get_app_dsl` |
| Publicar / deploy | ✅ `deploy_app` |
| Configurar SEO | ✅ `configure_seo` |
| Crear datasources | ❌ (usa la UI de Lowcoder, requiere config sensible) |
| Crear users / orgs | ❌ (out of scope) |
| Trigger queries | ❌ (las queries se disparan desde la UI o vía event handlers) |
| Backup / restore | ❌ (usa `get_app_dsl` + `create_app` manual) |

## ¿Cuándo NO usar el MCP?

- Cuando necesitas **versionar la app** en git → usa el SDK en un script
- Cuando la app tiene **lógica condicional** durante la construcción (generar N componentes según un input) → SDK
- Cuando el agente IA **se equivoca repetidamente** con el formato → más fácil debuggear un script TypeScript
- Cuando quieres **reutilizar bloques** entre múltiples apps → SDK con funciones factory

## Seguridad

- **Nunca commitees el `LOWCODER_API_KEY`** — usa `.env` o gestores de secretos
- El API key da acceso a **TODAS tus apps** en la organización
- Para limitar permisos, crea un usuario con role limitado y genera key desde ese usuario
- **Revoca el key** desde la UI cuando ya no lo necesites

## Troubleshooting MCP

| Síntoma | Solución |
| --- | --- |
| Tool no aparece en agente | Reinicia el cliente (Claude Desktop, Cursor, etc.) |
| `Error: Missing LOWCODER_API_KEY` | El env var no llega al subprocess. Verifica el JSON de config |
| `HTTP 401 Unauthorized` | API key inválida o expirada. Regenera en la UI |
| `Datasource cannot be found` | Lowcoder <2.7.0. Actualiza la instancia |
| `Service is busy` | Endpoint que requiere node-service. Verifica que el node-service corre |
| Apps creadas no aparecen en UI | Verifica `orgId` correcto (apps de otra org no se ven) |

Ver [troubleshooting.md](troubleshooting.md) para más casos.
