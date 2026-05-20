import { Heart, MessageCircle } from "lucide-react";

import type { RegionRecord } from "@/features/records/model/types";

type InstagramFeedCardProps = {
  record: RegionRecord;
  onSelectRecord: (recordId: string) => void;
};

export function InstagramFeedCard({
  record,
  onSelectRecord,
}: InstagramFeedCardProps) {
  return (
    <article className="hbk-surface overflow-hidden rounded-lg">
      <div className="flex items-center gap-2 p-3">
        <div className="grid size-9 place-items-center rounded-full bg-pink-50 text-pink-700">
          <Heart size={16} strokeWidth={2.4} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="hbk-text truncate text-sm font-extrabold">
            {record.title}
          </h3>
          <p className="hbk-muted truncate text-xs font-bold">
            {record.regionName}
          </p>
        </div>
        <span className="rounded-full bg-pink-50 px-2.5 py-1 text-xs font-extrabold text-pink-700">
          {record.sourceLabel ?? "Instagram"}
        </span>
      </div>
      <img className="aspect-square w-full object-cover" src={record.imageUrl} alt="" />
      <div className="p-3">
        <div className="hbk-text mb-2 flex gap-3">
          <Heart size={19} strokeWidth={2.4} aria-hidden="true" />
          <MessageCircle size={19} strokeWidth={2.4} aria-hidden="true" />
        </div>
        <p className="hbk-text line-clamp-2 text-sm leading-5">
          {record.description}
        </p>
        <button
          className="mt-3 text-sm font-extrabold text-pink-700"
          type="button"
          onClick={() => onSelectRecord(record.id)}
        >
          지도에서 보기
        </button>
      </div>
    </article>
  );
}
