#!/bin/bash
# Script para build e preparação do PWA

echo "🔨 Building web app..."
npm run build:web

echo "📦 Copying PWA assets..."
cp web/icon.png dist/icon.png
cp web/manifest.json dist/manifest.json
cp web/service-worker.js dist/service-worker.js

echo "✏️ Updating index.html..."
# Fazer backup do index.html original
cp dist/index.html dist/index.html.bak

# Adicionar PWA meta tags e manifest no head
sed -i 's|<title>app-manicure</title>|<title>App Manicure</title>\n    <meta name="theme-color" content="#EB69A3" />\n    <meta name="apple-mobile-web-app-capable" content="yes" />\n    <meta name="apple-mobile-web-app-status-bar-style" content="default" />\n    <meta name="apple-mobile-web-app-title" content="App Manicure" />\n    <link rel="manifest" href="/manifest.json" />\n    <link rel="apple-touch-icon" href="/icon.png" />|' dist/index.html

# Adicionar service worker antes do </body>
sed -i 's|</body>|  <script>\n    if ("serviceWorker" in navigator) {\n      window.addEventListener("load", () => {\n        navigator.serviceWorker.register("/service-worker.js")\n          .then(reg => { console.log("SW registrado"); setInterval(() => reg.update(), 30000); })\n          .catch(err => console.log("SW erro:", err));\n      });\n    }\n  </script>\n</body>|' dist/index.html

echo "✅ PWA build complete!"
echo "📤 Ready to deploy with: firebase deploy --only hosting"
