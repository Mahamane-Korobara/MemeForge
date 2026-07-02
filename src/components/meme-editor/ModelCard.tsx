import { Loader2, RefreshCw } from "lucide-react";
import type { MemeModel } from "./model-library-data";

type Props = {
  model: MemeModel;
  onSelect: (model: MemeModel) => void;
  onRegenerate?: (model: MemeModel) => void;
  regenerating?: boolean;
};

export function ModelCard({ model, onSelect, onRegenerate, regenerating = false }: Props) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-panel-border bg-panel transition-transform hover:-translate-y-0.5 hover:border-purple/60 hover:shadow-md">
      <button type="button" onClick={() => onSelect(model)} className="block w-full text-left" disabled={regenerating}>
        <div className="relative">
          <img src={model.preview} alt={model.name} className="aspect-[16/10] w-full object-cover" draggable={false} />
          <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
            <div className="min-w-0 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-white">
              {model.category}
            </div>
            <div className="rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-medium text-white">
              {model.width} × {model.height}
            </div>
          </div>
          {regenerating && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            </div>
          )}
        </div>
        <div className="space-y-1 p-3">
          <h4 className="truncate text-sm font-semibold">{model.headline || model.name}</h4>
          <p className="line-clamp-2 text-[11px] text-muted-foreground">{model.subtitle}</p>
        </div>
      </button>

      {onRegenerate && (
        <button
          type="button"
          onClick={() => onRegenerate(model)}
          disabled={regenerating}
          title="Régénérer ce modèle"
          aria-label="Régénérer ce modèle"
          className="absolute bottom-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-purple text-primary-foreground opacity-0 shadow transition-opacity hover:opacity-100 focus:opacity-100 group-hover:opacity-100 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${regenerating ? "animate-spin" : ""}`} />
        </button>
      )}
    </div>
  );
}
