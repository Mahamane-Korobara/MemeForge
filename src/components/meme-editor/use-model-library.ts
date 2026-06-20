import { useCallback, useEffect, useMemo, useState } from "react";
import { MEME_MODELS, type MemeModel } from "./model-library-data";
import { AI_MODELS_CACHE_KEY, REAL_MODELS_CACHE_KEY, buildFallbackAiModels, isValidModel, sanitizeModel } from "./model-library-utils";

type ImgflipResponse = {
  success: boolean;
  data?: {
    memes?: Array<{
      id: string;
      name: string;
      url: string;
      width: number;
      height: number;
      box_count: number;
    }>;
  };
};

const REAL_HEADLINES = [
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
];

const REAL_SUBTITLES = [
  "Le résultat est parfois très sérieux.",
  "La scène qui parle toute seule.",
  "L'énergie parfaite pour un mème.",
  "Tout le monde a vu venir le problème.",
  "Le genre de mème qui fonctionne partout.",
];

function mapRealModel(item: { id: string; name: string; url: string; width: number; height: number; box_count: number }, index: number): MemeModel {
  const categories = ["Classique", "Réaction", "Drame", "Punchline", "Expressif"];
  const backgrounds = ["#111827", "#0f172a", "#312e81", "#1f2937", "#4c1d95"];
  const accents = ["#f59e0b", "#22c55e", "#38bdf8", "#f43f5e", "#a855f7"];
  const category = categories[index % categories.length];
  const accent = accents[index % accents.length];
  const background = backgrounds[index % backgrounds.length];
  const headline = REAL_HEADLINES[index % REAL_HEADLINES.length];
  const subtitle = REAL_SUBTITLES[index % REAL_SUBTITLES.length];
  const zoneLabel = `${item.box_count} zone${item.box_count > 1 ? "s" : ""} de texte`;

  return {
    id: `imgflip-${item.id}`,
    name: item.name,
    category,
    layout: "poster",
    width: item.width,
    height: item.height,
    boxCount: item.box_count,
    headline,
    subtitle,
    zoneLabel,
    background,
    accent,
    accentSoft: `${accent}22`,
    preview: item.url,
    imageSrc: item.url,
  };
}

function parseAiModels(raw: string) {
  const jsonMatch = raw.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];
  try {
    return JSON.parse(jsonMatch[0]) as Array<{
      name: string;
      headline: string;
      subtitle: string;
      category: string;
      query: string;
      textX?: number;
      textY?: number;
      textW?: number;
      textH?: number;
      subtitleY?: number;
    }>;
  } catch {
    return [];
  }
}

function createAiModel(
  data: { name: string; headline: string; subtitle: string; category: string; textX?: number; textY?: number; subtitleY?: number },
  baseTemplate: MemeModel,
  index: number,
  image?: { src: string; width: number; height: number; title: string },
): MemeModel {
  return {
    ...baseTemplate,
    id: `ai-${index}-${baseTemplate.id}`,
    name: data.name || `IA ${baseTemplate.name}`,
    category: data.category || "IA",
    headline: data.headline || baseTemplate.headline,
    subtitle: data.subtitle || baseTemplate.subtitle,
    zoneLabel: baseTemplate.zoneLabel,
    width: image?.width || baseTemplate.width,
    height: image?.height || baseTemplate.height,
    preview: image?.src || baseTemplate.imageSrc || baseTemplate.preview,
    imageSrc: image?.src || baseTemplate.imageSrc || baseTemplate.preview,
    textX: data.textX ?? 50,
    textY: data.textY,
    subtitleY: data.subtitleY,
  };
}

