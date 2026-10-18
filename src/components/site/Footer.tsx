import Link from "next/link";
import { site, whatsappLink } from "@/config/site";
import { templates } from "@/data/templates";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="relative border-t border-line bg-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">{site.description}</p>
        </div>
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-muted uppercase">Designs</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {templates.map((t) => (
              <li key={t.id}>
                <Link href={`/templates/${t.id}`} className="hover:text-saffron">
                  {t.name} <span className="text-muted">· {t.mood.split(" · ")[0]}</span>
                </Link>
              </li>
            ))}
            <li>
              <Link href="/templates" className="hover:text-saffron">
                All designs
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-muted uppercase">Talk to us</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <a href={whatsappLink(`Hi ${site.name}!`)} target="_blank" rel="noreferrer" className="hover:text-saffron">
                WhatsApp {site.whatsappDisplay}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="hover:text-saffron">
                {site.email}
              </a>
            </li>
            <li className="text-muted">Every day, {site.hours}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-5 py-6 text-xs text-muted">
          © {site.name} · Digital wedding invitations, made with love in India
        </p>
      </div>
    </footer>
  );
}
