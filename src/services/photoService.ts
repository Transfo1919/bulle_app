// Compresse une photo côté client avant envoi : largeur max ~1920px,
// format WebP, qualité 80-85 %. Réduit fortement le poids des photos
// prises directement au téléphone, sans dégrader la qualité perçue.
const MAX_WIDTH = 1920;
const QUALITY = 0.82;

export async function compressPhoto(file: File): Promise<File> {
  // Les GIF/SVG ne se prêtent pas à cette compression, on les laisse tels quels.
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_WIDTH / bitmap.width);
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, 'image/webp', QUALITY)
    );
    if (!blob) return file;

    const newName = file.name.replace(/\.[^.]+$/, '') + '.webp';
    return new File([blob], newName, { type: 'image/webp' });
  } catch {
    // En cas d'échec (navigateur non compatible, etc.), on envoie l'original.
    return file;
  }
}
