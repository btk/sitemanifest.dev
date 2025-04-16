export const generateManifest = async (imagePath, themeColor) => {
  try {
    // Get dominant color from image
    const colors = await getColors(imagePath);
    const dominantColor = colors ? `#${colors[0].toString(16).padStart(6, '0')}` : '#ffffff';

    // Generate manifest with absolute icon paths
    const manifest = {
      name: 'My PWA',
      short_name: 'PWA',
      description: 'A Progressive Web Application',
      start_url: '/',
      display: 'standalone',
      background_color: dominantColor,
      theme_color: themeColor || dominantColor,
      icons: [
        {
          src: '/site_icons/icon-32x32.png',
          sizes: '32x32',
          type: 'image/png'
        },
        {
          src: '/site_icons/icon-72x72.png',
          sizes: '72x72',
          type: 'image/png'
        },
        {
          src: '/site_icons/icon-96x96.png',
          sizes: '96x96',
          type: 'image/png'
        },
        {
          src: '/site_icons/icon-128x128.png',
          sizes: '128x128',
          type: 'image/png'
        },
        {
          src: '/site_icons/icon-144x144.png',
          sizes: '144x144',
          type: 'image/png'
        },
        {
          src: '/site_icons/icon-152x152.png',
          sizes: '152x152',
          type: 'image/png'
        },
        {
          src: '/site_icons/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/site_icons/icon-384x384.png',
          sizes: '384x384',
          type: 'image/png'
        },
        {
          src: '/site_icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    };

    return manifest;
  } catch (error) {
    console.error('Error generating manifest:', error);
    throw error;
  }
}; 