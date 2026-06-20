export type AssetType = "sticker" | "gif" | "image";

export type AnimationPreset = "bounce" | "shake" | "zoom" | "rotation" | "fade" | "slide";
export type AnimationChoice = AnimationPreset | "none";

export type CreatorExportFormat = "webp" | "gif";

export type CreatorBackgroundMode = "keep" | "remove";

export interface UserAsset {
  id: string;
  name: string;
  type: AssetType;
  createdAt: string;
  thumbnail: string;
  storageId: string;
  mimeType: string;
  animation?: AnimationPreset;
  outputFormat?: CreatorExportFormat;
  backgroundMode?: CreatorBackgroundMode;
}

export interface AssetFile {
  blob: Blob;
  mimeType: string;
}

export interface SaveAssetInput {
  name: string;
  type: AssetType;
  thumbnail: string;
  file: Blob;
  mimeType: string;
  animation?: AnimationPreset;
  outputFormat?: CreatorExportFormat;
  backgroundMode?: CreatorBackgroundMode;
}

export interface CreatorSettings {
  defaultExportFormat: CreatorExportFormat;
  preferredAnimation: AnimationChoice;
  backgroundMode: CreatorBackgroundMode;
}
