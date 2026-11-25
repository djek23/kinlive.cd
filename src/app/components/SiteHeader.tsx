"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, ChevronDown, Globe2, Menu, Ticket, UserRound, X } from "lucide-react";
import Image from "next/image";
import { useLocale } from "./LocaleProvider";
import { languages, type Locale } from "../lib/translations";

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { locale, setLocale, t } = useLocale();

  return (
    <header className="relative z-50 border-b border-white/10 bg-[#111111]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1280px] items-center px-5 lg:px-8">
        <Link href="/" className="flex h-10 items-center" aria-label="Kinlive accueil">
          <Image src="/kinlive-logo.svg" alt="Kinlive.cd" width={160} height={40} className="h-10 w-auto" priority />
        </Link>

        <nav className="ml-10 hidden items-center gap-7 text-[14px] font-semibold text-white/80 md:flex">
          <Link className="group relative py-2 transition-[color,transform] hover:-translate-y-0.5 focus-visible:-translate-y-0.5 hover:text-[#ff7a00]" href="/#live">{t("En direct")}<span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-[#ff7a00] transition-transform duration-300 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100 motion-reduce:transition-none" /></Link>
          <Link className="group relative py-2 transition-[color,transform] hover:-translate-y-0.5 focus-visible:-translate-y-0.5 hover:text-[#ff7a00]" href="/evenements">{t("Événements")}<span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-[#ff7a00] transition-transform duration-300 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100 motion-reduce:transition-none" /></Link>
          <Link className="group relative py-2 transition-[color,transform] hover:-translate-y-0.5 focus-visible:-translate-y-0.5 hover:text-[#ff7a00]" href="/#categories">{t("Catégories")}<span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-[#ff7a00] transition-transform duration-300 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100 motion-reduce:transition-none" /></Link>
          <Link className="group relative py-2 transition-[color,transform] hover:-translate-y-0.5 focus-visible:-translate-y-0.5 hover:text-[#ff7a00]" href="/tendances">{t("Tendances")}<span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-[#ff7a00] transition-transform duration-300 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100 motion-reduce:transition-none" /></Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <details className="group relative hidden sm:block">
            <summary
              aria-label={t("Choisir la langue")}
              className="flex h-10 cursor-pointer list-none items-center gap-2 rounded-full px-3 text-sm font-semibold text-white/80 transition hover:bg-white/5"
            >
              <Globe2 size={17} /> {locale.toUpperCase()}
              <ChevronDown size={14} className="transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <div className="absolute right-0 top-full z-[60] mt-2 w-48 rounded-lg border border-white/10 bg-[#191919] p-1.5 shadow-xl">
              {languages.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  aria-pressed={locale === item.code}
                  onClick={(event) => {
                    setLocale(item.code);
                    event.currentTarget.closest("details")?.removeAttribute("open");
                  }}
                  className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm text-white/80 transition hover:bg-white/5 hover:text-[#ff7a00] aria-pressed:text-[#ff7a00]"
                >
                  {item.label}
                  {locale === item.code && <Check size={15} aria-hidden="true" />}
                </button>
              ))}
            </div>
          </details>
          <Link href="/evenements" className="hidden h-10 items-center gap-2 rounded-lg border border-white/15 px-4 text-sm font-bold hover:bg-white/5 sm:flex">
            <Ticket size={17} /> {t("Mes billets")}
          </Link>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full border border-white/15 sm:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={t("Menu")}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
          >
            <span className={`transition-transform duration-200 motion-reduce:transition-none ${menuOpen ? "rotate-90" : "rotate-0"}`}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </span>
          </button>
          <Link href="/connexion" className="grid h-10 w-10 place-items-center rounded-full bg-[#ff7a00] text-black sm:ml-1" aria-label={t("Compte organisateur")}>
            <UserRound size={18} />
          </Link>
        </div>
      </div>

      <nav
        id="mobile-navigation"
        aria-label="Navigation mobile"
        aria-hidden={!menuOpen}
        className={`grid max-h-0 overflow-hidden border-t border-transparent bg-[#111111] opacity-0 transition-[max-height,opacity,border-color] duration-300 ease-out pointer-events-none motion-reduce:transition-none md:hidden ${menuOpen ? "max-h-80 border-white/10 opacity-100 pointer-events-auto" : ""}`}
      >
        <div className="mobile-menu-inner px-5 py-5">
          <div className="flex flex-col gap-4 text-sm font-bold">
            <Link href="/#live" tabIndex={menuOpen ? 0 : -1} onClick={() => setMenuOpen(false)} className={`group relative w-fit hover:-translate-y-0.5 focus-visible:-translate-y-0.5 hover:text-[#ff7a00] transition-[opacity,transform,color] duration-200 ease-out motion-reduce:transition-none ${menuOpen ? "translate-x-0 opacity-100 delay-50" : "-translate-x-2 opacity-0"}`}>{t("En direct")}<span aria-hidden="true" className="absolute inset-x-0 -bottom-1 h-0.5 origin-left scale-x-0 bg-[#ff7a00] transition-transform duration-300 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100 motion-reduce:transition-none" /></Link>
            <Link href="/evenements" tabIndex={menuOpen ? 0 : -1} onClick={() => setMenuOpen(false)} className={`group relative w-fit hover:-translate-y-0.5 focus-visible:-translate-y-0.5 hover:text-[#ff7a00] transition-[opacity,transform,color] duration-200 ease-out motion-reduce:transition-none ${menuOpen ? "translate-x-0 opacity-100 delay-100" : "-translate-x-2 opacity-0"}`}>{t("Événements")}<span aria-hidden="true" className="absolute inset-x-0 -bottom-1 h-0.5 origin-left scale-x-0 bg-[#ff7a00] transition-transform duration-300 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100 motion-reduce:transition-none" /></Link>
            <Link href="/#categories" tabIndex={menuOpen ? 0 : -1} onClick={() => setMenuOpen(false)} className={`group relative w-fit hover:-translate-y-0.5 focus-visible:-translate-y-0.5 hover:text-[#ff7a00] transition-[opacity,transform,color] duration-200 ease-out motion-reduce:transition-none ${menuOpen ? "translate-x-0 opacity-100 delay-150" : "-translate-x-2 opacity-0"}`}>{t("Catégories")}<span aria-hidden="true" className="absolute inset-x-0 -bottom-1 h-0.5 origin-left scale-x-0 bg-[#ff7a00] transition-transform duration-300 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100 motion-reduce:transition-none" /></Link>
            <Link href="/tendances" tabIndex={menuOpen ? 0 : -1} onClick={() => setMenuOpen(false)} className={`group relative w-fit hover:-translate-y-0.5 focus-visible:-translate-y-0.5 hover:text-[#ff7a00] transition-[opacity,transform,color] duration-200 ease-out motion-reduce:transition-none ${menuOpen ? "translate-x-0 opacity-100 delay-200" : "-translate-x-2 opacity-0"}`}>{t("Tendances")}<span aria-hidden="true" className="absolute inset-x-0 -bottom-1 h-0.5 origin-left scale-x-0 bg-[#ff7a00] transition-transform duration-300 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100 motion-reduce:transition-none" /></Link>
          </div>
          <label className="mt-5 flex items-center gap-3 border-t border-white/10 pt-4 text-sm font-bold">
            <span className="flex items-center gap-2"><Globe2 size={16} />{t("Choisir la langue")}</span>
            <select
              value={locale}
              disabled={!menuOpen}
              onChange={(event) => setLocale(event.currentTarget.value as Locale)}
              className="ml-auto h-10 rounded-lg border border-white/10 bg-[#191919] px-3 text-sm"
            >
              {languages.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}
            </select>
          </label>
        </div>
      </nav>
    </header>
  );
}
