import type { ReactNode } from "react";
import { Diya, MarigoldHead } from "@/art/ornaments";
import {
  AppIcon,
  Badge,
  Button,
  ButtonLink,
  ChatBubble,
  Container,
  Display,
  Eyebrow,
  Frame,
  Heading,
  InlineIcon,
  Lead,
  Panel,
  PhoneFrame,
  Placeholder,
  TileCaption,
  Title,
} from "@/ui";
import { InvitePreview } from "@/invites/InvitePreview";
import { AccordionDemo, FilterDemo, TabsDemo } from "./Demos";

export const metadata = { title: "Design system" };

const colors: { group: string; items: [string, string, string][] }[] = [
  {
    group: "Neutrals",
    items: [
      ["ink", "#141414", "Headings, body, primary buttons"],
      ["ink-soft", "#3d3d3d", "Strong secondary text"],
      ["muted", "#6b6b6b", "Lead paragraphs, descriptions"],
      ["subtle", "#8a8a8a", "Captions, meta, inactive tabs"],
      ["faint", "#a3a3a3", "Second line of two-tone headings"],
      ["line", "#efefef", "Dividers, tab track"],
      ["panel", "#f3f3f3", "Frames, cards, secondary buttons"],
      ["panel-strong", "#e9e9e9", "Hover on panel"],
      ["surface", "#ffffff", "Page, cards inside frames"],
    ],
  },
  {
    group: "Template tints",
    items: [
      ["tint-gold", "#f6ecd6", "Royal / gold designs"],
      ["tint-rose", "#fbe6ea", "Floral / blush designs"],
      ["tint-sand", "#f4ebe1", "Minimal / ivory designs"],
      ["tint-mint", "#e3efe9", "Nikah / emerald designs"],
      ["tint-peach", "#fbeadb", "Sikh / phulkari designs"],
      ["tint-butter", "#f8f0d8", "South Indian / brass designs"],
    ],
  },
  {
    group: "Functional",
    items: [
      ["whatsapp", "#25d366", "WhatsApp button only"],
      ["whatsapp-bubble", "#d9fdd3", "Outgoing chat bubble"],
      ["live", "#e5484d", "Pulsing live dot only"],
      ["placeholder", "#fff3c4", "Copy that must be replaced"],
    ],
  },
];

const type: [string, string, string][] = [
  ["text-display", "Wedding invites your family will open twice", "40–80px · 600 · −4% · hero only"],
  ["text-heading", "One link. Every function.", "34–56px · 600 · −3.5% · section headings"],
  ["text-title", "Grand openings", "18px · 600 · −2% · card titles"],
  ["text-lead", "Designer invitation websites for Indian weddings.", "19px · 400 · hero and section intros"],
  ["text-body", "Haldi to reception, each with time, venue and dress code.", "15px · 400 · card copy"],
  ["text-caption", "Hindu · Royal · Maroon & gold", "13px · captions, meta, tabs"],
];

