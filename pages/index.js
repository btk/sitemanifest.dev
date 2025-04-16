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

  // Revalidate manifest whenever it changes
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
        // Create an image element
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = imageUrl;
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        // Create canvas to convert image to PNG
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Convert canvas to PNG blob
        const pngBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        const pngUrl = URL.createObjectURL(pngBlob);

        // Create an image element to get the dominant color
        const pngImg = new Image();
        pngImg.crossOrigin = "Anonymous";
        pngImg.src = pngUrl;
        
        await new Promise((resolve, reject) => {
          pngImg.onload = resolve;
          pngImg.onerror = reject;
        });

        // Create canvas to analyze the image
        const colorCanvas = document.createElement('canvas');
        const colorCtx = colorCanvas.getContext('2d');
        colorCanvas.width = pngImg.width;
        colorCanvas.height = pngImg.height;
        colorCtx.drawImage(pngImg, 0, 0);

        // Get the image data
        const imageData = colorCtx.getImageData(0, 0, colorCanvas.width, colorCanvas.height);
        const data = imageData.data;

        // Calculate average color and overall brightness
        let r = 0, g = 0, b = 0, count = 0;
        let totalBrightness = 0;
        
        for (let i = 0; i < data.length; i += 4) {
          // Skip transparent pixels
          if (data[i + 3] < 128) continue;
          
          // Get RGB values
          const pixelR = data[i];
          const pixelG = data[i + 1];
          const pixelB = data[i + 2];
          
          // Calculate pixel brightness
          const brightness = (pixelR * 0.299 + pixelG * 0.587 + pixelB * 0.114) / 255;
          totalBrightness += brightness;
          
          r += pixelR;
          g += pixelG;
          b += pixelB;
          count++;
        }

        // Calculate average color (theme color)
        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);
        const themeColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

        // Calculate average brightness
        const avgBrightness = totalBrightness / count;

        // Set background color based on average brightness
        let backgroundColor;
        if (avgBrightness < 0.3) {
          backgroundColor = '#000000'; // Dark images get black background
        } else if (avgBrightness > 0.7) {
          backgroundColor = '#ffffff'; // Light images get white background
        } else {
          backgroundColor = '#808080'; // Medium brightness gets gray background
        }

        // Generate icons in different sizes
        const iconSizes = [
          { size: 32, purpose: 'any' },
          { size: 72, purpose: 'any' },
          { size: 96, purpose: 'any' },
          { size: 128, purpose: 'any' },
          { size: 144, purpose: 'any' },
          { size: 152, purpose: 'any' },
          { size: 180, purpose: 'any' }, // Apple Touch Icon
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

          // For maskable icons, add padding (safe zone)
          if (purpose === 'maskable') {
            const padding = size * 0.1; // 10% padding (safe zone)
            // Clear the canvas (transparent background)
            resizedCtx.clearRect(0, 0, size, size);
            // Draw the icon in the safe zone
            resizedCtx.drawImage(pngImg, padding, padding, size - padding * 2, size - padding * 2);
          } else {
            // For Apple Touch Icon (180x180), use high-quality rendering
            if (size === 180) {
              resizedCtx.imageSmoothingEnabled = true;
              resizedCtx.imageSmoothingQuality = 'high';
            }
            resizedCtx.drawImage(pngImg, 0, 0, size, size);
          }

          // Convert canvas to blob
          const blob = await new Promise(resolve => resizedCanvas.toBlob(resolve, 'image/png', 1.0)); // Maximum quality for PNG
          const resizedUrl = URL.createObjectURL(blob);

          return {
            src: resizedUrl,
            sizes: `${size}x${size}`,
            type: 'image/png',
            purpose: purpose
          };
        }));

        setManifest(prev => ({
          ...prev,
          icons,
          background_color: backgroundColor,
          theme_color: themeColor
        }));

        // Clean up object URLs
        URL.revokeObjectURL(imageUrl);
        URL.revokeObjectURL(pngUrl);
      } catch (error) {
        console.error('Error processing image:', error);
        // Fallback to single icon if processing fails
        setManifest(prev => ({
          ...prev,
          icons: [{
            src: imageUrl,
            sizes: '192x192',
            type: 'image/png'
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
        // Add apple-touch-icon.png (180x180 is recommended for iOS)
        const appleTouchIcon = manifest.icons.find(icon => icon.sizes === '180x180')?.src || manifest.icons[0].src;
        if (appleTouchIcon) {
          const response = await fetch(appleTouchIcon);
          const blob = await response.blob();
          zip.file('apple-touch-icon.png', blob);
        }
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
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Sparkles */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-2 h-2 bg-indigo-200 rounded-full animate-float" style={{ animationDelay: '0s', marginLeft: '-50px' }}></div>
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-3 h-3 bg-purple-200 rounded-full animate-float" style={{ animationDelay: '1s', marginLeft: '50px' }}></div>
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-2 h-2 bg-pink-200 rounded-full animate-float" style={{ animationDelay: '2s', marginLeft: '-100px' }}></div>
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-3 h-3 bg-indigo-200 rounded-full animate-float" style={{ animationDelay: '3s', marginLeft: '100px' }}></div>
          
          {/* Floating Shapes */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-4 h-4 border-2 border-indigo-200 rounded-lg animate-float-slow rotate-45" style={{ animationDelay: '0.5s', marginLeft: '-150px' }}></div>
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-4 h-4 border-2 border-purple-200 rounded-lg animate-float-slow -rotate-45" style={{ animationDelay: '1.5s', marginLeft: '150px' }}></div>
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-4 h-4 border-2 border-pink-200 rounded-full animate-float-slow rotate-12" style={{ animationDelay: '2.5s' }}></div>
        </div>

        <div className="max-w-4xl mx-auto relative">
          <div className="text-center mb-12">
            <img 
              src="/logo.svg" 
              alt="Site Manifest Logo" 
              className="h-12 mx-auto mb-6"
            />
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient-x mb-4">
              PWA Manifest Generator
            </h1>
            <div className="max-w-2xl mx-auto">
              <p className="text-lg text-gray-600 leading-relaxed">
                Create compliant website manifests in seconds with <span className="font-medium text-indigo-600">smart color extraction</span>, <span className="font-medium text-purple-600">icon generation</span> and <span className="font-medium text-pink-600">website analysis</span>
              </p>
            </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'
                  } ${!image ? 'md:col-span-2' : ''}`}
                >
                  <input {...getInputProps()} />
                  {isDragActive ? (
                    <p className="text-indigo-600 font-medium">Drop the icon here...</p>
                  ) : (
                    <div className="space-y-2 flex flex-col items-center justify-center h-full">
                      <p className="text-gray-600">Drag and drop an icon, or click to select</p>
                      <p className="text-sm text-gray-500">Supported formats: PNG, JPG, JPEG, GIF, SVG</p>
                    </div>
                  )}
                </div>
                {image && (
                  <div className="flex flex-col items-center justify-center">
                    <div className="relative">
                      <img
                        src={image}
                        alt="Preview"
                        className="max-w-[150px] max-h-[150px] w-auto h-auto rounded-lg shadow-sm"
                      />
                      <button
                        onClick={() => {
                          setImage(null);
                          setManifest(prev => ({
                            ...prev,
                            icons: []
                          }));
                        }}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        title="Clear selection"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Uploaded icon preview</p>
                  </div>
                )}
              </div>
            </div>

            {/* Theme Colors Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Step 5: Theme Colors</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            {/* Icon Preview Section */}
            {manifest.icons && manifest.icons.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Icon Preview</h2>
                
                {/* Favicon Preview */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Favicon</h4>
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-center">
                      <div className="flex gap-2">
                        <div className="bg-white p-1 rounded">
                          <img 
                            src={manifest.icons.find(icon => icon.sizes === '32x32')?.src} 
                            alt="Favicon on white" 
                            className="w-8 h-8"
                          />
                        </div>
                        <div className="bg-gray-900 p-1 rounded">
                          <img 
                            src={manifest.icons.find(icon => icon.sizes === '32x32')?.src} 
                            alt="Favicon on dark" 
                            className="w-8 h-8"
                          />
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 mt-1">32x32</span>
                    </div>
                  </div>
                </div>

                {/* Apple Touch Icon Preview */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Apple Touch Icon</h4>
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-center">
                      <div className="bg-white p-2 rounded-xl shadow-sm">
                        <img 
                          src={manifest.icons.find(icon => icon.sizes === '180x180')?.src || manifest.icons[0].src} 
                          alt="Apple Touch Icon" 
                          className="w-16 h-16"
                        />
                      </div>
                      <span className="text-xs text-gray-500 mt-1">180x180</span>
                    </div>
                  </div>
                </div>

                {/* Regular Icons */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Regular Icons</h4>
                  <div className="overflow-x-auto">
                    <div className="flex gap-4 min-w-max pb-2">
                      {manifest.icons
                        .filter(icon => icon.purpose === 'any')
                        .map((icon, index) => (
                          <div key={index} className="flex flex-col items-center">
                            <img 
                              src={icon.src} 
                              alt={`Icon ${icon.sizes}`} 
                              className="w-12 h-12 object-contain"
                            />
                            <span className="text-xs text-gray-500 mt-1">{icon.sizes}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Maskable Icons */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Maskable Icons</h4>
                  <div className="overflow-x-auto">
                    <div className="flex gap-4 min-w-max pb-2">
                      {manifest.icons
                        .filter(icon => icon.purpose === 'maskable')
                        .map((icon, index) => (
                          <div key={index} className="flex flex-col items-center">
                            <div 
                              className="w-12 h-12 rounded-2xl p-1"
                              style={{ backgroundColor: manifest.background_color }}
                            >
                              <img 
                                src={icon.src} 
                                alt={`Maskable Icon ${icon.sizes}`} 
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <span className="text-xs text-gray-500 mt-1">{icon.sizes}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                <p className="text-sm text-gray-500 mt-1">
                  When enabled, the browser will prioritize showing related native applications in the app install banner instead of the PWA. This is useful if you have a native app that provides a better experience than the web app.
                </p>
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
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Generated Manifest</h2>
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

            {/* Download and Usage Instructions */}
            <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
              <div className="space-y-4">
                {/* Validation Checklist */}
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Manifest Validation</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <svg className={`w-5 h-5 ${manifest.name ? 'text-green-500' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {manifest.name ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        )}
                      </svg>
                      <span className={`text-sm ${manifest.name ? 'text-gray-600' : 'text-red-600'}`}>
                        App Name is {manifest.name ? 'set' : 'required'}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className={`w-5 h-5 ${manifest.short_name ? 'text-green-500' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {manifest.short_name ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        )}
                      </svg>
                      <span className={`text-sm ${manifest.short_name ? 'text-gray-600' : 'text-red-600'}`}>
                        Short Name is {manifest.short_name ? 'set' : 'required'}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className={`w-5 h-5 ${manifest.description ? 'text-green-500' : 'text-yellow-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {manifest.description ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        )}
                      </svg>
                      <span className={`text-sm ${manifest.description ? 'text-gray-600' : 'text-yellow-600'}`}>
                        Description is {manifest.description ? 'set' : 'recommended'}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className={`w-5 h-5 ${manifest.start_url ? 'text-green-500' : 'text-yellow-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {manifest.start_url ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        )}
                      </svg>
                      <span className={`text-sm ${manifest.start_url ? 'text-gray-600' : 'text-yellow-600'}`}>
                        Start URL is {manifest.start_url ? 'set' : 'recommended'}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className={`w-5 h-5 ${manifest.display ? 'text-green-500' : 'text-yellow-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {manifest.display ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        )}
                      </svg>
                      <span className={`text-sm ${manifest.display ? 'text-gray-600' : 'text-yellow-600'}`}>
                        Display Mode is {manifest.display ? 'set' : 'recommended'}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className={`w-5 h-5 ${manifest.icons && manifest.icons.length > 0 ? 'text-green-500' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {manifest.icons && manifest.icons.length > 0 ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        )}
                      </svg>
                      <span className={`text-sm ${manifest.icons && manifest.icons.length > 0 ? 'text-gray-600' : 'text-red-600'}`}>
                        Icons are {manifest.icons && manifest.icons.length > 0 ? 'uploaded' : 'required'}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className={`w-5 h-5 ${manifest.background_color ? 'text-green-500' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {manifest.background_color ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        )}
                      </svg>
                      <span className={`text-sm ${manifest.background_color ? 'text-gray-600' : 'text-red-600'}`}>
                        Background Color is {manifest.background_color ? 'set' : 'required'}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className={`w-5 h-5 ${manifest.theme_color ? 'text-green-500' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {manifest.theme_color ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        )}
                      </svg>
                      <span className={`text-sm ${manifest.theme_color ? 'text-gray-600' : 'text-red-600'}`}>
                        Theme Color is {manifest.theme_color ? 'set' : 'required'}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className={`w-5 h-5 ${manifest.icons?.some(icon => icon.purpose === 'maskable') ? 'text-green-500' : 'text-yellow-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {manifest.icons?.some(icon => icon.purpose === 'maskable') ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        )}
                      </svg>
                      <span className={`text-sm ${manifest.icons?.some(icon => icon.purpose === 'maskable') ? 'text-gray-600' : 'text-yellow-600'}`}>
                        Maskable Icons are {manifest.icons?.some(icon => icon.purpose === 'maskable') ? 'included' : 'recommended'}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className={`w-5 h-5 ${manifest.icons?.some(icon => icon.sizes === '512x512') ? 'text-green-500' : 'text-yellow-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {manifest.icons?.some(icon => icon.sizes === '512x512') ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        )}
                      </svg>
                      <span className={`text-sm ${manifest.icons?.some(icon => icon.sizes === '512x512') ? 'text-gray-600' : 'text-yellow-600'}`}>
                        512x512 Icon is {manifest.icons?.some(icon => icon.sizes === '512x512') ? 'included' : 'recommended'}
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleCopyJson}
                    className="flex-1 px-4 py-3 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
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
                        Copy Manifest JSON
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownload}
                    disabled={!manifest.name || !manifest.short_name || !manifest.icons?.length || !manifest.background_color || !manifest.theme_color}
                    className={`flex-1 px-4 py-3 text-sm rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      !manifest.name || !manifest.short_name || !manifest.icons?.length || !manifest.background_color || !manifest.theme_color
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Files
                  </button>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">How to use these files:</h4>
                  <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                    <li>Place the <code className="bg-blue-100 px-1 py-0.5 rounded">manifest.json</code> file in the root directory of your website</li>
                    <li>If you're using Next.js, place the <code className="bg-blue-100 px-1 py-0.5 rounded">manifest.json</code> in the <code className="bg-blue-100 px-1 py-0.5 rounded">public</code> folder</li>
                    <li>Create a <code className="bg-blue-100 px-1 py-0.5 rounded">site_icons</code> folder in the same directory and place all icon files there</li>
                    <li>Place the <code className="bg-blue-100 px-1 py-0.5 rounded">favicon.ico</code> and <code className="bg-blue-100 px-1 py-0.5 rounded">favicon.png</code> in the root directory</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer className="py-4 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-500">
          All Vibe-Coded with AI · <a href="http://www.buraktokak.com/" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700 transition-colors">buraktokak.com</a>
        </div>
      </footer>
    </>
  );
}
