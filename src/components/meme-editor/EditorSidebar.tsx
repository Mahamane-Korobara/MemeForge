import { useEffect, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { Image as ImageIcon, PaintBucket, Plus, Upload, Video as VideoIcon, X } from "lucide-react";
import type { Format, PanelKey, ShapeKind } from "./types";
import { StickerLibrary, type LibraryMode } from "./StickerLibrary";
import { ModelLibrary } from "./ModelLibrary";
import type { MemeModel } from "./model-library-data";
import type { MemeFormat } from "./meme-formats";
import { MyCreations } from "@/components/library/MyCreations";

type Props = {
  activePanel: PanelKey;
  canvasBg: string;
  onCanvasBgChange: (value: string) => void;
  onAddText: () => void;
  onAddTextPreset: (preset: { label: string; font: string; size: number; bold?: boolean }) => void;
  onAddShape: (kind: ShapeKind) => void;
  onApplyModel: (model: MemeModel) => void;
  onApplyMeme: (format: MemeFormat, fills: Record<string, string>) => void;
  search: string;
  onSearchChange: (value: string) => void;
  uploads: string[];
  onAddUploadedImage: (src: string) => void;
  onUseImageAsPage: (src: string) => void;
  onUploadImagesClick: () => void;
  onUploadVideoClick: () => void;
  onImageUpload: (files: FileList | null) => void;
  onVideoUpload: (files: FileList | null) => void;
  onClearVideo: () => void;
  videoSrc: string | null;
  pageImageSrc: string | null;
  videoDuration: number;
  format: Format;
  fileInputRef: RefObject<HTMLInputElement | null>;
  videoInputRef: RefObject<HTMLInputElement | null>;
  isOpen: boolean;
  onClose: () => void;
};

function SidebarSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <>
      <h2 className="text-lg font-semibold sm:text-xl">{title}</h2>
      {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      <div className="mt-3">{children}</div>
    </>
  );
}

