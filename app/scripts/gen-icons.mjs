// Generates PWA PNG icons from the brand shield SVG.
// Run with: node scripts/gen-icons.mjs
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'

const ACCENT = '#0E7C50'

// Standard icon: shield centred on accent ground.
const icon = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="7" fill="${ACCENT}"/>
  <path d="M16 6l8 3.4v5.7c0 5.1-3.4 8.6-8 10.3-4.6-1.7-8-5.2-8-10.3V9.4z" fill="#fff"/>
  <path d="M12 16l3 3 6-6.2" stroke="${ACCENT}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`

// Maskable icon: full-bleed accent ground with the shield inside the safe zone.
const maskable = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">
  <rect width="32" height="32" fill="${ACCENT}"/>
  <path d="M16 9l6 2.6v4.3c0 3.9-2.6 6.5-6 7.8-3.4-1.3-6-3.9-6-7.8v-4.3z" fill="#fff"/>
  <path d="M13.2 16.2l2.2 2.2 4.4-4.6" stroke="${ACCENT}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`

await mkdir(new URL('../public/icons', import.meta.url), { recursive: true })

const out = (name) => new URL(`../public/icons/${name}`, import.meta.url).pathname

const jobs = [
  [icon(192), 192, 'icon-192.png'],
  [icon(512), 512, 'icon-512.png'],
  [maskable(512), 512, 'maskable-512.png'],
  [icon(180), 180, 'apple-touch-icon.png'],
]

for (const [svg, size, name] of jobs) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(out(name))
  console.log('wrote', name)
}
