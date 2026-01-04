import { build, files, version } from '$service-worker'

const self = globalThis.self
const CACHE = `cache-${version}`

const ASSETS = [
  ...build,
  ...files
]

self.addEventListener('install', (event) => {
  // Create a new cache and add all files to it
  const addFilesToCache = async () => {
    const cache = await caches.open(CACHE)
    await cache.addAll(ASSETS)
  }

  event.waitUntil(addFilesToCache())
})

self.addEventListener('activate', (event) => {
  // Remove previous cached data from disk
  const deleteOldCaches = async () => {
    for (const key of await caches.keys()) {
      if (key !== CACHE) await caches.delete(key)
    }
  }

  event.waitUntil(deleteOldCaches())
})

self.addEventListener('fetch', (event) => {
  // ignore POST requests etc
  if (event.request.method !== 'GET') return

  const respond = async () => {
    const url = new URL(event.request.url)
    const cache = await caches.open(CACHE)

    // `build`/`files` can always be served from the cache
    if (ASSETS.includes(url.pathname)) {
      const response = await cache.match(url.pathname)

      if (response) {
        return response
      }
    }

    try {
      const response = await fetch(event.request)
      if (!(response instanceof Response)) {
        throw new Error('invalid response from fetch')
      }

      if (response.status === 200) {
        cache.put(event.request, response.clone())
      }

      return response
    } catch (err) {
      const response = await cache.match(event.request)

      if (response) {
        return response
      }

      throw err
    }
  }

  event.respondWith(respond())
})
