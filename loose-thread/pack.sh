#!/bin/sh
# Build a self-contained folder for EditART or any static host:
# copies p5.min.js and editartParams.js in and points index.html at them.
set -e
here=$(cd "$(dirname "$0")" && pwd)
out="$here/dist"
rm -rf "$out" && mkdir -p "$out"
cp "$here/index.js" "$out/"
cp "$here/../p5.min.js" "$here/../editartParams.js" "$out/"
sed 's#\.\./p5\.min\.js#./p5.min.js#; s#\.\./editartParams\.js#./editartParams.js#' "$here/index.html" > "$out/index.html"
(cd "$out" && zip -qr ../loose-thread.zip .)
echo "dist/ and loose-thread.zip ready"
