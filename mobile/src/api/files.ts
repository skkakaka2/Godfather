import {post} from './client';

type UploadImageFile = {
  uri: string;
  name: string;
  type: string;
};

export type FileUpload = {
  fileName: string;
  originalName: string;
  url: string;
  size: number;
  contentType: string;
};

export const fileApi = {
  uploadImage(file: UploadImageFile) {
    const formData = new FormData();
    formData.append('file', file as unknown as Blob);

    return post<FileUpload>('/api/v1/files/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
