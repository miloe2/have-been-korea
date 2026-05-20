import { Bookmark, Navigation, Phone, Share2, X } from "lucide-react";

import type { RegionRecord } from "@/features/records/model/types";

type GoogleFeedCardProps = {
  record: RegionRecord;
  imageLayout?: "fill" | "square";
  onClose?: () => void;
  onSelectRecord?: (recordId: string) => void;
};

export function GoogleFeedCard({
  record,
  imageLayout = "fill",
  onClose,
  onSelectRecord,
}: GoogleFeedCardProps) {
  return (
    <article className="flex h-full w-full flex-col overflow-hidden bg-white">
      <div
        className={
          imageLayout === "square"
            ? "aspect-square w-full shrink-0 bg-cover bg-center"
            : "min-h-0 flex-1 bg-cover bg-center"
        }
        style={{ backgroundImage: `url(${record.imageUrl})` }}
      />
      <div className="relative -mt-4 w-full shrink-0 rounded-t-2xl bg-white px-4 pb-3 pt-3 shadow-lg">
        <div className="mx-auto mb-3 h-1 w-16 rounded-full bg-neutral-200"></div>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-semibold leading-5 text-neutral-900">
              {record.title}
            </h2>
            <p className="mt-1 flex items-center gap-1 text-xs leading-4 text-neutral-500">
              <span>4.6</span>
              <span className="text-amber-400">★★★★★</span>
              <span>(252)</span>
            </p>
            <p className="mt-1 truncate text-xs leading-4 text-neutral-500">
              서울특별시 · {record.regionName} · {record.date}
            </p>
          </div>
          <div className="flex items-start gap-1">
            <button
              className="grid w-8 place-items-center rounded-full bg-white text-neutral-700"
              type="button"
              aria-label="공유"
            >
              <Share2 size={16} aria-hidden="true" />
            </button>
            {onClose ? (
              <button
                className="grid w-8 place-items-center rounded-full bg-white text-neutral-700"
                type="button"
                aria-label="선택한 핀 카드 닫기"
                onClick={onClose}
              >
                <X size={18} strokeWidth={2.2} aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-4 gap-2 text-xs font-semibold text-teal-700">
          <button
            className="inline-flex h-8 items-center justify-center gap-1 rounded-full bg-cyan-100 px-2"
            type="button"
            onClick={() => onSelectRecord?.(record.id)}
          >
            <Navigation size={13} aria-hidden="true" />
            경로
          </button>
          <button
            className="inline-flex h-8 items-center justify-center gap-1 rounded-full bg-cyan-50 px-2"
            type="button"
          >
            <Phone size={13} aria-hidden="true" />
            통화
          </button>
          <button
            className="inline-flex h-8 items-center justify-center gap-1 rounded-full bg-cyan-50 px-2"
            type="button"
          >
            <Bookmark size={13} aria-hidden="true" />
            저장
          </button>
          <button
            className="inline-flex h-8 items-center justify-center gap-1 rounded-full bg-cyan-50 px-2"
            type="button"
          >
            <Share2 size={13} aria-hidden="true" />
            공유
          </button>
        </div>
        { record.description && (<div className="-mx-4 mt-4 border-t border-neutral-200 px-4 pt-4 text-sm">
          {record.description}
        </div>)}
      </div>
    </article>
  );
}
