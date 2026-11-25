"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Crown, Search, Ticket, TrendingUp } from "lucide-react";
import { getTicketSales, type KinliveEvent } from "../lib/kinlive";
import { useLocale } from "../components/LocaleProvider";

const publicEvents: KinliveEvent[] = [
	{
		id: "gala-des-stars-kinshasa",
		title: "Gala des stars — Kinshasa",
		place: "Palais du Peuple",
		date: "24 NOV",
		time: "20:30",
		price: "à partir de 20 $",
		category: "Concert",
		image:
			"https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1400&q=85",
		producerId: "",
		status: "published",
		description: "",
	},
	{
		id: "afourban-festival",
		title: "AfroUrban Festival",
		place: "Académie des Beaux-Arts",
		date: "20 NOV",
		time: "19:00",
		price: "25 $",
		category: "Festival",
		image:
			"https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=85",
		producerId: "",
		status: "published",
		description: "",
	},
	{
		id: "fally-ipupa-live",
		title: "Fally Ipupa — Live",
		place: "Stade des Martyrs",
		date: "24 NOV",
		time: "20:30",
		price: "à partir de 20 $",
		category: "Concert",
		image:
			"https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1400&q=85",
		producerId: "",
		status: "published",
		description: "",
	},
	{
		id: "kinshasa-comedy-night",
		title: "Kinshasa Comedy Night",
		place: "Pullman Grand Hôtel",
		date: "28 NOV",
		time: "18:30",
		price: "15 $",
		category: "Comédie",
		image:
			"https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=1400&q=85",
		producerId: "",
		status: "published",
		description: "",
	},
	{
		id: "sommet-des-entrepreneurs",
		title: "Sommet des Entrepreneurs",
		place: "FIKIN - Hall Central",
		date: "02 DÉC",
		time: "09:00",
		price: "10 $",
		category: "Conférence",
		image:
			"https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1400&q=85",
		producerId: "",
		status: "published",
		description: "",
	},
	{
		id: "dc-united-vs-as-vita",
		title: "DC United vs AS Vita",
		place: "Stade du TP Mazembe",
		date: "06 DÉC",
		time: "15:00",
		price: "à partir de 5 $",
		category: "Match",
		image:
			"https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1400&q=85",
		producerId: "",
		status: "published",
		description: "",
	},
	{
		id: "la-grace-en-concert",
		title: "La Grâce en Concert",
		place: "Cimetière de la Victoire",
		date: "12 DÉC",
		time: "16:00",
		price: "Gratuit",
		category: "Culte",
		image:
			"https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1400&q=85",
		producerId: "",
		status: "published",
		description: "",
	},
];

