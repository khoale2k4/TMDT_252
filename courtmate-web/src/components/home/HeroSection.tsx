"use client";

import { MapPin, Users, Zap } from "lucide-react";
import type { ReactNode } from "react";
import SearchBar from "./HeroSearchBar";

interface StatCardProps {
  icon: ReactNode;
  number: string;
  label: string;
}

function StatCard({ icon, number, label }: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-4 text-center shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(15,23,42,0.12)] md:p-5">
      <div className="flex flex-col items-center justify-center">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500 to-cyan-400 text-white shadow-[0_10px_25px_rgba(59,130,246,0.25)]">
          {icon}
        </div>
        <div className="mb-1 text-xl font-extrabold tracking-tight text-slate-900 md:text-5xl">{number}</div>
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 md:text-sm">{label}</div>
      </div>
    </div>
  );
}

const stats = [
  { icon: <MapPin size={28} strokeWidth={2.5} />, number: "500+", label: "SÂN THỂ THAO" },
  { icon: <Users size={28} strokeWidth={2.5} />, number: "10K+", label: "NGƯỜI DÙNG" },
  { icon: <Zap size={28} strokeWidth={2.5} />, number: "30s", label: "ĐẶT SÂN NHANH" }
];

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] overflow-hidden bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.14),transparent_36%),radial-gradient(circle_at_80%_20%,rgba(251,191,36,0.16),transparent_30%),linear-gradient(180deg,#f8fbff_0%,#ffffff_48%,#f8fafc_100%)] px-6 py-20 md:px-12 md:py-28">
      <div className="absolute -top-24 right-[4%] h-80 w-80 rounded-full bg-amber-300/25 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-8%] h-96 w-96 rounded-full bg-sky-300/25 blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.03)_1px,transparent_1px)] bg-size-[72px_72px] opacity-40 pointer-events-none" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center text-center pt-10 md:pt-16">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-white/75 px-4 py-2 text-xs font-semibold tracking-[0.22em] text-sky-700 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          ĐẶT SÂN TRỰC TUYẾN
        </div>

        <h1 className="max-w-4xl text-4xl font-black leading-[1.05] tracking-tight text-slate-950 md:text-5xl lg:text-6xl xl:text-7xl">
          Đặt sân thể thao chỉ trong{' '}
          <span className="bg-linear-to-r from-sky-600 via-blue-600 to-amber-500 bg-clip-text text-transparent">
            30 giây
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-base font-medium leading-relaxed text-slate-600 md:text-lg lg:text-xl">
          Tìm và đặt sân nhanh chóng, thanh toán tiện lợi.
        </p>

        <div className="mt-10 w-full max-w-5xl">
          <SearchBar />
        </div>

        <div className="mt-12 grid w-full max-w-5xl grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          {stats.map((stat) => (
            <StatCard key={stat.label} icon={stat.icon} number={stat.number} label={stat.label} />
          ))}
        </div>
      </div>
    </section>
  );
}