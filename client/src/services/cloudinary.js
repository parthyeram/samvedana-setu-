const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const cloudinaryConfigured = Boolean(cloudName && uploadPreset);

export async function uploadImage(file) {
  if (!cloudinaryConfigured) return null;
  const body = new FormData();
  body.append('file', file);
  body.append('upload_preset', uploadPreset);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body });
  if (!response.ok) throw new Error('Cloudinary upload failed');
  const data = await response.json();
  return { url: data.secure_url, publicId: data.public_id, width: data.width, height: data.height, format: data.format };
}
