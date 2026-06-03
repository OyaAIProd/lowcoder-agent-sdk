# @aorizondo/lowcoder-agent-sdk-core

SDK TypeScript para crear aplicaciones [Lowcoder](https://github.com/lowcoder-org/lowcoder) desde código en lugar de arrastrar elementos.

## Instalación

```bash
npm install @aorizondo/lowcoder-agent-sdk-core
```

## Uso básico

```typescript
import { LowcoderApp, LowcoderClient } from "@aorizondo/lowcoder-agent-sdk-core";

// 1. Construir la app
const app = new LowcoderApp("Mi Dashboard")
  .addText("title", { text: "## Bienvenido" })
  .addButton("refresh", { text: "Cargar", onClick: "loadData" })
  .addTable("table1", {
    data: "{{loadData.data}}",
    columns: [
      { title: "ID", dataIndex: "id" },
      { title: "Nombre", dataIndex: "name" },
    ],
  })
  .addFetchQuery("loadData", {
    url: "https://jsonplaceholder.typicode.com/users",
    triggerType: "automatic",
  });

// 2. Inspeccionar el DSL generado (sin desplegar)
console.log(app.toJSON());

// 3. Desplegar a una instancia Lowcoder
const client = new LowcoderClient({
  baseUrl: "https://tu-lowcoder.ejemplo.com",
  apiKey: process.env.LOWCODER_API_KEY!,
});
// orgId es opcional — se auto-detecta llamando /api/v1/users/me
const result = await app.deploy(client);
console.log(`https://tu-lowcoder.ejemplo.com/apps/${result.applicationInfoView.applicationId}/edit`);
```

## API

### `LowcoderApp`

Builder fluido para construir el DSL de una app.

#### Componentes (todos retornan `this` para chaining)

| Método | Descripción |
| --- | --- |
| `addButton(id, opts)` | Botón con `text`, `onClick` (nombre de query), `disabled`, `loading` |
| `addInput(id, opts)` | Input de texto con `label`, `placeholder`, `defaultValue` |
| `addTextArea(id, opts)` | Área de texto multilínea |
| `addNumberInput(id, opts)` | Input numérico con `min`, `max`, `step` |
| `addText(id, { text })` | Markdown/HTML estático |
| `addTable(id, opts)` | Tabla con `data`, `columns`, `pageSize` |
| `addSelect(id, opts)` | Select con `options: [{label, value}]` |
| `addMultiSelect(id, opts)` | Multi-select |
| `addCheckbox(id, opts)` | Checkbox |
| `addSlider(id, opts)` | Slider con `min/max/step` |
| `addDivider(id, opts)` | Línea divisoria con `title` opcional |
| `addImage(id, { src })` | Imagen |
| `addContainer(id, opts)` | Contenedor |
| `addCard(id, opts)` | Card con sombra |
| `addLineChart(id, opts)` | Line chart con `data, xAxisKey, yAxisKeys` |
| `addBarChart(id, opts)` | Bar chart |
| `addPieChart(id, opts)` | Pie chart con `labelKey, valueKey, donut?` |
| `addFunnelChart(id, opts)` | Funnel chart |
| `addRadarChart(id, opts)` | Radar chart |
| `addHeatmapChart(id, opts)` | Heatmap |
| `addGaugeChart(id, opts)` | Gauge con `value, min, max, unit` |
| `addProgress(id, opts)` | Progress bar lineal |
| `addProgressCircle(id, opts)` | Progress circular |
| `addTimer(id, opts)` | Cronómetro / countdown |
| `addAvatar(id, opts)` | Avatar con `src` o `text` |
| `addMermaid(id, { diagram })` | Diagrama Mermaid |
| `addIcon(id, opts)`, `addIconButton(id, opts)` | Iconos |
| `addLink(id, opts)`, `addFloatingButton(id, opts)` | Links y botones flotantes |
| `addJsonLottie(id, opts)` | Animación Lottie |
| `addComponent(id, type, opts)` | **Genérico** — usa cualquier `compType` nativo o de plugin |

Cualquier método de componente acepta `at: { x, y, w?, h? }` opcional para layout manual en grid de 24 columnas. Sin `at`, el SDK auto-posiciona con bin-packing.

#### Queries

| Método | Descripción |
| --- | --- |
| `addFetchQuery(id, { url, method?, body?, triggerType? })` | **Recomendado** para APIs públicas. Genera JS query con fetch interno, sin necesitar datasource configurado |
| `addJsQuery(id, { script, triggerType? })` | JS query custom. El script debe `return` una Promise (sin `await` top-level) |
| `addRestQuery(id, opts)` | REST query (requiere `datasourceId` configurado en la instancia) |
| `addSqlQuery(id, { sql, datasourceId, dbType? })` | SQL para `mysql`, `postgres`, `mssql` |
| `addQuery(id, type, opts)` | Genérico para cualquier tipo de datasource |

#### Estado y configuración

| Método | Descripción |
| --- | --- |
| `addTempState(name, initialValue)` | Estado temporal accesible vía `{{stateName.value}}` |
| `withSettings({ description?, category?, gridPaddingX?, ... })` | Configuración general |
| `withPreload({ script?, css?, libs? })` | JS y CSS globales |

#### Salida

| Método | Descripción |
| --- | --- |
| `build()` | Retorna el `LowcoderDSL` (objeto JS) |
| `toJSON()` | String JSON formateado |
| `deploy(client, orgId, { publish?, folderId? })` | Crea la app en Lowcoder via API |

### `LowcoderClient`

Cliente HTTP para la REST API de Lowcoder.

```typescript
const client = new LowcoderClient({
  baseUrl: "https://lowcoder.example.com",
  apiKey: "...",       // O usar email + password
});

// Apps
await client.createApp({ orgId, name, applicationType: 1, editingApplicationDSL });
await client.updateApp(appId, dsl);
await client.getApp(appId);
await client.publishApp(appId);
await client.listApps(orgId);
await client.deleteApp(appId);

// Usuario y organizaciones (descubrir orgId)
await client.getCurrentUser();    // { id, currentOrgId, username, orgAndRoles, ... }
await client.getCurrentOrgId();   // "69b44d7a..." — el workspace activo
await client.listMyOrgs();        // [{ id, name, role, isCurrent }, ...] ordenadas
```

## Expresiones `{{ }}`

En cualquier propiedad puedes usar JavaScript entre llaves dobles:

```typescript
{
  data: "{{loadUsers.data}}",
  disabled: "{{!form1.valid}}",
  text: "Hola {{currentUser.name}}",
  options: "{{query.data.map(x => ({label: x.name, value: x.id}))}}",
}
```

Librerías globales: `dayjs`, `lodash`, `numbro`, `uuid`, `papaparse`.

## Requisitos

- Node.js >= 18
- Lowcoder >= 2.7.0 (versiones anteriores tienen bug con queries JS — ver [troubleshooting](https://github.com/aorizondo/lowcoder-agent-sdk/blob/main/docs/troubleshooting.md))

## Documentación completa

- [Getting Started](https://github.com/aorizondo/lowcoder-agent-sdk/blob/main/docs/getting-started.md)
- [SDK Reference](https://github.com/aorizondo/lowcoder-agent-sdk/blob/main/docs/sdk-reference.md)
- [Ejemplos](https://github.com/aorizondo/lowcoder-agent-sdk/tree/main/examples)

## Licencia

MIT © Antonio Orizondo Leyva
