import { History, Image as ImageIcon, PaintBucket, Palette, SmilePlus, Type as TypeIcon, type LucideIcon } from "lucide-react";
import type { PanelKey } from "./types";

type RailItem = {
  key: PanelKey;
  label: string;
  icon: LucideIcon;
};

const ITEMS: RailItem[] = [
  { key: "library", label: "Bibliothèque", icon: SmilePlus },
  { key: "templates", label: "Modèles", icon: Palette },
  { key: "background", label: "Fond", icon: PaintBucket },
  { key: "history", label: "Historique", icon: History },
  { key: "uploads", label: "Imports", icon: ImageIcon },
  { key: "text", label: "Texte", icon: TypeIcon },
];

export function EditorRail({
  activePanel,
  onPanelChange,
}: {
  activePanel: PanelKey;
  onPanelChange: (panel: PanelKey) => void;
}) {
  return (
    <nav className="flex w-full gap-1 overflow-x-auto border-b border-panel-border bg-panel p-2 lg:w-14 lg:flex-col lg:border-b-0 lg:border-r">
      {ITEMS.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onPanelChange(key)}
          title={label}
          className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors ${
            activePanel === key ? "bg-purple-soft text-purple" : "text-sidebar-icon hover:bg-secondary"
          }`}
        >
          {activePanel === key && <span className="absolute -bottom-1 left-1/2 h-1 w-6 -translate-x-1/2 rounded-full bg-purple lg:-left-3 lg:bottom-auto lg:top-1/2 lg:h-6 lg:w-1 lg:-translate-y-1/2 lg:translate-x-0 lg:rounded-r" />}
          <Icon className="h-5 w-5" />
        </button>
      ))}
    </nav>
  );
}
