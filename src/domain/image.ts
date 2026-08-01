// Reference images are embedded directly in the project JSON as base64 data
// URLs (see PlaygroundItemSchema.imageData) rather than saved to a sidecar
// folder, so the project stays a single portable file - the explicit
// trade-off accepted for this feature (see the 2026-08 vault decision on
// playground image pinning). Downscaling before encoding is what keeps that
// trade-off workable: an unmodified phone photo can be 5-10 MB, and a
// project file with a handful of those would make every save/load/undo
// snapshot heavy. Capping the longest edge and re-encoding as JPEG keeps a
// typical reference image under ~200 KB while staying legible for the
// mood-board use case (nobody is pixel-peeping a reference screenshot).
const MAX_DIMENSION = 1000;
const JPEG_QUALITY = 0.82;
export const MAX_SOURCE_FILE_BYTES = 8 * 1024 * 1024;

export async function readImageAsDataUrl(file: File): Promise<string> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = objectUrl;
    await image.decode();
    const scale = Math.min(1, MAX_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(image.naturalWidth * scale);
    canvas.height = Math.round(image.naturalHeight * scale);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas 2D context unavailable');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
