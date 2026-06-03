# Datasources

Guía completa para gestionar **datasources** (orígenes de datos) en Lowcoder via SDK y MCP.

> Doc oficial: <https://docs.lowcoder.cloud/lowcoder-documentation/connect-your-data/data-source-basics>

## ¿Qué es un datasource?

Un datasource es una conexión configurada a un sistema externo (base de datos, API, SaaS) que tus apps pueden usar en queries. Lowcoder soporta dos categorías:

- **Java plugins** (en el api-service): SQL, MongoDB, Redis, Elasticsearch, REST, GraphQL, SMTP, Google Sheets
- **JS plugins** (en el node-service): ~60 plugins más como S3, Slack, Jira, OpenAI, Stripe, Shopify, Twilio, etc.

Adicionalmente, Lowcoder expone **datasources "system static"** que no requieren configuración:

| ID | Tipo | Uso |
| --- | --- | --- |
| `#JS_CODE` | `javaScriptCode` | Queries JS in-app (el SDK lo usa automáticamente) |
| `#QUICK_REST_API` | `restApi` | REST queries sin datasource configurado |
| `#QUICK_GRAPHQL` | `graphql` | GraphQL queries sin datasource configurado |

Para una query JS o REST simple **NO necesitas crear un datasource** — usa `addFetchQuery()` del SDK que apunta a `#JS_CODE` automáticamente.

**Crea un datasource cuando:** tienes credenciales que compartir entre múltiples queries (auth, base URL), o cuando conectas a una BD/SaaS específica.

---

## Catálogo de tipos soportados

### Bases de datos SQL

| `type` | Puerto default | Notas |
| --- | --- | --- |
| `postgres` | 5432 | PostgreSQL |
| `mysql` | 3306 | MySQL |
| `mariadb` | 3306 | MariaDB (mismo driver que MySQL) |
| `mssql` | 1433 | Microsoft SQL Server |
| `oracle` | 1521 | Oracle (requiere `sid` o `serviceName` o `jdbcUrl`) |
| `clickHouse` | 8123 | ClickHouse |
| `snowflake` | — | Snowflake (host = account identifier) |

### NoSQL / Cache / Search

| `type` | Notas |
| --- | --- |
| `mongodb` | MongoDB. Soporta URI o config separada con replica sets |
| `redis` | Redis. Soporta URI o config separada |
| `es` | Elasticsearch (connection string con nodos separados por coma) |

### APIs

| `type` | Notas |
| --- | --- |
| `restApi` | REST con auth Basic/Digest/OAuth-inherit, SSL config, cookies forwarding |
| `graphql` | GraphQL (sin SSL config) |
| `smtp` | SMTP para envío de email |
| `googleSheets` | Google Sheets (requiere service account JSON) |

### JS plugins (~60 plugins disponibles)

**Bases de datos**: dynamodb, couchdb, duckdb, fauna, turso, firebirdsql
**Big Data**: athena, bigQuery
**AI**: openAi, huggingFaceEndpoint, huggingFaceInference, did
**DevOps**: appconfig, datadog, circleCi
**Desarrollo**: openApi, postmanEcho, lowcoder, github, gitlab, lambda, firebase, supabaseApi
**Workflow**: n8n, boomi
**Messaging**: twilio, sendGrid, oneSignal
**Storage**: s3, googleCloudStorage, supabase, cloudinary, aliyunOss
**Project mgmt**: asana, jira, notion, slack
**Reports**: apiTemplate, carboneIo
**CRM**: front
**E-commerce**: stripe, shopify, woocommerce
**Web scraping**: serpApi, eodhdApi
**RPA**: uiPath

Para JS plugins **el shape exacto del config depende del plugin**. Usa `client.listJsPlugins({ appId })` o el tool MCP `list_js_plugins` para descubrir los params requeridos.

---

## SDK — Quick reference

### Listar datasources

```typescript
const orgId = await client.getCurrentOrgId();

// Todos los datasources sin paginación
const list = await client.listDatasources(orgId);
list.forEach(ds => console.log(ds.id, ds.name, ds.type));

// Con filtro y paginación
const page = await client.listDatasourcesByOrg({
  orgId,
  type: "postgres",
  name: "prod",       // substring
  pageNum: 1,
  pageSize: 50,
});

// Tipos disponibles en la instancia (incluyendo plugins JS dinámicos)
const types = await client.listDatasourceTypes(orgId);
// → [{ id: "postgres", name: "PostgreSQL", hasStructureInfo: true }, ...]
```

### Crear un datasource

#### Postgres / MySQL / MariaDB / MSSQL / ClickHouse

