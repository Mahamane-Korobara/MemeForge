import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Copy,
  Droplet,
  Eraser,
  Image as ImageIcon,
  Loader2,
  Trash2,
  Underline,
} from "lucide-react";
import type { ReactNode } from "react";
import { FONTS } from "./constants";
import type { ShapeEl, TextEl } from "./types";
import { TextAdvancedControls } from "./TextAdvancedControls";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const FONT_SIZES = [12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 124, 160, 200];

type ToolbarProps = {
  onDuplicate: () => void;
  onDelete: () => void;
};

function ColorButton({
  title,
  value,
  fallback,
  onChange,
  children,
}: {
  title: string;
  value: string;
  fallback: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label
      className="relative flex h-8 cursor-pointer items-center gap-1 rounded-full border border-panel-border bg-panel px-2 text-xs font-medium hover:bg-secondary"
      title={title}
    >
      <span className="flex h-4 w-4 items-center justify-center rounded-full border border-panel-border" style={{ backgroundColor: value === "transparent" ? fallback : value }} />
      <span className="hidden sm:inline">{children}</span>
      <input
        type="color"
        value={value === "transparent" ? fallback : value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
      />
    </label>
  );
}

export function TextToolbar({
  el,
  onChange,
  onCommit,
  onDuplicate,
  onDelete,
}: ToolbarProps & {
  el: TextEl;
  onChange: (patch: Partial<TextEl>) => void;
  onCommit: () => void;
}) {
  return (
    <div className="absolute left-1/2 top-4 z-20 flex max-w-[calc(100vw-1rem)] -translate-x-1/2 flex-wrap items-center gap-1 rounded-2xl border border-panel-border bg-panel px-2 py-2 shadow-lg">
      <ColorButton
        title="Couleur du texte"
        value={el.color}
        fallback="#111111"
        onChange={(value) => {
          onChange({ color: value });
          onCommit();
        }}
      >
        Couleur
      </ColorButton>
      <ColorButton
        title="Fond du texte"
        value={el.bgColor}
        fallback="#ffffff"
        onChange={(value) => {
          onChange({ bgColor: value });
          onCommit();
        }}
      >
        Fond
      </ColorButton>
      <button
        onClick={() => {
          onChange({ bgColor: el.bgColor === "transparent" ? "#ffffff" : "transparent" });
          onCommit();
        }}
        className="h-8 rounded-full border border-panel-border px-2 text-[11px] hover:bg-secondary"
        title="Activer/désactiver le fond"
      >
        {el.bgColor === "transparent" ? "Fond off" : "Fond on"}
      </button>
      <button
        onClick={() => {
          onChange({ bold: !el.bold });
          onCommit();
        }}
        className={`flex h-8 w-8 items-center justify-center rounded-full ${el.bold ? "bg-purple-soft text-purple" : "hover:bg-secondary"}`}
      >
        <Bold className="h-4 w-4" />
      </button>
      <button
        onClick={() => {
          onChange({ underline: !el.underline });
          onCommit();
        }}
        className={`flex h-8 w-8 items-center justify-center rounded-full ${el.underline ? "bg-purple-soft text-purple" : "hover:bg-secondary"}`}
      >
        <Underline className="h-4 w-4" />
      </button>
      <div className="mx-1 h-5 w-px bg-panel-border" />
      <Select
        value={el.fontFamily}
        onValueChange={(value) => {
          onChange({ fontFamily: value });
          onCommit();
        }}
      >
        <SelectTrigger className="h-8 w-32 border-transparent bg-transparent hover:bg-secondary">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FONTS.map((font) => (
            <SelectItem key={font} value={font}>
              {font}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={String(el.fontSize)}
        onValueChange={(value) => {
          onChange({ fontSize: Number(value) });
          onCommit();
        }}
      >
        <SelectTrigger className="h-8 w-[4.5rem] border-transparent bg-transparent hover:bg-secondary">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FONT_SIZES.map((size) => (
            <SelectItem key={size} value={String(size)}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="mx-1 h-5 w-px bg-panel-border" />
      {(["left", "center", "right"] as const).map((align) => {
        const Icon = align === "left" ? AlignLeft : align === "center" ? AlignCenter : AlignRight;
        return (
          <button
            key={align}
            onClick={() => {
              onChange({ align });
              onCommit();
            }}
            className={`flex h-8 w-8 items-center justify-center rounded-full ${el.align === align ? "bg-purple-soft text-purple" : "hover:bg-secondary"}`}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
      <div className="mx-1 h-5 w-px bg-panel-border" />
      <button onClick={onDuplicate} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-secondary">
        <Copy className="h-4 w-4" />
      </button>
      <button onClick={onDelete} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-destructive/10 hover:text-destructive">
        <Trash2 className="h-4 w-4" />
      </button>
      <div className="w-full" />
      <TextAdvancedControls el={el} onChange={onChange} onCommit={onCommit} />
    </div>
  );
}

export function ShapeToolbar({
  el,
  onChange,
  onCommit,
  onDuplicate,
  onDelete,
}: ToolbarProps & {
  el: ShapeEl;
  onChange: (patch: Partial<ShapeEl>) => void;
  onCommit: () => void;
}) {
  return (
    <div className="absolute left-1/2 top-4 z-20 flex max-w-[calc(100vw-1rem)] -translate-x-1/2 flex-wrap items-center gap-1 rounded-2xl border border-panel-border bg-panel px-2 py-2 shadow-lg">
      <ColorButton
        title="Remplissage"
        value={el.fill}
        fallback="#a78bfa"
        onChange={(value) => {
          onChange({ fill: value });
          onCommit();
        }}
      >
        Fond
      </ColorButton>
      <button
        onClick={() => {
          onChange({ fill: el.fill === "transparent" ? "#a78bfa" : "transparent" });
          onCommit();
        }}
        className="h-8 rounded-full border border-panel-border px-2 text-[11px] hover:bg-secondary"
      >
        {el.fill === "transparent" ? "Vide" : "Plein"}
      </button>
      <ColorButton
        title="Bordure"
        value={el.stroke}
        fallback="#111111"
        onChange={(value) => {
          onChange({ stroke: value, strokeWidth: el.strokeWidth || 3 });
          onCommit();
        }}
      >
        Bord
      </ColorButton>
      <label className="flex h-8 items-center gap-2 rounded-full border border-panel-border bg-panel px-2 text-xs hover:bg-secondary">
        <Droplet className="h-4 w-4" />
        <input
          type="range"
          min={0}
          max={20}
          value={el.strokeWidth}
          onChange={(e) => onChange({ strokeWidth: Number(e.target.value) })}
          onMouseUp={onCommit}
          className="w-20"
          title="Épaisseur"
        />
      </label>
      <div className="mx-1 h-5 w-px bg-panel-border" />
      <button onClick={onDuplicate} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-secondary">
        <Copy className="h-4 w-4" />
      </button>
      <button onClick={onDelete} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-destructive/10 hover:text-destructive">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ImageToolbar({
  onRemoveBg,
  onSetAsPage,
  isRemoving,
  onDuplicate,
  onDelete,
}: ToolbarProps & {
  onRemoveBg: () => void;
  onSetAsPage: () => void;
  isRemoving: boolean;
}) {
  return (
    <div className="absolute left-1/2 top-4 z-20 flex max-w-[calc(100vw-1rem)] -translate-x-1/2 flex-wrap items-center gap-1 rounded-2xl border border-panel-border bg-panel px-2 py-2 shadow-lg">
      <button
        onClick={onRemoveBg}
        disabled={isRemoving}
        className="flex h-8 items-center gap-1 rounded-full border border-panel-border px-2 hover:bg-purple-soft disabled:opacity-50"
        title="Supprimer l'arrière-plan"
      >
        {isRemoving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eraser className="h-4 w-4" />}
        <span className="text-[11px]">{isRemoving ? "IA..." : "Sans fond"}</span>
      </button>
      <button onClick={onSetAsPage} className="flex h-8 items-center gap-1 rounded-full border border-panel-border px-2 hover:bg-secondary" title="Définir comme page">
        <ImageIcon className="h-4 w-4" />
        <span className="text-[11px]">Page</span>
      </button>
      <div className="mx-1 h-5 w-px bg-panel-border" />
      <button onClick={onDuplicate} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-secondary">
        <Copy className="h-4 w-4" />
      </button>
      <button onClick={onDelete} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-destructive/10 hover:text-destructive">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
