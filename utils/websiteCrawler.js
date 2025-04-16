export const crawlWebsite = async (url) => {
  try {
    const response = await fetch('/api/crawl', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch website details');
    }

    return await response.json();
  } catch (error) {
    console.error('Error crawling website:', error);
    throw new Error('Failed to fetch website details. Please check the URL and try again.');
  }
}; 