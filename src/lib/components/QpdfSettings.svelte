<script>
  import { onDestroy } from 'svelte'
  import { transfer, proxy } from 'comlink'
  import DropFile from './DropFile.svelte'
  import { humanFileSize } from '$lib/utils'
  import { splitState } from '$lib/states/split.svelte'
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

    if (isProcessing) return

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

        splitState.switchToRightOnMobile()
      } else {
        errorMessage = 'Error to process document'
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

{#await webWorkerObject.init()}
  <div>loading...</div>
{:then}

  <form class="form" onsubmit={handleSubmit}>
    <DropFile accept="application/pdf" onDrop={onDrop} hasFiles={filesState.list.length > 0}>
      {#if filesState.list.length > 0}
        <div class="file-list-wrapper">
          <ul class="file-list">
            {#each filesState.list as file, index (index)}
              <li class="file-item">
                {file.name} ({humanFileSize(file.size)})
              </li>
            {/each}
          </ul>
        </div>
      {/if}
    </DropFile>

    {#if isFileNeeePassword}
      <div class="password-wrapper">
        <label for="passwordField" class="password-label">Document password</label>
        <input id="passwordField" type="password" class="password-input" autocomplete="off" bind:value={pdfPassword} />
      </div>
    {/if}

    <div class="radio-card-group">
      <label class="card-radio" for="linearizationRadio">
        <input
          id="linearizationRadio"
          type="radio"
          name="pdfCompression"
          value="linearization"
          bind:group={pdfCompression}
          class="visually-hidden"
        />
        <div class="card-content">
          <div class="radio-check"></div>
          <div class="card-details">
            <span class="card-title">Web Optimize</span>
            <span class="card-description">Restructures file for instant web browser loading. Best for documents hosted online. Pages load without waiting for the full download</span>
          </div>
        </div>
      </label>

      <label class="card-radio" for="compressionRadio">
        <input
          id="compressionRadio"
          type="radio"
          name="pdfCompression"
          value="compression"
          bind:group={pdfCompression}
          class="visually-hidden"
        />
        <div class="card-content">
          <div class="radio-check"></div>
          <div class="card-details">
            <span class="card-title">Compress</span>
            <span class="card-description">Applies maximum compression to reduce file size. Best for emails and archiving. Squeezes out extra bytes to make sharing easier</span>
          </div>
        </div>
      </label>
    </div>

    <button class="submit-button" type="submit" disabled={isProcessing || filesState.list.length === 0}>
      {isProcessing ? 'Processing...' : 'Convert'}
    </button>

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
        {errorMessage}
      </div>
    {/if}
  </form>
{:catch error}
  <Error title="Error to load wasm" message={error.toString()} />
{/await}

<style>
  .form {
    margin: 0.5rem;
    overflow-y: auto;
  }

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

  .password-wrapper {
    display: flex;
    flex-direction: column;
    margin: 0.5rem 0;
    font-size: 1.1rem;
  }

  .password-input {
    font-size: 1.5rem;
    background-color: var(--input-bg);
    border: 1px solid var(--input-border);
    color: var(--input-color);
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
  }

  .radio-card-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin: 1rem 0;
  }

  .card-radio {
    flex: 1;
    cursor: pointer;
    display: block;
    position: relative;
    transition: all 0.2s ease-in-out;
  }

  .card-content {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 1.25rem;
    border: 1px solid var(--emph-color);
    border-radius: 0.5rem;
  }

  .card-radio:hover .card-content {
    border-color: var(--input-color);
  }

  .card-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .card-title {
    font-size: 1rem;
    font-weight: 600;
  }

  .card-description {
    font-size: 0.9rem;
  }

  .radio-check {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    border: 2px solid var(--emph-color);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 2px;
    transition: background-color 0.2s, border-color 0.2s;
  }

  .radio-check::after {
    content: '';
    width: 10px;
    height: 10px;
    background-color: var(--bg-color);
    border-radius: 50%;
    opacity: 0;
    transform: scale(0);
    transition: transform 0.2s, opacity 0.2s;
  }

  .visually-hidden:checked + .card-content {
    border-color: #268bd2;
    border-width: 2px;
    padding: calc(1.25rem - 1px);
  }

  .visually-hidden:checked + .card-content .radio-check {
    border-color: #268bd2;
    background-color: #268bd2;
  }

  .visually-hidden:checked + .card-content .radio-check::after {
    opacity: 1;
    transform: scale(1);
  }

  .visually-hidden:checked + .card-content .card-title {
    color: #268bd2;
  }

  .submit-button {
    font-size: 1.25rem;
    font-weight: 600;
    padding: 0.75rem 1rem;
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: center;
    border: 2px solid #859900;
    border-radius: 0.5rem;
    background-color: transparent;
    color: #859900;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
  }

  .submit-button:hover:not(:disabled),
  .submit-button:active:not(:disabled) {
    background-color: #859900;
    color: var(--bg-color);
    box-shadow: 0 4px 12px rgba(133, 153, 0, 0.2);
    transform: translateY(-2px);
  }

  .submit-button:disabled {
    border-color: var(--input-border);
    background-color: var(--input-bg);
    color: var(--input-bg-disabled);
    cursor: not-allowed;
    opacity: 0.6;
  }

  .progress-container {
    margin-top: 1rem;
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
    height: 0.5rem;
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

  .error-container {
    display: flex;
    margin: 1rem;
    background-color: var(--bg-color);
    border-radius: 0.4rem;
    color: #d33682;
  }
</style>
