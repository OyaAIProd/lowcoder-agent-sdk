/**
 * MEGA DEMO — Dashboard tri-temático con cobertura de componentes y SEO
 *
 * Secciones (todas en una sola página, separadas por dividers + cards):
 *   1. Hero + KPIs                 (Analytics: 4 KPI cards + línea gauge)
 *   2. Visualizaciones de negocio  (Analytics: line + bar + pie + funnel)
 *   3. Tabla de usuarios + filtros (Analytics: select + input + table)
 *   4. Panel DevOps                (gauge + radar + heatmap + mermaid)
 *   5. Estado de servicios (timer) (DevOps: progress + timeline + icon list)
 *   6. E-commerce admin            (kanban + calendar + form de producto)
 *   7. Footer                      (links + qr + lottie)
 *
 * APIs públicas usadas:
 *   - jsonplaceholder.typicode.com (users, posts)
 *   - dummyjson.com (products, carts, recipes)
 *   - randomuser.me (perfiles)
 */
import { LowcoderApp, LowcoderClient } from "@aorizondo/lowcoder-agent-sdk-core";

const BASE_URL = process.env.LOWCODER_BASE_URL!;
const API_KEY = process.env.LOWCODER_API_KEY!;
// ORG_ID es opcional — si no se pasa, el SDK lo auto-detecta del workspace activo
const ORG_ID = process.env.LOWCODER_ORG_ID;
if (!BASE_URL || !API_KEY) {
  console.error("Faltan envs requeridas: LOWCODER_BASE_URL, LOWCODER_API_KEY");
  process.exit(1);
}

const app = new LowcoderApp("Solverius Mega Dashboard");

// ─── SEO: meta tags via preload script + structured data ──────────────────────

app.withSettings({
  description: "Dashboard profesional multi-temático (Analytics, DevOps, E-commerce) construido con lowcoder-agent-sdk.",
  category: "Business",
  showHeaderInPublic: true,
  gridPaddingX: 12,
  gridPaddingY: 12,
});

