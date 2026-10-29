import type { Invite } from "@/data/invites";

/** The couple in the order their names should appear. */
export function couple(invite: Invite) {
  return invite.lead === "groom" ? [invite.groom, invite.bride] : [invite.bride, invite.groom];
}

export function initials(invite: Invite) {
  // A couple can ask for their own letters on the seal (e.g. English initials on a Hindi invite).
  if (invite.monogram) return invite.monogram;
  const [a, b] = couple(invite);
  return `${a.first[0]}${b.first[0]}`;
}
