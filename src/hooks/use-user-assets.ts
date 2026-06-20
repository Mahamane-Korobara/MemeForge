import { useCallback, useEffect, useState } from "react";
import { deleteAsset, getAssetById, getAssets, insertAsset } from "@/services/library/library.service";
import type { UserAsset } from "@/types/assets";

export function useUserAssets() {
  const [assets, setAssets] = useState<UserAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setAssets(await getAssets());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger la bibliothèque");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const remove = useCallback(
    async (id: string) => {
      await deleteAsset(id);
      await refresh();
    },
    [refresh],
  );

  const reuse = useCallback(async (id: string) => {
    const asset = await getAssetById(id);
    if (asset) insertAsset(asset);
  }, []);

  const download = useCallback(async (id: string) => {
    const asset = await getAssetById(id);
    if (!asset) return;
    const url = URL.createObjectURL(asset.blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${asset.name}.${asset.mimeType.includes("gif") ? "gif" : asset.mimeType.includes("webp") ? "webp" : "png"}`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, []);

  return {
    assets,
    loading,
    error,
    actions: {
      refresh,
      remove,
      reuse,
      download,
    },
  };
}
