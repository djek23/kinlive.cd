"use client";

import { useLocale } from "../components/LocaleProvider";

export default function MentionsLegalesPage() {
  const { t } = useLocale();
  return (
    <main className="min-h-screen bg-[#111111] px-5 py-16 text-white">
      <section className="mx-auto max-w-[900px]"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#ff7a00]">{t("Informations légales")}</p><h1 className="mt-2 text-4xl font-black">{t("Mentions légales")}</h1><div className="mt-8 space-y-5 text-sm leading-7 text-white/60"><p>{t("Kinlive.cd exploite une plateforme de billetterie et de diffusion d'événements en République démocratique du Congo.")}</p><p>{t("Les informations concernant l'éditeur, le siège social, le numéro RCCM et les responsables de publication peuvent être complétés lors de l'immatriculation officielle.")}</p><p>{t("Les organisateurs restent responsables de la conformité de leurs événements, contenus, autorisations et remboursements.")}</p></div></section>
    </main>
  );
}
