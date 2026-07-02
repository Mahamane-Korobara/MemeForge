import { useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { Element, ImageEl, ShapeEl, TextEl } from "./types";
import { ShapeSVG } from "./ShapeSVG";

type Props = {
  el: Element;
  selected: boolean;
  scale: number;
  onSelect: () => void;
  onChange: (patch: Partial<Element>) => void;
  onCommit: () => void;
};

export function ElementView({ el, selected, scale, onSelect, onChange, onCommit }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(false);

  const startDrag = (e: ReactPointerEvent) => {
    e.stopPropagation();
    onSelect();
    if (editing) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);

    const startX = e.clientX;
    const startY = e.clientY;
    const originX = el.x;
    const originY = el.y;

    const move = (event: PointerEvent) => {
      onChange({
        x: originX + (event.clientX - startX) / scale,
        y: originY + (event.clientY - startY) / scale,
      });
    };

    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      onCommit();
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  const startResize = (corner: string) => (e: ReactPointerEvent) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const startX = e.clientX;
    const startY = e.clientY;
    const { x, y, w, h } = el;

    const move = (event: PointerEvent) => {
      const dx = (event.clientX - startX) / scale;
      const dy = (event.clientY - startY) / scale;
      let nextX = x;
      let nextY = y;
      let nextW = w;
      let nextH = h;

      if (corner.includes("e")) nextW = Math.max(20, w + dx);
      if (corner.includes("s")) nextH = Math.max(20, h + dy);
      if (corner.includes("w")) {
        nextW = Math.max(20, w - dx);
        nextX = x + (w - nextW);
      }
      if (corner.includes("n")) {
        nextH = Math.max(20, h - dy);
        nextY = y + (h - nextH);
      }

      if (el.type === "text") {
        const patch: Partial<TextEl> = {
          x: nextX,
          y: nextY,
          w: nextW,
          h: nextH,
          fontSize: Math.max(8, Math.round((el.fontSize * nextH) / h)),
        };
        onChange(patch);
        return;
      }
      const patch: Partial<Element> = { x: nextX, y: nextY, w: nextW, h: nextH };
      onChange(patch);
    };

    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      onCommit();
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  const startRotate = (e: ReactPointerEvent) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const move = (event: PointerEvent) => {
      const angle = (Math.atan2(event.clientY - centerY, event.clientX - centerX) * 180) / Math.PI + 90;
      onChange({ rotation: angle });
    };

    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      onCommit();
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  const borderWidth = 2 / scale;
  const handleSize = 12 / scale;
  const textStroke = el.type === "text" && el.outlineWidth > 0 ? `${el.outlineWidth}px ${el.outlineColor}` : undefined;
  const textShadow = el.type === "text" && el.outlineWidth > 0 ? `0 0 ${Math.max(1, el.outlineWidth)}px ${el.outlineColor}` : undefined;

  return (
    <div
      ref={ref}
      onPointerDown={startDrag}
      onDoubleClick={() => el.type === "text" && setEditing(true)}
      className="absolute select-none"
      style={{
        left: el.x,
        top: el.y,
        width: el.w,
        height: el.h,
        transform: `rotate(${el.rotation}deg)`,
        zIndex: el.z,
        cursor: editing ? "text" : "move",
        touchAction: editing ? "auto" : "none",
      }}
    >
      {el.type === "text" ? (
        editing ? (
          <textarea
            autoFocus
            value={el.text}
            onChange={(e) => onChange({ text: e.target.value })}
            onBlur={() => {
              setEditing(false);
              onCommit();
            }}
            className="h-full w-full resize-none border-none outline-none"
            style={{
              fontFamily: el.fontFamily,
              fontSize: el.fontSize,
              color: el.color,
              fontWeight: el.bold ? 700 : 400,
              textDecoration: el.underline ? "underline" : "none",
              letterSpacing: `${el.letterSpacing}px`,
              lineHeight: el.lineHeight,
              WebkitTextStroke: textStroke,
              textShadow,
              textAlign: el.align,
              background: el.bgColor === "transparent" ? "transparent" : el.bgColor,
              padding: el.bgPadding,
              borderRadius: el.bgRadius,
            }}
          />
        ) : (
          <div
            className="flex h-full w-full items-center"
            style={{
              fontFamily: el.fontFamily,
              fontSize: el.fontSize,
              color: el.color,
              fontWeight: el.bold ? 700 : 400,
              textDecoration: el.underline ? "underline" : "none",
              letterSpacing: `${el.letterSpacing}px`,
              lineHeight: el.lineHeight,
              WebkitTextStroke: textStroke,
              textShadow,
              justifyContent: el.align === "center" ? "center" : el.align === "right" ? "flex-end" : "flex-start",
              wordBreak: "break-word",
              whiteSpace: "pre-wrap",
              background: el.bgColor === "transparent" ? "transparent" : el.bgColor,
              padding: el.bgPadding,
              borderRadius: el.bgRadius,
            }}
          >
            {el.text}
          </div>
        )
      ) : el.type === "image" ? (
        <img src={(el as ImageEl).src} className="pointer-events-none h-full w-full object-contain" alt="" draggable={false} />
      ) : (
        <ShapeSVG el={el as ShapeEl} />
      )}

      {selected && !editing && (
        <>
          <div className="pointer-events-none absolute -inset-px rounded" style={{ border: `${borderWidth * 1.5}px solid var(--purple)` }} />
          {["nw", "ne", "sw", "se"].map((corner) => (
            <div
              key={corner}
              onPointerDown={startResize(corner)}
              className="absolute rounded-sm bg-white ring-1 ring-purple"
              style={{
                width: handleSize,
                height: handleSize,
                left: corner.includes("w") ? -handleSize / 2 : "auto",
                right: corner.includes("e") ? -handleSize / 2 : "auto",
                top: corner.includes("n") ? -handleSize / 2 : "auto",
                bottom: corner.includes("s") ? -handleSize / 2 : "auto",
                cursor: `${corner}-resize`,
                touchAction: "none",
              }}
            />
          ))}
          <div
            onPointerDown={startRotate}
            className="absolute left-1/2 -top-6 h-4 w-4 -translate-x-1/2 cursor-grab rounded-full bg-purple shadow"
            style={{ touchAction: "none" }}
          />
        </>
      )}
    </div>
  );
}
