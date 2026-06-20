import type { MemeModel } from "./model-library-data";

type Props = {
  model: MemeModel;
  onSelect: (model: MemeModel) => void;
};

export function ModelCard({ model, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={() => onSelect(model)}
      className="overflow-hidden rounded-xl border border-panel-border bg-panel text-left transition-transform hover:-translate-y-0.5 hover:border-purple/60 hover:shadow-md"
    >
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
      </div>
      <div className="space-y-1 p-3">
        <h4 className="truncate text-sm font-semibold">{model.headline || model.name}</h4>
        <p className="line-clamp-2 text-[11px] text-muted-foreground">{model.subtitle}</p>
      </div>
    </button>
  );
}
