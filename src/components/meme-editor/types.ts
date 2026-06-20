export type ElementBase = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
  z: number;
};

export type TextEl = ElementBase & {
  type: "text";
  text: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  bold: boolean;
  underline: boolean;
  align: "left" | "center" | "right";
  bgColor: string;
  bgPadding: number;
  bgRadius: number;
  letterSpacing: number;
  lineHeight: number;
  outlineColor: string;
  outlineWidth: number;
};

export type ImageEl = ElementBase & {
  type: "image";
  src: string;
};

export type ShapeKind =
  | "rect"
  | "circle"
  | "triangle"
  | "star"
  | "heart"
  | "arrow"
  | "line"
  | "diamond"
  | "hexagon"
  | "pentagon"
  | "cross"
  | "burst"
  | "bubble-round"
  | "bubble-rect"
  | "bubble-cloud"
  | "bubble-spike"
  | "bubble-thought"
  | "bubble-oval"
  | "bubble-square"
  | "bubble-shout"
  | "bubble-double"
  | "bubble-tail-left"
  | "bubble-heart"
  | "bubble-scream";

export type ShapeEl = ElementBase & {
  type: "shape";
  shape: ShapeKind;
  fill: string;
  stroke: string;
  strokeWidth: number;
};

export type Element = TextEl | ImageEl | ShapeEl;

export type Format = {
  id: string;
  label: string;
  w: number;
  h: number;
};

export type PageMedia =
  | {
      type: "image";
      src: string;
    }
  | {
      type: "video";
      src: string;
    };

export type PanelKey = "library" | "shapes" | "uploads" | "text" | "templates" | "history" | "background";
