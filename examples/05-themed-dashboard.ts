/**
 * Dashboard con tema visual premium: glass effect, gradientes, animaciones, responsive.
 * Demuestra el uso completo de withPreload para CSS.
 */
import { LowcoderApp, LowcoderClient } from "@aorizondo/lowcoder-agent-sdk-core";

const app = new LowcoderApp("Themed Dashboard")
  .withSettings({ category: "Business", description: "Dashboard con tema visual premium" })

  // Hero con badge
  .addText("hero", {
    text: `<div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
<span style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;padding:4px 12px;border-radius:12px;font-size:11px;font-weight:600;letter-spacing:0.05em">SDK v0.1</span>
<span style="color:#64748b;font-size:13px">Lowcoder Agent SDK</span>
</div>
<h1 style="margin:0;background:linear-gradient(135deg,#1e293b,#475569);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:2.5rem;font-weight:700">Tema visual premium</h1>
<p style="color:#64748b;margin-top:4px">Glass effect · Gradientes · Animaciones · Responsive</p>`,
    at: { x: 0, y: 0, w: 24, h: 16 },
  })

  .addDivider("d1", { at: { x: 0, y: 16, w: 24, h: 3 } })

  // 4 KPI cards
  .addText("kpi1", {
    text: `<div class="kpi-label">Métricas tracked</div><div class="kpi-num">{{loadStats.data?.metrics || 42}}</div><div class="kpi-trend-up">▲ +12% este mes</div>`,
    at: { x: 0, y: 19, w: 6, h: 18 },
  })
  .addText("kpi2", {
    text: `<div class="kpi-label">Tiempo activo</div><div class="kpi-num">99.8<span style="font-size:1rem">%</span></div><div class="kpi-trend-up">▲ +0.1% vs ayer</div>`,
    at: { x: 6, y: 19, w: 6, h: 18 },
  })
  .addText("kpi3", {
    text: `<div class="kpi-label">Latencia P95</div><div class="kpi-num">87<span style="font-size:1rem">ms</span></div><div class="kpi-trend-down">▼ -14ms</div>`,
    at: { x: 12, y: 19, w: 6, h: 18 },
  })
  .addText("kpi4", {
    text: `<div class="kpi-label">Error rate</div><div class="kpi-num">0.02<span style="font-size:1rem">%</span></div><div class="kpi-trend-up">▲ Sin alertas</div>`,
    at: { x: 18, y: 19, w: 6, h: 18 },
  })

  // Card con chart
  .addCard("chartCard", {
    title: "Tendencia últimas 12 semanas",
    showHoverEffect: true,
    at: { x: 0, y: 38, w: 24, h: 45 },
  })

  // Botón flotante
  .addFloatingButton("fab", {
    icon: "/icon:antd/plus-outlined",
    buttons: [
      { id: "new", label: "Nueva métrica", icon: "/icon:antd/area-chart-outlined", onClick: "createMetric" },
      { id: "export", label: "Exportar", icon: "/icon:antd/download-outlined", onClick: "exportData" },
    ],
    at: { x: 22, y: 85, w: 2, h: 6 },
  })

  // Queries dummy
  .addJsQuery("loadStats", {
    script: `return Promise.resolve({ metrics: 42, uptime: 99.8 });`,
    triggerType: "automatic",
  })
  .addJsQuery("createMetric", {
    script: `message.info("Crear nueva métrica..."); return true;`,
    triggerType: "manual",
  })
  .addJsQuery("exportData", {
    script: `message.success("Exportando..."); return true;`,
    triggerType: "manual",
  })

  // TEMA VISUAL
  .withPreload({
    script: `
window.fmt = {
  currency: n => new Intl.NumberFormat('en', { style:'currency', currency:'USD' }).format(n || 0),
  compact:  n => new Intl.NumberFormat('en', { notation:'compact' }).format(n || 0),
  percent:  n => (n || 0).toFixed(2) + '%',
};
    `,
    css: `
/* Base */
body {
  background: linear-gradient(135deg, #f5f7ff 0%, #ecf0ff 50%, #fff5f7 100%);
  font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif;
  min-height: 100vh;
}
.lowcoder-app-canvas {
  background: transparent !important;
}

/* Glass effect en cards */
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
.react-grid-item {
  animation: fadeInUp 0.5s ease-out both;
}
.react-grid-item:nth-child(1) { animation-delay: 0.05s; }
.react-grid-item:nth-child(2) { animation-delay: 0.10s; }
.react-grid-item:nth-child(3) { animation-delay: 0.15s; }
.react-grid-item:nth-child(4) { animation-delay: 0.20s; }
.react-grid-item:nth-child(5) { animation-delay: 0.25s; }
.react-grid-item:nth-child(6) { animation-delay: 0.30s; }

/* KPI styles */
.kpi-label {
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
}
.kpi-num {
  font-size: 2.25rem;
  font-weight: 700;
  background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 4px 0;
}
.kpi-trend-up   { color: #10b981; font-size: 0.875rem; font-weight: 600; }
.kpi-trend-down { color: #ef4444; font-size: 0.875rem; font-weight: 600; }

/* Responsive */
@media (max-width: 768px) {
  .ui-comp-text h1 { font-size: 1.75rem !important; }
  .kpi-num { font-size: 1.5rem !important; }
}
    `,
  });

const client = new LowcoderClient({
  baseUrl: process.env.LOWCODER_BASE_URL!,
  apiKey: process.env.LOWCODER_API_KEY!,
});

const result = await app.deploy(client, process.env.LOWCODER_ORG_ID!);
const appId = result.applicationInfoView.applicationId;
console.log(`✅ Themed dashboard creado`);
console.log(`   ${process.env.LOWCODER_BASE_URL}/apps/${appId}/view`);
