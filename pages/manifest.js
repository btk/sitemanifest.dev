import { useState } from 'react';
import { useStore } from '../store';
import { generateManifest } from '../utils/manifestGenerator';

export default function Manifest() {
  const [image, setImage] = useState(null);
  const [manifest, setManifest] = useState(null);
  const [error, setError] = useState(null);
  const themeColor = useStore((state) => state.themeColor);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      try {
        const manifestData = await generateManifest(URL.createObjectURL(file), themeColor);
        setManifest(manifestData);
        setError(null);
      } catch (err) {
        setError('Failed to generate manifest. Please try again.');
        setManifest(null);
      }
    }
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

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
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
          <h2 className="text-xl font-semibold mb-2">Generated Manifest</h2>
          <pre className="bg-white p-4 rounded overflow-auto">
            {JSON.stringify(manifest, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 