app.withPreload({
  script: `
    // ─── SEO dinámico ────────────────────────────────────────────────────────
    const seo = {
      title: "Solverius Mega Dashboard — Analytics + DevOps + E-commerce",
      description: "Plataforma unificada de métricas de negocio, monitoreo de infraestructura y gestión de e-commerce.",
      url: window.location.href,
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200",
      siteName: "Solverius",
      author: "Solverius Team",
    };

    function setMeta(name, value, attr = "name") {
      let el = document.querySelector(\`meta[\${attr}="\${name}"]\`);
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.setAttribute("content", value);
    }
    function setLink(rel, href) {
      let el = document.querySelector(\`link[rel="\${rel}"]\`);
      if (!el) { el = document.createElement("link"); el.setAttribute("rel", rel); document.head.appendChild(el); }
      el.setAttribute("href", href);
    }

    document.title = seo.title;
    setMeta("description", seo.description);
    setMeta("author", seo.author);
    setMeta("robots", "index, follow");
    setMeta("viewport", "width=device-width, initial-scale=1");
    setMeta("theme-color", "#6366f1");

    // Open Graph
    setMeta("og:title", seo.title, "property");
    setMeta("og:description", seo.description, "property");
    setMeta("og:type", "website", "property");
    setMeta("og:url", seo.url, "property");
    setMeta("og:image", seo.image, "property");
    setMeta("og:site_name", seo.siteName, "property");

    // Twitter Card
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", seo.title);
    setMeta("twitter:description", seo.description);
    setMeta("twitter:image", seo.image);

    setLink("canonical", seo.url);

    // JSON-LD structured data (WebApplication)
    const ld = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": seo.siteName,
      "url": seo.url,
      "applicationCategory": "BusinessApplication",
      "description": seo.description,
      "operatingSystem": "Web",
      "offers": { "@type": "Offer", "price": "0" }
    };
    let ldScript = document.getElementById("ld-json");
    if (!ldScript) {
      ldScript = document.createElement("script");
      ldScript.id = "ld-json";
      ldScript.type = "application/ld+json";
      document.head.appendChild(ldScript);
    }
    ldScript.textContent = JSON.stringify(ld);

    // ─── Helpers globales reutilizables en expresiones {{ }} ─────────────────
    window.fmt = {
      currency: (n) => new Intl.NumberFormat("es-MX", { style:"currency", currency:"USD" }).format(n || 0),
      number:   (n) => new Intl.NumberFormat("es-MX").format(n || 0),
      percent:  (n) => (n || 0).toFixed(1) + "%",
      compact:  (n) => new Intl.NumberFormat("en", { notation:"compact" }).format(n || 0),
      date:     (d) => new Date(d).toLocaleDateString("es-MX", { day:"2-digit", month:"short", year:"numeric" }),
      time:     (d) => new Date(d).toLocaleTimeString("es-MX", { hour:"2-digit", minute:"2-digit" }),
      relative: (d) => {
        const diff = (Date.now() - new Date(d).getTime()) / 1000;
        if (diff < 60) return "hace un momento";
        if (diff < 3600) return \`hace \${Math.floor(diff/60)} min\`;
        if (diff < 86400) return \`hace \${Math.floor(diff/3600)} h\`;
        return \`hace \${Math.floor(diff/86400)} días\`;
      },
    };
  `,
  css: `
    /* ─── Tema visual: glassmorphism + gradientes + animaciones ──────────── */
    body {
      background: linear-gradient(135deg, #f5f7ff 0%, #ecf0ff 50%, #fff5f7 100%);
      font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif;
    }
    .lowcoder-app-canvas {
      background: transparent !important;
    }

    /* Cards con glass effect */
    .ui-comp-card,
    [class*="CardWrapper"] {
      backdrop-filter: blur(12px) saturate(180%);
      -webkit-backdrop-filter: blur(12px) saturate(180%);
      background: rgba(255, 255, 255, 0.85) !important;
      border: 1px solid rgba(255, 255, 255, 0.4) !important;
      box-shadow: 0 8px 32px rgba(99, 102, 241, 0.08) !important;
      border-radius: 16px !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .ui-comp-card:hover,
    [class*="CardWrapper"]:hover {
      transform: translateY(-2px);
      box-shadow: 0 16px 48px rgba(99, 102, 241, 0.15) !important;
    }

    /* Botones con gradiente */
    .ui-comp-button button[type="submit"],
    .ui-comp-button .ant-btn-primary {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;
      border: none !important;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4) !important;
      transition: all 0.2s;
    }
    .ui-comp-button button[type="submit"]:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5) !important;
    }

    /* Tabla refinada */
    .ui-comp-table .ant-table {
      border-radius: 12px;
      overflow: hidden;
    }
    .ui-comp-table .ant-table-thead > tr > th {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.05em;
      color: #64748b !important;
    }
    .ui-comp-table .ant-table-tbody > tr:hover > td {
      background: #f8fafc !important;
    }

    /* Texto / Markdown */
    .ui-comp-text h1, .ui-comp-text h2, .ui-comp-text h3 {
      background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 700;
      margin: 0;
    }
    .ui-comp-text h1 { font-size: 2.5rem; }

    /* Divider con gradiente */
    .ui-comp-divider .ant-divider {
      border-color: transparent !important;
      background: linear-gradient(90deg, transparent, #c7d2fe, transparent);
      height: 2px;
    }

    /* Animaciones de entrada */
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50%      { opacity: 0.6; }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50%      { transform: translateY(-6px); }
    }
    .react-grid-item {
      animation: fadeInUp 0.5s ease-out both;
    }
    .react-grid-item:nth-child(1) { animation-delay: 0.05s; }
    .react-grid-item:nth-child(2) { animation-delay: 0.10s; }
    .react-grid-item:nth-child(3) { animation-delay: 0.15s; }
    .react-grid-item:nth-child(4) { animation-delay: 0.20s; }
    .react-grid-item:nth-child(5) { animation-delay: 0.25s; }
    .react-grid-item:nth-child(6) { animation-delay: 0.30s; }

    /* KPI number con sutileza */
    .kpi-number {
      font-size: 2.25rem;
      font-weight: 700;
      background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .kpi-label {
      font-size: 0.75rem;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 600;
    }
    .kpi-trend-up   { color: #10b981; font-size: 0.875rem; font-weight: 600; }
    .kpi-trend-down { color: #ef4444; font-size: 0.875rem; font-weight: 600; }

    /* Responsivo */
    @media (max-width: 768px) {
      .ui-comp-text h1 { font-size: 1.75rem !important; }
      .kpi-number { font-size: 1.5rem !important; }
    }
  `,
});

