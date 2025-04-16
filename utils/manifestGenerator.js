export const generateManifest = async (imagePath, themeColor) => {
  try {
    console.log('Processing image:', imagePath);
    
    // Create a temporary image element to load the image
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    // Load the image
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imagePath;
    });
    
    console.log('Image loaded successfully');
    
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
      const color = `rgb(${r},${g},${b})`;
      colorCounts[color] = (colorCounts[color] || 0) + 1;
    }
    
    // Get the most common color
    const dominantColor = Object.entries(colorCounts)
      .sort((a, b) => b[1] - a[1])[0][0];
    
    console.log('Dominant color:', dominantColor);

    return {
      name: 'My PWA',
      short_name: 'PWA',
      description: 'A Progressive Web Application',
      start_url: '/',
      display: 'standalone',
      background_color: themeColor || dominantColor || '#ffffff',
      theme_color: themeColor || dominantColor || '#ffffff',
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
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      imagePath: imagePath,
    });
    
    // Return a manifest with default colors if color extraction fails
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
  }
}; 