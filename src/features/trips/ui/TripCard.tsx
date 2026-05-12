import type { Trip } from "@/features/trips/model/types";

type TripCardProps = {
  trip: Trip;
};

export function TripCard({ trip }: TripCardProps) {
  return (
    <article className="min-w-0 overflow-hidden rounded-lg border border-stone-300 bg-white">
      <img
        className="aspect-[4/3] w-full object-cover"
        src={trip.imageUrl}
        alt={`${trip.title} 여행 사진`}
      />
      <div className="p-4">
        <h3 className="mb-1.5 text-lg font-semibold text-stone-950">{trip.title}</h3>
        <p className="mb-3 text-sm text-stone-500">
          {trip.region} · {trip.visitedAt}
        </p>
        <p className="m-0 leading-6 text-stone-700">{trip.note}</p>
      </div>
    </article>
  );
}
