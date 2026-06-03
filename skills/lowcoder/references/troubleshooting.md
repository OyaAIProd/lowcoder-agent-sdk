# Troubleshooting

Soluciones a errores comunes. Si encuentras un caso no cubierto, abre un [issue](https://github.com/aorizondo/lowcoder-agent-sdk/issues).

## Errores de queries

### `Datasource cannot be found` o `Datasource #JS_CODE cannot be found`

**Causa:** Lowcoder versión <2.7.0 — bug upstream donde `getById()` no maneja el ID especial `#JS_CODE`.

**Fix:** actualiza Lowcoder a 2.7.0 o superior. En Easypanel:

1. Service → cambiar imagen a `lowcoderorg/lowcoder-ce-api-service:2.7.6`
2. Lo mismo para `lowcoder-ce-node-service:2.7.6` y `lowcoder-ce-frontend:2.7.6`
3. Deploy

Datos en MongoDB son compatibles, no se pierden.

### `await is only valid in async functions and the top level bodies of modules`

**Causa:** tu script JS query usa `await` directo. Lowcoder envuelve el script en `function() { ... }` no-async.

**Fix:** usa `.then()` y `return` la Promise.

```javascript
// ❌ Mal
const res = await fetch("https://api.example.com/users");
return await res.json();

// ✅ Bien
return fetch("https://api.example.com/users").then(function(res) {
  return res.json();
});
```

Si usas `addJsQuery()` del SDK, asegúrate de aplicar este patrón al script. `addFetchQuery()` ya lo hace correctamente.

### Query JS no se ejecuta (sin error, sin datos)

**Causa:** el `queryId` no empieza con `"js:"`. Lowcoder detecta queries JS por el prefijo del ID.

**Fix:** el SDK actual hace esto automático. Si construyes el JSON a mano, asegúrate:

```json
{ "id": "js:abc123...", "compType": "js", ... }
```

### `Type definition error: Cannot construct instance of java.lang.String[]`

**Causa:** estás llamando `/api/query/execute` con `path` como string.

**Fix:** `path` debe ser array: `path: ["queries", "loadUsers"]` o `path: []` para queries en la raíz.

### `Oops! Service is busy, please try again later.`

**Causa A:** el endpoint que llamaste no existe (Lowcoder devuelve este genérico para 404 y 500).

**Fix:** verifica el path correcto. Algunos endpoints requieren versión de API: `/api/v1/...`

**Causa B:** node-service caído.

**Fix:** `docker ps | grep node-service` — si no aparece o está reiniciándose, reinícialo desde Easypanel.

### Queries REST fallan con 401

**Causa:** el `datasourceId` apunta a un datasource que no existe o no tienes permisos.

**Fix:** verifica con `get_app_dsl({ appId, simplified: false })` el `datasourceId` real. Si es REST sin datasource configurado, usa **`addFetchQuery()`** (JS interno) en lugar de `addRestQuery()`.

## Errores de componentes

### `Error: Component XxxChart Not Found` (en `/view`)

**Causa:** los charts especializados (`lineChart`, `barChart`, etc.) son componentes remotos del paquete `lowcoder-comps`. En modo `/view` se cargan dinámicamente — si tu app no se ha publicado o hay un problema de red al cargar el bundle, falla.

**Fix:**

1. Verifica que la app esté publicada: `deploy_app({ appId })`
2. Verifica console del browser para ver qué URL falló (típicamente `/api/npm/registry/...`)
3. Si es 500 en ese endpoint, el api-service no puede contactar al node-service. Revisa logs del api-service

### Tabla muestra `[object Object]` en una columna

**Causa:** `dataIndex` apunta a un objeto, no a una primitiva.

**Fix:** usa notación path para acceder a campos anidados:

```typescript
columns: [
  { title: "Ciudad", dataIndex: "address.city" },          // ✅
  { title: "Compañía", dataIndex: "company.name" },        // ✅
  { title: "Ciudad", dataIndex: "address" },               // ❌ muestra [object Object]
]
```

### Gauge chart no muestra mis datos / muestra default 60%

**Causa:** `gaugeChart` requiere un `echartsOption` con estructura ECharts compleja específica por subtipo (Default/Stage/Grade/Clock/Barometer/etc.).

**Fix:** usa `progressCircle` si solo necesitas mostrar un % (visualmente similar y funciona always):

```typescript
app.addProgressCircle("cpu", { value: 68, at: { ... } });
```

### Progress bar siempre al 60% sin mis datos

**Causa:** estás pasando `value: { value: 60 }` (objeto envuelto) en lugar del valor directo.

**Fix:** el SDK ya pasa `value` como string. Si construyes a mano:

```typescript
"value": "60"        // ✅ string o número
"value": 60          // ✅
"value": { value: 60 }  // ❌ Lowcoder lo ignora y usa el default
```

### Componentes no se renderizan en `/edit`

**Causa:** errores de carga del bundle remoto, o un componente con `compType` inválido.

**Fix:**

1. Abre devtools del navegador → tab Network. Busca requests fallidos
2. Verifica el `compType` con `get_component_types()` — typos como `lineChar` vs `lineChart` rompen todo

### Componentes con auto-layout se solapan

**Causa:** el auto-layout del SDK es bin-packing first-fit. Si tienes componentes muy grandes (h:50+) sin posición manual, pueden acumularse mal.

**Fix:** especifica `at` para los componentes grandes (tablas, charts grandes). El SDK auto-posiciona los pequeños alrededor.

## Errores de SEO

### Title y meta description aparecen como los default de Lowcoder

**Causa:** Lowcoder inyecta sus meta tags DESPUÉS de tu preload script. Tu script corrió primero, Lowcoder pisó tus valores.

**Fix:** usa `configure_seo` tool (incluye retries con `setTimeout` a 500ms, 2s, 5s para re-aplicar).

Si construyes preload manual, replica el patrón:

```javascript
function safeApply() {
  document.title = "Mi App";
  setMeta("description", "...");
  // ...
}
safeApply();
setTimeout(safeApply, 500);
setTimeout(safeApply, 2000);
setTimeout(safeApply, 5000);
```

### OG image no aparece al compartir

**Causa A:** la URL no es absoluta o no es accesible públicamente.

**Fix:** usa URL absoluta HTTPS, verifica que sea accesible sin autenticación.

**Causa B:** Lowcoder requiere autenticación para ver la app, los crawlers no pueden ver el HTML con tus meta tags.

**Fix:** marca la app como pública: `client.updateApp(appId, dsl)` con `publicToAll: true` en createApp request, o desde la UI.

## Errores de deployment

### `Authentication failed`

**Causa:** API key inválida o expirada.

**Fix:** regenera el API key desde la UI: Profile → API Keys → Create new key. Actualiza la variable de entorno.

### App creada pero no aparece en la UI

**Causa:** la app se creó en otra organización.

**Fix:** verifica `orgId`. Lista las apps con `list_apps()` y revisa los `orgId` de las existentes.

### `Insufficient permissions`

**Causa:** el usuario del API key no tiene rol Editor/Owner en la organización.

**Fix:** desde la UI, asigna rol adecuado al usuario o usa el API key de otro usuario con permisos.

## Errores del SDK / build

### `Cannot find module '@aorizondo/lowcoder-agent-sdk-core'`

**Causa:** no instalado o tipo de import incorrecto.

**Fix:**

```bash
npm install @aorizondo/lowcoder-agent-sdk-core
```

Verifica `package.json` de tu proyecto tenga `"type": "module"` para usar `import`. Si usas CommonJS, usa `require()`.

### TypeScript errors al usar el SDK

**Causa:** TypeScript estricto rechaza algunas propiedades por la tipificación abierta del DSL.

**Fix:** asegúrate de tener `"moduleResolution": "NodeNext"` y `"module": "NodeNext"` en tu `tsconfig.json`.

### `npx tsx` falla con `Cannot use import outside a module`

**Causa:** tu `package.json` no tiene `"type": "module"`.

**Fix:**

```bash
npm pkg set type=module
```

O usa `npx tsx --no-warnings script.ts` con extensión `.mts`.

## Errores de versiones

### Mi instancia Lowcoder es 2.6.5 — ¿necesito actualizar?

**Sí, fuertemente recomendado.** En 2.6.5 las queries JS fallan completamente por un bug upstream. Actualiza a 2.7.0+ siguiendo la sección "Datasource cannot be found" arriba.

### `Component X is deprecated`

**Causa:** algunos componentes legacy fueron renombrados (ej: `chart` → `lineChart` específicos).

**Fix:** revisa el catálogo en [sdk-reference.md](sdk-reference.md) y usa el equivalente moderno.

## Debugging

### Ver el DSL generado antes de desplegar

```typescript
console.log(app.toJSON());
// O guardarlo a archivo para inspección
fs.writeFileSync("debug.json", app.toJSON());
```

### Comparar con una app que funciona

```typescript
const working = await client.getApp("app-id-que-funciona");
fs.writeFileSync("working.json", JSON.stringify(working.applicationDSL, null, 2));
```

Luego compara campo por campo con tu output.

### Logs del servidor (vía SSH al VPS)

```bash
docker logs --tail 100 -f $(docker ps -q --filter name=lowcoder-api-service)
docker logs --tail 100 -f $(docker ps -q --filter name=lowcoder-node-service)
```

### Test endpoint sin agente

```bash
curl -X POST https://tu-lowcoder.com/api/v1/applications \
  -H "Authorization: Bearer $LOWCODER_API_KEY" \
  -H "Content-Type: application/json" \
  -d @app-debug.json
```

## Pedir ayuda

Si el problema persiste:

1. Verifica versión Lowcoder (debe ser ≥2.7.0)
2. Verifica versión SDK (`npm list @aorizondo/lowcoder-agent-sdk-core`)
3. Captura logs del api-service y node-service
4. Captura el DSL generado (`app.toJSON()`)
5. Abre [issue](https://github.com/aorizondo/lowcoder-agent-sdk/issues) con esos datos
