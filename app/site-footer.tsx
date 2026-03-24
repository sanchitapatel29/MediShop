import Link from "next/link";
import { BrandLogo } from "./brand-logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#07101a]/95 px-4 py-10 backdrop-blur-xl md:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1.3fr_0.7fr_0.9fr_0.9fr]">
        <div>
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" />
            <div>
              <p className="font-display text-xl font-semibold tracking-[-0.04em] text-white">MedEquip</p>
              <p className="text-sm text-slate-400">Medical equipment sourcing and supplier operations.</p>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
            Built for hospitals, clinics, and procurement teams that need a cleaner way to source products, manage
            orders, and coordinate supplier workflows.
          </p>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Explore</p>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <Link href="/" className="block transition hover:text-white">
              Home
            </Link>
            <Link href="/products" className="block transition hover:text-white">
              Product Catalog
            </Link>
            <Link href="/request" className="block transition hover:text-white">
              Request a Product
            </Link>
            <Link href="/orders" className="block transition hover:text-white">
              Orders
            </Link>
          </div>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Access</p>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <Link href="/login" className="block transition hover:text-white">
              Buyer Sign In
            </Link>
            <Link href="/signup" className="block transition hover:text-white">
              Create Buyer Account
            </Link>
            <Link href="/admin/login" className="block transition hover:text-white">
              Supplier Portal
            </Link>
          </div>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Contact</p>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <p>support@medequip.com</p>
            <p>+91 1800 210 4500</p>
            <p>Mon - Sat, 9:00 AM - 7:00 PM</p>
            <p className="text-slate-500">Procurement support, supplier onboarding, and order assistance.</p>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 flex max-w-6xl flex-col gap-3 border-t border-white/10 pt-5 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
        <p>© 2026 MedEquip. All rights reserved.</p>
        <div className="flex gap-5">
          <span>Privacy Policy</span>
          <span>Terms of Use</span>
          <span>Compliance</span>
        </div>
      </div>
    </footer>
  );
}
