import { useEffect, useRef } from "react";
import { useMemeEditorExport } from "./use-meme-editor-export";
import { useMemeEditorMedia } from "./use-meme-editor-media";
import { useMemeEditorState } from "./use-meme-editor-state";
import type { MemeModel } from "./model-library-data";
import { MEME_MODELS, createModelElements } from "./model-library-data";

type ImgflipResponse = {
  success: boolean;
  data?: {
    memes?: Array<{
      id: string;
      name: string;
      url: string;
      width: number;
      height: number;
      box_count: number;
    }>;
  };
};

function mapImgflipMeme(item: { id: string; name: string; url: string; width: number; height: number; box_count: number }, index: number): MemeModel {
  const categories = ["Classique", "Réaction", "Drame", "Punchline", "Expressif"];
  const backgrounds = ["#111827", "#0f172a", "#312e81", "#1f2937", "#4c1d95"];
  const accents = ["#f59e0b", "#22c55e", "#38bdf8", "#f43f5e", "#a855f7"];
  const category = categories[index % categories.length];
  const accent = accents[index % accents.length];
  const background = backgrounds[index % backgrounds.length];
  const headlines = ["Quand ça passe enfin", "Moi à minuit", "Réunion surprise", "Plan parfait", "Compilation réussie"];
  const subtitles = ["Le résultat est parfois très sérieux.", "La scène qui parle toute seule.", "L'énergie parfaite pour un mème.", "Tout le monde a vu venir le problème.", "Le genre de mème qui fonctionne partout."];
  const headline = headlines[index % headlines.length];
  const subtitle = subtitles[index % subtitles.length];
  const zoneLabel = `${item.box_count} zone${item.box_count > 1 ? "s" : ""} de texte`;

  return {
    id: `imgflip-${item.id}`,
    name: item.name,
    category,
    layout: "poster",
    width: item.width,
    height: item.height,
    boxCount: item.box_count,
    headline,
    subtitle,
    zoneLabel,
    background,
    accent,
    accentSoft: `${accent}22`,
    preview: item.url,
    imageSrc: item.url,
  };
}

async function toDataUrl(source: string) {
  if (source.startsWith("data:")) return source;
  const response = await fetch(source);
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("Lecture impossible"));
    reader.readAsDataURL(blob);
  });
}

export function useMemeEditor() {
  const editorState = useMemeEditorState();
  const initializedRef = useRef(false);
  const media = useMemeEditorMedia({
    setFormat: editorState.actions.setFormat,
    addImage: editorState.actions.addImage,
    commit: editorState.actions.commit,
    updateElement: editorState.actions.updateElement,
  });
  const exportState = useMemeEditorExport({
    canvasRef: editorState.refs.canvasRef,
    selectedId: editorState.state.selectedId,
    setSelectedId: editorState.actions.setSelectedId,
    docName: editorState.state.docName,
    format: editorState.state.format,
    canvasBg: editorState.state.canvasBg,
    videoSrc: media.state.videoSrc,
    videoStart: media.state.videoStart,
    videoEnd: media.state.videoEnd,
  });

  const applyModel = async (model: MemeModel) => {
    let nextModel = model;
    if (model.imageSrc) {
      try {
        nextModel = { ...model, imageSrc: await toDataUrl(model.imageSrc) };
      } catch {
        nextModel = model;
      }
    }

    editorState.actions.pushHistory(editorState.state.elements);
    if (nextModel.imageSrc) {
      await media.actions.setImageAsPage(nextModel.imageSrc);
      editorState.actions.setElements(createModelElements(nextModel, { usePageImage: true }));
    } else {
      editorState.actions.setElements(createModelElements(nextModel));
    }
    editorState.actions.setSelectedId(null);
  };

  // Charger un vrai modèle d'imgflip avec image réelle au démarrage
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const loadRandomRealModel = async () => {
      try {
        const response = await fetch("https://api.imgflip.com/get_memes");
        const payload = (await response.json()) as ImgflipResponse;
        const memes = payload.success ? payload.data?.memes ?? [] : [];
        
        if (memes.length > 0) {
          const randomIndex = Math.floor(Math.random() * Math.min(memes.length, 50));
          const randomMeme = memes[randomIndex];
          const model = mapImgflipMeme(randomMeme, randomIndex);
          void applyModel(model);
        } else {
          // Fallback sur un modèle SVG si l'API échoue
          const randomIndex = Math.floor(Math.random() * MEME_MODELS.length);
          const randomModel = MEME_MODELS[randomIndex];
          void applyModel(randomModel);
        }
      } catch {
        // Fallback sur un modèle SVG si l'API échoue
        const randomIndex = Math.floor(Math.random() * MEME_MODELS.length);
        const randomModel = MEME_MODELS[randomIndex];
        void applyModel(randomModel);
      }
    };

    void loadRandomRealModel();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "z") {
        event.preventDefault();
        event.shiftKey ? editorState.actions.redo() : editorState.actions.undo();
      }
      if ((event.metaKey || event.ctrlKey) && event.key === "s") {
        event.preventDefault();
        exportState.actions.handleExport();
      }
      if (
        (event.key === "Delete" || event.key === "Backspace") &&
        editorState.state.selectedId &&
        !(event.target instanceof HTMLInputElement) &&
        !(event.target instanceof HTMLTextAreaElement)
      ) {
        editorState.actions.deleteSelected();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editorState.actions, editorState.state.selectedId, exportState.actions]);

  return {
    state: {
      ...editorState.state,
      ...media.state,
      ...exportState.state,
    },
    refs: {
      ...editorState.refs,
      ...media.refs,
    },
    actions: {
      ...editorState.actions,
      ...media.actions,
      ...exportState.actions,
      applyModel,
    },
  };
}
