import { RefreshCw, Search, Sparkles } from "lucide-react";
import { useModelLibrary } from "./use-model-library";
import type { MemeModel } from "./model-library-data";
import type { MemeFormat } from "./meme-formats";
import { ModelCard } from "./ModelCard";
import { MemeDirector } from "./MemeDirector";
import { GifMemeDirector } from "./GifMemeDirector";

type Props = {
  onApplyModel: (model: MemeModel) => void;
  onApplyMeme: (format: MemeFormat, fills: Record<string, string>) => void;
};

function SectionTitle({ title, count, hint }: { title: string; count?: number; hint?: string }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </div>
      {typeof count === "number" && <span className="rounded-full bg-secondary px-2 py-1 text-[11px] text-muted-foreground">{count}</span>}
    </div>
  );
}

export function ModelLibrary({ onApplyModel, onApplyMeme }: Props) {
  const { state, actions } = useModelLibrary();

  return (
    <div className="space-y-4">
      <MemeDirector onApplyMeme={onApplyMeme} />
      <GifMemeDirector />

      <section className="rounded-2xl border border-panel-border bg-secondary/40 p-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple" />
          <div>
            <h3 className="text-sm font-semibold">Templates</h3>
            <p className="text-[11px] text-muted-foreground">
              {state.loadingReal ? "Chargement des templates..." : `${state.realModels.length} templates disponibles`}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-panel-border bg-panel px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={state.query}
              onChange={(event) => actions.setQuery(event.target.value)}
              className="w-full min-w-0 bg-transparent text-sm outline-none"
              placeholder="Rechercher un template"
            />
          </div>
          <button
            type="button"
            onClick={() => void actions.refresh()}
            title="Rafraîchir les templates"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-panel-border bg-panel hover:bg-secondary"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4">
          <SectionTitle title="Templates réels" count={state.realModels.length} hint="Choisis un template brut à personnaliser toi-même." />
          {state.realError && <p className="mt-2 text-xs text-destructive">{state.realError}</p>}
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {state.realModels.map((model) => (
              <ModelCard key={model.id} model={model} onSelect={onApplyModel} />
            ))}
          </div>
          {!state.loadingReal && !state.realModels.length && <p className="mt-2 text-xs text-muted-foreground">Aucun template disponible pour le moment.</p>}
        </div>
      </section>
    </div>
  );
}
