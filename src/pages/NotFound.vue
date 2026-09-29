<script setup lang="ts">
import { useHead } from '@unhead/vue'
useHead({ title: 'ページが見つかりません | Portfolio' })
</script>
<template>
  <h1 class="mb-4 text-2xl font-bold">404 — ページが見つかりません</h1>
  <RouterLink to="/">一覧に戻る</RouterLink>
</template>
