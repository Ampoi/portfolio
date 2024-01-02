<template>
  <main class="flex flex-col items-center w-screen">
    <div class="basis-[60vh] grid place-content-center w-full">
      <div class="flex flex-col items-center">
        <img
          src="~/assets/images/Ampoi.svg"
          alt="Ampoi logo"
          width="400">
        <p class="text-slate-600 font-medium mt-4">ウェブアプリとか　作字とか　デザインとか</p>
        <div class="flex flex-row items-center gap-4 text-slate-600 mt-2">
          <NuxtLink to="https://github.com/ampoi">GitHub</NuxtLink>
          <NuxtLink to="https://x.com/4mpoi">X</NuxtLink>
          <NuxtLink to="https://zenn.dev/toshihiro_tange">Zenn</NuxtLink>
        </div>
      </div>
    </div>
    <div class="max-w-4xl w-full px-8">
      <div class="max-w-3xl mx-auto">
        <h2 class="font-bold text-6xl text-black/10 -ml-4">
          Timeline
        </h2>
        <p class="-mt-4">直近の出来事とか</p>
        <div class="flex flex-col gap-4 mt-4 max-h-40 overflow-y-auto">
          <p class="text-xl font-semibold">
            <span class="text-base">2023/12/26</span>
            <span>
              未踏ジュニア
              <span class="text-blue-800">スーパークリエイター認定</span>
            </span>
          </p>
          <p class="text-xl font-semibold">
            <span class="text-base">2023/11/3</span>
            <span>
              未踏ジュニア
              <span class="text-blue-800">修了</span>
            </span>
          </p>
          <p class="text-xl font-semibold">
            <span class="text-base">2023/5/25</span>
            <span>
              未踏ジュニア
              <span class="text-blue-800">採択</span>
            </span>
          </p>
          <p class="text-xl font-semibold">
            <span class="text-base">2022/11/11</span>
            <span>
              学力向上アプリコンテストプログラミング部門
              <span class="text-blue-800">奨励賞</span>
            </span>
          </p>
        </div>
      </div>
      <div class="mt-16">
        <div class="max-w-3xl mx-auto">
          <h2 class="font-bold text-6xl text-black/10 -ml-4">
            Projects
          </h2>
          <p class="-mt-4">これまで作ったアプリとか</p>
        </div>
        <div class="mt-4 grid grid-rows-2 grid-flow-col gap-4 h-[30rem] overflow-x-auto rounded-xl">
          <NuxtLink
            v-for="creation in creations"
            class="w-[24rem] rounded-xl p-4 bg-cover bg-center"
            :style="{ backgroundImage: `url(/images/creations/${creation.image}.webp)` }"
            :to="creation.link">
          </NuxtLink>
        </div>
      </div>
      <div class="mt-16">
        <div class="max-w-3xl mx-auto">
          <h2 class="font-bold text-6xl text-black/10 -ml-4">
            Sakuji
          </h2>
          <p class="-mt-4">これまで作った作字とか</p>
        </div>
        <div class="mt-4 grid grid-rows-1 grid-flow-col gap-4 h-[30rem] overflow-x-auto rounded-xl">
          <div
            class="bg-cover bg-center w-[30rem] rounded-xl p-4"
            v-for="work in works"
            :style="{ backgroundImage: `url(/images/works/${work.image}.webp)` }"/>
        </div>
      </div>
    </div>
    <footer class="py-4 mt-4">
      <p class="text-center text-black/40">©︎Ampoi 2024</p>
    </footer>
  </main>
</template>
<style>
body {
  font-family: 'Noto Sans JP', sans-serif;
}
</style>
<script setup lang="ts">
const creations = [
  { link: "https://stask.ampoi.net", image: "Stask", name: "Stask", description: "2022年夏〜学力向上アプリコンテスト〜未踏ジュニアにかけて開発している学生向けの課題管理アプリです。使いやすい(使いやすくする)から使ってみてね。" },
  { link: "https://to-be.ampoi.net", image: "ToBe", name: "ToBe", description: "ゲームのスキルツリーみたいな感じで自分のタスクできたら面白そうだな〜　って思って作ったアプリです。" },
  { link: "https://urlmemo.ampoi.net", image: "URLMEMO", name: "URLMEMO", description: "URLを通じてメモを保存・閲覧・共有できるアプリです。Instagramとかでそのまま文見られるよりはひと段落あったほうがいいかなって思って作りました。" },
  { link: "https://131.kaijofes.com/", image: "KAGARIBI", name: "131代海城祭公式サイト", description: "131代の文化祭公式サイトです。" },
  { link: "https://132.kaijofes.com/", image: "KIRAMEKI", name: "132代海城祭公式サイト", description: "132代の文化祭公式サイトです。" },
  { link: "https://github.com/Ampoi/Baser", image: "BASER", name: "BASER", description: "2Dの火星みたいな星の上で色々するゲームです。気が向いたらたまに開発してます。" },
]

const works = [
  { image: "Afternoon", name: "Afternoon", description: "Mrs.GREEN APPLEの「Afternoon」の作字です。本当にいい曲なので聞いてみてください。" },
  { image: "クダリ", name: "クダリ", description: "Mrs.GREEN APPLEの「クダリ」の作字です。本当にいい曲なので聞いてみてください。" },
  { image: "アウフヘーベン", name: "アウフヘーベン", description: "Mrs.GREEN APPLEの「アウフヘーベン」の作字です。本当にいい曲なので聞いてみてください。" },
  { image: "Loneliness", name: "Loneliness", description: "Mrs.GREEN APPLEの「Loneliness」の作字です。"},
  { image: "AKEOME", name: "あけおめ", description: "2023年度元旦のやつです。" },
  { image: "ATTITUDE", name: "Attitude", description: "Mrs.GREEN APPLEの「Attitude」の作字です。" },
  { image: "DORYOKU", name: "努力", description: "KICK BACKの替え歌みたいなのでめっちゃ努力って入ってるやつがあったので作ってみました。特に意味はないです。" },
  { image: "GENDOUKI", name: "原動機", description: "昭和感出したくて作ってみました。" },
  { image: "KAIJUNOHANAUTA", name: "怪獣の花唄", description: "5月くらいまで獣って字の左側に線が入ってるってこと知りませんでした。漢字間違ってます。" },
  { image: "LOVIN", name: "lovin'", description: "Mrs.GREEN APPLEの「lovin'」の作字です。歌がめっちゃ可愛いので聞いてみてください。" },
  { image: "MITIBIKI", name: "導", description: "方べきの定理に見えるとあまり評価は良くなかったです。" },
  { image: "ROUDOU", name: "働", description: "友達とやっていたマイクラの労働サーバーのアイコンです。" },
  { image: "SEITOKAI", name: "生徒会", description: "とりあえず作ってみただけです。特に生徒会への忠誠心とかはありません。" },
  { image: "TUKIMASITEHA", name: "ツキマシテハ", description: "Mrs.GREEN APPLEの「ツキマシテハ」の作字です。本当にいい曲なので聞いてみてください。" },
]
</script>