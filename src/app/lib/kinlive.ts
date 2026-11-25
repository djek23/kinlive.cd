export type Producer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: "producer";
  ownerName?: string;
  city?: string;
  country?: string;
  rccm?: string;
  identityNumber?: string;
  identityFileName?: string;
  rccmFileName?: string;
  authorizationFileName?: string;
  contractAccepted?: boolean;
  contractAcceptedAt?: string;
  status?: AccountStatus;
  submittedAt?: string;
  reviewedAt?: string;
  reviewNote?: string;
};

export type KinliveEvent = {
  id: string;
  title: string;
  place: string;
  date: string;
  time: string;
  price: string;
  category: string;
  image: string;
  producerId: string;
  status: "pending" | "published";
  description: string;
  liveStatus?: "offline" | "live" | "ended";
  eventDate?: string;
  ticketCategories?: TicketCategory[];
};

export type TicketCategory = {
  name: string;
  price: number;
  quantity: number;
};

export type TicketSale = {
  id: string;
  code: string;
  eventId: string;
  eventTitle: string;
  ticketType: string;
  customerName: string;
  phone: string;
  email: string;
  amount: number;
  currency: "USD" | "CDF";
  paymentMethod: "Orange Money" | "Airtel Money" | "M-Pesa" | "Visa/Mastercard";
  status: "paid" | "pending" | "cancelled";
  quantity?: number;
  quantityRemaining?: number;
  codeHash?: string;
  usedAt?: string;
  redeemedAt?: string;
  createdAt: string;
  producerId: string;
};

export type AccountStatus = "pending" | "active" | "suspended";

export type PaymentProvider = {
  id: "orange" | "airtel" | "mpesa" | "card";
  name: string;
  enabled: boolean;
  publicKey: string;
  secretKey: string;
  webhookUrl: string;
};

export type SuperAdmin = {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: "superadmin";
};

export const eventSeed: KinliveEvent[] = [];

export function getProducerSession(): Producer | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem("kinlive_session");
  return value ? JSON.parse(value) : null;
}

export function getEvents(): KinliveEvent[] {
  if (typeof window === "undefined") return eventSeed;
  const value = window.localStorage.getItem("kinlive_events");
  return value ? JSON.parse(value) : eventSeed;
}

export function saveEvents(events: KinliveEvent[]) {
  window.localStorage.setItem("kinlive_events", JSON.stringify(events));
}

export function getProducers(): Producer[] {
  if (typeof window === "undefined") return [];
  const value = window.localStorage.getItem("kinlive_producers");
  return value ? JSON.parse(value) : [];
}

export function saveProducer(producer: Producer) {
  const producers = getProducers();
  const producerToSave = { ...producer, status: producer.status ?? "pending", submittedAt: producer.submittedAt ?? new Date().toISOString() };
  producers.push(producerToSave);
  window.localStorage.setItem("kinlive_producers", JSON.stringify(producers));
  window.localStorage.setItem("kinlive_session", JSON.stringify(producerToSave));
}

export function updateProducerStatus(id: string, status: AccountStatus, reviewNote = "") {
  const producers = getProducers().map((producer) => producer.id === id
    ? { ...producer, status, reviewNote, reviewedAt: new Date().toISOString() }
    : producer
  );
  window.localStorage.setItem("kinlive_producers", JSON.stringify(producers));
  const session = getProducerSession();
  if (session?.id === id) {
    window.localStorage.setItem("kinlive_session", JSON.stringify(producers.find((producer) => producer.id === id)));
  }
}

export function deleteProducer(id: string) {
  window.localStorage.setItem("kinlive_producers", JSON.stringify(getProducers().filter((producer) => producer.id !== id)));
  const session = getProducerSession();
  if (session?.id === id) window.localStorage.removeItem("kinlive_session");
}

export function getSuperAdmins(): SuperAdmin[] {
  if (typeof window === "undefined") return [];
  const value = window.localStorage.getItem("kinlive_superadmins");
  return value ? JSON.parse(value) : [];
}

export function saveSuperAdmin(admin: SuperAdmin) {
  window.localStorage.setItem("kinlive_superadmins", JSON.stringify([admin]));
}

