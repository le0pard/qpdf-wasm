import { build, files, prerendered, version } from '$service-worker'

const self = globalThis.self
const CACHE = `cache-${version}`

const ASSETS = [
  ...build,
  ...files,
  ...prerendered
]

/**
 * Normalization Helper
 * Normalizes both query parameters and trailing slashes directly
 * within the Request instance to guarantee perfect keyspace matching alignment.
 */
const normalizeRequest = (request) => {
  const url = new URL(request.url)
  let pathname = url.pathname

  // Strip trailing slashes defensively from path checks (e.g. /howto/ -> /howto)
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1)
  }

  // If parameters were stripped OR the trailing slash was modified, bake a standardized Request object
  if (url.search.length > 0 || url.pathname !== pathname) {
    return new Request(`${url.origin}${pathname}`, {
      method: request.method,
      headers: request.headers,
      credentials: request.credentials,
      mode: request.mode
    })
  }
  return request
}

self.addEventListener('install', (event) => {
  const addFilesToCache = async () => {
    const cache = await caches.open(CACHE)
    // This bypasses the local HTTP browser disk/CDN caches, forcing a fresh download of pre-rendered HTML paths
    const freshRequestsPool = ASSETS.map((asset) => new Request(asset, { cache: 'reload' }))
    await cache.addAll(freshRequestsPool)

    // broadcast to all open tabs that a new version is downloaded and waiting
    const clientsList = await self.clients.matchAll({ includeUncontrolled: true })
    for (const client of clientsList) {
      client.postMessage({ type: 'UPDATE_AVAILABLE' })
    }
  }

  event.waitUntil(addFilesToCache())
})

self.addEventListener('activate', (event) => {
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

  const url = new URL(event.request.url)
  if (!url.protocol.startsWith('http')) return

  const respond = async () => {
    const url = new URL(event.request.url)
    const cache = await caches.open(CACHE)

    const standardizedReq = normalizeRequest(event.request)
    const sanitizedPath = new URL(standardizedReq.url).pathname

    // `build`/`files` can always be served from the cache
    if (ASSETS.includes(sanitizedPath)) {
      const response = await cache.match(standardizedReq, { ignoreVary: true })

      if (response) {
        return response
      }
    }

    try {
      const response = await fetch(event.request)
      if (!(response instanceof Response)) {
        throw new Error('invalid response from fetch')
      }

      const isSameOrigin = url.origin === self.location.origin

      if (response.status === 200 && isSameOrigin) {
        cache.put(standardizedReq, response.clone())
      }

      return response
    } catch (err) {
      const response = await cache.match(standardizedReq, { ignoreVary: true })

      if (response) {
        return response
      }

      throw err
    }
  }

  event.respondWith(respond())
})

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
