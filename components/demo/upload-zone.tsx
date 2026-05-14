'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

export function UploadZone({ onFileSelect, isLoading }: UploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setIsDragActive(false);
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    disabled: isLoading,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'relative w-full h-64 rounded-lg border-2 border-dashed transition-all cursor-pointer flex items-center justify-center',
        isDragActive
          ? 'border-border-glow bg-border-glow/10 ring-2 ring-border-glow/50'
          : 'border-border hover:border-border-glow/50 bg-surface-2/30',
        isLoading && 'opacity-50 cursor-not-allowed'
      )}
      onDragEnter={() => setIsDragActive(true)}
      onDragLeave={() => setIsDragActive(false)}
    >
      <input {...getInputProps()} />
      <div className="text-center">
        <Upload
          className={cn(
            'w-12 h-12 mx-auto mb-3 transition-colors',
            isDragActive ? 'text-border-glow' : 'text-text-secondary'
          )}
        />
        <p className="text-lg font-medium text-text-primary">
          Drop your receipt here
        </p>
        <p className="text-sm text-text-secondary mt-1">
          or click to select an image
        </p>
      </div>
    </div>
  );
}
