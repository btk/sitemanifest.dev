export const generateManifest = async (file, themeColor = '#ffffff') => {
  try {
    // Create a temporary image element to get the image dimensions
    const img = new Image();
    const imageUrl = URL.createObjectURL(file);
    
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

    // Generate the manifest
    const manifest = {
      name: 'My PWA',
      short_name: 'PWA',
      description: 'A Progressive Web Application',
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: dominantColor,
      icons: [
        {
          src: imageUrl,
          sizes: `${img.width}x${img.height}`,
          type: file.type
        }
      ]
    };

    return { manifest, dominantColor };
  } catch (error) {
    console.error('Error generating manifest:', error);
    console.error('Error details:', { message: error.message, stack: error.stack, file });
    throw new Error('Failed to generate manifest. Please try again.');
  }
}; 