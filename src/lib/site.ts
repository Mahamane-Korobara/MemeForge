const DEFAULT_SITE_NAME = "MemeForge";
const DEFAULT_SITE_DESCRIPTION =
  "MemeForge est un éditeur de mèmes rapide pour créer, animer et partager des images et vidéos sans quitter le navigateur.";

function readEnv(key: "VITE_APP_NAME" | "VITE_APP_URL") {
  return import.meta.env[key]?.trim();
}

export function getSiteName() {
  return readEnv("VITE_APP_NAME") || DEFAULT_SITE_NAME;
}

export function getSiteUrl() {
  const envUrl = readEnv("VITE_APP_URL");
  if (envUrl) return envUrl.replace(/\/+$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:5173";
}

export function getSiteDescription() {
  return DEFAULT_SITE_DESCRIPTION;
}

export function getOgImageUrl() {
  return `${getSiteUrl()}/og-memeforge.svg`;
}

function setMeta(property: "name" | "property", key: string, content: string) {
  const selector = `meta[${property}="${key}"]`;
  let meta = document.head.querySelector<HTMLMetaElement>(selector);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute(property, key);
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
}

export function applySiteMeta() {
  if (typeof document === "undefined") return;

  const title = getSiteName();
  const description = getSiteDescription();
  const url = getSiteUrl();
  const image = getOgImageUrl();

  document.title = title;
  setMeta("name", "description", description);
  setMeta("property", "og:type", "website");
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description);
  setMeta("property", "og:url", url);
  setMeta("property", "og:image", image);
  setMeta("name", "twitter:card", "summary_large_image");
  setMeta("name", "twitter:title", title);
  setMeta("name", "twitter:description", description);
  setMeta("name", "twitter:image", image);

  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical.href = url;
}

