<script>
  import { onDestroy } from 'svelte'
  import { transfer } from 'comlink'
  import { filesState } from '$lib/states/files.svelte'

  let { webWorkerObject } = $props()

  let pdfPassword = $state(null)
  let downloadUrl = null
  let fileUrl = $state(null)

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
          compress: true
        }
      )

      if (result[0]) {
        const blob = new Blob([result[2]], { type: 'application/pdf' })
        if (downloadUrl) URL.revokeObjectURL(downloadUrl)

        downloadUrl = URL.createObjectURL(blob)

        console.log('downloadUrl', downloadUrl)
        fileUrl = downloadUrl
      } else {
        console.log(result[1], result[2])
      }
    } catch(err) {
      console.error('Svelte Worker Error:', err)
    }
  }

  onDestroy(() => {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl)
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

  <a download="output.pdf" href={fileUrl}>Download</a>

{:catch error}
  <Error title="Error to load wasm" message={error.toString()} />
{/await}

<style>

</style>
