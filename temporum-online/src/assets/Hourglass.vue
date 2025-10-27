<template>
  <svg 
    width="50" 
    height="80" 
    viewBox="0 0 50 80" 
    xmlns="http://www.w3.org/2000/svg">
    
    <!-- Wooden frame -->
    <rect x="5" y="2" width="40" height="6" fill="#8B4513" rx="1" />
    <rect x="5" y="72" width="40" height="6" fill="#8B4513" rx="1" />
    
    <!-- Side posts -->
    <rect x="5" y="8" width="4" height="64" fill="#654321" />
    <rect x="41" y="8" width="4" height="64" fill="#654321" />
    
    <!-- Glass container outline -->
    <path 
      d="M 12 8 L 25 35 L 25 45 L 12 72 L 38 72 L 25 45 L 25 35 L 38 8 Z" 
      fill="#E8F4F8" 
      stroke="#333" 
      stroke-width="1.5" />
    
    <!-- Sand in bottom -->
    <path 
      d="M 14 70 L 20 58 L 30 58 L 36 70 Z" 
      fill="#DEB887" />
    
    <!-- Sand in top -->
    <path 
      d="M 14 10 L 20 18 L 30 18 L 36 10 Z" 
      fill="#DEB887" />
    
    <!-- Sand falling (thin stream) -->
    <rect x="24" y="20" width="2" height="35" fill="#DEB887" opacity="0.6" />
    
    <!-- Decorative top cap -->
    <ellipse cx="25" cy="5" rx="8" ry="2" fill="#A0522D" />
    <ellipse cx="25" cy="75" rx="8" ry="2" fill="#A0522D" />
    
    <!-- Number overlay -->
    <g v-if="number !== null && number !== undefined">
      <circle cx="25" cy="40" r="16" fill="#9333ea" stroke="white" stroke-width="1.5" />
      <text 
        x="25" 
        y="40" 
        font-family="Arial, sans-serif" 
        font-size="24" 
        font-weight="bold" 
        fill="white" 
        text-anchor="middle" 
        dominant-baseline="central">
        {{ number }}
      </text>
    </g>
  </svg>
</template>

<script setup>
defineProps({
  number: {
    type: Number,
    default: null,
  }
});
</script>