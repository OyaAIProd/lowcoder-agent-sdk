/**
 * CRUD completo contra PostgreSQL: crea el datasource, inspecciona estructura,
 * construye la app con queries SQL parametrizadas.
 *
 * Requiere un Postgres accesible con la tabla `users(id, name, email, role, created_at)`.
 * Para test rápido puedes usar https://supabase.com — gratis.
 *
 * Variables de entorno adicionales:
 *   PG_HOST, PG_PORT, PG_DATABASE, PG_USERNAME, PG_PASSWORD
 */
import {
  LowcoderApp,
  LowcoderClient,
  datasource,
} from "@aorizondo/lowcoder-agent-sdk-core";

const client = new LowcoderClient({
  baseUrl: process.env.LOWCODER_BASE_URL!,
  apiKey: process.env.LOWCODER_API_KEY!,
});

const orgId = await client.getCurrentOrgId();

// ─── 1. Crear (o reusar) el datasource Postgres ─────────────────────────────

const DS_NAME = "Demo Postgres";
let pg = (await client.listDatasources(orgId, "postgres")).find(
  (d) => d.name === DS_NAME
);

if (!pg) {
  const req = datasource(DS_NAME)
    .postgres({
      host: process.env.PG_HOST ?? "localhost",
      port: Number(process.env.PG_PORT ?? 5432),
      database: process.env.PG_DATABASE ?? "postgres",
      username: process.env.PG_USERNAME ?? "postgres",
      password: process.env.PG_PASSWORD ?? "",
      usingSsl: true,
    })
    .inOrg(orgId)
    .build();

  console.log("Probando conexión a Postgres...");
  try {
    await client.testDatasource(req);
  } catch (e) {
    console.error("❌ Conexión fallida:", (e as Error).message);
    console.error("   Verifica PG_HOST/PORT/DATABASE/USERNAME/PASSWORD");
    process.exit(1);
  }

  pg = await client.createDatasource(req);
  console.log("✅ Datasource creado:", pg.id);
} else {
  console.log("✅ Reusando datasource existente:", pg.id);
}

// ─── 2. Inspeccionar estructura ─────────────────────────────────────────────

try {
  const struct = await client.getDatasourceStructure(pg.id);
  console.log("\nTablas:");
  struct.tables.forEach((t) => {
    const cols = t.columns.map((c) => `${c.name}:${c.type}`).join(", ");
    console.log(`  ${t.schema}.${t.name} (${cols})`);
  });
} catch (e) {
  console.log("(no se pudo obtener estructura — quizás la BD está vacía)");
}

// ─── 3. App CRUD ───────────────────────────────────────────────────────────

const app = new LowcoderApp("Postgres CRUD")
  .withSettings({ category: "Business" })

  .addText("title", {
    text: "## 👥 CRUD de usuarios (Postgres)",
    at: { x: 0, y: 0, w: 24, h: 8 },
  })

  // Form de creación
  .addInput("nameInput", { label: "Nombre", required: true, at: { x: 0, y: 8, w: 8, h: 8 } })
  .addInput("emailInput", { label: "Email", placeholder: "user@example.com", at: { x: 8, y: 8, w: 8, h: 8 } })
  .addSelect("roleSelect", {
    label: "Rol",
    options: [
      { label: "Admin", value: "admin" },
      { label: "Editor", value: "editor" },
      { label: "Viewer", value: "viewer" },
    ],
    defaultValue: "viewer",
    at: { x: 16, y: 8, w: 4, h: 8 },
  })
  .addButton("createBtn", {
    text: "Crear",
    type: "submit",
    onClick: "createUser",
    disabled: "{{!nameInput.value || !emailInput.value}}",
    loading: "{{createUser.isFetching}}",
    at: { x: 20, y: 8, w: 4, h: 8 },
  })

  // Tabla con datos
  .addTable("usersTable", {
    data: "{{loadUsers.data}}",
    columns: [
      { title: "ID", dataIndex: "id", width: 60 },
      { title: "Nombre", dataIndex: "name" },
      { title: "Email", dataIndex: "email" },
      { title: "Rol", dataIndex: "role", isTag: true },
      { title: "Creado", dataIndex: "created_at" },
    ],
    pageSize: 15,
    at: { x: 0, y: 18, w: 24, h: 50 },
  })

  // Queries SQL parametrizadas
  .addSqlQuery("loadUsers", {
    sql: "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 100",
    datasourceId: pg.id,
    dbType: "postgres",
    triggerType: "automatic",
  })
  .addSqlQuery("createUser", {
    sql: `INSERT INTO users (name, email, role) VALUES ('{{nameInput.value}}', '{{emailInput.value}}', '{{roleSelect.value}}') RETURNING id`,
    datasourceId: pg.id,
    dbType: "postgres",
    triggerType: "manual",
  });

const result = await app.deploy(client);
const appId = result.applicationInfoView.applicationId;
console.log(`\n✅ CRUD creado`);
console.log(`   ${process.env.LOWCODER_BASE_URL}/apps/${appId}/view`);
