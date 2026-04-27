import Link from "next/link";
import { Logo } from "@/components/Logo";
import { MapPin, Mail, Phone } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/catalog", label: "Catalog" },
  { href: "/about", label: "About" },
  { href: "/login", label: "Log in" },
];

const CONTACT = [
  { Icon: MapPin, text: "Houston, TX" },
  { Icon: Mail, text: "sales@irepairtech.com" },
  { Icon: Phone, text: "(713) 555-0199" },
];

export const Footer = () => (
  <footer className="bg-footer text-footer-foreground">
    {/* Pale-yellow hairline accent at top of footer */}
    <div className="bg-line-accent h-[2px] w-full" aria-hidden="true" />

    <div className="container py-12">
      <div className="grid gap-10 md:grid-cols-4">

        {/* Brand block */}
        <div className="space-y-4 md:col-span-2">
          <Logo variant="light" />
          <p className="max-w-md text-sm leading-relaxed text-footer-foreground/65">
            Wholesale cell phone repair parts. Sourced direct from China, stocked in Houston, and
            delivered to independent repair shops across Texas.
          </p>
          <p className="text-sm font-semibold text-line-accent">Your tech, our care.</p>
        </div>

        {/* Navigate */}
        <div>
          <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-footer-foreground/40">
            Navigate
          </h3>
          <ul className="space-y-2.5 text-sm">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-footer-foreground/65 transition-colors duration-200 hover:text-footer-foreground"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-footer-foreground/40">
            Contact
          </h3>
          <ul className="space-y-2.5 text-sm">
            {CONTACT.map(({ Icon, text }) => (
              <li key={text} className="flex items-start gap-2.5 text-footer-foreground/65">
                <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-line-accent" strokeWidth={2} />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-white/8 pt-6 text-xs text-footer-foreground/40 sm:flex-row sm:items-center">
        <p>© {new Date().getFullYear()} iRepair Technologies. All rights reserved.</p>
        <p className="uppercase tracking-wider">Wholesale only · Volume pricing available</p>
      </div>
    </div>
  </footer>
);
