"use client";

import { useLocale } from "../components/LocaleProvider";

export default function ConfidentialitePage() {
  const { t } = useLocale();
  return (
    <main className="min-h-screen bg-[#111111] px-5 py-16 text-white">
      <section className="mx-auto max-w-[900px]"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#ff7a00]">{t("Protection des données")}</p><h1 className="mt-2 text-4xl font-black">{t("Politique de confidentialité")}</h1><div className="mt-8 space-y-5 text-sm leading-7 text-white/60"><p>{t("Kinlive collecte uniquement les données nécessaires à la création de compte, l'émission des billets, les paiements, la sécurité des sessions et le support utilisateur.")}</p><p>{t("Les mots de passe sont hachés et les documents sensibles sont chiffrés. Les données ne sont pas revendues à des tiers sans base légale ou consentement applicable.")}</p><p>{t("Pour toute demande concernant vos données personnelles, contactez contact@kinlive.cd.")}</p></div></section>
    </main>
  );
}
