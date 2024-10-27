<template>
  <div class="mt-16">
    <div class="max-w-3xl mx-auto">
      <h2 class="font-bold text-6xl text-black/10 -ml-4">Sakuji</h2>
      <p class="-mt-4">これまで作ったMrs. GREEN APPLEの楽曲以外の作字たち</p>
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
    image: "AKEOME",
    name: "あけおめ",
    description: "2023年度元旦のやつです。",
  },
  {
    image: "DORYOKU",
    name: "努力",
    description:
      "KICK BACKの替え歌みたいなのでめっちゃ努力って入ってるやつがあったので作ってみました。特に意味はないです。",
  },
  {
    image: "GENDOUKI",
    name: "原動機",
    description: "昭和感出したくて作ってみました。",
  },
  {
    image: "KAIJUNOHANAUTA",
    name: "怪獣の花唄",
    description:
      "5月くらいまで獣って字の左側に線が入ってるってこと知りませんでした。漢字間違ってます。",
  },
  {
    image: "MITIBIKI",
    name: "導",
    description: "方べきの定理に見えるとあまり評価は良くなかったです。",
  },
  {
    image: "ROUDOU",
    name: "働",
    description: "友達とやっていたマイクラの労働サーバーのアイコンです。",
  },
  {
    image: "SEITOKAI",
    name: "生徒会",
    description:
      "とりあえず作ってみただけです。特に生徒会への忠誠心とかはありません。",
  }
];
</script>