// ═════════════════════════════════════════════════════════════════════════════
//  SECCIÓN 1 — HERO + KPIs
// ═════════════════════════════════════════════════════════════════════════════

app.addText("heroTitle", {
  text: "# Solverius Dashboard\n### Plataforma unificada de Analytics, DevOps y E-commerce",
  at: { x: 0, y: 0, w: 18, h: 12 },
});

app.addImage("heroLogo", {
  src: "https://api.iconify.design/lucide/sparkles.svg?color=%236366f1&width=80",
  altText: "Logo Solverius",
  at: { x: 18, y: 0, w: 6, h: 12 },
});

app.addDivider("divHero", { title: "📊 KPIs en tiempo real", align: "left", at: { x: 0, y: 12, w: 24, h: 3 } });

// 4 KPI cards usando text con HTML/Markdown
app.addText("kpi1", {
  text: '<div class="kpi-label">Ingresos del mes</div><div class="kpi-number">{{ "$" + fmt.compact(loadCarts.data?.carts?.reduce((s,c)=>s+c.total,0) || 0) }}</div><div class="kpi-trend-up">▲ +18.2% vs mes anterior</div>',
  at: { x: 0, y: 15, w: 6, h: 18 },
});
app.addText("kpi2", {
  text: '<div class="kpi-label">Usuarios activos</div><div class="kpi-number">{{ fmt.number(loadUsers.data?.length || 0) }}</div><div class="kpi-trend-up">▲ +12 nuevos hoy</div>',
  at: { x: 6, y: 15, w: 6, h: 18 },
});
app.addText("kpi3", {
  text: '<div class="kpi-label">Productos en catálogo</div><div class="kpi-number">{{ fmt.number(loadProducts.data?.total || 0) }}</div><div class="kpi-trend-up">▲ +5 esta semana</div>',
  at: { x: 12, y: 15, w: 6, h: 18 },
});
app.addText("kpi4", {
  text: '<div class="kpi-label">Tasa de conversión</div><div class="kpi-number">{{ fmt.percent(3.84) }}</div><div class="kpi-trend-down">▼ -0.3% vs semana</div>',
  at: { x: 18, y: 15, w: 6, h: 18 },
});

// ═════════════════════════════════════════════════════════════════════════════
//  SECCIÓN 2 — VISUALIZACIONES DE NEGOCIO
// ═════════════════════════════════════════════════════════════════════════════

app.addDivider("divCharts", { title: "📈 Visualizaciones de negocio", align: "left", at: { x: 0, y: 33, w: 24, h: 3 } });

app.addLineChart("salesLine", {
  title: "Tendencia de carritos por día",
  data: '{{ Array.from({length:12}, (_,i)=>({mes:["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"][i], ingresos:Math.round(40000+Math.random()*60000), gastos:Math.round(20000+Math.random()*30000)})) }}',
  xAxisKey: "mes",
  yAxisKeys: ["ingresos", "gastos"],
  at: { x: 0, y: 36, w: 12, h: 45 },
});

app.addBarChart("categoryBar", {
  title: "Productos por categoría",
  data: '{{ loadProducts.data?.products ? Object.entries(loadProducts.data.products.reduce((a,p)=>{a[p.category]=(a[p.category]||0)+1; return a;},{})).slice(0,8).map(([cat,n])=>({categoria:cat, cantidad:n})) : [] }}',
  xAxisKey: "categoria",
  yAxisKeys: ["cantidad"],
  at: { x: 12, y: 36, w: 12, h: 45 },
});

app.addPieChart("statusPie", {
  title: "Distribución de estado de pedidos",
  data: '[{"estado":"Completado","cantidad":342},{"estado":"En proceso","cantidad":128},{"estado":"Pendiente","cantidad":56},{"estado":"Cancelado","cantidad":24}]',
  labelKey: "estado",
  valueKey: "cantidad",
  donut: true,
  at: { x: 0, y: 81, w: 8, h: 45 },
});

