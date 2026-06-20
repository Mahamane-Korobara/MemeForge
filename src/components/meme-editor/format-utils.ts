import type { Element, Format } from "./types";

function scaleValue(value: number, from: number, to: number) {
  if (from === 0) return value;
  return (value * to) / from;
}

export function scaleElementsForFormat(elements: Element[], from: Format, to: Format): Element[] {
  if (from.id === to.id) return elements;

  return elements.map((element) => {
    const next: Element = {
      ...element,
      x: scaleValue(element.x, from.w, to.w),
      y: scaleValue(element.y, from.h, to.h),
      w: Math.max(1, scaleValue(element.w, from.w, to.w)),
      h: Math.max(1, scaleValue(element.h, from.h, to.h)),
    };

    if (element.type === "text") {
      return {
        ...next,
        fontSize: Math.max(8, scaleValue(element.fontSize, from.h, to.h)),
        bgPadding: scaleValue(element.bgPadding, from.h, to.h),
        bgRadius: scaleValue(element.bgRadius, from.h, to.h),
        letterSpacing: scaleValue(element.letterSpacing, from.w, to.w),
        outlineWidth: scaleValue(element.outlineWidth, from.w, to.w),
      };
    }

    return next;
  });
}
