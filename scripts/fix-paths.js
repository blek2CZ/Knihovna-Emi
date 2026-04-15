/**
 * Post-build skript: opraví cesty assetů v dist/index.html pro GitHub Pages.
 * Nahradí absolutní cesty (/_expo/) relativními (/Knihovna-Emi/_expo/).
 * Vytvoří .nojekyll aby GitHub Pages neignorovaly složky začínající _.
 * Zkopíruje assets/ (manifest.json, ikony) do dist/assets/.
 */
const fs = require('fs');
const path = require('path');

const BASE_URL = '/Knihovna-Emi';
const rootPath = path.join(__dirname, '..');
const distPath = path.join(rootPath, 'dist');
const assetsPath = path.join(rootPath, 'assets');
const distAssetsPath = path.join(distPath, 'assets');
const indexPath = path.join(distPath, 'index.html');

// ── 1. Oprava cest v index.html ──────────────────────────────────────────────
let html = fs.readFileSync(indexPath, 'utf8');
html = html.replace(/src="\/_expo\//g, `src="${BASE_URL}/_expo/`);
html = html.replace(/href="\/_expo\//g, `href="${BASE_URL}/_expo/`);

// Přidat odkaz na manifest a ikonu pro Apple pokud tam ještě není
if (!html.includes('manifest.json')) {
  html = html.replace(
    '<meta name="theme-color"',
    `<link rel="manifest" href="${BASE_URL}/assets/manifest.json" />\n<link rel="apple-touch-icon" href="${BASE_URL}/assets/icon-192.png" />\n<meta name="mobile-web-app-capable" content="yes" />\n<meta name="apple-mobile-web-app-capable" content="yes" />\n<meta name="apple-mobile-web-app-title" content="Knihovna" />\n<meta name="theme-color"`
  );
}

// Přidat registraci service workeru před </body> pokud tam ještě není
if (!html.includes('serviceWorker')) {
  html = html.replace(
    '</body>',
    `<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('${BASE_URL}/sw.js')
        .then(function(reg) { console.log('SW registrován:', reg.scope); })
        .catch(function(err) { console.warn('SW chyba:', err); });
    });
  }
</script>
</body>`
  );
}

fs.writeFileSync(indexPath, html, 'utf8');
console.log('Cesty v index.html opraveny pro GitHub Pages.');

// ── 2. Vytvořit .nojekyll ────────────────────────────────────────────────────
fs.writeFileSync(path.join(distPath, '.nojekyll'), '');
console.log('Vytvořen .nojekyll – složka _expo/ bude správně nasazena.');

// ── 3. Kopírovat assets/ → dist/assets/ ─────────────────────────────────────
if (fs.existsSync(assetsPath)) {
  if (!fs.existsSync(distAssetsPath)) {
    fs.mkdirSync(distAssetsPath, { recursive: true });
  }
  for (const file of fs.readdirSync(assetsPath)) {
    fs.copyFileSync(path.join(assetsPath, file), path.join(distAssetsPath, file));
    console.log(`Zkopírován asset: ${file}`);
  }
}
