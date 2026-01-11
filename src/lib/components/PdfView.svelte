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
  <div class="pdf-results">
    <div
      class="pdf-viewer"
      use:embedPdf={pdfInfoState.url}
    ></div>
    <div class="pdf-actions">
      <a download={pdfInfoState.name} href={pdfInfoState.url}>
        Download ({pdfInfoState.outputBytesize} bytes)
      </a>
    </div>
  </div>
{/if}

<style>
  .pdf-results {
    display: flex;
    flex-direction: column;
    height: 100%;
    flex: 1;
  }

  .pdf-viewer {
    flex-grow: 1;
    width: 100%;
  }

  .pdf-actions {
    flex-shrink: 0;
    overflow: hidden;
    white-space: nowrap;
  }
</style>
