import type { TextEl } from "./types";

type Props = {
  el: TextEl;
  onChange: (patch: Partial<TextEl>) => void;
  onCommit: () => void;
};

function RangeField({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1 rounded-xl border border-panel-border bg-secondary px-2 py-1.5 text-[11px]">
      <span className="flex items-center justify-between gap-2">
        <span>{label}</span>
        <span className="text-muted-foreground">{value.toFixed(step && step < 1 ? 2 : 0)}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

export function TextAdvancedControls({ el, onChange, onCommit }: Props) {
  return (
    <details className="w-full rounded-xl border border-panel-border bg-panel px-2 py-2">
      <summary className="cursor-pointer list-none text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        Avancé
      </summary>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <RangeField
          label="Contour"
          value={el.outlineWidth}
          min={0}
          max={12}
          onChange={(value) => {
            onChange({ outlineWidth: value });
            onCommit();
          }}
        />
        <label className="flex items-center justify-between gap-2 rounded-xl border border-panel-border bg-secondary px-2 py-1.5 text-[11px]">
          <span>Couleur contour</span>
          <input
            type="color"
            value={el.outlineColor}
            onChange={(e) => {
              onChange({ outlineColor: e.target.value });
              onCommit();
            }}
            className="h-7 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
          />
        </label>
        <RangeField
          label="Espacement"
          value={el.letterSpacing}
          min={-4}
          max={24}
          step={0.5}
          onChange={(value) => {
            onChange({ letterSpacing: value });
            onCommit();
          }}
        />
        <RangeField
          label="Interligne"
          value={el.lineHeight}
          min={0.8}
          max={2.4}
          step={0.05}
          onChange={(value) => {
            onChange({ lineHeight: value });
            onCommit();
          }}
        />
      </div>
    </details>
  );
}
