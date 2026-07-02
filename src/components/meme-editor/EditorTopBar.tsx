import { Crop, FileText, Home, Lock, PanelLeft, Redo2, Share2, Undo2 } from "lucide-react";
import type { Format } from "./types";
import { FORMATS } from "./constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ZOOM_LEVELS = [25, 50, 75, 100, 125, 150, 200];

type Props = {
  docName: string;
  onDocNameChange: (value: string) => void;
  format: Format;
  onFormatChange: (format: Format) => void;
  zoom: number | "fit";
  onZoomChange: (zoom: number | "fit") => void;
  onUndo: () => void;
  onRedo: () => void;
  onExport: () => void;
  onShare: () => void;
  exportLabel: string;
  exportDisabled?: boolean;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  formatLocked?: boolean;
  formatLockLabel?: string;
};

export function EditorTopBar({
  docName,
  onDocNameChange,
  format,
  onFormatChange,
  zoom,
  onZoomChange,
  onUndo,
  onRedo,
  onExport,
  onShare,
  exportLabel,
  exportDisabled,
  sidebarOpen,
  onToggleSidebar,
  formatLocked,
  formatLockLabel,
}: Props) {
  return (
    <header className="border-b border-panel-border bg-panel px-3 py-2">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-foreground hover:bg-secondary"
            aria-pressed={sidebarOpen}
            aria-label={sidebarOpen ? "Fermer les outils" : "Ouvrir les outils"}
          >
            <PanelLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{sidebarOpen ? "Outils" : "Outils"}</span>
          </button>

          <button className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-foreground hover:bg-secondary">
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Accueil</span>
          </button>

          {formatLocked ? (
            <button
              type="button"
              className="inline-flex max-w-[15rem] items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1.5 text-xs font-medium text-muted-foreground"
              title={formatLockLabel}
            >
              <Lock className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{formatLockLabel ?? "Format verrouillé"}</span>
            </button>
          ) : (
            <Select value={format.id} onValueChange={(value) => onFormatChange(FORMATS.find((item) => item.id === value) ?? FORMATS[0])}>
              <SelectTrigger aria-label="Format" className="h-auto max-w-[15rem] gap-1.5 rounded-md border-transparent bg-secondary px-2.5 py-1.5 text-xs font-medium hover:bg-purple-soft">
                <Crop className="h-3.5 w-3.5 shrink-0" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FORMATS.map((item) => (
                  <SelectItem key={item.id} value={item.id} textValue={item.label}>
                    {item.label} <span className="text-muted-foreground">({item.w}×{item.h})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <button
            type="button"
            onClick={onExport}
            disabled={exportDisabled}
            className="rounded-md bg-purple px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {exportLabel}
          </button>
          <button
            type="button"
            onClick={onShare}
            className="inline-flex items-center gap-1.5 rounded-md border border-panel-border bg-secondary px-3 py-1.5 text-xs font-medium hover:bg-panel"
          >
            <Share2 className="h-3.5 w-3.5" />
            Partager
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-center">
          <FileText className="hidden h-4 w-4 text-muted-foreground sm:block" />
          <input
            value={docName}
            onChange={(e) => onDocNameChange(e.target.value)}
            className="w-full min-w-0 max-w-[18rem] rounded bg-transparent px-2 py-1 text-center text-sm font-medium outline-none ring-1 ring-transparent focus:bg-secondary focus:ring-panel-border sm:w-56"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <button onClick={onUndo} className="shrink-0 text-muted-foreground hover:text-foreground" aria-label="Annuler">
            <Undo2 className="h-4 w-4" />
          </button>
          <button onClick={onRedo} className="shrink-0 text-muted-foreground hover:text-foreground" aria-label="Rétablir">
            <Redo2 className="h-4 w-4" />
          </button>
          <Select
            value={zoom === "fit" ? "fit" : String(zoom)}
            onValueChange={(value) => onZoomChange(value === "fit" ? "fit" : Number(value))}
          >
            <SelectTrigger className="h-8 w-[6.5rem] border-transparent bg-transparent hover:bg-secondary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fit">Adapter</SelectItem>
              {ZOOM_LEVELS.map((value) => (
                <SelectItem key={value} value={String(value)}>
                  {value}%
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  );
}
