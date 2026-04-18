<script>
  import pdfObject from 'pdfobject'
  import { humanFileSize } from '$lib/utils'
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
      <a class="pdf-download-link" download={pdfInfoState.name} href={pdfInfoState.url} rel="external">
        Download ({humanFileSize(pdfInfoState.outputBytesize)})
      </a>
    </div>
  </div>
{:else}
  <div>
    <h2>Tool</h2>
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

  .pdf-download-link {
    font-size: 2rem;
    padding: 0.5rem;
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--input-border);
    background-color: var(--input-bg);
    color: var(--input-color);
  }

  .pdf-download-link:hover, .pdf-download-link:active {
    border-color: #859900;
  }
</style>
