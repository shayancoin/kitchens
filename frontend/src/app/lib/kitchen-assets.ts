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

/**
 * Convert a path or token segment into a human-friendly, title-cased label.
 *
 * @param segment - The raw segment which may contain underscores, dashes, or extra spaces
 * @returns The segment with underscores and dashes replaced by single spaces, collapsed whitespace trimmed, and each word capitalized
 */
function formatSegmentForDisplay(segment: string): string {
  return segment
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Produce a human-friendly display name and an optional SKU candidate from a file name.
 *
 * @param fileName - The original file name (may include extension and underscore-separated tokens)
 * @returns An object with:
 *   - `name`: a title-cased, space-normalized display name derived from the file name
 *   - `sku`: the last underscore-separated token when its length is 12 characters or fewer, otherwise `undefined`
 */
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

/**
 * Reads directory entries for the given filesystem path.
 *
 * @param dirPath - Filesystem path of the directory to read
 * @returns An array of `fs.Dirent` entries for the directory; an empty array if the directory cannot be read
 */
async function safeReadDir(dirPath: string): Promise<fs.Dirent[]> {
  try {
    return await fs.readdir(dirPath, { withFileTypes: true });
  } catch (error) {
    console.warn(`Unable to read directory: ${dirPath}`, error);
    return [];
  }
}

/**
 * Collects finish image assets from a kitchen folder and returns them as structured FinishItem entries.
 *
 * @param category - The finish category key to assign to each collected item.
 * @param folder - Array of path segments under the kitchen root that identifies the folder to scan.
 * @returns An array of FinishItem objects for image files found under the specified folder (including subdirectories), sorted by `name`. Each item includes an `id` combining the category and file path, an optional `sku` if detected, a public `src` URL, and a `group` label derived from the file's relative folder (defaults to "General" for files in the root).
 */
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

/**
 * Load and assemble finish categories with their items by scanning the configured asset folders.
 *
 * @returns An array of FinishCategory objects, each containing the category metadata and a sorted list of FinishItem entries discovered under that category's configured folder structure.
 */
export async function loadFinishCatalog(): Promise<FinishCategory[]> {
  const categories: FinishCategory[] = [];

  for (const config of FINISH_CATEGORY_CONFIG) {
    const items = await collectFinishItems(config.key, config.folder);
    categories.push({
      key: config.key,
      title: config.title,
      description: config.description,
      items,
    });
  }

  return categories;
}

/**
 * Collects metadata for 2D DWG drawing files in the kitchen public folder.
 *
 * @returns An array of DwgAsset objects containing `fileName`, `label`, `url`, and optional `sizeInBytes`.
 */
export async function loadTwoDDrawings(): Promise<DwgAsset[]> {
  const folderSegments = ['TECHNICAL DRAWINGS 2D (.DWG)'];
  const folderFsPath = path.join(KITCHEN_ROOT, ...folderSegments);
  const entries = await safeReadDir(folderFsPath);
  const assets: DwgAsset[] = [];

  for (const entry of entries) {
    if (!entry.isFile()) continue;

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