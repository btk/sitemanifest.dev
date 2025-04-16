import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { HexColorPicker } from 'react-colorful';
import { generateManifest } from '../utils/manifestGenerator';
import { crawlWebsite } from '../utils/websiteCrawler';
import { validateManifest, getDefaultManifest } from '../utils/manifestValidator';
import Head from 'next/head';
import JSZip from 'jszip';

export default function Home() {
  const [manifest, setManifest] = useState(getDefaultManifest());
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [websiteDetails, setWebsiteDetails] = useState(null);
  const [copied, setCopied] = useState(false);
  const [validation, setValidation] = useState({ isValid: true, errors: [], warnings: [] });

  // Validate manifest on changes
  useEffect(() => {
    setValidation(validateManifest(manifest));
  }, [manifest]);

  // Save manifest to localStorage
  useEffect(() => {
    localStorage.setItem('manifest', JSON.stringify(manifest));
  }, [manifest]);

  // Load manifest from localStorage on mount
  useEffect(() => {
    const savedManifest = localStorage.getItem('manifest');
    if (savedManifest) {
      setManifest(JSON.parse(savedManifest));
    }
  }, []);

  const handleWebsiteCrawl = async () => {
    if (!websiteUrl) return;
    
    setLoading(true);
    setError(null);
    try {
      const details = await crawlWebsite(websiteUrl);
      setWebsiteDetails(details);
      
      // Update manifest with fetched details
      setManifest(prev => ({
        ...prev,
        name: details.name,
        short_name: details.short_name,
        description: details.description,
        start_url: details.start_url,
        icons: prev.icons // Keep existing icons
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
      
      try {
        // Create an image element to get the dominant color
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = imageUrl;
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        // Create canvas to analyze image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Calculate average color
        let r = 0, g = 0, b = 0;
        for (let i = 0; i < data.length; i += 4) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
        }
        const pixelCount = data.length / 4;
        r = Math.round(r / pixelCount);
        g = Math.round(g / pixelCount);
        b = Math.round(b / pixelCount);

        // Convert to hex
        const hexColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

        // Calculate a contrasting color for theme
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        const themeColor = luminance > 0.5 ? '#000000' : '#ffffff';

        // Generate icons in different sizes
        const iconSizes = [
          { size: 72, purpose: 'any' },
          { size: 96, purpose: 'any' },
          { size: 128, purpose: 'any' },
          { size: 144, purpose: 'any' },
          { size: 152, purpose: 'any' },
          { size: 192, purpose: 'any' },
          { size: 384, purpose: 'any' },
          { size: 512, purpose: 'any' },
          { size: 72, purpose: 'maskable' },
          { size: 96, purpose: 'maskable' },
          { size: 128, purpose: 'maskable' },
          { size: 192, purpose: 'maskable' },
          { size: 384, purpose: 'maskable' },
          { size: 512, purpose: 'maskable' }
        ];

        const icons = await Promise.all(iconSizes.map(async ({ size, purpose }) => {
          const resizedCanvas = document.createElement('canvas');
          const resizedCtx = resizedCanvas.getContext('2d');
          resizedCanvas.width = size;
          resizedCanvas.height = size;

          // For maskable icons, add padding
          if (purpose === 'maskable') {
            const padding = size * 0.1; // 10% padding
            resizedCtx.fillStyle = hexColor;
            resizedCtx.fillRect(0, 0, size, size);
            resizedCtx.drawImage(img, padding, padding, size - padding * 2, size - padding * 2);
          } else {
            resizedCtx.drawImage(img, 0, 0, size, size);
          }

          // Convert canvas to blob
          const blob = await new Promise(resolve => resizedCanvas.toBlob(resolve, file.type));
          const resizedUrl = URL.createObjectURL(blob);

          return {
            src: resizedUrl,
            sizes: `${size}x${size}`,
            type: file.type,
            purpose: purpose
          };
        }));

        setManifest(prev => ({
          ...prev,
          icons,
          background_color: hexColor,
          theme_color: themeColor
        }));
      } catch (error) {
        console.error('Error processing image:', error);
        // Fallback to single icon if processing fails
        setManifest(prev => ({
          ...prev,
          icons: [{
            src: imageUrl,
            sizes: '192x192',
            type: file.type
          }]
        }));
      }
    },
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg']
    },
    maxFiles: 1
  });

  const handleInputChange = (field, value) => {
    setManifest(prev => {
      // Ensure icons is always an array
      const updatedManifest = {
        ...prev,
        [field]: value,
        icons: Array.isArray(prev.icons) ? prev.icons : []
      };
      return updatedManifest;
    });
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(manifest, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    try {
      // Create a zip file
      const zip = new JSZip();
      
      // Update manifest with correct icon paths
      const manifestWithCorrectPaths = {
        ...manifest,
        icons: manifest.icons.map(icon => ({
          ...icon,
          src: `/site_icons/icon-${icon.sizes}.png`
        }))
      };
      
      // Add manifest.json to the root
      zip.file('manifest.json', JSON.stringify(manifestWithCorrectPaths, null, 2));
      
      // Create site_icons folder
      const iconsFolder = zip.folder('site_icons');
      
      // Find the smallest icon for favicon
      let smallestIcon = null;
      let smallestSize = Infinity;
      
      // Add all icons to the folder and find the smallest one
      for (const icon of manifest.icons) {
        const response = await fetch(icon.src);
        const blob = await response.blob();
        const fileName = `icon-${icon.sizes}.png`;
        iconsFolder.file(fileName, blob);
        
        // Parse the size to find the smallest icon
        const size = parseInt(icon.sizes.split('x')[0]);
        if (size < smallestSize) {
          smallestSize = size;
          smallestIcon = blob;
        }
      }
      
      // Add favicon.ico to the root using the smallest icon
      if (smallestIcon) {
        // Add both .ico and .png versions
        zip.file('favicon.ico', smallestIcon);
        zip.file('favicon.png', smallestIcon);
      }
      
      // Generate and download the zip file
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${manifest.short_name || 'site'}_manifest.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error creating zip file:', error);
      // Fallback to simple manifest download if zip creation fails
      const manifestWithCorrectPaths = {
        ...manifest,
        icons: manifest.icons.map(icon => ({
          ...icon,
          src: `/site_icons/icon-${icon.sizes}.png`
        }))
      };
      const blob = new Blob([JSON.stringify(manifestWithCorrectPaths, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'manifest.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <>
      <Head>
        <title>PWA Manifest Generator</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              PWA Manifest Generator
            </h1>
            <p className="text-lg text-gray-600">
              Generate PWA manifest files with automatic color detection and website crawling
            </p>
          </div>

          <div className="space-y-8">
            {/* Website URL Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Step 1: Enter Website URL</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleWebsiteCrawl();
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website URL
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base text-gray-900 placeholder-gray-500"
                      />
                      <button
                        type="submit"
                        disabled={loading || !websiteUrl}
                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium transition-colors"
                      >
                        {loading ? 'Fetching...' : 'Fetch Details'}
                      </button>
                    </div>
                  </div>
                  {websiteDetails && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">Fetched Details</h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><span className="font-medium">Title:</span> {websiteDetails.name}</p>
                        <p><span className="font-medium">Description:</span> {websiteDetails.description}</p>
                        {websiteDetails.favicon && (
                          <p><span className="font-medium">Favicon:</span> {websiteDetails.favicon}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* Basic Info Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Step 2: Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    App Name
                  </label>
                  <input
                    type="text"
                    value={manifest.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Name
                  </label>
                  <input
                    type="text"
                    value={manifest.short_name}
                    onChange={(e) => handleInputChange('short_name', e.target.value)}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={manifest.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start URL
                  </label>
                  <input
                    type="text"
                    value={manifest.start_url}
                    onChange={(e) => handleInputChange('start_url', e.target.value)}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Display Settings Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Step 3: Display Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Mode
                  </label>
                  <select
                    value={manifest.display}
                    onChange={(e) => handleInputChange('display', e.target.value)}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="standalone">Standalone</option>
                    <option value="minimal-ui">Minimal UI</option>
                    <option value="fullscreen">Fullscreen</option>
                    <option value="browser">Browser</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Orientation
                  </label>
                  <select
                    value={manifest.orientation}
                    onChange={(e) => handleInputChange('orientation', e.target.value)}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="any">Any</option>
                    <option value="natural">Natural</option>
                    <option value="landscape">Landscape</option>
                    <option value="portrait">Portrait</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scope
                  </label>
                  <input
                    type="text"
                    value={manifest.scope}
                    onChange={(e) => handleInputChange('scope', e.target.value)}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <input
                    type="text"
                    value={manifest.lang}
                    onChange={(e) => handleInputChange('lang', e.target.value)}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Icon Upload Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Step 4: Upload Icon</h2>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getInputProps()} />
                {isDragActive ? (
                  <p className="text-indigo-600 font-medium">Drop the icon here...</p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-gray-600">Drag and drop an icon, or click to select</p>
                    <p className="text-sm text-gray-500">Supported formats: PNG, JPG, JPEG, GIF, SVG</p>
                  </div>
                )}
              </div>
              {image && (
                <div className="mt-4">
                  <img
                    src={image}
                    alt="Preview"
                    className="max-w-xs mx-auto rounded-lg shadow-sm"
                  />
                </div>
              )}
            </div>

            {/* Theme Colors Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Step 5: Theme Colors</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Background Color
                  </label>
                  <div className="flex items-center space-x-4">
                    <HexColorPicker
                      color={manifest.background_color}
                      onChange={(color) => handleInputChange('background_color', color)}
                      className="w-full"
                    />
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-8 h-8 rounded-full border border-gray-300"
                        style={{ backgroundColor: manifest.background_color }}
                      />
                      <span className="font-mono text-sm text-gray-600">{manifest.background_color}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Theme Color
                  </label>
                  <div className="flex items-center space-x-4">
                    <HexColorPicker
                      color={manifest.theme_color}
                      onChange={(color) => handleInputChange('theme_color', color)}
                      className="w-full"
                    />
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-8 h-8 rounded-full border border-gray-300"
                        style={{ backgroundColor: manifest.theme_color }}
                      />
                      <span className="font-mono text-sm text-gray-600">{manifest.theme_color}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Settings Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Step 6: Advanced Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="prefer_related_applications"
                    checked={manifest.prefer_related_applications}
                    onChange={(e) => handleInputChange('prefer_related_applications', e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="prefer_related_applications" className="ml-2 block text-sm text-gray-900">
                    Prefer Related Applications
                  </label>
                </div>
              </div>
            </div>

            {/* Validation Errors */}
            {!validation.isValid && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-red-800 font-medium mb-2">Validation Errors</h3>
                <ul className="list-disc list-inside text-red-700">
                  {validation.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Generated Manifest */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Generated Manifest</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyJson}
                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 overflow-auto max-h-96">
                <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                  <code className="json-block" dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                      ...manifest,
                      icons: manifest.icons.map(icon => ({
                        ...icon,
                        src: `/site_icons/icon-${icon.sizes}.png`
                      }))
                    }, null, 2)
                      .replace(/&/g, '&amp;')
                      .replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;')
                      .replace(/"/g, '"')
                      .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
                      .replace(/: "([^"]+)"/g, ': <span class="json-string">"$1"</span>')
                      .replace(/: ([0-9]+)/g, ': <span class="json-number">$1</span>')
                      .replace(/: (true|false|null)/g, ': <span class="json-boolean">$1</span>')
                  }} />
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
