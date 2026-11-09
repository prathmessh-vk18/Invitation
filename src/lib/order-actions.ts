"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath, updateTag } from "next/cache";
import { getTemplate } from "@/data/templates";
import { cleanPhone, cleanPhotoPaths, cleanSongPath, keepInviteSettings, orderTotal, validateDetails, type InviteDetails, type Order } from "@/lib/orders";
import { findActivePartner } from "@/lib/partners";
import { logOrderEdit, orderChanges } from "@/lib/order-edits";
import { autoPublish, warmShareCard } from "@/lib/publish";
import { createRazorpayOrder, creditAddon, creditEditPack, isRazorpayConfigured, paysOnline, isValidPaymentSignature, markPaidByRazorpayOrder, razorpayKeyId } from "@/lib/razorpay";
import { r2UploadUrl } from "@/lib/r2";
import { applyChanges } from "@/lib/apply-changes";
import { changeSummary } from "@/lib/change-requests";
import { holdReason } from "@/lib/edit-hold";
import { site } from "@/config/site";
import { db, isSupabaseConfigured, PHOTOS_BUCKET, SONGS_BUCKET } from "@/lib/supabase";

const MAX_SONG_BYTES = 15 * 1024 * 1024;

// Songs are typed by their extension first: phones often label them oddly ("audio/mp4a-latm",
// "audio/x-mpeg-3") or not at all (""), and turning those away lost us many couples' own songs.
const SONG_EXT: Record<string, string> = {
  mp3: "audio/mpeg", m4a: "audio/mp4", mp4: "audio/mp4", aac: "audio/aac", wav: "audio/wav",
  ogg: "audio/ogg", oga: "audio/ogg", opus: "audio/ogg",
};
const SONG_LABEL: [RegExp, string][] = [
  [/^audio\/(mpeg|mp3|mpeg3|x-mpeg-3|x-mp3|mpg)$/, "mp3"],
  [/^audio\/(mp4|x-m4a|m4a|mp4a-latm)$/, "m4a"],
  [/^audio\/(aac|x-aac|aacp|vnd\.dlna\.adts)$/, "aac"],
  [/^audio\/(wav|x-wav|wave|vnd\.wave)$/, "wav"],
  [/^audio\/(ogg|opus)$/, "ogg"],
];
const VOICE_NOTE = /^(amr|3gp|3gpp|3ga|awb)$/;

/** The extension and type we store a song under, or null when browsers can't play it. */
function songFormat(fileName: string, label: string): { ext: string; type: string } | null {
  const fromName = (fileName.split(".").pop() || "").toLowerCase();
  const type = label.toLowerCase().split(";")[0].trim();
  // A known extension wins, unless the phone clearly says it's something else (an image, a document).
  if (SONG_EXT[fromName] && (!type || type.startsWith("audio/") || type === "video/mp4" || type === "application/octet-stream")) {
    return { ext: fromName, type: SONG_EXT[fromName] };
  }
  const hit = SONG_LABEL.find(([re]) => re.test(type));
  return hit ? { ext: hit[1], type: SONG_EXT[hit[1]] } : null;
}

/** A one-time URL the browser uploads the couple's song to. The file never passes through our server. */
export async function createSongUpload(fileName: string, contentType: string, size: number) {
  const format = songFormat(fileName, contentType);
  if (!format) {
    const ext = (fileName.split(".").pop() || "").toLowerCase();
    return VOICE_NOTE.test(ext)
      ? { error: "This is a voice-recording format that phones can't play in an invite. Please choose an MP3 or M4A song." }
      : { error: "We can't play this file in an invite. Please choose an MP3, M4A, AAC, WAV or OGG song." };
  }
  if (size > MAX_SONG_BYTES) return { error: "That file is over 15 MB. Please trim it or choose a shorter version." };
  const path = `uploads/${randomUUID()}.${format.ext}`;
  const r2 = r2UploadUrl(SONGS_BUCKET, path, format.type, size);
  if (r2) return { path, url: r2.url, headers: r2.headers, contentType: format.type };
  const { data, error } = await db().storage.from(SONGS_BUCKET).createSignedUploadUrl(path);
  if (error || !data) return { error: "We couldn't prepare the upload. Please try again." };
  return { path: data.path, token: data.token, contentType: format.type };
}

