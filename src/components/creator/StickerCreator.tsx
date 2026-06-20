import { ImagePlus, Loader2, Upload, Wand2 } from "lucide-react";
import { useStickerCreator } from "@/hooks/use-sticker-creator";
import type { UserAsset } from "@/types/assets";
import { AnimationSelector } from "./AnimationSelector";
import { ExportPanel } from "./ExportPanel";

type Props = {
  onCreated?: (asset: UserAsset) => void;
};

export function StickerCreator({ onCreated }: Props) {
  const { state, preview, actions } = useStickerCreator();

  const handleCreate = async () => {
    const saved = await actions.createAsset();
    if (saved) onCreated?.(saved);
  };

  return (
    <section className="rounded-2xl border border-panel-border bg-panel p-4">
      <div className="flex items-center gap-2">
        <Wand2 className="h-4 w-4 text-purple" />
        <div>
          <h2 className="text-base font-semibold">Créer un sticker</h2>
          <p className="text-xs text-muted-foreground">Image simple, sticker détouré, ou base pour animation.</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-4">
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-panel-border bg-secondary px-4 py-8 text-sm hover:bg-panel">
            <Upload className="h-4 w-4" />
            <span>Importer une image</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => actions.setFile(e.target.files?.[0] ?? null)}
            />
          </label>

          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => actions.setBackgroundMode("keep")}
              className={`rounded-xl border px-3 py-2 text-sm ${
                state.backgroundMode === "keep" ? "border-purple bg-purple-soft text-purple" : "border-panel-border bg-secondary hover:bg-panel"
              }`}
            >
              Garder le fond
            </button>
            <button
              type="button"
              onClick={() => actions.setBackgroundMode("remove")}
              className={`rounded-xl border px-3 py-2 text-sm ${
                state.backgroundMode === "remove" ? "border-purple bg-purple-soft text-purple" : "border-panel-border bg-secondary hover:bg-panel"
              }`}
            >
              Supprimer le fond
            </button>
          </div>

          <input
            value={state.name}
            onChange={(e) => actions.setName(e.target.value)}
            className="w-full rounded-xl border border-panel-border bg-secondary px-3 py-2 text-sm outline-none"
            placeholder="Nom du sticker"
          />

          <AnimationSelector value={state.animation} onChange={actions.setAnimation} />
          <ExportPanel format={state.exportFormat} onFormatChange={actions.setExportFormat} onExport={handleCreate} busy={state.isSaving} />

          <button
            type="button"
            onClick={handleCreate}
            disabled={state.isSaving || !state.file}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-purple px-4 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {state.isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            <span>{state.isSaving ? "Enregistrement..." : "Sauvegarder dans ma bibliothèque"}</span>
          </button>

          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <p className="text-xs text-muted-foreground">{state.status}</p>
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl border border-panel-border bg-secondary/50 p-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground">Aperçu</h3>
              <button type="button" onClick={() => actions.clearError()} className="text-xs text-muted-foreground hover:text-foreground">
                Réinitialiser
              </button>
            </div>
            <div className="mt-3 aspect-square overflow-hidden rounded-xl border border-panel-border bg-white">
              {preview ? (
                <img src={preview} alt="Aperçu du sticker" className="h-full w-full object-contain" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Importe une image pour commencer</div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-panel-border bg-secondary/50 p-3 text-xs text-muted-foreground">
            <p>La suppression du fond est branchée sur l’API image déjà prévue dans le projet.</p>
            <p className="mt-2">L’export animé est préparé côté interface. Le rendu WebP/GIF viendra ensuite sans changer cette structure.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
