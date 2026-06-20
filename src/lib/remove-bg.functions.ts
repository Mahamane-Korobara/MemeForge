type RemoveBackgroundInput = {
  imageDataUrl: string;
};

type RemoveBackgroundResult = {
  dataUrl: string;
  provider: "remove.bg" | "gemini";
};

type GeminiInlineData = {
  mimeType?: string;
  data?: string;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        inlineData?: GeminiInlineData;
      }>;
    };
  }>;
};

type BackgroundErrorCode = "REMOVE_BG_QUOTA" | "GEMINI_QUOTA" | "GEMINI_NO_IMAGE" | "BAD_IMAGE";

export class BackgroundRemovalError extends Error {
  code: BackgroundErrorCode;

  constructor(code: BackgroundErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

function getRemoveBgKey() {
  const apiKey = import.meta.env.VITE_REMOVE_BG_API_KEY?.trim();
  if (!apiKey) throw new Error("VITE_REMOVE_BG_API_KEY manquant dans .env.local");
  return apiKey;
}

function getGeminiConfig() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
  const model = import.meta.env.VITE_GEMINI_MODEL?.trim() || "gemini-2.5-flash-image";
  if (!apiKey) throw new Error("VITE_GEMINI_API_KEY manquant dans .env.local");
  return { apiKey, model };
}

function extractInlineImage(response: GeminiResponse) {
  const parts = response.candidates?.[0]?.content?.parts ?? [];
  return parts.find((part) => typeof part.inlineData?.data === "string" && typeof part.inlineData?.mimeType === "string")?.inlineData;
}

async function dataUrlToBlob(dataUrl: string) {
  const response = await fetch(dataUrl);
  return response.blob();
}

async function removeBackgroundWithRemoveBg(imageDataUrl: string): Promise<RemoveBackgroundResult> {
  const match = imageDataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) throw new BackgroundRemovalError("BAD_IMAGE", "Format d'image invalide (data URL attendu)");

  const [, mimeType] = match;
  const blob = await dataUrlToBlob(imageDataUrl);
  const formData = new FormData();
  formData.append("image_file", blob, "input.png");
  formData.append("size", "auto");

  const response = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: {
      "X-Api-Key": getRemoveBgKey(),
    },
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    if (response.status === 402 || response.status === 429 || /quota|limit|credits/i.test(text)) {
      throw new BackgroundRemovalError("REMOVE_BG_QUOTA", "Quota remove.bg atteint");
    }
    throw new Error(`remove.bg ${response.status}: ${text.slice(0, 300)}`);
  }

  const result = await response.blob();
  return {
    dataUrl: `data:${result.type || mimeType};base64,${await blobToBase64(result)}`,
    provider: "remove.bg",
  };
}

async function blobToBase64(blob: Blob) {
  const buffer = await blob.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }
  return btoa(binary);
}

async function removeBackgroundWithGemini(imageDataUrl: string): Promise<RemoveBackgroundResult> {
  const match = imageDataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) throw new BackgroundRemovalError("BAD_IMAGE", "Format d'image invalide (data URL attendu)");

  const [, mimeType, base64] = match;
  const { apiKey, model } = getGeminiConfig();

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: "Supprime l'arrière-plan de cette image et renvoie uniquement le sujet principal en PNG transparent. N'ajoute aucun texte ni objet.",
            },
            {
              inlineData: {
                mimeType,
                data: base64,
              },
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    if (response.status === 429 || /quota|resource_exhausted/i.test(text)) {
      throw new BackgroundRemovalError("GEMINI_QUOTA", "Quota Gemini atteint");
    }
    throw new Error(`Gemini ${response.status}: ${text.slice(0, 500)}`);
  }

  const payload = (await response.json()) as GeminiResponse;
  const inlineData = extractInlineImage(payload);
  if (!inlineData?.data || !inlineData.mimeType) {
    throw new BackgroundRemovalError("GEMINI_NO_IMAGE", "Gemini n'a pas renvoyé d'image");
  }

  return {
    dataUrl: `data:${inlineData.mimeType};base64,${inlineData.data}`,
    provider: "gemini",
  };
}

export async function removeBackground(input: RemoveBackgroundInput): Promise<RemoveBackgroundResult> {
  try {
    return await removeBackgroundWithRemoveBg(input.imageDataUrl);
  } catch (error) {
    if (error instanceof BackgroundRemovalError && error.code !== "REMOVE_BG_QUOTA") {
      throw error;
    }

    const fallback = await removeBackgroundWithGemini(input.imageDataUrl);
    return fallback;
  }
}

