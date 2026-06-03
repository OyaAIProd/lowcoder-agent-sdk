// SEO setup con retries (Lowcoder pisa meta tags durante la carga).
// Úsalo en withPreload({ script: <este contenido> }).
// Reemplaza los placeholders TITLE, DESCRIPTION, OG_IMAGE, etc.

(function() {
  const seo = {
    title: "TITLE",
    description: "DESCRIPTION",
    ogImage: "OG_IMAGE",
    siteName: "SITE_NAME",
    canonical: "CANONICAL_URL",
    themeColor: "#6366f1",
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
