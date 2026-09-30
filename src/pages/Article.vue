<script setup lang="ts">
import { usePageMeta } from '../seo'
import type { Project } from '../content'
import ContentImage from '../components/ContentImage.vue'
const props = defineProps<{ project: Project }>()
usePageMeta(() => `${props.project.name} | Ampoi`, () => props.project.description, 'article')
</script>

<template>
  <RouterLink to="/">一覧に戻る</RouterLink>
  <article class="mt-6">
    <h1 class="mb-4 text-2xl font-bold">{{ project.name }}</h1>
    <p class="mb-4">{{ project.description }}</p>
    <ContentImage :image="project.image" :alt="project.name" />
    <div class="article mt-6" v-html="project.articleHtml" />
    <p class="mt-6"><a :href="project.link">プロジェクトを見る</a></p>
  </article>
</template>
