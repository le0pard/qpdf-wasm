# QPDF WASM - PDF Optimizer & Compressor

![QPDF WASM](https://img.shields.io/badge/SvelteKit-WebAssembly-orange?style=flat-square&logo=svelte)

**Live Demo:** [https://qpdf-wasm.leopard.in.ua](https://qpdf-wasm.leopard.in.ua)

A fast, secure, browser-based tool to optimize, compress, and decrypt PDF files. Powered by **QPDF** compiled to **WebAssembly (WASM)**, this application processes all files locally on your device via Web Workers, ensuring that your sensitive documents never leave your computer.

## ✨ Features

* 🔒 **Privacy First (100% Local Processing):** Files are converted directly in your browser. No data is ever sent to or stored on an external server.
* ⚡ **Web Optimize (Linearization):** Restructures PDF files to enable "Fast Web View," allowing browsers to instantly display the first page of a document without waiting for the entire file to download.
* 🗜️ **Maximum Compression:** Applies heavy suite compression algorithms (`--object-streams=generate`, `--compression-level=9`, etc.) to significantly reduce PDF file size for archiving or emailing.
* 🔑 **Password Decryption:** Easily unlock and process password-protected PDFs.
* 📱 **Split View & PDF Preview:** View your tool settings alongside an embedded preview of the finalized PDF.
* 🌐 **Offline Capable:** Includes a Service Worker, allowing the app to function without an internet connection after the initial load.

## 🛠️ Tech Stack

* **Framework:** [SvelteKit](https://kit.svelte.dev/)
* **Core Processing:** [QPDF](https://github.com/qpdf/qpdf) (Compiled to WebAssembly)
* **Concurrency:** Web Workers integrated via [Comlink](https://github.com/GoogleChromeLabs/comlink)
* **PDF Embedding:** [PDFObject](https://pdfobject.com/)
* **Styling:** Vanilla CSS (Solarized variables)

