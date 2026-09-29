import path from 'node:path'
import { generateContent } from './content.mjs'
import { generateReededGlass } from './prepare-reeded-glass.mjs'

export function contentPlugin() {
  let root
  let queue = Promise.resolve()
  let timer
  return {
    name: 'portfolio-content',
    async configResolved(config) {
      root = config.root
      await generateContent(root)
      await generateReededGlass(root)
    },
    configureServer(server) {
      const directory = path.join(root, 'content')
      const artwork = path.join(root, 'public/artwork/flower-hills.svg')
      server.watcher.add(directory)
      server.watcher.add(artwork)
      const onChange = (_event, file) => {
        if (!file.startsWith(directory + path.sep) && file !== artwork) return
        clearTimeout(timer)
        timer = setTimeout(() => {
          queue = queue.then(async () => {
            await generateContent(root)
            await generateReededGlass(root)
            server.ws.send({ type: 'full-reload' })
          }).catch(error => {
            server.config.logger.error(error.message)
            server.ws.send({ type: 'error', err: { message: error.message, stack: error.stack } })
          })
        }, 150)
      }
      server.watcher.on('all', onChange)
      server.httpServer?.once('close', () => {
        clearTimeout(timer)
        server.watcher.off('all', onChange)
      })
    },
  }
}
