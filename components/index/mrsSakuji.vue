<template>
  <div class="mt-16">
    <div class="max-w-3xl mx-auto">
      <h2 class="font-bold text-6xl text-black/10 -ml-4">Mrs. Sakuji</h2>
      <p class="-mt-4">これまで作ったMrs. GREEN APPLEの楽曲の作字たち</p>
    </div>
    <div class="mt-4 grid grid-cols-3 gap-1">
      <div
        class="bg-cover bg-center rounded-xl p-4 aspect-square"
        v-for="work in works"
        :style="{
          backgroundImage: `url(/images/works/${work.image}.webp)`,
        }"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
const works = [
  {
    image: "ProPose",
    name: "ProPose",
    description:
      "Mrs. GREEN APPLEの「ProPose」の作字です。本当にいい曲なので聞いてみてください。",
  },
  {
    image: "Afternoon",
    name: "Afternoon",
    description:
      "Mrs. GREEN APPLEの「Afternoon」の作字です。本当にいい曲なので聞いてみてください。",
  },
  {
    image: "クダリ",
    name: "クダリ",
    description:
      "Mrs. GREEN APPLEの「クダリ」の作字です。本当にいい曲なので聞いてみてください。",
  },
  {
    image: "アウフヘーベン",
    name: "アウフヘーベン",
    description:
      "Mrs. GREEN APPLEの「アウフヘーベン」の作字です。本当にいい曲なので聞いてみてください。",
  },
  {
    image: "Loneliness",
    name: "Loneliness",
    description: "Mrs. GREEN APPLEの「Loneliness」の作字です。",
  },
  {
    image: "ATTITUDE",
    name: "Attitude",
    description: "Mrs. GREEN APPLEの「Attitude」の作字です。",
  },
  {
    image: "LOVIN",
    name: "lovin'",
    description:
      "Mrs. GREEN APPLEの「lovin'」の作字です。歌がめっちゃ可愛いので聞いてみてください。",
  },
  {
    image: "TUKIMASITEHA",
    name: "ツキマシテハ",
    description:
      "Mrs. GREEN APPLEの「ツキマシテハ」の作字です。本当にいい曲なので聞いてみてください。",
  },
];
</script>
