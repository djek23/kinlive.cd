"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, LogOut, Ticket, Users, WalletCards, ArrowLeft, TrendingUp, Eye, Landmark, CreditCard, ChevronRight, Radio, Copy, Square, ExternalLink } from "lucide-react";
import { cancelTicketSale, defaultCategories, getCategories, getEvents, getProducerSession, getTicketSales, saveCategories, saveEvents, type KinliveEvent, type Producer } from "../lib/kinlive";
import Image from "next/image";

export default function OrganisateurPage() {
  const router = useRouter();
  const [producer] = useState<Producer | null>(() => getProducerSession());
  const [events, setEvents] = useState<KinliveEvent[]>(() => {
    const session = getProducerSession();
    return session ? getEvents().filter((event) => event.producerId === session.id) : [];
  });
  const [sales, setSales] = useState(() => getTicketSales());
  const producerSales = sales.filter((sale) => sale.producerId === "gala-organizer" || events.some((item) => item.id === sale.eventId));
  const activeProducerSales = producerSales.filter((sale) => sale.status === "paid");
  const grossRevenue = activeProducerSales.reduce((total, sale) => total + sale.amount, 0);
  const commission = grossRevenue * 0.20;
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("Vue d'ensemble");
  const [imagePreview, setImagePreview] = useState("");
  const [liveEventId, setLiveEventId] = useState("");
  const [categories, setCategories] = useState<string[]>(() => getCategories());
  const [newCategory, setNewCategory] = useState("");
  const [ticketCategories, setTicketCategories] = useState([
    { name: "Standard", price: 20, quantity: 100 },
    { name: "VIP", price: 45, quantity: 30 },
    { name: "Streaming", price: 10, quantity: 500 },
  ]);

  useEffect(() => {
    if (!getProducerSession()) router.replace("/connexion");
  }, [router]);

  function createEvent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!producer) return;
    const form = new FormData(event.currentTarget);
    const dateValue = String(form.get("date"));
    const date = new Date(`${dateValue}T12:00:00`).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }).toUpperCase();
    const newEvent: KinliveEvent = {
      id: crypto.randomUUID(),
      title: String(form.get("title")),
      place: String(form.get("place")),
      date,
      time: String(form.get("time")),
      price: `${form.get("price")} $`,
      category: String(form.get("category")),
      image: imagePreview || String(form.get("image") || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=85"),
      producerId: producer.id,
      status: "published",
      description: String(form.get("description")),
      eventDate: dateValue,
      ticketCategories,
    };
    const allEvents = getEvents();
    allEvents.unshift(newEvent);
    saveEvents(allEvents);
    setEvents((current) => [newEvent, ...current]);
    setShowForm(false);
    setImagePreview("");
  }

  function addCategory() {
    const name = newCategory.trim();
    if (!name) return;
    if (categories.some((item) => item.toLowerCase() === name.toLowerCase())) {
      setNewCategory("");
      return;
    }
    const updated = [...categories, name];
    saveCategories(updated);
    setCategories(updated);
    setNewCategory("");
  }

  function removeCategory(name: string) {
    if (defaultCategories.includes(name)) return;
    if (!confirm(`Supprimer la catégorie « ${name} » ?`)) return;
    const updated = categories.filter((item) => item !== name);
    saveCategories(updated);
    setCategories(updated);
  }

  function logout() {
    window.localStorage.removeItem("kinlive_session");
    router.push("/");
  }

  function selectEventImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setImagePreview(String(reader.result || ""));
    reader.readAsDataURL(file);
  }

  function startLive(event: KinliveEvent) {
    if (event.eventDate) {
      const today = new Intl.DateTimeFormat("en-CA").format(new Date());
      if (today !== event.eventDate) {
        alert(`Le live pourra être lancé le ${event.date} à ${event.time}.`);
        return;
      }
    }
    const updatedEvents = getEvents().map((item) => item.id === event.id ? { ...item, liveStatus: "live" as const } : item);
    saveEvents(updatedEvents);
    setEvents(updatedEvents.filter((item) => item.producerId === producer?.id));
    setLiveEventId(event.id);
  }

  function stopLive(event: KinliveEvent) {
    const updatedEvents = getEvents().map((item) => item.id === event.id ? { ...item, liveStatus: "ended" as const } : item);
    saveEvents(updatedEvents);
    setEvents(updatedEvents.filter((item) => item.producerId === producer?.id));
  }

  function cancelSale(id: string) {
    if (!confirm("Annuler ce billet ?")) return;
    if (cancelTicketSale(id)) setSales(getTicketSales());
  }

  const activeLive = events.find((item) => item.id === liveEventId && item.liveStatus === "live");

  if (!producer) return <main className="min-h-screen bg-[#111111]" />;

  return (
    <main className="min-h-screen bg-[#111111] text-white">
      <header className="border-b border-white/10 bg-[#161616]">
        <div className="mx-auto flex h-[72px] max-w-[1280px] items-center px-5 lg:px-8">
          <button onClick={() => router.push("/")} className="flex items-center gap-2 text-sm text-white/60 hover:text-white"><ArrowLeft size={16}/> Site public</button>
          <div className="ml-auto flex items-center gap-3"><div className="hidden text-right sm:block"><p className="text-sm font-bold">{producer.name}</p><p className="text-xs text-white/45">Organisateur</p></div><button onClick={logout} className="grid h-10 w-10 place-items-center rounded-full border border-white/10 hover:bg-white/5" aria-label="Déconnexion"><LogOut size={17}/></button></div>
        </div>
      </header>

      <div className="mx-auto max-w-[1280px] px-5 py-8 lg:px-8">
        <div className="mb-8 flex items-end justify-between"><div><p className="mb-1 text-xs font-black uppercase tracking-[0.15em] text-[#ff7a00]">Tableau de bord</p><h1 className="text-3xl font-black">Bonjour, {producer.name}</h1></div><button onClick={() => setShowForm(true)} className="flex h-11 items-center gap-2 rounded-lg bg-[#ff7a00] px-4 text-sm font-black text-black"><CalendarPlus size={18}/> Nouvel événement</button></div>

        <div className="mb-6 flex gap-2 overflow-x-auto border-b border-white/10 pb-3">
          {["Vue d'ensemble", "Mes événements", "Ventes", "Catégories", "Retraits"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`shrink-0 rounded-lg px-4 py-2.5 text-sm font-bold transition ${activeTab === tab ? "bg-[#ff7a00] text-black" : "text-white/55 hover:bg-white/5 hover:text-white"}`}>{tab}</button>
          ))}
        </div>

        {activeTab === "Vue d'ensemble" && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[{label:"Événements",value:events.length,icon:CalendarPlus,trend:"Vos événements"},{label:"Billets vendus",value:activeProducerSales.reduce((total, sale) => total + (sale.quantity || 1), 0),icon:Ticket,trend:"Ventes confirmées"},{label:"Spectateurs",value:activeProducerSales.reduce((total, sale) => total + (sale.quantity || 1), 0),icon:Users,trend:"Prochain live"},{label:"Revenus",value:`${grossRevenue.toFixed(2)} $`,icon:WalletCards,trend:"Solde disponible"}].map((card) => (
                <div key={card.label} className="rounded-xl border border-white/10 bg-[#191919] p-5"><div className="mb-5 flex items-center justify-between"><card.icon size={20} className="text-[#ff7a00]"/><TrendingUp size={18} className="text-emerald-400"/></div><p className="text-2xl font-black">{card.value}</p><p className="mt-1 text-sm font-bold text-white/70">{card.label}</p><p className="mt-3 text-xs text-white/35">{card.trend}</p></div>
              ))}
            </div>
            <section className="mt-8 rounded-xl border border-white/10 bg-[#191919]">
              <div className="flex items-center justify-between border-b border-white/10 p-5"><div><p className="text-xs text-white/40">Activité récente</p><h2 className="mt-1 font-black">Mes événements</h2></div><button onClick={() => setActiveTab("Mes événements")} className="flex items-center gap-1 text-xs font-bold text-[#ff7a00]">Voir tout <ChevronRight size={14}/></button></div>
              {events.length === 0 ? <div className="px-5 py-16 text-center"><div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-[#ff7a00]/10 text-[#ff7a00]"><CalendarPlus/></div><h3 className="font-bold">Aucun événement</h3><p className="mt-2 text-sm text-white/45">Créez votre premier événement pour commencer.</p><button onClick={() => setShowForm(true)} className="mt-5 rounded-lg bg-[#ff7a00] px-5 py-3 text-sm font-black text-black">Créer un événement</button></div> : <div className="divide-y divide-white/10">{events.slice(0, 4).map((item) => <article key={item.id} className="flex gap-4 p-4"><div className="h-20 w-28 shrink-0 rounded-lg bg-cover bg-center" style={{backgroundImage:`url(${item.image})`}}/><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate font-bold">{item.title}</h3><span className="rounded-full bg-amber-500/10 px-2 py-1 text-[10px] font-black text-amber-400">EN ATTENTE</span></div><p className="mt-2 text-sm text-white/45">{item.date} · {item.time} · {item.place}</p></div><button className="hidden h-9 items-center gap-2 self-center rounded-lg border border-white/10 px-3 text-xs font-bold sm:flex"><Eye size={14}/> Détails</button></article>)}</div>}
            </section>
          </>
        )}

        {activeTab === "Mes événements" && (
          <section className="rounded-xl border border-white/10 bg-[#191919]"><div className="flex items-center justify-between border-b border-white/10 p-5"><h2 className="font-black">Tous mes événements</h2><button onClick={() => setShowForm(true)} className="flex h-10 items-center gap-2 rounded-lg bg-[#ff7a00] px-3 text-xs font-black text-black"><CalendarPlus size={16}/> Nouveau</button></div>{events.length === 0 ? <div className="py-16 text-center"><p className="text-sm text-white/45">Vous n&apos;avez pas encore créé d&apos;événement.</p></div> : <div className="divide-y divide-white/10">{events.map((item) => <article key={item.id} className="grid gap-4 p-4 sm:grid-cols-[112px_1fr_auto] sm:items-center"><div className="h-24 rounded-lg bg-cover bg-center" style={{backgroundImage:`url(${item.image})`}}/><div><span className="text-[10px] font-black uppercase text-[#ff7a00]">{item.category}</span><h3 className="mt-1 font-black">{item.title}</h3><p className="mt-2 text-sm text-white/45">{item.date} · {item.time}</p><p className="mt-1 text-sm text-white/45">{item.place}</p></div><div className="flex flex-col gap-2">{item.liveStatus === "live" ? <><span className="flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-1.5 text-[10px] font-black text-red-400"><span className="h-2 w-2 animate-pulse rounded-full bg-red-500"/> LIVE EN COURS</span><button onClick={() => stopLive(item)} className="flex h-9 items-center justify-center gap-2 rounded-lg border border-red-500/30 px-3 text-xs font-bold text-red-300"><Square size={13} fill="currentColor"/> Terminer</button></> : <><span className="w-fit rounded-full bg-amber-500/10 px-3 py-1.5 text-[10px] font-black text-amber-400">{item.liveStatus === "ended" ? "LIVE TERMINÉ" : "EN ATTENTE"}</span>{item.status === "published" && <button onClick={() => startLive(item)} className="flex h-9 items-center justify-center gap-2 rounded-lg bg-[#ff7a00] px-3 text-xs font-black text-black"><Radio size={14}/> Lancer le live</button>}</>}</div></article>)}</div>}</section>
        )}

        {activeTab === "Ventes" && (
          <section className="rounded-xl border border-white/10 bg-[#191919]"><div className="border-b border-white/10 p-5"><h2 className="font-black">Ventes de billets</h2></div><div className="grid gap-4 p-5 sm:grid-cols-3"><div className="rounded-lg bg-black/30 p-4"><p className="text-xs text-white/40">Billets vendus</p><p className="mt-2 text-2xl font-black">{activeProducerSales.reduce((total, sale) => total + (sale.quantity || 1), 0)}</p></div><div className="rounded-lg bg-black/30 p-4"><p className="text-xs text-white/40">Revenu brut</p><p className="mt-2 text-2xl font-black">{grossRevenue.toFixed(2)} $</p></div><div className="rounded-lg bg-black/30 p-4"><p className="text-xs text-white/40">Commission Kinlive</p><p className="mt-2 text-2xl font-black">{commission.toFixed(2)} $</p></div></div>{producerSales.length === 0 ? <div className="px-5 pb-10 pt-5 text-center"><Ticket className="mx-auto text-white/20"/><p className="mt-3 text-sm text-white/45">Aucune vente enregistrée pour le moment.</p></div> : <div className="divide-y divide-white/10 px-5">{producerSales.map((sale) => <div key={sale.id} className="grid gap-3 py-4 sm:grid-cols-[1fr_150px_120px]"><div><p className="font-bold">{sale.customerName}</p><p className="mt-1 text-xs text-white/40">{sale.phone} · {sale.ticketType} × {sale.quantity || 1}</p></div><div><p className="text-xs text-[#ff7a00]">{sale.code}</p><p className="mt-1 text-xs text-white/40">{sale.paymentMethod}</p></div><div className="sm:text-right"><p className="font-black">{sale.amount.toFixed(2)} $</p>{sale.status === "cancelled" ? <span className="text-[10px] font-black uppercase text-red-400">Annulé</span> : <><span className="text-[10px] font-black uppercase text-emerald-400">Payé</span><button onClick={() => cancelSale(sale.id)} className="mt-2 block text-xs text-red-300 hover:text-red-200 sm:ml-auto">Annuler</button></>}</div></div>)}</div>}</section>
        )}

        {activeTab === "Catégories" && (
          <section className="rounded-xl border border-white/10 bg-[#191919]"><div className="flex items-center justify-between border-b border-white/10 p-5"><h2 className="font-black">Mes catégories</h2><div className="flex items-center gap-2"><input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="h-10 w-full max-w-[220px] rounded-lg border border-white/10 bg-black/40 px-3 outline-none focus:border-[#ff7a00]" placeholder="Nouvelle catégorie..."/><button onClick={addCategory} className="flex h-10 items-center justify-center rounded-lg bg-[#ff7a00] px-3 text-sm font-black text-black">Ajouter</button></div></div>{categories.length === 0 ? <div className="px-5 py-16 text-center"><div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-[#ff7a00]/10 text-[#ff7a00]"><Ticket/></div><h3 className="font-bold">Aucune catégorie</h3><p className="mt-2 text-sm text-white/45">Ajoutez vos premières catégories pour commencer.</p></div> : <div className="divide-y divide-white/10">{categories.map((item) => <div key={item} className="flex items-center justify-between gap-4 py-3 px-5"><div className="flex items-center gap-3"><span className="block h-2.5 w-2.5 rounded-full" style={{backgroundColor:item}}/><p className="font-bold">{item}</p></div><button onClick={() => removeCategory(item)} className="text-sm font-bold text-red-400">Supprimer</button></div>)}</div>}</section>
        )}

        {activeTab === "Retraits" && (
          <section className="rounded-xl border border-white/10 bg-[#191919]"><div className="border-b border-white/10 p-5"><h2 className="font-black">Retrait des revenus</h2></div><div className="grid gap-6 p-5 lg:grid-cols-2"><div className="rounded-xl bg-black/30 p-5"><p className="text-sm text-white/45">Solde disponible</p><p className="mt-2 text-3xl font-black">0 $</p><button className="mt-5 h-11 w-full rounded-lg bg-[#ff7a00] text-sm font-black text-black">Demander un retrait</button></div><div className="space-y-3"><p className="text-sm font-bold">Moyens de paiement</p><div className="flex items-center gap-3 rounded-lg border border-white/10 p-4"><CreditCard className="text-[#ff7a00]"/><div><p className="text-sm font-bold">Mobile Money</p><p className="text-xs text-white/40">Orange · Airtel · M-Pesa</p></div></div><div className="flex items-center gap-3 rounded-lg border border-white/10 p-4"><Landmark className="text-[#ff7a00]"/><div><p className="text-sm font-bold">Compte bancaire</p><p className="text-xs text-white/40">Ajoutez vos informations</p></div></div></div></div></section>
        )}

        {activeLive && (
          <section className="mb-6 rounded-xl border border-red-500/20 bg-red-500/5 p-5">
            <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="flex items-center gap-2 text-xs font-black uppercase text-red-400"><span className="h-2 w-2 animate-pulse rounded-full bg-red-500"/> Diffusion active</p><h2 className="mt-1 text-lg font-black">{activeLive.title}</h2></div><a href={`/live/gala-des-stars-kinshasa`} target="_blank" className="flex h-10 items-center gap-2 rounded-lg border border-white/15 px-4 text-sm font-bold"><ExternalLink size={16}/> Voir le live</a></div>
            <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_1fr_auto]"><div className="rounded-lg border border-white/10 bg-black/20 p-3"><p className="text-xs text-white/40">Serveur RTMP</p><p className="mt-1 truncate text-sm font-bold">rtmp://live.kinlive.cd/stream</p></div><div className="rounded-lg border border-white/10 bg-black/20 p-3"><p className="text-xs text-white/40">Clé privée OBS</p><p className="mt-1 truncate text-sm font-bold">kinlive_{activeLive.id.slice(0, 8)}</p></div><button onClick={() => navigator.clipboard.writeText(`kinlive_${activeLive.id.slice(0, 8)}`)} className="flex h-[58px] items-center justify-center gap-2 rounded-lg bg-[#ff7a00] px-4 text-sm font-black text-black"><Copy size={16}/> Copier la clé</button></div>
          </section>
        )}
      </div>

      {showForm && <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-5"><form onSubmit={createEvent} className="max-h-[92vh] w-full max-w-[620px] overflow-y-auto rounded-t-2xl border border-white/10 bg-[#191919] p-6 sm:rounded-2xl"><div className="mb-6 flex items-center justify-between"><h2 className="text-xl font-black">Créer un événement</h2><button type="button" onClick={() => setShowForm(false)} className="text-sm text-white/50">Fermer</button></div><div className="grid gap-4 sm:grid-cols-2"><label className="sm:col-span-2 text-sm font-bold">Titre<input name="title" required className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black/40 px-3 outline-none focus:border-[#ff7a00]"/></label><label className="text-sm font-bold">Catégorie<select name="category" className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-[#111111] px-3">{categories.map((item) => <option key={item}>{item}</option>)}</select></label><label className="text-sm font-bold">Lieu<input name="place" required className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black/40 px-3 outline-none focus:border-[#ff7a00]"/></label><label className="text-sm font-bold">Date<input name="date" type="date" required className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black/40 px-3 outline-none focus:border-[#ff7a00]"/></label><label className="text-sm font-bold">Heure<input name="time" type="time" required className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black/40 px-3 outline-none focus:border-[#ff7a00]"/></label><label className="text-sm font-bold">Prix ($)<input name="price" type="number" min="0" step="0.01" required className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black/40 px-3 outline-none focus:border-[#ff7a00]"/></label><label className="text-sm font-bold">Ajout d’une photo<input name="image" type="file" onChange={selectEventImage} className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black/40 px-3 outline-none focus:border-[#ff7a00]"/></label><label className="sm:col-span-2 text-sm font-bold">Description<textarea name="description" required rows={3} className="mt-2 w-full rounded-lg border border-white/10 bg-black/40 p-3 outline-none focus:border-[#ff7a00]"/></label></div><div className="mt-4 mb-2 h-40 rounded-lg bg-cover bg-center" style={{backgroundImage:`url(${imagePreview})`}}/><div className="mt-4 sm:col-span-2">{imagePreview ? <div className="relative h-48 overflow-hidden rounded-xl border border-white/10"><Image src={imagePreview} alt="Aperçu de l’affiche" fill unoptimized className="object-cover"/></div> : null}</div><div className="sm:col-span-2"><div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-black">Catégories et nombre de billets</h3><span className="text-xs text-white/40">Capacité totale : {ticketCategories.reduce((total, item) => total + item.quantity, 0)}</span></div><div className="space-y-3">{ticketCategories.map((ticket, index) => <div key={ticket.name} className="grid grid-cols-[1fr_110px_110px] gap-2 rounded-lg border border-white/10 bg-black/20 p-3"><div className="flex items-center text-sm font-bold">{ticket.name}</div><label className="text-xs text-white/45">Prix ($)<input type="number" min="0" step="0.01" value={ticket.price} onChange={(event) => setTicketCategories((current) => current.map((item, itemIndex) => itemIndex === index ? {...item, price: Number(event.target.value)} : item))} className="mt-1 h-10 w-full rounded-md border border-white/10 bg-black/40 px-2 text-sm text-white outline-none"/></label><label className="text-xs text-white/45">Nombre<input type="number" min="1" value={ticket.quantity} onChange={(event) => setTicketCategories((current) => current.map((item, itemIndex) => itemIndex === index ? {...item, quantity: Math.max(0, Number(event.target.value))} : item))} className="mt-1 h-10 w-full rounded-md border border-white/10 bg-black/40 px-2 text-sm text-white outline-none"/></label></div>)}</div></div><button className="mt-6 h-12 w-full rounded-lg bg-[#ff7a00] text-sm font-black text-black">Envoyer pour validation</button></form></div>}
    </main>
  );
}
