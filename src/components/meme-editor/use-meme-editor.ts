import { useEffect } from "react";
import { useMemeEditorExport } from "./use-meme-editor-export";
import { useMemeEditorMedia } from "./use-meme-editor-media";
import { useMemeEditorState } from "./use-meme-editor-state";
import type { MemeModel } from "./model-library-data";
import { createModelElements } from "./model-library-data";

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
