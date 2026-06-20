import { ChevronDown, Crop, FileText, Home, Lock, PanelLeft, Redo2, Share2, Undo2 } from "lucide-react";
import type { Format } from "./types";
import { FORMATS } from "./constants";

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
            <div className="relative">
              <button className="inline-flex max-w-[15rem] items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1.5 text-xs font-medium hover:bg-purple-soft">
                <Crop className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{format.label}</span>
                <span className="hidden text-muted-foreground xl:inline">({format.w}×{format.h})</span>
                <ChevronDown className="h-3 w-3 shrink-0" />
              </button>
              <select
                aria-label="Format"
                value={format.id}
                onChange={(e) => onFormatChange(FORMATS.find((item) => item.id === e.target.value) ?? FORMATS[0])}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              >
                {FORMATS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
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
          <select
            value={zoom}
            onChange={(e) => onZoomChange(e.target.value === "fit" ? "fit" : Number(e.target.value))}
            className="rounded bg-transparent text-sm outline-none ring-1 ring-transparent hover:bg-secondary focus:ring-panel-border"
          >
            <option value="fit">Adapter</option>
            {[25, 50, 75, 100, 125, 150, 200].map((value) => (
              <option key={value} value={value}>
                {value}%
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
