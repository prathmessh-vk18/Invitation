import Link from "next/link";
import type { ComponentProps, CSSProperties, ReactNode } from "react";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

/* ───────── Layout ───────── */

/** Centres content at page width (1100px) or wide (1180px) with the standard side gutter. */
export function Container({ wide, className, children }: { wide?: boolean; className?: string; children: ReactNode }) {
  return <div className={cx("mx-auto w-full px-5", wide ? "max-w-wide" : "max-w-page", className)}>{children}</div>;
}

/** A page band. `tone="panel"` fills it grey; spacing is the standard 112px rhythm. */
export function Section({
  id,
  tone = "plain",
  center,
  className,
  children,
}: {
  id?: string;
  tone?: "plain" | "panel";
  center?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={cx("scroll-mt-20 py-28", tone === "panel" && "bg-panel", center && "text-center", className)}>
      {children}
    </section>
  );
}

/* ───────── Type ───────── */

export function Display({ className, children }: { className?: string; children: ReactNode }) {
  return <h1 className={cx("text-display text-balance text-ink", className)}>{children}</h1>;
}

/** Section heading. Pass `muted` for a second, grey line (the two-tone pattern). */
export function Heading({ children, muted, as: Tag = "h2", className }: { children: ReactNode; muted?: ReactNode; as?: "h2" | "h3"; className?: string }) {
  return (
    <Tag className={cx("text-heading text-balance text-ink", className)}>
      {children}
      {muted && (
        <>
          <br />
          <span className="text-faint">{muted}</span>
        </>
      )}
    </Tag>
  );
}

export function Title({ className, children }: { className?: string; children: ReactNode }) {
  return <p className={cx("text-title text-ink", className)}>{children}</p>;
}

export function Lead({ className, children }: { className?: string; children: ReactNode }) {
  return <p className={cx("max-w-[520px] text-lead text-muted", className)}>{children}</p>;
}

export function Eyebrow({ className, children }: { className?: string; children: ReactNode }) {
  return <p className={cx("text-caption font-medium text-subtle", className)}>{children}</p>;
}

/* ───────── Actions ───────── */

type ButtonVariant = "primary" | "secondary" | "inverse" | "ghost";
type ButtonSize = "md" | "lg";

const buttonBase = "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:pointer-events-none disabled:opacity-40";
const buttonVariant: Record<ButtonVariant, string> = {
  primary: "bg-ink text-white hover:bg-black",
  secondary: "bg-panel text-ink hover:bg-panel-strong",
  inverse: "bg-white text-ink hover:bg-white/90",
  ghost: "text-ink hover:bg-panel",
};
const buttonSize: Record<ButtonSize, string> = {
  md: "px-4 py-2.5 text-[15px]",
  lg: "px-5 py-3 text-[16px]",
};

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "lg", className?: string) {
  return cx(buttonBase, buttonVariant[variant], buttonSize[size], className);
}

export function Button({ variant, size, className, ...rest }: { variant?: ButtonVariant; size?: ButtonSize } & ComponentProps<"button">) {
  return <button className={buttonClass(variant, size, className)} {...rest} />;
}

/** A link styled as a button. External URLs open in a new tab. */
export function ButtonLink({
  href,
  variant,
  size,
  arrow,
  newTab,
  className,
  children,
}: {
  href: string;
  // Opens in a new tab (used for designs and live demos, so the site stays open behind them).
  newTab?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  arrow?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const external = /^https?:/.test(href);
  const content = (
    <>
      {children}
      {arrow && <span aria-hidden>→</span>}
    </>
  );
  return external ? (
    <a href={href} target="_blank" rel="noreferrer" className={buttonClass(variant, size, className)}>
      {content}
    </a>
  ) : (
    <Link href={href} target={newTab ? "_blank" : undefined} rel={newTab ? "noopener" : undefined} className={buttonClass(variant, size, className)}>
      {content}
    </Link>
  );
}

/* ───────── Surfaces ───────── */

/** Grey rounded panel — the default card. Put white cards inside a panel, never grey on grey. */
export function Panel({ className, children, tone = "panel" }: { className?: string; children: ReactNode; tone?: "panel" | "surface" }) {
  return <div className={cx("rounded-card", tone === "panel" ? "bg-panel" : "bg-surface", className)}>{children}</div>;
}

/** The large grey frame that holds a product shot (the template gallery), with a white window inside. */
export function Frame({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cx("rounded-frame bg-panel p-3 sm:p-10", className)}>
      <div className="rounded-[24px] bg-surface p-4 shadow-[0_1px_2px_rgb(0_0_0/.04)] sm:p-6">{children}</div>
    </div>
  );
}

/* ───────── Small pieces ───────── */

/** Rounded square icon tile set inline inside a headline. Sized in em so it scales with the text. */
export function InlineIcon({ bg, rotate = 0, label, children }: { bg: string; rotate?: number; label?: string; children: ReactNode }) {
  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className="mx-[0.12em] inline-grid size-[0.86em] translate-y-[0.08em] place-items-center rounded-[0.22em] align-baseline shadow-icon"
      style={{ background: bg, rotate: `${rotate}deg` } as CSSProperties}
    >
      {children}
    </span>
  );
}

/** 36px app-icon tile used beside a card's name and subtitle. */
export function AppIcon({ bg, children }: { bg: string; children: ReactNode }) {
  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-[10px] shadow-[inset_0_0_0_1px_rgb(0_0_0/.06)]" style={{ background: bg }}>
      {children}
    </span>
  );
}

/** Pill label on a panel, optionally with a pulsing live dot. */
export function Badge({ live, className, children }: { live?: boolean; className?: string; children: ReactNode }) {
  return (
    <span className={cx("inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-caption font-medium text-ink", className)}>
      {live && <span className="size-2 animate-pulse rounded-full bg-live" />}
      {children}
    </span>
  );
}

/** Marks copy that must be replaced before launch (reviews, stats). Loud on purpose. */
export function Placeholder({ children }: { children: ReactNode }) {
  return <span className="rounded bg-placeholder px-1 font-mono text-[0.8em] text-placeholder-ink">{children}</span>;
}

/** Name + subtitle caption under a tile, with an app icon. */
export function TileCaption({ icon, name, sub }: { icon: ReactNode; name: string; sub: string }) {
  return (
    <div className="mt-3 flex items-center gap-3 px-1">
      {icon}
      <div className="min-w-0">
        <p className="text-[14px] font-semibold text-ink">{name}</p>
        <p className="truncate text-caption text-muted">{sub}</p>
      </div>
    </div>
  );
}

/** WhatsApp-style chat bubble. */
export function ChatBubble({ from = "them", children }: { from?: "them" | "me"; children: ReactNode }) {
  return (
    <span
      className={cx(
        "w-fit max-w-[90%] rounded-2xl px-3 py-2 text-caption",
        from === "me" ? "ml-auto rounded-br-sm bg-whatsapp-bubble" : "rounded-bl-sm bg-surface",
      )}
    >
      {children}
    </span>
  );
}
