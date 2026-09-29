import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
// @ts-expect-error Local Node build plugin uses JavaScript.
import { contentPlugin } from './scripts/content-plugin.mjs'

export default defineConfig({
  plugins: [contentPlugin(), vue(), tailwindcss()],
  ssgOptions: { formatting: 'minify', dirStyle: 'nested' },
})
