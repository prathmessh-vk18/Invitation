/** Shared by compress-media.mjs and copy-media-to-r2.mts: how couples' songs and photos are made smaller. */
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import sharp from "sharp";

const run = promisify(execFile);
const ffmpeg = process.env.FFMPEG || "ffmpeg";

/** 96 kbps keeps a song clear on phone speakers at about a third of a typical upload. */
export async function smallerSong(buf, type) {
  // A WAV would become an MP3 at a .wav address. Chrome plays that, but it isn't worth the risk on iPhones.
  if (type.includes("wav")) return { buf, type };
  const dir = await mkdtemp(join(tmpdir(), "song-"));
  try {
    const input = join(dir, "in");
    await writeFile(input, buf);
    const m4a = type.includes("mp4") || type.includes("m4a");
    const output = join(dir, m4a ? "out.m4a" : "out.mp3");
    const codec = m4a ? ["-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart"] : ["-c:a", "libmp3lame", "-b:a", "96k"];
    // -map 0:a drops cover art embedded in the file, which guests never see.
    await run(ffmpeg, ["-y", "-loglevel", "error", "-i", input, "-map", "0:a:0", "-map_metadata", "-1", "-ac", "2", ...codec, output]);
    return { buf: await readFile(output), type: m4a ? type : "audio/mpeg" };
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

/** 1280px on the long side is sharp even full screen on a phone. */
export async function smallerPhoto(buf) {
  const out = await sharp(buf).rotate().resize({ width: 1280, height: 1280, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 80, mozjpeg: true }).toBuffer();
  return { buf: out, type: "image/jpeg" };
}
