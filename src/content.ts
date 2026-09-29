import data from './generated/content.json'

export interface OptimizedImage {
  src: string
  srcset: string
  width: number
  height: number
}
export interface Artwork {
  slug: string
  name: string
  description: string
  image: OptimizedImage
}
export interface Project extends Artwork {
  link: string
  articleHtml?: string
}
export const projects: Project[] = data.projects
export const lettering: Artwork[] = data.lettering
