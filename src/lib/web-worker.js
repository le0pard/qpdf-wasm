import { expose } from 'comlink'

const workerApi = {
  pdfInfo() {
    return 42
  }
}

expose(workerApi)
