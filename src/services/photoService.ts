export interface PhotoMetadata {
  date?: string;
  time?: string;
  latitude?: number;
  longitude?: number;
}

// EXIF extraction (simple version - dans une vraie app on userait piexifjs)
export async function extractExifData(file: File): Promise<PhotoMetadata> {
  const metadata: PhotoMetadata = {};

  // Try to extract date from file
  if (file.lastModified) {
    const date = new Date(file.lastModified);
    metadata.date = date.toISOString().split('T')[0];
    metadata.time = date.toTimeString().split(' ')[0];
  }

  // Note: Full EXIF extraction requires a library like piexifjs
  // This is a basic implementation
  return metadata;
}

// Compress image to WebP
export async function compressImage(file: File, maxWidth = 1920, quality = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Resize if needed
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) reject(new Error('Cannot get canvas context'));
        ctx!.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Cannot compress image'));
          },
          'image/webp',
          quality
        );
      };
      img.onerror = () => reject(new Error('Cannot load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Cannot read file'));
    reader.readAsDataURL(file);
  });
}

export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = () => reject(new Error('Cannot load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Cannot read file'));
    reader.readAsDataURL(file);
  });
}

export async function processPhotoFile(file: File) {
  const exifData = await extractExifData(file);
  const compressedBlob = await compressImage(file);
  const dimensions = await getImageDimensions(file);

  return {
    blob: compressedBlob,
    metadata: exifData,
    dimensions,
  };
}
