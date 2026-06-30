// Pure binary metadata embedding — zero re-encoding, zero quality loss.
// JPEG: XMP (APP1) + IPTC (APP13) injected after SOI/APP0, image data untouched.
// PNG:  iTXt + XMP:com.adobe.xmp chunks injected after IHDR.
// WebP: XMP chunk injected into RIFF container, bitstream untouched.
// ZIP:  STORE-method ZIP (no compression) for bulk export packages.

export interface EmbedMetadata {
  title: string;
  description: string;
  keywords: string[];
  copyright?: string;
  creator?: string;  // author / byline
  rating?: number;   // 1–5 XMP star rating
}

export type EmbedStage = 'reading' | 'embedding' | 'done';

// ─── XML helpers ──────────────────────────────────────────────────────────────

function escX(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function buildXMPXML(m: EmbedMetadata, dpi?: { x: number; y: number }): string {
  const kws = m.keywords.map(k => `      <rdf:li>${escX(k)}</rdf:li>`).join('\n');
  const rights = m.copyright
    ? `\n   <dc:rights><rdf:Alt><rdf:li xml:lang="x-default">${escX(m.copyright)}</rdf:li></rdf:Alt></dc:rights>`
    : '';
  const creator = m.creator
    ? `\n   <dc:creator><rdf:Seq><rdf:li>${escX(m.creator)}</rdf:li></rdf:Seq></dc:creator>`
    : '';
  const rating = m.rating && m.rating >= 1 && m.rating <= 5
    ? `\n   <xmp:Rating>${m.rating}</xmp:Rating>`
    : '';
  // Include tiff namespace DPI fields so apps that read XMP first (e.g. Photoshop) get correct resolution
  const tiffNs = dpi ? '\n    xmlns:tiff="http://ns.adobe.com/tiff/1.0/"' : '';
  const resolution = dpi
    ? `\n   <tiff:XResolution>${dpi.x}</tiff:XResolution>` +
      `\n   <tiff:YResolution>${dpi.y}</tiff:YResolution>` +
      `\n   <tiff:ResolutionUnit>2</tiff:ResolutionUnit>`
    : '';
  return `<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
 <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about=""
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:xmp="http://ns.adobe.com/xap/1.0/"
    xmlns:photoshop="http://ns.adobe.com/photoshop/1.0/"${tiffNs}>
   <dc:title><rdf:Alt><rdf:li xml:lang="x-default">${escX(m.title)}</rdf:li></rdf:Alt></dc:title>
   <dc:description><rdf:Alt><rdf:li xml:lang="x-default">${escX(m.description)}</rdf:li></rdf:Alt></dc:description>
   <dc:subject>
    <rdf:Bag>
${kws}
    </rdf:Bag>
   </dc:subject>${rights}${creator}
   <photoshop:Headline>${escX(m.title)}</photoshop:Headline>${rating}${resolution}
  </rdf:Description>
 </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;
}

// ─── Byte helpers ─────────────────────────────────────────────────────────────

const ENC = new TextEncoder();

function bytesMatch(buf: Uint8Array, offset: number, needle: Uint8Array): boolean {
  if (offset + needle.length > buf.length) return false;
  for (let i = 0; i < needle.length; i++) if (buf[offset + i] !== needle[i]) return false;
  return true;
}

function concat(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((s, a) => s + a.length, 0);
  const out = new Uint8Array(total);
  let p = 0;
  for (const a of arrays) { out.set(a, p); p += a.length; }
  return out;
}

function u16BE(n: number): Uint8Array {
  return new Uint8Array([(n >> 8) & 0xFF, n & 0xFF]);
}

function u16LE(n: number): Uint8Array {
  return new Uint8Array([n & 0xFF, (n >> 8) & 0xFF]);
}

function u32BE(n: number): Uint8Array {
  return new Uint8Array([(n >> 24) & 0xFF, (n >> 16) & 0xFF, (n >> 8) & 0xFF, n & 0xFF]);
}

function u32LE(n: number): Uint8Array {
  return new Uint8Array([n & 0xFF, (n >> 8) & 0xFF, (n >> 16) & 0xFF, (n >> 24) & 0xFF]);
}

// ─── JPEG XMP segment (APP1 = FF E1) ─────────────────────────────────────────

function buildJPEGXMP(m: EmbedMetadata, dpi?: { x: number; y: number }): Uint8Array {
  const ns = ENC.encode('http://ns.adobe.com/xap/1.0/\0');
  let xml = ENC.encode(buildXMPXML(m, dpi));
  // Truncate keywords if over APP1 max (65533 - ns.length)
  while (ns.length + xml.length + 2 > 65535) {
    const km = { ...m, keywords: m.keywords.slice(0, Math.floor(m.keywords.length * 0.8)) };
    xml = ENC.encode(buildXMPXML(km, dpi));
    if (km.keywords.length === 0) break;
  }
  const payLen = ns.length + xml.length + 2; // +2 for length field itself
  return concat(
    new Uint8Array([0xFF, 0xE1]),
    u16BE(payLen),
    ns,
    xml,
  );
}

// ─── JPEG IPTC segment (APP13 = FF ED, Photoshop 3.0 wrapper) ────────────────

function buildIPTCRecord(dataset: number, data: Uint8Array): Uint8Array {
  return concat(
    new Uint8Array([0x1C, 0x02, dataset]),
    u16BE(data.length),
    data,
  );
}

function buildJPEGIPTC(m: EmbedMetadata): Uint8Array {
  const records: Uint8Array[] = [];

  const addRec = (ds: number, str: string, max: number) => {
    const d = ENC.encode(str.slice(0, max));
    if (d.length) records.push(buildIPTCRecord(ds, d));
  };

  addRec(0x05, m.title, 64);          // Object Name (title)
  addRec(0x69, m.title, 256);         // Headline (title — read by Adobe Stock)
  addRec(0x78, m.description, 2000);  // Caption/Abstract (description)
  for (const kw of m.keywords.slice(0, 50)) addRec(0x19, kw, 64); // Keywords
  if (m.copyright) addRec(0x74, m.copyright, 128); // Copyright
  if (m.creator)   addRec(0x50, m.creator, 32);    // Byline (author)

  let iptc = concat(...records);
  // IPTC data must be even-length
  if (iptc.length % 2 !== 0) iptc = concat(iptc, new Uint8Array([0x00]));

  const psHeader = ENC.encode('Photoshop 3.0\0');
  const bim      = new Uint8Array([0x38, 0x42, 0x49, 0x4D]); // 8BIM
  const resId    = new Uint8Array([0x04, 0x04]);               // IPTC-NAA
  const pascal   = new Uint8Array([0x00, 0x00]);               // empty name, padded

  const payload = concat(psHeader, bim, resId, pascal, u32BE(iptc.length), iptc);
  const payLen  = payload.length + 2; // +2 for the length field itself
  if (payLen > 65535) return new Uint8Array(0); // safety: skip if too large

  return concat(new Uint8Array([0xFF, 0xED]), u16BE(payLen), payload);
}

// ─── JPEG DPI reader (JFIF APP0 → EXIF IFD0) ─────────────────────────────────
// Returns dots-per-inch from the original file so it can be re-embedded after
// metadata injection (otherwise apps that read XMP first default to 96 dpi).

function readJPEGDPI(bytes: Uint8Array): { x: number; y: number } | null {
  if (bytes.length < 4 || bytes[0] !== 0xFF || bytes[1] !== 0xD8) return null;
  let pos = 2;
  while (pos + 4 <= bytes.length) {
    if (bytes[pos] !== 0xFF) break;
    const marker = bytes[pos + 1];
    if (marker === 0xD9 || marker === 0xDA) break;
    if (marker >= 0xD0 && marker <= 0xD7) { pos += 2; continue; }
    const segLen = (bytes[pos + 2] << 8) | bytes[pos + 3];
    const d = pos + 4; // first payload byte

    // ── JFIF APP0 ──────────────────────────────────────────────────────────
    if (marker === 0xE0 && segLen >= 14 && d + 11 < bytes.length) {
      if (bytes[d]===0x4A && bytes[d+1]===0x46 && bytes[d+2]===0x49 && bytes[d+3]===0x46 && bytes[d+4]===0x00) {
        const unit = bytes[d + 7];
        const xd = (bytes[d + 8] << 8) | bytes[d + 9];
        const yd = (bytes[d + 10] << 8) | bytes[d + 11];
        if (unit === 1 && xd > 0 && yd > 0) return { x: xd, y: yd };
        if (unit === 2 && xd > 0 && yd > 0) return { x: Math.round(xd * 2.54), y: Math.round(yd * 2.54) };
      }
    }

    // ── EXIF APP1 ──────────────────────────────────────────────────────────
    if (marker === 0xE1 && segLen > 10 && d + 5 < bytes.length) {
      if (bytes[d]===0x45 && bytes[d+1]===0x78 && bytes[d+2]===0x69 && bytes[d+3]===0x66 && bytes[d+4]===0x00 && bytes[d+5]===0x00) {
        const t = d + 6; // TIFF header base
        if (t + 8 > bytes.length) { pos += 2 + segLen; continue; }
        const le = bytes[t] === 0x49; // 'II' = little-endian
        const r16 = (o: number) => le ? (bytes[t+o] | (bytes[t+o+1] << 8)) : ((bytes[t+o] << 8) | bytes[t+o+1]);
        const r32 = (o: number) => (le
          ? (bytes[t+o] | (bytes[t+o+1]<<8) | (bytes[t+o+2]<<16) | (bytes[t+o+3]<<24))
          : ((bytes[t+o]<<24) | (bytes[t+o+1]<<16) | (bytes[t+o+2]<<8) | bytes[t+o+3])) >>> 0;
        if (r16(2) !== 42) { pos += 2 + segLen; continue; }
        const ifd0 = t + r32(4);
        if (ifd0 + 2 > bytes.length) { pos += 2 + segLen; continue; }
        const nTags = r16(ifd0 - t);
        let xRes = 0, yRes = 0, resUnit = 2;
        for (let i = 0; i < nTags && i < 64; i++) {
          const e = ifd0 + 2 + i * 12;
          if (e + 12 > bytes.length) break;
          const tag  = le ? (bytes[e] | (bytes[e+1]<<8)) : ((bytes[e]<<8) | bytes[e+1]);
          const type = le ? (bytes[e+2] | (bytes[e+3]<<8)) : ((bytes[e+2]<<8) | bytes[e+3]);
          if (tag === 0x0128 && type === 3) {
            resUnit = le ? (bytes[e+8] | (bytes[e+9]<<8)) : ((bytes[e+8]<<8) | bytes[e+9]);
          }
          if ((tag === 0x011A || tag === 0x011B) && type === 5) {
            const relOff = (le
              ? (bytes[e+8] | (bytes[e+9]<<8) | (bytes[e+10]<<16) | (bytes[e+11]<<24))
              : ((bytes[e+8]<<24) | (bytes[e+9]<<16) | (bytes[e+10]<<8) | bytes[e+11])) >>> 0;
            const vOff = t + relOff;
            if (vOff + 8 <= bytes.length) {
              const num = (le
                ? (bytes[vOff] | (bytes[vOff+1]<<8) | (bytes[vOff+2]<<16) | (bytes[vOff+3]<<24))
                : ((bytes[vOff]<<24) | (bytes[vOff+1]<<16) | (bytes[vOff+2]<<8) | bytes[vOff+3])) >>> 0;
              const den = (le
                ? (bytes[vOff+4] | (bytes[vOff+5]<<8) | (bytes[vOff+6]<<16) | (bytes[vOff+7]<<24))
                : ((bytes[vOff+4]<<24) | (bytes[vOff+5]<<16) | (bytes[vOff+6]<<8) | bytes[vOff+7])) >>> 0;
              const val = den > 0 ? num / den : 0;
              if (tag === 0x011A) xRes = val;
              else yRes = val;
            }
          }
        }
        if (xRes > 0 && yRes > 0) {
          if (resUnit === 3) return { x: Math.round(xRes * 2.54), y: Math.round(yRes * 2.54) };
          return { x: Math.round(xRes), y: Math.round(yRes) };
        }
      }
    }

    pos += 2 + segLen;
  }
  return null;
}

// Builds a minimal JFIF APP0 segment with the given DPI (dots per inch).
function buildJFIFAPP0(dpiX: number, dpiY: number): Uint8Array {
  const seg = new Uint8Array(18);
  seg[0]=0xFF; seg[1]=0xE0;                                           // APP0 marker
  seg[2]=0x00; seg[3]=0x10;                                           // length = 16
  seg[4]=0x4A; seg[5]=0x46; seg[6]=0x49; seg[7]=0x46; seg[8]=0x00;  // "JFIF\0"
  seg[9]=0x01; seg[10]=0x01;                                          // version 1.1
  seg[11]=0x01;                                                        // density unit: DPI
  seg[12]=(dpiX>>8)&0xFF; seg[13]=dpiX&0xFF;                         // Xdensity (BE)
  seg[14]=(dpiY>>8)&0xFF; seg[15]=dpiY&0xFF;                         // Ydensity (BE)
  seg[16]=0x00; seg[17]=0x00;                                         // no thumbnail
  return seg;
}

// ─── JPEG embedding (parse markers, strip old XMP/IPTC, insert new) ───────────

function embedInJPEG(buf: ArrayBuffer, m: EmbedMetadata): ArrayBuffer {
  const bytes = new Uint8Array(buf);
  if (bytes[0] !== 0xFF || bytes[1] !== 0xD8) throw new Error('Not a valid JPEG file');

  // Extract DPI from the original file before modifying anything.
  // This covers both JFIF APP0 (density_unit 1/2) and EXIF IFD0 (XResolution/YResolution).
  const dpi = readJPEGDPI(bytes);

  const XMP_NS = ENC.encode('http://ns.adobe.com/xap/1.0/\0');
  const PS_HDR = ENC.encode('Photoshop 3.0\0');

  const kept: Uint8Array[] = [];
  let pos = 0;

  // SOI
  kept.push(bytes.slice(0, 2));
  pos = 2;

  while (pos < bytes.length) {
    if (bytes[pos] !== 0xFF) { kept.push(bytes.slice(pos)); break; }
    const marker = bytes[pos + 1];
    if (marker === 0xD9) { kept.push(bytes.slice(pos)); break; }
    if (marker === 0xD8) { pos += 2; continue; }
    if (marker >= 0xD0 && marker <= 0xD7) { kept.push(bytes.slice(pos, pos + 2)); pos += 2; continue; }
    if (pos + 3 >= bytes.length) break;

    const len    = (bytes[pos + 2] << 8) | bytes[pos + 3];
    const segEnd = pos + 2 + len;

    let skip = false;
    if (marker === 0xE0)                                         skip = true; // replace APP0 with DPI-correct one
    if (marker === 0xE1 && bytesMatch(bytes, pos + 4, XMP_NS))  skip = true; // replace XMP
    if (marker === 0xED && bytesMatch(bytes, pos + 4, PS_HDR))  skip = true; // replace IPTC
    // Original EXIF (APP1 "Exif\0\0") is kept — preserves XResolution/YResolution/ResolutionUnit.

    if (!skip) kept.push(bytes.slice(pos, segEnd));
    if (marker === 0xDA) { kept.push(bytes.slice(segEnd)); break; }
    pos = segEnd;
  }

  // Inject immediately after SOI (index 0 = SOI):
  //   1. JFIF APP0  — density_unit=1 (DPI) so Windows/WIC reads correct resolution
  //   2. XMP APP1   — tiff:XResolution/YResolution so Photoshop/Bridge read correct resolution
  //   3. IPTC APP13 — title, description, keywords, copyright
  // Original EXIF segment follows in `kept` (third metadata path for resolution).
  const toInject: Uint8Array[] = [];
  if (dpi) toInject.push(buildJFIFAPP0(dpi.x, dpi.y));
  toInject.push(buildJPEGXMP(m, dpi ?? undefined), buildJPEGIPTC(m));

  return concat(kept[0], ...toInject, ...kept.slice(1)).buffer as ArrayBuffer;
}

// ─── PNG CRC32 ────────────────────────────────────────────────────────────────

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[i] = c;
  }
  return t;
})();

function crc32(data: Uint8Array): number {
  let crc = 0xFFFFFFFF;
  for (const b of data) crc = CRC_TABLE[(crc ^ b) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function buildPNGiTXt(keyword: string, text: string): Uint8Array {
  const kw   = ENC.encode(keyword);
  const tx   = ENC.encode(text);
  // iTXt data: keyword\0 + compressionFlag(0) + compressionMethod(0) + language\0 + translatedKw\0 + text
  const data = concat(kw, new Uint8Array([0, 0, 0, 0, 0]), tx);
  const type = new Uint8Array([0x69, 0x54, 0x58, 0x74]); // "iTXt"
  const crcIn = concat(type, data);
  const checksum = crc32(crcIn);
  return concat(u32BE(data.length), type, data, u32BE(checksum));
}

// ─── PNG embedding ────────────────────────────────────────────────────────────

function embedInPNG(buf: ArrayBuffer, m: EmbedMetadata): ArrayBuffer {
  const bytes = new Uint8Array(buf);
  const MAGIC = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  for (let i = 0; i < 8; i++) if (bytes[i] !== MAGIC[i]) throw new Error('Not a valid PNG file');

  const dv = new DataView(buf);
  const ihdrLen = dv.getUint32(8, false);
  const ihdrEnd = 8 + 4 + 4 + ihdrLen + 4; // magic + length + type + data + crc

  // Strip existing text/XMP chunks, keep everything else
  const before: Uint8Array[] = [bytes.slice(0, ihdrEnd)];
  const after:  Uint8Array[] = [];
  let pos = ihdrEnd;

  while (pos < bytes.length - 8) {
    const chunkLen  = dv.getUint32(pos, false);
    const typeBytes = bytes.slice(pos + 4, pos + 8);
    const typeStr   = String.fromCharCode(...typeBytes);
    const chunkEnd  = pos + 4 + 4 + chunkLen + 4;

    const skipTypes = ['tEXt', 'zTXt', 'iTXt'];
    if (!skipTypes.includes(typeStr)) {
      after.push(bytes.slice(pos, chunkEnd));
    }
    pos = chunkEnd;
  }

  // Build new text + XMP chunks
  const newChunks = [
    buildPNGiTXt('Title',               m.title),
    buildPNGiTXt('Description',         m.description),
    buildPNGiTXt('Comment',             m.description),
    buildPNGiTXt('Keywords',            m.keywords.join(', ')),
    ...(m.copyright ? [buildPNGiTXt('Copyright', m.copyright)] : []),
    ...(m.creator   ? [buildPNGiTXt('Author',    m.creator)]   : []),
    ...(m.rating    ? [buildPNGiTXt('Rating',    String(m.rating))] : []),
    buildPNGiTXt('XML:com.adobe.xmp',  buildXMPXML(m)), // Photoshop XMP
  ];

  return concat(...before, ...newChunks, ...after).buffer as ArrayBuffer;
}

// ─── WebP embedding ───────────────────────────────────────────────────────────

async function embedInWebP(
  buf: ArrayBuffer,
  m: EmbedMetadata,
  dims: { w: number; h: number }
): Promise<ArrayBuffer> {
  const bytes = new Uint8Array(buf);
  const dv    = new DataView(buf);

  const riff = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
  const webp = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
  if (riff !== 'RIFF' || webp !== 'WEBP') throw new Error('Not a valid WebP file');

  const xmpData  = ENC.encode(buildXMPXML(m));
  const xmpPad   = xmpData.length % 2 !== 0 ? concat(xmpData, new Uint8Array([0])) : xmpData;

  function makeChunk(type: string, data: Uint8Array): Uint8Array {
    const t = ENC.encode(type.padEnd(4, ' ').slice(0, 4));
    const padded = data.length % 2 !== 0 ? concat(data, new Uint8Array([0])) : data;
    return concat(t, u32LE(data.length), padded);
  }

  // Parse existing chunks
  const chunks: { type: string; data: Uint8Array }[] = [];
  let offset = 12;
  let fileType = 'VP8 ';

  while (offset + 8 <= bytes.length) {
    const type  = String.fromCharCode(bytes[offset], bytes[offset+1], bytes[offset+2], bytes[offset+3]);
    const size  = dv.getUint32(offset + 4, true);
    const data  = bytes.slice(offset + 8, offset + 8 + size);
    if (['VP8 ', 'VP8L', 'VP8X'].includes(type)) fileType = type;
    if (type !== 'XMP ') chunks.push({ type, data }); // drop old XMP
    offset += 8 + size + (size % 2);
  }

  const xmpChunk = makeChunk('XMP ', xmpPad);

  if (fileType === 'VP8X') {
    // Already extended — update flags, drop old XMP, append new XMP
    const vp8x = chunks.find(c => c.type === 'VP8X');
    if (vp8x && vp8x.data.length >= 4) {
      const flags = new DataView(vp8x.data.buffer, vp8x.data.byteOffset).getUint32(0, true);
      new DataView(vp8x.data.buffer, vp8x.data.byteOffset).setUint32(0, flags | 0x04, true); // XMP flag bit 2
    }
    const allChunks = concat(
      ...chunks.map(c => makeChunk(c.type, c.data)),
      xmpChunk,
    );
    const riffData = concat(ENC.encode('WEBP'), allChunks);
    return concat(ENC.encode('RIFF'), u32LE(riffData.length), riffData).buffer as ArrayBuffer;
  }

  // Simple VP8/VP8L — promote to VP8X
  const { w, h } = dims;
  if (w === 0 || h === 0) return buf; // can't determine dims, return original

  const vp8xData = new Uint8Array(10);
  const vdv = new DataView(vp8xData.buffer);
  vdv.setUint32(0, 0x04, true); // XMP flag
  // Canvas Width Minus One (24-bit LE)
  vp8xData[4] = (w - 1) & 0xFF; vp8xData[5] = ((w-1) >> 8) & 0xFF; vp8xData[6] = ((w-1) >> 16) & 0xFF;
  // Canvas Height Minus One (24-bit LE)
  vp8xData[7] = (h - 1) & 0xFF; vp8xData[8] = ((h-1) >> 8) & 0xFF; vp8xData[9] = ((h-1) >> 16) & 0xFF;

  const mainChunk = chunks.find(c => c.type === 'VP8 ' || c.type === 'VP8L');
  if (!mainChunk) return buf;

  const allChunks = concat(
    makeChunk('VP8X', vp8xData),
    makeChunk(mainChunk.type, mainChunk.data),
    xmpChunk,
  );
  const riffData = concat(ENC.encode('WEBP'), allChunks);
  return concat(ENC.encode('RIFF'), u32LE(riffData.length), riffData).buffer as ArrayBuffer;
}

// ─── EPS embedding (XMP in PostScript DSC comment wrapper) ───────────────────
// Inserts an XMP packet after the first %!PS line, stripping any pre-existing one.

function embedInEPS(buf: ArrayBuffer, m: EmbedMetadata): ArrayBuffer {
  const DEC  = new TextDecoder('utf-8', { fatal: false });
  let text   = DEC.decode(buf);

  // Strip existing XMP annotation
  text = text.replace(/%ADO_ContainsXMP:[^\n]*\n?/g, '');
  text = text.replace(/%%BeginXMP[\s\S]*?%%EndXMP\n?/g, '');

  const xmpBlock =
    '%ADO_ContainsXMP: MainFirst\n' +
    '%%BeginXMP\n' +
    buildXMPXML(m) + '\n' +
    '%%EndXMP\n';

  // Insert immediately after the first line (%!PS-Adobe-... header)
  const firstLF = text.indexOf('\n');
  const result  = firstLF === -1
    ? xmpBlock + text
    : text.slice(0, firstLF + 1) + xmpBlock + text.slice(firstLF + 1);

  return ENC.encode(result).buffer as ArrayBuffer;
}

// ─── Image dimensions (async, browser Image API) ──────────────────────────────

function getImageDimensions(file: File): Promise<{ w: number; h: number }> {
  return new Promise(resolve => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload  = () => { URL.revokeObjectURL(url); resolve({ w: img.naturalWidth,  h: img.naturalHeight }); };
    img.onerror = () => { URL.revokeObjectURL(url); resolve({ w: 0, h: 0 }); };
    img.src = url;
  });
}

// ─── Public: single image embed ───────────────────────────────────────────────

export async function embedMetadata(
  file: File,
  meta: EmbedMetadata,
  onProgress?: (stage: EmbedStage) => void,
): Promise<{ blob: Blob; filename: string; warning?: string }> {
  onProgress?.('reading');
  const [buffer, dims] = await Promise.all([file.arrayBuffer(), getImageDimensions(file)]);

  onProgress?.('embedding');
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const mime = file.type || `image/${ext}`;
  let result: ArrayBuffer;
  let warning: string | undefined;

  try {
    if (mime.includes('jpeg') || mime.includes('jpg') || ext === 'jpg' || ext === 'jpeg') {
      result = embedInJPEG(buffer, meta);
    } else if (mime.includes('png') || ext === 'png') {
      result = embedInPNG(buffer, meta);
    } else if (mime.includes('webp') || ext === 'webp') {
      result = await embedInWebP(buffer, meta, dims);
    } else if (ext === 'eps' || mime.includes('postscript') || mime === 'application/eps' || mime === 'image/x-eps') {
      result = embedInEPS(buffer, meta);
    } else {
      throw new Error(`Unsupported format: ${file.type || ext}`);
    }
  } catch (err) {
    result  = buffer;
    warning = err instanceof Error ? err.message : 'Embedding failed — original file returned';
  }

  onProgress?.('done');
  return {
    blob: new Blob([result], { type: mime }),
    filename: file.name,
    warning,
  };
}

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

// ─── ZIP builder (STORE method, no compression) ───────────────────────────────

function buildZIP(files: Array<{ name: string; data: Uint8Array }>): Uint8Array {
  const now     = new Date();
  const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
  const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();

  const locals:   Uint8Array[] = [];
  const centrals: Uint8Array[] = [];
  let localOffset = 0;

  for (const file of files) {
    const nameBytes = ENC.encode(file.name);
    const checksum  = crc32(file.data);
    const size      = file.data.length;

    const local = concat(
      new Uint8Array([0x50, 0x4B, 0x03, 0x04]), // PK local header sig
      u16LE(20), u16LE(0), u16LE(0),             // version needed, flags, STORE
      u16LE(dosTime), u16LE(dosDate),
      u32LE(checksum), u32LE(size), u32LE(size),
      u16LE(nameBytes.length), u16LE(0),         // name len, extra len
      nameBytes, file.data,
    );

    const central = concat(
      new Uint8Array([0x50, 0x4B, 0x01, 0x02]), // PK central dir sig
      u16LE(20), u16LE(20), u16LE(0), u16LE(0), // version by/needed, flags, STORE
      u16LE(dosTime), u16LE(dosDate),
      u32LE(checksum), u32LE(size), u32LE(size),
      u16LE(nameBytes.length), u16LE(0), u16LE(0), // name len, extra len, comment len
      u16LE(0), u16LE(0), u32LE(0),               // disk start, int attrs, ext attrs
      u32LE(localOffset),
      nameBytes,
    );

    locals.push(local);
    centrals.push(central);
    localOffset += local.length;
  }

  const localData   = concat(...locals);
  const centralData = concat(...centrals);

  const eocd = concat(
    new Uint8Array([0x50, 0x4B, 0x05, 0x06]), // PK end-of-central-dir sig
    u16LE(0), u16LE(0),                        // disk num, CD start disk
    u16LE(files.length), u16LE(files.length),  // entries on disk, total entries
    u32LE(centralData.length),
    u32LE(localData.length),                   // offset of central dir
    u16LE(0),                                  // comment length
  );

  return concat(localData, centralData, eocd);
}

// ─── Public: ZIP package export ───────────────────────────────────────────────

export interface ZIPItem {
  imageFile: File;
  meta: EmbedMetadata;
  outputFilename: string; // title-derived filename (already sanitized + deduplicated)
}

export async function buildZIPPackage(
  items: ZIPItem[],
  csvContent: string,
  onProgress?: (done: number, total: number) => void,
): Promise<Blob> {
  const files: Array<{ name: string; data: Uint8Array }> = [];

  for (let i = 0; i < items.length; i++) {
    onProgress?.(i, items.length);
    const { imageFile, meta, outputFilename } = items[i];

    // Embed metadata into image (fall back to original on failure — zero re-encoding)
    let imageData: Uint8Array;
    try {
      const { blob } = await embedMetadata(imageFile, meta);
      imageData = new Uint8Array(await blob.arrayBuffer());
    } catch {
      imageData = new Uint8Array(await imageFile.arrayBuffer());
    }

    files.push({ name: outputFilename, data: imageData });
  }

  // Single CSV — no TXT files
  files.push({ name: 'Metadata.csv', data: ENC.encode(csvContent) });

  onProgress?.(items.length, items.length);
  const zipBytes = buildZIP(files);
  return new Blob([new Uint8Array(zipBytes)], { type: 'application/zip' });
}
