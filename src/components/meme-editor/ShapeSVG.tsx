import type { ShapeEl } from "./types";

export function ShapeSVG({ el }: { el: ShapeEl }) {
  const { fill, stroke, strokeWidth } = el;
  const common = {
    fill,
    stroke,
    strokeWidth,
    strokeLinejoin: "round" as const,
    strokeLinecap: "round" as const,
  };

  const inner = () => {
    switch (el.shape) {
      case "rect":
        return <rect x="2" y="2" width="96" height="96" rx="4" {...common} />;
      case "circle":
        return <circle cx="50" cy="50" r="48" {...common} />;
      case "triangle":
        return <polygon points="50,4 96,96 4,96" {...common} />;
      case "diamond":
        return <polygon points="50,4 96,50 50,96 4,50" {...common} />;
      case "pentagon":
        return <polygon points="50,4 96,38 78,96 22,96 4,38" {...common} />;
      case "hexagon":
        return <polygon points="25,8 75,8 96,50 75,92 25,92 4,50" {...common} />;
      case "star":
        return <polygon points="50,4 61,38 96,38 68,58 79,92 50,72 21,92 32,58 4,38 39,38" {...common} />;
      case "heart":
        return <path d="M50 88 C-10 50 10 8 50 32 C90 8 110 50 50 88 Z" {...common} />;
      case "arrow":
        return <polygon points="4,40 60,40 60,20 96,50 60,80 60,60 4,60" {...common} />;
      case "cross":
        return <polygon points="38,4 62,4 62,38 96,38 96,62 62,62 62,96 38,96 38,62 4,62 4,38 38,38" {...common} />;
      case "burst":
        return <polygon points="50,2 58,22 78,12 72,34 96,32 78,48 98,62 76,62 86,84 64,76 60,98 50,80 40,98 36,76 14,84 24,62 2,62 22,48 4,32 28,34 22,12 42,22" {...common} />;
      case "line":
        return <line x1="2" y1="50" x2="98" y2="50" {...common} strokeWidth={Math.max(strokeWidth, 6)} />;
      case "bubble-round":
        return <circle cx="50" cy="45" r="44" {...common} />;
      case "bubble-oval":
        return <ellipse cx="50" cy="45" rx="48" ry="35" {...common} />;
      case "bubble-rect":
        return <rect x="2" y="6" width="96" height="74" rx="36" {...common} />;
      case "bubble-square":
        return <rect x="2" y="6" width="96" height="74" rx="8" {...common} />;
      case "bubble-cloud":
        return <path d="M20 60 C5 60 5 38 20 38 C18 22 42 18 46 32 C50 18 75 22 72 38 C90 36 92 60 75 60 Z" {...common} />;
      case "bubble-thought":
        return (
          <>
            <ellipse cx="50" cy="40" rx="46" ry="30" {...common} />
            <circle cx="30" cy="80" r="6" {...common} />
            <circle cx="20" cy="92" r="3" {...common} />
          </>
        );
      case "bubble-spike":
        return <polygon points="50,2 60,12 72,4 75,18 90,14 86,28 98,32 88,44 98,56 84,60 92,74 76,72 80,86 64,80 62,94 50,86 38,94 36,80 20,86 24,72 8,74 16,60 2,56 12,44 2,32 14,28 10,14 25,18 28,4 40,12" {...common} />;
      case "bubble-shout":
        return <polygon points="50,2 58,14 72,6 70,22 88,18 80,34 96,38 82,48 98,60 80,62 88,80 70,74 70,92 56,82 50,98 44,82 30,92 30,74 12,80 20,62 2,60 18,48 4,38 20,34 12,18 30,22 28,6 42,14" {...common} />;
      case "bubble-scream":
        return <polygon points="50,0 54,18 70,4 66,22 86,12 78,30 98,28 84,42 100,52 82,56 96,72 78,68 86,86 68,76 70,96 54,82 50,100 46,82 30,96 32,76 14,86 22,68 4,72 18,56 0,52 16,42 2,28 22,30 14,12 34,22 30,4 46,18" {...common} />;
      case "bubble-double":
        return (
          <>
            <ellipse cx="62" cy="38" rx="36" ry="26" {...common} />
            <ellipse cx="24" cy="72" rx="20" ry="14" {...common} />
          </>
        );
      case "bubble-tail-left":
        return <path d="M14 6 H94 Q98 6 98 14 V58 Q98 66 90 66 H32 L8 92 L16 66 H10 Q2 66 2 58 V14 Q2 6 14 6 Z" {...common} />;
      case "bubble-heart":
        return <path d="M50 92 C-10 54 14 12 50 36 C86 12 110 54 50 92 Z" {...common} />;
    }
  };

  const tail = () => {
    if (
      el.shape.startsWith("bubble") &&
      ![
        "bubble-tail-left",
        "bubble-cloud",
        "bubble-thought",
        "bubble-double",
        "bubble-heart",
        "bubble-spike",
        "bubble-shout",
        "bubble-scream",
      ].includes(el.shape)
    ) {
      return <polygon points="40,80 30,98 55,82" {...common} />;
    }
    return null;
  };

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="block h-full w-full">
      {inner()}
      {tail()}
    </svg>
  );
}
