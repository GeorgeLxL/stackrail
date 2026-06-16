// Generates src/app/favicon.ico from the StrantaDigital brand mark.
// No external deps — rasterizes the mark, encodes PNGs, packs them into an ICO.
// Run with: npm run favicon
import zlib from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "src", "app", "favicon.ico");

// Brand mark (viewBox 0 0 32 32): dark canvas + 3 stacked gold-gradient bars.
const BG = [8, 8, 10];
const GRAD_FROM = [239, 215, 147]; // #efd793
const GRAD_TO = [180, 144, 31]; // #b4901f
const BARS = [
  [3, 6, 26, 4.2, 1.0],
  [8, 13.9, 21, 4.2, 0.62],
  [13, 21.8, 16, 4.2, 0.36],
];
const SIZES = [16, 32, 48, 64];

// --- CRC32 (for PNG chunks) ---
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
function pngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, "latin1");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}

// 2x2 supersampled rasterization for light anti-aliasing.
function sample(px, py, N) {
  const scale = N / 32;
  let r = BG[0], g = BG[1], b = BG[2];
  for (const [bx, by, bw, bh, op] of BARS) {
    const x0 = bx * scale, x1 = (bx + bw) * scale;
    const y0 = by * scale, y1 = (by + bh) * scale;
    if (px >= x0 && px < x1 && py >= y0 && py < y1) {
      const t = Math.min(1, Math.max(0, (px / N + py / N) / 2));
      const gr = GRAD_FROM[0] + (GRAD_TO[0] - GRAD_FROM[0]) * t;
      const gg = GRAD_FROM[1] + (GRAD_TO[1] - GRAD_FROM[1]) * t;
      const gb = GRAD_FROM[2] + (GRAD_TO[2] - GRAD_FROM[2]) * t;
      r = r * (1 - op) + gr * op;
      g = g * (1 - op) + gg * op;
      b = b * (1 - op) + gb * op;
    }
  }
  return [r, g, b];
}

function makePng(N) {
  const px = Buffer.alloc(N * N * 4);
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      let r = 0, g = 0, b = 0;
      for (const ox of [0.25, 0.75])
        for (const oy of [0.25, 0.75]) {
          const [sr, sg, sb] = sample(x + ox, y + oy, N);
          r += sr; g += sg; b += sb;
        }
      const i = (y * N + x) * 4;
      px[i] = Math.round(r / 4);
      px[i + 1] = Math.round(g / 4);
      px[i + 2] = Math.round(b / 4);
      px[i + 3] = 255;
    }
  }
  const stride = N * 4 + 1;
  const raw = Buffer.alloc(N * stride);
  for (let y = 0; y < N; y++) {
    raw[y * stride] = 0; // filter: none
    px.copy(raw, y * stride + 1, y * N * 4, (y + 1) * N * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(N, 0);
  ihdr.writeUInt32BE(N, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

// --- Pack PNGs into an ICO ---
const pngs = SIZES.map(makePng);
const header = Buffer.alloc(6);
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(SIZES.length, 4);
const entries = Buffer.alloc(16 * SIZES.length);
let offset = 6 + entries.length;
pngs.forEach((png, i) => {
  const e = i * 16;
  entries[e] = SIZES[i] >= 256 ? 0 : SIZES[i];
  entries[e + 1] = SIZES[i] >= 256 ? 0 : SIZES[i];
  entries.writeUInt16LE(1, e + 4); // planes
  entries.writeUInt16LE(32, e + 6); // bpp
  entries.writeUInt32LE(png.length, e + 8);
  entries.writeUInt32LE(offset, e + 12);
  offset += png.length;
});

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, Buffer.concat([header, entries, ...pngs]));
console.log(`✓ Wrote ${OUT} (${SIZES.join(", ")} px)`);
