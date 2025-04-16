import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { HexColorPicker } from 'react-colorful';
import { generateManifest } from '../utils/manifestGenerator';
import { crawlWebsite } from '../utils/websiteCrawler';

export default function Home() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [manifest, setManifest] = useState(null);
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [websiteDetails, setWebsiteDetails] = useState(null);
  const [copied, setCopied] = useState(false);

  const onDrop = async (acceptedFiles) => {
    setLoading(true);
    setError(null);
    try {
      const file = acceptedFiles[0];
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
      
      const { manifest: generatedManifest, dominantColor } = await generateManifest(file);
      setManifest(generatedManifest);
      setSelectedColor(dominantColor);
    } catch (err) {
      setError(err.message);
      setImage(null);
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxFiles: 1,
    multiple: false
  });

  const handleWebsiteCrawl = async () => {
    if (!websiteUrl) return;
    
    setLoading(true);
    setError(null);
    try {
      const details = await crawlWebsite(websiteUrl);
      setWebsiteDetails(details);
      
      if (manifest) {
        setManifest({
          ...manifest,
          name: details.name,
          short_name: details.short_name,
          description: details.description,
          start_url: details.start_url
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(manifest, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
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
                    onClick={handleWebsiteCrawl}
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
          </div>

          {/* Icon Upload Section - Only show after fetching website details */}
          {websiteDetails && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Step 2: Upload Icon</h2>
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
                    <p className="text-sm text-gray-500">Supported formats: PNG, JPG, JPEG, GIF</p>
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
          )}

          {/* Theme Color Section - Only show after icon upload */}
          {image && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Step 3: Choose Theme Color</h2>
              <div className="flex flex-col items-center space-y-4">
                <HexColorPicker
                  color={selectedColor}
                  onChange={setSelectedColor}
                  className="mx-auto"
                />
                <div className="flex items-center space-x-2">
                  <div
                    className="w-8 h-8 rounded-full border border-gray-300"
                    style={{ backgroundColor: selectedColor }}
                  />
                  <span className="font-mono text-sm text-gray-600">{selectedColor}</span>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Manifest Display - Only show after all steps are complete */}
          {manifest && (
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
                    __html: JSON.stringify(manifest, null, 2)
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
          )}
        </div>
      </div>
    </div>
  );
}
