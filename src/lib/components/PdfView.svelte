<script>
  import pdfObject from 'pdfobject'
  import { pdfInfoState } from '$lib/states/pdfInfo.svelte'

  const embedPdf = (node, url) => {
    if (url) {
      pdfObject.embed(url, node, {
        height: '100%',
        pdfOpenParams: { view: 'FitV', page: '1' }
      })
    }

    return {
      update(newUrl) {
        if (newUrl) {
          pdfObject.embed(newUrl, node)
        } else {
          node.textContent = ''
        }
      }
    }
  }
</script>

{#if pdfInfoState.url}
  <div
    class="pdf-viewer"
    use:embedPdf={pdfInfoState.url}
  ></div>
{/if}

<style>
  .pdf-viewer {
    flex-grow: 1;
    width: 100%;
  }
</style>