export function EditorSidebar({
  activePanel,
  canvasBg,
  onCanvasBgChange,
  onAddText,
  onAddTextPreset,
  onAddShape,
  onApplyModel,
  onApplyMeme,
  search,
  onSearchChange,
  uploads,
  onAddUploadedImage,
  onUseImageAsPage,
  onUploadImagesClick,
  onUploadVideoClick,
  onImageUpload,
  onVideoUpload,
  onClearVideo,
  videoSrc,
  pageImageSrc,
  videoDuration,
  format,
  fileInputRef,
  videoInputRef,
  isOpen,
  onClose,
}: Props) {
  const [libraryMode, setLibraryMode] = useState<LibraryMode>("emoji");

  useEffect(() => {
    if (activePanel === "shapes") {
      setLibraryMode("shapes");
    }
  }, [activePanel]);

  return (
    <>
      {isOpen && <button type="button" onClick={onClose} className="fixed inset-0 z-20 bg-black/30 lg:hidden" aria-label="Fermer le panneau" />}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-[min(94vw,24rem)] border-r border-panel-border bg-panel shadow-2xl transition-transform duration-200 lg:static lg:z-auto lg:w-[22rem] lg:translate-x-0 lg:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="flex items-center justify-between border-b border-panel-border px-4 py-3 lg:hidden">
            <span className="text-sm font-semibold">Outils</span>
            <button onClick={onClose} className="rounded-md p-1 hover:bg-secondary" aria-label="Fermer">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {activePanel === "library" && (
              <div className="mb-5">
                <StickerLibrary
                  mode={libraryMode}
                  onModeChange={setLibraryMode}
                  query={search}
                  onQueryChange={onSearchChange}
                  onPickSticker={onAddUploadedImage}
                  onPickShape={onAddShape}
                />
              </div>
            )}

            {activePanel === "uploads" && (
              <SidebarSection title="Imports">
                <button
                  onClick={onUploadImagesClick}
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-purple px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
                >
                  <Upload className="h-4 w-4" />
                  Importer une image
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,image/gif"
                  multiple
                  className="hidden"
                  onChange={(e) => onImageUpload(e.target.files)}
                />

                <button
                  onClick={onUploadVideoClick}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-panel-border bg-secondary px-4 py-2.5 text-sm font-medium hover:bg-purple-soft"
                >
                  <VideoIcon className="h-4 w-4" />
                  Importer une vidéo (max 15s)
                </button>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => onVideoUpload(e.target.files)}
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  La vidéo ou l’image peuvent devenir la page. Ajoutez ensuite textes, formes et images par-dessus.
                </p>

                {(videoSrc || pageImageSrc) && (
                  <div className="mt-3 rounded-lg border border-purple/40 bg-purple-soft/30 p-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium">{videoSrc ? "Vidéo active" : "Image de page"}</span>
                      <button onClick={onClearVideo} className="rounded p-1 hover:bg-destructive/10 hover:text-destructive" title="Retirer">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      {format.w}×{format.h}
                      {videoSrc ? ` • ${videoDuration.toFixed(1)}s` : ""}
                    </div>
                  </div>
                )}

                <h3 className="mt-5 text-xs font-semibold uppercase text-muted-foreground">Bibliothèque</h3>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {uploads.map((src, index) => (
                    <div key={`${src}-${index}`} className="overflow-hidden rounded-lg border border-panel-border bg-panel">
                      <button onClick={() => onAddUploadedImage(src)} className="block aspect-square w-full">
                        <img src={src} className="h-full w-full object-cover" alt="" />
                      </button>
                      <div className="grid grid-cols-2 border-t border-panel-border">
                        <button
                          onClick={() => onAddUploadedImage(src)}
                          className="inline-flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] hover:bg-secondary"
                        >
                          <Plus className="h-3 w-3" />
                          Ajouter
                        </button>
                        <button
                          onClick={() => onUseImageAsPage(src)}
                          className="inline-flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] hover:bg-secondary"
                        >
                          <ImageIcon className="h-3 w-3" />
                          Page
                        </button>
                      </div>
                    </div>
                  ))}
                  {uploads.length === 0 && <p className="col-span-2 text-xs text-muted-foreground">Aucun import.</p>}
                </div>
              </SidebarSection>
            )}

            {activePanel === "text" && (
              <SidebarSection title="Texte">
                <button
                  onClick={onAddText}
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-purple px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter un texte
                </button>
                <div className="mt-4 space-y-2">
                  {[
                    { label: "Titre du mème", size: 72, font: "Impact", bold: true },
                    { label: "Sous-titre", size: 36, font: "Comic Sans MS" },
                    { label: "Petit texte", size: 22, font: "Arial" },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => onAddTextPreset(preset)}
                      className="w-full rounded-lg border border-panel-border bg-secondary px-4 py-3 text-left hover:bg-purple-soft"
                      style={{ fontFamily: preset.font, fontSize: Math.min(preset.size, 22), fontWeight: preset.bold ? 700 : 400 }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </SidebarSection>
            )}

            {activePanel === "history" && (
              <div className="space-y-4">
                <MyCreations />
              </div>
            )}

            {activePanel === "templates" && (
              <div className="space-y-5">
                <ModelLibrary onApplyModel={onApplyModel} onApplyMeme={onApplyMeme} />
              </div>
            )}

            {activePanel === "background" && (
              <SidebarSection title="Fond" description="Couleur de la page et du canvas.">
                <div className="mt-3 flex items-center gap-2">
                  <label className="flex h-10 flex-1 cursor-pointer items-center gap-2 rounded-lg border border-panel-border bg-secondary px-3 text-sm">
                    <PaintBucket className="h-4 w-4" />
                    <span className="truncate" style={{ color: canvasBg }}>
                      {canvasBg}
                    </span>
                    <input
                      type="color"
                      value={canvasBg}
                      onChange={(e) => onCanvasBgChange(e.target.value)}
                      className="ml-auto h-6 w-10 cursor-pointer"
                    />
                  </label>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {["#ffffff", "#000000", "#fef3c7", "#dbeafe", "#fce7f3", "#dcfce7", "#e0e7ff", "#fee2e2", "#1f2937"].map((color) => (
                    <button
                      key={color}
                      onClick={() => onCanvasBgChange(color)}
                      className="aspect-square rounded-lg border border-panel-border"
                      style={{ background: color }}
                    />
                  ))}
                </div>
              </SidebarSection>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
