import { useCallback, useState } from "react";
import { MEME_FORMATS, MEME_FORMATS_BY_ID, type MemeFormat } from "./meme-formats";
import { describeGeminiError, generateGeminiText, hasGeminiKey } from "../../lib/gemini";

export type DirectorTone = "auto" | "absurde" | "sarcastique" | "wholesome" | "relatable" | "dev";

export type MemeVariant = {
  id: string;
  format: MemeFormat;
  fills: Record<string, string>;
};

const TONE_LABELS: Record<DirectorTone, string> = {
  auto: "le ton le plus drôle possible",
  absurde: "un ton absurde et décalé",
  sarcastique: "un ton sarcastique et cynique",
  wholesome: "un ton bienveillant et mignon",
  relatable: "un ton hyper relatable du quotidien",
  dev: "un ton geek/développeur/tech",
};

export const DIRECTOR_COUNT_MIN = 1;
export const DIRECTOR_COUNT_MAX = 6;

type RawVariant = {
  formatId?: string;
  fills?: Record<string, string>;
};

function buildCatalog() {
  return MEME_FORMATS.map((format) => {
    const zones = format.zones.map((zone) => `    - "${zone.id}" : ${zone.role}`).join("\n");
    return `• id "${format.id}" — ${format.name}\n  Mécanique : ${format.humorRule}\n  Zones à remplir :\n${zones}`;
  }).join("\n\n");
}

function buildPrompt(situation: string, tone: DirectorTone, count: number) {
  return `Tu es un expert des mèmes internet francophones. À partir d'une situation, tu choisis LE format de mème culte le plus adapté et tu écris des textes VRAIMENT drôles et partageables (${TONE_LABELS[tone]}), en français, argot naturel autorisé.

Situation : "${situation}"

Voici les formats disponibles (respecte STRICTEMENT la mécanique et le rôle de chaque zone) :

${buildCatalog()}

Règles :
- Choisis le format dont la mécanique colle le mieux à la situation (varie les formats entre les propositions).
- Écris des textes COURTS, percutants, drôles — pas explicatifs, pas plats. Vise le « c'est tellement moi » ou l'effet de surprise.
- Remplis TOUTES les zones du format choisi, avec les id de zone EXACTS.
- Pas de hashtags, pas d'emojis, pas de guillemets superflus dans les textes.

Génère ${count} proposition(s). Retourne UNIQUEMENT un tableau JSON valide de la forme :
[{"formatId":"<id>","fills":{"<zoneId>":"<texte>"}}]
sans aucun texte avant ou après.`;
}

function parseVariants(raw: string): RawVariant[] {
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) return [];
  try {
    const parsed = JSON.parse(match[0]);
    return Array.isArray(parsed) ? (parsed as RawVariant[]) : [];
  } catch {
    return [];
  }
}

function toVariant(raw: RawVariant): MemeVariant | null {
  const format = raw.formatId ? MEME_FORMATS_BY_ID.get(raw.formatId) : undefined;
  if (!format) return null;
  const fills: Record<string, string> = {};
  for (const zone of format.zones) {
    const value = raw.fills?.[zone.id];
    fills[zone.id] = (typeof value === "string" ? value : format.example?.[zone.id] ?? "").trim();
  }
  // Au moins une zone doit être remplie pour être exploitable.
  if (!Object.values(fills).some(Boolean)) return null;
  return { id: `var-${format.id}-${Math.random().toString(36).slice(2, 8)}`, format, fills };
}

export function useMemeDirector() {
  const [situation, setSituation] = useState("");
  const [tone, setTone] = useState<DirectorTone>("auto");
  const [count, setCount] = useState(3);
  const [variants, setVariants] = useState<MemeVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const generate = useCallback(async () => {
    const trimmed = situation.trim();
    if (!trimmed) {
      setError("Décris d'abord une situation.");
      return;
    }
    if (!hasGeminiKey()) {
      setError("Clé Gemini absente : ajoute VITE_GEMINI_API_KEY dans .env.local.");
      return;
    }

    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const raw = await generateGeminiText(buildPrompt(trimmed, tone, count), { json: true });
      const parsed = parseVariants(raw)
        .map(toVariant)
        .filter(Boolean) as MemeVariant[];
      if (!parsed.length) {
        setError("L'IA n'a pas produit de mème exploitable. Réessaie ou reformule.");
        return;
      }
      setVariants(parsed);
      if (parsed.length < count) setNotice(`${parsed.length} mème(s) valides sur ${count} demandés.`);
    } catch (err) {
      setError(describeGeminiError(err));
    } finally {
      setLoading(false);
    }
  }, [count, situation, tone]);

  const regenerate = useCallback(
    async (variantId: string) => {
      const trimmed = situation.trim();
      if (!trimmed || !hasGeminiKey()) return;
      setRegeneratingId(variantId);
      setError(null);
      try {
        const raw = await generateGeminiText(buildPrompt(trimmed, tone, 1), { json: true });
        const [next] = parseVariants(raw).map(toVariant).filter(Boolean) as MemeVariant[];
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

  return {
    state: { situation, tone, count, variants, loading, regeneratingId, error, notice, hasKey: hasGeminiKey() },
    actions: { setSituation, setTone, setCount, generate, regenerate },
  };
}
