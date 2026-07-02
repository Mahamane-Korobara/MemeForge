import { useCallback, useEffect, useMemo, useState } from "react";
import { MEME_MODELS, type MemeModel } from "./model-library-data";
import { REAL_MODELS_CACHE_KEY, isValidModel, sanitizeModel } from "./model-library-utils";

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
  "Et ça marche",
  "Personne n'était prêt",
  "On garde ça",
  "C'était inévitable",
  "Trop tard maintenant",
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

export function useModelLibrary() {
  const [query, setQuery] = useState("");
  const [realModels, setRealModels] = useState<MemeModel[]>(MEME_MODELS);
  const [loadingReal, setLoadingReal] = useState(true);
  const [realError, setRealError] = useState<string | null>(null);

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

  const filteredRealModels = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return realModels.filter((model) => {
      if (!needle) return true;
      return [model.name, model.headline, model.subtitle, model.category].some((value) => value.toLowerCase().includes(needle));
    });
  }, [query, realModels]);

  return {
    state: {
      query,
      realModels: filteredRealModels,
      loadingReal,
      realError,
    },
    actions: {
      setQuery,
      refresh: () => void loadRealModels(true),
    },
  };
}
