import "server-only";
import type { Invite } from "@/data/invites";
import { pdfHtml } from "./layout";

/**
 * Prints an invite's PDF in a headless Chrome: the serverless build from @sparticuz/chromium on
 * Vercel, the Mac's own Chrome in development. If a page still overflows at two functions a page,
 * it prints again at one a page.
 */
async function browser() {
  const puppeteer = (await import("puppeteer-core")).default;
  if (process.env.VERCEL) {
    const chromium = (await import("@sparticuz/chromium")).default;
    return puppeteer.launch({ args: chromium.args, executablePath: await chromium.executablePath(), headless: true });
  }
  return puppeteer.launch({ executablePath: process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
}

export async function renderInvitePdf(invite: Invite, opts: { siteUrl: string; inviteUrl: string }): Promise<Uint8Array> {
  const b = await browser();
  try {
    const page = await b.newPage();
    await page.setViewport({ width: 540, height: 960 });
    const load = async (per: number) => {
      await page.setContent(pdfHtml(invite, { ...opts, per }), { waitUntil: "load", timeout: 45_000 });
      await page.waitForNetworkIdle({ idleTime: 400, timeout: 30_000 }).catch(() => {});
      await page.evaluate(() => document.fonts.ready);
      // Let the fitting script settle after the fonts arrive.
      await page.evaluate(() => {
        for (const el of document.querySelectorAll<HTMLElement>(".in")) {
          let k = 1;
          el.style.removeProperty("--k");
          while (el.scrollHeight > el.clientHeight + 1 && k > 0.82) {
            k -= 0.03;
            el.style.setProperty("--k", String(k));
          }
        }
      });
      return page.evaluate(() => [...document.querySelectorAll(".in")].filter((el) => el.scrollHeight > el.clientHeight + 1).length);
    };
    if (await load(2)) await load(1);
    return await page.pdf({ preferCSSPageSize: true, printBackground: true });
  } finally {
    await b.close();
  }
}
