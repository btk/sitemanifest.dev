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