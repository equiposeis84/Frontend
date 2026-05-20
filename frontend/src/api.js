import axios from 'axios';

// Instancia de axios configurada para enviar cookies de sesión
const api = axios.create({
  withCredentials: true
});

export default api;
