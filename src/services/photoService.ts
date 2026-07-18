// Extrait la date de prise de vue et les coordonnées GPS depuis les
// métadonnées EXIF d'une photo, quand elles existent (core.txt : "Les
// données EXIF servent uniquement à pré-remplir les champs. Toutes
// les informations restent modifiables.").
export interface PhotoMetadata {
  date?: string; // ISO
  latitude?: number;
  longitude?: number;
}

export async function extractPhotoMetadata(file: File): Promise<PhotoMetadata> {
  try {
    const exifr = await import('exifr');
    const tags = await exifr.parse(file, { gps: true, pick: ['DateTimeOriginal', 'CreateDate', 'latitude', 'longitude'] });
    if (!tags) return {};
    const rawDate: Date | undefined = tags.DateTimeOriginal || tags.CreateDate;
    return {
      date: rawDate instanceof Date && !isNaN(rawDate.getTime()) ? rawDate.toISOString() : undefined,
      latitude: typeof tags.latitude === 'number' ? tags.latitude : undefined,
      longitude: typeof tags.longitude === 'number' ? tags.longitude : undefined,
    };
  } catch {
    // Pas de métadonnées, ou format non lisible (ex: capture d'écran) : silencieux.
    return {};
  }
}

// Convertit des coordonnées GPS en nom de ville via OpenStreetMap
// (Nominatim, gratuit, sans clé). Best-effort : renvoie undefined en
// cas d'échec plutôt que de bloquer la création de l'instant.
export async function reverseGeocodeCity(latitude: number, longitude: number): Promise<string | undefined> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
    );
    if (!res.ok) return undefined;
    const data = await res.json();
    const addr = data?.address || {};
    return addr.city || addr.town || addr.village || addr.municipality || addr.county || undefined;
  } catch {
    return undefined;
  }
}
// format WebP, qualité 80-85 %. ⚠️ Le bucket Supabase "photo_moment"
// doit autoriser le type MIME "image/webp" (Storage → bucket → Edit →
// Allowed MIME types), sinon l'upload échouera.
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
