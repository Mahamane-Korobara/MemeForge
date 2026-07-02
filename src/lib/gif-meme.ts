import { GIFEncoder, applyPalette, quantize } from "gifenc";

// Mèmes GIF animés : on décode un GIF (via ImageDecoder / WebCodecs, natif),
// on incruste la légende sur chaque frame, puis on ré-encode avec gifenc.

const MAX_SIDE = 480;
const MAX_FRAMES = 60;

// Typage minimal de l'API ImageDecoder (WebCodecs).
type DecodedFrame = { image: VideoFrame };
type ImageDecoderTrack = { frameCount: number; animated: boolean };
type ImageDecoderTracks = { ready: Promise<void>; selectedTrack?: ImageDecoderTrack };
type ImageDecoderInstance = {
  tracks: ImageDecoderTracks;
  decode(options: { frameIndex: number }): Promise<DecodedFrame>;
  close(): void;
};
type ImageDecoderCtor = new (init: { data: ArrayBuffer | Uint8Array; type: string }) => ImageDecoderInstance;

function getImageDecoder(): ImageDecoderCtor | null {
  return (globalThis as unknown as { ImageDecoder?: ImageDecoderCtor }).ImageDecoder ?? null;
}

export function gifMemeSupported() {
  return getImageDecoder() !== null;
}

export type GifCaption = { topText?: string; bottomText?: string };

function fitSize(width: number, height: number) {
  const scale = Math.min(MAX_SIDE / width, MAX_SIDE / height, 1);
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

function toArrayBufferView(data: Uint8Array) {
  return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawCaption(ctx: CanvasRenderingContext2D, rawText: string, position: "top" | "bottom", w: number, h: number) {
  const text = rawText.trim().toUpperCase();
  if (!text) return;

  const fontSize = Math.max(14, Math.round(w * 0.09));
  ctx.font = `700 ${fontSize}px Impact, "Anton", "Arial Narrow", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.lineJoin = "round";
  ctx.lineWidth = Math.max(2, fontSize * 0.16);
  ctx.strokeStyle = "#000000";
  ctx.fillStyle = "#ffffff";

  const lineHeight = fontSize * 1.04;
  const pad = h * 0.03;
  const lines = wrapLines(ctx, text, w * 0.94);
  const blockHeight = lines.length * lineHeight;
  const startY = position === "top" ? pad + fontSize : h - pad - blockHeight + fontSize;

  lines.forEach((line, index) => {
    const y = startY + index * lineHeight;
    ctx.strokeText(line, w / 2, y);
    ctx.fillText(line, w / 2, y);
  });
}

function encodeFrames(frames: { data: Uint8ClampedArray; delay: number }[], w: number, h: number) {
  const encoder = GIFEncoder();
  frames.forEach((frame, index) => {
    const palette = quantize(frame.data, 256, { format: "rgb565" });
    const indexed = applyPalette(frame.data, palette, "rgb565");
    encoder.writeFrame(indexed, w, h, { palette, delay: frame.delay, repeat: 0, first: index === 0 });
  });
  encoder.finish();
  return new Blob([toArrayBufferView(encoder.bytes()) as ArrayBuffer], { type: "image/gif" });
}

/** Décode un GIF, incruste la légende sur chaque frame, renvoie un Blob GIF animé. */
export async function renderCaptionedGif(gifUrl: string, caption: GifCaption): Promise<Blob> {
  const Decoder = getImageDecoder();
  if (!Decoder) throw new Error("Ton navigateur ne supporte pas la création de GIF (ImageDecoder indisponible).");

  const buffer = await (await fetch(gifUrl)).arrayBuffer();
  const decoder = new Decoder({ data: buffer, type: "image/gif" });
  await decoder.tracks.ready;
  const frameCount = Math.min(decoder.tracks.selectedTrack?.frameCount ?? 1, MAX_FRAMES);

  const first = await decoder.decode({ frameIndex: 0 });
  const { width, height } = fitSize(first.image.displayWidth, first.image.displayHeight);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas indisponible");

  const frames: { data: Uint8ClampedArray; delay: number }[] = [];
  for (let index = 0; index < frameCount; index += 1) {
    const decoded = index === 0 ? first : await decoder.decode({ frameIndex: index });
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(decoded.image as unknown as CanvasImageSource, 0, 0, width, height);
    if (caption.topText) drawCaption(ctx, caption.topText, "top", width, height);
    if (caption.bottomText) drawCaption(ctx, caption.bottomText, "bottom", width, height);
    frames.push({ data: ctx.getImageData(0, 0, width, height).data, delay: Math.max(20, Math.round((decoded.image.duration ?? 100000) / 1000)) });
    decoded.image.close();
  }
  decoder.close();

  return encodeFrames(frames, width, height);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
