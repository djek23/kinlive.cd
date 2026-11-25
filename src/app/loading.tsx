import Image from "next/image";

export default function Loading() {
  return (
    <main className="fixed inset-0 z-[100] flex min-h-screen items-center justify-center bg-[#111111] text-white">
      <div className="flex flex-col items-center">
        <div className="relative">
          <Image
            src="/kinlive-logo.svg"
            alt="Kinlive.cd"
            width={160}
            height={40}
            className="h-[72px] w-auto animate-pulse sm:h-[96px]"
            priority
          />
          <div className="absolute -bottom-7 left-1/2 h-1 w-28 -translate-x-1/2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/2 animate-[loading_1.2s_ease-in-out_infinite] rounded-full bg-[#ff7a00]" />
          </div>
        </div>
      </div>
    </main>
  );
}
