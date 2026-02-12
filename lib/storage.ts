import { supabase } from './supabase';

export interface UploadResult {
  public_url: string;
  path: string;
  bucket: string;
}

/**
 * Upload image to Supabase Storage
 */
export async function uploadImage(file: File | string): Promise<UploadResult> {
  try {
    let fileToUpload: File;

    // Convert base64 to File if needed
    if (typeof file === 'string') {
      const base64Data = file.split(',')[1];
      const mimeType = file.split(',')[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
      const blob = await fetch(`data:${mimeType};base64,${base64Data}`).then(res => res.blob());
      fileToUpload = new File([blob], `receipt-${Date.now()}.jpg`, { type: mimeType });
    } else {
      fileToUpload = file;
    }

    // Generate unique filename
    const fileExt = fileToUpload.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `receipts/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('expense-images')
      .upload(filePath, fileToUpload, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error('Failed to upload image to Supabase Storage');
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('expense-images')
      .getPublicUrl(filePath);

    return {
      public_url: publicUrl,
      path: filePath,
      bucket: 'expense-images',
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error('Failed to upload image');
  }
}

/**
 * Delete image from Supabase Storage
 */
export async function deleteImage(filePath: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from('expense-images')
      .remove([filePath]);

    if (error) {
      console.error('Supabase delete error:', error);
      throw new Error('Failed to delete image from Supabase Storage');
    }

    return true;
  } catch (error) {
    console.error('Delete error:', error);
    throw new Error('Failed to delete image');
  }
}

/**
 * Get public URL for an image
 */
export function getPublicUrl(filePath: string): string {
  const { data: { publicUrl } } = supabase.storage
    .from('expense-images')
    .getPublicUrl(filePath);

  return publicUrl;
}
