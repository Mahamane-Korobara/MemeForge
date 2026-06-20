import { useCallback, useState } from "react";
import { toPng } from "html-to-image";
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

export function useMemeEditorExport({
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
  const [isExportingVideo, setIsExportingVideo] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const exportPng = useCallback(async () => {
    if (!canvasRef.current) return;
    const previousSelection = selectedId;
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
      const link = document.createElement("a");
      link.download = `${docName}_${format.w}x${format.h}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      node.style.transform = previousTransform;
      setSelectedId(previousSelection);
    }
  }, [canvasBg, canvasRef, docName, format.h, format.w, selectedId, setSelectedId]);

  const exportVideo = useCallback(async () => {
    if (!videoSrc || !canvasRef.current) return;
    const previousSelection = selectedId;
    setSelectedId(null);
    setIsExportingVideo(true);
    setExportProgress(0);
    try {
      const node = canvasRef.current;
      const previousTransform = node.style.transform;
      node.style.transform = "none";
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
        setExportProgress(Math.min(100, (elapsed / duration) * 100));
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
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${docName}_${format.w}x${format.h}.webm`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error(error);
      alert("Échec de l'export vidéo: " + (error instanceof Error ? error.message : ""));
    } finally {
      setIsExportingVideo(false);
      setExportProgress(0);
      setSelectedId(previousSelection);
    }
  }, [canvasRef, docName, format.h, format.w, selectedId, setSelectedId, videoEnd, videoSrc, videoStart]);

  const handleExport = useCallback(() => {
    if (videoSrc) {
      void exportVideo();
      return;
    }
    void exportPng();
  }, [exportPng, exportVideo, videoSrc]);

  return {
    state: {
      isExportingVideo,
      exportProgress,
    },
    actions: {
      handleExport,
    },
  };
}
