# @aorizondo/lowcoder-mcp-server

MCP (Model Context Protocol) server que expone tools para que agentes de IA (Claude, Cursor, Continue, etc.) creen aplicaciones [Lowcoder](https://github.com/lowcoder-org/lowcoder) directamente.

## Instalación

```bash
npm install -g @aorizondo/lowcoder-mcp-server
```

O sin instalar (recomendado, siempre última versión):

```bash
npx @aorizondo/lowcoder-mcp-server
```

## Variables de entorno requeridas

```bash
export LOWCODER_BASE_URL="https://tu-lowcoder.ejemplo.com"
export LOWCODER_API_KEY="eyJhbGc..."             # Recomendado
# O alternativa:
# export LOWCODER_EMAIL="tu@email.com"
# export LOWCODER_PASSWORD="tu-password"
```

### Cómo obtener `LOWCODER_API_KEY`

1. Abre tu Lowcoder en el navegador
2. Click en tu avatar (esquina superior derecha) → **Profile** o **Account Settings**
3. Sección **API Keys** → **Create new key**
4. Dale un nombre (ej: "agent-sdk") y copia el token

## Setup en Claude Desktop

Edita `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) o equivalente:

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

## Setup en Claude Code

```bash
claude mcp add lowcoder npx @aorizondo/lowcoder-mcp-server \
  --env LOWCODER_BASE_URL=https://tu-lowcoder.ejemplo.com \
  --env LOWCODER_API_KEY=tu-token
```

## Setup en Cursor

En **Settings → Cursor Settings → MCP**:

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

## Tools expuestos

| Tool | Para qué sirve |
| --- | --- |
| `get_component_types` | Lista los ~80 tipos de componentes disponibles con sus tamaños por defecto. **Llamar primero** antes de crear apps |
| `create_app` | Crea una aplicación completa de una sola llamada con componentes, queries, settings |
| `update_app` | Añade componentes/queries a una app existente sin eliminar los anteriores |
| `list_apps` | Lista las apps de tu instancia con sus IDs y nombres |
| `get_app_dsl` | Obtiene el DSL (estructura) de una app — útil para auditar lo creado |
| `deploy_app` | Publica una app para acceso externo |
| `configure_seo` | Inyecta meta tags, Open Graph, JSON-LD para SEO completo en la app |

## Ejemplo: prompt típico al agente

> "Crea un dashboard en Lowcoder con 4 KPIs (ingresos, usuarios, productos, conversión), un gráfico de líneas mostrando ventas por mes desde dummyjson.com/carts, y una tabla con usuarios de jsonplaceholder.typicode.com/users. Mi orgId es `69b44d7a4cf2e872dae12536`."

El agente usará el MCP para llamar `create_app` con la estructura correcta y te dará la URL final.

## Recomendaciones

- **Instalar también el Skill** [`lowcoder`](https://github.com/aorizondo/lowcoder-agent-sdk/tree/main/skills/lowcoder) para que el agente sepa exactamente cómo usar este MCP — los tools por sí solos no le enseñan las convenciones del DSL
- **Token de API key, no email/password** — más seguro, no expira con la sesión
- **Para apps complejas (>20 componentes)** el agente puede escribir un script TypeScript con [`@aorizondo/lowcoder-agent-sdk-core`](https://www.npmjs.com/package/@aorizondo/lowcoder-agent-sdk-core) en lugar de usar el MCP — más controlable

## Licencia

MIT © Antonio Orizondo Leyva
