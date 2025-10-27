<template>
  <svg 
    width="25.07745mm" 
    height="15.245059mm" 
    viewBox="0 0 25.07745 15.245059" 
    version="1.1" 
    xmlns="http://www.w3.org/2000/svg" 
    xmlns:svg="http://www.w3.org/2000/svg">
    <defs id="defs1" />
    <g id="layer1" transform="translate(-115.04996,-81.648085)">
      <!-- Roof -->
      <path 
        style="vector-effect:non-scaling-stroke;fill:#999999;fill-opacity:1;stroke:#000000;stroke-width:0" 
        d="m 123.72323,86.830668 -8.67327,0.08015 4.37226,-5.262733 z" 
        id="path1" />
      <path 
        :style="`vector-effect:non-scaling-stroke;fill:${fill};fill-opacity:1;stroke:#000000;stroke-width:0`" 
        d="m 123.72323,86.830668 -4.30101,-5.182583 h 16.40418 l 4.30101,5.182583 z" 
        id="path4" />
      
      <!-- Top bands -->
      <path 
        style="vector-effect:non-scaling-stroke;fill:#ececec;fill-opacity:1;stroke:#000000;stroke-width:0" 
        d="m 123.73583,88.22498 -0.0126,-1.394312 -8.67327,0.08015 0.49971,1.314162 z" 
        id="path5" />
      <rect 
        style="vector-effect:non-scaling-stroke;fill:#fce3bb;fill-opacity:1;stroke:#000000;stroke-width:0" 
        id="rect16" 
        width="16.391579" 
        height="1.394312" 
        x="123.73583" 
        y="86.830666" />
      
      <!-- Bottom bands -->
      <path 
        style="vector-effect:non-scaling-stroke;fill:#ececec;fill-opacity:1;stroke:#000000;stroke-width:0" 
        d="m 123.73583,96.893138 -0.0126,-1.394312 -8.1441,0.08015 -0.0295,1.314162 z" 
        id="path17" />
      <rect 
        style="vector-effect:non-scaling-stroke;fill:#fce3bb;fill-opacity:1;stroke:#000000;stroke-width:0" 
        id="rect17" 
        width="16.391579" 
        height="1.394312" 
        x="123.73583" 
        y="95.498833" />
      
      <!-- Building faces -->
      <path 
        style="vector-effect:non-scaling-stroke;fill:#999999;fill-opacity:1;stroke:#000000;stroke-width:0" 
        d="m 123.73583,95.498831 v -7.273853 l -8.18616,2e-6 0.0295,7.353996 z" 
        id="path18" />
      <path 
        style="vector-effect:non-scaling-stroke;fill:#c39570;fill-opacity:1;stroke:#000000;stroke-width:0" 
        d="m 140.12741,88.224975 v 7.273856 l -16.40418,-5e-6 0.0126,-7.27385 z" 
        id="path19" />
      
      <!-- Left side columns (darker) -->
      <rect style="fill:#666666;fill-opacity:1;stroke:none" width="0.8" height="7.27" x="116.5" y="88.225" />
      <rect style="fill:#666666;fill-opacity:1;stroke:none" width="0.8" height="7.27" x="118.3" y="88.225" />
      <rect style="fill:#666666;fill-opacity:1;stroke:none" width="0.8" height="7.27" x="120.1" y="88.225" />
      <rect style="fill:#666666;fill-opacity:1;stroke:none" width="0.8" height="7.27" x="121.9" y="88.225" />
      
      <!-- Right side columns (lighter) -->
      <rect style="fill:#fce3bb;fill-opacity:1;stroke:none" width="0.9" height="7.27" x="125.2" y="88.225" />
      <rect style="fill:#fce3bb;fill-opacity:1;stroke:none" width="0.9" height="7.27" x="127.5" y="88.225" />
      <rect style="fill:#fce3bb;fill-opacity:1;stroke:none" width="0.9" height="7.27" x="129.8" y="88.225" />
      <rect style="fill:#fce3bb;fill-opacity:1;stroke:none" width="0.9" height="7.27" x="132.1" y="88.225" />
      <rect style="fill:#fce3bb;fill-opacity:1;stroke:none" width="0.9" height="7.27" x="134.4" y="88.225" />
      <rect style="fill:#fce3bb;fill-opacity:1;stroke:none" width="0.9" height="7.27" x="136.7" y="88.225" />
      <rect style="fill:#fce3bb;fill-opacity:1;stroke:none" width="0.9" height="7.27" x="139.0" y="88.225" />
      
      <!-- Triangle pediment -->
      <path 
        style="vector-effect:non-scaling-stroke;fill:#ececec;fill-opacity:1;stroke:#000000;stroke-width:0" 
        d="m 122.88617,86.548802 -6.928,0.06402 3.49246,-4.203752 z" 
        id="path20" />
      <path 
        id="path21" 
        style="vector-effect:non-scaling-stroke;fill:#999999;fill-opacity:1;stroke:#000000;stroke-width:0" 
        d="m 116.31999,86.441234 c 2.07003,-0.01929 4.14007,-0.03858 6.21011,-0.05787 -1.02652,-1.236836 -2.05303,-2.473672 -3.07955,-3.710508 -1.04352,1.256126 -2.08704,2.512252 -3.13056,3.768378 z" />
    </g>
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