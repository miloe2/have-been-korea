import { MapPin } from "lucide-react";

import type {
  RecordSourceType,
  RegionRecord,
} from "@/features/records/model/types";
import { GoogleFeedCard } from "@/features/records/ui/GoogleFeedCard";
import { InstagramFeedCard } from "@/features/records/ui/InstagramFeedCard";

type FeedScreenProps = {
  records: RegionRecord[];
  onSelectRecord: (recordId: string) => void;
};

const sourceLabelByType: Record<RecordSourceType, string> = {
  google: "Google",
  naver: "Naver",
  instagram: "Instagram",
};

function getSourceLabel(record: RegionRecord) {
  return record.sourceLabel ?? sourceLabelByType[record.sourceType];
}

function SourceBadge({ record }: { record: RegionRecord }) {
  const classNameByType: Record<RecordSourceType, string> = {
    google: "bg-blue-50 text-blue-700",
    naver: "bg-emerald-50 text-emerald-700",
    instagram: "bg-pink-50 text-pink-700",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${classNameByType[record.sourceType]}`}
    >
      {getSourceLabel(record)}
    </span>
  );
}

function NaverFeedCard({
  record,
  onSelectRecord,
}: {
  record: RegionRecord;
  onSelectRecord: (recordId: string) => void;
}) {
  return (
    <article className="rounded-lg border border-emerald-100 bg-white p-3.5">
      <div className="flex gap-3">
        <img
          className="size-24 shrink-0 rounded-md object-cover"
          src={record.imageUrl}
          alt=""
        />
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <SourceBadge record={record} />
            <span className="text-xs font-bold text-[var(--color-muted)]">
              {record.regionName}
            </span>
          </div>
          <h3 className="truncate text-base font-extrabold text-[var(--color-text)]">
            {record.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm leading-5 text-[var(--color-text)]">
            {record.description}
          </p>
          <button
            className="mt-2 text-sm font-extrabold text-emerald-700"
            type="button"
            onClick={() => onSelectRecord(record.id)}
          >
            지도에서 보기
          </button>
        </div>
      </div>
    </article>
  );
}

function FeedCard({
  record,
  onSelectRecord,
}: {
  record: RegionRecord;
  onSelectRecord: (recordId: string) => void;
}) {
  if (record.sourceType === "naver") {
    return <NaverFeedCard record={record} onSelectRecord={onSelectRecord} />;
  }

  if (record.sourceType === "instagram") {
    return (
      <InstagramFeedCard record={record} onSelectRecord={onSelectRecord} />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-white">
      <GoogleFeedCard
        record={record}
        imageLayout="square"
        onSelectRecord={onSelectRecord}
      />
    </div>
  );
}

export function FeedScreen({ records, onSelectRecord }: FeedScreenProps) {
  return (
    <section
      className="h-[calc(100svh_-_78px)] overflow-y-auto bg-[var(--color-page-bg)] px-4 pb-[94px] pt-4 lg:h-auto lg:overflow-visible lg:px-0 lg:pb-0 lg:pt-0"
      aria-label="내 기록 피드"
    >
      <div className="mx-auto max-w-2xl">
        <div className="mb-4">
          <h2 className="text-2xl font-extrabold text-[var(--color-text)]">
            내 기록
          </h2>
          <p className="mt-1 text-sm font-bold text-[var(--color-muted)]">
            {records.length}개 기록
          </p>
        </div>

        {records.length > 0 ? (
          <div className="grid gap-3">
            {records.map((record) => (
              <FeedCard
                key={record.id}
                record={record}
                onSelectRecord={onSelectRecord}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-[var(--color-border)] bg-white p-5">
            <div className="mb-3 grid size-10 place-items-center rounded-lg bg-[var(--color-chip-bg)] text-[var(--color-muted)]">
              <MapPin size={20} strokeWidth={2.4} aria-hidden="true" />
            </div>
            <h2 className="mb-2 text-lg font-extrabold text-[var(--color-text)]">
              아직 기록이 없습니다
            </h2>
            <p className="text-sm leading-6 text-[var(--color-muted)]">
              지도에서 새 기록을 저장하면 여기에 표시됩니다.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
