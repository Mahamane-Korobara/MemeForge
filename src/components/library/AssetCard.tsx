import { ArrowUpRight, Download, Eye, Trash2 } from "lucide-react";
import type { UserAsset } from "@/types/assets";

type Props = {
  asset: UserAsset;
  onPreview: (asset: UserAsset) => void;
  onDownload: (id: string) => void;
  onDelete: (id: string) => void;
  onReuse: (id: string) => void;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AssetCard({ asset, onPreview, onDownload, onDelete, onReuse }: Props) {
  return (
    <article className="overflow-hidden rounded-2xl border border-panel-border bg-panel">
      <button type="button" onClick={() => onPreview(asset)} className="block aspect-video w-full bg-secondary">
        <img src={asset.thumbnail} alt={asset.name} className="h-full w-full object-cover" />
      </button>
      <div className="space-y-3 p-3">
        <div>
          <h3 className="truncate text-sm font-semibold">{asset.name}</h3>
          <p className="text-[11px] uppercase text-muted-foreground">
            {asset.type}
            {asset.animation ? ` • ${asset.animation}` : ""}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">{formatDate(asset.createdAt)}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onPreview(asset)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-panel-border bg-secondary px-3 py-2 text-xs hover:bg-panel"
          >
            <Eye className="h-3.5 w-3.5" />
            Aperçu
          </button>
          <button
            type="button"
            onClick={() => onDownload(asset.id)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-panel-border bg-secondary px-3 py-2 text-xs hover:bg-panel"
          >
            <Download className="h-3.5 w-3.5" />
            Télécharger
          </button>
          <button
            type="button"
            onClick={() => onReuse(asset.id)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-panel-border bg-secondary px-3 py-2 text-xs hover:bg-panel"
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
            Réutiliser
          </button>
          <button
            type="button"
            onClick={() => onDelete(asset.id)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive hover:bg-destructive/20"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Supprimer
          </button>
        </div>
      </div>
    </article>
  );
}
