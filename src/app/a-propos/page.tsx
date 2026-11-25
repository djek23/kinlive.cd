"use client";

import { useLocale } from "../components/LocaleProvider";

export default function AProposPage() {
  const { t } = useLocale();
  return (
    <main className="min-h-screen bg-[#111111] px-5 py-16 text-white">
      <section className="mx-auto max-w-[900px]"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#ff7a00]">Kinlive.cd</p><h1 className="mt-2 text-4xl font-black">{t("À propos de Kinlive")}</h1><p className="mt-6 text-base leading-8 text-white/60">{t("Kinlive est une plateforme congolaise dédiée à la diffusion d'événements en direct, à la billetterie numérique et à la mise en relation entre organisateurs, artistes, entreprises et spectateurs.")}</p></section>
    </main>
  );
}