export function useModelLibrary() {
  const [query, setQuery] = useState("");
  const [realModels, setRealModels] = useState<MemeModel[]>(MEME_MODELS);
  const [loadingReal, setLoadingReal] = useState(true);
  const [realError, setRealError] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState("un meme de bug drôle sur un frontend trop confiant");
  const [aiModels, setAiModels] = useState<MemeModel[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const loadRealModels = useCallback(async (forceRefresh = false) => {
    setLoadingReal(true);
    setRealError(null);

    if (!forceRefresh) {
      const cached = localStorage.getItem(REAL_MODELS_CACHE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as Partial<MemeModel>[];
          const sanitized = parsed.map((model, index) => sanitizeModel(model, index)).filter(isValidModel);
          if (sanitized.length >= 50) {
            setRealModels(sanitized);
            setLoadingReal(false);
            return;
          }
        } catch {
          /* ignore */
        }
      }
    }

    try {
      const response = await fetch("https://api.imgflip.com/get_memes");
      const payload = (await response.json()) as ImgflipResponse;
      const memes = payload.success ? payload.data?.memes ?? [] : [];
      const mapped = memes.slice(0, 120).map(mapRealModel);
      if (mapped.length) {
        setRealModels(mapped);
        localStorage.setItem(REAL_MODELS_CACHE_KEY, JSON.stringify(mapped));
      } else {
        setRealModels(MEME_MODELS);
        setRealError("Aucun template réel trouvé.");
      }
    } catch (error) {
      setRealModels((current) => (current.length > 120 ? current : MEME_MODELS));
      setRealError(error instanceof Error ? error.message : "Chargement impossible");
    } finally {
      setLoadingReal(false);
    }
  }, []);

  useEffect(() => {
    void loadRealModels();
  }, [loadRealModels]);

  useEffect(() => {
    try {
      const cached = localStorage.getItem(AI_MODELS_CACHE_KEY);
      if (!cached) return;
      const parsed = JSON.parse(cached) as Partial<MemeModel>[];
      const sanitized = parsed.map((model, index) => sanitizeModel(model, index)).filter(isValidModel).slice(0, 5);
      if (sanitized.length) setAiModels(sanitized);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (realModels.length && !aiModels.length) {
      setAiModels(buildFallbackAiModels(realModels.slice(0, 20), aiPrompt));
    }
  }, [aiModels.length, aiPrompt, realModels]);

  const filteredRealModels = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return realModels.filter((model) => {
      if (!needle) return true;
      return [model.name, model.headline, model.subtitle, model.category].some((value) => value.toLowerCase().includes(needle));
    });
  }, [query, realModels]);

  const generateAiModels = useCallback(async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
    const model = import.meta.env.VITE_GEMINI_MODEL?.trim() || "gemini-2.5-flash";
    if (!apiKey) {
      setAiError("VITE_GEMINI_API_KEY manquant");
      return;
    }

    setAiLoading(true);
    setAiError(null);
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          generationConfig: {
            responseMimeType: "application/json",
          },
          contents: [
            {
              parts: [
                {
                  text:
                    `Tu es un expert en création de modèles de mèmes avec une connaissance approfondie de la composition visuelle. Génère 5 modèles de mème créatifs en français basés sur ce thème: "${aiPrompt}".

Pour chaque modèle, crée un JSON avec:
- "name": nom du modèle (court, descriptif)
- "headline": texte principal percutant et humoristique (1-3 mots, style français actuel)
- "subtitle": texte secondaire complétant l'ambiance (court, impactant)
- "category": catégorie appropriée parmi: Réaction, Drame, Culte, Minimal, Punchline, Chaos, Screenshot, Poster
- "query": requête de recherche d'image SPECIFIQUE et PERTINENTE (3-5 mots en anglais) qui correspond DIRECTEMENT au thème "${aiPrompt}". Chaque query doit être DIFFÉRENT. Termes concrets, pas d'emojis.
- "textX": position horizontale du texte (0-100, en %) - centré = 50
- "textY": position verticale du headline (0-100, en %) - haut = 20, milieu = 40, bas = 70
- "subtitleY": position verticale du subtitle (0-100, en %) - doit être plus bas que textY

IMPORTANT: Les images doivent être DIRECTEMENT LIÉES au thème "${aiPrompt}". Pas de généralités.

Exemples:
- Pour "bug en prod": query="coding error computer", textX=50, textY=30, subtitleY=70
- Pour "réunion surprise": query="surprised people meeting office", textX=50, textY=25, subtitleY=65
- Pour "chat avec IA": query="human talking to robot ai", textX=50, textY=35, subtitleY=75

Retourne UNIQUEMENT un tableau JSON valide, sans texte avant ou après.`,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        if (response.status === 429 || /quota|resource_exhausted/i.test(text)) {
          setAiError("Quota Gemini atteint pour la génération de modèles.");
        } else {
          setAiError(`Gemini ${response.status}: ${text.slice(0, 200)}`);
        }
        return;
      }

      const payload = (await response.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
      const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
      const parsed = parseAiModels(text).slice(0, 5);
      const baseModels = realModels.length ? realModels : MEME_MODELS;
      
      // Générer des indices aléatoires uniques pour les images
      const usedIndices = new Set<number>();
      const getRandomImageIndex = () => {
        let index: number;
        do {
          index = Math.floor(Math.random() * baseModels.length);
        } while (usedIndices.has(index) && usedIndices.size < baseModels.length);
        usedIndices.add(index);
        return index;
      };
      
      const models = await Promise.all(
        parsed.map(async (item, index) => {
          const baseTemplate = baseModels[(index * 7) % baseModels.length];
          // Sélectionner une image ALÉATOIRE parmi les 100 modèles
          const imageModelIndex = getRandomImageIndex();
          const imageModel = baseModels[imageModelIndex];
          
          const image = imageModel.imageSrc
            ? {
                src: imageModel.imageSrc,
                width: imageModel.width,
                height: imageModel.height,
                title: imageModel.name,
              }
            : undefined;
          
          return createAiModel(item, baseTemplate, index, image);
        }),
      );
      setAiModels(models);
      localStorage.setItem(AI_MODELS_CACHE_KEY, JSON.stringify(models));
      if (!parsed.length) {
        setAiError("Réponse IA invalide");
        setAiModels(buildFallbackAiModels(realModels.slice(0, 20), aiPrompt));
      }
    } catch (error) {
      setAiError(error instanceof Error ? error.message : "Génération impossible");
      if (!aiModels.length) {
        setAiModels(buildFallbackAiModels(realModels.slice(0, 20), aiPrompt));
      }
    } finally {
      setAiLoading(false);
    }
  }, [aiPrompt, realModels, aiModels.length]);

  return {
    state: {
      query,
      realModels: filteredRealModels,
      loadingReal,
      realError,
      aiPrompt,
      aiModels,
      aiLoading,
      aiError,
    },
    actions: {
      setQuery,
      setAiPrompt,
      generateAiModels,
      refresh: () => void loadRealModels(true),
    },
  };
}
