// Client Gemini (texte) partagé pour un usage 100% côté client.
//
// ⚠️ Sans backend, VITE_GEMINI_API_KEY est embarquée dans le bundle et donc
// visible dans le navigateur. Acceptable pour une clé gratuite personnelle,
// mais à proxyfier (ex: Vercel Function) si l'app devient publique.
//
// La génération d'images IA n'est PAS incluse : le tier gratuit Gemini la
// bloque (quota 0). Les visuels viennent des templates ou d'Openverse.

const DEFAULT_TEXT_MODEL = "gemini-2.5-flash";

export type GeminiErrorCode = "MISSING_KEY" | "QUOTA" | "INVALID_RESPONSE" | "HTTP";

export class GeminiError extends Error {
  code: GeminiErrorCode;
  status?: number;

  constructor(code: GeminiErrorCode, message: string, status?: number) {
    super(message);
    this.name = "GeminiError";
    this.code = code;
    this.status = status;
  }
}

type GeminiPart = {
  text?: string;
};

type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: GeminiPart[] } }>;
};

function getApiKey() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
  if (!apiKey) throw new GeminiError("MISSING_KEY", "VITE_GEMINI_API_KEY manquant dans .env.local");
  return apiKey;
}

export function hasGeminiKey() {
  return Boolean(import.meta.env.VITE_GEMINI_API_KEY?.trim());
}

function getTextModel() {
  return import.meta.env.VITE_GEMINI_TEXT_MODEL?.trim() || import.meta.env.VITE_GEMINI_MODEL?.trim() || DEFAULT_TEXT_MODEL;
}

async function callGenerateContent(model: string, body: unknown): Promise<GeminiResponse> {
  const apiKey = getApiKey();
  let response: Response;
  try {
    response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new GeminiError("HTTP", "Connexion à Gemini impossible (réseau).");
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    if (response.status === 429 || /quota|resource_exhausted|rate/i.test(text)) {
      throw new GeminiError("QUOTA", "Quota Gemini atteint. Réessaie plus tard (limite journalière/minute gratuite).", response.status);
    }
    throw new GeminiError("HTTP", `Gemini ${response.status}: ${text.slice(0, 200)}`, response.status);
  }

  return (await response.json()) as GeminiResponse;
}

/** Génère du texte (optionnellement contraint en JSON). */
export async function generateGeminiText(prompt: string, options: { json?: boolean } = {}) {
  const payload = await callGenerateContent(getTextModel(), {
    generationConfig: options.json ? { responseMimeType: "application/json" } : undefined,
    contents: [{ parts: [{ text: prompt }] }],
  });
  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
  if (!text.trim()) throw new GeminiError("INVALID_RESPONSE", "Réponse Gemini vide.");
  return text;
}

/**
 * Exécute `worker` sur chaque item avec une concurrence limitée (pour respecter
 * le ~10 req/min du tier gratuit). Renvoie un résultat par item, dans l'ordre.
 */
export async function runWithConcurrency<T, R>(
  items: T[],
  worker: (item: T, index: number) => Promise<R>,
  limit = 2,
): Promise<Array<{ ok: true; value: R } | { ok: false; error: unknown }>> {
  const results = new Array<{ ok: true; value: R } | { ok: false; error: unknown }>(items.length);
  let cursor = 0;

  async function runner() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      try {
        results[index] = { ok: true, value: await worker(items[index], index) };
      } catch (error) {
        results[index] = { ok: false, error };
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => runner()));
  return results;
}

export function describeGeminiError(error: unknown): string {
  if (error instanceof GeminiError) {
    switch (error.code) {
      case "MISSING_KEY":
        return "Clé Gemini absente : ajoute VITE_GEMINI_API_KEY dans .env.local.";
      case "QUOTA":
        return "Quota Gemini gratuit atteint. Réessaie dans quelques instants.";
      case "INVALID_RESPONSE":
        return "Réponse Gemini inexploitable. Réessaie.";
      default:
        return error.message;
    }
  }
  return error instanceof Error ? error.message : "Erreur inconnue.";
}
