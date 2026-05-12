import { FileText, MapPin } from "lucide-react";

import type { RegionRecord, RegionSummary } from "@/features/records/model/types";
import { RecordCard } from "@/features/records/ui/RecordCard";

type RegionRecordPanelProps = {
  region: RegionSummary | undefined;
  records: RegionRecord[];
};

export function RegionRecordPanel({ region, records }: RegionRecordPanelProps) {
  if (!region) {
    return (
      <aside className="rounded-lg border border-stone-300 bg-white p-5">
        <div className="mb-3 grid size-10 place-items-center rounded-lg bg-stone-100 text-stone-500">
          <MapPin size={20} aria-hidden="true" />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-stone-950">지역을 선택하세요</h2>
        <p className="leading-6 text-stone-600">
          지도에서 시도 단위 지역을 누르면 해당 지역에 연결된 기록이 여기에 표시됩니다.
        </p>
      </aside>
    );
  }

  return (
    <aside className="rounded-lg border border-stone-300 bg-orange-50 p-5">
      <div className="mb-5">
        <p className="mb-2 text-sm font-bold uppercase text-emerald-800">
          Selected Region
        </p>
        <h2 className="text-2xl font-bold text-stone-950">{region.name}</h2>
        <p className="mt-1 text-sm text-stone-500">{region.nameEng}</p>
      </div>

      {records.length > 0 ? (
        <div className="grid gap-3">
          {records.map((record) => (
            <RecordCard key={record.id} record={record} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-stone-300 bg-white p-5">
          <div className="mb-3 grid size-10 place-items-center rounded-lg bg-stone-100 text-stone-500">
            <FileText size={20} aria-hidden="true" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-stone-950">아직 기록이 없습니다</h3>
          <p className="leading-6 text-stone-600">
            이 지역에 대한 여행, 장소, 메모 기록은 다음 단계에서 추가할 수 있습니다.
          </p>
        </div>
      )}
    </aside>
  );
}
