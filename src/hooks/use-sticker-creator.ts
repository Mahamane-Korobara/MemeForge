import { useCallback, useEffect, useMemo, useState } from "react";
import { removeBackground } from "@/lib/remove-bg.functions";
import { renderStickerAsset } from "@/lib/sticker-animation";
import type {
  AnimationChoice,
  CreatorBackgroundMode,
  CreatorExportFormat,
  SaveAssetInput,
} from "@/types/assets";
import { saveAsset, saveCreatorSettings, getCreatorSettings } from "@/services/library/library.service";

type DraftState = {
  file: File | null;
  previewUrl: string | null;
  name: string;
  backgroundMode: CreatorBackgroundMode;
  animation: AnimationChoice;
  exportFormat: CreatorExportFormat;
  isSaving: boolean;
  error: string | null;
  status: string;
};

async function fileToDataUrl(file: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("Lecture impossible"));
    reader.readAsDataURL(file);
  });
}

async function makeThumbnail(dataUrl: string) {
  return new Promise<string>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const maxSide = 256;
      const scale = Math.min(maxSide / image.width, maxSide / image.height, 1);
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext("2d");
      if (!context) return reject(new Error("Canvas indisponible"));
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/png"));
    };
    image.onerror = () => reject(new Error("Miniature impossible"));
    image.src = dataUrl;
  });
}

export function useStickerCreator() {
  const [state, setState] = useState<DraftState>(() => {
    const settings = getCreatorSettings();
    return {
      file: null,
      previewUrl: null,
      name: "Nouveau sticker",
      backgroundMode: settings.backgroundMode,
      animation: settings.preferredAnimation,
      exportFormat: settings.defaultExportFormat,
      isSaving: false,
      error: null,
      status: "Prêt",
    };
  });

  useEffect(() => {
    saveCreatorSettings({
      backgroundMode: state.backgroundMode,
      preferredAnimation: state.animation,
      defaultExportFormat: state.exportFormat,
    });
  }, [state.animation, state.backgroundMode, state.exportFormat]);

  useEffect(() => {
    return () => {
      if (state.previewUrl) URL.revokeObjectURL(state.previewUrl);
    };
  }, [state.previewUrl]);

  const setFile = useCallback((file: File | null) => {
    setState((current) => {
      if (current.previewUrl) URL.revokeObjectURL(current.previewUrl);
      return {
        ...current,
        file,
        previewUrl: file ? URL.createObjectURL(file) : null,
        name: file?.name.replace(/\.[^.]+$/, "") || "Nouveau sticker",
        error: null,
        status: file ? "Image chargée" : "Prêt",
      };
    });
  }, []);

  const update = useCallback((patch: Partial<DraftState>) => {
    setState((current) => ({ ...current, ...patch }));
  }, []);

  const preview = useMemo(() => state.previewUrl, [state.previewUrl]);

  const createAsset = useCallback(async () => {
    if (!state.file) {
      update({ error: "Importe une image d'abord." });
      return null;
    }

    setState((current) => ({ ...current, isSaving: true, error: null, status: "Préparation..." }));
    try {
      let dataUrl = await fileToDataUrl(state.file);
      if (state.backgroundMode === "remove" && state.file.type.startsWith("image/")) {
        const result = await removeBackground({ imageDataUrl: dataUrl });
        dataUrl = result.dataUrl;
      }

      const thumbnail = await makeThumbnail(dataUrl);
      const rendered = await renderStickerAsset({
        sourceDataUrl: dataUrl,
        backgroundMode: state.backgroundMode,
        animation: state.animation,
        exportFormat: state.exportFormat,
      });
      const type = state.animation === "none" ? (state.backgroundMode === "remove" ? "sticker" : "image") : "gif";
      const input: SaveAssetInput = {
        name: state.name,
        type,
        thumbnail,
        file: rendered.blob,
        mimeType: rendered.mimeType,
        animation: state.animation === "none" ? undefined : state.animation,
        outputFormat: state.exportFormat,
        backgroundMode: state.backgroundMode,
      };
      const saved = await saveAsset(input);
      update({ status: "Création enregistrée", file: null });
      return saved;
    } catch (error) {
      update({
        error: error instanceof Error ? error.message : "Création impossible",
        status: "Erreur",
      });
      return null;
    } finally {
      setState((current) => ({ ...current, isSaving: false }));
    }
  }, [state.animation, state.backgroundMode, state.exportFormat, state.file, state.name, update]);

  return {
    state,
    preview,
    actions: {
      setFile,
      setName: (name: string) => update({ name }),
      setBackgroundMode: (backgroundMode: CreatorBackgroundMode) => update({ backgroundMode }),
      setAnimation: (animation: AnimationChoice) => update({ animation }),
      setExportFormat: (exportFormat: CreatorExportFormat) => update({ exportFormat }),
      createAsset,
      clearError: () => update({ error: null }),
    },
  };
}
