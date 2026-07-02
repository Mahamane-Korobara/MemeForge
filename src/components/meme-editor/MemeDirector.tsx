import { Loader2, RefreshCw, Sparkles, Wand2 } from "lucide-react";
import { DIRECTOR_COUNT_MAX, DIRECTOR_COUNT_MIN, type DirectorTone, type MemeVariant, useMemeDirector } from "./use-meme-director";
import { displayZoneText, type MemeFormat, type ZoneSize } from "./meme-formats";

type Props = {
  onApplyMeme: (format: MemeFormat, fills: Record<string, string>) => void;
};

const TONE_OPTIONS: Array<{ value: DirectorTone; label: string }> = [
  { value: "auto", label: "Auto (le plus drôle)" },
  { value: "relatable", label: "Relatable" },
  { value: "sarcastique", label: "Sarcastique" },
  { value: "absurde", label: "Absurde" },
  { value: "dev", label: "Geek / Dev" },
  { value: "wholesome", label: "Wholesome" },
];

const PREVIEW_FONT_CQW: Record<ZoneSize, number> = { sm: 5, md: 6.5, lg: 9 };

function VariantPreview({ variant }: { variant: MemeVariant }) {
  return (
    <div className="relative w-full overflow-hidden rounded-lg bg-black" style={{ containerType: "inline-size" }}>
      <img src={variant.format.imageUrl} alt={variant.format.name} className="block w-full" draggable={false} crossOrigin="anonymous" />
      {variant.format.zones.map((zone) => {
        const value = (variant.fills[zone.id] ?? "").trim();
        if (!value) return null;
        const isCaption = zone.style === "caption" || zone.style === "dark";
        return (
          <div
            key={zone.id}
            className="absolute flex items-center justify-center text-center leading-none"
            style={{
              left: `${zone.rect.x}%`,
              top: `${zone.rect.y}%`,
              width: `${zone.rect.w}%`,
              height: `${zone.rect.h}%`,
              fontSize: `${PREVIEW_FONT_CQW[zone.size ?? "md"]}cqw`,
              fontFamily: isCaption ? "Impact, Anton, sans-serif" : "Arial, sans-serif",
              fontWeight: 700,
              color: isCaption ? "#ffffff" : "#111111",
              WebkitTextStroke: isCaption ? "0.4cqw #000000" : "0.28cqw #ffffff",
              paintOrder: "stroke fill",
              wordBreak: "break-word",
            }}
          >
            {displayZoneText(zone, value)}
          </div>
        );
      })}
    </div>
  );
}

export function MemeDirector({ onApplyMeme }: Props) {
  const { state, actions } = useMemeDirector();

  return (
    <section className="rounded-2xl border border-purple/40 bg-purple/5 p-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-purple" />
        <div>
          <h3 className="text-sm font-semibold">Meme Director IA</h3>
          <p className="text-[11px] text-muted-foreground">Décris une situation → l'IA choisit le format culte et écrit la vanne.</p>
        </div>
      </div>

      <textarea
        value={state.situation}
        onChange={(event) => actions.setSituation(event.target.value)}
        className="mt-3 min-h-16 w-full rounded-lg border border-panel-border bg-panel px-3 py-2 text-sm outline-none"
        placeholder="Ex : quand je dis que je vais me coucher tôt mais je regarde une série jusqu'à 4h"
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
            min={DIRECTOR_COUNT_MIN}
            max={DIRECTOR_COUNT_MAX}
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
        {state.loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
        {state.loading ? "Création des mèmes..." : "Générer les mèmes"}
      </button>

      {!state.hasKey && <p className="mt-2 text-[11px] text-amber-500">Clé Gemini absente : ajoute VITE_GEMINI_API_KEY dans .env.local.</p>}
      {state.error && <p className="mt-2 text-xs text-destructive">{state.error}</p>}
      {state.notice && <p className="mt-2 text-xs text-amber-500">{state.notice}</p>}

      <div className="mt-3 grid grid-cols-1 gap-3">
        {state.variants.map((variant) => (
          <div key={variant.id} className="rounded-xl border border-panel-border bg-panel p-2">
            <VariantPreview variant={variant} />
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="truncate text-[11px] font-medium text-muted-foreground">{variant.format.name}</span>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => void actions.regenerate(variant.id)}
                  disabled={state.regeneratingId === variant.id}
                  title="Régénérer"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-panel-border hover:bg-secondary disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${state.regeneratingId === variant.id ? "animate-spin" : ""}`} />
                </button>
                <button
                  type="button"
                  onClick={() => onApplyMeme(variant.format, variant.fills)}
                  className="rounded-lg bg-purple px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
                >
                  Utiliser
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
