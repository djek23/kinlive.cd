"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft, ChevronRight, CirclePlay, Clock3, Heart,
  Search, Ticket, Users,
  SlidersHorizontal, ArrowRight
} from "lucide-react";
import { getCategories, getEvents, getTicketSales, type KinliveEvent } from "./lib/kinlive";
import { useLocale } from "./components/LocaleProvider";

const liveEvents = [
  { title: "Gala des stars — Kinshasa", category: "CONCERT", viewers: "12,840", image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1400&q=85" },
  { title: "Finale Ligue Nationale", category: "MATCH", viewers: "8,204", image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1400&q=85" },
];

const events = [
  { id: "afourban-festival", title: "AfroUrban Festival", place: "Académie des Beaux-Arts", date: "20 NOV", time: "19:00", price: "25 $", category: "Festival", image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=85" },
  { id: "fally-ipupa-live", title: "Fally Ipupa — Live", place: "Stade des Martyrs", date: "24 NOV", time: "20:30", price: "à partir de 20 $", category: "Concert", image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=900&q=85" },
  { id: "kinshasa-comedy-night", title: "Kinshasa Comedy Night", place: "Pullman Grand Hôtel", date: "28 NOV", time: "18:30", price: "15 $", category: "Comédie", image: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=900&q=85" },
  { id: "sommet-des-entrepreneurs", title: "Sommet des Entrepreneurs", place: "FIKIN - Hall Central", date: "02 DÉC", time: "09:00", price: "10 $", category: "Conférence", image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=900&q=85" },
  { id: "dc-united-vs-as-vita", title: "DC United vs AS Vita", place: "Stade du TP Mazembe", date: "06 DÉC", time: "15:00", price: "à partir de 5 $", category: "Match", image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=900&q=85" },
  { id: "la-grace-en-concert", title: "La Grâce en Concert", place: "Cimetière de la Victoire", date: "12 DÉC", time: "16:00", price: "Gratuit", category: "Culte", image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=900&q=85" },
];

function Logo() {
  return (
    <a href="#" className="flex h-10 items-center" aria-label="Kinlive accueil">
      <Image src="/kinlive-logo.svg" alt="Kinlive.cd" width={160} height={40} className="h-10 w-auto" priority />
    </a>
  );
}

export default function Home() {
  const { t } = useLocale();
  const [category, setCategory] = useState("Tous");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("Toutes les dates");
  const [priceFilter, setPriceFilter] = useState("Tous les prix");
  const [createdEvents] = useState<KinliveEvent[]>(() =>
    typeof window === "undefined" ? [] : getEvents()
  );
  const [activeSlide, setActiveSlide] = useState(0);
  const [ticketSales] = useState(() => typeof window === "undefined" ? [] : getTicketSales());
  const [categories] = useState(() => getCategories());

  const allEvents = [...createdEvents, ...events];
  const eventsWithSales = allEvents.map((event) => {
    const sold = ticketSales
      .filter((sale) => sale.status === "paid" && (sale.eventId === (event as KinliveEvent).id || sale.eventTitle === event.title))
      .reduce((total, sale) => total + (sale.quantity || 1), 0);
    return { ...event, sold };
  });
  const rankedEvents = [...eventsWithSales].sort((a, b) => b.sold - a.sold);
  const heroSlides = rankedEvents.slice(0, 4);

  useEffect(() => {
    if (heroSlides.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [heroSlides.length]);

  const visibleEvents = rankedEvents.filter((event) => {
    const matchesCategory = category === "Tous" || event.category === category;
    const searchText = `${event.title} ${event.place} ${event.category}`.toLowerCase();
    const matchesSearch = searchText.includes(search.toLowerCase().trim());
    const matchesDate = dateFilter === "Toutes les dates"
      || (dateFilter === "Novembre" && event.date.includes("NOV"))
      || (dateFilter === "Décembre" && event.date.includes("DÉC"));
    const isFree = event.price.toLowerCase().includes("gratuit") || event.price === "0 $";
    const matchesPrice = priceFilter === "Tous les prix"
      || (priceFilter === "Gratuit" && isFree)
      || (priceFilter === "Payant" && !isFree);
    return matchesCategory && matchesSearch && matchesDate && matchesPrice;
  });

  return (
    <main className="min-h-screen overflow-hidden bg-[#111111] text-white">
      <section className="relative mt-[72px] min-h-[590px] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div key={`${slide.title}-${index}`} className={`absolute inset-0 transition-opacity duration-700 ${index === activeSlide ? "opacity-100" : "pointer-events-none opacity-0"}`}>
            <div className="absolute inset-0 bg-cover bg-[center_35%] transition-transform duration-[7000ms]" style={{ backgroundImage: `url(${slide.image})`, transform: index === activeSlide ? "scale(1.04)" : "scale(1)" }} />
            <div className="absolute inset-0 bg-gradient-to-r from-[#111111] via-[#111111]/75 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-[#111111]/20" />
            <div className="relative mx-auto flex min-h-[590px] max-w-[1280px] items-end px-5 pb-16 lg:px-8 lg:pb-20">
              <div className="max-w-[650px]">
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-[#ff3131] px-3 py-1.5 text-[12px] font-black uppercase">{t("Événement populaire")}</span>
                  <span className="flex items-center gap-1.5 text-sm font-bold text-white/90"><Ticket size={16} /> {slide.sold} {t(slide.sold === 1 ? "billet" : "billets")} {t(slide.sold === 1 ? "vendu" : "vendus")}</span>
                </div>
                <p className="mb-2 text-sm font-bold uppercase tracking-[0.22em] text-[#ff7a00]">{t(slide.category)}</p>
                <h1 className="text-4xl font-black leading-[1.02] tracking-tight sm:text-6xl lg:text-[72px]">{slide.title}</h1>
                <p className="mt-5 max-w-xl text-base leading-7 text-white/75">{slide.place} · {slide.date} à {slide.time}</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <a href={`/evenements/${"id" in slide && slide.id ? slide.id : slide.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`} className="flex h-13 items-center gap-2 rounded-lg border border-white/25 bg-black/20 px-5 text-sm font-bold backdrop-blur-md hover:bg-white/10">
                    <CirclePlay size={18} /> {t("Voir les détails")}
                  </a>
                  <a href="#categories" className="flex h-13 items-center gap-2 rounded-lg bg-[#ff7a00] px-6 text-sm font-black text-black"><Ticket size={18} /> {t("Acheter un billet")}</a>
                </div>
              </div>
            </div>
          </div>
        ))}

        {heroSlides.length > 1 && (
          <>
            <button onClick={() => setActiveSlide((activeSlide - 1 + heroSlides.length) % heroSlides.length)} className="absolute left-4 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/40 backdrop-blur" aria-label={t("Slide précédent")}><ChevronLeft size={21}/></button>
            <button onClick={() => setActiveSlide((activeSlide + 1) % heroSlides.length)} className="absolute right-4 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/40 backdrop-blur" aria-label={t("Slide suivant")}><ChevronRight size={21}/></button>
            <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
              {heroSlides.map((slide, index) => <button key={slide.title} onClick={() => setActiveSlide(index)} aria-label={`${t("Afficher")} ${slide.title}`} className={`h-1.5 rounded-full transition-all ${index === activeSlide ? "w-8 bg-[#ff7a00]" : "w-4 bg-white/40"}`}/>)}
            </div>
          </>
        )}
      </section>

      <section id="evenements" className="relative z-10 mx-auto -mt-2 max-w-[1280px] px-5 pb-8 lg:px-8">
        <div className="grid gap-2 rounded-xl border border-white/10 bg-[#1a1a1a] p-2 shadow-2xl sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
          <label className="flex h-12 items-center gap-3 px-3">
            <Search size={19} className="text-white/50" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full bg-transparent text-sm outline-none placeholder:text-white/40" placeholder={t("Rechercher un événement")} />
          </label>
          <select value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="h-12 rounded-lg bg-[#1a1a1a] px-3 text-sm text-white/75 outline-none">
            <option value="Toutes les dates">{t("Toutes les dates")}</option><option value="Novembre">{t("Novembre")}</option><option value="Décembre">{t("Décembre")}</option>
          </select>
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-12 rounded-lg bg-[#1a1a1a] px-3 text-sm text-white/75 outline-none">
            {["Tous", ...categories].map((item) => <option key={item} value={item}>{t(item)}</option>)}
          </select>
          <select value={priceFilter} onChange={(event) => setPriceFilter(event.target.value)} className="h-12 rounded-lg bg-[#1a1a1a] px-3 text-sm text-white/75 outline-none">
            <option value="Tous les prix">{t("Tous les prix")}</option><option value="Gratuit">{t("Gratuit")}</option><option value="Payant">{t("Payant")}</option>
          </select>
          <button className="grid h-12 w-12 place-items-center rounded-lg bg-[#ff7a00] text-black" aria-label={t("Filtres")}>
            <SlidersHorizontal size={19} />
          </button>
        </div>
      </section>

      <section id="live" className="mx-auto max-w-[1280px] px-5 py-10 lg:px-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="mb-1 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#ff7a00]"><span className="h-2 w-2 rounded-full bg-[#ff3131]" /> {t("Diffusion en cours")}</p>
            <h2 className="text-2xl font-black sm:text-3xl">{t("En direct maintenant")}</h2>
          </div>
          <button className="hidden items-center gap-2 text-sm font-bold text-white/60 hover:text-[#ff7a00] sm:flex">{t("Tout voir")} <ArrowRight size={16} /></button>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {liveEvents.map((event, index) => (
            <a key={event.title} href={index === 0 ? "/live/gala-des-stars-kinshasa" : "/live/finale-ligue-nationale"} className="group relative aspect-[16/8.5] overflow-hidden rounded-xl bg-[#1a1a1a]">
              <div className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${event.image})` }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/5 to-transparent" />
              <div className="absolute left-4 top-4 flex gap-2">
                <span className="rounded-md bg-[#ff3131] px-2.5 py-1 text-[10px] font-black uppercase">Live</span>
                <span className="rounded-md bg-black/70 px-2.5 py-1 text-[10px] font-black uppercase backdrop-blur">{t(event.category === "CONCERT" ? "Concert" : "Match")}</span>
              </div>
              <button className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-black/30 backdrop-blur" aria-label="Ajouter aux favoris"><Heart size={16} /></button>
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="mb-2 flex items-center gap-2 text-xs font-bold text-white/70"><Users size={14} /> {event.viewers} spectateurs</div>
                <h3 className="text-xl font-black sm:text-2xl">{event.title}</h3>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section id="tendances" className="mx-auto max-w-[1280px] px-5 py-12 lg:px-8">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-black uppercase tracking-[0.18em] text-[#ff7a00]">{t("Classement en temps réel")}</p>
            <h2 className="text-2xl font-black sm:text-3xl">{t("Événements tendance")}</h2>
          </div>
          <Link href="/evenements" className="flex items-center gap-2 text-sm font-bold text-[#ff7a00]">
            {t("Voir tous les événements")} <ArrowRight size={16}/>
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
          {rankedEvents.slice(0, 10).map((event, index) => {
            const href = "id" in event && event.id ? `/evenements/${event.id}` : `/evenements/${event.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
            const maximum = rankedEvents[0]?.sold || 1;
            const width = event.sold > 0 ? Math.max(8, Math.round((event.sold / maximum) * 100)) : 4;
            return (
              <Link key={`${event.title}-${index}`} href={href} className={`group grid items-center gap-4 rounded-xl border border-white/10 bg-[#191919] p-4 transition hover:border-black hover:bg-[#1d1d1d] ${index === 0 ? "lg:row-span-3 lg:p-5" : "sm:grid-cols-[52px_70px_1fr_auto]"}`}>
                {index === 0 ? (
                  <>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="rounded-full bg-[#ff7a00] px-3 py-1.5 text-xs font-black text-black">{t("N° 1 — Tendance")}</span>
                    </div>
                    <div className="relative mb-1 aspect-[16/7] overflow-hidden rounded-lg">
                      <div className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105" style={{backgroundImage:`url(${event.image})`}}/>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"/>
                      <span className="absolute bottom-3 left-3 rounded-md bg-[#111111]/85 px-2.5 py-1 text-[10px] font-black uppercase">{event.category}</span>
                    </div>
                  </>
                ) : (
                  <div className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-black/30 text-lg font-black text-white/60">{index + 1}</div>
                )}
                {index > 0 && <div className="hidden aspect-[16/10] overflow-hidden rounded-lg bg-cover bg-center sm:block" style={{backgroundImage:`url(${event.image})`}}/>}
                <div className="min-w-0">
                  <h3 className={`${index === 0 ? "text-xl" : "truncate text-sm"} font-black`}>{event.title}</h3>
                  <p className="mt-1 text-xs text-white/45">{event.place}</p>
                  {index === 0 && <p className="mt-3 text-sm text-white/55">{event.date} · {event.time}</p>}
                  {index > 0 && <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-[#ff7a00]" style={{width:`${width}%`}}/>
                  </div>}
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-[#ff7a00]">{event.sold}</p>
                  <p className="text-[10px] font-bold uppercase text-white/40">{t("billets")}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section id="categories" className="mx-auto max-w-[1280px] px-5 py-8 lg:px-8">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-black sm:text-3xl">{t("À venir")}</h2>
          <Link
            onClick={() => {
              setSearch("");
              setCategory("Tous");
              setDateFilter("Toutes les dates");
              setPriceFilter("Tous les prix");
              document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" });
            }}
            href="/evenements"
            className="text-sm font-bold text-[#ff7a00]"
          >
            {t("Voir tous les événements")}
          </Link>
        </div>
        <div className="mb-7 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {["Tous", "Concert", "Conférence", "Match", "Culte", "Festival", "Comédie"].map((item) => (
            <button key={item} onClick={() => setCategory(item)} className={`shrink-0 rounded-full border px-5 py-2.5 text-sm font-bold transition ${category === item ? "border-[#ff7a00] bg-[#ff7a00] text-black" : "border-white/10 bg-[#1a1a1a] text-white/75 hover:border-white/30"}`}>
              {t(item)}
            </button>
          ))}
        </div>
        <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {visibleEvents.map((event) => (
            <article key={event.title} className="group">
              <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-[#1a1a1a]">
                <div className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105" style={{ backgroundImage: `url(${event.image})` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <span className="absolute left-3 top-3 rounded-md bg-[#111111]/85 px-2.5 py-1 text-[10px] font-black uppercase backdrop-blur">{event.category}</span>
                <span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-md bg-[#ff7a00] px-2.5 py-1.5 text-[10px] font-black text-black"><Ticket size={12}/> {event.sold} {t(event.sold === 1 ? "vendu" : "vendus")}</span>
                <div className="absolute bottom-3 right-3 rounded-lg bg-black/80 px-3 py-2 text-center backdrop-blur">
                  <p className="text-[9px] font-black uppercase text-[#ff7a00]">{event.date.split(" ")[1]}</p>
                  <p className="text-lg font-black leading-none">{event.date.split(" ")[0]}</p>
                </div>
              </div>
              <div className="pt-4">
                <h3 className="text-lg font-black">{event.title}</h3>
                <p className="mt-2 flex items-center gap-2 text-sm text-white/55"><Clock3 size={14} /> {event.date} · {event.time}</p>
                <p className="mt-1 text-sm text-white/55">{event.place}</p>
                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                  <p className="text-sm text-white/50">{t("À partir de")} <span className="ml-1 font-black text-[#ff7a00]">{event.price}</span></p>
                    <a href={"id" in event && event.id ? `/evenements/${event.id}` : "/evenements/gala-des-stars-kinshasa"} className="flex h-9 items-center gap-2 rounded-md bg-[#ff7a00] px-3 text-xs font-black text-black">{t("Acheter")} <ArrowRight size={14} /></a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-5 py-16 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-[#ff7a00] px-6 py-10 text-black sm:px-10 lg:flex lg:items-center lg:justify-between">
          <div className="absolute right-0 top-0 h-full w-1/2 opacity-10 [background:radial-gradient(circle_at_center,black_1px,transparent_1px)] [background-size:18px_18px]" />
          <div className="relative max-w-xl">
            <p className="mb-2 text-xs font-black uppercase tracking-[0.18em]">{t("Espace organisateur")}</p>
            <h2 className="text-3xl font-black leading-tight sm:text-4xl">{t("Votre événement mérite")}<br />{t("une grande scène.")}</h2>
          </div>
          <a href="/connexion" className="relative mt-6 flex h-12 items-center gap-2 rounded-lg bg-[#111111] px-6 text-sm font-black text-white lg:mt-0">{t("Créer un événement")} <ArrowRight size={17} /></a>
        </div>
      </section>
    </main>
  );
}
