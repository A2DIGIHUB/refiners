import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Create a single supabase client for interacting with your database
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please click "Connect to Supabase" button to set up your project.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Enhanced file upload helper with retry logic and chunked upload support
export async function uploadFile(
  bucket: string,
  path: string,
  file: File,
  onProgress?: (progress: number) => void,
  retries = 3
): Promise<{ data: { path: string } | null; error: Error | null }> {
  const maxChunkSize = 5 * 1024 * 1024; // 5MB chunks

  try {
    const fileExt = file.name.split('.').pop();
    const filePath = `${path}/${crypto.randomUUID()}.${fileExt}`;

    // For large files, use chunked upload
    if (file.size > maxChunkSize) {
      return await uploadLargeFile(bucket, filePath, file, onProgress, maxChunkSize);
    }

    // Regular upload with retry logic
    let attempt = 0;
    while (attempt < retries) {
      try {
        const { error: uploadError, data } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            onUploadProgress: (progress) => {
              const percentage = (progress.loaded / progress.total) * 100;
              onProgress?.(percentage);
            },
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;
        return { data: { path: filePath }, error: null };
      } catch (error) {
        attempt++;
        if (attempt === retries) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }

    throw new Error('Upload failed after retries');
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

// Helper function for chunked upload of large files
async function uploadLargeFile(
  bucket: string,
  filePath: string,
  file: File,
  onProgress?: (progress: number) => void,
  chunkSize: number
): Promise<{ data: { path: string } | null; error: Error | null }> {
  try {
    const chunks = Math.ceil(file.size / chunkSize);
    let uploadedChunks = 0;

    for (let i = 0; i < chunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);

      const { error } = await supabase.storage
        .from(bucket)
        .upload(`${filePath}_part${i}`, chunk, {
          onUploadProgress: (progress) => {
            const totalProgress = ((uploadedChunks + progress.loaded / progress.total) / chunks) * 100;
            onProgress?.(totalProgress);
          }
        });

      if (error) throw error;
      uploadedChunks++;
    }

    // Merge chunks (implementation depends on your backend setup)
    const { error: mergeError } = await supabase.functions.invoke('merge-chunks', {
      body: { bucket, filePath, chunks }
    });

    if (mergeError) throw mergeError;

    return { data: { path: filePath }, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

// Enhanced file URL getter with optional transformations
export function getPublicUrl(
  bucket: string,
  path: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
  }
): string {
  const baseUrl = supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  
  if (!options) return baseUrl;

  const params = new URLSearchParams();
  if (options.width) params.append('width', options.width.toString());
  if (options.height) params.append('height', options.height.toString());
  if (options.quality) params.append('quality', options.quality.toString());
  if (options.format) params.append('format', options.format);

  return `${baseUrl}?${params.toString()}`;
}

// Enhanced delete with cleanup
export async function deleteFile(bucket: string, path: string) {
  const { error: deleteError } = await supabase.storage.from(bucket).remove([path]);
  
  if (!deleteError) {
    // Clean up database record
    await supabase
      .from('media_files')
      .delete()
      .match({ bucket, path });
  }

  return { error: deleteError };
}

// List files with pagination
export async function listFiles(
  bucket: string,
  options?: {
    limit?: number;
    offset?: number;
    search?: string;
    sortBy?: 'created_at' | 'size' | 'name';
    order?: 'asc' | 'desc';
  }
) {
  const {
    limit = 10,
    offset = 0,
    search,
    sortBy = 'created_at',
    order = 'desc'
  } = options ?? {};

  const query = supabase
    .from('media_files')
    .select('*')
    .eq('bucket', bucket)
    .order(sortBy, { ascending: order === 'asc' })
    .range(offset, offset + limit - 1);

  if (search) {
    query.ilike('path', `%${search}%`);
  }

  return await query;
}

// Test Supabase connection
export async function testConnection() {
  try {
    const { data, error } = await supabase.from('sermons').select('count').single();
    if (error) throw error;
    console.log('Successfully connected to Supabase!');
    return { success: true, error: null };
  } catch (error) {
    console.error('Error connecting to Supabase:', error);
    return { success: false, error };
  }
}