import { Film, Search, Shapes, SmilePlus, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useStickerLibrary } from "./use-sticker-library";
import { BUBBLE_LIST, SHAPE_LIST } from "./constants";
import { ShapeSVG } from "./ShapeSVG";
import type { ShapeKind } from "./types";

export type LibraryMode = "emoji" | "gifs" | "shapes";

type Props = {
  mode: LibraryMode;
  onModeChange: (mode: LibraryMode) => void;
  query: string;
  onQueryChange: (value: string) => void;
  onPickSticker: (src: string) => void;
  onPickShape: (kind: ShapeKind) => void;
};

export function StickerLibrary({ mode, onModeChange, query, onQueryChange, onPickSticker, onPickShape }: Props) {
  const { openMojiItems, giphyItems, loading, loadingMore, giphyHasMore, error, loadMoreGifs } = useStickerLibrary(query, mode);
  const [emojiVisibleCount, setEmojiVisibleCount] = useState(48);

  useEffect(() => {
    setEmojiVisibleCount(48);
  }, [mode, query]);

  const visibleOpenMoji = useMemo(() => openMojiItems.slice(0, emojiVisibleCount), [emojiVisibleCount, openMojiItems]);

  return (
    <section className="rounded-2xl border border-panel-border bg-panel p-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-purple" />
        <h2 className="text-sm font-semibold">Stickers & emojis</h2>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          { key: "emoji" as const, label: "Emojis", icon: SmilePlus },
          { key: "gifs" as const, label: "GIFs", icon: Film },
          { key: "shapes" as const, label: "Formes", icon: Shapes },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onModeChange(key)}
            className={`inline-flex items-center justify-center gap-1 rounded-xl border px-2 py-2 text-xs font-medium ${
              mode === key ? "border-purple bg-purple-soft text-purple" : "border-panel-border bg-secondary hover:bg-panel"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {mode !== "shapes" && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-panel-border bg-secondary px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={mode === "gifs" ? "Rechercher des GIFs" : "Rechercher des emojis"}
            autoComplete="off"
            className="w-full min-w-0 bg-transparent text-sm outline-none"
          />
        </div>
      )}

      {mode === "shapes" && (
        <div className="mt-4 space-y-4">
          <div>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground">Formes</h3>
              <span className="text-[11px] text-muted-foreground">{SHAPE_LIST.length} items</span>
            </div>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {SHAPE_LIST.map((shape) => (
                <button
                  key={shape.kind}
                  title={shape.label}
                  onClick={() => onPickShape(shape.kind)}
                  className="aspect-square rounded-lg bg-secondary p-2 transition-transform hover:scale-105 hover:bg-purple-soft"
                >
                  <ShapeSVG el={{ id: "p", type: "shape", shape: shape.kind, fill: "#7c3aed", stroke: "transparent", strokeWidth: 0, x: 0, y: 0, w: 0, h: 0, rotation: 0, z: 0 }} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground">Bulles</h3>
              <span className="text-[11px] text-muted-foreground">{BUBBLE_LIST.length} items</span>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {BUBBLE_LIST.map((bubble) => (
                <button
                  key={bubble.kind}
                  title={bubble.label}
                  onClick={() => onPickShape(bubble.kind)}
                  className="aspect-square rounded-lg bg-secondary p-2 transition-transform hover:scale-105 hover:bg-purple-soft"
                >
                  <ShapeSVG el={{ id: "p", type: "shape", shape: bubble.kind, fill: "#ffffff", stroke: "#111111", strokeWidth: 3, x: 0, y: 0, w: 0, h: 0, rotation: 0, z: 0 }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {mode === "emoji" && (
        <div className="mt-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground">OpenMoji</h3>
            <span className="text-[11px] text-muted-foreground">
              {visibleOpenMoji.length} / {openMojiItems.length}
            </span>
          </div>
          <div className="mt-2 grid grid-cols-6 gap-2 sm:grid-cols-8 lg:grid-cols-6">
            {visibleOpenMoji.map((item) => (
              <button
                key={item.id}
                onClick={() => onPickSticker(item.src)}
                className="aspect-square overflow-hidden rounded-lg border border-panel-border bg-white/70 p-1 transition-transform hover:scale-105 hover:ring-2 hover:ring-purple"
                title={item.label}
              >
                <img src={item.src} alt={item.label} className="h-full w-full object-contain" draggable={false} />
              </button>
            ))}
          </div>
          {openMojiItems.length > emojiVisibleCount && (
            <button
              type="button"
              onClick={() => setEmojiVisibleCount((value) => Math.min(value + 48, openMojiItems.length))}
              className="mt-3 w-full rounded-xl border border-panel-border bg-secondary px-3 py-2 text-sm font-medium hover:bg-panel"
            >
              Charger plus d’emojis
            </button>
          )}
        </div>
      )}

      {mode === "gifs" && (
        <div className="mt-5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground">GIPHY</h3>
            <span className="text-[11px] text-muted-foreground">{loading ? "Chargement..." : `${giphyItems.length} résultats`}</span>
          </div>
          {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
            {giphyItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onPickSticker(item.src)}
                className="overflow-hidden rounded-lg border border-panel-border bg-secondary transition-transform hover:scale-[1.02] hover:ring-2 hover:ring-purple"
                title={item.title}
              >
                <img src={item.preview} alt={item.title} className="h-28 w-full object-contain p-1 sm:h-24" loading="lazy" />
              </button>
            ))}
            {!loading && giphyItems.length === 0 && <p className="col-span-full text-xs text-muted-foreground">Aucun résultat.</p>}
          </div>
          <button
            type="button"
            onClick={() => void loadMoreGifs()}
            disabled={loading || loadingMore || !giphyHasMore}
            className="mt-3 w-full rounded-xl border border-panel-border bg-secondary px-3 py-2 text-sm font-medium hover:bg-panel disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingMore ? "Chargement..." : giphyHasMore ? "Charger plus de GIFs" : "Plus de GIFs"}
          </button>
        </div>
      )}
    </section>
  );
}
