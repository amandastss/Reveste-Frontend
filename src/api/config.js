import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL ?? 'https://reveste-backend.class.fabricadesoftware.ifc.edu.br';


const api = axios.create({
  baseURL: `${API_BASE}/api`,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

// export default axios.create({
//   baseURL: `${API_BASE}/api`,
// });
