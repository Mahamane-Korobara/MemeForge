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

  try {
    // Augmenter page_size pour avoir plus de résultats et de variété
    const response = await fetch(
      `https://api.openverse.org/v1/images/?q=${encodeURIComponent(trimmed)}&page_size=20&order_by=relevance`,
    );
    if (!response.ok) return null;

    const payload = (await response.json()) as OpenverseResponse;
    const images = payload.results?.filter((item) => item.url || item.thumbnail) ?? [];
    
    if (images.length === 0) return null;

    // Sélectionner une image ALÉATOIRE au lieu de la première
    const randomIndex = Math.floor(Math.random() * Math.min(images.length, 15));
    const image = images[randomIndex];
    
    if (!image) return null;

    const source = image.url || image.thumbnail;
    if (!source) return null;

    // Ajouter CORS proxy et timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const imageResponse = await fetch(source, { 
        signal: controller.signal,
        headers: { 'Accept': 'image/*' }
      });
      clearTimeout(timeout);
      
      if (!imageResponse.ok) return null;

      const blob = await imageResponse.blob();
      return {
        src: await blobToDataUrl(blob),
        width: Number(image.width) || 1200,
        height: Number(image.height) || 630,
        title: image.title || trimmed,
        source,
      };
    } catch {
      clearTimeout(timeout);
      return null;
    }
  } catch {
    return null;
  }
}
