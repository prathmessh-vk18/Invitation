"use server";

import { randomUUID } from "node:crypto";
import { getTemplate } from "@/data/templates";
import { cleanPhone, orderTotal, validateDetails } from "@/lib/orders";
import { findActivePartner } from "@/lib/partners";
import { db, isSupabaseConfigured, MAX_PHOTOS, PHOTOS_BUCKET, SONGS_BUCKET } from "@/lib/supabase";

const AUDIO = /^(audio\/(mpeg|mp3|mp4|x-m4a|aac|wav|x-wav|ogg))$/;
const MAX_SONG_BYTES = 15 * 1024 * 1024;

/** A one-time URL the browser uploads the couple's song to. The file never passes through our server. */
export async function createSongUpload(fileName: string, contentType: string, size: number) {
  if (!AUDIO.test(contentType)) return { error: "Please choose an audio file (MP3, M4A, AAC, WAV or OGG)." };
  if (size > MAX_SONG_BYTES) return { error: "That file is over 15 MB. Please trim it or choose a shorter version." };
  const ext = (fileName.split(".").pop() || "mp3").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "mp3";
  const path = `uploads/${randomUUID()}.${ext}`;
  const { data, error } = await db().storage.from(SONGS_BUCKET).createSignedUploadUrl(path);
  if (error || !data) return { error: "We couldn't prepare the upload. Please try again." };
  return { path: data.path, token: data.token };
}

const IMAGE = /^image\/(jpeg|png|webp)$/;
const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const PHOTO_PATH = /^moments\/[0-9a-f-]{36}\.(jpg|png|webp)$/;

/** A one-time URL the browser uploads one couple photo to (already resized in the browser). */
export async function createPhotoUpload(contentType: string, size: number) {
  if (!IMAGE.test(contentType)) return { error: "Please choose a JPG, PNG or WebP photo." };
  if (size > MAX_PHOTO_BYTES) return { error: "That photo is over 10 MB." };
  const ext = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
  const { data, error } = await db().storage.from(PHOTOS_BUCKET).createSignedUploadUrl(`moments/${randomUUID()}.${ext}`);
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
  if (phone.length < 12) errors.push("Add your WhatsApp number so we can send your link.");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("Check your email address.");
  if (errors.length || !checked.ok) return { errors };

  // A partner can't earn on their own order.
  const partner = input.partnerCode ? await findActivePartner(input.partnerCode) : null;
  if (input.partnerCode && !partner) return { errors: ["We don't recognise that partner code. Check it, or clear it to continue."] };
  const credited = partner && partner.phone !== phone ? partner : null;

  const songPath = typeof input.songPath === "string" && /^uploads\/[0-9a-f-]{36}\.[a-z0-9]{1,5}$/.test(input.songPath) ? input.songPath : null;

  const photoPaths = (input.photoPaths ?? []).filter((x) => typeof x === "string" && PHOTO_PATH.test(x)).slice(0, MAX_PHOTOS);

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

/** The couple tells us the 12-digit UPI reference after paying. */
export async function submitUtr(orderId: string, utr: string): Promise<{ ok: true } | { error: string }> {
  const clean = String(utr ?? "").replace(/\s/g, "");
  if (!/^\d{12}$/.test(clean)) return { error: "The UTR is the 12-digit number in your UPI app's payment details." };
  if (!/^[0-9a-f-]{36}$/.test(orderId)) return { error: "We couldn't find this order." };

  const { data, error } = await db()
    .from("orders")
    .update({ utr: clean, status: "payment_submitted", payment_submitted_at: new Date().toISOString() })
    .eq("id", orderId)
    .in("status", ["awaiting_payment", "payment_submitted"])
    .select("id")
    .maybeSingle();

  if (error) return { error: "We couldn't save that. Please try again." };
  if (!data) return { error: "This order isn't waiting for payment any more." };
  return { ok: true };
}