const IMAGE = /^image\/(jpeg|png|webp)$/;
const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

/** A one-time URL the browser uploads one couple photo to (already resized in the browser). */
export async function createPhotoUpload(contentType: string, size: number) {
  if (!IMAGE.test(contentType)) return { error: "Please choose a JPG, PNG or WebP photo." };
  if (size > MAX_PHOTO_BYTES) return { error: "That photo is over 10 MB." };
  const ext = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
  const path = `moments/${randomUUID()}.${ext}`;
  const r2 = r2UploadUrl(PHOTOS_BUCKET, path, contentType, size);
  if (r2) return { path, url: r2.url, headers: r2.headers };
  const { data, error } = await db().storage.from(PHOTOS_BUCKET).createSignedUploadUrl(path);
  if (error || !data) return { error: "We couldn't prepare the upload. Please try again." };
  return { path: data.path, token: data.token };
}

export type CreateOrderInput = {
  template: string;
  details: unknown;
  songPath: string | null;
  photoPaths?: string[];
  customer: { name: string; phone: string; email: string };
  partnerCode?: string;
  /** Add-ons ticked at checkout: "pdf" (the printable PDF). */
  addons?: string[];
};

/** Checks a partner code for the order form, so the couple sees it applied. */
export async function checkPartnerCode(code: string): Promise<{ code: string; name: string } | null> {
  if (!isSupabaseConfigured()) return null;
  const p = await findActivePartner(code);
  return p ? { code: p.code, name: p.name } : null;
}

export async function createOrder(input: CreateOrderInput): Promise<{ id: string } | { errors: string[] }> {
  const t = getTemplate(input.template);
  if (!t) return { errors: ["Please choose a design first."] };

  const checked = validateDetails(input.details);
  const errors = checked.ok ? [] : [...checked.errors];

  const name = String(input.customer?.name ?? "").trim().slice(0, 80);
  const phone = cleanPhone(input.customer?.phone);
  const email = String(input.customer?.email ?? "").trim().slice(0, 120);
  if (!name) errors.push("Add your name so we know who to contact.");
  if (phone.length < 10) errors.push("Add your WhatsApp number so we can send your link.");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("Check your email address.");
  if (errors.length || !checked.ok) return { errors };

  // A partner can't earn on their own order.
  const partner = input.partnerCode ? await findActivePartner(input.partnerCode) : null;
  if (input.partnerCode && !partner) return { errors: ["We don't recognise that partner code. Check it, or clear it to continue."] };
  const credited = partner && partner.phone !== phone ? partner : null;

  const songPath = cleanSongPath(input.songPath);
  const photoPaths = cleanPhotoPaths(input.photoPaths);
  // Orders paid to us directly can't add online extras at checkout.
  const pdf = Boolean(input.addons?.includes("pdf")) && !t.payDirect;

  const { data, error } = await db()
    .from("orders")
    .insert({
      template: t.id,
      // The add-on's price comes from our config, never from the browser.
      amount: orderTotal(t.id) + (pdf ? site.pdfAddon.price : 0),
      addons: pdf ? ["pdf"] : [],
      customer_name: name,
      customer_phone: phone,
      customer_email: email || null,
      details: checked.details,
      song_path: songPath,
      // Only sent when there are photos, so orders still save on a database without the photos column.
      ...(photoPaths.length ? { photo_paths: photoPaths } : {}),
      ...(credited ? { partner_code: credited.code, partner_commission: credited.commission } : {}),
    })
    .select("id")
    .single();

  if (error || !data) return { errors: ["We couldn't save your order. Please try again in a moment."] };
  return { id: data.id as string };
}

