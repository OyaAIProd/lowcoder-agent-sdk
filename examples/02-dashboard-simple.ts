/**
 * Dashboard simple con KPIs, chart y tabla.
 * Usa la API pública de dummyjson.com — funciona inmediato.
 */
import { LowcoderApp, LowcoderClient } from "@aorizondo/lowcoder-agent-sdk-core";

const app = new LowcoderApp("Dashboard Simple")
  .withSettings({ category: "Business", description: "KPIs + tabla con datos públicos" })

  // Hero
  .addText("title", {
    text: "## 📊 Dashboard de Productos",
    at: { x: 0, y: 0, w: 24, h: 8 },
  })

  // KPIs
  .addText("kpi1", {
    text: `<div style="font-size:11px;text-transform:uppercase;color:#64748b;font-weight:600">Total Productos</div>
<div style="font-size:2.25rem;font-weight:700;background:linear-gradient(135deg,#6366f1,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent">{{loadProducts.data?.total || 0}}</div>`,
    at: { x: 0, y: 8, w: 8, h: 18 },
  })
  .addText("kpi2", {
    text: `<div style="font-size:11px;text-transform:uppercase;color:#64748b;font-weight:600">Categorías</div>
<div style="font-size:2.25rem;font-weight:700;background:linear-gradient(135deg,#6366f1,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent">{{loadProducts.data?.products ? new Set(loadProducts.data.products.map(p=>p.category)).size : 0}}</div>`,
    at: { x: 8, y: 8, w: 8, h: 18 },
  })
  .addText("kpi3", {
    text: `<div style="font-size:11px;text-transform:uppercase;color:#64748b;font-weight:600">Precio promedio</div>
<div style="font-size:2.25rem;font-weight:700;background:linear-gradient(135deg,#6366f1,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent">{{loadProducts.data?.products ? '$' + (loadProducts.data.products.reduce((s,p)=>s+p.price,0)/loadProducts.data.products.length).toFixed(2) : '-'}}</div>`,
    at: { x: 16, y: 8, w: 8, h: 18 },
  })

  // Chart: productos por categoría
  .addBarChart("categoryChart", {
    title: "Productos por categoría",
    data: `{{loadProducts.data?.products ? Object.entries(loadProducts.data.products.reduce((a,p)=>{a[p.category]=(a[p.category]||0)+1;return a;},{})).map(([cat,n])=>({categoria:cat, cantidad:n})) : []}}`,
    xAxisKey: "categoria",
    yAxisKeys: ["cantidad"],
    at: { x: 0, y: 28, w: 24, h: 40 },
  })

  // Tabla
  .addTable("productsTable", {
    data: "{{loadProducts.data?.products}}",
    columns: [
      { title: "ID", dataIndex: "id" },
      { title: "Título", dataIndex: "title" },
      { title: "Categoría", dataIndex: "category", isTag: true },
      { title: "Precio", dataIndex: "price" },
      { title: "Stock", dataIndex: "stock" },
      { title: "Rating", dataIndex: "rating" },
    ],
    pageSize: 10,
    at: { x: 0, y: 70, w: 24, h: 50 },
  })

  // Query
  .addFetchQuery("loadProducts", {
    url: "https://dummyjson.com/products?limit=30",
    triggerType: "automatic",
  });

const client = new LowcoderClient({
  baseUrl: process.env.LOWCODER_BASE_URL!,
  apiKey: process.env.LOWCODER_API_KEY!,
});

const result = await app.deploy(client, process.env.LOWCODER_ORG_ID!);
const appId = result.applicationInfoView.applicationId;
console.log(`✅ Dashboard creado`);
console.log(`   ${process.env.LOWCODER_BASE_URL}/apps/${appId}/view`);