export default function TendancesPage() {
	const { t } = useLocale();
	const [search, setSearch] = useState("");
	const [category, setCategory] = useState("Tous");
	const [dateFilter, setDateFilter] = useState("Toutes les dates");
	const [events, setEvents] = useState<KinliveEvent[]>(publicEvents);

	useEffect(() => {
		let cancelled = false;
		fetch("/api/events")
			.then((response) => (response.ok ? response.json() : []))
			.then((createdEvents: KinliveEvent[]) => {
				if (!cancelled) setEvents([...createdEvents, ...publicEvents]);
			})
			.catch(() => {});
		return () => {
			cancelled = true;
		};
	}, []);

	const sales = typeof window === "undefined" ? [] : getTicketSales();
	const ranked = events
		.map((event) => ({
			...event,
			sold: sales
				.filter(
					(sale) =>
						sale.status === "paid" &&
						(sale.eventId === event.id || sale.eventTitle === event.title)
				)
				.reduce((total, sale) => total + (sale.quantity || 1), 0),
		}))
		.filter((event) => {
			const matchesSearch = `${event.title} ${event.place} ${event.category}`
				.toLowerCase()
				.includes(search.trim().toLowerCase());
			const matchesDate = dateFilter === "Toutes les dates"
				|| (dateFilter === "Novembre" && event.date.includes("NOV"))
				|| (dateFilter === "Décembre" && event.date.includes("DÉC"));
			return matchesSearch && matchesDate && (category === "Tous" || event.category === category);
		})
		.sort((a, b) => b.sold - a.sold);

	const categories = [
		"Tous",
		...Array.from(new Set(events.map((event) => event.category))),
	];

	return (
		<main className="min-h-screen bg-[#111111] pb-20 text-white">
			<section className="border-b border-white/10 bg-[radial-gradient(circle_at_top_right,_rgba(255,122,0,0.16),_transparent_38%)]">
				<div className="mx-auto max-w-[1280px] px-5 py-12 lg:px-8 lg:py-16">
					<Link
						href="/"
						className="mb-8 flex w-fit items-center gap-2 text-sm text-white/55 hover:text-white"
					>
						<ArrowLeft size={16} /> {t("Retour à l'accueil")}
					</Link>
					<div className="flex flex-wrap items-end justify-between gap-6">
						<div>
							<p className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#ff7a00]">
								<TrendingUp size={15} /> {t("Classement officiel")}
							</p>
							<h1 className="text-4xl font-black sm:text-5xl">
								{t("Événements tendances")}
							</h1>
							<p className="mt-3 max-w-xl text-sm leading-6 text-white/50">
								{t("Les événements les plus populaires classés selon le nombre de billets vendus.")}
							</p>
						</div>
						<div className="rounded-xl border border-[#ff7a00]/20 bg-[#ff7a00]/5 px-5 py-4">
							<p className="text-xs text-white/45">{t("Événements classés")}</p>
							<p className="mt-1 text-3xl font-black text-[#ff7a00]">
								{ranked.length}
							</p>
						</div>
					</div>
				</div>
			</section>

			<section className="mx-auto max-w-[1280px] px-5 py-8 lg:px-8">
				<div className="mb-8 grid gap-3 rounded-xl border border-white/10 bg-[#191919] p-3 sm:grid-cols-[1fr_220px_220px]">
					<label className="flex h-12 items-center gap-3 px-3">
						<Search size={18} className="text-white/40" />
						<input
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							className="w-full bg-transparent text-sm outline-none placeholder:text-white/35"
							placeholder={t("Rechercher un événement ou lieu")}
						/>
					</label>
					<select
						value={category}
						onChange={(event) => setCategory(event.target.value)}
						className="h-12 rounded-lg bg-[#111111] px-4 text-sm outline-none"
					>
						<option value="Tous">{t("Tous")}</option>
						{categories
							.filter((item) => item !== "Tous")
							.map((item) => (
								<option key={item} value={item}>{t(item)}</option>
							))}
					</select>
					<select
						value={dateFilter}
						onChange={(event) => setDateFilter(event.target.value)}
						className="h-12 rounded-lg bg-[#111111] px-4 text-sm outline-none"
					>
						<option value="Toutes les dates">{t("Toutes les dates")}</option>
						<option value="Novembre">{t("Novembre")}</option>
						<option value="Décembre">{t("Décembre")}</option>
					</select>
				</div>

				{ranked.length === 0 ? (
					<div className="rounded-xl border border-white/10 py-20 text-center">
						<Ticket className="mx-auto text-white/20" />
						<p className="mt-3 text-sm text-white/45">
							{t("Aucun événement ne correspond à votre recherche.")}
						</p>
					</div>
				) : (
					<div className="space-y-3">
						{ranked.map((event, index) => {
							const maximum = ranked[0]?.sold || 1;
							const width =
								event.sold > 0
									? Math.max(5, Math.round((event.sold / maximum) * 100))
									: 3;
							return (
								<Link
									key={event.id}
									href={`/evenements/${event.id}`}
									className="group grid items-center gap-4 rounded-xl border border-white/10 bg-[#191919] p-3 transition hover:border-black hover:bg-[#1d1d1d] sm:grid-cols-[60px_180px_1fr_160px] sm:p-4"
								>
									<div
										className={`mx-auto grid h-12 w-12 place-items-center rounded-full border text-lg font-black ${
											index === 0
												? "border-[#ff7a00] bg-[#ff7a00] text-black"
												: index < 3
												? "border-white/20 bg-white/10 text-white"
												: "border-white/10 text-white/50"
										}`}
									>
										{index === 0 ? (
											<Crown size={20} />
										) : (
											index + 1
										)}
									</div>
									<div
										className="aspect-[16/9] overflow-hidden rounded-lg bg-cover bg-center"
										style={{
											backgroundImage: `url(${event.image})`,
										}}
									/>
									<div className="min-w-0">
										<div className="flex flex-wrap items-center gap-2">
											<h2 className="truncate font-black sm:text-lg">
												{event.title}
											</h2>
											{index < 3 && (
												<span className="rounded-full bg-[#ff7a00]/10 px-2 py-1 text-[9px] font-black uppercase text-[#ff7a00]">
													{t("Top")} {index + 1}
												</span>
											)}
										</div>
										<p className="mt-2 text-sm text-white/45">
											{event.place} · {event.date} {t("à")} {event.time}
										</p>
										<div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
											<div
												className="h-full rounded-full bg-[#ff7a00] transition-all duration-700"
												style={{ width: `${width}%` }}
											/>
										</div>
									</div>
									<div className="flex items-end justify-between sm:block sm:text-right">
										<div>
											<p className="text-2xl font-black text-[#ff7a00]">
												{event.sold}
											</p>
											<p className="text-[10px] font-black uppercase text-white/40">
												{t("billets vendus")}
											</p>
										</div>
										<span className="mt-2 hidden items-center gap-1 text-xs font-bold text-white/50 sm:inline-flex">
											{t("Voir")} <ArrowRight size={13} />
										</span>
									</div>
								</Link>
							);
						})}
					</div>
				)}
			</section>
		</main>
	);
}
