"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, Download, Eye, EyeOff, FileCheck2, ShieldCheck, UserRound } from "lucide-react";
import { getProducers, saveProducer } from "../lib/kinlive";
import { useLocale } from "../components/LocaleProvider";

const countries = [
  "Afghanistan", "Afrique du Sud", "Albanie", "Algérie", "Allemagne", "Andorre", "Angola", "Antigua-et-Barbuda", "Arabie saoudite", "Argentine", "Arménie", "Australie", "Autriche", "Azerbaïdjan",
  "Bahamas", "Bahreïn", "Bangladesh", "Barbade", "Belgique", "Belize", "Bénin", "Bhoutan", "Biélorussie", "Birmanie", "Bolivie", "Bosnie-Herzégovine", "Botswana", "Brésil", "Brunei", "Bulgarie", "Burkina Faso", "Burundi",
  "Cambodge", "Cameroun", "Canada", "Cap-Vert", "Chili", "Chine", "Chypre", "Colombie", "Comores", "Corée du Nord", "Corée du Sud", "Costa Rica", "Côte d’Ivoire", "Croatie", "Cuba",
  "Danemark", "Djibouti", "Dominique",
  "Égypte", "Émirats arabes unis", "Équateur", "Érythrée", "Espagne", "Estonie", "Eswatini", "États-Unis", "Éthiopie",
  "Fidji", "Finlande", "France",
  "Gabon", "Gambie", "Géorgie", "Ghana", "Grèce", "Grenade", "Guatemala", "Guinée", "Guinée-Bissau", "Guinée équatoriale", "Guyana",
  "Haïti", "Honduras", "Hongrie",
  "Inde", "Indonésie", "Irak", "Iran", "Irlande", "Islande", "Israël", "Italie",
  "Jamaïque", "Japon", "Jordanie",
  "Kazakhstan", "Kenya", "Kirghizistan", "Kiribati", "Kosovo", "Koweït",
  "Laos", "Lesotho", "Lettonie", "Liban", "Liberia", "Libye", "Liechtenstein", "Lituanie", "Luxembourg",
  "Macédoine du Nord", "Madagascar", "Malaisie", "Malawi", "Maldives", "Mali", "Malte", "Maroc", "Marshall", "Maurice", "Mauritanie", "Mexique", "Micronésie", "Moldavie", "Monaco", "Mongolie", "Monténégro", "Mozambique",
  "Namibie", "Nauru", "Népal", "Nicaragua", "Niger", "Nigéria", "Norvège", "Nouvelle-Zélande",
  "Oman", "Ouganda", "Ouzbékistan",
  "Pakistan", "Palaos", "Palestine", "Panama", "Papouasie-Nouvelle-Guinée", "Paraguay", "Pays-Bas", "Pérou", "Philippines", "Pologne", "Portugal",
  "Qatar",
  "République centrafricaine", "République démocratique du Congo", "République dominicaine", "République du Congo", "Roumanie", "Royaume-Uni", "Russie", "Rwanda",
  "Saint-Christophe-et-Niévès", "Saint-Marin", "Saint-Vincent-et-les-Grenadines", "Sainte-Lucie", "Salvador", "Samoa", "São Tomé-et-Príncipe", "Sénégal", "Serbie", "Seychelles", "Sierra Leone", "Singapour", "Slovaquie", "Slovénie", "Somalie", "Soudan", "Soudan du Sud", "Sri Lanka", "Suède", "Suisse", "Suriname", "Syrie",
  "Tadjikistan", "Tanzanie", "Tchad", "Tchéquie", "Thaïlande", "Timor oriental", "Togo", "Tonga", "Trinité-et-Tobago", "Tunisie", "Turkménistan", "Turquie", "Tuvalu",
  "Ukraine", "Uruguay",
  "Vanuatu", "Vatican", "Venezuela", "Vietnam",
  "Yémen",
  "Zambie", "Zimbabwe",
];

