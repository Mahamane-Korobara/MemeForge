import type { Element, Format } from "./types";

export type MemeModelLayout = "poster" | "split" | "caption" | "frame" | "comic";

export type MemeModel = {
  id: string;
  name: string;
  category: string;
  layout: MemeModelLayout;
  width: number;
  height: number;
  boxCount: number;
  headline: string;
  subtitle: string;
  zoneLabel: string;
  background: string;
  accent: string;
  accentSoft: string;
  preview: string;
  imageSrc?: string;
};

const CATEGORIES = ["Réaction", "Drame", "Culte", "Minimal", "Punchline", "Chaos", "Screenshot", "Poster"];
const LAYOUTS: MemeModelLayout[] = ["poster", "split", "caption", "frame", "comic"];
const BACKGROUNDS = ["#0f172a", "#111827", "#312e81", "#1f2937", "#3f3cbb", "#7c2d12", "#14532d", "#4c1d95"];
const ACCENTS = ["#f59e0b", "#f43f5e", "#22c55e", "#38bdf8", "#a855f7", "#f97316", "#10b981", "#eab308"];
const SUBTITLES = [
  "Et là tout fonctionne.",
  "Mais seulement au premier test.",
  "Personne n'était prêt.",
  "Le résultat est discutable.",
  "On garde ça en production.",
  "Ça semblait une bonne idée.",
  "La suite est illisible.",
  "On a trouvé le bug.",
];

const FR_HEADLINES = [
  "Quand ça passe enfin",
  "Moi à minuit",
  "Réunion surprise",
  "Plan parfait",
  "Compilation réussie",
  "Erreur inattendue",
  "Chaos total",
  "C'est du lourd",
  "Validé par le chat",
  "Je teste juste ça",
  "Bonne idée sur le papier",
  "Personne ne bouge",
];

