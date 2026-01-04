import Worker from '$lib/web-worker?worker'
import { wrap } from 'comlink'
import { browser } from '$app/environment'

let workerApi = null
let workerInstance = null

export const getWorker = async () => {
  if (!browser) {
    return null
  }

  if (workerApi) {
    return workerApi
  }

  workerInstance = new Worker()

  workerApi = wrap(workerInstance)
  return workerApi
}

export const terminateWorker = () => {
  if (workerInstance) {
    workerInstance.terminate()
    workerInstance = null
    workerApi = null
  }
}