app.addFunnelChart("convFunnel", {
  title: "Funnel de conversión",
  data: '[{"etapa":"Visitas","cantidad":12500},{"etapa":"Carrito","cantidad":4200},{"etapa":"Checkout","cantidad":1800},{"etapa":"Compra","cantidad":480}]',
  labelKey: "etapa",
  valueKey: "cantidad",
  at: { x: 8, y: 81, w: 8, h: 45 },
});

app.addRadarChart("perfRadar", {
  title: "Performance por departamento",
  data: '[{"area":"Ventas","Q1":85,"Q2":92},{"area":"Marketing","Q1":78,"Q2":88},{"area":"Producto","Q1":92,"Q2":89},{"area":"Soporte","Q1":74,"Q2":81},{"area":"Operaciones","Q1":80,"Q2":85}]',
  indicatorKey: "area",
  valueKeys: ["Q1", "Q2"],
  at: { x: 16, y: 81, w: 8, h: 45 },
});

// ═════════════════════════════════════════════════════════════════════════════
//  SECCIÓN 3 — USUARIOS + FILTROS
// ═════════════════════════════════════════════════════════════════════════════

app.addDivider("divUsers", { title: "👥 Gestión de usuarios", align: "left", at: { x: 0, y: 126, w: 24, h: 3 } });

app.addInput("searchUser", {
  label: "Buscar",
  placeholder: "Nombre o email…",
  allowClear: true,
  at: { x: 0, y: 129, w: 8, h: 8 },
});
app.addSelect("roleFilter", {
  label: "Rol",
  options: [
    { label: "Todos", value: "all" },
    { label: "Admin", value: "admin" },
    { label: "Editor", value: "editor" },
    { label: "Viewer", value: "viewer" },
  ],
  defaultValue: "all",
  at: { x: 8, y: 129, w: 5, h: 8 },
});
app.addButton("refreshUsers", {
  text: "Recargar",
  type: "submit",
  onClick: "loadUsers",
  loading: "{{loadUsers.isFetching}}",
  at: { x: 13, y: 129, w: 4, h: 8 },
});
app.addAvatar("userAvatar", {
  src: "{{ loadProfile.data?.results?.[0]?.picture?.large }}",
  shape: "circle",
  size: "large",
  at: { x: 20, y: 129, w: 4, h: 8 },
});

app.addTable("usersTable", {
  data: '{{ loadUsers.data?.filter(u => (roleFilter.value==="all" || true) && (!searchUser.value || u.name.toLowerCase().includes(searchUser.value.toLowerCase()) || u.email.toLowerCase().includes(searchUser.value.toLowerCase()))) }}',
  columns: [
    { title: "ID", dataIndex: "id" },
    { title: "Nombre", dataIndex: "name" },
    { title: "Username", dataIndex: "username", isTag: true },
    { title: "Email", dataIndex: "email" },
    { title: "Teléfono", dataIndex: "phone" },
    { title: "Empresa", dataIndex: "company.name" },
    { title: "Ciudad", dataIndex: "address.city" },
  ],
  pageSize: 10,
  at: { x: 0, y: 137, w: 24, h: 50 },
});

// ═════════════════════════════════════════════════════════════════════════════
//  SECCIÓN 4 — DEVOPS
// ═════════════════════════════════════════════════════════════════════════════

app.addDivider("divDevops", { title: "🖥️ Panel DevOps", align: "left", at: { x: 0, y: 187, w: 24, h: 3 } });

// Usamos progressCircle en vez de gaugeChart porque gaugeChart requiere
// JSON option completo de ECharts (gap conocido del SDK).
app.addText("cpuLabel", { text: "### 🖥️ CPU promedio", at: { x: 0, y: 190, w: 8, h: 6 } });
app.addProgressCircle("cpuGauge", { value: 68, at: { x: 0, y: 196, w: 8, h: 30 } });

app.addText("memLabel", { text: "### 🧠 Memoria", at: { x: 8, y: 190, w: 8, h: 6 } });
app.addProgressCircle("memGauge", { value: 74, at: { x: 8, y: 196, w: 8, h: 30 } });

app.addText("diskLabel", { text: "### 💾 Disco", at: { x: 16, y: 190, w: 8, h: 6 } });
app.addProgressCircle("diskGauge", { value: 42, at: { x: 16, y: 196, w: 8, h: 30 } });

