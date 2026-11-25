"use client";

import Link from "next/link";
import Image from "next/image";
import { Camera, CirclePlay, Mail, MapPin, Phone } from "lucide-react";
import { useLocale } from "./LocaleProvider";

export default function SiteFooter() {
  const { t } = useLocale();
  return (
    <footer className="border-t border-white/10 bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-[1280px] px-5 py-12 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
          <div>
            <Link href="/" className="inline-flex" aria-label="Kinlive accueil">
              <Image src="/kinlive-logo.svg" alt="Kinlive.cd" width={160} height={40} className="h-10 w-auto" />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-6 text-white/50">
              {t("Kinlive est une plateforme congolaise de diffusion et de billetterie pour les événements culturels, sportifs et professionnels.")}
            </p>
            <div className="mt-5 flex items-center gap-2">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/60 transition hover:border-[#ff7a00] hover:text-[#ff7a00]"><span className="text-sm font-bold">f</span></a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/60 transition hover:border-[#ff7a00] hover:text-[#ff7a00]"><Camera size={16}/></a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube" className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/60 transition hover:border-[#ff7a00] hover:text-[#ff7a00]"><CirclePlay size={16}/></a>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-black">{t("Découvrir")}</h2>
            <nav className="mt-4 flex flex-col gap-3 text-sm text-white/50">
              <Link className="hover:text-[#ff7a00]" href="/#live">{t("En direct")}</Link>
              <Link className="hover:text-[#ff7a00]" href="/evenements">{t("Événements")}</Link>
              <Link className="hover:text-[#ff7a00]" href="/tendances">{t("Tendances")}</Link>
              <Link className="hover:text-[#ff7a00]" href="/connexion">{t("Espace organisateur")}</Link>
            </nav>
          </div>

          <div>
            <h2 className="text-sm font-black">{t("Informations")}</h2>
            <nav className="mt-4 flex flex-col gap-3 text-sm text-white/50">
              <Link className="hover:text-[#ff7a00]" href="/a-propos">{t("À propos")}</Link>
              <Link className="hover:text-[#ff7a00]" href="/mentions-legales">{t("Mentions légales")}</Link>
              <Link className="hover:text-[#ff7a00]" href="/confidentialite">{t("Politique de confidentialité")}</Link>
              <Link className="hover:text-[#ff7a00]" href="/conditions">{t("Conditions d'utilisation")}</Link>
            </nav>
          </div>

          <div>
            <h2 className="text-sm font-black">{t("Nous contacter")}</h2>
            <address className="mt-4 space-y-3 text-sm not-italic text-white/50">
              <p className="flex items-start gap-2"><MapPin size={16} className="mt-0.5 shrink-0 text-[#ff7a00]"/> {t("Kinshasa, République démocratique du Congo")}</p>
              <a href="mailto:contact@kinlive.cd" className="flex items-center gap-2 hover:text-[#ff7a00]"><Mail size={16} className="text-[#ff7a00]"/> contact@kinlive.cd</a>
              <a href="tel:+243811875107" className="flex items-center gap-2 hover:text-[#ff7a00]"><Phone size={16} className="text-[#ff7a00]"/> +243811875107</a>
            </address>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>{t("© 2026 Kinlive.cd. Tous droits réservés.")}</p>
          <p>{t("Plateforme de billetterie et de diffusion en direct")}</p>
        </div>
      </div>
    </footer>
  );
}
