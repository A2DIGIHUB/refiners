import React, { useEffect, useState } from 'react';
import { listFiles, deleteFile, getPublicUrl } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type MediaFile = Database['public']['Tables']['media_files']['Row'];

export function FileGallery() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'created_at' | 'size' | 'name'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadFiles();
  }, [sortBy, sortOrder, search]);

  const loadFiles = async () => {
    try {
      const { data, error } = await listFiles('media', {
        sortBy,
        order: sortOrder,
        search,
      });
      if (error) throw error;
      setFiles(data || []);
    } catch (err) {
      console.error('Error loading files:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, path: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    try {
      const { error } = await deleteFile('media', path);
      if (error) throw error;
      setFiles(files.filter(f => f.id !== id));
    } catch (err) {
      console.error('Error deleting file:', err);
    }
  };

  const formatFileSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search files..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg border border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="px-4 py-2 rounded-lg border border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="created_at">Date</option>
          <option value="size">Size</option>
          <option value="name">Name</option>
        </select>
        <button
          onClick={() => setSortOrder(order => order === 'asc' ? 'desc' : 'asc')}
          className="px-4 py-2 rounded-lg bg-primary-100 text-primary-700 hover:bg-primary-200"
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </button>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {files.map((file) => (
          <div key={file.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Preview */}
            <div className="aspect-w-16 aspect-h-9 bg-primary-50">
              {file.mime_type.startsWith('image/') ? (
                <img
                  src={getPublicUrl('media', file.path)}
                  alt={file.title || file.path}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="flex items-center justify-center">
                  <span className="text-primary-400">
                    {file.mime_type.split('/')[1].toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* File Info */}
            <div className="p-4">
              <h3 className="font-medium text-primary-900 truncate">
                {file.title || file.path.split('/').pop()}
              </h3>
              <div className="mt-1 text-sm text-primary-500">
                <p>{formatFileSize(file.size)}</p>
                <p>{formatDate(file.created_at)}</p>
              </div>
              
              {/* Actions */}
              <div className="mt-4 flex justify-end gap-2">
                <a
                  href={getPublicUrl('media', file.path)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 text-sm rounded-md bg-primary-100 text-primary-700 hover:bg-primary-200"
                >
                  View
                </a>
                <button
                  onClick={() => handleDelete(file.id, file.path)}
                  className="px-3 py-1 text-sm rounded-md bg-red-100 text-red-700 hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {files.length === 0 && (
        <div className="text-center py-12 text-primary-500">
          No files found. Upload some files to get started!
        </div>
      )}
    </div>
  );
}