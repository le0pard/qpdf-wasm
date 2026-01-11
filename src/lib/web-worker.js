import createModule from '$lib/vendors/qpdf'
import { expose, transfer } from 'comlink'

let qpdfInstance = null

const qpdfExitCode = (pdfBuffer, command) => {
  if (!qpdfInstance) {
    return
  }

  const FS = qpdfInstance.FS
  const IN_FILE = `in_${crypto.randomUUID()}.pdf`
  let exitCode = 0

  try {
    FS.writeFile(IN_FILE, new Uint8Array(pdfBuffer))

    const qpdfCommand = [
      '--warning-exit-0',
      ...command,
      IN_FILE
    ]
    exitCode = qpdfInstance.callMain(qpdfCommand)

    return [
      true,
      exitCode
    ]
  } catch (err) {
    return [false, exitCode]
  } finally {
    FS.unlink(IN_FILE)
  }
}

const qpdfProcessFile = (pdfBuffer, command) => {
  if (!qpdfInstance) {
    return
  }

  const FS = qpdfInstance.FS
  const IN_FILE = `in_${crypto.randomUUID()}.pdf`
  const OUT_FILE = `out_${crypto.randomUUID()}.pdf`
  let exitCode = 0

  try {
    FS.writeFile(IN_FILE, new Uint8Array(pdfBuffer))

    command = [...command, IN_FILE, OUT_FILE]
    exitCode = qpdfInstance.callMain(command)

    const resultView = FS.readFile(OUT_FILE)

    const resultBuffer = resultView.buffer
    return [
      true,
      exitCode,
      transfer(resultBuffer, [resultBuffer])
    ]
  } catch (err) {
    return [
      false,
      exitCode,
      err
    ]
  } finally {
    FS.unlink(IN_FILE)
    FS.unlink(OUT_FILE)
  }
}

const workerApi = {
  async init() {
    qpdfInstance = await createModule({
      locateFile: () => '/qpdf.wasm'
    })
  },

  async checkPdfFile(pdfBuffer) {
    const checkResult = qpdfExitCode(pdfBuffer, [
      '--check'
    ])

    if (!checkResult[0]) {
      return {
        error: true
      }
    }

    return {
      encrypted: !(checkResult[1] === 0),
      error: false
    }
  },

  async processPdf(pdfBuffer, options = {}) {
    if (!qpdfInstance) {
      return
    }

    const FS = qpdfInstance.FS
    const PASSWORD_FILE = `pass_${crypto.randomUUID()}.txt`

    try {
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
      return qpdfProcessFile(pdfBuffer, command)
    } catch(err) {
      return [false, 0, err]
    } finally {
      if (options.password) {
        FS.unlink(PASSWORD_FILE)
      }
    }
  }
}

expose(workerApi)
