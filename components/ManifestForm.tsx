import { Manifest } from '../types/manifest';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { ColorPicker } from './ColorPicker';
import { Dropzone } from './Dropzone';
import { cn } from '../utils/cn';

export interface ManifestFormProps {
  manifest: Manifest;
  onManifestChange: (manifest: Partial<Manifest>) => void;
  onImageDrop: (files: File[]) => void;
  isLoading?: boolean;
  className?: string;
}

export function ManifestForm({
  manifest,
  onManifestChange,
  onImageDrop,
  isLoading,
  className,
}: ManifestFormProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <Input
        label="App Name"
        value={manifest.name}
        onChange={(e) => onManifestChange({ name: e.target.value })}
      />

      <Input
        label="Short Name"
        value={manifest.short_name}
        onChange={(e) => onManifestChange({ short_name: e.target.value })}
      />

      <Textarea
        label="Description"
        value={manifest.description}
        onChange={(e) => onManifestChange({ description: e.target.value })}
        rows={3}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Theme Color
        </label>
        <div className="flex items-center space-x-4">
          <ColorPicker
            value={manifest.theme_color}
            onChange={(color) => onManifestChange({ theme_color: color })}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          App Icon
        </label>
        <Dropzone
          onDrop={onImageDrop}
          accept={{
            'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
          }}
          maxFiles={1}
          maxSize={10 * 1024 * 1024} // 10MB
        />
        {isLoading && (
          <div className="mt-2 text-sm text-gray-500">Processing image...</div>
        )}
      </div>
    </div>
  );
} 