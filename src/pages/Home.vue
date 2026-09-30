<script setup lang="ts">
import { ref } from 'vue'
import { useHead } from '@unhead/vue'
import { projects, lettering } from '../content'
import ContentImage from '../components/ContentImage.vue'
import LandscapeHero from '../components/LandscapeHero.vue'
import ReededFooter from '../components/ReededFooter.vue'
import ProjectOrbit from '../components/ProjectOrbit.vue'
const introPlaying = ref(false)
useHead({ title: 'Portfolio', meta: [{ name: 'description', content: 'プロジェクトと作字の一覧です。' }] })
</script>

<template>
  <div id="top" class="relative isolate text-[#20352d]">
    <LandscapeHero @animation-state="introPlaying = $event" />
    <div class="mx-auto w-full pt-12 pb-28 mobile:pt-6 mobile:pb-16" :inert="introPlaying">
      <section id="projects" aria-labelledby="projects-heading" class="scroll-mt-6">
        <ProjectOrbit :projects="projects" />
      </section>
      <section id="lettering" aria-labelledby="lettering-heading"
        class="mx-auto mt-22 max-w-[1080px] scroll-mt-6 px-8 mobile:mt-12 mobile:px-4.5">
        <header class="glass-panel mb-6 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-[22px] px-7 py-5.5 mobile:gap-x-3.5 mobile:gap-y-2 mobile:p-5">
          <span class="text-[11px] font-[650] tracking-[.18em] mobile:text-[10px]" aria-hidden="true">LETTERING</span>
          <h2 id="lettering-heading" class="text-[20px] font-[650] tracking-[.08em] mobile:text-[18px]">作字</h2>
          <span class="ml-auto text-[12px] tabular-nums" aria-hidden="true">{{ String(lettering.length).padStart(2, '0') }}</span>
        </header>
        <p v-if="!lettering.length" class="glass-panel rounded-[22px] p-7">まだ作字はありません。</p>
        <ul class="grid grid-cols-2 gap-6 mobile:grid-cols-1 mobile:gap-5">
          <li v-for="item in lettering" :key="item.slug" class="glass-panel min-w-0 rounded-[28px] p-3.5">
            <div class="overflow-hidden rounded-2xl bg-white/32">
              <ContentImage :image="item.image" :alt="item.name" class="block w-full" />
            </div>
            <div class="px-3 pt-5.5 pb-3 wrap-anywhere">
              <h3 class="text-[20px] font-[650] tracking-[.02em]">{{ item.name }}</h3>
              <p class="mt-2.5 text-[14px] leading-[1.9] whitespace-pre-line">{{ item.description }}</p>
            </div>
          </li>
        </ul>
      </section>
    </div>
    <ReededFooter :inert="introPlaying" />
  </div>
</template>

<style scoped>
.glass-panel {
  border: 1px solid rgb(255 255 255 / 72%);
  background: rgb(249 252 247 / 64%);
  -webkit-backdrop-filter: blur(22px) saturate(125%);
  backdrop-filter: blur(22px) saturate(125%);
  box-shadow: 0 12px 40px rgb(23 49 33 / 9%), inset 0 1px 0 rgb(255 255 255 / 75%);
}

@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .glass-panel { background: rgb(249 252 247 / 94%); }
}

</style>
