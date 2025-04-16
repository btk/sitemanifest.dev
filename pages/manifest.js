import { useState } from 'react';
import { useStore } from '../store';
import { generateManifest } from '../utils/manifestGenerator';

export default function Manifest() {
  const [image, setImage] = useState(null);
  const [manifest, setManifest] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customShortName, setCustomShortName] = useState('');
  const themeColor = useStore((state) => state.themeColor);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      setImage(URL.createObjectURL(file));
      setLoading(true);
      setError(null);

      try {
        const manifestData = await generateManifest(URL.createObjectURL(file), themeColor);
        // Update manifest with custom names if provided
        if (customName) manifestData.name = customName;
        if (customShortName) manifestData.short_name = customShortName;
        setManifest(manifestData);
      } catch (err) {
        setError('Failed to generate manifest. Please try again.');
        setManifest(null);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDownload = () => {
    if (!manifest) return;
    
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'manifest.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">PWA Manifest Generator</h1>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Icon
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            App Name
          </label>
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="My Progressive Web App"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Short Name
          </label>
          <input
            type="text"
            value={customShortName}
            onChange={(e) => setCustomShortName(e.target.value)}
            placeholder="My PWA"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Generating manifest...</span>
        </div>
      )}

      {image && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Preview</h2>
          <img src={image} alt="Icon preview" className="w-32 h-32 object-contain" />
        </div>
      )}

      {manifest && (
        <div className="bg-gray-100 p-4 rounded">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">Generated Manifest</h2>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Download
            </button>
          </div>
          <pre className="bg-white p-4 rounded overflow-auto">
            {JSON.stringify(manifest, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 