function Block({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="border-t border-line py-16">
      <div className="grid gap-10 md:grid-cols-[220px_1fr]">
        <div>
          <p className="text-title">{title}</p>
          {note && <p className="mt-2 text-caption text-muted">{note}</p>}
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}

export default function DesignSystemPage() {
  return (
    <main className="bg-surface pb-24">
      <Container>
        <div className="pt-20 pb-16">
          <Eyebrow>Nimantran · design system</Eyebrow>
          <Display className="mt-4 max-w-3xl">
            Quiet chrome,
            <InlineIcon bg="var(--color-icon-butter)" rotate={-4}>
              <svg viewBox="-12 -12 24 24" className="size-[70%]">
                <MarigoldHead r={11} />
              </svg>
            </InlineIcon>
            loud invites.
          </Display>
          <Lead className="mt-6">
            The site stays monochrome so the invitations carry all the colour. Everything here is a token in <code>globals.css</code> or a component in{" "}
            <code>src/ui</code>.
          </Lead>
        </div>

        <Block title="Colour" note="Ink on white with soft grey panels. Tints appear only behind invitation previews.">
          <div className="space-y-10">
            {colors.map((g) => (
              <div key={g.group}>
                <Eyebrow>{g.group}</Eyebrow>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {g.items.map(([name, hex, use]) => (
                    <div key={name} className="overflow-hidden rounded-tile border border-line">
                      <div className="h-16" style={{ background: hex }} />
                      <div className="p-3">
                        <p className="text-caption font-semibold text-ink">{name}</p>
                        <p className="text-caption text-subtle uppercase">{hex}</p>
                        <p className="mt-1 text-caption text-muted">{use}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Block>

        <Block title="Typography" note="Geist for everything on the site. Tight negative tracking on large sizes; never bold body copy.">
          <div className="space-y-8">
            {type.map(([cls, sample, spec]) => (
              <div key={cls}>
                <p className={`${cls} text-ink`}>{sample}</p>
                <p className="mt-2 font-mono text-caption text-subtle">
                  {cls} · {spec}
                </p>
              </div>
            ))}
            <div>
              <Heading muted="Better than a video.">Better than a card.</Heading>
              <p className="mt-2 font-mono text-caption text-subtle">Heading with muted — the two-tone pattern</p>
            </div>
          </div>
        </Block>

        <Block title="Radius & surfaces" note="Panels are flat grey, no shadow. White cards sit inside grey, never grey on grey.">
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              ["rounded-frame", "36px", "Product frame"],
              ["rounded-card", "28px", "Panels, cards"],
              ["rounded-tile", "20px", "Preview tiles"],
              ["rounded-full", "pill", "Buttons, pills"],
            ].map(([cls, v, use]) => (
              <div key={cls}>
                <div className={`h-24 bg-panel ${cls}`} />
                <p className="mt-2 text-caption font-semibold">{cls}</p>
                <p className="text-caption text-subtle">
                  {v} · {use}
                </p>
              </div>
            ))}
          </div>
        </Block>

        <Block title="Buttons" note="Primary for the one main action per view. Secondary beside it. Inverse on dark bands.">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Choose a design</Button>
            <Button variant="secondary">See a live invite →</Button>
            <Button variant="ghost">WhatsApp us</Button>
            <Button size="md">Choose a design</Button>
            <Button disabled>Disabled</Button>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 rounded-card bg-ink p-6">
            <ButtonLink href="#" variant="inverse">
              Chat on WhatsApp
            </ButtonLink>
          </div>
        </Block>

        <Block title="Filters & tabs" note="Pills filter the gallery by category; underlined tabs change sort order.">
          <div className="space-y-6">
            <FilterDemo />
            <TabsDemo />
          </div>
        </Block>

        <Block title="Inline icons" note="Rounded tiles set inside a headline. Three per headline at most, each slightly rotated.">
          <p className="text-heading">
            Invites
            <InlineIcon bg="var(--color-icon-maroon)" rotate={-6}>
              <Diya className="size-[80%]" glow={false} />
            </InlineIcon>
            that open
            <InlineIcon bg="var(--color-icon-blush)" rotate={5}>
              <span className="size-[46%] rounded-full bg-[radial-gradient(circle_at_35%_30%,#d4677f,#a2405f_55%,#6e2440)]" />
            </InlineIcon>
          </p>
        </Block>

        <Block title="Template tile" note="An invitation preview on its tint, with an app-icon caption beneath.">
          <div className="max-w-[340px]">
            <div className="flex aspect-[4/3.6] items-end justify-center overflow-hidden rounded-tile bg-tint-gold">
              <div className="w-[46%] translate-y-[18%]">
                <PhoneFrame>
                  <InvitePreview slug="aarav-weds-meera" />
                </PhoneFrame>
              </div>
            </div>
            <TileCaption
              icon={
                <AppIcon bg="var(--color-tint-gold)">
                  <svg viewBox="-12 -12 24 24" className="size-5">
                    <MarigoldHead r={10} />
                  </svg>
                </AppIcon>
              }
              name="Rajwada"
              sub="Royal · Maroon & gold"
            />
          </div>
        </Block>

        <Block title="Frame" note="The grey frame with a white window holds the template gallery, like a product screenshot.">
          <Frame>
            <p className="text-title">Gallery window</p>
            <p className="mt-1 text-body text-muted">Filters, tabs and the tile grid live in here.</p>
          </Frame>
        </Block>

        <Block title="Panels & chat" note="Feature cards are panels. Chat bubbles show WhatsApp moments.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Panel className="p-6">
              <Title>RSVP on WhatsApp</Title>
              <p className="mt-1 text-body text-muted">Guests reply in two taps.</p>
            </Panel>
            <Panel className="flex flex-col gap-2 bg-whatsapp-wash p-6">
              <ChatBubble>Is the invite ready? 👀</ChatBubble>
              <ChatBubble from="me">Here it is! 💌</ChatBubble>
            </Panel>
          </div>
        </Block>

        <Block title="Badges & placeholders" note="Placeholders mark copy that must be replaced before launch. They are loud on purpose.">
          <div className="flex flex-wrap items-center gap-3 rounded-card bg-panel p-6">
            <Badge live>Most loved this season</Badge>
            <Badge>New</Badge>
            <span className="text-body">
              Reviewed by <Placeholder>[Couple names]</Placeholder>
            </span>
          </div>
        </Block>

        <Block title="FAQ" note="Accordion of panel cards; one open at a time.">
          <AccordionDemo />
        </Block>
      </Container>
    </main>
  );
}
