<template>
  <nav class="social-links" aria-label="SNSプロフィール">
    <a href="https://x.com/4mpoi" aria-label="X — @4mpoi" title="X — @4mpoi">
      <img src="/brands/x-white.png" alt="" width="24" height="24" />
    </a>
    <a href="https://github.com/Ampoi" aria-label="GitHub — @Ampoi" title="GitHub — @Ampoi">
      <img src="/brands/github-white.svg" alt="" width="24" height="24" />
    </a>
  </nav>
</template>

<style scoped>
.social-links { display: flex; gap: 24px; }
.social-links a {
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  color: #fff;
  text-decoration: none;
}
.social-links a:focus-visible { outline: 2px solid #fff; outline-offset: 5px; }
.social-links img { display: block; width: 24px; height: 24px; object-fit: contain; }
</style>
