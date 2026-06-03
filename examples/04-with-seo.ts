/**
 * App con SEO completo via preload script (sin usar el MCP tool).
 * Demuestra meta tags, Open Graph, Twitter Card, JSON-LD.
 */
import { LowcoderApp, LowcoderClient } from "@aorizondo/lowcoder-agent-sdk-core";

const SEO = {
  title: "Mi App con SEO — Plataforma Demo",
  description:
    "Plataforma demo con SEO completo generada con lowcoder-agent-sdk. Incluye Open Graph, Twitter Card, JSON-LD structured data.",
  ogImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200",
  siteName: "Mi Empresa",
  canonical: "https://miempresa.com/dashboard",
  themeColor: "#6366f1",
};

const app = new LowcoderApp(SEO.siteName)
  .addText("title", { text: `## ${SEO.title}`, at: { x: 0, y: 0, w: 24, h: 8 } })
  .addText("info", {
    text: "Esta app tiene SEO completo. Abre devtools → Elements y mira los `<meta>` tags.",
    at: { x: 0, y: 8, w: 24, h: 12 },
  })

  .withPreload({
    script: `
// SEO setup con retries (Lowcoder pisa meta tags durante carga)
(function() {
  const seo = ${JSON.stringify(SEO)};

  function setMeta(name, value, attr) {
    attr = attr || "name";
    let el = document.querySelector('meta[' + attr + '="' + name + '"]');
    if (!el) { el = document.createElement("meta"); el.setAttribute(attr, name); document.head.appendChild(el); }
    el.setAttribute("content", value);
  }
  function setLink(rel, href) {
    let el = document.querySelector('link[rel="' + rel + '"]');
    if (!el) { el = document.createElement("link"); el.setAttribute("rel", rel); document.head.appendChild(el); }
    el.setAttribute("href", href);
  }

  function applySeo() {
    document.title = seo.title;
    setMeta("description", seo.description);
    setMeta("theme-color", seo.themeColor);
    setMeta("robots", "index, follow");
    setMeta("og:title", seo.title, "property");
    setMeta("og:description", seo.description, "property");
    setMeta("og:type", "website", "property");
    setMeta("og:image", seo.ogImage, "property");
    setMeta("og:site_name", seo.siteName, "property");
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", seo.title);
    setMeta("twitter:description", seo.description);
    setMeta("twitter:image", seo.ogImage);
    if (seo.canonical) setLink("canonical", seo.canonical);

    // JSON-LD structured data
    const ld = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": seo.siteName,
      "url": seo.canonical || window.location.href,
      "description": seo.description,
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "offers": { "@type": "Offer", "price": "0" }
    };
    let ldEl = document.getElementById("ld-json");
    if (!ldEl) { ldEl = document.createElement("script"); ldEl.id = "ld-json"; ldEl.type = "application/ld+json"; document.head.appendChild(ldEl); }
    ldEl.textContent = JSON.stringify(ld);
  }

  applySeo();
  setTimeout(applySeo, 500);
  setTimeout(applySeo, 2000);
  setTimeout(applySeo, 5000);
})();
    `,
    css: `
      body { font-family: 'Inter', -apple-system, sans-serif; }
      .ui-comp-text h2 {
        background: linear-gradient(135deg, #6366f1, #ec4899);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    `,
  });

const client = new LowcoderClient({
  baseUrl: process.env.LOWCODER_BASE_URL!,
  apiKey: process.env.LOWCODER_API_KEY!,
});

const result = await app.deploy(client);
const appId = result.applicationInfoView.applicationId;
console.log(`✅ App con SEO creada`);
console.log(`   ${process.env.LOWCODER_BASE_URL}/apps/${appId}/view`);
console.log(`\nVerifica meta tags con:`);
console.log(`   curl -s ${process.env.LOWCODER_BASE_URL}/apps/${appId}/view | grep -i 'og:'`);
