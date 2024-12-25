import { VITE_API_URL } from '@/lib/config.ts';

export const uploadFile = async (file: File | null) => {
  if (!file) {
    throw new Error('No file provided');
  }
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${VITE_API_URL}/upload`, {
    method: 'POST',
    body: formData,
  });
  return (await response.json()) as Promise<{ cid: string }>;
};
