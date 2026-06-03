/**
 * Crear un datasource desde código y usarlo en queries.
 *
 * Este ejemplo crea un datasource REST API contra dummyjson.com,
 * y construye una app que ejecuta queries contra ese datasource.
 *
 * Para BD reales (Postgres, MySQL, MongoDB, etc.) cambia el método
 * builder (postgres/mysql/mongodb/...) y la query a SQL/Mongo.
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
console.log("Workspace:", orgId);

// ─── 1. Crear (o reusar) un datasource ──────────────────────────────────────

const DS_NAME = "DummyJSON Public API";
let ds = (await client.listDatasources(orgId)).find((d) => d.name === DS_NAME);

if (!ds) {
  const req = datasource(DS_NAME)
    .restApi({
      url: "https://dummyjson.com",
      headers: [{ key: "Accept", value: "application/json" }],
      authConfig: { type: "NO_AUTH" },
    })
    .inOrg(orgId)
    .build();

  // Probar conexión antes de crear
  console.log("Probando conexión...");
  await client.testDatasource(req);

  ds = await client.createDatasource(req);
  console.log("✅ Datasource creado:", ds.id);
} else {
  console.log("✅ Datasource ya existía:", ds.id);
}

// ─── 2. Crear app que use el datasource ────────────────────────────────────

const app = new LowcoderApp("Productos via datasource")
  .withSettings({ category: "Business" })

  .addText("title", {
    text: "## 🛍️ Catálogo (datasource compartido)",
    at: { x: 0, y: 0, w: 24, h: 8 },
  })

  .addInput("searchInput", {
    label: "Buscar",
    placeholder: "iphone, watch, perfume...",
    at: { x: 0, y: 8, w: 8, h: 8 },
  })

  .addButton("searchBtn", {
    text: "Buscar",
    type: "submit",
    onClick: "searchProducts",
    loading: "{{searchProducts.isFetching}}",
    at: { x: 8, y: 8, w: 4, h: 8 },
  })

  .addTable("productsTable", {
    data: "{{searchProducts.data?.products}}",
    columns: [
      { title: "ID", dataIndex: "id" },
      { title: "Título", dataIndex: "title" },
      { title: "Categoría", dataIndex: "category", isTag: true },
      { title: "Precio", dataIndex: "price" },
      { title: "Rating", dataIndex: "rating" },
      { title: "Stock", dataIndex: "stock" },
    ],
    pageSize: 10,
    at: { x: 0, y: 16, w: 24, h: 50 },
  })

  // Query REST que apunta al datasource creado
  .addRestQuery("searchProducts", {
    url: "/products/search",                  // relativo a https://dummyjson.com
    method: "GET",
    params: { q: "{{searchInput.value || 'iphone'}}", limit: "20" },
    datasourceId: ds.id,
    triggerType: "automatic",
  });

const result = await app.deploy(client);
const appId = result.applicationInfoView.applicationId;
console.log(`\n✅ App creada usando datasource ${ds.id}`);
console.log(`   ${process.env.LOWCODER_BASE_URL}/apps/${appId}/view`);
