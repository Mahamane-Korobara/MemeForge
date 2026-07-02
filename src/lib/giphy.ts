// Recherche d'un GIF Giphy pour un mème animé (côté client, clé gratuite).

export type GiphyGif = { id: string; url: string; width: number; height: number; title: string };

export function hasGiphyKey() {
  return Boolean((import.meta.env.VITE_GIPHY_API_KEY as string | undefined)?.trim());
}

type GiphyRendition = { url?: string; width?: string; height?: string };
type GiphyImages = { downsized?: GiphyRendition; fixed_width?: GiphyRendition; original?: GiphyRendition };
type GiphyEntry = { id?: string; title?: string; images?: GiphyImages };

function pickRendition(images: GiphyImages | undefined): GiphyRendition | null {
  return images?.downsized ?? images?.fixed_width ?? images?.original ?? null;
}

/** Renvoie un GIF parmi les meilleurs résultats (léger aléa pour la variété). */
export async function searchGiphyGif(query: string): Promise<GiphyGif | null> {
  const apiKey = (import.meta.env.VITE_GIPHY_API_KEY as string | undefined)?.trim();
  const trimmed = query.trim();
  if (!apiKey || !trimmed) return null;

  const endpoint = `https://api.giphy.com/v1/gifs/search?api_key=${encodeURIComponent(apiKey)}&q=${encodeURIComponent(trimmed)}&limit=15&rating=pg&lang=en`;
  const response = await fetch(endpoint);
  if (!response.ok) throw new Error(`GIPHY ${response.status}`);

  const payload = (await response.json()) as { data?: GiphyEntry[] };
  const entries = payload.data ?? [];
  const usable = entries
    .map((entry) => {
      const rendition = pickRendition(entry.images);
      if (!entry.id || !rendition?.url) return null;
      return {
        id: entry.id,
        url: rendition.url,
        width: Number(rendition.width) || 480,
        height: Number(rendition.height) || 360,
        title: entry.title ?? trimmed,
      } satisfies GiphyGif;
    })
    .filter((gif): gif is GiphyGif => Boolean(gif));

  if (!usable.length) return null;
  const top = usable.slice(0, 6);
  return top[Math.floor(Math.random() * top.length)];
}
