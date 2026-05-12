import { CalendarDays } from "lucide-react";

import type { RegionRecord } from "@/features/records/model/types";

type RecordCardProps = {
  record: RegionRecord;
};

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export function RecordCard({ record }: RecordCardProps) {
  return (
    <article className="min-w-0 rounded-lg border border-stone-300 bg-white p-4">
      <div className="mb-2 flex items-center gap-2 text-sm text-stone-500">
        <CalendarDays size={16} aria-hidden="true" />
        <time dateTime={record.date}>
          {dateFormatter.format(new Date(record.date))}
        </time>
      </div>
      <h3 className="mb-2 text-lg font-semibold leading-snug text-stone-950">
        {record.title}
      </h3>
      <p className="leading-6 text-stone-700">{record.description}</p>
      {record.tags ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {record.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-emerald-50 px-2.5 py-1 text-sm font-medium text-emerald-800"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}