export type PaymentStart = { keyId: string; razorpayOrderId: string; amount: number; code: string; name: string; phone: string; email: string; label: string };

/**
 * Opens payment for an order: makes (or reuses) its Razorpay order for the order's own amount.
 * The amount always comes from our database, never from the browser.
 */
export async function startPayment(orderId: string): Promise<PaymentStart | { error: string }> {
  if (!/^[0-9a-f-]{36}$/.test(orderId)) return { error: "We couldn't find this order." };
  if (!isRazorpayConfigured()) return { error: "Online payment isn't set up yet. Please message us on WhatsApp." };
  const { data: order } = await db()
    .from("orders")
    .select("id, code, status, amount, template, customer_name, customer_phone, customer_email, razorpay_order_id, created_at")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return { error: "We couldn't find this order." };
  if (order.status !== "awaiting_payment" && order.status !== "payment_submitted") return { error: "This order is already paid." };
  if (!paysOnline(order)) return { error: "We've sent your payment details on WhatsApp. Please pay there." };

  let rzpId = order.razorpay_order_id as string | null;
  if (!rzpId) {
    try {
      const r = await createRazorpayOrder(order.amount, order.code, { order_id: order.id, code: order.code });
      rzpId = r.id;
    } catch {
      return { error: "We couldn't start the payment. Please try again in a moment." };
    }
    await db().from("orders").update({ razorpay_order_id: rzpId }).eq("id", order.id);
  }
  const t = getTemplate(order.template);
  return {
    keyId: razorpayKeyId(),
    razorpayOrderId: rzpId,
    amount: order.amount,
    code: order.code,
    name: order.customer_name,
    phone: order.customer_phone,
    email: order.customer_email ?? "",
    label: `${t?.name ?? "Invitation"} design · order ${order.code}`,
  };
}

/** Checkout's success callback: verify Razorpay's signature, then mark the order paid. */
export async function confirmPayment(
  orderId: string,
  r: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string },
): Promise<{ ok: true } | { error: string }> {
  if (!/^[0-9a-f-]{36}$/.test(orderId)) return { error: "We couldn't find this order." };
  const { data: order } = await db().from("orders").select("razorpay_order_id, status").eq("id", orderId).maybeSingle();
  if (!order || order.razorpay_order_id !== r.razorpay_order_id) return { error: "This payment doesn't match your order. Please message us on WhatsApp." };
  if (!isValidPaymentSignature(r.razorpay_order_id, r.razorpay_payment_id, r.razorpay_signature)) {
    return { error: "We couldn't verify this payment. If money was deducted, message us on WhatsApp with your order code." };
  }
  if (await markPaidByRazorpayOrder(r.razorpay_order_id, r.razorpay_payment_id)) {
    const slug = await autoPublish(orderId);
    if (slug) {
      updateTag(`invite:${slug}`);
      warmShareCard(slug);
    }
    revalidatePath("/admin");
  }
  return { ok: true };
}

export type ChangesInput = { details: unknown; songPath: string | null; photoPaths: string[]; note?: string };

/**
 * A couple edits their order. Before payment nothing is published, so the edit saves straight
 * to the order. After payment it uses one of their edits and goes live on its own, unless it
 * looks like the invite is being reused for another couple: then it waits for us. With no edits
 * left they're asked to buy a pack first; nothing is saved.
 */
