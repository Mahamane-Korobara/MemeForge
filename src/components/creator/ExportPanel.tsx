import type { CreatorExportFormat } from "@/types/assets";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
        <Select value={format} onValueChange={(value) => onFormatChange(value as CreatorExportFormat)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="webp">WebP animé</SelectItem>
            <SelectItem value="gif">GIF</SelectItem>
          </SelectContent>
        </Select>
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
