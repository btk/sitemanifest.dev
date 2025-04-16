export const generateManifest = async (imagePath, themeColor) => {
  try {
    // Create an image element to get the dominant color
    const img = new Image();
    const imageUrl = URL.createObjectURL(imagePath);
    
    // Wait for the image to load
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageUrl;
    });

    // Create a canvas to analyze the image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    // Get the image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Simple color extraction (get the most common color)
    const colorCounts = {};
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // Skip transparent pixels
      if (data[i + 3] < 128) continue;
      // Convert RGB to hex
      const hex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
      colorCounts[hex] = (colorCounts[hex] || 0) + 1;
    }

    // Get the most common color
    const dominantColor = Object.entries(colorCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || themeColor;

    // Clean up the object URL
    URL.revokeObjectURL(imageUrl);

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