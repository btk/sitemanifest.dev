import { getColors } from 'color-thief-node';

export const generateManifest = async (imagePath, themeColor) => {
  try {
    const colors = await getColors(imagePath, 5);
    const dominantColor = colors[0];

    return {
      name: 'My PWA',
      short_name: 'PWA',
      description: 'A Progressive Web Application',
      start_url: '/',
      display: 'standalone',
      background_color: themeColor || '#ffffff',
      theme_color: themeColor || '#ffffff',
      icons: [
        {
          src: imagePath,
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: imagePath,
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    };
  } catch (error) {
    console.error('Error generating manifest:', error);
    throw error;
  }
};

export const validateManifest = (manifest) => {
  const errors = [];

  if (!manifest.name) {
    errors.push('name is required');
  }

  if (!manifest.short_name) {
    errors.push('short_name is required');
  }

  if (!manifest.start_url) {
    errors.push('start_url is required');
  }

  if (!manifest.display) {
    errors.push('display is required');
  }

  if (!manifest.background_color) {
    errors.push('background_color is required');
  }

  if (!manifest.theme_color) {
    errors.push('theme_color is required');
  }

  if (!manifest.icons || !Array.isArray(manifest.icons) || manifest.icons.length === 0) {
    errors.push('icons array is required with at least one icon');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const downloadManifest = (manifest) => {
  const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'manifest.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}; 