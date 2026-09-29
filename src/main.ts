import { ViteSSG } from 'vite-ssg'
import App from './App.vue'
import Home from './pages/Home.vue'
import Article from './pages/Article.vue'
import NotFound from './pages/NotFound.vue'
import { projects } from './content'
import './style.css'

export const createApp = ViteSSG(App, {
  routes: [
    { path: '/', component: Home },
    ...projects.filter(project => project.articleHtml !== undefined).map(project => ({
      path: `/projects/${project.slug}/`,
      component: Article,
      props: { project },
    })),
    { path: '/:pathMatch(.*)*', component: NotFound },
  ],
  scrollBehavior: () => ({ top: 0 }),
})
