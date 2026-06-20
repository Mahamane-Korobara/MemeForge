import { useCallback, useEffect, useRef, useState } from "react";
import { FORMATS } from "./constants";
import type { Element, Format, ImageEl } from "./types";
import { BackgroundRemovalError, removeBackground } from "@/lib/remove-bg.functions";
import { loadImageSize } from "./media-utils";
import type { UserAsset } from "@/types/assets";

type Params = {
  setFormat: (format: Format) => void;
  addImage: (src: string) => void;
  commit: () => void;
  updateElement: (id: string, patch: Partial<Element>) => void;
};

type InsertAssetDetail = UserAsset & {
  blob?: Blob;
  mimeType?: string;
};

async function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("Lecture impossible"));
    reader.readAsDataURL(blob);
  });
}

export function useMemeEditorMedia({ setFormat, addImage, commit, updateElement }: Params) {
  const [uploads, setUploads] = useState<string[]>([]);
  const [removingBgId, setRemovingBgId] = useState<string | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [pageImageSrc, setPageImageSrc] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoStart, setVideoStart] = useState(0);
  const [videoEnd, setVideoEnd] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const videoElRef = useRef<HTMLVideoElement>(null);

  const uploadImages = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          const src = String(reader.result ?? "");
          setUploads((current) => [src, ...current]);
          addImage(src);
        };
        reader.readAsDataURL(file);
      });
    },
    [addImage],
  );

  const setImageAsPage = useCallback(
    async (src: string) => {
      try {
        const { w, h } = await loadImageSize(src);
        if (videoSrc) URL.revokeObjectURL(videoSrc);
        setVideoSrc(null);
        setVideoDuration(0);
        setVideoStart(0);
        setVideoEnd(0);
        setPageImageSrc(src);
        setFormat({ id: "image", label: `Image ${w}×${h}`, w, h });
      } catch (error) {
        console.error(error);
        alert("Impossible d'utiliser cette image comme page.");
      }
    },
    [setFormat, videoSrc],
  );

  const uploadVideo = useCallback((files: FileList | null) => {
    if (!files?.[0]) return;
    const file = files[0];
    if (!file.type.startsWith("video/")) {
      alert("Fichier vidéo requis");
      return;
    }

    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.src = url;
    video.onloadedmetadata = () => {
      const duration = video.duration;
      const width = video.videoWidth || 720;
      const height = video.videoHeight || 1280;
      setPageImageSrc(null);
      setFormat({ id: "video", label: `Vidéo ${width}×${height}`, w: width, h: height });
      setVideoSrc(url);
      setVideoDuration(duration);
      setVideoStart(0);
      setVideoEnd(Math.min(duration, 15));
    };
  }, [setFormat]);

  const clearVideo = useCallback(() => {
    if (videoSrc) URL.revokeObjectURL(videoSrc);
    setVideoSrc(null);
    setPageImageSrc(null);
    setVideoDuration(0);
    setVideoStart(0);
    setVideoEnd(0);
    setFormat(FORMATS[0]);
  }, [setFormat, videoSrc]);

  const removeImageBackground = useCallback(
    async (image: ImageEl) => {
      setRemovingBgId(image.id);
      try {
        let dataUrl = image.src;
        if (!dataUrl.startsWith("data:")) {
          const response = await fetch(dataUrl);
          const blob = await response.blob();
          dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result ?? ""));
            reader.readAsDataURL(blob);
          });
        }
        const result = await removeBackground({ imageDataUrl: dataUrl });
        commit();
        updateElement(image.id, { src: result.dataUrl });
        setUploads((current) => [result.dataUrl, ...current]);
      } catch (error) {
        console.error("Erreur suppression fond:", error);
        if (error instanceof BackgroundRemovalError) {
          if (error.code === "GEMINI_QUOTA") {
            alert("Quota Gemini atteint pour la suppression de fond. Réessaie plus tard.");
          } else if (error.code === "REMOVE_BG_QUOTA") {
            alert("Quota remove.bg atteint et le fallback Gemini n'a pas pu terminer la suppression.");
          } else if (error.code === "GEMINI_NO_IMAGE") {
            alert("Gemini n'a pas renvoyé d'image détourée. Essaie une autre image.");
          } else {
            alert(`Impossible de supprimer l'arrière-plan: ${error.message}`);
          }
        } else {
          alert("Impossible de supprimer l'arrière-plan. " + (error instanceof Error ? error.message : ""));
        }
      } finally {
        setRemovingBgId(null);
      }
    },
    [commit, updateElement],
  );

  useEffect(() => {
    const onInsertAsset = async (event: Event) => {
      const detail = (event as CustomEvent<InsertAssetDetail>).detail;
      if (!detail) return;
      try {
        const source = detail.blob ? await blobToDataUrl(detail.blob) : detail.thumbnail;
        if (!source) return;
        if (detail.type === "image") {
          await setImageAsPage(source);
          return;
        }
        addImage(source);
      } catch (error) {
        console.error("Insertion d'asset impossible:", error);
      }
    };

    window.addEventListener("meme-editor:insert-asset", onInsertAsset as EventListener);
    return () => window.removeEventListener("meme-editor:insert-asset", onInsertAsset as EventListener);
  }, [addImage, setImageAsPage]);

  return {
    state: {
      uploads,
      removingBgId,
      videoSrc,
      pageImageSrc,
      videoDuration,
      videoStart,
      videoEnd,
    },
    refs: {
      fileInputRef,
      videoInputRef,
      videoElRef,
    },
    actions: {
      uploadImages,
      setImageAsPage,
      uploadVideo,
      clearVideo,
      removeBackground: removeImageBackground,
      setVideoStart,
      setVideoEnd,
      setVideoSrc,
    },
  };
}
