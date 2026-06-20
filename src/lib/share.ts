import { getSiteDescription, getSiteName, getSiteUrl } from "@/lib/site";

export type ShareNetwork = "x" | "facebook" | "whatsapp" | "linkedin" | "email";

export type SharePayload = {
  title?: string;
  text?: string;
  url?: string;
};

export function buildShareMessage(title?: string) {
  const appName = getSiteName();
  const messageTitle = title?.trim() || appName;
  return {
    title: messageTitle,
    text: `${messageTitle} - ${getSiteDescription()}`,
    url: getSiteUrl(),
  };
}

export function buildShareLinks(payload: SharePayload) {
  const title = encodeURIComponent(payload.title?.trim() || getSiteName());
  const text = encodeURIComponent(payload.text?.trim() || getSiteDescription());
  const url = encodeURIComponent(payload.url?.trim() || getSiteUrl());
  const shareText = `${title}%0A${text}`;

  return {
    x: `https://twitter.com/intent/tweet?text=${shareText}&url=${url}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${shareText}`,
    whatsapp: `https://wa.me/?text=${shareText}%20${url}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    email: `mailto:?subject=${title}&body=${shareText}%0A%0A${url}`,
  } satisfies Record<ShareNetwork, string>;
}

export async function copyText(value: string) {
  await navigator.clipboard.writeText(value);
}

