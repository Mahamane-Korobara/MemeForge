import { Loader2, RefreshCw, Search, Sparkles, Wand2 } from "lucide-react";
import { useMemo } from "react";
import { useModelLibrary } from "./use-model-library";
import type { MemeModel } from "./model-library-data";
import { ModelCard } from "./ModelCard";

type Props = {
  onApplyModel: (model: MemeModel) => void;
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

export function ModelLibrary({ onApplyModel }: Props) {
  const { state, actions } = useModelLibrary();

  const aiSummary = useMemo(() => {
    if (state.aiLoading) return "Génération en cours...";
    if (state.aiModels.length) return `${state.aiModels.length} modèle${state.aiModels.length > 1 ? "s" : ""} IA prêt${state.aiModels.length > 1 ? "s" : ""}`;
    return "Les modèles IA générés apparaîtront ici.";
  }, [state.aiLoading, state.aiModels.length]);

  return (
    <section className="rounded-2xl border border-panel-border bg-secondary/40 p-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-purple" />
        <div>
          <h3 className="text-sm font-semibold">Modèles</h3>
          <p className="text-[11px] text-muted-foreground">{state.loadingReal ? "Chargement des templates..." : `${state.realModels.length} modèles réels disponibles`}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-xl border border-panel-border bg-panel px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={state.query}
          onChange={(event) => actions.setQuery(event.target.value)}
          className="w-full min-w-0 bg-transparent text-sm outline-none"
          placeholder="Rechercher un modèle"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void actions.generateAiModels()}
          className="inline-flex items-center gap-2 rounded-xl border border-panel-border bg-panel px-3 py-2 text-xs font-medium hover:bg-secondary"
        >
          {state.aiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
          Générer 5 modèles IA
        </button>
        <button
          type="button"
          onClick={() => void actions.refresh()}
          className="inline-flex items-center gap-2 rounded-xl border border-panel-border bg-panel px-3 py-2 text-xs font-medium hover:bg-secondary"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Rafraîchir
        </button>
      </div>

      <div className="mt-3 rounded-xl border border-panel-border bg-panel p-3">
        <label className="text-xs font-semibold uppercase text-muted-foreground">Prompt IA</label>
        <textarea
          value={state.aiPrompt}
          onChange={(event) => actions.setAiPrompt(event.target.value)}
          className="mt-2 min-h-20 w-full rounded-lg border border-panel-border bg-secondary px-3 py-2 text-sm outline-none"
          placeholder="Décris le type de mème que tu veux"
        />
        <button
          type="button"
          onClick={() => void actions.generateAiModels()}
          className="mt-2 inline-flex items-center gap-2 rounded-xl bg-purple px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90"
        >
          <Wand2 className="h-3.5 w-3.5" />
          Générer depuis le prompt
        </button>
        <p className="mt-2 text-[11px] text-muted-foreground">{aiSummary}</p>
      </div>

      <div className="mt-4">
        <SectionTitle title="Modèles IA" count={state.aiModels.length} hint="Les propositions générées en français apparaissent ici après le clic sur générer." />
        {state.aiError && <p className="mt-2 text-xs text-destructive">{state.aiError}</p>}
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {state.aiModels.map((model) => (
            <ModelCard key={model.id} model={model} onSelect={onApplyModel} />
          ))}
        </div>
        {!state.aiModels.length && !state.aiLoading && (
          <p className="mt-2 text-xs text-muted-foreground">Décris l'ambiance du mème à générer pour obtenir 5 propositions.</p>
        )}
      </div>

      <div className="mt-5">
        <SectionTitle title="Templates réels" count={state.realModels.length} hint="Les vrais modèles récupérés dans l'application." />
        {state.realError && <p className="mt-2 text-xs text-destructive">{state.realError}</p>}
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {state.realModels.map((model) => (
            <ModelCard key={model.id} model={model} onSelect={onApplyModel} />
          ))}
        </div>
        {!state.loadingReal && !state.realModels.length && <p className="mt-2 text-xs text-muted-foreground">Aucun template disponible pour le moment.</p>}
      </div>
    </section>
  );
}
