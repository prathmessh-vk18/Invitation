import type { CSSProperties, FC, ReactNode } from "react";
import type { Invite } from "@/data/invites";
import type { TemplateId } from "@/data/templates";

export type OpeningProps = { invite: Invite; opened: boolean; onOpen: () => void };

export type ThemeUI = {
  section: string;
  card: string;
  input: string;
  chip: string;
  chipOn: string;
  button: string;
  ghost: string;
  muted: string;
  tile: string;
};

export type InviteTheme = {
  id: TemplateId;
  root: string;
  vars: CSSProperties;
  accent: string;
  ui: ThemeUI;
  Opening: FC<OpeningProps>;
  Hero: FC<{ invite: Invite }>;
  Blessing: FC<{ invite: Invite }>;
  Events: FC<{ invite: Invite }>;
  Closing: FC<{ invite: Invite }>;
  Backdrop: FC;
  // Optional ornamental frame drawn above the content; the invite scrolls underneath it.
  Frame?: FC;
  Divider: FC<{ className?: string }>;
  Title: FC<{ kicker?: string; children: ReactNode }>;
};
