import { useEffect, useMemo, useState } from "react";
import { OPENMOJI_STICKERS } from "./sticker-library-data";

type GiphyItem = {
  id: string;
  src: string;
  preview: string;
  title: string;
};

type CacheEntry = {
  ts: number;
  items: GiphyItem[];
  offset: number;
  hasMore: boolean;
};

const CACHE_PREFIX = "giphy-stickers:v1:";
const CACHE_TTL = 1000 * 60 * 60 * 24;
const GIPHY_PAGE_SIZE = 24;

function readCache(key: string) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry;
    if (Date.now() - parsed.ts > CACHE_TTL) return null;
    return parsed.items;
  } catch {
    return null;
  }
}

function writeCache(key: string, items: GiphyItem[]) {
  try {
    const payload: CacheEntry = { ts: Date.now(), items, offset: items.length, hasMore: items.length > 0 };
    localStorage.setItem(key, JSON.stringify(payload));
  } catch {
    return;
  }
}

function mapGiphyItem(item: Record<string, unknown>): GiphyItem | null {
  const id = typeof item.id === "string" ? item.id : null;
  const title = typeof item.title === "string" ? item.title : "";
  const images = item.images as Record<string, unknown> | undefined;
  const image = images as Record<string, { url?: string }> | undefined;
  const src = image?.fixed_width?.url ?? image?.original?.url ?? image?.downsized?.url;
  const preview = image?.fixed_width_small_still?.url ?? image?.fixed_width_still?.url ?? src;
  if (!id || !src || !preview) return null;
  return { id, src, preview, title };
}

async function fetchGiphyPage(query: string, offset: number): Promise<{ items: GiphyItem[]; hasMore: boolean }> {
  const apiKey = import.meta.env.VITE_GIPHY_API_KEY as string | undefined;
  if (!apiKey) return { items: [], hasMore: false };

  const endpoint = query
    ? `https://api.giphy.com/v1/stickers/search?api_key=${encodeURIComponent(apiKey)}&q=${encodeURIComponent(query)}&limit=${GIPHY_PAGE_SIZE}&offset=${offset}&rating=g&lang=fr`
    : `https://api.giphy.com/v1/stickers/trending?api_key=${encodeURIComponent(apiKey)}&limit=${GIPHY_PAGE_SIZE}&offset=${offset}&rating=g`;

  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`GIPHY ${response.status}`);
  }

  const payload = (await response.json()) as { data?: Record<string, unknown>[] };
  const items = (payload.data ?? []).map(mapGiphyItem).filter((item): item is GiphyItem => Boolean(item));
  return { items, hasMore: items.length === GIPHY_PAGE_SIZE };
}

export function useStickerLibrary(query: string, mode: "emoji" | "gifs" | "shapes") {
  const cacheKey = useMemo(() => `${CACHE_PREFIX}${query.trim().toLowerCase() || "trending"}`, [query]);
  const [giphyItems, setGiphyItems] = useState<GiphyItem[]>([]);
  const [giphyOffset, setGiphyOffset] = useState(0);
  const [giphyHasMore, setGiphyHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== "gifs") {
      setGiphyItems([]);
      setGiphyOffset(0);
      setGiphyHasMore(true);
      setError(null);
      setLoading(false);
      setLoadingMore(false);
      return;
    }

    let active = true;
    const cached = readCache(cacheKey);
    if (cached) {
      setGiphyItems(cached);
      setGiphyOffset(cached.length);
      setGiphyHasMore(cached.length >= GIPHY_PAGE_SIZE);
      return;
    }

    setGiphyItems([]);
    setGiphyOffset(0);
    setGiphyHasMore(true);

    const timeout = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      void fetchGiphyPage(query.trim(), 0)
        .then(({ items, hasMore }) => {
          if (!active) return;
          setGiphyItems(items);
          setGiphyOffset(items.length);
          setGiphyHasMore(hasMore);
          writeCache(cacheKey, items);
        })
        .catch((err) => {
          if (!active) return;
          setError(err instanceof Error ? err.message : "Recherche indisponible");
          setGiphyItems([]);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [cacheKey, mode, query]);

  const loadMoreGifs = async () => {
    if (mode !== "gifs" || loading || loadingMore || !giphyHasMore) return;
    setLoadingMore(true);
    setError(null);
    try {
      const { items, hasMore } = await fetchGiphyPage(query.trim(), giphyOffset);
      setGiphyItems((current) => {
        const seen = new Set(current.map((item) => item.id));
        const merged = [...current];
        items.forEach((item) => {
          if (!seen.has(item.id)) merged.push(item);
        });
        writeCache(cacheKey, merged);
        return merged;
      });
      setGiphyOffset((value) => value + items.length);
      setGiphyHasMore(hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Recherche indisponible");
    } finally {
      setLoadingMore(false);
    }
  };

  const openMojiItems = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return OPENMOJI_STICKERS.filter((item) => !needle || item.label.includes(needle) || item.emoji.includes(needle)).slice(0, 96);
  }, [query]);

  return {
    openMojiItems,
    giphyItems,
    loading,
    loadingMore,
    giphyHasMore,
    error,
    loadMoreGifs,
  };
}
