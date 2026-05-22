import axios from 'axios';

// Instancia global con credenciales para que la httpOnly cookie viaje en cada request
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  withCredentials: true,
});

// Interceptor: si el backend devuelve 401 (token expirado/inválido),
// limpia la sesión local y redirige al login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      window.location.pathname !== '/login' &&
      window.location.pathname !== '/register'
    ) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
