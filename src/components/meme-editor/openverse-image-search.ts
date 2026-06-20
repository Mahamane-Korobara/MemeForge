type OpenverseImage = {
  url?: string;
  thumbnail?: string;
  width?: number;
  height?: number;
  title?: string;
};

type OpenverseResponse = {
  results?: OpenverseImage[];
};

async function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("Lecture impossible"));
    reader.readAsDataURL(blob);
  });
}

export async function searchOpenverseImage(query: string) {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const response = await fetch(`https://api.openverse.org/v1/images/?q=${encodeURIComponent(trimmed)}&page_size=5`);
  if (!response.ok) return null;

  const payload = (await response.json()) as OpenverseResponse;
  const image = payload.results?.find((item) => item.url || item.thumbnail);
  if (!image) return null;

  const source = image.url || image.thumbnail;
  if (!source) return null;

  const imageResponse = await fetch(source);
  if (!imageResponse.ok) return null;

  const blob = await imageResponse.blob();
  return {
    src: await blobToDataUrl(blob),
    width: Number(image.width) || 1200,
    height: Number(image.height) || 630,
    title: image.title || trimmed,
    source,
  };
}
