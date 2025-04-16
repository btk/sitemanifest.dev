export const crawlWebsite = async (url) => {
  try {
    // Ensure URL has protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // Use a CORS proxy service
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const html = data.contents;

    // Create a DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Extract website details
    const title = doc.querySelector('title')?.textContent || '';
    const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const favicon = doc.querySelector('link[rel="icon"]')?.getAttribute('href') || 
                   doc.querySelector('link[rel="shortcut icon"]')?.getAttribute('href') || 
                   '/favicon.ico';

    // Handle relative favicon URLs
    let absoluteFaviconUrl = favicon;
    if (favicon.startsWith('/')) {
      const urlObj = new URL(url);
      absoluteFaviconUrl = `${urlObj.origin}${favicon}`;
    } else if (!favicon.startsWith('http')) {
      const urlObj = new URL(url);
      absoluteFaviconUrl = `${urlObj.origin}/${favicon}`;
    }

    return {
      name: title,
      short_name: title.substring(0, 12),
      description: description,
      start_url: url,
      favicon: absoluteFaviconUrl
    };
  } catch (error) {
    console.error('Error crawling website:', error);
    throw new Error('Failed to fetch website details. Please check the URL and try again.');
  }
}; 