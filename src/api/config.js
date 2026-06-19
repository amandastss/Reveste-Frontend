import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL ?? 'https://reveste-backend.class.fabricadesoftware.ifc.edu.br';

export default axios.create({
  baseURL: `${API_BASE}/api`,
});
