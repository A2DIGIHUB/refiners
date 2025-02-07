import React, { useState } from 'react';
import { uploadFile, getPublicUrl } from '../lib/supabase';

export function MediaUpload() {
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const { data, error } = await uploadFile(
        'media', // bucket name
        'uploads', // folder path
        file,
        (progress) => {
          console.log(`Upload progress: ${progress}%`);
        }
      );

      if (error) throw error;
      if (data) {
        const url = getPublicUrl('media', data.path);
        setUploadedUrl(url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <input
          type="file"
          onChange={handleUpload}
          disabled={uploading}
          className="block w-full text-sm text-primary-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-primary-50 file:text-primary-700
            hover:file:bg-primary-100"
        />
      </div>

      {uploading && (
        <div className="text-primary-600">Uploading...</div>
      )}

      {error && (
        <div className="text-red-600">{error}</div>
      )}

      {uploadedUrl && (
        <div className="mt-4">
          <p className="text-primary-700">Upload complete!</p>
          <a 
            href={uploadedUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-800 underline"
          >
            View uploaded file
          </a>
        </div>
      )}
    </div>
  );
}