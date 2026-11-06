import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { getInvite, invites, type Invite } from "@/data/invites";
import { getTemplate } from "@/data/templates";
import { couple } from "@/invites/people";
import { getPublishedInvite } from "@/lib/invites-db";
import { longDate } from "@/lib/format";

// The couple's own share preview: their names, date and city over their design's painting, with
// no Aavjoo branding or price. WhatsApp builds the preview on the sender's phone, so this is
// fetched when a link is shared, not when guests open it. Demo cards are built at deploy time; a
// couple's card is built on its first share and kept until their invite changes (`invite:<slug>`).
export const alt = "Wedding invitation";
export const size = { width: 1200, height: 630 };
// Sent as a JPEG: the painted designs come out at 1–1.8 MB as PNG, and WhatsApp skips a preview
// image that large. As JPEG they are a few hundred KB.
export const contentType = "image/jpeg";

export function generateStaticParams() {
  return invites.map((i) => ({ slug: i.slug }));
}

// Each path is written out in full so only these files ship with this route, and they're read
// once when the module loads (see app/opengraph-image.tsx).
const jpg = async (file: Promise<Buffer>) => `data:image/jpeg;base64,${(await file).toString("base64")}`;
const [fraunces, geist, mandir, haveli, mahal, khat, gopuram, bagh, shiv, khatRed] = await Promise.all([
  readFile(join(process.cwd(), "src/app/i/[slug]/Fraunces-Medium.ttf")),
  readFile(join(process.cwd(), "src/app/i/[slug]/Geist-Medium.ttf")),
  jpg(readFile(join(process.cwd(), "public/art/illus/mandir-temple.jpg"))),
  jpg(readFile(join(process.cwd(), "public/art/illus/haveli-arrival.jpg"))),
  jpg(readFile(join(process.cwd(), "public/art/illus/mahal-hero.jpg"))),
  jpg(readFile(join(process.cwd(), "public/art/illus/khat-hero.jpg"))),
  jpg(readFile(join(process.cwd(), "public/art/illus/gopuram-hero.jpg"))),
  jpg(readFile(join(process.cwd(), "public/art/illus/bagh-hero.jpg"))),
  jpg(readFile(join(process.cwd(), "public/art/illus/shiv-share.jpg"))),
  jpg(readFile(join(process.cwd(), "public/art/illus/khat-red-hero.jpg"))),
]);

// The painted designs' hero art fills the card. The art is portrait (864×1536), so at the card's
// width only a band of it shows; `y` is where that band starts, as a share of the art's height,
// chosen so the landmark sits under the names. Only Mandir and Khat paint the couple from behind;
// the others stop above the couple, so no faces appear on a shared preview.
const ART_HEIGHT = Math.round((1200 * 1536) / 864);
const scenes: Record<string, { src: string; y: number }> = {
  // Shiv's palm and Parvati's foot about to meet: no faces at all.
  gaurishankar: { src: shiv, y: 0.27 },
  mandir: { src: mandir, y: 0.45 },
  haveli: { src: haveli, y: 0.16 },
  mahal: { src: mahal, y: 0.15 },
  khat: { src: khat, y: 0.45 },
  khatred: { src: khatRed, y: 0.42 },
  gopuram: { src: gopuram, y: 0.19 },
  bagh: { src: bagh, y: 0.21 },
};

async function resolve(slug: string): Promise<Invite | null> {
  return getInvite(slug) ?? (await getPublishedInvite(slug))?.invite ?? null;
}

/** Names on one line, as large as fits the card. */
const nameSize = (names: string) => (names.length <= 18 ? 104 : names.length <= 24 ? 84 : names.length <= 30 ? 70 : 58);

// Satori has no `inset`, so full-card layers spell out their box.
const layer = { position: "absolute", top: 0, left: 0, width: 1200, height: 630, display: "flex" } as const;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const invite = await resolve((await params).slug);
  if (!invite) notFound();
  const t = getTemplate(invite.template)!;
  const [a, b] = couple(invite);
  const names = `${a.first} & ${b.first}`;
  const scene = scenes[invite.template];
  // Over a painting the text is deep maroon on a light wash; on a plain card it takes the design's
  // own pair of colours (gold on maroon for Rajwada, and so on).
  const ink = scene ? "#3a1218" : t.icon.fg;

  const card = new ImageResponse(
    (
      <div style={{ ...layer, position: "relative", overflow: "hidden", fontFamily: "Geist", background: t.icon.bg }}>
        {scene ? (
          <>
            <img src={scene.src} width={1200} height={ART_HEIGHT} style={{ position: "absolute", top: -Math.round(ART_HEIGHT * scene.y), left: 0, width: 1200, height: ART_HEIGHT }} alt="" />
            <div style={{ ...layer, backgroundImage: "linear-gradient(180deg, rgba(255,248,238,0.78) 0%, rgba(255,248,238,0.45) 38%, rgba(255,248,238,0) 58%)" }} />
          </>
        ) : (
          <>
            <div style={{ ...layer, backgroundImage: "radial-gradient(circle at 50% 45%, rgba(255,255,255,0.16), rgba(255,255,255,0) 70%)" }} />
            <div style={{ position: "absolute", top: 24, left: 24, width: 1152, height: 582, display: "flex", border: `2px solid ${t.icon.fg}`, opacity: 0.7 }} />
            <div style={{ position: "absolute", top: 34, left: 34, width: 1132, height: 562, display: "flex", border: `1px solid ${t.icon.fg}`, opacity: 0.45 }} />
            <svg width="1200" height="630" viewBox="0 0 1200 630" style={{ position: "absolute", top: 0, left: 0 }}>
              <path d="M300 605 V300 C300 190 420 120 600 64 C780 120 900 190 900 300 V605" fill="none" stroke={t.icon.fg} strokeWidth="2" opacity="0.55" />
              <path d="M326 595 V306 C326 206 440 142 600 90 C760 142 874 206 874 306 V595" fill="none" stroke={t.icon.fg} strokeWidth="1" opacity="0.35" />
            </svg>
          </>
        )}
        <div style={{ position: "absolute", top: scene ? 60 : 200, left: 0, width: 1200, display: "flex", flexDirection: "column", alignItems: "center", color: ink }}>
          <div style={{ fontSize: 22, letterSpacing: 8 }}>{invite.occasion === "engagement" ? "ENGAGEMENT INVITATION" : "WEDDING INVITATION"}</div>
          <div style={{ fontFamily: "Fraunces", fontSize: nameSize(names), lineHeight: 1.05, marginTop: 14, letterSpacing: -2 }}>{names}</div>
          <div style={{ fontSize: 30, marginTop: 16, letterSpacing: 1 }}>{`${longDate(invite.date)} · ${invite.city}`}</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Fraunces", data: fraunces, weight: 500, style: "normal" },
        { name: "Geist", data: geist, weight: 500, style: "normal" },
      ],
    },
  );
  const jpeg = await sharp(Buffer.from(await card.arrayBuffer())).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  return new Response(new Uint8Array(jpeg), { headers: { "Content-Type": "image/jpeg", "Cache-Control": card.headers.get("Cache-Control") ?? "public, max-age=31536000, immutable" } });
}