export async function saveChanges(
  orderId: string,
  input: ChangesInput,
): Promise<{ applied: true } | { live: true } | { unchanged: true } | { pending: true } | { needsEdits: true } | { errors: string[] }> {
  if (!/^[0-9a-f-]{36}$/.test(orderId)) return { errors: ["We couldn't find this order."] };
  const checked = validateDetails(input.details);
  if (!checked.ok) return { errors: checked.errors };

  const { data: order } = await db().from("orders").select("id, status, details, song_path, photo_paths, extra_edits").eq("id", orderId).maybeSingle();
  if (!order) return { errors: ["We couldn't find this order."] };
  if (order.status === "cancelled") return { errors: ["This order is cancelled. Message us on WhatsApp if that's a mistake."] };

  const songPath = cleanSongPath(input.songPath);
  const photoPaths = cleanPhotoPaths(input.photoPaths);
  const details = keepInviteSettings(order.details as InviteDetails, checked.details);

  if (order.status === "awaiting_payment" || order.status === "payment_submitted") {
    const { error } = await db().from("orders").update({ details, song_path: songPath, photo_paths: photoPaths }).eq("id", orderId);
    if (error) return { errors: ["We couldn't save your changes. Please try again."] };
    await logOrderEdit(orderId, order as unknown as Order, { details, song_path: songPath, photo_paths: photoPaths }, "couple");
    return { applied: true };
  }

  // Saving without changing anything (or only re-sending a held request's twin) never uses an edit.
  const note0 = String(input.note ?? "").trim();
  if (!note0 && !orderChanges(order as unknown as Order, { details, song_path: songPath, photo_paths: photoPaths }).length) return { unchanged: true };

  const c = await changeSummary(orderId, order.extra_edits ?? 0);
  if (!c) return { errors: ["We couldn't send your changes. Please try again in a moment."] };
  if (c.left <= 0) return { needsEdits: true };

  const note = String(input.note ?? "").trim().slice(0, 1000) || null;
  const request = { order_id: orderId, details, song_path: songPath, photo_paths: photoPaths, note };
  const hold = holdReason(order.details as InviteDetails, details);
  await db().from("change_requests").delete().eq("order_id", orderId).eq("status", "pending");
  if (hold) {
    const { error } = await db().from("change_requests").insert({ ...request, hold_reason: hold });
    return error ? { errors: ["We couldn't send your changes. Please try again in a moment."] } : { pending: true };
  }

  // Recorded as approved first, so it counts as an edit; if applying fails it goes to us instead.
  const { data: req, error } = await db()
    .from("change_requests")
    .insert({ ...request, status: "approved", auto: true, decided_at: new Date().toISOString() })
    .select("id")
    .single();
  if (error || !req) return { errors: ["We couldn't save your changes. Please try again in a moment."] };
  const res = await applyChanges(orderId, { details, song_path: songPath, photo_paths: photoPaths }, "approved", req.id);
  if ("errors" in res) {
    await db()
      .from("change_requests")
      .update({ status: "pending", auto: false, decided_at: null, hold_reason: `Couldn't apply on its own: ${res.errors[0]}` })
      .eq("id", req.id);
    return { pending: true };
  }
  revalidatePath("/admin/changes");
  return { live: true };
}

/** Opens Razorpay for a pack of edits, once a couple has used theirs. */
export async function startEditPack(orderId: string): Promise<PaymentStart | { error: string }> {
  if (!/^[0-9a-f-]{36}$/.test(orderId)) return { error: "We couldn't find this order." };
  if (!isRazorpayConfigured()) return { error: "Online payment isn't set up yet. Please message us on WhatsApp." };
  const { data: order } = await db()
    .from("orders")
    .select("id, code, status, template, customer_name, customer_phone, customer_email")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return { error: "We couldn't find this order." };
  if (order.status !== "paid" && order.status !== "live") return { error: "Edits are free until your invite is paid for." };
  const { price, edits } = site.editPack;
  const { count } = await db().from("edit_packs").select("id", { count: "exact", head: true }).eq("order_id", orderId);
  let rzp: { id: string };
  try {
    rzp = await createRazorpayOrder(price, `${order.code}-E${(count ?? 0) + 1}`, { order_id: order.id, code: order.code, kind: "edit_pack" });
  } catch {
    return { error: "We couldn't start the payment. Please try again in a moment." };
  }
  const { error } = await db().from("edit_packs").insert({ order_id: order.id, edits, amount: price, razorpay_order_id: rzp.id });
  if (error) return { error: "We couldn't start the payment. Please try again in a moment." };
  return {
    keyId: razorpayKeyId(),
    razorpayOrderId: rzp.id,
    amount: price,
    code: order.code,
    name: order.customer_name,
    phone: order.customer_phone,
    email: order.customer_email ?? "",
    label: `${edits} more edits · order ${order.code}`,
  };
}

