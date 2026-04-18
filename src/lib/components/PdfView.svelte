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
  <div class="tool-info-container">
    <div class="hero-section">
      <h2>PDF Optimizer & Compressor</h2>
      <p class="subtitle">Process your PDFs securely and locally within your browser.</p>
    </div>

    <div class="features-list">
      <div class="feature-card border-blue">
        <h3 class="feature-title text-blue">1. Select a File</h3>
        <p>Drag and drop your PDF or click to browse. Password-protected files are fully supported.</p>
      </div>

      <div class="feature-card border-green">
        <h3 class="feature-title text-green">2. Choose Processing</h3>
        <ul class="feature-list">
          <li><strong>Web Optimize:</strong> Enables Fast Web View for instant browser loading.</li>
          <li><strong>Compress:</strong> Reduces file size using advanced QPDF compression.</li>
        </ul>
      </div>

      <div class="feature-card border-yellow">
        <h3 class="feature-title text-yellow">3. Process & Download</h3>
        <p>Conversion happens instantly on your device via WebAssembly. No data is sent to external servers.</p>
      </div>
    </div>

    <div class="privacy-notice">
      <span class="lock-icon" aria-hidden="true">🔒</span>
      <div>
        <strong>Privacy First:</strong> Your files never leave your computer. All processing is executed safely in your browser.
      </div>
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
    padding: 0.25rem;
  }

  .pdf-download-link {
    font-size: 1.25rem;
    font-weight: 600;
    padding: 0.75rem 1rem;
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: center;
    border: 2px solid #268bd2;
    border-radius: 0.5rem;
    background-color: transparent;
    color: #268bd2;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
  }

  .pdf-download-link:hover,
  .pdf-download-link:active {
    background-color: #268bd2;
    color: var(--bg-color);
    box-shadow: 0 4px 12px rgba(38, 139, 210, 0.2);
    transform: translateY(-2px);
  }

  .tool-info-container {
    display: flex;
    flex-direction: column;
    padding: 2.5rem 1.5rem;
    max-width: 900px;
    margin: 0 auto;
    height: 100%;
    overflow-y: auto;
    color: var(--base-color);
  }

  .hero-section {
    text-align: center;
    margin-bottom: 1rem;
  }

  .hero-section h2 {
    color: var(--emph-color);
    margin-bottom: 0.5rem;
    font-size: 2rem;
  }

  .subtitle {
    color: var(--comment-color);
    font-size: 1.1rem;
  }

  .features-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .feature-card {
    background-color: var(--input-bg);
    border: 1px solid var(--input-border);
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .feature-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.05);
  }

  .border-blue { border-top: 4px solid #268bd2; }
  .border-green { border-top: 4px solid #859900; }
  .border-yellow { border-top: 4px solid #b58900; }

  .text-blue { color: #268bd2; }
  .text-green { color: #859900; }
  .text-yellow { color: #b58900; }

  .feature-title {
    font-size: 1.25rem;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
  }

  .feature-card p {
    margin: 0;
    line-height: 1.6;
  }

  .feature-list {
    padding-left: 1.25rem;
    margin: 0;
  }

  .feature-list li {
    margin-bottom: 0.5rem;
    line-height: 1.5;
  }

  .feature-list strong {
    color: var(--emph-color);
  }

  .privacy-notice {
    margin-top: 1rem;
    padding: 1.25rem;
    background-color: var(--heads-color);
    border-left: 4px solid #2aa198;
    border-radius: 0 8px 8px 0;
    display: flex;
    align-items: center;
    gap: 1rem;
    color: var(--emph-color);
  }

  .lock-icon {
    font-size: 1.75rem;
    line-height: 1;
  }
</style>
