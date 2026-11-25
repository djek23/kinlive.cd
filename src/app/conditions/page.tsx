"use client";

import { useLocale } from "../components/LocaleProvider";

export default function ConditionsPage() {
  const { t } = useLocale();
  return (
    <main className="min-h-screen bg-[#111111] px-5 py-16 text-white">
      <section className="mx-auto max-w-[900px]"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#ff7a00]">{t("Règles d’usage")}</p><h1 className="mt-2 text-4xl font-black">{t("Conditions d'utilisation")}</h1><div className="mt-8 space-y-5 text-sm leading-7 text-white/60"><p>{t("L'utilisation de Kinlive implique l'acceptation des règles relatives aux achats de billets, aux diffusions en direct, aux comptes organisateurs et aux paiements.")}</p><p>{t("Tout usage frauduleux, contrefacteur ou susceptible de compromettre la plateforme pourra entraîner la suspension du compte.")}</p><p>{t("Les tarifs, commissions, remboursements et modalités de retrait sont indiqués avant validation des opérations concernées.")}</p></div></section>
    </main>
  );
}
