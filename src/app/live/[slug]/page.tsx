"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LockKeyhole, Maximize, MessageCircle, Pause, Play, Send, Settings, Ticket, Users, Volume2 } from "lucide-react";
import { consumeLiveTicket, findTicketByCode } from "../../lib/kinlive";
import { useLocale } from "../../components/LocaleProvider";

export default function LivePage() {
  const router = useRouter();
  const { t } = useLocale();
  const [playing, setPlaying] = useState(true);
  const [quality, setQuality] = useState("Auto");
  const [chatOpen, setChatOpen] = useState(true);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { name: "Sarah K.", text: "Quelle ambiance magnifique ! 🔥" },
    { name: "Junior M.", text: "Le son est excellent en 1080p" },
  ]);
  const [accessCode, setAccessCode] = useState("");
  const [accessError, setAccessError] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    const code = window.sessionStorage.getItem("kinlive_live_access") || "";
    if (!code) return;
    void findTicketByCode(code).then((ticket) => {
      setUnlocked(ticket !== null && ticket.eventId === "gala-des-stars-kinshasa");
    });
  }, []);

  const title = "Gala des stars — Kinshasa";

  function sendMessage(event: React.FormEvent) {
    event.preventDefault();
    if (!message.trim()) return;
    setMessages((current) => [...current, { name: "Vous", text: message.trim() }]);
    setMessage("");
  }

  async function validateTicket(event: React.FormEvent) {
    event.preventDefault();
    const normalizedCode = accessCode.trim().toUpperCase().replace(/\s+/g, "-");
    const result = await consumeLiveTicket(normalizedCode, "gala-des-stars-kinshasa");
    if (result.ticket) {
      window.sessionStorage.setItem("kinlive_live_access", normalizedCode);
      setUnlocked(true);
      setAccessError("");
    } else {
      setAccessError(t(result.reason || "Code invalide ou billet déjà utilisé."));
    }
  }

  if (!unlocked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0d0d0d] px-5 text-white">
        <button onClick={() => router.push("/")} className="absolute left-5 top-5 flex items-center gap-2 text-sm text-white/55"><ArrowLeft size={17}/> {t("Retour")}</button>
        <section className="w-full max-w-[440px] rounded-2xl border border-white/10 bg-[#171717] p-6 text-center shadow-2xl sm:p-8">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#ff7a00]/10 text-[#ff7a00]"><LockKeyhole size={30}/></div>
          <p className="mt-5 text-xs font-black uppercase tracking-[0.16em] text-[#ff7a00]">{t("Accès réservé")}</p>
          <h1 className="mt-2 text-2xl font-black">{t("Entrez votre code ticket")}</h1>
          <p className="mt-3 text-sm leading-6 text-white/50">{t("Ce code figure sur votre billet numérique ou dans l’email de confirmation.")}</p>
          <form onSubmit={validateTicket} className="mt-6">
            <label className="block text-left text-sm font-bold">{t("Code du billet")}<div className="mt-2 flex items-center gap-3 rounded-lg border border-white/10 bg-black/40 px-4 focus-within:border-[#ff7a00]"><Ticket size={18} className="text-white/35"/><input value={accessCode} onChange={(event) => setAccessCode(event.target.value)} required autoFocus className="h-12 min-w-0 flex-1 bg-transparent text-center font-black uppercase tracking-[0.12em] outline-none placeholder:text-white/25" placeholder="KINLIVE-2026"/></div></label>
            {accessError && <p className="mt-3 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-300">{accessError}</p>}
            <button className="mt-4 h-12 w-full rounded-lg bg-[#ff7a00] text-sm font-black text-black">{t("Accéder au live")}</button>
          </form>
          <button className="mt-5 text-sm font-bold text-white/45 hover:text-[#ff7a00]">{t("Je n’ai pas de ticket · Acheter maintenant")}</button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0d0d0d] text-white">
      <header className="border-b border-white/10 bg-[#111111]">
        <div className="mx-auto flex h-[68px] max-w-[1440px] items-center px-4 lg:px-6">
          <button onClick={() => router.push("/")} className="flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white"><ArrowLeft size={18}/> {t("Retour")}</button>
          <div className="ml-5"><p className="hidden text-xs font-black uppercase tracking-widest text-[#ff3131] sm:block">● {t("En direct")}</p><h1 className="truncate text-sm font-black sm:text-lg">{title}</h1></div>
          <div className="ml-auto flex items-center gap-2 rounded-full bg-[#ff3131]/10 px-3 py-2 text-xs font-bold text-[#ff6969]"><Users size={15}/> 12 840</div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[minmax(0,1fr)_350px]">
        <section>
          <div className="relative aspect-video bg-black">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1800&q=90')] bg-cover bg-center" />
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute left-5 top-5 flex items-center gap-2 rounded-md bg-[#ff3131] px-3 py-1.5 text-xs font-black"><span className="h-2 w-2 animate-pulse rounded-full bg-white"/> LIVE</div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-5 pb-4 pt-16">
              <div className="mb-3 h-1 rounded-full bg-white/25"><div className="h-full w-[72%] rounded-full bg-[#ff7a00]" /></div>
              <div className="flex items-center gap-3">
                <button onClick={() => setPlaying(!playing)} className="grid h-9 w-9 place-items-center" aria-label={playing ? t("Pause") : t("Lecture")}>{playing ? <Pause size={20} fill="currentColor"/> : <Play size={20} fill="currentColor"/>}</button>
                <Volume2 size={20} />
                <span className="text-xs font-bold text-white/70">1:24:18 / Live</span>
                <div className="ml-auto flex items-center gap-2">
                  <button onClick={() => setQuality(quality === "1080p" ? "720p" : quality === "720p" ? "Auto" : "1080p")} className="flex h-9 items-center gap-1.5 rounded-md border border-white/15 bg-black/40 px-3 text-xs font-bold"><Settings size={15}/>{quality}</button>
                  <button className="grid h-9 w-9 place-items-center" aria-label={t("Plein écran")}><Maximize size={19}/></button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between px-4 py-5 lg:px-6">
            <div><p className="text-xs font-bold text-[#ff7a00]">KINSHASA · RÉP. DÉMOCRATIQUE DU CONGO</p><h2 className="mt-1 text-xl font-black sm:text-2xl">{title}</h2></div>
            <button onClick={() => setChatOpen(!chatOpen)} className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 lg:hidden" aria-label={t("Ouvrir le chat")}><MessageCircle size={19}/></button>
          </div>
        </section>

        {chatOpen && <aside className="fixed inset-x-0 bottom-0 z-40 h-[48vh] border-t border-white/10 bg-[#161616] lg:static lg:h-[calc(100vh-68px)] lg:border-l lg:border-t-0">
          <div className="flex h-14 items-center justify-between border-b border-white/10 px-4"><h3 className="text-sm font-black">{t("Chat en direct")}</h3><button onClick={() => setChatOpen(false)} className="text-xs text-white/45 lg:hidden">{t("Fermer")}</button></div>
          <div className="h-[calc(100%-112px)] space-y-4 overflow-y-auto p-4 lg:h-[calc(100%-120px)]">{messages.map((item, index) => <div key={`${item.name}-${index}`} className="flex gap-3"><div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#ff3131] text-xs font-black text-black">{item.name.charAt(0)}</div><div><p className="text-xs font-bold text-[#ff7a00]">{item.name}</p><p className="mt-1 text-sm leading-5 text-white/75">{item.text}</p></div></div>)}</div>
          <form onSubmit={sendMessage} className="flex h-14 gap-2 border-t border-white/10 p-2"><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder={t("Votre message…")} className="min-w-0 flex-1 rounded-lg bg-white/5 px-3 text-sm outline-none placeholder:text-white/35"/><button className="grid w-10 place-items-center rounded-lg bg-[#ff7a00] text-black" aria-label={t("Envoyer")}><Send size={17}/></button></form>
        </aside>}
      </div>
    </main>
  );
}