function escapeXml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function createPreview(model: Pick<MemeModel, "headline" | "subtitle" | "background" | "accent" | "accentSoft" | "layout" | "category" | "width" | "height">) {
  const headline = escapeXml(model.headline);
  const subtitle = escapeXml(model.subtitle);
  
  // Créer des dégradés sophistiqués et des designs variés
  const designs = [
    // Design 1: Gradient moderne avec formes
    `<defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${model.background};stop-opacity:1" />
        <stop offset="50%" style="stop-color:${model.accent};stop-opacity:0.7" />
        <stop offset="100%" style="stop-color:${model.background};stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="${model.width}" height="${model.height}" fill="url(#grad1)"/>
    <circle cx="${model.width * 0.8}" cy="${model.height * 0.2}" r="${model.height * 0.18}" fill="${model.accent}" opacity="0.3"/>
    <circle cx="${model.width * 0.2}" cy="${model.height * 0.8}" r="${model.height * 0.15}" fill="${model.accent}" opacity="0.2"/>
    <rect x="0" y="${model.height * 0.5}" width="${model.width}" height="${model.height * 0.5}" fill="${model.accent}" opacity="0.1"/>`,
    
    // Design 2: Bandes colorées
    `<defs>
      <linearGradient id="grad2" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" style="stop-color:${model.accent};stop-opacity:0.9" />
        <stop offset="50%" style="stop-color:${model.background};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${model.background};stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="${model.width}" height="${model.height}" fill="url(#grad2)"/>
    <rect x="0" y="0" width="${model.width * 0.3}" height="${model.height}" fill="${model.accent}" opacity="0.7"/>
    <circle cx="${model.width * 0.5}" cy="${model.height * 0.4}" r="80" fill="${model.accent}" opacity="0.25"/>`,
    
    // Design 3: Triangles géométriques
    `<defs>
      <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${model.background};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${model.accent};stop-opacity:0.5" />
      </linearGradient>
    </defs>
    <rect width="${model.width}" height="${model.height}" fill="url(#grad3)"/>
    <polygon points="0,0 ${model.width},0 ${model.width * 0.5},${model.height * 0.4}" fill="${model.accent}" opacity="0.4"/>
    <circle cx="${model.width * 0.3}" cy="${model.height * 0.7}" r="70" fill="${model.accent}" opacity="0.3"/>
    <rect x="${model.width * 0.6}" y="${model.height * 0.6}" width="150" height="150" fill="${model.accent}" opacity="0.25" transform="rotate(45 ${model.width * 0.75} ${model.height * 0.75})"/>`,
    
    // Design 4: Vague diagonale
    `<defs>
      <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${model.background};stop-opacity:1" />
        <stop offset="50%" style="stop-color:${model.accent};stop-opacity:0.4" />
        <stop offset="100%" style="stop-color:${model.background};stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="${model.width}" height="${model.height}" fill="url(#grad4)"/>
    <ellipse cx="${model.width}" cy="0" rx="300" ry="250" fill="${model.accent}" opacity="0.3"/>
    <ellipse cx="0" cy="${model.height}" rx="280" ry="220" fill="${model.accent}" opacity="0.2"/>`,
    
    // Design 5: Carrés modernes
    `<defs>
      <linearGradient id="grad5" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${model.accent};stop-opacity:0.2" />
        <stop offset="50%" style="stop-color:${model.background};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${model.accent};stop-opacity:0.3" />
      </linearGradient>
    </defs>
    <rect width="${model.width}" height="${model.height}" fill="url(#grad5)"/>
    <rect x="${model.width * 0.05}" y="${model.height * 0.05}" width="${model.width * 0.4}" height="${model.height * 0.4}" fill="${model.accent}" opacity="0.3" rx="20"/>
    <rect x="${model.width * 0.55}" y="${model.height * 0.55}" width="${model.width * 0.4}" height="${model.height * 0.4}" fill="${model.accent}" opacity="0.25" rx="20"/>`,
  ];
  
  const designIndex = (headline.length + subtitle.length) % designs.length;
  const bgDesign = designs[designIndex];
  
  return `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${model.width} ${model.height}" width="${model.width}" height="${model.height}">
      ${bgDesign}
      <text x="50%" y="${model.height * 0.35}" text-anchor="middle" fill="#000000" font-size="52" font-family="Impact, Arial Black, sans-serif" font-weight="900" opacity="0.15">${headline}</text>
      <text x="50%" y="${model.height * 0.35}" text-anchor="middle" fill="#ffffff" font-size="52" font-family="Impact, Arial Black, sans-serif" font-weight="900" stroke="#000000" stroke-width="2">${headline}</text>
      <text x="50%" y="${model.height * 0.6}" text-anchor="middle" fill="#ffffff" font-size="28" font-family="Arial, sans-serif" font-weight="bold">${subtitle}</text>
    </svg>`,
  )}`;
}

export const MEME_MODELS: MemeModel[] = Array.from({ length: 120 }, (_, index) => {
  const category = CATEGORIES[index % CATEGORIES.length];
  const layout = LAYOUTS[index % LAYOUTS.length];
  const headline = FR_HEADLINES[index % FR_HEADLINES.length];
  const subtitle = SUBTITLES[index % SUBTITLES.length];
  const background = BACKGROUNDS[index % BACKGROUNDS.length];
  const accent = ACCENTS[index % ACCENTS.length];
  const accentSoft = `${accent}22`;
  const width = layout === "split" ? 1200 : layout === "caption" ? 1080 : layout === "frame" ? 1024 : layout === "comic" ? 1080 : 1200;
  const height = layout === "split" ? 1200 : layout === "caption" ? 900 : layout === "frame" ? 1350 : layout === "comic" ? 1080 : 630;
  const boxCount = (index % 4) + 1;
  const zoneLabel = `${boxCount} zone${boxCount > 1 ? "s" : ""} de texte`;
  const preview = createPreview({ headline, subtitle, background, accent, accentSoft, layout, category, width, height });

  return {
    id: `model-${index + 1}`,
    name: `${category} ${index + 1}`,
    category,
    layout,
    width,
    height,
    boxCount,
    headline,
    subtitle,
    zoneLabel,
    background,
    accent,
    accentSoft,
    preview,
    imageSrc: preview,
  };
});

export function modelToFormat(model: MemeModel): Format {
  return {
    id: model.id,
    label: `${model.name} ${model.width}×${model.height}`,
    w: model.width,
    h: model.height,
  };
}

export function createModelElements(model: MemeModel, options: { usePageImage?: boolean } = {}): Element[] {
  const usePageImage = options.usePageImage ?? false;
  const format = modelToFormat(model);
  const marginX = Math.round(format.w * 0.08);
  const marginY = Math.round(format.h * 0.08);
  const titleSize = Math.max(40, Math.round(Math.min(format.w, format.h) * 0.09));
  const subtitleSize = Math.max(20, Math.round(titleSize * 0.4));

  const backgroundShape: Element = {
    id: `bg-${model.id}`,
    type: "shape",
    shape: "rect",
    x: 0,
    y: 0,
    w: format.w,
    h: format.h,
    rotation: 0,
    z: 0,
    fill: model.background,
    stroke: "transparent",
    strokeWidth: 0,
  };

  const accentShape: Element = {
    id: `accent-${model.id}`,
    type: "shape",
    shape: model.layout === "frame" ? "rect" : model.layout === "comic" ? "burst" : "rect",
    x: model.layout === "split" ? 0 : marginX,
    y: model.layout === "split" ? 0 : marginY,
    w: model.layout === "split" ? Math.round(format.w * 0.34) : Math.round(format.w - marginX * 2),
    h: model.layout === "split" ? format.h : Math.round(format.h - marginY * 2),
    rotation: 0,
    z: 1,
    fill: model.layout === "split" ? model.accent : model.accentSoft,
    stroke: model.accent,
    strokeWidth: model.layout === "frame" ? Math.max(4, Math.round(format.w * 0.008)) : 0,
  };

  const imageElement: Element | null = model.imageSrc && !usePageImage
    ? {
        id: `image-${model.id}`,
        type: "image",
        src: model.imageSrc,
        x: 0,
        y: 0,
        w: format.w,
        h: format.h,
        rotation: 0,
        z: 1,
      }
    : null;

  const headline: Element = {
    id: `headline-${model.id}`,
    type: "text",
    text: model.headline,
    x: marginX,
    y: Math.round(format.h * 0.28),
    w: format.w - marginX * 2,
    h: Math.round(format.h * 0.2),
    rotation: 0,
    z: 2,
    fontFamily: "Impact",
    fontSize: titleSize,
    color: "#ffffff",
    bold: true,
    underline: false,
    align: "center",
    bgColor: "transparent",
    bgPadding: 0,
    bgRadius: 0,
    letterSpacing: 0.5,
    lineHeight: 0.95,
    outlineColor: "#000000",
    outlineWidth: 4,
  };

  const subtitleElement: Element = {
    id: `subtitle-${model.id}`,
    type: "text",
    text: model.subtitle,
    x: marginX,
    y: Math.round(format.h * 0.52),
    w: format.w - marginX * 2,
    h: Math.round(format.h * 0.12),
    rotation: 0,
    z: 3,
    fontFamily: "Inter",
    fontSize: subtitleSize,
    color: "#ffffff",
    bold: false,
    underline: false,
    align: "center",
    bgColor: "transparent",
    bgPadding: 0,
    bgRadius: 0,
    letterSpacing: 0,
    lineHeight: 1.1,
    outlineColor: "#000000",
    outlineWidth: usePageImage ? 3 : 0,
  };

  if (model.layout === "caption") return (usePageImage
    ? [subtitleElement, headline]
    : [backgroundShape, imageElement ?? accentShape, subtitleElement, headline]).filter(Boolean) as Element[];
  if (model.layout === "split") {
    if (usePageImage) return [headline, subtitleElement].filter(Boolean) as Element[];
    return [
      backgroundShape,
      imageElement ?? accentShape,
      {
        ...headline,
        x: Math.round(format.w * 0.42),
        w: Math.round(format.w * 0.5),
        align: "left",
      },
      { ...subtitleElement, x: Math.round(format.w * 0.42), y: Math.round(format.h * 0.58), w: Math.round(format.w * 0.5), align: "left" },
    ];
  }

  if (usePageImage) return [headline, subtitleElement].filter(Boolean) as Element[];
  return [backgroundShape, imageElement ?? accentShape, headline, subtitleElement];
}
