"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Clock3, Search, Ticket } from "lucide-react";
import { getCategories, getEvents, getTicketSales, type KinliveEvent } from "../lib/kinlive";
import { useLocale } from "../components/LocaleProvider";

const publicEvents: KinliveEvent[] = [
	{
		id: "afourban-festival",
		title: "AfroUrban Festival",
		place: "Académie des Beaux-Arts",
		date: "20 NOV",
		time: "19:00",
		price: "25 $",
		category: "Festival",
		image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=85",
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
		image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=900&q=85",
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
		image: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=900&q=85",
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
		image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=900&q=85",
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
		image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=900&q=85",
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
		image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=900&q=85",
		producerId: "",
		status: "published",
		description: "",
	},
];

export default function EventsPage() {
	const { t } = useLocale();
	const [search, setSearch] = useState("");
	const [category, setCategory] = useState("Tous");
	const [createdEvents] = useState<KinliveEvent[]>(() => (typeof window === "undefined" ? [] : getEvents()));
	const [categories] = useState(() => getCategories());
	const ticketSales = typeof window === "undefined" ? [] : getTicketSales();

	const allEvents = [...createdEvents, ...publicEvents].map((event) => ({
		...event,
		sold: ticketSales
			.filter((sale) => sale.status === "paid" && (sale.eventId === event.id || sale.eventTitle === event.title))
			.reduce((total, sale) => total + (sale.quantity || 1), 0),
	}));

	const visibleEvents = allEvents.filter((event) => {
		const matchesSearch = `${event.title} ${event.place} ${event.category}`.toLowerCase().includes(search.trim().toLowerCase());
		return matchesSearch && (category === "Tous" || event.category === category);
	});

	return (
		<main className="min-h-screen bg-[#111111] text-white">
			<section className="mx-auto max-w-[1280px] px-5 py-10 lg:px-8">
				<p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-[#ff7a00]">Kinlive.cd</p>
				<h1 className="text-3xl font-black sm:text-5xl">{t("Tous les événements")}</h1>

				<div className="mt-8 grid gap-3 rounded-xl border border-white/10 bg-[#1a1a1a] p-2 sm:grid-cols-[1fr_auto]">
					<label className="flex h-12 items-center gap-3 px-3">
						<Search size={19} className="text-white/50" />
						<input
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							className="w-full bg-transparent text-sm outline-none placeholder:text-white/40"
							placeholder={t("Rechercher un événement")}
						/>
					</label>
					<select
						value={category}
						onChange={(event) => setCategory(event.target.value)}
						className="h-12 rounded-lg bg-[#111111] px-4 text-sm text-white/75 outline-none"
					>
						{["Tous", ...categories].map((item) => (
							<option key={item} value={item}>{t(item)}</option>
						))}
					</select>
				</div>

				{visibleEvents.length === 0 ? (
					<p className="mt-10 rounded-xl border border-white/10 p-8 text-center text-white/50">
						{t("Aucun événement ne correspond à votre recherche.")}
					</p>
				) : (
					<div className="mt-8 grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
						{visibleEvents.map((event) => (
							<article key={event.id} className="group">
								<div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-[#1a1a1a]">
									<div
										className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105"
										style={{ backgroundImage: `url(${event.image})` }}
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
									<span className="absolute left-3 top-3 rounded-md bg-[#111111]/85 px-2.5 py-1 text-[10px] font-black uppercase backdrop-blur">
											{t(event.category)}
									</span>
									<span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-md bg-[#ff7a00] px-2.5 py-1.5 text-[10px] font-black text-black">
										<Ticket size={12} /> {event.sold} {t(event.sold === 1 ? "vendu" : "vendus")}
									</span>
								</div>
								<div className="pt-4">
									<h2 className="text-lg font-black">{event.title}</h2>
									<p className="mt-2 flex items-center gap-2 text-sm text-white/55">
										<Clock3 size={14} /> {event.date} · {event.time}
									</p>
									<p className="mt-1 text-sm text-white/55">{event.place}</p>
									<div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
										<p className="text-sm text-white/50">
											{t("À partir de")}{" "}
											<span className="ml-1 font-black text-[#ff7a00]">{event.price}</span>
										</p>
										<Link
											href={`/evenements/${event.id}`}
											className="flex h-9 items-center gap-2 rounded-md bg-[#ff7a00] px-3 text-xs font-black text-black"
										>
											{t("Acheter")} <ArrowRight size={14} />
										</Link>
									</div>
								</div>
							</article>
						))}
					</div>
				)}
			</section>
		</main>
	);
}
