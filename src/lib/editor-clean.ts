import { sectionsFor as optionalSections } from "@/config/customise";
import { editorSections, fieldsFor, getAt, lookFields, setAt, type Field } from "@/config/editor";
import type { InviteDetails } from "@/lib/orders";
import { cleanPhone } from "@/lib/orders";

const text = (v: unknown, max: number, multiline?: boolean) => {
  if (typeof v !== "string") return "";
  const s = v.normalize("NFC").replace(/\r\n?/g, "\n");
  const one = multiline ? s.replace(/\n{3,}/g, "\n\n") : s.replace(/\s*\n\s*/g, " ");
  return one.trim().slice(0, max);
};

/** JSON with keys in a fixed order, so the same values always compare equal. */
const stable = (v: unknown): string =>
  v && typeof v === "object"
    ? Array.isArray(v)
      ? `[${v.map(stable).join(",")}]`
      : `{${Object.keys(v)
          .filter((k) => (v as Record<string, unknown>)[k] !== undefined)
          .sort()
          .map((k) => `${JSON.stringify(k)}:${stable((v as Record<string, unknown>)[k])}`)
          .join(",")}}`
    : JSON.stringify(v ?? null);
const same = (a: unknown, b: unknown) => stable(a) === stable(b);

/**
 * The order's details with the couple's editor changes applied: only what the editor offers on this
 * design is taken from `input`, each within its limits; everything else stays as saved.
 */
export function cleanEdits(base: InviteDetails, input: InviteDetails, design: string): InviteDetails {
  let out = structuredClone(base);
  const fields = [...editorSections.flatMap((s) => fieldsFor(s.fields, design)), ...fieldsFor(lookFields, design)];
  for (const f of fields) out = applyField(out, input, f, "", design);
  return out;
}

function applyField(out: InviteDetails, input: InviteDetails, f: Field, prefix: string, design: string): InviteDetails {
  const key = prefix + f.key;
  const v = getAt(input, key);
  // Whatever the couple left as it was stays exactly as saved, even beyond the editor's limits
  // (e.g. a smaller name size we set by hand).
  if (f.kind !== "people" && f.kind !== "show" && same(v, getAt(out, key)) && !(f.kind === "choice" && (f.key === "textStyle" || f.key === "lang"))) return out;
  switch (f.kind) {
    case "text": {
      if (f.core) return v === undefined ? out : setAt(out, key, text(v, f.max, f.multiline));
      if (v === undefined || v === null) return setAt(out, key, undefined);
      const s = text(v, f.max, f.multiline);
      return setAt(out, key, s || (f.emptyHides ? "" : undefined));
    }
    case "toggle":
      return setAt(out, key, v === true ? true : undefined);
    case "choice": {
      if (f.key === "lang") {
        // Applied last, so a couple can go back to English (the order form never sends it).
        return input.lang === "hi" ? { ...out, lang: "hi" } : setAt(out, "lang", undefined);
      }
      if (f.key === "textStyle") {
        const style = input.boldText ? "bold" : input.readable ? "clear" : "normal";
        if (style === (out.boldText ? "bold" : out.readable ? "clear" : "normal")) return out;
        // Saved as both settings, so the design's own default never decides it.
        return { ...out, readable: style !== "normal", boldText: style === "bold" };
      }
      if (!f.options.some((o) => o.value === v)) return setAt(out, key, undefined);
      // A value that's also the design's default is still kept when an older invite had it pinned
      // the other way (e.g. blessingTop: false); dropping it would bring the default back.
      // A field whose shown value depends on others (`current`) is always saved as chosen.
      if (!f.current && v === f.fallback && getAt(out, key) === undefined) return out;
      return setAt(out, key, v);
    }
    case "slider": {
      const n = typeof v === "number" && Number.isFinite(v) ? Math.min(f.max, Math.max(f.min, Math.round(v * 100) / 100)) : f.fallback;
      return setAt(out, key, n === f.fallback ? undefined : n);
    }
    case "show": {
      const allowed = new Set(optionalSections(design).map((s) => s.id));
      const hidden = Array.isArray(input.hide) ? input.hide.filter((x) => allowed.has(x)) : [];
      const was = (out.hide ?? []).filter((x) => !allowed.has(x));
      const hide = [...new Set([...was, ...hidden])];
      if (same(hide, out.hide ?? [])) return out;
      return { ...out, hide };
    }
    case "lists": {
      const groups = (Array.isArray(input.extras) ? input.extras : [])
        .slice(0, 8)
        .map((g) => ({
          title: text(g?.title, 80),
          lines: (Array.isArray(g?.lines) ? g.lines : []).map((l) => text(l, 240)).filter(Boolean).slice(0, 80),
        }))
        .filter((g) => g.title || g.lines.length);
      if (same(groups, out.extras ?? [])) return out;
      return setAt(out, "extras", groups.length ? groups : undefined);
    }
    // Checked by validateDetails with the rest of the couple's details.
    case "datetime":
    case "date":
    case "phone":
    case "functions":
    case "photos":
    case "font":
      return out;
    case "contacts": {
      const list = (Array.isArray(input.contacts) ? input.contacts : [])
        .slice(0, 6)
        .map((c) => ({
          name: text(c?.name, 60),
          phones: (Array.isArray(c?.phones) ? c.phones : []).map(cleanPhone).filter((p) => p.length >= 10 && p.length <= 15).slice(0, 3),
          ...(c?.whatsapp === true ? { whatsapp: true } : {}),
        }))
        .filter((c) => c.name && c.phones.length);
      if (same(list, out.contacts ?? [])) return out;
      return setAt(out, "contacts", list.length ? list : undefined);
    }
    case "people": {
      for (const who of ["bride", "groom"] as const) for (const sub of f.fields) out = applyField(out, input, sub, `${who}.`, design);
      // Placement and style only mean something while there's a grandparents' line.
      for (const who of ["bride", "groom"] as const)
        if (!out[who].elders) {
          const rest = { ...out[who] };
          delete rest.eldersBelow;
          delete rest.eldersPlain;
          out = { ...out, [who]: rest };
        }
      return out;
    }
  }
}

/** Whether the editor changed anything. */
export const editsChanged = (a: InviteDetails, b: InviteDetails) => !same(a, b);
