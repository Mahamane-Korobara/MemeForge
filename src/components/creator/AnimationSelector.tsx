import { EyeOff, MoveRight, RefreshCw, RotateCcw, Sparkles, Square, ZoomIn } from "lucide-react";
import type { AnimationChoice } from "@/types/assets";

type Props = {
  value: AnimationChoice;
  onChange: (value: AnimationChoice) => void;
};

const PRESETS: Array<{ value: AnimationChoice; label: string; icon: typeof Sparkles }> = [
  { value: "none", label: "Statique", icon: Square },
  { value: "bounce", label: "Bounce", icon: Sparkles },
  { value: "shake", label: "Shake", icon: RefreshCw },
  { value: "zoom", label: "Zoom", icon: ZoomIn },
  { value: "rotation", label: "Rotation", icon: RotateCcw },
  { value: "fade", label: "Fade", icon: EyeOff },
  { value: "slide", label: "Slide", icon: MoveRight },
];

export function AnimationSelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {PRESETS.map(({ value: preset, label, icon: Icon }) => (
        <button
          key={preset}
          type="button"
          onClick={() => onChange(preset)}
          className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
            value === preset ? "border-purple bg-purple-soft text-purple" : "border-panel-border bg-secondary hover:bg-panel"
          }`}
        >
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
