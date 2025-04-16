import { Manifest, ManifestIcon } from '../types/manifest';
import sharp from 'sharp';
import Jimp from 'jimp';

const REQUIRED_ICON_SIZES = [
  { size: 192, purpose: 'any' },
  { size: 512, purpose: 'any' },
  { size: 192, purpose: 'maskable' },
  { size: 512, purpose: 'maskable' },
];

const FAVICON_SIZES = [16, 32, 48, 72, 96, 144, 168, 192];

export async function generateIcons(sourceImage: Buffer): Promise<ManifestIcon[]> {
  const icons: ManifestIcon[] = [];

  for (const { size, purpose } of REQUIRED_ICON_SIZES) {
    const buffer = await sharp(sourceImage)
      .resize(size, size)
      .toBuffer();

    icons.push({
      src: `icons/icon-${size}x${size}${purpose === 'maskable' ? '-maskable' : ''}.png`,
      sizes: `${size}x${size}`,
      type: 'image/png',
      purpose: purpose === 'maskable' ? 'maskable' : undefined,
    });
  }

  return icons;
}

export async function generateFavicons(sourceImage: Buffer): Promise<void> {
  const image = await Jimp.read(sourceImage);

  // Generate favicon.ico
  const ico = await Jimp.read(sourceImage);
  ico.resize(32, 32);
  await ico.writeAsync('public/favicon.ico');

  // Generate apple-touch-icon.png
  const appleTouch = await Jimp.read(sourceImage);
  appleTouch.resize(180, 180);
  await appleTouch.writeAsync('public/apple-touch-icon.png');

  // Generate other favicon sizes
  for (const size of FAVICON_SIZES) {
    const favicon = await Jimp.read(sourceImage);
    favicon.resize(size, size);
    await favicon.writeAsync(`public/favicon-${size}x${size}.png`);
  }
}

export function generateManifest(manifest: Manifest): string {
  return JSON.stringify(manifest, null, 2);
}

export function validateManifest(manifest: Manifest): string[] {
  const errors: string[] = [];

  if (!manifest.name) errors.push('Name is required');
  if (!manifest.short_name) errors.push('Short name is required');
  if (!manifest.description) errors.push('Description is required');
  if (!manifest.icons || manifest.icons.length === 0) errors.push('At least one icon is required');
  if (!manifest.start_url) errors.push('Start URL is required');
  if (!manifest.display) errors.push('Display mode is required');
  if (!manifest.background_color) errors.push('Background color is required');
  if (!manifest.theme_color) errors.push('Theme color is required');

  return errors;
} 