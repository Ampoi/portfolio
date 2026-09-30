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
    <div class="mx-auto w-full pt-12 mobile:pt-6" :inert="introPlaying">
      <section id="projects" aria-labelledby="projects-heading" class="scroll-mt-6">
        <ProjectOrbit :projects="projects" />
      </section>
      <section id="lettering" aria-labelledby="lettering-heading" class="lettering-gallery mt-22 scroll-mt-6 mobile:mt-12">
        <header class="lettering-header">
          <h2 id="lettering-heading">LETTERING</h2>
        </header>
        <p v-if="!lettering.length" class="px-6 pb-6">まだ作字はありません。</p>
        <ul v-else class="lettering-grid">
          <li v-for="item in lettering" :key="item.slug" class="min-w-0">
            <figure>
              <ContentImage :image="item.image" :alt="item.name" class="lettering-image"
                sizes="(min-width: 1600px) 20vw, (min-width: 1000px) 25vw, (min-width: 680px) 33vw, 50vw" />
              <figcaption class="sr-only">{{ item.description }}</figcaption>
            </figure>
          </li>
        </ul>
      </section>
    </div>
    <ReededFooter :inert="introPlaying" />
  </div>
</template>

<style scoped>
.lettering-gallery {
  width: 100%;
  padding-top: 32px;
  background: rgb(255 255 255 / 12%);
  -webkit-backdrop-filter: blur(24px);
  backdrop-filter: blur(24px);
}
.lettering-header {
  display: flex;
  align-items: baseline;
  justify-content: center;
  text-align: center;
  padding: 0 clamp(20px, 4vw, 56px) 28px;
}
.lettering-header h2 {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(36px, 5vw, 64px);
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: .12em;
  text-indent: .12em;
}
.lettering-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
.lettering-image { display: block; width: 100%; height: auto; aspect-ratio: 1; object-fit: contain; border-radius: 0; }
@media (min-width: 680px) { .lettering-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (min-width: 1000px) { .lettering-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
@media (min-width: 1600px) { .lettering-grid { grid-template-columns: repeat(5, minmax(0, 1fr)); } }
@media (max-width: 640px) {
  .lettering-gallery { padding-top: 24px; }
  .lettering-header { padding-bottom: 20px; }
  .lettering-grid { gap: 4px; }
}
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .lettering-gallery { background: rgb(255 255 255 / 18%); }
}
</style>
