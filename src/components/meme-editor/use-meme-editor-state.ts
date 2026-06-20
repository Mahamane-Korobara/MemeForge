import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { FORMATS, nid } from "./constants";
import type { Element, Format, PanelKey, ShapeKind } from "./types";
import { scaleElementsForFormat } from "./format-utils";

function defaultTextElement(): Element {
  return {
    id: nid(),
    type: "text",
    text: "Ton mème ici",
    x: 120,
    y: 120,
    w: 540,
    h: 110,
    rotation: -4,
    z: 1,
    fontFamily: "Impact",
    fontSize: 72,
    color: "#111111",
    bold: true,
    underline: false,
    align: "center",
    bgColor: "transparent",
    bgPadding: 12,
    bgRadius: 8,
    letterSpacing: 0,
    lineHeight: 1.1,
    outlineColor: "#000000",
    outlineWidth: 0,
  };
}

export function useMemeEditorState() {
  const [format, setFormat] = useState<Format>(FORMATS[0]);
  const [canvasBg, setCanvasBg] = useState("#ffffff");
  const [elements, setElements] = useState<Element[]>([defaultTextElement()]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [docName, setDocName] = useState("Mème_Sans_Titre");
  const [zoom, setZoom] = useState<number | "fit">("fit");
  const [activePanel, setActivePanel] = useState<PanelKey>("templates");
  const [search, setSearch] = useState("");
  const [fitScale, setFitScale] = useState(1);
  const [, setHistory] = useState<Element[][]>([]);
  const [, setFuture] = useState<Element[][]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const nextZ = useRef(2);

  const selected = elements.find((element) => element.id === selectedId) ?? null;
  const displayScale = zoom === "fit" ? fitScale : (zoom / 100) * fitScale;

  useLayoutEffect(() => {
    const compute = () => {
      const stage = stageRef.current;
      if (!stage) return;
      const padding = 96;
      const availableWidth = stage.clientWidth - padding;
      const availableHeight = stage.clientHeight - padding;
      setFitScale(Math.min(availableWidth / format.w, availableHeight / format.h, 1));
    };

    compute();
    const observer = new ResizeObserver(compute);
    if (stageRef.current) observer.observe(stageRef.current);
    return () => observer.disconnect();
  }, [format]);
  const pushHistory = useCallback((next: Element[]) => {
    setHistory((items) => [...items, elements]);
    setFuture([]);
    setElements(next);
  }, [elements]);

  const changeFormat = useCallback(
    (nextFormat: Format) => {
      setHistory((items) => [...items, elements]);
      setFuture([]);
      setElements((current) => scaleElementsForFormat(current, format, nextFormat));
      setFormat(nextFormat);
      setSelectedId(null);
    },
    [elements, format],
  );
  const updateElement = useCallback((id: string, patch: Partial<Element>) => {
    setElements((previous) => previous.map((element) => (element.id === id ? ({ ...element, ...patch } as Element) : element)));
  }, []);

  const commit = useCallback(() => {
    setHistory((items) => [...items, elements]);
    setFuture([]);
  }, [elements]);

  const undo = useCallback(() => {
    setHistory((items) => {
      if (!items.length) return items;
      const previous = items[items.length - 1];
      setFuture((stack) => [elements, ...stack]);
      setElements(previous);
      return items.slice(0, -1);
    });
  }, [elements]);

  const redo = useCallback(() => {
    setFuture((stack) => {
      if (!stack.length) return stack;
      const next = stack[0];
      setHistory((items) => [...items, elements]);
      setElements(next);
      return stack.slice(1);
    });
  }, [elements]);

  const addElement = useCallback(
    (element: Element) => {
      pushHistory([...elements, element]);
      setSelectedId(element.id);
    },
    [elements, pushHistory],
  );

  const addText = useCallback(() => {
    addElement({
      id: nid(),
      type: "text",
      text: "Votre texte ici",
      x: format.w / 2 - 200,
      y: format.h / 2 - 40,
      w: 400,
      h: 80,
      rotation: 0,
      z: nextZ.current++,
      fontFamily: "Impact",
      fontSize: 56,
      color: "#111111",
      bold: false,
      underline: false,
      align: "center",
      bgColor: "transparent",
      bgPadding: 10,
      bgRadius: 8,
      letterSpacing: 0,
      lineHeight: 1.1,
      outlineColor: "#000000",
      outlineWidth: 0,
    });
  }, [addElement, format.h, format.w]);

  const addTextPreset = useCallback(
    (preset: { label: string; font: string; size: number; bold?: boolean }) => {
      addElement({
        id: nid(),
        type: "text",
        text: preset.label,
        x: format.w / 2 - 200,
        y: format.h / 2 - 40,
        w: 400,
        h: 80,
        rotation: 0,
        z: nextZ.current++,
        fontFamily: preset.font,
        fontSize: preset.size,
        color: "#111111",
        bold: !!preset.bold,
        underline: false,
        align: "center",
        bgColor: "transparent",
        bgPadding: 10,
        bgRadius: 8,
        letterSpacing: 0,
        lineHeight: 1.1,
        outlineColor: "#000000",
        outlineWidth: 0,
      });
    },
    [addElement, format.h, format.w],
  );

  const addSticker = useCallback(
    (emoji: string) => {
      addElement({
        id: nid(),
        type: "text",
        text: emoji,
        x: format.w / 2 - 80,
        y: format.h / 2 - 80,
        w: 160,
        h: 160,
        rotation: 0,
        z: nextZ.current++,
        fontFamily: "Arial",
        fontSize: 128,
        color: "#111111",
        bold: false,
        underline: false,
        align: "center",
        bgColor: "transparent",
        bgPadding: 0,
        bgRadius: 0,
        letterSpacing: 0,
        lineHeight: 1,
        outlineColor: "#000000",
        outlineWidth: 0,
      });
    },
    [addElement, format.h, format.w],
  );

  const addShape = useCallback(
    (kind: ShapeKind) => {
      addElement({
        id: nid(),
        type: "shape",
        shape: kind,
        x: format.w / 2 - 120,
        y: format.h / 2 - 120,
        w: 240,
        h: kind === "line" ? 20 : 240,
        rotation: 0,
        z: nextZ.current++,
        fill: kind.startsWith("bubble") ? "#ffffff" : "#a78bfa",
        stroke: kind.startsWith("bubble") ? "#111111" : "transparent",
        strokeWidth: kind.startsWith("bubble") ? 4 : 0,
      });
    },
    [addElement, format.h, format.w],
  );

  const addImage = useCallback(
    (src: string) => {
      addElement({
        id: nid(),
        type: "image",
        src,
        x: format.w / 2 - 150,
        y: format.h / 2 - 150,
        w: 300,
        h: 300,
        rotation: 0,
        z: nextZ.current++,
      });
    },
    [addElement, format.h, format.w],
  );

  const duplicateSelected = useCallback(() => {
    if (!selected) return;
    const copy = { ...selected, id: nid(), x: selected.x + 20, y: selected.y + 20, z: nextZ.current++ } as Element;
    pushHistory([...elements, copy]);
    setSelectedId(copy.id);
  }, [elements, pushHistory, selected]);

  const deleteSelected = useCallback(() => {
    if (!selected) return;
    pushHistory(elements.filter((element) => element.id !== selected.id));
    setSelectedId(null);
  }, [elements, pushHistory, selected]);

  return {
    state: {
      format,
      canvasBg,
      elements,
      selected,
      selectedId,
      docName,
      zoom,
      activePanel,
      search,
      fitScale,
      displayScale,
    },
    actions: {
      setFormat: changeFormat,
      setCanvasBg,
      setElements,
      setSelectedId,
      setDocName,
      setZoom,
      setActivePanel,
      setSearch,
      clearSelection: () => setSelectedId(null),
      updateElement,
      commit,
      undo,
      redo,
      addText,
      addTextPreset,
      addSticker,
      addShape,
      addImage,
      duplicateSelected,
      deleteSelected,
      pushHistory,
    },
    refs: {
      canvasRef,
      stageRef,
    },
  };
}
