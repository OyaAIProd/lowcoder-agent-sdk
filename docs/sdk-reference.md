# SDK Reference

Documentación completa del SDK `@aorizondo/lowcoder-agent-sdk-core`.

## Tabla de contenidos

- [Imports principales](#imports-principales)
- [Clase LowcoderApp](#clase-lowcoderapp)
  - [Componentes](#componentes)
  - [Queries](#queries)
  - [Estado y configuración](#estado-y-configuración)
  - [Output](#output)
- [Clase LowcoderClient](#clase-lowcoderclient)
- [Tipos exportados](#tipos-exportados)
- [Utilidades](#utilidades)

## Imports principales

```typescript
import {
  // Core
  LowcoderApp,
  LowcoderClient,
  DslBuilder,
  AutoLayout,

  // Utilidades
  genGridKey,
  genQueryId,

  // Tipos
  type LowcoderDSL,
  type UICompType,
  type ResourceType,
  type ApplicationView,
  type ApplicationMeta,
  type CreateAppRequest,
} from "@aorizondo/lowcoder-agent-sdk-core";
```

## Clase LowcoderApp

Builder fluido. Todos los métodos retornan `this` para chaining.

### Constructor

```typescript
new LowcoderApp(title: string)
```

### Componentes

Todos los `add*` aceptan opcionalmente `at: { x?, y?, w?, h? }` para layout manual en grid de 24 cols. Sin `at`, el SDK auto-posiciona.

#### Botones y acciones

```typescript
.addButton(id, {
  text?: string,                  // "Click me"
  type?: "default" | "submit",
  onClick?: string,               // nombre de query a ejecutar
  disabled?: string | boolean,    // expresión {{ }} o booleano
  loading?: string | boolean,
  tooltip?: string,
  hidden?: string | boolean,
  at?: { x, y, w?, h? }
})

.addLink(id, {
  text: string,
  onClick?: string,               // query name
  href?: string,                  // alternativa a onClick
  disabled?, hidden?, at?
})

.addIconButton(id, {
  prefixIcon: string,             // "/icon:antd/dashboard-outlined"
  text?: string,
  type?: "default" | "primary" | "dashed" | "text" | "link",
  shape?: "default" | "circle" | "round",
  onClick?: string,
  disabled?, hidden?, at?
})

.addFloatingButton(id, {
  icon?: string,
  buttons?: Array<{ id, label, icon?, onClick? }>,
  hidden?, at?
})
```

#### Inputs de formulario

```typescript
.addInput(id, {
  label?: string,
  placeholder?: string,
  defaultValue?: string,
  required?: boolean,
  disabled?, hidden?,
  allowClear?: boolean,
  showCount?: boolean,
  maxLength?: number,
  at?
})

.addTextArea(id, {
  // Igual que input +
  minRows?: number,
  maxRows?: number,
})

.addNumberInput(id, {
  label?, placeholder?, defaultValue?,
  min?: number,
  max?: number,
  step?: number,
  required?, disabled?, hidden?, at?
})

.addSelect(id, {
  label?, placeholder?, defaultValue?,
  options?: Array<{ label: string, value: string }> | string,  // estático o expresión
  allowClear?, showSearch?,
  disabled?, hidden?, at?
})

.addMultiSelect(id, opts)         // Igual que select pero array

.addCheckbox(id, {
  label?, defaultValue?: boolean,
  disabled?, hidden?, at?
})

.addSlider(id, {
  label?, defaultValue?: number,
  min?, max?, step?,
  disabled?, hidden?, at?
})

.addRangeSlider(id, opts)         // Igual que slider, array
```

#### Display

```typescript
.addText(id, {
  text: string,                   // Markdown + HTML + {{ }}
  autoHeight?: boolean,
  hidden?, at?
})

.addImage(id, {
  src: string,                    // URL o {{ }}
  altText?: string,
  autoHeight?: boolean,
  hidden?, at?
})

.addIcon(id, {
  icon: string,                   // "/icon:antd/check"
  iconSize?: string,              // "20px"
  autoHeight?: boolean,
  hidden?, at?
})

.addDivider(id, {
  title?: string,
  align?: "left" | "center" | "right",
  vertical?: boolean,
  hidden?, at?
})

.addAvatar(id, {
  src?: string,
  text?: string,
  shape?: "circle" | "square",
  size?: "large" | "default" | "small" | number,
  hidden?, at?
})

.addProgress(id, {
  value: number | string,         // 0-100 o {{ }}
  showInfo?: boolean,
  status?: "normal" | "active" | "success" | "exception",
  hidden?, at?
})

.addProgressCircle(id, opts)      // Igual que progress

.addTimer(id, {
  defaultValue?: number,          // ms
  format?: string,                // "HH:mm:ss" o "D[d] HH[h] mm[m]"
  type?: "stopwatch" | "countdown",
  hidden?, at?
})

.addMermaid(id, {
  diagram: string,                // código mermaid
  hidden?, at?
})

.addJsonLottie(id, {
  value: string,                  // URL JSON Lottie
  speed?: number,
  loop?: boolean,
  autoPlay?: boolean,
  hidden?, at?
})
```

#### Tablas

```typescript
.addTable(id, {
  data: string,                   // "{{query.data}}"
  columns?: Array<{
    title: string,
    dataIndex: string,            // soporta nested: "company.name"
    key?: string,
    isTag?: boolean,
    isLink?: boolean,
    editable?: boolean,
    width?: number,
  }>,
  showFilter?: boolean,
  showDownload?: boolean,
  showRefresh?: boolean,
  pagination?: boolean,
  pageSize?: number,
  hidden?, at?
})
```

#### Charts

```typescript
.addLineChart(id, {
  title?: string,
  data: string,                   // "{{q.data}}"
  xAxisKey: string,
  yAxisKeys: string[],            // ["serie1", "serie2"]
  stacked?: boolean,
  showLabel?: boolean,
  hidden?, at?
})

.addBarChart(id, opts)            // Igual que lineChart

.addPieChart(id, {
  title?, data, hidden?, at?,
  labelKey: string,
  valueKey: string,
  donut?: boolean,
})

.addFunnelChart(id, {
  title?, data,
  labelKey: string,
  valueKey: string,
  hidden?, at?
})

.addRadarChart(id, {
  title?, data,
  indicatorKey: string,
  valueKeys: string[],
  hidden?, at?
})

.addHeatmapChart(id, {
  title?, data,
  xAxisKey: string,
  yAxisKey: string,
  valueKey: string,
  hidden?, at?
})

.addGaugeChart(id, {
  title?,
  value: number | string,         // 0-100 o expresión
  unit?: string,                  // "%"
  chartType?: "Default" | "Stage" | "Grade" | "Temperature" | "Clock" | "Barometer" | "MultiTitle" | "Ring",
  hidden?, at?
})
// ⚠️ gaugeChart es buggy. Prefiere progressCircle si solo necesitas mostrar un %
```

#### Layout y containers

```typescript
.addContainer(id, {
  autoHeight?: boolean,
  scrollbars?: boolean,
  hidden?, at?
})

.addCard(id, {
  title?: string,
  showTitle?: boolean,
  showHoverEffect?: boolean,
  cardType?: "custom" | "common",
  hidden?, at?
})
```

#### Genérico (para cualquier compType nativo o de plugin)

```typescript
.addComponent(id, type, options)

// Ejemplo: usar un plugin instalado
.addComponent("widget1", "my-npm-package/MyComp", { ... })

// O un componente nativo no cubierto por wrappers:
.addComponent("cal", "calendar", {
  events: "{{query.data}}",
  defaultView: "month",
})
```

### Queries

```typescript
.addFetchQuery(id, {              // RECOMENDADO para APIs públicas
  url: string,
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  headers?: Record<string, string>,
  body?: unknown,                 // object o string
  triggerType?: "automatic" | "manual" | "onPageLoad",
})

.addJsQuery(id, {
  script: string,                 // ⚠️ NO uses await top-level. Usa return ...then(...)
  triggerType?, timeout?,
})

.addRestQuery(id, {               // Requiere datasourceId configurado en Lowcoder
  url: string,
  method?,
  headers?: Record<string, string>,
  params?: Record<string, string>,
  body?: string | Record<string, unknown>,
  bodyType?: "json" | "raw" | "form" | "urlencoded" | "none" |
             "application/json" | "text/plain" | ...,
  triggerType?,
  datasourceId?: string,          // ID del datasource en tu instancia
  timeout?: number,
})

.addSqlQuery(id, {
  sql: string,
  datasourceId: string,
  dbType?: "mysql" | "postgres" | "mssql",
  triggerType?, timeout?,
})

.addQuery(id, type, options)      // Genérico, type = "mongodb" | "redis" | "es" | etc.
```

### Estado y configuración

```typescript
.addTempState(name, initialValue) // Accesible como {{name.value}}

.withSettings({
  description?: string,
  category?: string,              // "Business", "Tools", etc.
  themeId?: string,
  showHeaderInPublic?: boolean,
  gridColumns?: number,           // default 24
  gridRowHeight?: number,         // default 8 (px)
  gridPaddingX?: number,          // default 20
  gridPaddingY?: number,          // default 20
})

.withPreload({
  script?: string,                // JS global (window.fmt, helpers, etc.)
  css?: string,                   // CSS global
  libs?: string[],                // URLs de librerías npm UMD
})
```

### Output

```typescript
.build()                          // Retorna LowcoderDSL (objeto JS)
.toJSON()                         // JSON.stringify pretty
.deploy(client, orgId?, {         // orgId opcional — si se omite, se auto-detecta
  folderId?: string,              // del workspace activo del usuario via /api/v1/users/me
  publish?: boolean,
})                                // Retorna ApplicationView con applicationId
```

## Clase LowcoderClient

Cliente HTTP para la API REST de Lowcoder.

```typescript
new LowcoderClient({
  baseUrl: string,                // Sin trailing slash
  apiKey?: string,                // Recomendado
  email?: string,                 // Alternativa
  password?: string,
})
```

### Métodos

```typescript
client.authenticate()             // Obtiene JWT si usaste email+password

// Usuario y organizaciones (descubrir orgId automáticamente)
client.getCurrentUser(): Promise<CurrentUserResponse>
  // → { id, currentOrgId, username, uiLanguage, avatar, orgAndRoles, connections }

client.getCurrentOrgId(): Promise<string>
  // Atajo al currentOrgId del workspace activo

client.listMyOrgs(): Promise<Array<OrgInfo & { role, isCurrent }>>
  // Todas las orgs del usuario, con la activa primero

// Apps
client.createApp({
  orgId, name, applicationType: 1 | 2 | 3 | 6,
  editingApplicationDSL: LowcoderDSL,
  folderId?, publicToAll?
}): Promise<ApplicationView>

client.updateApp(appId, dsl, { publish? }): Promise<ApplicationView>
client.getApp(appId): Promise<ApplicationView>
client.publishApp(appId): Promise<void>
client.listApps(orgId?): Promise<ApplicationMeta[]>
client.deleteApp(appId): Promise<void>
```

#### Descubrir tu `orgId` cuando no lo sabes

```typescript
// Opción 1: atajo directo (1 línea)
const orgId = await client.getCurrentOrgId();

// Opción 2: ver todas tus orgs y elegir
const orgs = await client.listMyOrgs();
orgs.forEach(o => console.log(`${o.id}  ${o.name}  ${o.isCurrent ? "← activa" : ""}`));
const myOrg = orgs.find(o => o.name === "Mi Workspace")!.id;

// Opción 3: usuario completo con metadata
const me = await client.getCurrentUser();
console.log(`Usuario: ${me.username}, workspaces: ${me.orgAndRoles.length}`);
```

### `applicationType` values

| Valor | Tipo |
| --- | --- |
| `1` | Application (normal) |
| `2` | Module |
| `3` | Navigation Layout |
| `6` | Mobile Tab Layout |

## Tipos exportados

```typescript
type UICompType =
  | "button" | "input" | "textArea" | "text" | "select" | "table"
  | "lineChart" | "barChart" | "pieChart" | "funnelChart" | "radarChart"
  | "gaugeChart" | "heatmapChart" | "mermaid" | "card" | "container"
  | "modal" | "drawer" | "calendar" | "kanban" | "form" | "iframe"
  | "progress" | "progressCircle" | "timer" | "avatar" | "icon"
  // ... ~80 tipos en total
  ;

type ResourceType =
  | "restApi" | "js" | "mysql" | "postgres" | "mongodb"
  | "redis" | "es" | "graphql" | "googleSheets" | "smtp"
  | "oracle" | "mssql" | "snowflake" | "libraryQuery"
  ;

interface LowcoderDSL {
  ui: { items: Record<string, GridItemDSL>, layout: Record<string, LayoutItem> };
  queries: QueryDSL[];
  tempStates: TempStateDSL[];
  transformers: TransformerDSL[];
  settings: AppSettingsDSL;
  preload: PreloadDSL;
}
```

## Utilidades

```typescript
import { genGridKey, genQueryId, AutoLayout, DslBuilder } from "@aorizondo/lowcoder-agent-sdk-core";

genGridKey()           // hex de hasta 8 chars, igual que Lowcoder frontend
genQueryId(len = 24)   // alfanumérico lowercase

// Layout manual sin pasar por LowcoderApp:
const layouts = AutoLayout.compute(components, COMPONENT_DEFAULT_SIZES);

// Build sin pasar por LowcoderApp:
const dsl = DslBuilder.build({ title, components, queries, ... });
```

## Patrones avanzados

### Generar componentes en loop

```typescript
const kpis = [
  { id: "kpi1", label: "Usuarios", value: "{{loadUsers.data?.length || 0}}" },
  { id: "kpi2", label: "Ventas", value: "{{fmt.currency(salesTotal)}}" },
  { id: "kpi3", label: "Tickets", value: "{{tickets.data?.open || 0}}" },
];

kpis.forEach((kpi, i) => {
  app.addText(kpi.id, {
    text: `<div class="kpi-label">${kpi.label}</div><div class="kpi-num">${kpi.value}</div>`,
    at: { x: i * 8, y: 0, w: 8, h: 18 },
  });
});
```

### Reusar bloques entre apps

```typescript
function addHeader(app: LowcoderApp, title: string) {
  return app
    .addText("title", { text: `## ${title}`, at: { x: 0, y: 0, w: 18, h: 8 } })
    .addImage("logo", { src: "https://.../logo.svg", at: { x: 18, y: 0, w: 6, h: 8 } })
    .addDivider("hdr_div", { at: { x: 0, y: 8, w: 24, h: 3 } });
}

const dashboard = new LowcoderApp("Dashboard");
addHeader(dashboard, "Mi Dashboard");
addHeader(otroDashboard, "Otro Dashboard");
```

### Inspeccionar sin desplegar

```typescript
console.log(app.toJSON());        // imprime DSL completo
fs.writeFileSync("debug.json", app.toJSON());
```

### Importar/exportar entre instancias

```typescript
// Exportar
const dsl = (await client.getApp("app-id-source")).applicationDSL;
fs.writeFileSync("app-backup.json", JSON.stringify(dsl));

// Importar en otra instancia
const dsl = JSON.parse(fs.readFileSync("app-backup.json", "utf-8"));
await otherClient.createApp({
  orgId: "new-org-id",
  name: "Restored App",
  applicationType: 1,
  editingApplicationDSL: dsl,
});
```
