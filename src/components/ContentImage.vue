<script setup lang="ts">
import type { OptimizedImage } from '../content'
defineProps<{ image: OptimizedImage; alt: string }>()
</script>

<template>
  <img
    :src="image.src"
    :srcset="image.srcset"
    sizes="(max-width: 768px) 100vw, 768px"
    :width="image.width"
    :height="image.height"
    :alt="alt"
    loading="lazy"
    decoding="async"
    class="h-auto max-w-full"
  />
</template>