```typescript
import { datasource } from "@aorizondo/lowcoder-agent-sdk-core";

const orgId = await client.getCurrentOrgId();

const req = datasource("Prod Postgres")
  .postgres({
    host: "db.example.com",
    port: 5432,                 // opcional, default por tipo
    database: "app_prod",
    username: "lowcoder",
    password: "s3cr3t",
    usingSsl: true,
    serverTimezone: "UTC",
    extParams: { sslmode: "require" },
  })
  .inOrg(orgId)
  .build();

// Test connection antes de crear
const ok = await client.testDatasource(req);
if (!ok) throw new Error("Connection failed");

const ds = await client.createDatasource(req);
console.log("Datasource ID:", ds.id);
```

#### Oracle

```typescript
const req = datasource("Oracle Prod")
  .oracle({
    host: "oracle.prod",
    port: 1521,
    username: "scott",
    password: "tiger",
    serviceName: "ORCLPDB1",  // o sid o jdbcUrl
  })
  .inOrg(orgId)
  .build();
```

#### MongoDB

```typescript
// Opción A: URI
datasource("Mongo Atlas")
  .mongodb({
    usingUri: true,
    uri: "mongodb+srv://user:pwd@cluster0.example.net/mydb?retryWrites=true",
  })
  .inOrg(orgId)
  .build();

// Opción B: config separada
datasource("Mongo Replica")
  .mongodb({
    usingUri: false,
    ssl: true,
    endpoints: [
      { host: "mongo-1.internal", port: 27017 },
      { host: "mongo-2.internal", port: 27017 },
    ],
    database: "app",
    username: "lowcoder",
    password: "s3cr3t",
    authMechanism: "SCRAM_SHA_1",
  })
  .inOrg(orgId)
  .build();
```

#### Redis

```typescript
datasource("Cache")
  .redis({
    host: "redis.internal",
    port: 6379,
    username: "default",
    password: "s3cr3t",
    usingSsl: false,
  })
  .inOrg(orgId)
  .build();
```

#### Elasticsearch

```typescript
datasource("Search Cluster")
  .elasticsearch({
    connectionString: "https://es-1:9200,https://es-2:9200",
    username: "elastic",
    password: "changeme",
    usingSsl: true,
  })
  .inOrg(orgId)
  .build();
```

#### REST API con autenticación

```typescript
datasource("Stripe API")
  .restApi({
    url: "https://api.stripe.com",
    headers: [{ key: "Stripe-Version", value: "2024-01-01" }],
    authConfig: {
      type: "BASIC_AUTH",
      username: "sk_live_xxxxx",
      password: "",
    },
    sslConfig: {
      sslCertVerificationType: "VERIFY_CA_CERT",
    },
  })
  .inOrg(orgId)
  .build();
```

OAuth inheritado del login del usuario (cuando hay SSO configurado):

```typescript
datasource("GitHub via OAuth")
  .restApi({
    url: "https://api.github.com",
    authConfig: {
      type: "OAUTH2_INHERIT_FROM_LOGIN",
      authId: "github-oauth-provider-id",
    },
  })
  .inOrg(orgId)
  .build();
```

#### GraphQL

```typescript
datasource("Hasura")
  .graphql({
    url: "https://hasura.example.com/v1/graphql",
    headers: [{ key: "x-hasura-admin-secret", value: "..." }],
  })
  .inOrg(orgId)
  .build();
```

#### SMTP (envío de email)

```typescript
datasource("SendGrid SMTP")
  .smtp({
    host: "smtp.sendgrid.net",
    port: 587,
    username: "apikey",
    password: "SG.xxx",
  })
  .inOrg(orgId)
  .build();
```

#### Google Sheets

```typescript
import fs from "node:fs";

const serviceAccountJson = fs.readFileSync("./service-account.json", "utf-8");

datasource("Spreadsheet")
  .googleSheets({ serviceAccount: serviceAccountJson })
  .inOrg(orgId)
  .build();
```

#### S3 (JS plugin)

Primero descubre el schema:

```typescript
// Necesitas un appId existente para que el server cargue los plugins
const apps = await client.listApps(orgId);
const appId = apps[0].applicationId;

const plugins = await client.listJsPlugins({ appId, type: "s3" });
console.log(plugins.data[0].datasource.pluginDefinition);
```

Luego crea:

```typescript
datasource("My S3")
  .jsPlugin("s3", {
    accessKey: "AKIA...",
    secretKey: "....",
    endpointUrl: "https://s3.us-east-1.amazonaws.com",
    region: "us-east-1",
    specVersion: "v1.0",
  })
  .inOrg(orgId)
  .build();
```

### Actualizar un datasource

```typescript
// ⚠️ IMPORTANTE: omite los secrets que quieras preservar
await client.updateDatasource(dsId, {
  name: "Prod Postgres v2",
  datasourceConfig: {
    host: "new-db.example.com",
    // password NO incluido → se preserva el actual
  },
});
```

