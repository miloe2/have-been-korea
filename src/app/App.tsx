import { MapPin, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { regionRecords } from "@/features/records/model/regionRecords";
import { regions, selectableRegions } from "@/features/records/model/regions";
import { KoreaMap } from "@/features/records/ui/KoreaMap";
import { RegionRecordPanel } from "@/features/records/ui/RegionRecordPanel";
import { formatTripCount } from "@/shared/lib/formatTripCount";

export function App() {
  const [selectedRegionCode, setSelectedRegionCode] = useState<string | undefined>("11");
  const [mapLevel, setMapLevel] = useState<"korea" | "seoul">("korea");

  const regionRecordCounts = useMemo(
    () =>
      regionRecords.reduce<Record<string, number>>((counts, record) => {
        counts[record.regionCode] = (counts[record.regionCode] ?? 0) + 1;
        return counts;
      }, {}),
    [],
  );

  const selectedRegion = selectableRegions.find(
    (region) => region.code === selectedRegionCode,
  );
  const selectedRegionRecords = regionRecords.filter(
    (record) =>
      record.regionCode === selectedRegionCode ||
      (selectedRegionCode?.length === 2 &&
        record.regionCode.startsWith(selectedRegionCode)),
  );
  const recordedRegionCount = Object.keys(regionRecordCounts).length;

  const handleSelectRegion = (regionCode: string) => {
    setSelectedRegionCode(regionCode);

    if (regionCode === "11") {
      setMapLevel("seoul");
    }
  };

  const handleBackToKorea = () => {
    setMapLevel("korea");
    setSelectedRegionCode("11");
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:py-10">
      <header className="mb-6 flex items-start justify-between gap-5 max-sm:items-center">
        <div>
          <p className="mb-2 text-sm font-bold uppercase text-emerald-800">
            Have Been Korea
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-normal text-stone-950 sm:text-6xl">
            한국 지도에 여행 기록을 남기세요
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-stone-600">
            시도 단위 지역을 선택하고, 지역별로 저장된 개인 여행 기록을 확인하는
            초기 MVP입니다.
          </p>
        </div>
        <button
          className="grid size-12 shrink-0 place-items-center rounded-lg bg-red-500 text-white shadow-xl shadow-red-500/25 transition hover:bg-red-600"
          aria-label="기록 추가"
        >
          <Plus size={22} strokeWidth={2.2} />
        </button>
      </header>

      <section
        className="my-5 grid overflow-hidden rounded-lg border border-stone-300 bg-stone-300 sm:grid-cols-3"
        aria-label="지역 기록 요약"
      >
        <div className="min-w-0 bg-orange-50 p-5">
          <strong className="mb-1 block text-2xl leading-none text-stone-950">
            {formatTripCount(regionRecords.length)}
          </strong>
          <span className="text-sm text-stone-600">저장된 기록</span>
        </div>
        <div className="min-w-0 bg-orange-50 p-5">
          <strong className="mb-1 block text-2xl leading-none text-stone-950">
            {recordedRegionCount}
          </strong>
          <span className="text-sm text-stone-600">기록 있는 지역</span>
        </div>
        <div className="min-w-0 bg-orange-50 p-5">
          <strong className="mb-1 block text-2xl leading-none text-stone-950">
            {regions.length}
          </strong>
          <span className="text-sm text-stone-600">시도 단위 지역</span>
        </div>
      </section>

      <section className="pt-3" aria-label="한국 지역별 기록">
        <div className="mb-3.5 flex items-center gap-2 text-emerald-900">
          <MapPin size={20} aria-hidden="true" />
          <h2 className="m-0 text-xl font-semibold text-stone-950">지역 지도</h2>
        </div>
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
          <KoreaMap
            mapLevel={mapLevel}
            selectedRegionCode={selectedRegionCode}
            regionRecordCounts={regionRecordCounts}
            onSelectRegion={handleSelectRegion}
            onBackToKorea={handleBackToKorea}
          />
          <RegionRecordPanel
            region={selectedRegion}
            records={selectedRegionRecords}
          />
        </div>
      </section>
    </main>
  );
}
