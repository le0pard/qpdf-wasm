<script>
  import { onDestroy } from 'svelte'
  import { transfer } from 'comlink'
  import DropFile from './DropFile.svelte'
  import { filesState } from '$lib/states/files.svelte'
  import { pdfInfoState } from '$lib/states/pdfInfo.svelte'

  let { webWorkerObject } = $props()

  let isFileNeeePassword = $state(false)
  let pdfPassword = $state(null)
  let pdfCompression = $state('linearization')

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

    try {
      const buffer = await file.arrayBuffer()

      const result = await webWorkerObject.processPdf(
        transfer(buffer, [buffer]),
        {
          password: pdfPassword,
          compress: (pdfCompression === 'compression')
        }
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
        console.log('error', result[1], result[2])
      }
    } catch(err) {
      console.log('Svelte Worker Error:', err)
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

    <button type="submit" disabled={filesState.list.length === 0}>Convert</button>
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
    background-color: #ffffff;
    border: 1px solid #f3f4f6;
    border-radius: 4px;
    font-size: 0.875rem;
    color: #4b5563;
    transition: background-color 0.2s;
  }

  .file-item:hover {
    background-color: #f3f4f6;
    border-color: #d1d5db;
  }

  /* Modern scrollbar for the list */
  .file-list-wrapper ul::-webkit-scrollbar {
    width: 6px;
  }
  .file-list-wrapper ul::-webkit-scrollbar-thumb {
    background-color: #d1d5db;
    border-radius: 10px;
  }
</style>