export default function ConnexionPage() {
  const { t } = useLocale();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [contractAccepted, setContractAccepted] = useState(false);
  const [cityQuery, setCityQuery] = useState("");
  const [citySuggestions, setCitySuggestions] = useState<Array<{ name: string; countryCode: string }>>([]);

  function downloadContract() {
    const contract = `CONTRAT DE DIFFUSION KINLIVE\n\nArticle 1 — Objet\nLe présent contrat autorise Kinlive à héberger, commercialiser et diffuser les événements de l'organisateur.\n\nArticle 2 — Commission\nKinlive retient une commission de vingt pour cent (20 %) sur le montant brut encaissé pour chaque billet vendu. L'organisateur reçoit quatre-vingts pour cent (80 %) du montant brut, sous réserve des justificatifs et modalités de paiement convenus.\n\nArticle 3 — Responsabilités\nL'organisateur garantit être autorisé à exercer son activité, à organiser l'événement et à diffuser les contenus fournis. Il fournit des justificatifs vrais et à jour.\n\nArticle 4 — Paiement et retraits\nLes retraits sont soumis à vérification des ventes, au règlement applicable et aux informations bancaires ou Mobile Money validées.\n\nArticle 5 — Acceptation\nL'organisateur confirme avoir lu et accepté les conditions avant la création de son compte.`;
    const blob = new Blob([contract], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Contrat-de-diffusion-Kinlive.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  function validatePdf(file: File | null, label: string) {
    if (!file) return `${label} ${t("est obligatoire.")}`;
    if (file.type !== "application/pdf") return `${label} ${t("doit être au format PDF.")}`;
    if (file.size > 10 * 1024 * 1024) return `${label} ${t("ne doit pas dépasser 10 Mo.")}`;
    return "";
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email")).trim().toLowerCase();
    const password = String(form.get("password"));

    if (mode === "register") {
      const name = String(form.get("name")).trim();
      const phone = String(form.get("phone")).trim();
      const ownerName = String(form.get("ownerName")).trim();
      const city = String(form.get("city")).trim();
      const country = String(form.get("country")).trim();
      const rccm = String(form.get("rccm")).trim();
      const identityNumber = String(form.get("identityNumber")).trim();
      const identityFile = form.get("identityFile") as File;
      const rccmFile = form.get("rccmFile") as File;
      const authorizationFile = form.get("authorizationFile") as File;

      if (!name || !phone || !ownerName || !city || !country || !rccm || !identityNumber) {
        setError(t("Veuillez renseigner tous les champs obligatoires."));
        return;
      }
      for (const [file, label] of [[identityFile, t("La pièce d’identité")], [rccmFile, t("Le RCCM")], [authorizationFile, t("Le document d’autorisation")]] as const) {
        const validationError = validatePdf(file, label);
        if (validationError) { setError(validationError); return; }
      }
      if (!contractAccepted) {
        setError(t("Vous devez lire et accepter le contrat de diffusion."));
        return;
      }

      const producers = getProducers();
      if (producers.some((producer) => producer.email === email)) {
        setError(t("Cette adresse email est déjà utilisée."));
        return;
      }
      saveProducer({
        id: crypto.randomUUID(), name, email, phone, password, role: "producer",
        ownerName, city, country, rccm, identityNumber,
        identityFileName: identityFile.name,
        rccmFileName: rccmFile.name,
        authorizationFileName: authorizationFile.name,
        contractAccepted: true,
        contractAcceptedAt: new Date().toISOString(),
        status: "pending",
        submittedAt: new Date().toISOString(),
      });
      router.push("/organisateur");
      return;
    }

    const producer = getProducers().find((item) => item.email === email && item.password === password);
    if (!producer) { setError(t("Email ou mot de passe incorrect.")); return; }
    if (producer.status === "suspended") { setError(t("Votre compte est suspendu. Contactez l'administration Kinlive.")); return; }
    if (producer.status === "pending") { setError(t("Votre dossier est en attente de validation par l'administrateur.")); return; }
    window.localStorage.setItem("kinlive_session", JSON.stringify(producer));
    router.push("/organisateur");
  }

  useEffect(() => {
    if (cityQuery.trim().length < 2) {
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/cities?q=${encodeURIComponent(cityQuery)}`, { signal: controller.signal });
        if (response.ok) setCitySuggestions(await response.json());
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) setCitySuggestions([]);
      }
    }, 250);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [cityQuery]);

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#111111] px-5 py-12 text-white">
      <div className="absolute left-5 top-5"><button onClick={() => router.push("/")} className="flex items-center gap-2 text-sm text-white/60 hover:text-white"><ArrowLeft size={17}/> {t("Retour")}</button></div>
      <section className={`w-full rounded-2xl border border-white/10 bg-[#191919] p-6 shadow-2xl sm:p-8 ${mode === "register" ? "max-w-[820px]" : "max-w-[460px]"}`}>
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-[#ff7a00] text-black"><UserRound size={28}/></div>
          <h1 className="text-2xl font-black">{t("Espace organisateur")}</h1>
          <p className="mt-2 text-sm text-white/50">{t("Créez un compte vérifié pour gérer vos événements")}</p>
        </div>
        <div className="mx-auto mb-6 grid max-w-[420px] grid-cols-2 rounded-lg bg-black p-1">
          <button type="button" onClick={() => { setMode("login"); setError(""); }} className={`rounded-md py-2.5 text-sm font-bold ${mode === "login" ? "bg-[#ff7a00] text-black" : "text-white/60"}`}>{t("Connexion")}</button>
          <button type="button" onClick={() => { setMode("register"); setError(""); }} className={`rounded-md py-2.5 text-sm font-bold ${mode === "register" ? "bg-[#ff7a00] text-black" : "text-white/60"}`}>{t("Créer un compte")}</button>
        </div>

        <form onSubmit={submit} className="space-y-5">
          {mode === "register" ? (
            <>
              <div className="flex items-center gap-3 border-b border-white/10 pb-3"><Building2 className="text-[#ff7a00]" size={20}/><h2 className="font-black">{t("Informations de l'entreprise")}</h2></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-bold">{t("Nom de l'organisation")} *<input name="name" required className="mt-2 h-12 w-full rounded-lg border border-white/10 bg-black/40 px-4 outline-none focus:border-[#ff7a00]" placeholder="Studio Kin Productions" /></label>
                <label className="text-sm font-bold">{t("Numéro RCCM")} *<input name="rccm" required className="mt-2 h-12 w-full rounded-lg border border-white/10 bg-black/40 px-4 uppercase outline-none focus:border-[#ff7a00]" placeholder="CD/KNG/RCCM/24-A-0001" /></label>
                <label className="text-sm font-bold">{t("Nom complet du propriétaire")} *<input name="ownerName" required className="mt-2 h-12 w-full rounded-lg border border-white/10 bg-black/40 px-4 outline-none focus:border-[#ff7a00]" placeholder={t("Prénom et nom")} /></label>
                <label className="text-sm font-bold">{t("Numéro passeport / CNI")} *<input name="identityNumber" required className="mt-2 h-12 w-full rounded-lg border border-white/10 bg-black/40 px-4 outline-none focus:border-[#ff7a00]" placeholder={t("Numéro officiel")} /></label>
                <label className="relative block text-sm font-bold">{t("Ville de résidence")} *<input name="city" value={cityQuery} onChange={(event) => { setCityQuery(event.target.value); if (event.target.value.trim().length < 2) setCitySuggestions([]); }} required list="world-cities" autoComplete="address-level2" className="mt-2 h-12 w-full rounded-lg border border-white/10 bg-black/40 px-4 outline-none focus:border-[#ff7a00]" placeholder={t("Recherchez une ville")} /><datalist id="world-cities">{citySuggestions.map((city) => <option key={`${city.name}-${city.countryCode}`} value={city.name}>{city.name} ({city.countryCode})</option>)}</datalist></label>
                <label className="text-sm font-bold">{t("Pays")} *<select name="country" required defaultValue="République démocratique du Congo" className="mt-2 h-12 w-full rounded-lg border border-white/10 bg-[#111111] px-4 outline-none focus:border-[#ff7a00]"><option value="" disabled>{t("Sélectionnez un pays")}</option>{countries.map((country) => <option key={country} value={country}>{country}</option>)}</select></label>
              </div>

              <div className="flex items-center gap-3 border-b border-white/10 pb-3"><FileCheck2 className="text-[#ff7a00]" size={20}/><h2 className="font-black">{t("Documents justificatifs")}</h2></div>
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="text-sm font-bold">{t("Passeport ou CNI (PDF)")} *<input name="identityFile" type="file" accept="application/pdf,.pdf" required className="mt-2 block w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs file:mr-3 file:rounded-md file:border-0 file:bg-[#ff7a00] file:px-3 file:py-2 file:text-xs file:font-black file:text-black" /></label>
                <label className="text-sm font-bold">{t("RCCM de l'entreprise (PDF)")} *<input name="rccmFile" type="file" accept="application/pdf,.pdf" required className="mt-2 block w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs file:mr-3 file:rounded-md file:border-0 file:bg-[#ff7a00] file:px-3 file:py-2 file:text-xs file:font-black file:text-black" /></label>
                <label className="text-sm font-bold">{t("Autorisation d'exercer (PDF)")} *<input name="authorizationFile" type="file" accept="application/pdf,.pdf" required className="mt-2 block w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs file:mr-3 file:rounded-md file:border-0 file:bg-[#ff7a00] file:px-3 file:py-2 file:text-xs file:font-black file:text-black" /></label>
              </div>
              <p className="text-xs text-white/40">{t("Documents PDF uniquement, avec une taille maximale de 10 Mo chacun.")}</p>

              <div className="rounded-xl border border-[#ff7a00]/25 bg-[#ff7a00]/5 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-wider text-[#ff7a00]">{t("Contrat de diffusion")}</p><h2 className="mt-1 font-black">{t("Commission Kinlive : 20 %")}</h2></div><button type="button" onClick={downloadContract} className="flex h-10 items-center gap-2 rounded-lg border border-white/15 px-3 text-xs font-bold"><Download size={15}/> {t("Télécharger")}</button></div>
                <p className="mt-4 text-sm leading-6 text-white/65">{t("Kinlive retient 20 % du montant brut encaissé sur chaque billet vendu. L'organisateur reçoit 80 % du montant, sous réserve des délais et moyens de paiement applicables.")}</p>
                <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm"><input type="checkbox" checked={contractAccepted} onChange={(e) => setContractAccepted(e.target.checked)} className="mt-1 h-4 w-4 accent-[#ff7a00]"/><span>{t("J'ai lu le contrat de diffusion et j'accepte que Kinlive retienne une commission de 20 % sur les recettes.")}</span></label>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="text-sm font-bold">{t("Téléphone")} *<input name="phone" required className="mt-2 h-12 w-full rounded-lg border border-white/10 bg-black/40 px-4 outline-none focus:border-[#ff7a00]" placeholder="+243 900 000 000" /></label>
                <label className="text-sm font-bold">{t("Adresse email")} *<input name="email" type="email" required className="mt-2 h-12 w-full rounded-lg border border-white/10 bg-black/40 px-4 outline-none focus:border-[#ff7a00]" placeholder="contact@entreprise.cd" /></label>
                <label className="text-sm font-bold">{t("Mot de passe")} *<div className="relative"><input name="password" type={showPassword ? "text" : "password"} required minLength={6} className="mt-2 h-12 w-full rounded-lg border border-white/10 bg-black/40 px-4 pr-12 outline-none focus:border-[#ff7a00]" placeholder={t("Minimum 6 caractères")}/><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 text-white/45" aria-label={t("Afficher le mot de passe")}>{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div></label>
              </div>
            </>
          ) : (
            <>
              <label className="block text-sm font-bold">{t("Adresse email")}<input name="email" type="email" required className="mt-2 h-12 w-full rounded-lg border border-white/10 bg-black/40 px-4 outline-none focus:border-[#ff7a00]" placeholder="contact@votreentreprise.cd" /></label>
              <label className="block text-sm font-bold">{t("Mot de passe")}<div className="relative"><input name="password" type={showPassword ? "text" : "password"} required minLength={6} className="mt-2 h-12 w-full rounded-lg border border-white/10 bg-black/40 px-4 pr-12 outline-none focus:border-[#ff7a00]" placeholder={t("Minimum 6 caractères")}/><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 text-white/45" aria-label={t("Afficher le mot de passe")}>{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div></label>
            </>
          )}
          {error && <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"><ShieldCheck className="mr-2 inline" size={16}/>{error}</p>}
          <button className="h-12 w-full rounded-lg bg-[#ff7a00] text-sm font-black text-black">{mode === "login" ? t("Se connecter") : t("Soumettre mon dossier")}</button>
        </form>
      </section>
    </main>
  );
}
