import type { ReactNode } from "react";
import type { UserAsset } from "@/types/assets";
import { AssetCard } from "./AssetCard";

type Props = {
  assets: UserAsset[];
  onPreview: (asset: UserAsset) => void;
  onDownload: (id: string) => void;
  onDelete: (id: string) => void;
  onReuse: (id: string) => void;
  emptyState?: ReactNode;
};

export function AssetGrid({ assets, onPreview, onDownload, onDelete, onReuse, emptyState }: Props) {
  if (!assets.length) {
    return <div className="rounded-2xl border border-dashed border-panel-border bg-panel p-6 text-sm text-muted-foreground">{emptyState ?? "Aucune création enregistrée."}</div>;
  }

  return (
    <div className="grid gap-3">
      {assets.map((asset) => (
        <AssetCard
          key={asset.id}
          asset={asset}
          onPreview={onPreview}
          onDownload={onDownload}
          onDelete={onDelete}
          onReuse={onReuse}
        />
      ))}
    </div>
  );
}
