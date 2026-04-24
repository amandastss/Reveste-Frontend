import api from './config';

export function getProduto() {
  return api.get('/Produto/');
}

export function createProduto(data) {
  return api.post('/Produto/', data);
}

export function updateProduto(id, data) {
  return api.put(`/Produto/${id}/`, data);
}

export function deleteProduto(id) {
  return api.delete(`/Produto/${id}/`);
}
