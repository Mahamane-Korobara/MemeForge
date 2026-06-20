import { Copy, ExternalLink, Link2, Mail, MessageCircleMore, Share2, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  open: boolean;
  title: string;
  text: string;
  url: string;
  shareLinks: Record<"x" | "facebook" | "whatsapp" | "linkedin" | "email", string>;
  busy?: boolean;
  error?: string | null;
  onClose: () => void;
  onShareNative: () => Promise<void>;
  onCopyImageToClipboard: () => Promise<void>;
  onCopyLink: () => Promise<void>;
};

function ActionButton({
  href,
  onClick,
  icon: Icon,
  label,
  children,
}: {
  href?: string;
  onClick?: () => void;
  icon: LucideIcon;
  label: string;
  children: ReactNode;
}) {
  const className =
    "flex items-center gap-2 rounded-xl border border-panel-border bg-secondary px-3 py-2 text-sm font-medium hover:bg-panel";

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className} aria-label={label}>
        <Icon className="h-4 w-4" />
        {children}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className} aria-label={label}>
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}

export function ShareDialog({ open, title, text, url, shareLinks, busy, error, onClose, onShareNative, onCopyImageToClipboard, onCopyLink }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-panel-border bg-panel p-4 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Share2 className="h-4 w-4 text-purple" />
              <h2 className="text-base font-semibold">Partager le mème</h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Partage l'image du mème directement (pas de lien) via le presse-papiers ou le partage natif.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-secondary" aria-label="Fermer">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-panel-border bg-secondary/50 p-3">
          <p className="text-sm font-medium">{title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{text}</p>
          <p className="mt-2 truncate text-xs text-purple">{url}</p>
        </div>

        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => void onShareNative()}
            disabled={busy}
            className="flex items-center justify-center gap-2 rounded-xl bg-purple px-3 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            <Share2 className="h-4 w-4" />
            {busy ? "Préparation..." : "Partager"}
          </button>
          <button
            type="button"
            onClick={() => void onCopyImageToClipboard()}
            disabled={busy}
            className="flex items-center justify-center gap-2 rounded-xl border border-panel-border bg-secondary px-3 py-3 text-sm font-medium hover:bg-panel disabled:opacity-50"
          >
            <Copy className="h-4 w-4" />
            Copier l'image
          </button>
          <button
            type="button"
            onClick={() => void onCopyLink()}
            className="flex items-center justify-center gap-2 rounded-xl border border-panel-border bg-secondary px-3 py-3 text-sm font-medium hover:bg-panel"
          >
            <Link2 className="h-4 w-4" />
            Copier lien
          </button>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          <ActionButton href={shareLinks.x} icon={X} label="Partager sur X">
            X
          </ActionButton>
          <ActionButton href={shareLinks.facebook} icon={Link2} label="Partager sur Facebook">
            Facebook
          </ActionButton>
          <ActionButton href={shareLinks.whatsapp} icon={MessageCircleMore} label="Partager sur WhatsApp">
            WhatsApp
          </ActionButton>
          <ActionButton href={shareLinks.linkedin} icon={ExternalLink} label="Partager sur LinkedIn">
            LinkedIn
          </ActionButton>
          <ActionButton href={shareLinks.email} icon={Mail} label="Partager par email">
            Email
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
