<template>
  <main class="flex flex-col items-center w-screen">
    <div class="basis-[60vh] grid place-content-center w-full">
      <div class="flex flex-col items-center">
        <img src="~/assets/images/Ampoi.svg" alt="Ampoi logo" width="400" />
        <p class="text-slate-600 font-medium mt-4">
          ウェブアプリとか　作字とか　デザインとか
        </p>
        <div class="flex flex-row items-center gap-4 text-slate-600 mt-2">
          <NuxtLink to="https://github.com/ampoi">GitHub</NuxtLink>
          <NuxtLink to="https://x.com/4mpoi">X</NuxtLink>
          <NuxtLink to="https://zenn.dev/toshihiro_tange">Zenn</NuxtLink>
        </div>
      </div>
    </div>
    <div class="max-w-4xl w-full px-8 flex flex-col gap-16">
      <IndexTimeline />
      <IndexProjects />
      <IndexMrsSakuji />
      <IndexSakuji />
    </div>
    <footer class="py-4 mt-4">
      <p class="text-center text-black/40">©︎Ampoi 2024</p>
    </footer>
  </main>
</template>