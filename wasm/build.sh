#!/bin/bash
set -euo pipefail

docker build --output type=local,dest=./dist .

cp ./dist/opt/qpdf/qpdf.wasm ./../src/lib/vendors/qpdf.wasm
cp ./dist/opt/qpdf/qpdf.js ./../src/lib/vendors/qpdf.js
