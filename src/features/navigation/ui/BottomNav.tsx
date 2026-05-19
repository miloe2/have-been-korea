import { MapPinned, SquarePen, UserRound } from "lucide-react";

type BottomNavProps = {
  onCreateRecord: () => void;
};

export function BottomNav({ onCreateRecord }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[800] border-t border-[var(--color-border)] bg-[var(--color-card-bg)] px-5 pb-[calc(10px_+_env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_28px_rgba(15,15,15,0.1)] lg:hidden"
      aria-label="하단 네비게이션"
    >
      <div className="mx-auto grid max-w-md grid-cols-3 items-center gap-2">
        <button
          className="grid min-h-14 place-items-center gap-1 rounded-xl text-xs font-extrabold text-[var(--color-text)]"
          type="button"
        >
          <MapPinned size={21} strokeWidth={2.2} aria-hidden="true" />
          피드
        </button>
        <button
          className="grid min-h-14 place-items-center gap-1 rounded-xl bg-[var(--color-text)] text-xs font-extrabold text-[var(--color-card-bg)]"
          type="button"
          onClick={onCreateRecord}
        >
          <SquarePen size={21} strokeWidth={2.2} aria-hidden="true" />
          새 기록
        </button>
        <button
          className="grid min-h-14 place-items-center gap-1 rounded-xl text-xs font-extrabold text-[var(--color-muted)]"
          type="button"
        >
          <UserRound size={21} strokeWidth={2.2} aria-hidden="true" />
          내 정보
        </button>
      </div>
    </nav>
  );
}
