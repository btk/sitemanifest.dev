export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Ensure the URL has a protocol
    let targetUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      targetUrl = 'https://' + url;
    }

    // Fetch the website content
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SiteManifest/1.0; +https://sitemanifest.dev)'
      },
      redirect: 'follow'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch website: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    
    // Basic HTML parsing using regex (not ideal but works for simple cases)
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';
    
    const descriptionMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i);
    const description = descriptionMatch ? descriptionMatch[1].trim() : '';
    
    const faviconMatch = html.match(/<link[^>]*rel="icon"[^>]*href="([^"]*)"[^>]*>/i);
    let favicon = faviconMatch ? faviconMatch[1].trim() : '';
    
    // If favicon is relative, make it absolute
    if (favicon && !favicon.startsWith('http')) {
      const urlObj = new URL(targetUrl);
      favicon = new URL(favicon, urlObj.origin).href;
    }

    return res.status(200).json({
      name: title,
      short_name: title.split(' ')[0],
      description: description,
      start_url: targetUrl,
      favicon: favicon
    });
  } catch (error) {
    console.error('Error crawling website:', error);
    return res.status(500).json({ error: 'Failed to fetch website details' });
  }
} 