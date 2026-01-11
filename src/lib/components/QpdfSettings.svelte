<script>
  import { onDestroy } from 'svelte'
  import { transfer } from 'comlink'
  import { filesState } from '$lib/states/files.svelte'
  import { pdfInfoState } from '$lib/states/pdfInfo.svelte'

  let { webWorkerObject } = $props()

  let isFileNeeePassword = $state(false)
  let pdfPassword = $state(null)
  let pdfCompression = $state('linearization')

  const handleFileChange = async (e) => {
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
    } catch(e) {
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

{#await webWorkerObject.init()}
  <div>loading...</div>
{:then}

  <form onsubmit={handleSubmit}>
    <input
      type="file"
      accept="application/pdf"
      bind:files={filesState.list}
      onchange={handleFileChange}
    />

    {#if isFileNeeePassword}
      <input type="password" bind:value={pdfPassword} />
    {/if}

    <select bind:value={pdfCompression}>
      <option value="linearization">Web optimize PDF file</option>
      <option value="compression">Compress PDF file</option>
    </select>

    <button type="submit">Convert</button>
  </form>
{:catch error}
  <Error title="Error to load wasm" message={error.toString()} />
{/await}

<style>

</style>
