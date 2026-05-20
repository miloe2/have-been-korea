import { MapPinned, SquarePen, UserRound } from "lucide-react";

export type AppTab = "map" | "feed" | "profile";

type BottomNavProps = {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onCreateRecord: () => void;
};

export function BottomNav({
  activeTab,
  onSelectTab,
  onCreateRecord,
}: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[800] border-t border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 pb-[calc(4px_+_env(safe-area-inset-bottom))] pt-1 shadow-[0_-8px_20px_rgba(15,15,15,0.08)] lg:hidden"
      aria-label="하단 네비게이션"
    >
      <div className="mx-auto grid max-w-md grid-cols-3 items-center gap-1">
        <button
          className={`grid min-h-12 place-items-center gap-0.5 rounded-lg text-xs font-bold leading-none ${
            activeTab === "feed"
              ? "text-[var(--color-text)]"
              : "text-[var(--color-muted)]"
          }`}
          type="button"
          onClick={() => onSelectTab("feed")}
        >
          <MapPinned size={20} strokeWidth={2.2} aria-hidden="true" />
          피드
        </button>
        <button
          className={`grid min-h-12 place-items-center gap-0.5 rounded-lg text-xs font-bold leading-none ${
            activeTab === "map"
              ? "text-[var(--color-text)]"
              : "text-[var(--color-muted)]"
          }`}
          type="button"
          onClick={onCreateRecord}
        >
          <SquarePen size={20} strokeWidth={2.2} aria-hidden="true" />
          새 기록
        </button>
        <button
          className={`grid min-h-12 place-items-center gap-0.5 rounded-lg text-xs font-bold leading-none ${
            activeTab === "profile"
              ? "text-[var(--color-text)]"
              : "text-[var(--color-muted)]"
          }`}
          type="button"
          onClick={() => onSelectTab("profile")}
        >
          <UserRound size={20} strokeWidth={2.2} aria-hidden="true" />
          내 정보
        </button>
      </div>
    </nav>
  );
}
