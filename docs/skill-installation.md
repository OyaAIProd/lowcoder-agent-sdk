# Instalación del Skill `lowcoder`

El skill enseña al agente IA a usar correctamente el SDK y MCP. Sin el skill, el agente generaría JSON incorrecto o queries sin el prefijo `js:` necesario.

## Formatos soportados

El skill está disponible en 3 formatos para máxima compatibilidad:

| Formato | Para qué cliente | Archivo principal |
| --- | --- | --- |
| **Anthropic Agent Skills** | Claude Code, Claude Desktop, Claude API, agentes que soporten el [Agent Skills standard](https://agentskills.io) | `skills/lowcoder/SKILL.md` |
| **skillz.sh / OpenCode** | OpenCode y herramientas que sigan el spec de [Bind/skillz.sh](https://github.com/Bind/skillz.sh) | Igual `SKILL.md` + `skill.json` |
| **Claude Code Plugin Marketplace** | Distribución via `obie/skills` u otros marketplaces basados en `.claude-plugin/marketplace.json` | `.claude-plugin/marketplace.json` |

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

### OpenCode / skillz.sh

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
