import type { CreatorExportFormat } from "@/types/assets";

type Props = {
  format: CreatorExportFormat;
  onFormatChange: (value: CreatorExportFormat) => void;
  onExport: () => void;
  busy?: boolean;
};

export function ExportPanel({ format, onFormatChange, onExport, busy }: Props) {
  return (
    <div className="rounded-2xl border border-panel-border bg-panel p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold">Export</h3>
          <p className="text-xs text-muted-foreground">Architecture prête pour WebP animé ou GIF.</p>
        </div>
        <select
          value={format}
          onChange={(e) => onFormatChange(e.target.value as CreatorExportFormat)}
          className="rounded-lg border border-panel-border bg-secondary px-3 py-2 text-sm outline-none"
        >
          <option value="webp">WebP animé</option>
          <option value="gif">GIF</option>
        </select>
      </div>

      <button
        type="button"
        onClick={onExport}
        disabled={busy}
        className="mt-4 w-full rounded-xl bg-purple px-4 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {busy ? "Préparation..." : "Préparer l'export"}
      </button>
    </div>
  );
}
