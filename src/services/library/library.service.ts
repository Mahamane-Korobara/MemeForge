import type { AssetFile, CreatorSettings, SaveAssetInput, UserAsset } from "@/types/assets";

const ASSET_META_KEY = "meme-creator:assets:v1";
const SETTINGS_KEY = "meme-creator:settings:v1";
const DB_NAME = "meme-creator-assets";
const DB_VERSION = 1;
const FILE_STORE = "files";

type StoredFileRecord = {
  id: string;
  blob: Blob;
  mimeType: string;
};

let dbPromise: Promise<IDBDatabase> | null = null;

function createDefaultSettings(): CreatorSettings {
  return {
    defaultExportFormat: "webp",
    preferredAnimation: "none",
    backgroundMode: "keep",
  };
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    return;
  }
}

function openDatabase() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(FILE_STORE)) {
        db.createObjectStore(FILE_STORE, { keyPath: "id" });
      }
    };

    request.onerror = () => reject(request.error ?? new Error("IndexedDB indisponible"));
    request.onsuccess = () => resolve(request.result);
  });

  return dbPromise;
}

async function putFile(record: StoredFileRecord) {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(FILE_STORE, "readwrite");
    tx.objectStore(FILE_STORE).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("Impossible d'enregistrer le fichier"));
  });
}

async function getFile(id: string): Promise<AssetFile | null> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FILE_STORE, "readonly");
    const request = tx.objectStore(FILE_STORE).get(id);
    request.onerror = () => reject(request.error ?? new Error("Impossible de lire le fichier"));
    request.onsuccess = () => {
      const value = request.result as StoredFileRecord | undefined;
      if (!value) return resolve(null);
      resolve({ blob: value.blob, mimeType: value.mimeType });
    };
  });
}

async function deleteFile(id: string) {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(FILE_STORE, "readwrite");
    tx.objectStore(FILE_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("Impossible de supprimer le fichier"));
  });
}

function readAssets(): UserAsset[] {
  return readJson<UserAsset[]>(ASSET_META_KEY, []);
}

function writeAssets(assets: UserAsset[]) {
  writeJson(ASSET_META_KEY, assets);
}

export async function saveAsset(input: SaveAssetInput): Promise<UserAsset> {
  const asset: UserAsset = {
    id: crypto.randomUUID(),
    name: input.name.trim() || "Sans titre",
    type: input.type,
    createdAt: new Date().toISOString(),
    thumbnail: input.thumbnail,
    storageId: crypto.randomUUID(),
    mimeType: input.mimeType,
    animation: input.animation,
    outputFormat: input.outputFormat,
    backgroundMode: input.backgroundMode,
  };

  await putFile({
    id: asset.storageId,
    blob: input.file,
    mimeType: input.mimeType,
  });

  const next = [asset, ...readAssets()];
  writeAssets(next);
  return asset;
}

export async function getAssets(): Promise<UserAsset[]> {
  return readAssets().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getAssetById(id: string): Promise<(UserAsset & AssetFile) | null> {
  const asset = readAssets().find((item) => item.id === id);
  if (!asset) return null;
  const file = await getFile(asset.storageId);
  if (!file) return null;
  return { ...asset, ...file };
}

export async function deleteAsset(id: string): Promise<void> {
  const assets = readAssets();
  const target = assets.find((item) => item.id === id);
  if (!target) return;
  await deleteFile(target.storageId);
  writeAssets(assets.filter((item) => item.id !== id));
}

export function getCreatorSettings(): CreatorSettings {
  return readJson<CreatorSettings>(SETTINGS_KEY, createDefaultSettings());
}

export function saveCreatorSettings(settings: Partial<CreatorSettings>): CreatorSettings {
  const next = { ...getCreatorSettings(), ...settings };
  writeJson(SETTINGS_KEY, next);
  return next;
}

export function insertAsset(asset: UserAsset) {
  window.dispatchEvent(new CustomEvent<UserAsset>("meme-editor:insert-asset", { detail: asset }));
}