Lowcoder no devuelve los secrets en GET (security view), así que si los incluyes con `null` o vacíos los borrarías. **Omítelos** explícitamente para mantener.

### Eliminar (soft-delete)

```typescript
await client.deleteDatasource(dsId);
```

### Test connection

```typescript
const req = datasource("Test").postgres({ host: "...", ... }).inOrg(orgId).build();
try {
  const ok = await client.testDatasource(req);
  console.log("Connection OK:", ok);
} catch (e) {
  console.log("Failed:", e.message);
}
```

### Estructura de tablas/columnas

```typescript
const struct = await client.getDatasourceStructure(dsId);
struct.tables.forEach(t => {
  console.log(`${t.schema}.${t.name} (${t.type}):`);
  t.columns.forEach(c => console.log(`  ${c.name} ${c.type} ${c.isAutogenerated ? "auto" : ""}`));
});
```

Solo funciona para tipos con `hasStructureInfo === true` (SQL, MongoDB).

### Permisos

```typescript
// Listar
const perms = await client.listDatasourcePermissions(dsId);
console.log("Group permissions:", perms.groupPermissions);
console.log("User permissions:", perms.userPermissions);

// Otorgar a usuarios y/o grupos
await client.grantDatasourcePermissions(dsId, {
  role: "editor",
  userIds: ["uid1", "uid2"],
  groupIds: ["gid1"],
});

// Cambiar role de un permiso existente
await client.updateDatasourcePermission(permissionId, "viewer");

// Revocar
await client.revokeDatasourcePermission(permissionId);
```

Roles válidos: `"viewer"` | `"editor"` | `"owner"`.

---

## MCP — Tools disponibles

| Tool | Para qué |
| --- | --- |
| `list_datasources` | Lista los datasources de la org |
| `list_datasource_types` | Lista los tipos disponibles (incluyendo plugins JS) |
| `list_js_plugins` | Lista plugins JS con su SCHEMA de config |
| `create_datasource` | Crea un datasource. Por defecto prueba conexión antes (`testFirst: true`) |
| `update_datasource` | Actualiza un datasource. Omite secrets para preservarlos |
| `delete_datasource` | Soft-delete |
| `test_datasource` | Prueba conexión sin crear |
| `get_datasource_structure` | Tablas/columnas (solo SQL/Mongo) |
| `list_datasource_permissions` | Permisos del datasource |
| `grant_datasource_permission` | Otorga viewer/editor/owner a users o groups |

### Flujo típico desde un agente

```text
1. list_datasource_types({})        → ve qué tipos están disponibles
2. list_js_plugins({appId})         → si es plugin JS, ve el schema exacto
3. test_datasource({...})           → valida credenciales
4. create_datasource({...})         → crea con testFirst=true
5. (luego usa el ID en queries SQL/REST de tus apps)
```

---

## Usar el datasource en queries

Una vez creado, pasa el `datasourceId` al SDK al crear queries:

```typescript
app.addSqlQuery("loadUsers", {
  sql: "SELECT id, name, email FROM users WHERE status = '{{statusFilter.value}}'",
  datasourceId: ds.id,        // ← el ID del datasource creado
  dbType: "postgres",
  triggerType: "automatic",
});

app.addRestQuery("getUser", {
  url: "/users/{{table1.selectedRow.id}}",  // relativo a base URL del datasource
  method: "GET",
  datasourceId: ds.id,
  triggerType: "manual",
});
```

---

## Seguridad y secretos

- **Passwords**, **uris** (Mongo/Redis), **serviceAccount** (Google Sheets) están marcados como Internal y **NO se devuelven** en GET. Lowcoder los encripta antes de guardar.
- En `UPDATE`, **omite** los campos sensibles que quieras preservar — si pasas `null` o vacío Lowcoder los borraría.
- Los API keys de plugin marcados como `type: "password"` (vía `pluginDefinition.params`) también son encriptados automáticamente.
- Los datasources tienen permisos granulares (viewer/editor/owner) — solo owners pueden gestionar permisos.

---

## Limitaciones conocidas

| Limitación | Workaround |
| --- | --- |
| OAuth-2 client-credentials/auth-code no implementado en REST plugin OSS | Usa `OAUTH2_INHERIT_FROM_LOGIN` con SSO configurado, o pon el token en headers manualmente |
| `BEARER_TOKEN_AUTH` no tiene subtype registrado en OSS | Usa `BASIC_AUTH` con `username: token, password: ""` o pon el `Authorization` en headers |
| `streamApi` y `alasql` son client-only, no se persisten como datasources | Solo se crean al editar queries en la UI |
| `LowcoderApi` datasource fue removido | Migra a REST API estándar |
| Datasources "system static" (`#JS_CODE`, `#QUICK_REST_API`) no son listables ni editables | Trátalos como sentinels — para queries simples usa estos en lugar de crear datasource |
