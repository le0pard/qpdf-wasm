<script>
  import pdfObject from 'pdfobject'
  import { pdfUrlState } from '$lib/states/pdfUrl.svelte'

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
          node.innerContent = ''
        }
      }
    }
  }
</script>

{#if pdfUrlState.url}
  <div
    class="pdf-viewer"
    use:embedPdf={pdfUrlState.url}
  ></div>
{/if}

<style>
  .pdf-viewer {
    flex-grow: 1;
    width: 100%;
  }
</style>
