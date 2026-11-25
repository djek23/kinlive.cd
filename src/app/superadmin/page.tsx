"use client";

import { useState } from "react";
import { Ban, Building2, CheckCircle2, CreditCard, LayoutDashboard, LogOut, Trash2, Users } from "lucide-react";
import {
  deleteProducer,
  getPaymentProviders,
  getProducers,
  getSuperAdminSession,
  getSuperAdmins,
  savePaymentProviders,
  saveSuperAdmin,
  updateProducerStatus,
  type PaymentProvider,
  type Producer,
  type SuperAdmin,
} from "../lib/kinlive";

export default function SuperAdminPage() {
  const [session, setSession] = useState<SuperAdmin | null>(() => getSuperAdminSession());
  const [tab, setTab] = useState("Vue d'ensemble");
  const [producers, setProducers] = useState<Producer[]>(() => getProducers());
  const [providers, setProviders] = useState<PaymentProvider[]>(() => getPaymentProviders());
  const [error, setError] = useState("");
  const [loginError, setLoginError] = useState("");

  function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError("");
    if (getSuperAdmins().length === 0) {
      saveSuperAdmin({
        id: "superadmin-default",
        name: "Super Administrateur",
        email: "admin@kinlive.cd",
        phone: "+243 000 000 000",
        password: "AdminKinlive2026!",
        role: "superadmin",
      });
    }
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email")).trim().toLowerCase();
    const password = String(form.get("password"));
    const admin = getSuperAdmins().find((item) => item.email === email && item.password === password);
    if (!admin) {
      setLoginError("Identifiants superadministrateur incorrects.");
      return;
    }
    window.localStorage.setItem("kinlive_superadmin_session", JSON.stringify(admin));
    setSession(admin);
  }

  function logout() {
    window.localStorage.removeItem("kinlive_superadmin_session");
    setSession(null);
  }

  function refresh() {
    setProducers(getProducers());
  }

  function approve(producer: Producer) {
    const note = window.prompt("Note d'approbation (optionnelle)", "Dossier approuvé après vérification.") ?? "";
    updateProducerStatus(producer.id, "active", note);
    refresh();
  }

  function suspend(producer: Producer) {
    const note = window.prompt("Motif de suspension", "Compte suspendu après vérification administrative.")?.trim();
    if (!note) return;
    updateProducerStatus(producer.id, "suspended", note);
    refresh();
  }

  function remove(producer: Producer) {
    if (!window.confirm(`Supprimer définitivement le compte « ${producer.name} » ? Cette action est irréversible.`)) return;
    deleteProducer(producer.id);
    refresh();
  }

  function updateProvider(index: number, field: keyof PaymentProvider, value: string | boolean) {
    setProviders((current) => current.map((provider, providerIndex) => providerIndex === index ? { ...provider, [field]: value } : provider));
  }

  function saveProviders() {
    savePaymentProviders(providers);
    setError("");
    window.alert("Configuration des paiements enregistrée.");
  }

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#111111] px-5 py-12 text-white">
        <section className="w-full max-w-[440px] rounded-2xl border border-white/10 bg-[#191919] p-7 shadow-2xl">
          <div className="mb-6 text-center"><div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-[#ff7a00] text-black"><LayoutDashboard size={27}/></div><h1 className="text-2xl font-black">Super administration</h1><p className="mt-2 text-sm text-white/45">Connexion réservée à l&apos;administrateur Kinlive</p></div>
          <form onSubmit={login} className="space-y-4">
            <label className="block text-sm font-bold">Adresse email<input name="email" type="email" required defaultValue="admin@kinlive.cd" className="mt-2 h-12 w-full rounded-lg border border-white/10 bg-black/40 px-4 outline-none focus:border-[#ff7a00]"/></label>
            <label className="block text-sm font-bold">Mot de passe<input name="password" type="password" required defaultValue="AdminKinlive2026!" className="mt-2 h-12 w-full rounded-lg border border-white/10 bg-black/40 px-4 outline-none focus:border-[#ff7a00]"/></label>
            {loginError && <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{loginError}</p>}
            <button className="h-12 w-full rounded-lg bg-[#ff7a00] text-sm font-black text-black">Accéder à l&apos;administration</button>
          </form>
        </section>
      </main>
    );
  }

  const pending = producers.filter((producer) => producer.status === "pending");
  const active = producers.filter((producer) => producer.status === "active");
  const suspended = producers.filter((producer) => producer.status === "suspended");

  return (
    <main className="min-h-screen bg-[#111111] text-white">
      <header className="border-b border-white/10 bg-[#161616]"><div className="mx-auto flex h-[72px] max-w-[1280px] items-center px-5"><div><p className="text-xs font-black uppercase tracking-[0.15em] text-[#ff7a00]">Kinlive Admin</p><p className="text-sm font-bold">{session.name}</p></div><button onClick={logout} className="ml-auto flex h-10 items-center gap-2 rounded-lg border border-white/10 px-3 text-sm"><LogOut size={16}/> Déconnexion</button></div></header>
      <div className="mx-auto max-w-[1280px] px-5 py-8">
        <div className="mb-6 flex gap-2 overflow-x-auto border-b border-white/10 pb-3">{["Vue d'ensemble", "Organisateurs", "Paiements"].map((item) => <button key={item} onClick={() => setTab(item)} className={`shrink-0 rounded-lg px-4 py-2.5 text-sm font-bold ${tab === item ? "bg-[#ff7a00] text-black" : "text-white/55 hover:bg-white/5"}`}>{item}</button>)}</div>

        {tab === "Vue d'ensemble" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[{label:"Tous les comptes",value:producers.length,icon:Users},{label:"En attente",value:pending.length,icon:Building2},{label:"Actifs",value:active.length,icon:CheckCircle2},{label:"Suspendus",value:suspended.length,icon:Ban}].map((card) => <div key={card.label} className="rounded-xl border border-white/10 bg-[#191919] p-5"><card.icon className="mb-5 text-[#ff7a00]"/><p className="text-3xl font-black">{card.value}</p><p className="mt-2 text-sm text-white/55">{card.label}</p></div>)}
          </div>
        )}

        {tab === "Organisateurs" && (
          <section className="overflow-hidden rounded-xl border border-white/10 bg-[#191919]"><div className="border-b border-white/10 p-5"><h2 className="font-black">Demandes et comptes organisateurs</h2></div>{producers.length === 0 ? <p className="px-5 py-16 text-center text-sm text-white/45">Aucun compte organisateur.</p> : <div className="divide-y divide-white/10">{producers.map((producer) => <article key={producer.id} className="grid gap-4 p-5 lg:grid-cols-[1fr_180px_220px]"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-black">{producer.name}</h3><span className={`rounded-full px-2 py-1 text-[10px] font-black ${producer.status === "active" ? "bg-emerald-500/10 text-emerald-400" : producer.status === "suspended" ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"}`}>{producer.status === "active" ? "ACTIF" : producer.status === "suspended" ? "SUSPENDU" : "EN ATTENTE"}</span></div><p className="mt-2 text-sm text-white/55">{producer.ownerName} · {producer.city}, {producer.country}</p><p className="mt-1 text-xs text-white/40">{producer.email} · {producer.phone} · RCCM {producer.rccm}</p>{producer.reviewNote && <p className="mt-2 rounded-lg bg-black/20 px-3 py-2 text-xs text-white/50">{producer.reviewNote}</p>}</div><div className="text-xs text-white/40"><p>Pièces</p><p className="mt-1 text-white/70">{producer.identityFileName}</p><p className="mt-1">{producer.rccmFileName}</p></div><div className="flex flex-wrap gap-2 lg:justify-end">{producer.status !== "active" && <button onClick={() => approve(producer)} className="flex h-9 items-center gap-2 rounded-lg bg-emerald-500 px-3 text-xs font-black text-black"><CheckCircle2 size={14}/> Approuver</button>}{producer.status !== "suspended" && <button onClick={() => suspend(producer)} className="flex h-9 items-center gap-2 rounded-lg bg-amber-500 px-3 text-xs font-black text-black"><Ban size={14}/> Suspendre</button>}<button onClick={() => remove(producer)} className="flex h-9 items-center gap-2 rounded-lg border border-red-500/30 px-3 text-xs font-bold text-red-300"><Trash2 size={14}/> Supprimer</button></div></article>)}</div>}</section>
        )}

        {tab === "Paiements" && (
          <section className="rounded-xl border border-white/10 bg-[#191919]"><div className="flex items-center justify-between border-b border-white/10 p-5"><div><p className="text-xs text-white/40">Passerelles</p><h2 className="mt-1 font-black">Configuration des paiements</h2></div><button onClick={saveProviders} className="h-10 rounded-lg bg-[#ff7a00] px-4 text-sm font-black text-black">Enregistrer</button></div><div className="divide-y divide-white/10">{providers.map((provider, index) => <div key={provider.id} className="grid gap-4 p-5 lg:grid-cols-[220px_1fr_1fr_1fr_100px]"><div className="flex items-center gap-3"><CreditCard className="text-[#ff7a00]"/><div><p className="font-bold">{provider.name}</p><p className="text-xs text-white/40">{provider.id}</p></div></div><label className="text-xs font-bold">Clé publique<input value={provider.publicKey} onChange={(event) => updateProvider(index, "publicKey", event.target.value)} className="mt-2 h-10 w-full rounded-lg border border-white/10 bg-black/40 px-3 text-sm outline-none focus:border-[#ff7a00]" placeholder="Public / app key"/></label><label className="text-xs font-bold">Clé secrète<input type="password" value={provider.secretKey} onChange={(event) => updateProvider(index, "secretKey", event.target.value)} className="mt-2 h-10 w-full rounded-lg border border-white/10 bg-black/40 px-3 text-sm outline-none focus:border-[#ff7a00]" placeholder="Secret key"/></label><label className="text-xs font-bold">Webhook<input value={provider.webhookUrl} onChange={(event) => updateProvider(index, "webhookUrl", event.target.value)} className="mt-2 h-10 w-full rounded-lg border border-white/10 bg-black/40 px-3 text-sm outline-none focus:border-[#ff7a00]" placeholder="https://..."/></label><label className="flex items-center gap-2 text-xs font-bold"><input type="checkbox" checked={provider.enabled} onChange={(event) => updateProvider(index, "enabled", event.target.checked)} className="h-4 w-4 accent-[#ff7a00]"/>Activer</label></div>)}</div>{error && <p className="p-5 text-red-300">{error}</p>}</section>
        )}
      </div>
    </main>
  );
}
