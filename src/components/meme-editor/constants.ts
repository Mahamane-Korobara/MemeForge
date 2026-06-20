import type { Format, ShapeKind } from "./types";

export const FONTS = [
  "Impact",
  "Comic Sans MS",
  "Arial",
  "Inter",
  "Georgia",
  "Courier New",
  "Bebas Neue",
  "Anton",
];

export const FORMATS: Format[] = [
  { id: "square", label: "Carré 1:1", w: 1080, h: 1080 },
  { id: "landscape", label: "Paysage 16:9", w: 1920, h: 1080 },
  { id: "banner", label: "Bannière 4:1", w: 1600, h: 400 },
  { id: "portrait", label: "Portrait 4:5", w: 1080, h: 1350 },
  { id: "story", label: "Story 9:16", w: 1080, h: 1920 },
  { id: "photo", label: "Photo 4:3", w: 1024, h: 768 },
  { id: "fb", label: "Facebook 1200×630", w: 1200, h: 630 },
  { id: "meme", label: "Mème classique", w: 720, h: 540 },
];

export const SHAPE_LIST: { kind: ShapeKind; label: string }[] = [
  { kind: "rect", label: "Rectangle" },
  { kind: "circle", label: "Cercle" },
  { kind: "triangle", label: "Triangle" },
  { kind: "diamond", label: "Losange" },
  { kind: "pentagon", label: "Pentagone" },
  { kind: "hexagon", label: "Hexagone" },
  { kind: "star", label: "Étoile" },
  { kind: "heart", label: "Cœur" },
  { kind: "arrow", label: "Flèche" },
  { kind: "cross", label: "Croix" },
  { kind: "burst", label: "Explosion" },
  { kind: "line", label: "Trait" },
];

export const BUBBLE_LIST: { kind: ShapeKind; label: string }[] = [
  { kind: "bubble-round", label: "Bulle ronde" },
  { kind: "bubble-oval", label: "Bulle ovale" },
  { kind: "bubble-rect", label: "Bulle rect." },
  { kind: "bubble-square", label: "Bulle carrée" },
  { kind: "bubble-cloud", label: "Bulle nuage" },
  { kind: "bubble-thought", label: "Pensée" },
  { kind: "bubble-spike", label: "Pic" },
  { kind: "bubble-shout", label: "Cri" },
  { kind: "bubble-scream", label: "Hurlement" },
  { kind: "bubble-double", label: "Double" },
  { kind: "bubble-tail-left", label: "Queue gauche" },
  { kind: "bubble-heart", label: "Bulle cœur" },
];

export function nid() {
  return Math.random().toString(36).slice(2, 9);
}
