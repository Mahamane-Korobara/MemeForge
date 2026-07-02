import { Download, Film, Loader2, RefreshCw } from "lucide-react";
import { GIF_COUNT_MAX, GIF_COUNT_MIN, type GifVariant, useGifMemeDirector } from "./use-gif-meme-director";
import type { DirectorTone } from "./use-meme-director";

const TONE_OPTIONS: Array<{ value: DirectorTone; label: string }> = [
  { value: "auto", label: "Auto (le plus drôle)" },
  { value: "relatable", label: "Relatable" },
  { value: "sarcastique", label: "Sarcastique" },
  { value: "absurde", label: "Absurde" },
  { value: "dev", label: "Geek / Dev" },
  { value: "wholesome", label: "Wholesome" },
];

function CaptionLayer({ text, position }: { text: string; position: "top" | "bottom" }) {
  if (!text.trim()) return null;
  return (
    <div
      className={`absolute inset-x-0 flex justify-center px-2 text-center ${position === "top" ? "top-[3%]" : "bottom-[3%]"}`}
      style={{
        fontFamily: 'Impact, Anton, "Arial Narrow", sans-serif',
        fontWeight: 700,
        color: "#ffffff",
        WebkitTextStroke: "0.5cqw #000000",
        paintOrder: "stroke fill",
        fontSize: "9cqw",
        lineHeight: 1,
      }}
    >
      {text.toUpperCase()}
    </div>
  );
}

function GifCard({
  variant,
  regenerating,
  downloading,
  onRegenerate,
  onDownload,
}: {
  variant: GifVariant;
  regenerating: boolean;
  downloading: boolean;
  onRegenerate: () => void;
  onDownload: () => void;
}) {
  return (
    <div className="rounded-xl border border-panel-border bg-panel p-2">
      <div className="relative w-full overflow-hidden rounded-lg bg-black" style={{ containerType: "inline-size" }}>
        <img src={variant.gifUrl} alt={variant.query} className="block w-full" draggable={false} crossOrigin="anonymous" />
        <CaptionLayer text={variant.topText} position="top" />
        <CaptionLayer text={variant.bottomText} position="bottom" />
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="truncate text-[11px] text-muted-foreground">{variant.query}</span>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onRegenerate}
            disabled={regenerating || downloading}
            title="Régénérer"
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-panel-border hover:bg-secondary disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${regenerating ? "animate-spin" : ""}`} />
          </button>
          <button
            type="button"
            onClick={onDownload}
            disabled={downloading || regenerating}
            className="inline-flex items-center gap-1 rounded-lg bg-purple px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            {downloading ? "Création..." : "GIF"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function GifMemeDirector() {
  const { state, actions } = useGifMemeDirector();

  return (
    <section className="rounded-2xl border border-panel-border bg-secondary/40 p-3">
      <div className="flex items-center gap-2">
        <Film className="h-4 w-4 text-purple" />
        <div>
          <h3 className="text-sm font-semibold">Mème GIF animé</h3>
          <p className="text-[11px] text-muted-foreground">Situation → l'IA écrit la vanne et légende un GIF animé à télécharger.</p>
        </div>
      </div>

      <textarea
        value={state.situation}
        onChange={(event) => actions.setSituation(event.target.value)}
        className="mt-3 min-h-16 w-full rounded-lg border border-panel-border bg-panel px-3 py-2 text-sm outline-none"
        placeholder="Ex : le lundi matin quand le réveil sonne"
      />

      <div className="mt-2 grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1 text-[11px] font-medium text-muted-foreground">
          Ton
          <select
            value={state.tone}
            onChange={(event) => actions.setTone(event.target.value as DirectorTone)}
            className="rounded-lg border border-panel-border bg-panel px-2 py-1.5 text-sm text-foreground outline-none"
          >
            {TONE_OPTIONS.map((tone) => (
              <option key={tone.value} value={tone.value}>
                {tone.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[11px] font-medium text-muted-foreground">
          <span className="flex items-center justify-between">
            Propositions <span className="rounded-full bg-secondary px-2 text-foreground">{state.count}</span>
          </span>
          <input
            type="range"
            min={GIF_COUNT_MIN}
            max={GIF_COUNT_MAX}
            value={state.count}
            onChange={(event) => actions.setCount(Number(event.target.value))}
            className="mt-2 w-full accent-purple"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={() => void actions.generate()}
        disabled={state.loading}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-purple px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
      >
        {state.loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Film className="h-3.5 w-3.5" />}
        {state.loading ? "Recherche des GIF..." : "Générer des GIF"}
      </button>

      {!state.hasKeys && <p className="mt-2 text-[11px] text-amber-500">Clés requises : VITE_GEMINI_API_KEY et VITE_GIPHY_API_KEY dans .env.local.</p>}
      {!state.supported && <p className="mt-2 text-[11px] text-amber-500">Ton navigateur ne peut pas encoder de GIF (ImageDecoder). La prévisualisation marche, pas le téléchargement.</p>}
      {state.error && <p className="mt-2 text-xs text-destructive">{state.error}</p>}
      {state.notice && <p className="mt-2 text-xs text-amber-500">{state.notice}</p>}

      <div className="mt-3 grid grid-cols-1 gap-3">
        {state.variants.map((variant) => (
          <GifCard
            key={variant.id}
            variant={variant}
            regenerating={state.regeneratingId === variant.id}
            downloading={state.downloadingId === variant.id}
            onRegenerate={() => void actions.regenerate(variant.id)}
            onDownload={() => void actions.download(variant)}
          />
        ))}
      </div>
    </section>
  );
}
