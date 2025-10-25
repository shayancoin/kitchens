'use server';

import type { Dirent } from 'fs';
import { promises as fs } from 'fs';
import path from 'path';
import { DwgAsset, FinishCategory, FinishCategoryKey, FinishItem } from '../types/cpq';

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const KITCHEN_ROOT = path.join(PUBLIC_DIR, 'kitchen');
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const FINISH_CATEGORY_CONFIG: Array<{
  key: FinishCategoryKey;
  title: string;
  description: string;
  folder: string[];
}> = [
  {
    key: 'countertop',
    title: 'Countertop Finishes',
    description: 'Natural and engineered stone options for countertop surfaces.',
    folder: ['FINISHES', 'COUNTERTOP-FINISHES'],
  },
  {
    key: 'door',
    title: 'Door Finishes',
    description: 'Laminate, lacquer, and specialty door fronts.',
    folder: ['FINISHES', 'DOORS-FINISHES'],
  },
  {
    key: 'texture',
    title: 'Texture Library',
    description: 'Molteni texture references for cohesive material palettes.',
    folder: ['FINISHES', 'Molteni_Texture Images'],
  },
];

function formatSegmentForDisplay(segment: string): string {
  return segment
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatFileName(fileName: string): { name: string; sku?: string } {
  const base = fileName.replace(path.extname(fileName), '');
  const tokens = base.split('_').filter(Boolean);
  if (tokens.length === 0) {
    return { name: base };
  }

  const skuCandidate = tokens[tokens.length - 1];
  const rawNameTokens = tokens.slice(0, -1);
  const filteredTokens = rawNameTokens.filter((token, index) => {
    if (index === 0 && /^[0-9]+$/.test(token)) {
      return false;
    }
    if (token.toUpperCase() === 'FN') {
      return false;
    }
    return true;
  });
  const nameTokens = (filteredTokens.length > 0 ? filteredTokens : rawNameTokens).map((token) =>
    token.replace(/-/g, ' '),
  );
  const cleanedName = nameTokens.length > 0 ? nameTokens.join(' ') : tokens.join(' ');

  return {
    name: cleanedName
      .replace(/\s+/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())
      .trim(),
    sku: skuCandidate && skuCandidate.length <= 12 ? skuCandidate : undefined,
  };
}

async function safeReadDir(dirPath: string): Promise<Dirent[]> {
  try {
    return await fs.readdir(dirPath, { withFileTypes: true });
  } catch (error) {
    console.warn(`Unable to read directory: ${dirPath}`, error);
    return [];
  }
}

async function collectFinishItems(
  category: FinishCategoryKey,
  folder: string[],
): Promise<FinishItem[]> {
  const items: FinishItem[] = [];
  const baseFsPath = path.join(KITCHEN_ROOT, ...folder);
  const baseUrlSegments = ['kitchen', ...folder];

  async function walk(currentFsPath: string, relativeSegments: string[]) {
    const entries = await safeReadDir(currentFsPath);
    for (const entry of entries) {
      const entryFsPath = path.join(currentFsPath, entry.name);
      const entrySegments = [...relativeSegments, entry.name];

      if (entry.isDirectory()) {
        await walk(entryFsPath, entrySegments);
        continue;
      }

      const ext = path.extname(entry.name).toLowerCase();
      if (!IMAGE_EXTENSIONS.has(ext)) {
        continue;
      }

      const { name, sku } = formatFileName(entry.name);
      const urlPath = '/' + path.posix.join(...baseUrlSegments, ...relativeSegments, entry.name);
      const groupSegments = relativeSegments.length > 0 ? relativeSegments : ['General'];
      const groupLabel = groupSegments
        .map((segment) => formatSegmentForDisplay(segment))
        .join(' / ');

      items.push({
        id: `${category}-${entrySegments.join('-')}`,
        name,
        sku,
        src: urlPath,
        category,
        group: groupLabel,
        fileName: entry.name,
      });
    }
  }

  await walk(baseFsPath, []);
  items.sort((a, b) => a.name.localeCompare(b.name));
  return items;
}

export async function loadFinishCatalog(): Promise<FinishCategory[]> {
  const itemPromises = FINISH_CATEGORY_CONFIG.map((config) =>
    collectFinishItems(config.key, config.folder),
  );
  const resolvedItems = await Promise.all(itemPromises);

  return resolvedItems.map((items, index) => {
    const config = FINISH_CATEGORY_CONFIG[index];
    return {
      key: config.key,
      title: config.title,
      description: config.description,
      items,
    };
  });
}

export async function loadTwoDDrawings(): Promise<DwgAsset[]> {
  const folderSegments = ['TECHNICAL DRAWINGS 2D (.DWG)'];
  const folderFsPath = path.join(KITCHEN_ROOT, ...folderSegments);
  const entries = await safeReadDir(folderFsPath);
  const assets: DwgAsset[] = [];

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!entry.name.toLowerCase().endsWith('.dwg')) continue;

    const filePath = path.join(folderFsPath, entry.name);
    let sizeInBytes: number | undefined;
    try {
      const stats = await fs.stat(filePath);
      sizeInBytes = stats.size;
    } catch (error) {
      console.warn(`Unable to read file size for: ${filePath}`, error);
    }

    const { name } = formatFileName(entry.name);
    const url = '/' + path.posix.join('kitchen', ...folderSegments, entry.name);

    assets.push({
      fileName: entry.name,
      label: name,
      url,
      sizeInBytes,
    });
  }

  assets.sort((a, b) => a.fileName.localeCompare(b.fileName));
  return assets;
}

export const DATASHEET_URL = '/kitchen/DATASHEETS/vvd-product-sheet.pdf';
