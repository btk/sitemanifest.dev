export const crawlWebsite = async (url) => {
  try {
    // Ensure the URL has a protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // Use a CORS proxy service
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch website: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const html = data.contents;
    
    // Create a temporary DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Extract website details
    const title = doc.querySelector('title')?.textContent || '';
    const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const favicon = doc.querySelector('link[rel="icon"]')?.getAttribute('href') || '';
    
    // If favicon is relative, make it absolute
    let absoluteFavicon = favicon;
    if (favicon && !favicon.startsWith('http')) {
      const urlObj = new URL(url);
      absoluteFavicon = new URL(favicon, urlObj.origin).href;
    }

    return {
      name: title,
      short_name: title.split(' ')[0], // Use first word as short name
      description: description,
      start_url: url,
      favicon: absoluteFavicon
    };
  } catch (error) {
    console.error('Error crawling website:', error);
    throw new Error('Failed to fetch website details. Please check the URL and try again.');
  }
}; 