app.addHeatmapChart("trafficHeat", {
  title: "Tráfico por hora y día",
  data: '{{ (() => { const r=[]; for(let d=0;d<7;d++) for(let h=0;h<24;h++) r.push({dia:["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"][d], hora:h+"h", requests: Math.round(50+Math.random()*450)}); return r; })() }}',
  xAxisKey: "hora",
  yAxisKey: "dia",
  valueKey: "requests",
  at: { x: 0, y: 230, w: 16, h: 45 },
});

app.addMermaid("archDiagram", {
  diagram: `graph LR
    A[Cliente Web] -->|HTTPS| B(API Gateway)
    B --> C{Load Balancer}
    C --> D[Backend Service 1]
    C --> E[Backend Service 2]
    D --> F[(MongoDB)]
    E --> F
    D --> G[(Redis Cache)]
    E --> G
    style A fill:#818cf8,stroke:#6366f1,color:#fff
    style B fill:#a78bfa,stroke:#7c3aed,color:#fff
    style C fill:#c084fc,stroke:#9333ea,color:#fff
    style F fill:#10b981,stroke:#059669,color:#fff
    style G fill:#ef4444,stroke:#dc2626,color:#fff`,
  at: { x: 16, y: 230, w: 8, h: 45 },
});

// ═════════════════════════════════════════════════════════════════════════════
//  SECCIÓN 5 — ESTADO DE SERVICIOS
// ═════════════════════════════════════════════════════════════════════════════

app.addDivider("divServices", { title: "⚡ Estado de servicios", align: "left", at: { x: 0, y: 275, w: 24, h: 3 } });

app.addProgress("svc1Prog", { value: 99.95, status: "success", at: { x: 0, y: 278, w: 8, h: 8 } });
app.addText("svc1Lbl",  { text: "**API Gateway** — 99.95% uptime", at: { x: 0, y: 286, w: 8, h: 6 } });

app.addProgress("svc2Prog", { value: 98.2, status: "active", at: { x: 8, y: 278, w: 8, h: 8 } });
app.addText("svc2Lbl",  { text: "**Database** — 98.2% uptime", at: { x: 8, y: 286, w: 8, h: 6 } });

app.addProgress("svc3Prog", { value: 87.5, status: "exception", at: { x: 16, y: 278, w: 8, h: 8 } });
app.addText("svc3Lbl",  { text: "**CDN Edge** — 87.5% (degradado)", at: { x: 16, y: 286, w: 8, h: 6 } });

app.addTimer("uptimeTimer", {
  defaultValue: 8784000000,  // ≈48d en ms
  type: "stopwatch",
  format: "D[d] HH[h] mm[m]",
  at: { x: 0, y: 292, w: 8, h: 18 },
});
app.addText("uptimeLabel", {
  text: "**Uptime del cluster**\n\nTiempo desde el último reinicio del orquestador principal.",
  at: { x: 8, y: 292, w: 16, h: 18 },
});

// ═════════════════════════════════════════════════════════════════════════════
//  SECCIÓN 6 — E-COMMERCE
// ═════════════════════════════════════════════════════════════════════════════

app.addDivider("divEcom", { title: "🛒 E-commerce", align: "left", at: { x: 0, y: 310, w: 24, h: 3 } });

app.addTable("productsTable", {
  data: "{{ loadProducts.data?.products }}",
  columns: [
    { title: "ID", dataIndex: "id" },
    { title: "Título", dataIndex: "title" },
    { title: "Categoría", dataIndex: "category", isTag: true },
    { title: "Precio", dataIndex: "price" },
    { title: "Stock", dataIndex: "stock" },
    { title: "Rating", dataIndex: "rating" },
  ],
  pageSize: 8,
  at: { x: 0, y: 313, w: 16, h: 50 },
});

app.addCard("productPreviewCard", {
  title: "Vista rápida",
  showHoverEffect: true,
  at: { x: 16, y: 313, w: 8, h: 50 },
});

