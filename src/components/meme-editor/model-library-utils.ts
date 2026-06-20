import { MEME_MODELS, type MemeModel } from "./model-library-data";

export const REAL_MODELS_CACHE_KEY = "meme-forge:imgflip-models:v1";
export const AI_MODELS_CACHE_KEY = "meme-forge:ai-models:v1";

export function sanitizeModel(model: Partial<MemeModel>, index: number): MemeModel {
  const fallback = MEME_MODELS[index % MEME_MODELS.length];
  return {
    ...fallback,
    ...model,
    width: Number(model.width) || fallback.width,
    height: Number(model.height) || fallback.height,
    boxCount: Number(model.boxCount) || fallback.boxCount,
    headline: model.headline || fallback.headline,
    subtitle: model.subtitle || fallback.subtitle,
    zoneLabel: model.zoneLabel || fallback.zoneLabel,
    background: model.background || fallback.background,
    accent: model.accent || fallback.accent,
    accentSoft: model.accentSoft || fallback.accentSoft,
    preview: model.preview || fallback.preview,
  };
}

export function isValidModel(model: MemeModel) {
  return Number.isFinite(model.width) && Number.isFinite(model.height) && model.width > 0 && model.height > 0 && !!model.preview;
}

function normalizePrompt(prompt: string) {
  return prompt.trim().replace(/\s+/g, " ").replace(/[.!?]+$/u, "");
}

function hashPrompt(prompt: string) {
  let hash = 0;
  for (const char of prompt) {
    hash = (hash << 5) - hash + char.codePointAt(0)!;
    hash |= 0;
  }
  return Math.abs(hash);
}

export function buildFallbackAiModels(templates: MemeModel[], prompt: string) {
  const source = templates.length ? templates : MEME_MODELS;
  const cleaned = normalizePrompt(prompt) || "ce moment";
  const start = hashPrompt(cleaned) % source.length;
  const headlines = ["Quand", "Moi quand", "Le moment où", "Ça arrive quand", "Le frontend quand"];
  const subtitles = [
    "et tout part en production.",
    "et le bug revient.",
    "et personne ne comprend pourquoi.",
    "et tout le monde fait semblant d'avoir prévu ça.",
    "et là, silence absolu.",
  ];

  return Array.from({ length: 5 }, (_, index) => {
    const template = source[(start + index * 7) % source.length];
    return {
      ...template,
      id: `ai-${template.id}-${index}`,
      name: `IA ${template.name}`,
      category: "IA",
      headline: `${headlines[index % headlines.length]} ${cleaned}`,
      subtitle: subtitles[index % subtitles.length],
      zoneLabel: template.zoneLabel,
      preview: template.imageSrc ?? template.preview,
      imageSrc: template.imageSrc ?? template.preview,
    } satisfies MemeModel;
  });
}
