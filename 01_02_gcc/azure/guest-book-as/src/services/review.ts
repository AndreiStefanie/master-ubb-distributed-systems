import http from '@/clients/http';
import type { Review } from '@/models/review';

export const create = (
  author: string,
  comment: string,
  image: Blob,
  onUploadProgress: (event: ProgressEvent) => void
) => {
  const formData = new FormData();
  formData.append('image', image);
  formData.append('review', JSON.stringify({ author, comment }));

  return http.post('/reviews', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });
};

export const get = async (): Promise<Review[]> => {
  const response = await http.get('/reviews');
  return response.data.map((r: any) => ({
    ...r,
    timestamp: new Date(r.timestamp),
  }));
};
