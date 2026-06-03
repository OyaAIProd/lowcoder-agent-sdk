import { z } from "zod";
import { LowcoderClient } from "@aorizondo/lowcoder-agent-sdk-core";

export const ConfigureSeoInputSchema = z.object({
  appId: z.string().describe("ID de la aplicación"),
  title: z.string().describe("Title de la página (<60 chars)"),
  description: z.string().describe("Meta description (<160 chars)"),
  ogImage: z.string().optional().describe("URL absoluta de la imagen OpenGraph (1200x630)"),
  canonical: z.string().optional().describe("URL canónica"),
  siteName: z.string().optional().describe("Nombre del sitio"),
  themeColor: z.string().optional().default("#6366f1"),
  jsonLdType: z
    .enum(["WebApplication", "WebPage", "SoftwareApplication", "Organization"])
    .optional()
    .default("WebApplication"),
  twitterCard: z.boolean().optional().default(true),
  preserveCss: z
    .boolean()
    .optional()
    .default(true)
    .describe("Mantener CSS de preload existente. Si false, lo sobreescribe"),
});

export async function handleConfigureSeo(
  input: z.infer<typeof ConfigureSeoInputSchema>,
  client: LowcoderClient
): Promise<string> {
  const app = await client.getApp(input.appId);
  const dsl = app.applicationDSL;
  const existingScript = dsl.preload?.script ?? "";
  const existingCss = dsl.preload?.css ?? "";

  // Detectar si ya hay un setup de SEO previo y reemplazarlo
  const SEO_MARKER_START = "/* === LOWCODER-SDK SEO START === */";
  const SEO_MARKER_END = "/* === LOWCODER-SDK SEO END === */";
  const scriptWithoutOld = existingScript.replace(
    new RegExp(`${SEO_MARKER_START}[\\s\\S]*?${SEO_MARKER_END}`, "g"),
    ""
  );

  const seoSnippet = buildSeoScript(input, SEO_MARKER_START, SEO_MARKER_END);

  dsl.preload = {
    script: (scriptWithoutOld + "\n" + seoSnippet).trim(),
    css: input.preserveCss ? existingCss : "",
    ...(dsl.preload?.libs ? { libs: dsl.preload.libs } : {}),
  };

  await client.updateApp(input.appId, dsl);

  return JSON.stringify(
    {
      appId: input.appId,
      seoConfigured: true,
      title: input.title,
      description: input.description,
      jsonLd: input.jsonLdType,
      tags: [
        "title",
        "description",
        "og:title",
        "og:description",
        ...(input.ogImage ? ["og:image"] : []),
        "og:type",
        "og:url",
        ...(input.canonical ? ["link[rel=canonical]"] : []),
        "theme-color",
        "robots",
        ...(input.twitterCard ? ["twitter:card", "twitter:title", "twitter:description"] : []),
        "JSON-LD",
      ],
    },
    null,
    2
  );
}

function buildSeoScript(
  input: z.infer<typeof ConfigureSeoInputSchema>,
  markerStart: string,
  markerEnd: string
): string {
  const escaped = (s: string) => JSON.stringify(s);
  return `${markerStart}
(function() {
  const seo = {
    title: ${escaped(input.title)},
    description: ${escaped(input.description)},
    ${input.ogImage ? `ogImage: ${escaped(input.ogImage)},` : ""}
    ${input.canonical ? `canonical: ${escaped(input.canonical)},` : ""}
    siteName: ${escaped(input.siteName ?? input.title)},
    themeColor: ${escaped(input.themeColor ?? "#6366f1")},
    url: window.location.href,
  };
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
  setMeta("robots", "index, follow");
  setMeta("viewport", "width=device-width, initial-scale=1");
  setMeta("theme-color", seo.themeColor);
  setMeta("og:title", seo.title, "property");
  setMeta("og:description", seo.description, "property");
  setMeta("og:type", "website", "property");
  setMeta("og:url", seo.url, "property");
  setMeta("og:site_name", seo.siteName, "property");
  if (seo.ogImage) setMeta("og:image", seo.ogImage, "property");
  ${input.twitterCard ? `
  setMeta("twitter:card", "summary_large_image");
  setMeta("twitter:title", seo.title);
  setMeta("twitter:description", seo.description);
  if (seo.ogImage) setMeta("twitter:image", seo.ogImage);
  ` : ""}
  if (seo.canonical) setLink("canonical", seo.canonical);
  const ld = {
    "@context": "https://schema.org",
    "@type": ${escaped(input.jsonLdType ?? "WebApplication")},
    "name": seo.siteName,
    "url": seo.url,
    "description": seo.description,
    ${input.jsonLdType === "WebApplication" || input.jsonLdType === "SoftwareApplication"
      ? `"applicationCategory": "BusinessApplication", "operatingSystem": "Web", "offers": { "@type": "Offer", "price": "0" }`
      : `""`}
  };
  let ldEl = document.getElementById("lowcoder-sdk-ld-json");
  if (!ldEl) { ldEl = document.createElement("script"); ldEl.id = "lowcoder-sdk-ld-json"; ldEl.type = "application/ld+json"; document.head.appendChild(ldEl); }
  ldEl.textContent = JSON.stringify(ld);
  }
  let applying = false;
  function safeApply() {
    if (applying) return;
    applying = true;
    try { applySeo(); } finally { applying = false; }
  }
  safeApply();
  // Re-aplicar SEO si Lowcoder pisa el <title> o <meta description> en cargas tardías
  setTimeout(safeApply, 500);
  setTimeout(safeApply, 2000);
  setTimeout(safeApply, 5000);
})();
${markerEnd}`;
}
