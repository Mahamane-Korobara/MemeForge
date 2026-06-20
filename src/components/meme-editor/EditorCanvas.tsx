import type { RefObject } from "react";
import { Scissors } from "lucide-react";
import type { Element, Format, ImageEl, ShapeEl, TextEl } from "./types";
import { ElementView } from "./ElementView";
import { ImageToolbar, ShapeToolbar, TextToolbar } from "./EditorToolbars";

type Props = {
  format: Format;
  canvasBg: string;
  elements: Element[];
  selected: Element | null;
  selectedId: string | null;
  displayScale: number;
  canvasRef: RefObject<HTMLDivElement | null>;
  stageRef: RefObject<HTMLDivElement | null>;
  videoElRef: RefObject<HTMLVideoElement | null>;
  videoSrc: string | null;
  pageImageSrc: string | null;
  videoDuration: number;
  videoStart: number;
  videoEnd: number;
  isExportingVideo: boolean;
  exportProgress: number;
  onClearSelection: () => void;
  onSelectElement: (id: string) => void;
  onUpdateElement: (id: string, patch: Partial<Element>) => void;
  onCommit: () => void;
  onDuplicateSelected: () => void;
  onDeleteSelected: () => void;
  onRemoveBackground: (image: ImageEl) => void;
  onSetAsPage: (image: ImageEl) => void;
  removingBgId: string | null;
  onVideoStartChange: (value: number) => void;
  onVideoEndChange: (value: number) => void;
};

export function EditorCanvas({
  format,
  canvasBg,
  elements,
  selected,
  selectedId,
  displayScale,
  canvasRef,
  stageRef,
  videoElRef,
  videoSrc,
  pageImageSrc,
  videoDuration,
  videoStart,
  videoEnd,
  isExportingVideo,
  exportProgress,
  onClearSelection,
  onSelectElement,
  onUpdateElement,
  onCommit,
  onDuplicateSelected,
  onDeleteSelected,
  onRemoveBackground,
  onSetAsPage,
  removingBgId,
  onVideoStartChange,
  onVideoEndChange,
}: Props) {
  return (
    <main
      ref={stageRef}
      className="relative min-h-0 flex-1 overflow-auto bg-app-bg"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClearSelection();
      }}
    >
      {selected?.type === "text" && (
        <TextToolbar
          el={selected as TextEl}
          onChange={(patch) => onUpdateElement(selected.id, patch)}
          onCommit={onCommit}
          onDuplicate={onDuplicateSelected}
          onDelete={onDeleteSelected}
        />
      )}
      {selected?.type === "shape" && (
        <ShapeToolbar
          el={selected as ShapeEl}
          onChange={(patch) => onUpdateElement(selected.id, patch)}
          onCommit={onCommit}
          onDuplicate={onDuplicateSelected}
          onDelete={onDeleteSelected}
        />
      )}
      {selected?.type === "image" && (
        <ImageToolbar
          onRemoveBg={() => onRemoveBackground(selected as ImageEl)}
          onSetAsPage={() => onSetAsPage(selected as ImageEl)}
          isRemoving={removingBgId === selected.id}
          onDuplicate={onDuplicateSelected}
          onDelete={onDeleteSelected}
        />
      )}

      <div className="flex min-h-full min-w-full items-center justify-center p-3 sm:p-6 lg:p-8">
        <div
          style={{
            width: format.w * displayScale,
            height: format.h * displayScale,
            flexShrink: 0,
          }}
        >
          <div
            ref={canvasRef}
            onMouseDown={() => onClearSelection()}
            className="relative overflow-hidden rounded-md shadow-2xl"
            style={{
              width: format.w,
              height: format.h,
              background: canvasBg,
              transform: `scale(${displayScale})`,
              transformOrigin: "top left",
            }}
          >
            {pageImageSrc && <img src={pageImageSrc} className="pointer-events-none absolute inset-0 h-full w-full object-cover" alt="" draggable={false} />}
            {videoSrc && (
              <video
                ref={videoElRef}
                src={videoSrc}
                className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              />
            )}

            {[...elements].sort((a, b) => a.z - b.z).map((element) => (
              <ElementView
                key={element.id}
                el={element}
                selected={selectedId === element.id}
                scale={displayScale}
                onSelect={() => onSelectElement(element.id)}
                onChange={(patch) => onUpdateElement(element.id, patch)}
                onCommit={onCommit}
              />
            ))}
          </div>
        </div>
      </div>

      {videoSrc && (
        <div className="sticky bottom-0 left-0 right-0 z-20 mx-auto mb-3 w-[min(700px,90%)] rounded-xl border border-panel-border bg-panel/95 p-3 shadow-xl backdrop-blur">
          <div className="flex items-center gap-2 text-xs font-medium">
            <Scissors className="h-3.5 w-3.5 text-purple" />
            <span>Découpe</span>
            <span className="ml-auto text-muted-foreground">
              {videoStart.toFixed(2)}s → {videoEnd.toFixed(2)}s ({(videoEnd - videoStart).toFixed(2)}s)
            </span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <label className="text-[11px] text-muted-foreground">
              Début
              <input
                type="range"
                min={0}
                max={videoDuration}
                step={0.05}
                value={videoStart}
                onChange={(e) => onVideoStartChange(Math.min(Number(e.target.value), videoEnd - 0.1))}
                className="mt-1 w-full"
              />
            </label>
            <label className="text-[11px] text-muted-foreground">
              Fin
              <input
                type="range"
                min={0}
                max={videoDuration}
                step={0.05}
                value={videoEnd}
                onChange={(e) => onVideoEndChange(Math.min(Math.max(Number(e.target.value), videoStart + 0.1), videoStart + 15))}
                className="mt-1 w-full"
              />
            </label>
          </div>
          {isExportingVideo && (
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div className="h-full bg-purple transition-all" style={{ width: `${exportProgress}%` }} />
            </div>
          )}
        </div>
      )}
    </main>
  );
}
