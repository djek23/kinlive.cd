"use client";

import { Suspense, use, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock3, MapPin, Minus, Plus, Play, Share2, Ticket, Users } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { generateTicketCode, getEvents, getTicketSales, hashTicketCode, saveTicketSales, type TicketSale } from "../../lib/kinlive";
import { useLocale } from "../../components/LocaleProvider";

const publicEvents = [
	{
		id: "gala-des-stars-kinshasa",
		title: "Gala des stars — Kinshasa",
		place: "Palais du Peuple",
		date: "24 novembre 2026",
		time: "20:30",
		image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1800&q=90",
		category: "Concert",
		description:
			"Une soirée exceptionnelle réunissant les plus grandes voix de la RDC pour célébrer la musique, la culture et la créativité congolaise.",
	},
	{
		id: "afourban-festival",
		title: "AfroUrban Festival",
		place: "Académie des Beaux-Arts",
		date: "20 NOV",
		time: "19:00",
		image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=85",
		category: "Festival",
		description: "Trois jours de musique urbaine, de danse et de créations africaines.",
	},
	{
		id: "fally-ipupa-live",
		title: "Fally Ipupa — Live",
		place: "Stade des Martyrs",
		date: "24 NOV",
		time: "20:30",
		image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=900&q=85",
		category: "Concert",
		description: "Une soirée live exceptionnelle avec Fally Ipupa à Kinshasa.",
	},
	{
		id: "kinshasa-comedy-night",
		title: "Kinshasa Comedy Night",
		place: "Pullman Grand Hôtel",
		date: "28 NOV",
		time: "18:30",
		image: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=900&q=85",
		category: "Comédie",
		description: "Les meilleurs humoristes congolo-francophones réunis sur une même scène.",
	},
	{
		id: "sommet-des-entrepreneurs",
		title: "Sommet des Entrepreneurs",
		place: "FIKIN - Hall Central",
		date: "02 DÉC",
		time: "09:00",
		image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=900&q=85",
		category: "Conférence",
		description: "Rencontres, conférences et opportunités pour les entrepreneurs de la RDC.",
	},
	{
		id: "dc-united-vs-as-vita",
		title: "DC United vs AS Vita",
		place: "Stade des Martyrs",
		date: "06 DÉC",
		time: "15:00",
		image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=900&q=85",
		category: "Match",
		description: "Affrontement majeur au cœur du championnat national.",
	},
	{
		id: "la-grace-en-concert",
		title: "La Grâce en Concert",
		place: "Cimetière de la Victoire",
		date: "12 DÉC",
		time: "16:00",
		image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=900&q=85",
		category: "Culte",
		description: "Une célébration musicale inspirante réunissant plusieurs artistes gospel.",
	},
];

export default function EventDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
	return <Suspense fallback={<main className="min-h-screen bg-[#111111]" />}><EventDetailsContent params={params}/></Suspense>;
}

