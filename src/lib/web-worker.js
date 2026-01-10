import createModule from '$lib/vendors/qpdf'
import { expose, transfer } from 'comlink'

let qpdfInstance = null

const workerApi = {
  async init() {
    qpdfInstance = await createModule({
      locateFile: () => '/qpdf.wasm'
    })
  },

  async processPdf(pdfBuffer, options = {}) {
    if (!qpdfInstance) {
      return
    }

    const FS = qpdfInstance.FS
    const IN_FILE = `in_${crypto.randomUUID()}.pdf`
    const OUT_FILE = `out_${crypto.randomUUID()}.pdf`
    const PASSWORD_FILE = `pass_${crypto.randomUUID()}.txt`
    let exitCode = 0

    try {
      FS.writeFile(IN_FILE, new Uint8Array(pdfBuffer))

      let command = [
        '--no-warn',
        '--warning-exit-0'
      ]

      if (options.password) {
        FS.writeFile(PASSWORD_FILE, options.password)

        command = [
          ...command,
          '--decrypt',
          `--password-file=${PASSWORD_FILE}`
        ]
      }
      if (options.compress) {
        command = [
          ...command,
          '--object-streams=generate',
          '--compression-level=9',
          '--recompress-flate',
          '--stream-data=compress',
          '--decode-level=generalized'
        ]
      } else {
        command = [
          ...command,
          '--linearize'
        ]
      }

      command = [...command, IN_FILE, OUT_FILE]

      console.log('command', command)
      exitCode = qpdfInstance.callMain(command)

      const resultView = FS.readFile(OUT_FILE)

      const resultBuffer = resultView.buffer
      return [
        true,
        exitCode,
        transfer(resultBuffer, [resultBuffer])
      ]
    } catch(err) {
      return [
        false,
        exitCode,
        err
      ]
    } finally {

      FS.unlink(IN_FILE)
      FS.unlink(OUT_FILE)
      if (options.password) {
        FS.unlink(PASSWORD_FILE)
      }

    }
  }
}

expose(workerApi)