/** Checkout's success callback for a pack: verify the signature, then add the edits (once). */
export async function confirmEditPack(
  orderId: string,
  r: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string },
): Promise<{ ok: true } | { error: string }> {
  if (!/^[0-9a-f-]{36}$/.test(orderId)) return { error: "We couldn't find this order." };
  const { data: pack } = await db().from("edit_packs").select("order_id").eq("razorpay_order_id", r.razorpay_order_id).maybeSingle();
  if (!pack || pack.order_id !== orderId) return { error: "This payment doesn't match your order. Please message us on WhatsApp." };
  if (!isValidPaymentSignature(r.razorpay_order_id, r.razorpay_payment_id, r.razorpay_signature)) {
    return { error: "We couldn't verify this payment. If money was deducted, message us on WhatsApp with your order code." };
  }
  await creditEditPack(r.razorpay_order_id, r.razorpay_payment_id);
  revalidatePath(`/order/${orderId}`);
  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true };
}

/** Opens Razorpay for an add-on (the printable PDF) on a paid order. */
export async function startAddon(orderId: string, addon: "pdf"): Promise<PaymentStart | { error: string }> {
  if (!/^[0-9a-f-]{36}$/.test(orderId) || addon !== "pdf") return { error: "We couldn't find this order." };
  if (!isRazorpayConfigured()) return { error: "Online payment isn't set up yet. Please message us on WhatsApp." };
  const { data: order } = await db().from("orders").select("id, code, status, addons, customer_name, customer_phone, customer_email").eq("id", orderId).maybeSingle();
  if (!order) return { error: "We couldn't find this order." };
  if (order.status !== "paid" && order.status !== "live") return { error: "Add the PDF once your invite is paid for, or tick it on the order form." };
  if ((order.addons ?? []).includes(addon)) return { error: "You already have the PDF. Download it from your order page." };
  const price = site.pdfAddon.price;
  const { count } = await db().from("addon_purchases").select("id", { count: "exact", head: true }).eq("order_id", orderId);
  let rzp: { id: string };
  try {
    rzp = await createRazorpayOrder(price, `${order.code}-P${(count ?? 0) + 1}`, { order_id: order.id, code: order.code, kind: "addon_pdf" });
  } catch {
    return { error: "We couldn't start the payment. Please try again in a moment." };
  }
  const { error } = await db().from("addon_purchases").insert({ order_id: order.id, addon, amount: price, razorpay_order_id: rzp.id });
  if (error) return { error: "We couldn't start the payment. Please try again in a moment." };
  return {
    keyId: razorpayKeyId(),
    razorpayOrderId: rzp.id,
    amount: price,
    code: order.code,
    name: order.customer_name,
    phone: order.customer_phone,
    email: order.customer_email ?? "",
    label: `Printable PDF · order ${order.code}`,
  };
}

/** Checkout's success callback for an add-on: verify the signature, then unlock it (once). */
export async function confirmAddon(
  orderId: string,
  r: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string },
): Promise<{ ok: true } | { error: string }> {
  if (!/^[0-9a-f-]{36}$/.test(orderId)) return { error: "We couldn't find this order." };
  const { data: buy } = await db().from("addon_purchases").select("order_id").eq("razorpay_order_id", r.razorpay_order_id).maybeSingle();
  if (!buy || buy.order_id !== orderId) return { error: "This payment doesn't match your order. Please message us on WhatsApp." };
  if (!isValidPaymentSignature(r.razorpay_order_id, r.razorpay_payment_id, r.razorpay_signature)) {
    return { error: "We couldn't verify this payment. If money was deducted, message us on WhatsApp with your order code." };
  }
  await creditAddon(r.razorpay_order_id, r.razorpay_payment_id);
  revalidatePath(`/order/${orderId}`);
  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true };
}
