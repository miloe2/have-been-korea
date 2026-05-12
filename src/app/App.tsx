import { MapPin, Plus, Search } from "lucide-react";

import { sampleTrips } from "@/features/trips/model/sampleTrips";
import { TripCard } from "@/features/trips/ui/TripCard";
import { formatTripCount } from "@/shared/lib/formatTripCount";

export function App() {
  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-8 sm:py-10">
      <header className="mb-6 flex items-start justify-between gap-5 max-sm:items-center">
        <div>
          <p className="mb-2 text-sm font-bold uppercase text-emerald-800">
            Have Been Korea
          </p>
          <h1 className="max-w-3xl text-[2.3rem] leading-[1.02] font-bold tracking-normal text-stone-950 sm:text-6xl lg:text-7xl">
            다녀온 한국 여행지를 기록하세요
          </h1>
        </div>
        <button
          className="grid size-12 shrink-0 place-items-center rounded-lg bg-red-500 text-white shadow-xl shadow-red-500/25 transition hover:bg-red-600"
          aria-label="여행지 추가"
        >
          <Plus size={22} strokeWidth={2.2} />
        </button>
      </header>

      <section
        className="flex min-h-14 items-center gap-3 rounded-lg border border-stone-300 bg-white px-4"
        aria-label="여행지 검색"
      >
        <Search className="shrink-0 text-emerald-800" size={20} aria-hidden="true" />
        <input
          className="w-full min-w-0 border-0 bg-transparent text-stone-900 outline-none placeholder:text-stone-400"
          placeholder="도시, 장소, 메모 검색"
        />
      </section>

      <section
        className="my-5 grid overflow-hidden rounded-lg border border-stone-300 bg-stone-300 sm:grid-cols-3"
        aria-label="여행 기록 요약"
      >
        <div className="min-w-0 bg-orange-50 p-5">
          <strong className="mb-1 block text-2xl leading-none text-stone-950">
            {formatTripCount(sampleTrips.length)}
          </strong>
          <span className="text-sm text-stone-600">기록된 여행지</span>
        </div>
        <div className="min-w-0 bg-orange-50 p-5">
          <strong className="mb-1 block text-2xl leading-none text-stone-950">
            6
          </strong>
          <span className="text-sm text-stone-600">방문한 지역</span>
        </div>
        <div className="min-w-0 bg-orange-50 p-5">
          <strong className="mb-1 block text-2xl leading-none text-stone-950">
            2026
          </strong>
          <span className="text-sm text-stone-600">최근 여행</span>
        </div>
      </section>

      <section className="pt-3" aria-label="최근 여행지">
        <div className="mb-3.5 flex items-center gap-2 text-emerald-900">
          <MapPin size={20} aria-hidden="true" />
          <h2 className="m-0 text-xl font-semibold text-stone-950">최근 기록</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {sampleTrips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      </section>
    </main>
  );
}
