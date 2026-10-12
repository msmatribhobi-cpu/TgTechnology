import JSZip from 'jszip';
import { VirtualFile } from '../types';

/**
 * Calculates standard CRC32 checksum for binary arrays / strings
 */
function makeCRCTable(): Uint32Array {
  let c: number;
  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[n] = c;
  }
  return crcTable;
}

const CRC_TABLE = makeCRCTable();

export function crc32(buffer: Uint8Array): number {
  let crc = 0 ^ (-1);
  for (let i = 0; i < buffer.length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ buffer[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

/**
 * Generate standard PocketMine-MP executable PHAR binary file
 */
export async function generatePharBlob(files: VirtualFile[], pluginName: string = 'Plugin'): Promise<Blob> {
  const encoder = new TextEncoder();
  
  // 1. Prepare Stub
  const stubCode = `<?php
/**
 * Auto-generated PocketMine-MP plugin phar by TgTechnoLogy
 * Plugin: ${pluginName}
 */
__HALT_COMPILER(); ?>\r\n`;
  const stubBytes = encoder.encode(stubCode);

  // 2. Prepare file data and entries
  const fileEntries: {
    nameBytes: Uint8Array;
    contentBytes: Uint8Array;
    crc: number;
    mtime: number;
    flags: number;
  }[] = [];

  const now = Math.floor(Date.now() / 1000);

  for (const file of files) {
    // Clean relative path (no leading slash, forward slashes)
    let cleanPath = file.path.replace(/^\/+/, '').replace(/\\/g, '/');
    if (!cleanPath) continue;

    const contentBytes = encoder.encode(file.content);
    const nameBytes = encoder.encode(cleanPath);
    const fileCrc = crc32(contentBytes);

    fileEntries.push({
      nameBytes,
      contentBytes,
      crc: fileCrc,
      mtime: now,
      flags: 0x00000000 // uncompressed regular file
    });
  }

  // 3. Build Manifest
  // Manifest header:
  // - 4 bytes: manifest length (excluding itself)
  // - 4 bytes: number of files
  // - 2 bytes: phar api version (e.g. 0x1100 = 1.1.0)
  // - 4 bytes: global flags (0x00010000 = has signature)
  // - 4 bytes: alias length
  // - alias bytes
  // - 4 bytes: metadata length (0 = none)
  const aliasBytes = encoder.encode(pluginName.toLowerCase() + '.phar');
  
  let manifestSize = 4 + 4 + 2 + 4 + 4 + aliasBytes.length + 4; // base manifest size
  
  for (const entry of fileEntries) {
    // Each file entry in manifest:
    // - 4 bytes: filename len
    // - filename bytes
    // - 4 bytes: uncompressed size
    // - 4 bytes: timestamp
    // - 4 bytes: compressed size
    // - 4 bytes: crc32
    // - 4 bytes: flags
    // - 4 bytes: metadata len (0)
    manifestSize += 4 + entry.nameBytes.length + 4 + 4 + 4 + 4 + 4 + 4;
  }

  const manifestBuffer = new ArrayBuffer(manifestSize);
  const manifestView = new DataView(manifestBuffer);
  let offset = 0;

  // Manifest Length (excluding the 4 bytes of manifest length itself)
  manifestView.setUint32(offset, manifestSize - 4, true); offset += 4;
  // Number of files
  manifestView.setUint32(offset, fileEntries.length, true); offset += 4;
  // Phar format API (1.1.0)
  manifestView.setUint16(offset, 0x1100, true); offset += 2;
  // Global Flags
  manifestView.setUint32(offset, 0x00010000, true); offset += 4;
  // Alias
  manifestView.setUint32(offset, aliasBytes.length, true); offset += 4;
  new Uint8Array(manifestBuffer, offset, aliasBytes.length).set(aliasBytes); offset += aliasBytes.length;
  // Global Metadata length (0)
  manifestView.setUint32(offset, 0, true); offset += 4;

  // File entries in manifest
  for (const entry of fileEntries) {
    // Filename length
    manifestView.setUint32(offset, entry.nameBytes.length, true); offset += 4;
    // Filename
    new Uint8Array(manifestBuffer, offset, entry.nameBytes.length).set(entry.nameBytes); offset += entry.nameBytes.length;
    // Uncompressed file size
    manifestView.setUint32(offset, entry.contentBytes.length, true); offset += 4;
    // Timestamp
    manifestView.setUint32(offset, entry.mtime, true); offset += 4;
    // Compressed size
    manifestView.setUint32(offset, entry.contentBytes.length, true); offset += 4;
    // CRC32
    manifestView.setUint32(offset, entry.crc, true); offset += 4;
    // Flags
    manifestView.setUint32(offset, entry.flags, true); offset += 4;
    // File metadata length
    manifestView.setUint32(offset, 0, true); offset += 4;
  }

  // 4. Calculate total body size (stub + manifest + file contents)
  let totalBodySize = stubBytes.length + manifestSize;
  for (const entry of fileEntries) {
    totalBodySize += entry.contentBytes.length;
  }

  const bodyBuffer = new Uint8Array(totalBodySize);
  let bodyOffset = 0;

  // Copy stub
  bodyBuffer.set(stubBytes, bodyOffset);
  bodyOffset += stubBytes.length;

  // Copy manifest
  bodyBuffer.set(new Uint8Array(manifestBuffer), bodyOffset);
  bodyOffset += manifestSize;

  // Copy files content
  for (const entry of fileEntries) {
    bodyBuffer.set(entry.contentBytes, bodyOffset);
    bodyOffset += entry.contentBytes.length;
  }

  // 5. Signature (SHA256: 32 bytes hash + 4 bytes flag 0x00000002 + 4 bytes magic "GBMB")
  // Let's compute SHA-256 over bodyBuffer
  let sha256Buffer: ArrayBuffer;
  try {
    sha256Buffer = await crypto.subtle.digest('SHA-256', bodyBuffer);
  } catch {
    // Fallback if subtle crypto fails
    sha256Buffer = new ArrayBuffer(32);
  }

  const signatureHashBytes = new Uint8Array(sha256Buffer);
  const signatureFooter = new ArrayBuffer(32 + 4 + 4);
  const sigView = new DataView(signatureFooter);
  new Uint8Array(signatureFooter, 0, 32).set(signatureHashBytes);
  // Signature type: 0x00000002 = SHA256, 0x00000001 = MD5, 0x00000004 = SHA1
  sigView.setUint32(32, 0x00000002, true);
  // Magic: "GBMB" in ascii
  new Uint8Array(signatureFooter, 36, 4).set([0x47, 0x42, 0x4D, 0x42]);

  // Combine whole binary
  const finalBlob = new Blob([bodyBuffer, signatureFooter], { type: 'application/octet-stream' });
  return finalBlob;
}

/**
 * Generate standard ZIP archive with correct folder hierarchy
 */
export async function generateZipBlob(files: VirtualFile[]): Promise<Blob> {
  const zip = new JSZip();

  for (const file of files) {
    const cleanPath = file.path.replace(/^\/+/, '');
    if (cleanPath) {
      zip.file(cleanPath, file.content);
    }
  }

  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });
}

/**
 * Trigger browser file download
 */
export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
