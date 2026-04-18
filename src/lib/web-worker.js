import createModule from '$lib/vendors/qpdf'
import { expose, transfer } from 'comlink'

let qpdfInstance = null

const safeUnlink = (FS, filePath) => {
  try {
    FS.unlink(filePath)
  } catch {
    // Ignore error if file doesn't exist
  }
}

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
  } catch {
    return [false, exitCode]
  } finally {
    safeUnlink(FS, IN_FILE)
  }
}

const qpdfProcessFile = (pdfBuffer, command, onProgress = () => {}) => {
  if (!qpdfInstance) {
    return [false, 0, new Error('QPDF not initialized')]
  }

  const FS = qpdfInstance.FS
  const IN_FILE = `in_${crypto.randomUUID()}.pdf`
  const OUT_FILE = `out_${crypto.randomUUID()}.pdf`
  let exitCode = 0

  try {
    onProgress('Writing file to worker memory...')
    FS.writeFile(IN_FILE, new Uint8Array(pdfBuffer))

    onProgress('Optimizing PDF (this may take a moment)...')
    command = [...command, IN_FILE, OUT_FILE]
    exitCode = qpdfInstance.callMain(command)

    onProgress('Extracting optimized file...')
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
    safeUnlink(FS, IN_FILE)
    safeUnlink(FS, OUT_FILE)
  }
}

const workerApi = {
  async init(wasmUrl) {
    qpdfInstance = await createModule()
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

  processPdf(pdfBuffer, options = {}, onProgress = () => {}) {
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
      return qpdfProcessFile(pdfBuffer, command, onProgress)
    } catch(err) {
      return [false, 0, err]
    } finally {
      if (options.password) {
        safeUnlink(FS, PASSWORD_FILE)
      }
    }
  }
}

expose(workerApi)
