<script>
  import { onDestroy } from 'svelte'
  import { transfer, proxy } from 'comlink'
  import DropFile from './DropFile.svelte'
  import { filesState } from '$lib/states/files.svelte'
  import { pdfInfoState } from '$lib/states/pdfInfo.svelte'

  let { webWorkerObject } = $props()

  let isFileNeeePassword = $state(false)
  let pdfPassword = $state(null)
  let pdfCompression = $state('linearization')
  let isProcessing = $state(false)
  let progressMessage = $state('')
  let errorMessage = $state(null)

  const onProgressCallback = proxy((msg) => {
    progressMessage = msg
  })

  const onDrop = async (files = []) => {
    if (!files || files.length === 0) {
      return
    }

    filesState.list = files
    if (!filesState.list || filesState.list.length === 0) {
      return
    }

    const file = filesState.list[0]

    try {
      const buffer = await file.arrayBuffer()

      const result = await webWorkerObject.checkPdfFile(
        transfer(buffer, [buffer])
      )

      isFileNeeePassword = !!(result?.encrypted)
    } catch(err) {
      console.log('Svelte Worker Error:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!filesState.list || filesState.list.length === 0) {
      return
    }

    const file = filesState.list[0]
    isProcessing = true
    progressMessage = 'Preparing to process...'
    errorMessage = null

    try {
      const buffer = await file.arrayBuffer()

      progressMessage = 'Transfer pdf to web worker...'
      const result = await webWorkerObject.processPdf(
        transfer(buffer, [buffer]),
        {
          password: pdfPassword,
          compress: (pdfCompression === 'compression')
        },
        onProgressCallback
      )

      if (result[0]) {
        const blob = new Blob([result[2]], { type: 'application/pdf' })
        if (pdfInfoState.url) {
          URL.revokeObjectURL(pdfInfoState.url)
        }

        pdfInfoState.name = file.name
        pdfInfoState.inputBytesize = file.size
        pdfInfoState.url = URL.createObjectURL(blob)
        pdfInfoState.outputBytesize = result[2].byteLength
      } else {
        errorMessage = result[2]?.toString()
      }
    } catch(err) {
      errorMessage = err.toString()
    } finally {
      isProcessing = false
      progressMessage = ''
    }
  }

  onDestroy(() => {
    if (pdfInfoState.url) {
      URL.revokeObjectURL(pdfInfoState.url)
    }
  })
</script>

{#await webWorkerObject.init('/qpdf.wasm')}
  <div>loading...</div>
{:then}

  <form onsubmit={handleSubmit}>
    <DropFile accept="application/pdf" onDrop={onDrop} hasFiles={filesState.list.length > 0}>
      {#if filesState.list.length > 0}
        <div class="file-list-wrapper">
          <ul class="file-list">
            {#each filesState.list as file, index (index)}
              <li class="file-item">
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </li>
            {/each}
          </ul>
        </div>
      {/if}
    </DropFile>

    {#if isFileNeeePassword}
      <input type="password" bind:value={pdfPassword} />
    {/if}

    <div>
      <label for="linearizationRadio">Web optimize PDF file</label>
      <input id="linearizationRadio" type="radio" name="pdfCompression" value="linearization" bind:group={pdfCompression} />
    </div>
    <div>
      <label for="compressionRadio">Compress PDF file</label>
      <input id="compressionRadio" type="radio" name="pdfCompression" value="compression" bind:group={pdfCompression} />
    </div>

    <button type="submit" disabled={isProcessing || filesState.list.length === 0}>{isProcessing ? 'Processing...' : 'Convert'}</button>

    {#if isProcessing}
      <div class="progress-container">
        <div class="progress-text">{progressMessage}</div>
        <div class="progress-bar">
          <div class="progress-bar-inner"></div>
        </div>
      </div>
    {/if}

    {#if errorMessage}
      <div class="error-container">
        <div class="error-text">{errorMessage}</div>
      </div>
    {/if}
  </form>
{:catch error}
  <Error title="Error to load wasm" message={error.toString()} />
{/await}

<style>
  .file-list-wrapper {
    display: flex;
    height: 100%;
    justify-content: center;
    align-items: center;
  }

  .file-list {
    list-style: none;
    padding: 0;
    margin: 0;
    max-height: 12rem;
    overflow-y: auto;
  }

  .file-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0.75rem;
    margin-bottom: 0.25rem;
    background-color: var(--heads-color);
    border: 1px solid var(--emph-color);
    border-radius: 4px;
    font-size: 0.875rem;
    color: var(--emph-color);
    transition: background-color 0.2s;
  }

  .file-item:hover {
    background-color: var(--bg-color);
  }

  .progress-container {
    margin: 1rem;
    padding: 1rem;
    border: 1px solid var(--input-border);
    border-radius: 0.25rem;
  }

  .progress-text {
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
    color: #cb4b16;
    font-weight: 500;
  }

  .progress-bar {
    width: 100%;
    height: 8px;
    background-color: var(--heads-color);
    border-radius: 4px;
    overflow: hidden;
    position: relative;
  }

  /* Indeterminate sliding animation */
  .progress-bar-inner {
    height: 100%;
    width: 30%;
    background-color: #268bd2;
    border-radius: 4px;
    position: absolute;
    animation: slide 1.5s infinite ease-in-out;
  }

  @keyframes slide {
    0% { left: -30%; }
    100% { left: 100%; }
  }
</style>
