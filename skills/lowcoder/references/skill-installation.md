# Instalación del Skill `lowcoder`

El skill enseña al agente IA a usar correctamente el SDK y MCP. Sin el skill, el agente generaría JSON incorrecto o queries sin el prefijo `js:` necesario.

## Estructura del directorio del skill

```
skills/lowcoder/
├── SKILL.md                       # Documento principal
├── mcp.json                       # Config MCP server (OMO/OpenCode lo prefiere)
├── skill.json                     # Metadata skillz.sh
├── references/                    # Documentación detallada referenciable con @path
│   ├── getting-started.md
│   ├── sdk-reference.md
│   ├── mcp-server.md
│   ├── datasources.md
│   ├── plugin-creation.md
│   ├── troubleshooting.md
│   └── skill-installation.md
└── assets/                        # Templates y snippets referenciables con @path
    ├── dsl-templates/             # JSON de componentes para copiar/adaptar
    │   ├── kpi-card.json
    │   ├── data-table.json
    │   ├── line-chart.json
    │   └── crud-form.json
    └── preload/                   # JS/CSS para withPreload
        ├── helpers.js
        ├── glass-theme.css
        └── seo-script.js
```

Las `docs/*.md` del repo son **symlinks** a `skills/lowcoder/references/*.md` — son la misma fuente, no se duplican.

## Formatos soportados

El skill está disponible en 4 formatos para máxima compatibilidad:

| Formato | Para qué cliente | Archivos relevantes |
| --- | --- | --- |
| **Anthropic Agent Skills** | Claude Code, Claude Desktop, Claude API | `SKILL.md` con frontmatter `name`, `description`, `allowed-tools`, `argument-hint` |
| **OMO / OpenCode plugin** | OpenCode con plugin OMO | `SKILL.md` con frontmatter `mcp:` embebido + opcionalmente `mcp.json` (tiene prioridad si ambos existen) |
| **skillz.sh / OpenCode** | Bind/skillz.sh | `SKILL.md` + `skill.json` |
| **Plugin Marketplace** | obie/skills u otros marketplaces | `.claude-plugin/marketplace.json` |

## Frontmatter del SKILL.md

Este skill incluye los siguientes campos en el YAML frontmatter:

```yaml
---
# Anthropic Agent Skills (Claude Code/Desktop/API)
name: lowcoder
description: "..."
when_to_use: "..."
allowed-tools:                          # Tools que el skill puede invocar
  - Bash
  - Read
  - Write
  - Edit
  - Grep
  - Glob

# Metadata genérica
license: MIT
version: 0.3.0
argument-hint: "<descripción de la app>"

# OMO / OpenCode — auto-arranca el MCP cuando el skill se carga
mcp:
  lowcoder:
    command: npx
    args: ["-y", "@aorizondo/lowcoder-mcp-server"]
    env:
      LOWCODER_BASE_URL: "${LOWCODER_BASE_URL}"
      LOWCODER_API_KEY: "${LOWCODER_API_KEY}"
---
```

### Campos OMO opcionales

OMO soporta también estos campos:

| Campo | Tipo | Uso |
| --- | --- | --- |
| `model` | `"anthropic/claude-sonnet-4-..."` | Override del modelo para este skill |
| `agent` | `"build"` \| `"plan"` \| ... | Agente OMO que ejecuta el skill |
| `subtask` | `true` \| `false` | Si el skill se ejecuta como subtarea |
| `metadata` | `Record<string, any>` | Metadata libre |

Si no usas OMO, simplemente ignora estos campos — son opcionales y los demás clientes los ignoran.

## Referencias `@path` (artefactos)

OMO y otros clientes compatibles resuelven `@path` dentro del SKILL.md a rutas absolutas en el sistema de archivos al cargar el skill. Esto permite tener documentación y plantillas como archivos separados sin inflar el SKILL.md:

```markdown
Lee los detalles en @references/sdk-reference.md
Usa el template @assets/dsl-templates/kpi-card.json como base
Inyecta @assets/preload/glass-theme.css con withPreload
```

Si tu cliente NO soporta `@path` (Claude Code estándar, Claude Desktop, Claude.ai), el agente puede leer los mismos archivos manualmente con su tool `Read` desde la ruta relativa al directorio del skill.

## Instalación

### Claude Code — instalación personal (todas las apps)

```bash
# Opción 1: clonar el repo y enlazar
git clone https://github.com/aorizondo/lowcoder-agent-sdk.git ~/.lowcoder-agent-sdk-repo
ln -s ~/.lowcoder-agent-sdk-repo/skills/lowcoder ~/.claude/skills/lowcoder

# Opción 2: descargar solo el SKILL.md
mkdir -p ~/.claude/skills/lowcoder
curl -L https://raw.githubusercontent.com/aorizondo/lowcoder-agent-sdk/main/skills/lowcoder/SKILL.md \
  -o ~/.claude/skills/lowcoder/SKILL.md
```

Verifica:

```bash
ls ~/.claude/skills/lowcoder/
# SKILL.md
```

Reinicia Claude Code y el skill aparecerá en `/help`.

### Claude Code — instalación por proyecto

Si quieres que el skill solo esté activo en un proyecto:

