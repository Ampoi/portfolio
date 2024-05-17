<template>
  <div>
    <div class="max-w-3xl mx-auto">
      <h2 class="font-bold text-6xl text-black/10 -ml-4">Projects</h2>
      <p class="-mt-4">これまで作ったアプリとか</p>
    </div>
    <div
      class="mt-4 grid grid-rows-2 grid-flow-col gap-4 h-[30rem] overflow-x-auto rounded-xl"
    >
      <NuxtLink
        v-for="project in projects"
        class="w-[24rem] rounded-xl p-4 bg-cover bg-center"
        :style="{
          backgroundImage: `url(/images/creations/${project.image}.webp)`,
        }"
        :to="project.link"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
const projects = [
  {
    link: "https://stask.ampoi.net",
    image: "Stask",
    name: "Stask",
    description:
      "2022年夏〜学力向上アプリコンテスト〜未踏ジュニアにかけて開発している学生向けの課題管理アプリです。使いやすい(使いやすくする)から使ってみてね。",
  },
  {
    link: "https://to-be.ampoi.net",
    image: "ToBe",
    name: "ToBe",
    description:
      "ゲームのスキルツリーみたいな感じで自分のタスクできたら面白そうだな〜　って思って作ったアプリです。",
  },
  {
    link: "https://urlmemo.ampoi.net",
    image: "URLMEMO",
    name: "URLMEMO",
    description:
      "URLを通じてメモを保存・閲覧・共有できるアプリです。Instagramとかでそのまま文見られるよりはひと段落あったほうがいいかなって思って作りました。",
  },
  {
    link: "https://131.kaijofes.com/",
    image: "KAGARIBI",
    name: "131代海城祭公式サイト",
    description: "131代の文化祭公式サイトです。",
  },
  {
    link: "https://132.kaijofes.com/",
    image: "KIRAMEKI",
    name: "132代海城祭公式サイト",
    description: "132代の文化祭公式サイトです。",
  },
  {
    link: "https://github.com/Ampoi/Baser",
    image: "BASER",
    name: "BASER",
    description:
      "2Dの火星みたいな星の上で色々するゲームです。気が向いたらたまに開発してます。",
  },
];
</script>