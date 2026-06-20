import WebPEncoder from "webp-encoder";
import { GIFEncoder, applyPalette, quantize } from "gifenc";
import type { AnimationChoice, CreatorBackgroundMode, CreatorExportFormat } from "@/types/assets";

type RenderStickerInput = {
  sourceDataUrl: string;
  backgroundMode: CreatorBackgroundMode;
  animation: AnimationChoice;
  exportFormat: CreatorExportFormat;
};

type RenderStickerResult = {
  blob: Blob;
  mimeType: string;
};

type TransformFrame = {
  scale: number;
  x: number;
  y: number;
  rotation: number;
  alpha: number;
};

const DURATION_MS = 1200;
const FRAME_RATE = 12;
const FRAME_COUNT = Math.max(8, Math.round((DURATION_MS / 1000) * FRAME_RATE));
const MAX_SIDE = 1024;

function easeOutCubic(value: number) {
  return 1 - (1 - value) ** 3;
}

function getTransform(animation: AnimationChoice, progress: number): TransformFrame {
  if (animation === "none") {
    return { scale: 1, x: 0, y: 0, rotation: 0, alpha: 1 };
  }

  const wave = Math.sin(progress * Math.PI * 2);
  const pulse = Math.sin(progress * Math.PI);

  switch (animation) {
    case "bounce":
      return { scale: 1 + Math.abs(wave) * 0.12, x: 0, y: -Math.abs(wave) * 0.08, rotation: 0, alpha: 1 };
    case "shake":
      return { scale: 1, x: wave * 0.06, y: 0, rotation: wave * 0.05, alpha: 1 };
    case "zoom":
      return { scale: 0.88 + pulse * 0.22, x: 0, y: 0, rotation: 0, alpha: 1 };
    case "rotation":
      return { scale: 1, x: 0, y: 0, rotation: progress * Math.PI * 2, alpha: 1 };
    case "fade":
      return { scale: 1, x: 0, y: 0, rotation: 0, alpha: 0.45 + Math.abs(pulse) * 0.55 };
    case "slide":
      return { scale: 1, x: (1 - easeOutCubic(progress)) * -0.32, y: 0, rotation: 0, alpha: 1 };
    default:
      return { scale: 1, x: 0, y: 0, rotation: 0, alpha: 1 };
  }
}

async function loadImage(dataUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Impossible de charger l'image"));
    image.src = dataUrl;
  });
}

function fitSize(width: number, height: number) {
  const scale = Math.min(MAX_SIDE / width, MAX_SIDE / height, 1);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
    scale,
  };
}

function makeCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Canvas indisponible");
  return { canvas, context };
}

function toArrayBufferView(data: Uint8Array | Uint8ClampedArray) {
  return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
}

async function renderFrames(image: HTMLImageElement, animation: AnimationChoice) {
  const size = fitSize(image.width, image.height);
  const { canvas, context } = makeCanvas(size.width, size.height);
  const drawWidth = image.width * size.scale;
  const drawHeight = image.height * size.scale;
  const frames: ImageData[] = [];
  const delay = Math.round(DURATION_MS / FRAME_COUNT);

  for (let index = 0; index < FRAME_COUNT; index += 1) {
    const progress = FRAME_COUNT === 1 ? 0 : index / (FRAME_COUNT - 1);
    const transform = getTransform(animation, progress);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    context.translate(canvas.width / 2 + transform.x * canvas.width, canvas.height / 2 + transform.y * canvas.height);
    context.rotate(transform.rotation);
    context.scale(transform.scale, transform.scale);
    context.globalAlpha = transform.alpha;
    context.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    context.restore();
    frames.push(context.getImageData(0, 0, canvas.width, canvas.height));
  }

  return { frames, size, delay };
}

function encodeGif(frames: ImageData[], width: number, height: number, delay: number) {
  const encoder = GIFEncoder({ initialCapacity: 1024 * 1024 });

  frames.forEach((frame) => {
    const palette = quantize(frame.data, 256, {
      format: "rgba4444",
      clearAlpha: true,
      clearAlphaThreshold: 0,
    });
    const index = applyPalette(frame.data, palette, "rgba4444");
    encoder.writeFrame(index, width, height, {
      palette,
      delay,
      transparent: true,
      transparentIndex: 0,
      dispose: 2,
    });
  });

  encoder.finish();
  return new Blob([toArrayBufferView(encoder.bytes()) as ArrayBuffer], { type: "image/gif" });
}

function encodeWebP(frames: ImageData[], width: number, height: number, delay: number) {
  const gifBlob = encodeGif(frames, width, height, delay);
  return gifBlob.arrayBuffer().then((buffer) => {
    const animated = WebPEncoder.encodeGifImageData(new Uint8Array(buffer), buffer.byteLength, 1);
    return new Blob([toArrayBufferView(animated) as ArrayBuffer], { type: "image/webp" });
  });
}

export async function renderStickerAsset(input: RenderStickerInput): Promise<RenderStickerResult> {
  const image = await loadImage(input.sourceDataUrl);

  if (input.animation === "none") {
    const size = fitSize(image.width, image.height);
    const { canvas, context } = makeCanvas(size.width, size.height);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const mimeType = input.backgroundMode === "remove" ? "image/png" : "image/png";
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => {
        if (!result) return reject(new Error("Export PNG impossible"));
        resolve(result);
      }, mimeType);
    });

    return { blob, mimeType };
  }

  const { frames, size, delay } = await renderFrames(image, input.animation);
  if (input.exportFormat === "webp") {
    const blob = await encodeWebP(frames, size.width, size.height, delay);
    return { blob, mimeType: "image/webp" };
  }

  const blob = encodeGif(frames, size.width, size.height, delay);
  return { blob, mimeType: "image/gif" };
}
