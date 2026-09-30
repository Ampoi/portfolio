import { useHead, useSeoMeta } from '@unhead/vue'
import { useRoute } from 'vue-router'
import { toValue, type MaybeRefOrGetter } from 'vue'

const siteUrl = 'https://www.ampoi.dev'
export const siteTitle = 'Ampoi | Portfolio'
export const siteDescription = 'Ampoiのポートフォリオ。制作したアプリ・Webサイトと作字を紹介しています。'

export function usePageMeta(
  title: MaybeRefOrGetter<string>,
  description: MaybeRefOrGetter<string>,
  type: 'website' | 'article' = 'website',
) {
  const route = useRoute()
  const url = () => new URL(route.path, siteUrl).href
  useHead(() => ({ link: [{ rel: 'canonical', href: url() }] }))
  useSeoMeta({
    title: () => toValue(title),
    description: () => toValue(description),
    ogTitle: () => toValue(title),
    ogDescription: () => toValue(description),
    ogType: type,
    ogUrl: url,
    ogSiteName: 'Ampoi',
    ogLocale: 'ja_JP',
    ogImage: `${siteUrl}/ogp.jpg`,
    ogImageType: 'image/jpeg',
    ogImageWidth: 1200,
    ogImageHeight: 630,
    ogImageAlt: '花の咲く山の風景を背景にした白いAmpoiのロゴ',
    twitterCard: 'summary_large_image',
    twitterSite: '@4mpoi',
    twitterTitle: () => toValue(title),
    twitterDescription: () => toValue(description),
    twitterImage: `${siteUrl}/ogp.jpg`,
    twitterImageAlt: '花の咲く山の風景を背景にした白いAmpoiのロゴ',
  })
}
