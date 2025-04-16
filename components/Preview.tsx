import { useState } from 'react';
import { cn } from '../utils/cn';
import { DevicePhoneIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { Manifest } from '../types/manifest';

export interface PreviewProps {
  manifest: Manifest;
  className?: string;
}

export function Preview({ manifest, className }: PreviewProps) {
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Preview</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setPreviewMode('desktop')}
            className={cn(
              'p-2 rounded',
              previewMode === 'desktop' ? 'bg-primary-100' : 'bg-gray-100'
            )}
          >
            <ComputerDesktopIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => setPreviewMode('mobile')}
            className={cn(
              'p-2 rounded',
              previewMode === 'mobile' ? 'bg-primary-100' : 'bg-gray-100'
            )}
          >
            <DevicePhoneIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        className={cn(
          'border rounded-lg p-4 bg-white shadow-sm',
          previewMode === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'
        )}
      >
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
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              style={{ backgroundColor: manifest.theme_color }}
            >
              Install App
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 