export function getSuperAdminSession(): SuperAdmin | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem("kinlive_superadmin_session");
  return value ? JSON.parse(value) : null;
}

export function getPaymentProviders(): PaymentProvider[] {
  if (typeof window === "undefined") return [];
  const value = window.localStorage.getItem("kinlive_payment_providers");
  if (value) return JSON.parse(value);
  return [
    { id: "orange", name: "Orange Money", enabled: false, publicKey: "", secretKey: "", webhookUrl: "" },
    { id: "airtel", name: "Airtel Money", enabled: false, publicKey: "", secretKey: "", webhookUrl: "" },
    { id: "mpesa", name: "M-Pesa", enabled: false, publicKey: "", secretKey: "", webhookUrl: "" },
    { id: "card", name: "Carte bancaire", enabled: false, publicKey: "", secretKey: "", webhookUrl: "" },
  ];
}

export function savePaymentProviders(providers: PaymentProvider[]) {
  window.localStorage.setItem("kinlive_payment_providers", JSON.stringify(providers));
}

export function getCategories(): string[] {
  if (typeof window === "undefined") return defaultCategories;
  const value = window.localStorage.getItem("kinlive_categories");
  if (!value) return defaultCategories;
  const categories = JSON.parse(value);
  return Array.isArray(categories) ? categories : defaultCategories;
}

export function saveCategories(categories: string[]) {
  window.localStorage.setItem("kinlive_categories", JSON.stringify(Array.from(new Set(categories))));
}

export function normalizeTicketCode(code: string): string {
  return code.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");
}

export function generateTicketCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  const suffix = Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
  return `KL-${suffix.slice(0, 4)}-${suffix.slice(4, 8)}-${suffix.slice(8)}`;
}

export async function hashTicketCode(code: string): Promise<string> {
  const normalizedCode = normalizeTicketCode(code);
  const data = new TextEncoder().encode(normalizedCode);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function findTicketByCode(code: string): Promise<TicketSale | null> {
  const normalizedCode = normalizeTicketCode(code);
  const hash = await hashTicketCode(normalizedCode);
  const sales = getTicketSales();
  return sales.find((sale) => sale.status === "paid" && ((sale.codeHash && sale.codeHash === hash) || sale.code === normalizedCode)) || null;
}

export async function consumeLiveTicket(code: string, eventId: string): Promise<{ ticket: TicketSale | null; reason?: string }> {
  const ticket = await findTicketByCode(code);
  if (!ticket) return { ticket: null, reason: "Code invalide, billet annulé ou non trouvé." };
  if (ticket.eventId !== eventId) return { ticket: null, reason: "Ce billet appartient à un autre événement." };

  const remaining = ticket.quantityRemaining ?? ticket.quantity ?? 1;
  if (remaining <= 0) return { ticket: null, reason: "Ce billet a déjà été entièrement utilisé." };

  const sales = getTicketSales();
  const consumed = sales.map((sale) => sale.id === ticket.id
    ? { ...sale, quantityRemaining: remaining - 1, redeemedAt: sale.redeemedAt || new Date().toISOString(), usedAt: new Date().toISOString() }
    : sale
  );
  saveTicketSales(consumed);
  return { ticket: { ...ticket, quantityRemaining: remaining - 1 } };
}

export function cancelTicketSale(id: string): boolean {
  const sales = getTicketSales();
  if (!sales.some((sale) => sale.id === id)) return false;
  saveTicketSales(sales.map((sale) => sale.id === id ? { ...sale, status: "cancelled" } : sale));
  return true;
}

export const defaultCategories = ["Concert", "Festival", "Conférence", "Match", "Culte", "Comédie"];

export function getTicketSales(): TicketSale[] {
  if (typeof window === "undefined") return [];
  const value = window.localStorage.getItem("kinlive_ticket_sales");
  return value ? JSON.parse(value) : [];
}

export function saveTicketSales(sales: TicketSale[]) {
  window.localStorage.setItem("kinlive_ticket_sales", JSON.stringify(sales));
}