```bash
cd tu-proyecto
mkdir -p .claude/skills/lowcoder
curl -L https://raw.githubusercontent.com/aorizondo/lowcoder-agent-sdk/main/skills/lowcoder/SKILL.md \
  -o .claude/skills/lowcoder/SKILL.md
```

Útil cuando el proyecto tiene su propia instancia de Lowcoder y configuración específica.

### Claude Code — via plugin marketplace

```bash
# Añadir el marketplace
/plugin marketplace add aorizondo/lowcoder-agent-sdk

# Instalar el skill
/plugin install lowcoder@aorizondo-lowcoder
```

### Claude Desktop / Claude.ai (consumer apps)

1. Descarga el ZIP del skill:
   ```bash
   cd /tmp
   wget https://github.com/aorizondo/lowcoder-agent-sdk/archive/refs/heads/main.zip
   cd lowcoder-agent-sdk-main/skills/lowcoder/
   zip -r ../../../lowcoder-skill.zip .
   ```
2. En Claude.ai: **Settings → Features → Custom Skills → Upload**
3. Sube el ZIP

⚠️ Custom Skills en Claude.ai son **per-user**, no se comparten en organización (límite de Anthropic).

### Claude API

```bash
curl -X POST https://api.anthropic.com/v1/skills \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: code-execution-2025-08-25,skills-2025-10-02,files-api-2025-04-14" \
  -H "Content-Type: application/json" \
  --data-binary "@skills/lowcoder/SKILL.md"
```

### OpenCode con plugin OMO

OMO descubre skills automáticamente desde estas ubicaciones:

| Ámbito | Ruta |
| --- | --- |
| Proyecto | `.opencode/skills/<skill-name>/SKILL.md` |
| Usuario | `~/.opencode/skills/<skill-name>/SKILL.md` |
| Proyecto Claude | `.claude/skills/<skill-name>/SKILL.md` |
| Proyecto agents | `.agents/skills/<skill-name>/SKILL.md` |

Para instalar este skill en OMO con todos sus recursos (MCP auto-start, references, assets):

```bash
# Opción 1: clonar el repo completo (RECOMENDADO — incluye references/, assets/, mcp.json)
git clone https://github.com/aorizondo/lowcoder-agent-sdk.git ~/.lowcoder-agent-sdk-repo
ln -s ~/.lowcoder-agent-sdk-repo/skills/lowcoder ~/.opencode/skills/lowcoder

# Opción 2: copiar el directorio entero
mkdir -p ~/.opencode/skills/
cp -r skills/lowcoder ~/.opencode/skills/lowcoder

# Configurar env vars que el mcp del frontmatter referencia
export LOWCODER_BASE_URL="https://tu-lowcoder.ejemplo.com"
export LOWCODER_API_KEY="tu-token"
```

OMO arrancará automáticamente el MCP server `@aorizondo/lowcoder-mcp-server` cuando el skill se cargue, y resolverá los `@path` references a archivos reales.

**⚠️ Si el tool nativo `skill` está deshabilitado en OpenCode**, el sistema de skills enriquecidas de OMO sigue funcionando — son sistemas independientes. OMO usa sus propios `skill` y `skill_mcp` tools registrados como plugin.

### skillz.sh (Bind/skillz.sh)

```bash
# Si tu agent client lee skill.json automáticamente:
mkdir -p ~/.opencode/skills/lowcoder
cp skills/lowcoder/SKILL.md skills/lowcoder/skill.json ~/.opencode/skills/lowcoder/
```

### Cursor

Cursor no tiene un sistema oficial de skills aún. La alternativa es:

1. Copiar `SKILL.md` a `.cursor/rules/lowcoder.mdc` en el proyecto
2. Renombrar como rule de Cursor con frontmatter `description:` y `globs:`

```markdown
---
description: Crea aplicaciones Lowcoder desde código
globs: ["**/*.ts", "**/*.tsx"]
---

[contenido del SKILL.md]
```

## Verificación

Después de instalar, el agente debería:

1. Activar el skill cuando el usuario diga "crea un dashboard en Lowcoder"
2. Llamar `get_component_types()` primero (si tiene MCP)
3. Generar componentes con sintaxis correcta (queries JS con prefijo, datasourceId apropiado, etc.)

Prueba con: *"Crea una app Lowcoder con un título, un botón Recargar y una tabla con usuarios de jsonplaceholder.typicode.com/users"*

Esperado: el agente usa `create_app` (si tiene MCP) o escribe un script con `LowcoderApp` (si solo tiene SDK).

## Actualización del skill

```bash
# Re-descargar la última versión
curl -L https://raw.githubusercontent.com/aorizondo/lowcoder-agent-sdk/main/skills/lowcoder/SKILL.md \
  -o ~/.claude/skills/lowcoder/SKILL.md
```

O si usas git clone:

```bash
cd ~/.lowcoder-agent-sdk-repo && git pull
```

## Desinstalación

```bash
rm -rf ~/.claude/skills/lowcoder/
# O si usaste link: rm ~/.claude/skills/lowcoder
```

## Personalización

Puedes copiar `SKILL.md` a tu proyecto y editarlo para añadir:

- Tu `orgId` específico para que el agente no lo pida
- Tu `datasourceId` para queries SQL
- Tu tema visual preferido (colores corporativos en preload CSS)
- Convenciones de naming de tu equipo

Mantén la sección con bugs y workarounds — son críticos para que el agente evite errores conocidos.
