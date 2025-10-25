export type FinishCategoryKey = 'countertop' | 'door' | 'texture';

export interface FinishItem {
  id: string;
  name: string;
  src: string;
  category: FinishCategoryKey;
  group: string;
  fileName: string;
  sku?: string;
}

export interface FinishCategory {
  key: FinishCategoryKey;
  title: string;
  description: string;
  items: FinishItem[];
}

export interface DwgAsset {
  fileName: string;
  label: string;
  url: string;
  sizeInBytes?: number;
}

export interface ConfigurationPayload {
  generatedAt: string;
  selections: Partial<Record<FinishCategoryKey, FinishItem>>;
}
