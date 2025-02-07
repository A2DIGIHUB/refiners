import React, { useState, useCallback } from 'react';
import { uploadFile, getPublicUrl } from '../lib/supabase';

interface FileUploadProps {
  bucket: string;
  path: string;
  allowedTypes?: string[];
  maxSize?: number;
  multiple?: boolean;
  onUploadComplete: (urls: string[]) => void;
  onError: (error: string) => void;
}

export function FileUpload({
  bucket,
  path,
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  maxSize = 50 * 1024 * 1024, // 50MB default
  multiple = false,
  onUploadComplete,
  onError,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<Record<string, number>>({});

  const validateFile = useCallback((file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return `Invalid file type for ${file.name}. Allowed types: ${allowedTypes.join(', ')}`;
    }
    if (file.size > maxSize) {
      return `File ${file.name} is too large. Maximum size: ${maxSize / 1024 / 1024}MB`;
    }
    return null;
  }, [allowedTypes, maxSize]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate all files first
    const errors = files.map(validateFile).filter(Boolean);
    if (errors.length > 0) {
      onError(errors.join('\n'));
      return;
    }

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      await Promise.all(
        files.map(async (file) => {
          const { data, error } = await uploadFile(
            bucket,
            path,
            file,
            (progress) => {
              setProgress(prev => ({
                ...prev,
                [file.name]: progress
              }));
            }
          );

          if (error) throw error;
          if (!data) throw new Error(`Upload failed for ${file.name}`);

          const url = getPublicUrl(bucket, data.path);
          uploadedUrls.push(url);
        })
      );

      onUploadComplete(uploadedUrls);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
      setProgress({});
    }
  };

  return (
    <div className="w-full">
      <div className="relative">
        <label className="block">
          <span className="sr-only">Choose file{multiple ? 's' : ''}</span>
          <input
            type="file"
            className="block w-full text-sm text-primary-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-primary-50 file:text-primary-700
              hover:file:bg-primary-100
              disabled:opacity-50 disabled:cursor-not-allowed"
            onChange={handleFileChange}
            accept={allowedTypes.join(',')}
            multiple={multiple}
            disabled={uploading}
          />
        </label>

        {uploading && Object.entries(progress).map(([fileName, value]) => (
          <div key={fileName} className="mt-2">
            <div className="flex justify-between text-sm text-primary-600 mb-1">
              <span className="truncate">{fileName}</span>
              <span>{Math.round(value)}%</span>
            </div>
            <div className="w-full bg-primary-100 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-2 text-sm text-primary-600">
        {multiple ? 'Drop files here or click to upload' : 'Drop a file here or click to upload'}
      </p>
      <p className="text-xs text-primary-500">
        Maximum file size: {maxSize / 1024 / 1024}MB
      </p>
    </div>
  );
}