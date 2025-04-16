import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { HexColorPicker } from 'react-colorful';
import { DevicePhoneIcon, ComputerDesktopIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { useManifestStore } from '../store/useManifestStore';

export default function Home() {
  const { manifest, setManifest, processImage, validate, errors, isLoading } = useManifestStore();
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        processImage(acceptedFiles[0]);
      }
    }
  });

  useEffect(() => {
    validate();
  }, [manifest]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">PWA Manifest Generator</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {errors.length > 0 && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {errors.map((error, index) => (
                    <span key={index} className="block">{error}</span>
                  ))}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Manifest Form */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Manifest Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">App Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={manifest.name}
                  onChange={(e) => setManifest({ name: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Short Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={manifest.short_name}
                  onChange={(e) => setManifest({ short_name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  rows={3}
                  value={manifest.description}
                  onChange={(e) => setManifest({ description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Theme Color</label>
                <div className="mt-1 flex items-center space-x-4">
                  <div className="w-8 h-8 rounded border border-gray-300" style={{ backgroundColor: manifest.theme_color }} />
                  <HexColorPicker 
                    color={manifest.theme_color} 
                    onChange={(color) => setManifest({ theme_color: color })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">App Icon</label>
                <div
                  {...getRootProps()}
                  className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-indigo-500"
                >
                  <div className="space-y-1 text-center">
                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <span className="relative rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                        Upload a file
                      </span>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 10MB</p>
                  </div>
                  <input {...getInputProps()} />
                </div>
                {isLoading && (
                  <div className="mt-2 text-sm text-gray-500">Processing image...</div>
                )}
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Preview</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={`p-2 rounded ${previewMode === 'desktop' ? 'bg-indigo-100' : 'bg-gray-100'}`}
                >
                  <ComputerDesktopIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={`p-2 rounded ${previewMode === 'mobile' ? 'bg-indigo-100' : 'bg-gray-100'}`}
                >
                  <DevicePhoneIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className={`border rounded-lg p-4 ${previewMode === 'mobile' ? 'max-w-sm mx-auto' : ''}`}>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  {manifest.icons.length > 0 && (
                    <img
                      src={manifest.icons[0].src}
                      alt="App icon"
                      className="w-16 h-16 rounded-lg"
                    />
                  )}
                  <div>
                    <h3 className="text-lg font-medium">{manifest.name}</h3>
                    <p className="text-sm text-gray-500">{manifest.description}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <button
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    style={{ backgroundColor: manifest.theme_color }}
                  >
                    Install App
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 