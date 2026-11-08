"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath, updateTag } from "next/cache";
import { getTemplate } from "@/data/templates";
import { cleanPhone, cleanPhotoPaths, cleanSongPath, keepInviteSettings, orderTotal, validateDetails, type InviteDetails, type Order } from "@/lib/orders";
import { findActivePartner } from "@/lib/partners";
import { logOrderEdit } from "@/lib/order-edits";
import { autoPublish, warmShareCard } from "@/lib/publish";
import { createRazorpayOrder, isRazorpayConfigured, paysOnline, isValidPaymentSignature, markPaidByRazorpayOrder, razorpayKeyId } from "@/lib/razorpay";
import { r2UploadUrl } from "@/lib/r2";
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

  const { data, error } = await db()
    .from("orders")
    .insert({
      template: t.id,
      amount: orderTotal(t.id),
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
 * to the order. After payment it becomes a change request for us to approve; a newer request
 * replaces one still waiting.
 */
export async function saveChanges(orderId: string, input: ChangesInput): Promise<{ applied: true } | { pending: true } | { errors: string[] }> {
  if (!/^[0-9a-f-]{36}$/.test(orderId)) return { errors: ["We couldn't find this order."] };
  const checked = validateDetails(input.details);
  if (!checked.ok) return { errors: checked.errors };

  const { data: order } = await db().from("orders").select("id, status, details, song_path, photo_paths").eq("id", orderId).maybeSingle();
  if (!order) return { errors: ["We couldn't find this order."] };
  if (order.status === "cancelled") return { errors: ["This order is cancelled. Message us on WhatsApp if that's a mistake."] };

  const songPath = cleanSongPath(input.songPath);
  const photoPaths = cleanPhotoPaths(input.photoPaths);
  const details = keepInviteSettings(order.details as InviteDetails, checked.details);

  if (order.status === "awaiting_payment" || order.status === "payment_submitted") {
    const { error } = await db().from("orders").update({ details, song_path: songPath, photo_paths: photoPaths }).eq("id", orderId);
    if (error) return { errors: ["We couldn't save your changes. Please try again."] };
    await logOrderEdit(orderId, order as Order, { details, song_path: songPath, photo_paths: photoPaths }, "couple");
    return { applied: true };
  }

  await db().from("change_requests").delete().eq("order_id", orderId).eq("status", "pending");
  const { error } = await db()
    .from("change_requests")
    .insert({ order_id: orderId, details, song_path: songPath, photo_paths: photoPaths, note: String(input.note ?? "").trim().slice(0, 1000) || null });
  return error ? { errors: ["We couldn't send your changes. Please try again in a moment."] } : { pending: true };
}