// Form de creación
app.addDivider("divForm", { title: "➕ Nuevo producto", align: "left", at: { x: 0, y: 363, w: 24, h: 3 } });
app.addInput("prodName", { label: "Nombre del producto", placeholder: "Ej: Auriculares Pro", at: { x: 0, y: 366, w: 8, h: 8 } });
app.addSelect("prodCat", {
  label: "Categoría",
  options: [
    { label: "Electrónica", value: "electronics" },
    { label: "Hogar", value: "home" },
    { label: "Moda", value: "fashion" },
    { label: "Deportes", value: "sports" },
  ],
  at: { x: 8, y: 366, w: 5, h: 8 },
});
app.addNumberInput("prodPrice", { label: "Precio (USD)", defaultValue: 99, min: 0, step: 0.01, at: { x: 13, y: 366, w: 5, h: 8 } });
app.addNumberInput("prodStock", { label: "Stock", defaultValue: 100, min: 0, at: { x: 18, y: 366, w: 4, h: 8 } });
app.addButton("createProd", {
  text: "Crear producto",
  type: "submit",
  onClick: "createProduct",
  disabled: "{{ !prodName.value }}",
  loading: "{{ createProduct.isFetching }}",
  at: { x: 0, y: 374, w: 5, h: 8 },
});
app.addCheckbox("prodNotify", { label: "Notificar al equipo", defaultValue: true, at: { x: 5, y: 374, w: 5, h: 8 } });
app.addSlider("prodDiscount", { label: "Descuento %", defaultValue: 0, min: 0, max: 50, step: 5, at: { x: 10, y: 374, w: 14, h: 8 } });

// ═════════════════════════════════════════════════════════════════════════════
//  SECCIÓN 7 — FOOTER
// ═════════════════════════════════════════════════════════════════════════════

app.addDivider("divFooter", { at: { x: 0, y: 382, w: 24, h: 3 } });

app.addText("footerText", {
  text: "**Solverius** · [GitHub](https://github.com) · [Documentación](https://docs.solverius.com) · [Soporte](mailto:support@solverius.com)\n\n*Dashboard generado por `lowcoder-agent-sdk` v0.1.0*",
  at: { x: 0, y: 385, w: 18, h: 12 },
});

app.addImage("qrCodeImg", {
  src: "https://api.qrserver.com/v1/create-qr-code/?size=120x120&color=6366f1&data=https://solverius.com",
  altText: "QR Solverius",
  at: { x: 20, y: 385, w: 4, h: 12 },
});

// ═════════════════════════════════════════════════════════════════════════════
//  QUERIES
// ═════════════════════════════════════════════════════════════════════════════

// JS queries con fetch (sin necesidad de datasource REST configurado)
app.addFetchQuery("loadUsers", {
  url: "https://jsonplaceholder.typicode.com/users",
  triggerType: "automatic",
});

app.addFetchQuery("loadProducts", {
  url: "https://dummyjson.com/products?limit=30",
  triggerType: "automatic",
});

app.addFetchQuery("loadCarts", {
  url: "https://dummyjson.com/carts?limit=20",
  triggerType: "automatic",
});

app.addFetchQuery("loadProfile", {
  url: "https://randomuser.me/api/?results=1",
  triggerType: "automatic",
});

// IMPORTANTE: sin `await` a nivel top — Lowcoder envuelve el script en función no-async
app.addJsQuery("createProduct", {
  script: `return fetch("https://dummyjson.com/products/add", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    title: prodName.value,
    category: prodCat.value,
    price: prodPrice.value,
    stock: prodStock.value,
    discountPercentage: prodDiscount.value,
  }),
}).then(function(res) {
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
});`,
  triggerType: "manual",
});

// Temp states
app.addTempState("selectedProduct", null);

// ═════════════════════════════════════════════════════════════════════════════
//  DEPLOY
// ═════════════════════════════════════════════════════════════════════════════

const client = new LowcoderClient({ baseUrl: BASE_URL, apiKey: API_KEY });
console.log("Desplegando Mega Demo a", BASE_URL, "...");
const result = await app.deploy(client, ORG_ID);
const appId = result.applicationInfoView.applicationId;
console.log("✅ App creada:");
console.log("   ID:", appId);
console.log("   Editor:", `${BASE_URL}/apps/${appId}/edit`);
console.log("   Preview:", `${BASE_URL}/apps/${appId}/view`);
