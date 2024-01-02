// https://nuxt.com/docs/api/configuration/nuxt-config
const title = "Ampoi"
const description = "ごく普通の高校生。"

export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss"],
  app: {
    head: {
      title,
      meta: [
        {charset: "utf-8"},
        {name: "viewport", content: "width=device-width,initial-scale=1"},
        {name: "description", content: description},
        {property: "og:title", content: title},
        {property: "og:description", content: description},
        {property: "og:image", content: "https://ampoi.net/OGP.webp"},
        {property: "twitter:card", content: "summary_large_image"},
        {property: "twitter:site", content: "@4mpoi"},
        {property: "og:locale", content: "ja_JP"}
      ],
      link: [
        {rel: "icon", href: "/favicon.png", sizes: "any", type: "image/png"},
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
        { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100;200;300;400;500;600;700;800;900&display=swap" }
      ]
    }
  }
})