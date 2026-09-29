<template>
  <main :class="$route.path === '/' ? undefined : 'mx-auto max-w-4xl p-6'">
    <RouterView />
  </main>
</template>
