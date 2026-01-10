<script>
  import { onDestroy } from 'svelte'
  import { transfer } from 'comlink'
  import { filesState } from '$lib/states/files.svelte'
  import { pdfInfoState } from '$lib/states/pdfInfo.svelte'

  let { webWorkerObject } = $props()

  let pdfPassword = $state(null)
  let downloadUrl = null

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
          compress: false
        }
      )

      if (result[0]) {
        const blob = new Blob([result[2]], { type: 'application/pdf' })
        if (pdfInfoState.url) {
          URL.revokeObjectURL(pdfInfoState.url)
        }

        pdfInfoState.url = URL.createObjectURL(blob)
        pdfInfoState.bytesize = result[2].byteLength
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
    />

    <input type="password" bind:value={pdfPassword} />


    <button type="submit">Upload & Convert</button>
  </form>

  <a download="output.pdf" href={pdfInfoState.url}>Download</a>

{:catch error}
  <Error title="Error to load wasm" message={error.toString()} />
{/await}

<style>

</style>
