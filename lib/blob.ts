import { put, del, list } from '@vercel/blob';

export async function uploadImage(file: File, folder: string = 'products'): Promise<string> {
  const filename = `${folder}/${Date.now()}-${file.name}`;
  const blob = await put(filename, file, {
    access: 'public',
  });
  return blob.url;
}

export async function deleteImage(url: string): Promise<void> {
  try {
    await del(url);
  } catch (error) {
    console.error('Error deleting image:', error);
  }
}

export async function listImages(folder: string = 'products') {
  const { blobs } = await list({ prefix: folder });
  return blobs;
}
