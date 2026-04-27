// Cloudinary returns full URLs so fileUrl just passes them through
// For local fallback it prepends the API base
const API_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5000'

export const fileUrl = (path) => {
  if (!path) return ''
  // Already a full URL (Cloudinary) — return as is
  if (path.startsWith('http')) return path
  // Local path — prepend base
  return `${API_BASE}${path}`
}
