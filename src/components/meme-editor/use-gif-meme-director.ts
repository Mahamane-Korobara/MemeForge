import { useCallback, useState } from "react";
import { describeGeminiError, generateGeminiText, hasGeminiKey, runWithConcurrency } from "../../lib/gemini";
import { hasGiphyKey, searchGiphyGif } from "../../lib/giphy";
import { downloadBlob, gifMemeSupported, renderCaptionedGif } from "../../lib/gif-meme";
import type { DirectorTone } from "./use-meme-director";

export type GifVariant = {
  id: string;
  gifUrl: string;
  width: number;
  height: number;
  topText: string;
  bottomText: string;
  query: string;
};

type GifConcept = { topText?: string; bottomText?: string; giphyQuery?: string };

const TONE_LABELS: Record<DirectorTone, string> = {
  auto: "le ton le plus drôle possible",
  absurde: "un ton absurde et décalé",
  sarcastique: "un ton sarcastique et cynique",
  wholesome: "un ton bienveillant et mignon",
  relatable: "un ton hyper relatable du quotidien",
  dev: "un ton geek/développeur/tech",
};

export const GIF_COUNT_MIN = 1;
export const GIF_COUNT_MAX = 4;

function buildPrompt(situation: string, tone: DirectorTone, count: number) {
  return `Tu crées des mèmes GIF animés francophones. À partir d'une situation, tu écris une légende COURTE et drôle (${TONE_LABELS[tone]}) et tu proposes une recherche de GIF de réaction.

Situation : "${situation}"

Pour chaque proposition, renvoie un objet JSON avec :
- "topText" : texte du haut en français (contexte court, PEUT être vide "")
- "bottomText" : texte du bas en français (la chute drôle, obligatoire)
- "giphyQuery" : 2 à 4 mots-clés EN ANGLAIS décrivant un GIF de réaction animé qui illustre la vanne (ex: "tired monday", "mind blown", "awkward smile")

Textes courts et percutants, pas d'emojis, pas de hashtags. Varie les GIF entre propositions.
Génère ${count} proposition(s). Retourne UNIQUEMENT un tableau JSON : [{"topText":"","bottomText":"...","giphyQuery":"..."}]`;
}

function parseConcepts(raw: string): GifConcept[] {
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) return [];
  try {
    const parsed = JSON.parse(match[0]);
    return Array.isArray(parsed) ? (parsed as GifConcept[]) : [];
  } catch {
    return [];
  }
}

async function conceptToVariant(concept: GifConcept): Promise<GifVariant | null> {
  const query = (concept.giphyQuery || concept.bottomText || concept.topText || "").trim();
  const gif = await searchGiphyGif(query);
  if (!gif) return null;
  return {
    id: `gif-${gif.id}-${Math.random().toString(36).slice(2, 7)}`,
    gifUrl: gif.url,
    width: gif.width,
    height: gif.height,
    topText: (concept.topText ?? "").trim(),
    bottomText: (concept.bottomText ?? "").trim(),
    query,
  };
}

export function useGifMemeDirector() {
  const [situation, setSituation] = useState("");
  const [tone, setTone] = useState<DirectorTone>("auto");
  const [count, setCount] = useState(2);
  const [variants, setVariants] = useState<GifVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const generate = useCallback(async () => {
    const trimmed = situation.trim();
    if (!trimmed) {
      setError("Décris d'abord une situation.");
      return;
    }
    if (!hasGeminiKey()) {
      setError("Clé Gemini absente (VITE_GEMINI_API_KEY).");
      return;
    }
    if (!hasGiphyKey()) {
      setError("Clé Giphy absente (VITE_GIPHY_API_KEY).");
      return;
    }

    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const raw = await generateGeminiText(buildPrompt(trimmed, tone, count), { json: true });
      const concepts = parseConcepts(raw).slice(0, count);
      if (!concepts.length) {
        setError("L'IA n'a pas produit de légende exploitable.");
        return;
      }
      const results = await runWithConcurrency(concepts, (concept) => conceptToVariant(concept), 3);
      const found = results.filter((result) => result.ok && result.value).map((result) => (result as { value: GifVariant }).value);
      if (!found.length) {
        setError("Aucun GIF trouvé pour ces légendes. Réessaie.");
        return;
      }
      setVariants(found);
      if (found.length < concepts.length) setNotice(`${found.length} GIF sur ${concepts.length} trouvés.`);
    } catch (err) {
      setError(describeGeminiError(err));
    } finally {
      setLoading(false);
    }
  }, [count, situation, tone]);

  const regenerate = useCallback(
    async (variantId: string) => {
      const trimmed = situation.trim();
      if (!trimmed || !hasGeminiKey() || !hasGiphyKey()) return;
      setRegeneratingId(variantId);
      setError(null);
      try {
        const raw = await generateGeminiText(buildPrompt(trimmed, tone, 1), { json: true });
        const [concept] = parseConcepts(raw);
        const next = concept ? await conceptToVariant(concept) : null;
        if (!next) {
          setError("Régénération impossible, réessaie.");
          return;
        }
        setVariants((current) => current.map((variant) => (variant.id === variantId ? { ...next, id: variantId } : variant)));
      } catch (err) {
        setError(describeGeminiError(err));
      } finally {
        setRegeneratingId(null);
      }
    },
    [situation, tone],
  );

  const renderVariantGif = useCallback(async (variant: GifVariant) => {
    const blob = await renderCaptionedGif(variant.gifUrl, { topText: variant.topText, bottomText: variant.bottomText });
    return { blob, fileName: `meme_${variant.query.replace(/\s+/g, "-") || "gif"}.gif` };
  }, []);

  const download = useCallback(
    async (variant: GifVariant) => {
      if (!gifMemeSupported()) {
        setError("Ton navigateur ne permet pas de générer le GIF (ImageDecoder indisponible). Essaie Chrome/Edge/Firefox à jour.");
        return;
      }
      setDownloadingId(variant.id);
      setError(null);
      try {
        const { blob, fileName } = await renderVariantGif(variant);
        downloadBlob(blob, fileName);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Création du GIF impossible.");
      } finally {
        setDownloadingId(null);
      }
    },
    [renderVariantGif],
  );

  // Partage le GIF animé lui-même (fichier .gif) via le partage natif, sinon le télécharge.
  const share = useCallback(
    async (variant: GifVariant) => {
      if (!gifMemeSupported()) {
        setError("Ton navigateur ne permet pas de générer le GIF. Essaie Chrome/Edge/Firefox à jour.");
        return;
      }
      setSharingId(variant.id);
      setError(null);
      try {
        const { blob, fileName } = await renderVariantGif(variant);
        const file = new File([blob], fileName, { type: "image/gif" });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: "Mème GIF" });
        } else {
          downloadBlob(blob, fileName);
          setError("Partage natif indisponible ici : le GIF a été téléchargé.");
        }
      } catch (err) {
        if (!(err instanceof Error && err.name === "AbortError")) {
          setError(err instanceof Error ? err.message : "Partage du GIF impossible.");
        }
      } finally {
        setSharingId(null);
      }
    },
    [renderVariantGif],
  );

  return {
    state: {
      situation,
      tone,
      count,
      variants,
      loading,
      regeneratingId,
      downloadingId,
      sharingId,
      error,
      notice,
      supported: gifMemeSupported(),
      hasKeys: hasGeminiKey() && hasGiphyKey(),
    },
    actions: { setSituation, setTone, setCount, generate, regenerate, download, share },
  };
}
