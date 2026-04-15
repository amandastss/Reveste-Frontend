import { defineStore } from 'pinia';
import { getProduto } from '../api/tasksApi';

export const useProdutotore = defineStore('produto', {
  state: () => ({
    Produto: [],
  }),

  actions: {
    async fetchProduto() {
      const response = await getProduto();
      this.Produto = response.data;
    },
  },
});