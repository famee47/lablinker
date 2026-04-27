import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000, // 30s for cold start
})

// Retry logic — retries once on network error or 503 (Render cold start)
const retryRequest = async (error) => {
  const config = error.config
  if (config._retried) return Promise.reject(error)
  const shouldRetry = !error.response || error.response.status === 503 || error.code === 'ECONNABORTED'
  if (!shouldRetry) return Promise.reject(error)
  config._retried = true
  // Wait 3 seconds then retry
  await new Promise(resolve => setTimeout(resolve, 3000))
  return api(config)
}

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('lablink_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Try retry first
    try {
      return await retryRequest(error)
    } catch (retryError) {
      const message = retryError.response?.data?.message || 'Something went wrong'
      if (retryError.response?.status === 401) {
        localStorage.removeItem('lablink_token')
        localStorage.removeItem('lablink_user')
        window.location.href = '/login'
      } else if (retryError.code === 'ECONNABORTED') {
        toast.error('Server is waking up, please try again in a moment...')
      } else if (retryError.response?.status !== 404) {
        toast.error(message)
      }
      return Promise.reject(retryError)
    }
  }
)

export default api
