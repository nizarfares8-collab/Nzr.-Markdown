import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '../public');
const svgPath = path.join(publicDir, 'icon.svg');

// Maskable SVG with 15% safe-padding on all sides and full-bleed solid background
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4f46e5" />
      <stop offset="100%" stop-color="#3730a3" />
    </linearGradient>
  </defs>

  <!-- Full-bleed background for maskable -->
  <rect width="512" height="512" fill="url(#bgGrad)" />

  <!-- Inner content scaled with 15% safe margin (centered at 512/2 = 256) -->
  <g transform="translate(76.8, 76.8) scale(0.7)">
    <rect x="88" y="88" width="336" height="336" rx="24" fill="#ffffff" fill-opacity="0.1" stroke="#ffffff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M 136 320 L 136 192 L 176 248 L 216 192 L 216 320" fill="none" stroke="#ffffff" stroke-width="20" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M 252 248 L 276 276 L 300 248" fill="none" stroke="#ffffff" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" />
    <line x1="276" y1="200" x2="276" y2="272" stroke="#ffffff" stroke-width="16" stroke-linecap="round" />
    <path d="M 340 220 L 320 256 L 340 292" fill="none" stroke="#38bdf8" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M 376 220 L 396 256 L 376 292" fill="none" stroke="#38bdf8" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" />
    <line x1="364" y1="214" x2="352" y2="298" stroke="#a5b4fc" stroke-width="12" stroke-linecap="round" />
  </g>
</svg>`;

async function run() {
  const svgBuffer = fs.readFileSync(svgPath);

  // 1. 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Created pwa-192x192.png');

  // 2. 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Created pwa-512x512.png');

  // 3. apple-touch-icon 180x180
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png');

  // 4. maskable 512x512
  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Created pwa-maskable-512x512.png');

  // 5. favicon 32x32 & 64x64
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon-32x32.png'));
  console.log('Created favicon-32x32.png');
}

run().catch(console.error);
