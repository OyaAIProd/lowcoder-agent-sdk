# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) y versionado semántico ([SemVer](https://semver.org/spec/v2.0.0.html)).

## [0.2.0] - 2026-06-03

### Added

- **SDK Core** (`@aorizondo/lowcoder-agent-sdk-core`)
  - `LowcoderClient.getCurrentUser()` — devuelve el usuario autenticado completo, incluyendo todas las organizaciones a las que pertenece y la activa (`currentOrgId`)
  - `LowcoderClient.getCurrentOrgId()` — atajo para obtener solo el orgId del workspace activo
  - `LowcoderClient.listMyOrgs()` — lista todas las orgs del usuario con flag `isCurrent` y rol, ordenadas con la activa primero
  - Tipos: `CurrentUserResponse`, `OrgInfo`, `OrgAndRole` exportados desde el package
- **MCP Server** (`@aorizondo/lowcoder-mcp-server`)
  - Nuevo tool **`get_my_orgs`** — descubre el orgId del usuario sin que tenga que ir a la UI

### Changed

- **`LowcoderApp.deploy(client, orgId?, opts?)`** — `orgId` ahora es opcional. Si se omite, se auto-detecta llamando `client.getCurrentOrgId()` internamente
- Documentación reescrita:
  - `SKILL.md` ya no pide al agente que solicite orgId al usuario por defecto
  - `getting-started.md` con 3 métodos prácticos para obtener orgId
  - `mcp-server.md` documenta el nuevo tool `get_my_orgs`
  - `sdk-reference.md` actualizado con los nuevos métodos del cliente
  - Todos los ejemplos en `examples/` ahora usan `deploy(client)` sin orgId
- `skill.json`: `LOWCODER_ORG_ID` movido de `env` (obligatoria) a `optionalEnv`

### Why

Reportado por usuario: la documentación pedía `LOWCODER_ORG_ID` pero nunca explicaba cómo obtenerlo, y de hecho la API REST de Lowcoder ya lo expone vía `/api/v1/users/me` con `currentOrgId`. El SDK ahora abstrae esto completamente.

## [0.1.0] - 2026-06-02

### Added

- **SDK Core** (`@aorizondo/lowcoder-agent-sdk-core`)
  - Clase `LowcoderApp` con builder fluido para construir el DSL de apps
  - ~25 wrappers de componentes nativos (button, input, table, charts, etc.)
  - Soporte para los ~80 tipos vía `addComponent(id, type, opts)` genérico
  - Layout automático bin-packing en grid de 24 cols, con override manual `at: { x, y, w?, h? }`
  - Queries: `addFetchQuery` (recomendado), `addJsQuery`, `addRestQuery`, `addSqlQuery`, `addQuery` genérico
  - Auto-resolución de `datasourceId` para JS queries (`#JS_CODE`) y REST queries sin datasource
  - Auto-generación de `queryId` con prefijo `js:` para queries JS (requerido por Lowcoder)
  - `LowcoderClient` con autenticación API key o email+password
  - `withSettings()`, `withPreload()` para configuración global
  - Soporte para `bodyType` aliases (`"json"` → `"application/json"`)
- **MCP Server** (`@aorizondo/lowcoder-mcp-server`)
  - 6 tools: `get_component_types`, `create_app`, `update_app`, `list_apps`, `get_app_dsl`, `deploy_app`, `configure_seo`
  - Tool `configure_seo` idempotente con re-aplicación en 500ms/2s/5s para sobrescribir defaults de Lowcoder
  - Aceptación de `type: "fetch"` en queries como atajo a JS query con fetch
- **Claude Skill**
  - `skills/lowcoder/SKILL.md` con ~600 líneas estilo manual de usuario
  - Soporte tri-formato: Anthropic Agent Skills + skillz.sh + Claude Code plugin marketplace
- **Documentación**
  - 6 docs detalladas en `docs/`: getting-started, sdk-reference, mcp-server, skill-installation, plugin-creation, troubleshooting
  - 6 ejemplos completos en `examples/`: hello-world, dashboard-simple, crud-users, with-seo, themed-dashboard, mega-demo (50+ componentes)

### Known issues

- Lowcoder **<2.7.0** tiene un bug upstream donde `getById()` no maneja `#JS_CODE` → ninguna query JS funciona. Solución: actualizar a 2.7.0+
- `gaugeChart` requiere config ECharts compleja por subtipo → workaround: usar `progressCircle` con `value: N` para visualizar porcentajes

[0.2.0]: https://github.com/aorizondo/lowcoder-agent-sdk/releases/tag/v0.2.0
[0.1.0]: https://github.com/aorizondo/lowcoder-agent-sdk/releases/tag/v0.1.0