function EventDetailsContent({ params }: { params: Promise<{ slug: string }> }) {
	const router = useRouter();
	const { t } = useLocale();
	const { slug } = use(params);
	const [selectedTicket, setSelectedTicket] = useState("Standard");
	const [quantity, setQuantity] = useState(1);
	const [checkoutOpen, setCheckoutOpen] = useState(false);
	const [issuedTicket, setIssuedTicket] = useState<TicketSale | null>(null);

	const createdEvent = getEvents().find((item) => item.id === slug);
	const publicEvent = publicEvents.find((item) => item.id === slug);
	const event =
		publicEvent ||
		(createdEvent
			? {
					id: createdEvent.id,
					title: createdEvent.title,
					place: createdEvent.place,
					date: createdEvent.date,
					time: createdEvent.time,
					image: createdEvent.image,
					category: createdEvent.category,
					description: createdEvent.description,
			  }
			: publicEvents[0]);

	const tickets = [
		{ name: "Standard", price: "20 $", detail: "Accès général" },
		{ name: "VIP", price: "45 $", detail: "Zone réservée + boissons" },
		{ name: "Streaming", price: "10 $", detail: "Diffusion Full HD" },
	];

	async function purchaseTicket(submitEvent: React.FormEvent<HTMLFormElement>) {
		submitEvent.preventDefault();
		const form = new FormData(submitEvent.currentTarget);
		const selected = tickets.find((ticket) => ticket.name === selectedTicket) || tickets[0];
		const code = generateTicketCode();
		const codeHash = await hashTicketCode(code);
		const sale: TicketSale = {
			id: crypto.randomUUID(),
			code,
			codeHash,
			eventId: "id" in event ? event.id : "gala-des-stars-kinshasa",
			eventTitle: event.title,
			ticketType: selected.name,
			customerName: String(form.get("name")),
			phone: String(form.get("phone")),
			email: String(form.get("email")),
			amount: Number(selected.price.replace(/[^0-9.]/g, "")) * quantity,
			currency: "USD",
			paymentMethod: String(form.get("payment")) as TicketSale["paymentMethod"],
			status: "paid",
			quantity,
			quantityRemaining: quantity,
			createdAt: new Date().toISOString(),
			producerId: "gala-organizer",
		};
		const sales = getTicketSales();
		saveTicketSales([sale, ...sales]);
		setIssuedTicket(sale);
	}

	return (
		<main className="min-h-screen bg-[#111111] text-white">
			<header className="absolute left-0 right-0 top-0 z-30">
				<div className="mx-auto flex h-[72px] max-w-[1280px] items-center px-5 lg:px-8">
					<button
						onClick={() => router.push("/")}
						className="flex h-10 items-center gap-2 rounded-full border border-white/20 bg-black/40 px-4 text-sm font-bold backdrop-blur"
					>
										<ArrowLeft size={17} /> {t("Retour")}
					</button>
					<button
						className="ml-auto grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/40 backdrop-blur"
						aria-label={t("Partager")}
					>
						<Share2 size={17} />
					</button>
				</div>
			</header>

			<section className="relative min-h-[430px] overflow-hidden lg:min-h-[510px]">
				<div
					className="absolute inset-0 bg-cover bg-center"
					style={{ backgroundImage: `url(${event.image})` }}
				/>
				<div className="absolute inset-0 bg-gradient-to-r from-[#111111] via-[#111111]/75 to-transparent" />
				<div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-black/20" />
				<div className="relative mx-auto flex min-h-[430px] max-w-[1280px] items-end px-5 pb-10 lg:min-h-[510px] lg:px-8">
					<div className="max-w-[650px]">
						<span className="rounded-md bg-[#ff7a00] px-3 py-1.5 text-xs font-black uppercase text-black">
							{t(event.category)}
						</span>
						<h1 className="mt-5 text-4xl font-black leading-tight sm:text-6xl">
							{event.title}
						</h1>
						<div className="mt-5 flex flex-wrap gap-5 text-sm text-white/75">
							<span className="flex items-center gap-2">
								<CalendarDays size={17} className="text-[#ff7a00]" />{" "}
								{event.date}
							</span>
							<span className="flex items-center gap-2">
								<Clock3 size={17} className="text-[#ff7a00]" /> {event.time}
							</span>
						</div>
					</div>
				</div>
			</section>

			<div className="mx-auto grid max-w-[1280px] gap-8 px-5 py-10 lg:grid-cols-[1fr_390px] lg:px-8">
				<section>
					<h2 className="text-2xl font-black">{t("À propos de l'événement")}</h2>
					<p className="mt-4 max-w-2xl leading-7 text-white/60">
						{event.description}
					</p>
					<div className="mt-8 grid gap-4 sm:grid-cols-2">
						<div className="rounded-xl border border-white/10 bg-[#191919] p-5">
							<MapPin className="text-[#ff7a00]" />
							<p className="mt-3 text-xs text-white/45">{t("Lieu")}</p>
							<p className="mt-1 font-bold">{event.place}</p>
						</div>
						<div className="rounded-xl border border-white/10 bg-[#191919] p-5">
							<Users className="text-[#ff7a00]" />
							<p className="mt-3 text-xs text-white/45">{t("Accès")}</p>
							<p className="mt-1 font-bold">{t("Présentiel + Streaming")}</p>
						</div>
					</div>
					<button
						onClick={() => router.push("/live/gala-des-stars-kinshasa")}
						className="mt-7 flex h-12 items-center gap-2 rounded-lg border border-[#ff7a00]/40 px-5 text-sm font-black text-[#ff7a00] hover:bg-[#ff7a00]/10"
					>
						<Play size={17} fill="currentColor" /> {t("Regarder en direct")}
					</button>
				</section>

				<aside className="h-fit rounded-xl border border-white/10 bg-[#191919] p-5">
					<div className="flex items-center gap-3 border-b border-white/10 pb-5">
						<div className="grid h-10 w-10 place-items-center rounded-full bg-[#ff7a00] text-black">
							<Ticket size={19} />
						</div>
						<div>
							<p className="text-xs text-white/45">{t("Billetterie")}</p>
							<p className="font-black">{t("Choisissez votre ticket")}</p>
						</div>
					</div>
					<div className="mt-4 space-y-2">
						{tickets.map((ticket) => (
							<button
								key={ticket.name}
								onClick={() => setSelectedTicket(ticket.name)}
								className={`flex w-full items-center rounded-lg border p-4 text-left transition ${
									selectedTicket === ticket.name
										? "border-[#ff7a00] bg-[#ff7a00]/10"
										: "border-white/10 hover:border-white/25"
								}`}
							>
								<Ticket
									size={18}
									className={
										selectedTicket === ticket.name
											? "text-[#ff7a00]"
											: "text-white/35"
									}
								/>
								<div className="ml-3">
									<p className="text-sm font-black">{t(ticket.name)}</p>
									<p className="mt-0.5 text-xs text-white/45">
										{t(ticket.detail)}
									</p>
								</div>
								<p className="ml-auto font-black text-[#ff7a00]">
									{ticket.price}
								</p>
							</button>
						))}
					</div>
					<div className="mt-4 flex items-center justify-between">
						<div className="flex items-center gap-2">
							<button
								aria-label={t("Diminuer la quantité")}
								onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
								className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white transition hover:border-white/25"
							>
								<Minus size={16} />
							</button>
							<span className="text-lg font-black text-white">
								{quantity}
							</span>
							<button
								aria-label={t("Augmenter la quantité")}
								onClick={() => setQuantity((prev) => prev + 1)}
								className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white transition hover:border-white/25"
							>
								<Plus size={16} />
							</button>
						</div>
						<button
							onClick={() => setCheckoutOpen(true)}
							className="h-12 rounded-lg bg-[#ff7a00] px-5 text-sm font-black text-black"
						>
							{t("Acheter")} {quantity > 1 && `(${quantity})`} — {t(selectedTicket)}
						</button>
					</div>
				</aside>
			</div>

			{checkoutOpen && !issuedTicket && (
				<div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-5">
					<form
						onSubmit={purchaseTicket}
						className="w-full max-w-[500px] rounded-t-2xl border border-white/10 bg-[#191919] p-6 sm:rounded-2xl"
					>
						<div className="mb-6 flex items-center justify-between">
							<div>
								<p className="text-xs text-[#ff7a00]">{t("Finaliser l'achat")}</p>
								<h2 className="mt-1 text-xl font-black">
									{quantity} × {t(selectedTicket)}
								</h2>
							</div>
							<button
								type="button"
								onClick={() => setCheckoutOpen(false)}
								className="text-sm text-white/45"
							>
								{t("Fermer")}
							</button>
						</div>
						<div className="mb-4 flex items-center justify-between rounded-lg border border-[#ff7a00]/20 bg-[#ff7a00]/5 px-4 py-3">
							<span className="text-sm text-white/55">{t("Total à payer")}</span>
							<strong className="text-xl text-[#ff7a00]">
								{
									((
										tickets.find((ticket) => ticket.name === selectedTicket)
											?.price
											? Number(
													tickets.find((ticket) => ticket.name === selectedTicket)!
														.price.replace(/[^0-9.]/g, "")
											  )
											: 0) * quantity
								).toFixed(2)}{" "}
								$
							</strong>
						</div>
						<div className="grid gap-4">
							<label className="text-sm font-bold">
								{t("Nom complet")}
								<input
									name="name"
									required
									className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black/40 px-3 outline-none focus:border-[#ff7a00]"
								/>
							</label>
							<div className="grid gap-4 sm:grid-cols-2">
								<label className="text-sm font-bold">
								{t("Téléphone")}
									<input
										name="phone"
										required
										className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black/40 px-3 outline-none focus:border-[#ff7a00]"
										placeholder="+243..."
									/>
								</label>
								<label className="text-sm font-bold">
								{t("Email")}
									<input
										name="email"
										type="email"
										required
										className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black/40 px-3 outline-none focus:border-[#ff7a00]"
									/>
								</label>
							</div>
							<label className="text-sm font-bold">
								{t("Paiement")}
								<select
									name="payment"
									className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-[#111111] px-3"
								>
									<option>Orange Money</option>
									<option>Airtel Money</option>
									<option>M-Pesa</option>
									<option>Visa/Mastercard</option>
								</select>
							</label>
						</div>
						<button className="mt-6 h-12 w-full rounded-lg bg-[#ff7a00] text-sm font-black text-black">
							{t("Payer et recevoir le billet")}
						</button>
					</form>
				</div>
			)}

			{issuedTicket && (
				<div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-5 backdrop-blur-sm">
					<section className="w-full max-w-[420px] rounded-2xl border border-white/10 bg-[#191919] p-6 text-center">
						<p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-400">
							{t("Paiement confirmé")}
						</p>
						<h2 className="mt-2 text-2xl font-black">
							{t("Votre billet est prêt")}
						</h2>
						<div className="mx-auto mt-5 w-fit rounded-xl bg-white p-4">
							<QRCodeSVG value={issuedTicket.code} size={180} level="H" />
						</div>
						<p className="mt-4 text-lg font-black">{issuedTicket.code}</p>
						<p className="mt-1 text-sm text-white/50">
							{issuedTicket.eventTitle} · {issuedTicket.ticketType}
						</p>
						<button
							onClick={() => {
								setIssuedTicket(null);
								setCheckoutOpen(false);
							}}
							className="mt-6 h-11 w-full rounded-lg bg-[#ff7a00] text-sm font-black text-black"
						>
							{t("Terminé")}
						</button>
					</section>
				</div>
			)}
		</main>
	);
}
