import { MyCreations } from "@/components/library/MyCreations";
import { StickerCreator } from "@/components/creator/StickerCreator";
import { ArrowLeft } from "lucide-react";

export function CreatorPage() {
  return (
    <div className="min-h-dvh bg-app-bg p-4 sm:p-6 lg:p-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        <a
          href="/"
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-panel-border bg-panel px-3 py-2 text-sm font-medium hover:bg-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à l'éditeur
        </a>
        <StickerCreator />
        <MyCreations />
      </div>
    </div>
  );
}
