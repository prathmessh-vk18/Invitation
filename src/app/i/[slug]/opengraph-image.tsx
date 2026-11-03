import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";
import { getInvite, invites, type Invite } from "@/data/invites";
import { getTemplate } from "@/data/templates";
import { couple } from "@/invites/people";
import { getPublishedInvite } from "@/lib/invites-db";
import { longDate } from "@/lib/format";

// The couple's own share preview: their names, date and city on their design, with no Aavjoo
// branding or price. WhatsApp builds the preview on the sender's phone, so this is fetched when a
// link is shared, not when guests open it. Demo cards are built at deploy time; a couple's card is
// built on its first share and kept until their invite changes (the `invite:<slug>` tag).
export const alt = "Wedding invitation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return invites.map((i) => ({ slug: i.slug }));
}

// Each path is written out in full so only these files ship with this route, and they're read
// once when the module loads (see app/opengraph-image.tsx).
const jpg = async (file: Promise<Buffer>) => `data:image/jpeg;base64,${(await file).toString("base64")}`;
const [fraunces, geist, mandir, haveli, mahal, khat, gopuram, bagh] = await Promise.all([
  readFile(join(process.cwd(), "src/app/i/[slug]/Fraunces-Medium.ttf")),
  readFile(join(process.cwd(), "src/app/i/[slug]/Geist-Medium.ttf")),
  jpg(readFile(join(process.cwd(), "public/art/illus/mandir-temple.jpg"))),
  jpg(readFile(join(process.cwd(), "public/art/illus/haveli-arrival.jpg"))),
  jpg(readFile(join(process.cwd(), "public/art/illus/mahal-hero.jpg"))),
  jpg(readFile(join(process.cwd(), "public/art/illus/khat-hero.jpg"))),
  jpg(readFile(join(process.cwd(), "public/art/illus/gopuram-hero.jpg"))),
  jpg(readFile(join(process.cwd(), "public/art/illus/bagh-hero.jpg"))),
]);
const art: Record<string, string> = { mandir, haveli, mahal, khat, gopuram, bagh };

// Relative luminance, to pick the darker of a design's two icon colours for text on its tint.
const lum = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

async function resolve(slug: string): Promise<Invite | null> {
  return getInvite(slug) ?? (await getPublishedInvite(slug))?.invite ?? null;
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const invite = await resolve((await params).slug);
  if (!invite) notFound();
  const t = getTemplate(invite.template)!;
  const [a, b] = couple(invite);
  const accent = lum(t.icon.fg) < lum(t.icon.bg) ? t.icon.fg : t.icon.bg;
  const names = `${a.first} & ${b.first}`;
  const nameSize = names.length <= 16 ? 92 : names.length <= 22 ? 78 : 64;
  const picture = art[invite.template];

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: t.tint, fontFamily: "Geist", position: "relative" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 0 0 84px", width: 720 }}>
          <div style={{ fontSize: 22, letterSpacing: 6, color: accent }}>WEDDING INVITATION</div>
          <div style={{ display: "flex", flexDirection: "column", fontFamily: "Fraunces", fontSize: nameSize, lineHeight: 1.05, color: "#1d1414", marginTop: 28, letterSpacing: -1 }}>
            <span>{a.first}</span>
            <span>&amp; {b.first}</span>
          </div>
          <div style={{ width: 96, height: 3, background: accent, marginTop: 36, borderRadius: 2 }} />
          <div style={{ fontSize: 32, color: "#1d1414", marginTop: 32 }}>{longDate(invite.date)}</div>
          <div style={{ fontSize: 28, color: "#6b5a5a", marginTop: 10 }}>{invite.city}</div>
        </div>
        {picture ? (
          <div
            style={{
              position: "absolute",
              top: 48,
              right: 96,
              width: 300,
              height: 534,
              borderRadius: 28,
              border: "8px solid #141010",
              overflow: "hidden",
              boxShadow: "0 30px 60px rgba(60,20,30,.30)",
              display: "flex",
            }}
          >
            <img src={picture} width={300} height={534} style={{ objectFit: "cover", width: "100%", height: "100%" }} alt="" />
          </div>
        ) : (
          <div
            style={{
              position: "absolute",
              top: 125,
              right: 110,
              width: 380,
              height: 380,
              borderRadius: 999,
              background: t.icon.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "Fraunces",
              fontSize: 150,
              color: t.icon.fg,
              letterSpacing: -4,
            }}
          >
            {a.first[0]}
            <span style={{ fontSize: 90, margin: "0 10px" }}>&amp;</span>
            {b.first[0]}
          </div>
        )}
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
}
