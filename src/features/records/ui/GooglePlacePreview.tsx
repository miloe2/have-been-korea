import { Bookmark, Navigation, Phone, Share2, X } from "lucide-react";

import type { RegionRecord } from "@/features/records/model/types";

type GooglePlacePreviewProps = {
  record: RegionRecord;
  onClose: () => void;
};

export function GooglePlacePreview({ record, onClose }: GooglePlacePreviewProps) {
  return (
    <article
      className="absolute inset-0 z-[1200] overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url(${record.imageUrl})` }}
    >
      <div className="absolute inset-x-0 bottom-0 rounded-t-[18px] bg-white px-3.5 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_22px_rgba(15,15,15,0.12)]">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
          <div className="min-w-0">
            <h2 className="truncate text-[15px] font-semibold leading-5 text-[#202124]">
              {record.title}
            </h2>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] leading-4 text-[#5f6368]">
              <span>4.6</span>
              <span className="text-[#fbbc04]">★★★★★</span>
              <span>(252)</span>
            </p>
            <p className="mt-0.5 truncate text-[11px] leading-4 text-[#5f6368]">
              서울특별시 · {record.regionName} · {record.date}
            </p>
          </div>
          <div className="flex items-start gap-1">
            <button
              className="grid size-8 place-items-center rounded-full bg-white text-[#3c4043]"
              type="button"
              aria-label="공유"
            >
              <Share2 size={16} aria-hidden="true" />
            </button>
            <button
              className="grid size-8 place-items-center rounded-full bg-white text-[#3c4043]"
              type="button"
              aria-label="선택한 핀 카드 닫기"
              onClick={onClose}
            >
              <X size={18} strokeWidth={2.2} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="mt-2.5 grid grid-cols-4 gap-1.5 text-[10px] font-semibold text-[#006d77]">
          <button
            className="inline-flex h-8 items-center justify-center gap-1 rounded-full bg-[#d7f5fa] px-2"
            type="button"
          >
            <Navigation size={13} aria-hidden="true" />
            경로
          </button>
          <button
            className="inline-flex h-8 items-center justify-center gap-1 rounded-full bg-[#eefbfc] px-2"
            type="button"
          >
            <Phone size={13} aria-hidden="true" />
            통화
          </button>
          <button
            className="inline-flex h-8 items-center justify-center gap-1 rounded-full bg-[#eefbfc] px-2"
            type="button"
          >
            <Bookmark size={13} aria-hidden="true" />
            저장
          </button>
          <button
            className="inline-flex h-8 items-center justify-center gap-1 rounded-full bg-[#eefbfc] px-2"
            type="button"
          >
            <Share2 size={13} aria-hidden="true" />
            공유
          </button>
        </div>
      </div>
    </article>
  );
}
