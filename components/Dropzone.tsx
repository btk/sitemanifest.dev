import { useDropzone } from 'react-dropzone';
import { cn } from '../utils/cn';
import { PhotoIcon } from '@heroicons/react/24/outline';

export interface DropzoneProps {
  onDrop: (acceptedFiles: File[]) => void;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
  className?: string;
}

export function Dropzone({
  onDrop,
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
  },
  maxFiles = 1,
  maxSize = 10 * 1024 * 1024, // 10MB
  className,
}: DropzoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-primary-500',
        isDragActive && 'border-primary-500 bg-primary-50',
        className
      )}
    >
      <div className="space-y-1 text-center">
        <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
        <div className="flex text-sm text-gray-600">
          <span className="relative rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none">
            Upload a file
          </span>
          <p className="pl-1">or drag and drop</p>
        </div>
        <p className="text-xs text-gray-500">
          PNG, JPG, WEBP up to 10MB
        </p>
      </div>
      <input {...getInputProps()} />
    </div>
  );
} 