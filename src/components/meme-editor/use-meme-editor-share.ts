import { useCallback, useMemo, useState } from "react";
import { toPng } from "html-to-image";
import { buildShareLinks, buildShareMessage, copyText } from "@/lib/share";
import { getSiteUrl } from "@/lib/site";
import type { Format } from "./types";
import type { RefObject } from "react";

type Params = {
  canvasRef: RefObject<HTMLDivElement | null>;
  selectedId: string | null;
  setSelectedId: (value: string | null) => void;
  docName: string;
  format: Format;
  canvasBg: string;
  videoSrc: string | null;
  videoStart: number;
  videoEnd: number;
};

async function captureImageBlob(
  canvasRef: RefObject<HTMLDivElement | null>,
  selectedId: string | null,
  setSelectedId: (value: string | null) => void,
  docName: string,
  format: Format,
  canvasBg: string,
) {
  if (!canvasRef.current) return null;
  setSelectedId(null);
  await new Promise((resolve) => setTimeout(resolve, 60));
  const node = canvasRef.current;
  const previousTransform = node.style.transform;
  node.style.transform = "none";
  try {
    const dataUrl = await toPng(node, {
      pixelRatio: 1,
      canvasWidth: format.w,
      canvasHeight: format.h,
      backgroundColor: canvasBg,
    });
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    return new File([blob], `${docName}_${format.w}x${format.h}.png`, { type: blob.type || "image/png" });
  } finally {
    node.style.transform = previousTransform;
    setSelectedId(selectedId);
  }
}

async function captureVideoBlob({
  canvasRef,
  selectedId,
  format,
  docName,
  videoSrc,
  videoStart,
  videoEnd,
  setSelectedId,
}: Params) {
  if (!videoSrc || !canvasRef.current) return null;

  setSelectedId(null);
  await new Promise((resolve) => setTimeout(resolve, 60));

  const node = canvasRef.current;
  const previousTransform = node.style.transform;
  node.style.transform = "none";
  try {
    const overlayDataUrl = await toPng(node, {
      pixelRatio: 1,
      canvasWidth: format.w,
      canvasHeight: format.h,
      backgroundColor: "transparent",
      filter: (element) => !(element instanceof HTMLVideoElement),
    });
    node.style.transform = previousTransform;

    const overlayImage = new Image();
    overlayImage.src = overlayDataUrl;
    await new Promise<void>((resolve, reject) => {
      overlayImage.onload = () => resolve();
      overlayImage.onerror = () => reject(new Error("overlay load"));
    });

    const video = document.createElement("video");
    video.src = videoSrc;
    video.crossOrigin = "anonymous";
    video.muted = false;
    video.playsInline = true;
    await new Promise<void>((resolve) => {
      video.onloadedmetadata = () => resolve();
    });

    const canvas = document.createElement("canvas");
    canvas.width = format.w;
    canvas.height = format.h;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas context indisponible");

    const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm";
    const stream = canvas.captureStream(30);
    const chunks: Blob[] = [];
    const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 5_000_000 });
    recorder.ondataavailable = (event) => {
      if (event.data.size) chunks.push(event.data);
    };

    const recorderDone = new Promise<void>((resolve) => {
      recorder.onstop = () => resolve();
    });

    video.currentTime = videoStart;
    await new Promise<void>((resolve) => {
      video.onseeked = () => resolve();
    });

    recorder.start();
    await video.play();
    const startTs = performance.now();
    const duration = Math.max(0.1, videoEnd - videoStart);

    let rafId = 0;
    const draw = () => {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      context.drawImage(overlayImage, 0, 0, canvas.width, canvas.height);
      const elapsed = (performance.now() - startTs) / 1000;
      if (video.currentTime >= videoEnd || elapsed >= duration) {
        video.pause();
        recorder.stop();
        return;
      }
      rafId = requestAnimationFrame(draw);
    };
    draw();

    await recorderDone;
    cancelAnimationFrame(rafId);

    const blob = new Blob(chunks, { type: mime });
    return new File([blob], `${docName}_${format.w}x${format.h}.webm`, { type: mime });
  } finally {
    node.style.transform = previousTransform;
    setSelectedId(selectedId);
  }
}

export function useMemeEditorShare({
  canvasRef,
  selectedId,
  setSelectedId,
  docName,
  format,
  canvasBg,
  videoSrc,
  videoStart,
  videoEnd,
}: Params) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shareMessage = useMemo(() => buildShareMessage(docName), [docName]);
  const shareLinks = useMemo(() => buildShareLinks(shareMessage), [shareMessage]);

  const createShareFile = useCallback(async () => {
    if (videoSrc) {
      return captureVideoBlob({ canvasRef, selectedId, setSelectedId, docName, format, canvasBg, videoSrc, videoStart, videoEnd });
    }
    return captureImageBlob(canvasRef, selectedId, setSelectedId, docName, format, canvasBg);
  }, [canvasBg, canvasRef, docName, format, selectedId, setSelectedId, videoEnd, videoSrc, videoStart]);

  const shareNative = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const file = await createShareFile();
      if (!file) {
        throw new Error("Impossible de préparer le fichier à partager");
      }

      const shareData: ShareData = {
        title: shareMessage.title,
        text: shareMessage.text,
        url: shareMessage.url,
      };

      if (navigator.canShare?.({ files: [file] })) {
        shareData.files = [file];
      }

      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await copyText(shareMessage.url);
    } catch (shareError) {
      setError(shareError instanceof Error ? shareError.message : "Partage impossible");
    } finally {
      setBusy(false);
    }
  }, [createShareFile, shareMessage]);

  const copyLink = useCallback(async () => {
    await copyText(shareMessage.url);
  }, [shareMessage.url]);

  return {
    state: {
      busy,
      error,
      shareMessage,
      shareLinks,
      shareUrl: getSiteUrl(),
    },
    actions: {
      shareNative,
      copyLink,
    },
  };
}
