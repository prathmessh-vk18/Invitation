import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// The default share preview for aavjoo.in links (WhatsApp, Instagram, Google).
export const alt = "Aavjoo — designer wedding invitation websites for Indian weddings";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const dataUrl = async (path: string, type: string) => `data:${type};base64,${(await readFile(join(process.cwd(), path))).toString("base64")}`;

export default async function Image() {
  const [logo, mahal, khat, gopuram] = await Promise.all([
    dataUrl("public/brand/aavjoo-logo.png", "image/png"),
    dataUrl("public/art/illus/mahal-hero.jpg", "image/jpeg"),
    dataUrl("public/art/illus/khat-hero.jpg", "image/jpeg"),
    dataUrl("public/art/illus/gopuram-hero.jpg", "image/jpeg"),
  ]);
  const phone = (src: string, rotate: number, top: number, left: number, z: number) => (
    <div
      style={{
        position: "absolute",
        top,
        left,
        width: 200,
        height: 356,
        borderRadius: 28,
        border: "8px solid #141010",
        overflow: "hidden",
        transform: `rotate(${rotate}deg)`,
        boxShadow: "0 30px 60px rgba(60,20,30,.35)",
        zIndex: z,
        display: "flex",
      }}
    >
      { }
      <img src={src} width={200} height={356} style={{ objectFit: "cover", width: "100%", height: "100%" }} alt="" />
    </div>
  );
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "linear-gradient(135deg,#fff7f0,#fbe6dd)", position: "relative" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 0 0 80px", width: 640 }}>
          { }
          <img src={logo} width={220} height={67} alt="" />
          <div style={{ fontSize: 62, fontWeight: 700, color: "#141414", lineHeight: 1.05, marginTop: 36, letterSpacing: -2 }}>Wedding invites your family will open twice</div>
          <div style={{ fontSize: 26, color: "#6b6b6b", marginTop: 24 }}>Animated invitation websites · RSVP on WhatsApp</div>
          <div style={{ display: "flex", marginTop: 30 }}>
            <div style={{ background: "#66223f", color: "#fff", fontSize: 26, fontWeight: 700, padding: "12px 26px", borderRadius: 999 }}>From ₹249</div>
          </div>
        </div>
        {phone(khat, -10, 150, 690, 1)}
        {phone(gopuram, 10, 150, 950, 1)}
        {phone(mahal, 0, 110, 820, 2)}
      </div>
    ),
    size,
  );
}
