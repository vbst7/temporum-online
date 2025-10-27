<template>
  <svg class="coin-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="11.5" fill="#FFD700" stroke="#DAA520" stroke-width="1"/>
    <text 
      x="12" 
      y="12.5" 
      text-anchor="middle" 
      dominant-baseline="central" 
      font-family="Arial, sans-serif"
      font-weight="bold" 
      :font-size="fontSize"
      fill="black"
    >
      {{ amount }}
    </text>
  </svg>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  amount: {
    type: [String, Number],
    required: true
  }
});

// Adjust font size for two-digit numbers to ensure they fit
const fontSize = computed(() => (String(props.amount).length > 1 ? 12 : 16));
</script>