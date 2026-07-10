<script setup lang="ts">
import { ref } from 'vue';

interface SizeOption {
  label: string;
  status: 'available' | 'out_of_stock' | 'low_stock';
  quantityLeft?: number;
}

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits(['close', 'sizeSelected']);

// Estado de Mock combinando com a sua imagem real
const sizes = ref<SizeOption[]>([
  { label: 'PP', status: 'available' },
  { label: 'P', status: 'available' },
  { label: 'M', status: 'available' },
  { label: 'G', status: 'available' },
  { label: 'GG', status: 'out_of_stock' },
  { label: 'XL', status: 'available' },
  { label: 'XXL', status: 'low_stock', quantityLeft: 3 },
]);

const currentSelected = ref<string>('XXL'); // Começa pré-selecionado igual ao print

const selectSize = (size: SizeOption) => {
  if (size.status === 'out_of_stock') return;
  currentSelected.value = size.label;
  emit('sizeSelected', size.label);
};
</script>

<template>
  <div v-if="isOpen" class="bottom-sheet-overlay" @click.self="emit('close')">
    <div class="bottom-sheet-content">
      <div class="drag-handle" @click="emit('close')"></div>

      <h3 class="sheet-title">SELECT SIZE</h3>

      <div class="sizes-list">
        <div
          v-for="size in sizes"
          :key="size.label"
          class="size-row"
          :class="{
            'is-selected': currentSelected === size.label,
            'is-disabled': size.status === 'out_of_stock'
          }"
          @click="selectSize(size)"
        >
          <span class="size-label" :style="currentSelected === size.label ? 'font-weight: bold;' : ''">
            {{ size.label }}
          </span>

          <span v-if="size.status === 'out_of_stock'" class="status-text text-muted">- Out of stock</span>
          <span v-if="size.status === 'low_stock'" class="status-text text-danger">- {{ size.quantityLeft }} items left</span>

          <span v-if="currentSelected === size.label" class="check-icon">✓</span>
        </div>
      </div>

      <div class="action-buttons">
        <button class="btn-secondary" @click="emit('close')">BUY NOW</button>
        <button class="btn-primary" @click="emit('close')">ADD TO CART</button>
      </div>
    </div>
  </div>
</template>
