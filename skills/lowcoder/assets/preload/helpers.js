// Helpers globales reutilizables en expresiones {{ }} de Lowcoder.
// Úsalo en withPreload({ script: <este contenido> }).

window.fmt = {
  currency: (n, currency = "USD", locale = "en-US") =>
    new Intl.NumberFormat(locale, { style: "currency", currency }).format(n || 0),
  compact:  (n, locale = "en") =>
    new Intl.NumberFormat(locale, { notation: "compact" }).format(n || 0),
  number:   (n, locale = "en") =>
    new Intl.NumberFormat(locale).format(n || 0),
  percent:  (n, decimals = 1) =>
    (n || 0).toFixed(decimals) + "%",
  date: (d, locale = "en-US") =>
    new Date(d).toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" }),
  time: (d, locale = "en-US") =>
    new Date(d).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" }),
  relative: (d) => {
    const diff = (Date.now() - new Date(d).getTime()) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff/60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)} h ago`;
    return `${Math.floor(diff/86400)} days ago`;
  },
};

// Helpers de array
window.group = (arr, key) =>
  (arr || []).reduce((acc, item) => {
    const k = typeof key === "function" ? key(item) : item[key];
    (acc[k] = acc[k] || []).push(item);
    return acc;
  }, {});

window.sumBy = (arr, key) =>
  (arr || []).reduce((s, item) => s + (typeof key === "function" ? key(item) : item[key] || 0), 0);

window.uniqBy = (arr, key) => {
  const seen = new Set();
  return (arr || []).filter(item => {
    const k = typeof key === "function" ? key(item) : item[key];
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};
