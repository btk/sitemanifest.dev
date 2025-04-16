import { getColors } from 'color-thief-node';

export const generateManifest = async (imagePath, themeColor) => {
  try {
    console.log('Processing image:', imagePath);
    
    // If imagePath is a URL, we need to fetch it first
    let imageBuffer;
    if (imagePath.startsWith('blob:')) {
      console.log('Fetching blob URL...');
      const response = await fetch(imagePath);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
      console.log('Image fetched successfully');
    } else {
      imageBuffer = imagePath;
    }

    console.log('Extracting colors...');
    const colors = await getColors(imageBuffer, 5);
    console.log('Colors extracted:', colors);
    
    const dominantColor = colors[0];
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