<template>
  <svg
    width="170"
    height="180"
    viewBox="0 0 170 180"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="tanGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#d4b896;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#c4a682;stop-opacity:1" />
      </linearGradient>
      <linearGradient id="tanGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#e8d4b8;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#d4b896;stop-opacity:1" />
      </linearGradient>
    </defs>
    
    <!-- Left tower dome roof -->
    <ellipse cx="55" cy="70" rx="35" ry="35" :fill="fill" stroke="#000" stroke-width="1.5"/>
    
    <!-- Left tower cylinder body - wider -->
    <rect x="20" y="70" width="70" height="110" fill="url(#tanGradient1)" stroke="#8b6f47" stroke-width="1.5"/>
    
    <!-- Right tower - shorter than left dome -->
    <rect x="100" y="120" width="50" height="60" fill="url(#tanGradient2)" stroke="#8b6f47" stroke-width="1.5"/>
    
    <!-- Right tower pointed roof -->
    <polygon points="125,65 100,120 150,120" :fill="fill" stroke="#000" stroke-width="2"/>
    
    <!-- Windows and details on right building -->
    <rect x="110" y="135" width="8" height="40" fill="#6b5635" stroke="#000" stroke-width="0"/>
    <rect x="132" y="135" width="8" height="40" fill="#6b5635" stroke="#000" stroke-width="0"/>
    
    <!-- Windows on left tower -->
    <rect x="35" y="100" width="8" height="62" fill="#6b5635" stroke="#000" stroke-width="0"/>
    <rect x="52" y="100" width="8" height="62" fill="#6b5635" stroke="#000" stroke-width="0"/>
    <rect x="69" y="100" width="8" height="62" fill="#6b5635" stroke="#000" stroke-width="0"/>
    
  </svg>
</template>

<script setup>
defineProps({
  fill: {
    type: String,
    default: '#8b6f47'
  }
});
</script>