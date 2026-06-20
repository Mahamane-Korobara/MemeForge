export async function loadImageSize(src: string) {
  return new Promise<{ w: number; h: number }>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      resolve({
        w: image.naturalWidth || image.width || 1,
        h: image.naturalHeight || image.height || 1,
      });
    };
    image.onerror = () => reject(new Error("Image invalide"));
    image.src = src;
  });
}
