import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { useUserAssets } from "@/hooks/use-user-assets";
import type { AssetType, UserAsset } from "@/types/assets";
import { AssetGrid } from "./AssetGrid";

const FILTERS: Array<{ value: "all" | AssetType; label: string }> = [
  { value: "all", label: "Tout" },
  { value: "sticker", label: "Stickers" },
  { value: "gif", label: "GIFs" },
  { value: "image", label: "Images détourées" },
];

export function MyCreations() {
  const { assets, loading, error, actions } = useUserAssets();
  const [filter, setFilter] = useState<"all" | AssetType>("all");
  const [query, setQuery] = useState("");
  const [previewAsset, setPreviewAsset] = useState<UserAsset | null>(null);

  const filteredAssets = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return assets.filter((asset) => {
      const matchesFilter = filter === "all" || asset.type === filter;
      const matchesQuery = !needle || asset.name.toLowerCase().includes(needle);
      return matchesFilter && matchesQuery;
    });
  }, [assets, filter, query]);

  return (
    <section className="rounded-2xl border border-panel-border bg-panel p-4">
      <div className="flex items-start gap-2">
        <SlidersHorizontal className="h-4 w-4 text-purple" />
        <div>
          <h2 className="text-base font-semibold">Mes créations</h2>
          <p className="text-xs text-muted-foreground">Tes stickers, GIFs et images détourées sont conservés localement.</p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 2xl:flex-row 2xl:items-center 2xl:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={`rounded-xl border px-3 py-2 text-sm transition-colors ${
                filter === item.value ? "border-purple bg-purple-soft text-purple" : "border-panel-border bg-secondary hover:bg-panel"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-panel-border bg-secondary px-3 py-2 2xl:w-96">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une création"
            className="w-full min-w-0 bg-transparent text-sm outline-none"
          />
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      <div className="mt-4">
        <AssetGrid
          assets={filteredAssets}
          onPreview={(asset) => setPreviewAsset(asset)}
          onDownload={actions.download}
          onDelete={actions.remove}
          onReuse={actions.reuse}
          emptyState={loading ? "Chargement..." : "Aucune création enregistrée pour le moment."}
        />
      </div>

      {previewAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-3xl rounded-2xl border border-panel-border bg-panel p-4 shadow-2xl">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-semibold">{previewAsset.name}</h3>
                <p className="text-xs text-muted-foreground">{previewAsset.type}</p>
              </div>
              <button type="button" onClick={() => setPreviewAsset(null)} className="rounded-lg border border-panel-border bg-secondary px-3 py-2 text-sm hover:bg-panel">
                Fermer
              </button>
            </div>
            <div className="mt-4 aspect-video overflow-hidden rounded-xl border border-panel-border bg-secondary">
              <img src={previewAsset.thumbnail} alt={previewAsset.name} className="h-full w-full object-contain" />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
