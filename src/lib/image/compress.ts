import sharp from "sharp";

const MAX_BYTES = 512_000;
const MAX_DOWNLOAD_BYTES = 15 * 1024 * 1024;

export type CompressResult =
  | { ok: true; buffer: Buffer; mime: string; ext: string; bytes: number }
  | { ok: false; reason: string };

async function tryEncode(
  input: Buffer,
  width: number,
  quality: number
): Promise<{ buffer: Buffer; mime: string; ext: string } | null> {
  const webp = await sharp(input)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality })
    .toBuffer();
  if (webp.length <= MAX_BYTES) {
    return { buffer: webp, mime: "image/webp", ext: "webp" };
  }

  const jpeg = await sharp(input)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .jpeg({ quality, mozjpeg: true })
    .toBuffer();
  if (jpeg.length <= MAX_BYTES) {
    return { buffer: jpeg, mime: "image/jpeg", ext: "jpg" };
  }

  return null;
}

export async function compressImageFromUrl(imageUrl: string): Promise<CompressResult> {
  const res = await fetch(imageUrl, {
    headers: { Accept: "image/*" },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    return { ok: false, reason: `Image download failed: HTTP ${res.status}` };
  }

  const contentLength = res.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_DOWNLOAD_BYTES) {
    return { ok: false, reason: "Image too large to download" };
  }

  const reader = res.body?.getReader();
  if (!reader) {
    return { ok: false, reason: "Image download failed: empty body" };
  }

  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    total += value.length;
    if (total > MAX_DOWNLOAD_BYTES) {
      return { ok: false, reason: "Image too large to download" };
    }
    chunks.push(value);
  }
  const input = Buffer.concat(chunks.map((c) => Buffer.from(c)));
  if (input.length === 0) {
    return { ok: false, reason: "Empty image response" };
  }

  const attempts: [number, number][] = [
    [1080, 80],
    [1080, 65],
    [720, 60],
    [720, 45],
    [480, 40],
  ];

  for (const [width, quality] of attempts) {
    const encoded = await tryEncode(input, width, quality);
    if (encoded) {
      return {
        ok: true,
        buffer: encoded.buffer,
        mime: encoded.mime,
        ext: encoded.ext,
        bytes: encoded.buffer.length,
      };
    }
  }

  return { ok: false, reason: "Could not compress image under 500KB" };
}
