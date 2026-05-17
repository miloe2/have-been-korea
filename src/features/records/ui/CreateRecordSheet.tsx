import { X } from "lucide-react";
import type { FormEventHandler } from "react";

export type CreateRecordFormState = {
  title: string;
  description: string;
  date: string;
  imageUrl: string;
  tags: string;
};

type CreateRecordSheetProps = {
  draftPosition: [number, number] | undefined;
  formState: CreateRecordFormState;
  selectedRegionName: string;
  onCancel: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onUpdateForm: (formState: CreateRecordFormState) => void;
};

export function CreateRecordSheet({
  draftPosition,
  formState,
  selectedRegionName,
  onCancel,
  onSubmit,
  onUpdateForm,
}: CreateRecordSheetProps) {
  return (
    <form
      className="fixed bottom-0 left-0 right-0 z-[1200] flex max-h-[82vh] flex-col overflow-hidden rounded-t-[18px] border border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-[0_-16px_40px_rgba(15,15,15,0.18)] lg:bottom-4 lg:left-auto lg:right-4 lg:top-4 lg:w-[390px] lg:max-h-none lg:rounded-[18px] lg:shadow-[var(--shadow-card)]"
      onSubmit={onSubmit}
    >
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[var(--color-border-soft)] p-4">
        <div>
          <strong className="block text-lg font-extrabold text-[var(--color-text)]">
            새 기록
          </strong>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            지도에서 위치를 클릭한 뒤 기록을 저장하세요.
          </p>
        </div>
        <button
          className="grid size-9 shrink-0 place-items-center rounded-full border border-[var(--color-border)] bg-white text-[var(--color-text)]"
          type="button"
          aria-label="새 기록 닫기"
          onClick={onCancel}
        >
          <X size={17} strokeWidth={2.4} aria-hidden="true" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <div className="mb-3">
          <span className="mb-1.5 block text-xs font-extrabold text-[var(--color-muted)]">
            지역
          </span>
          <span className="flex h-11 items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-chip-bg)] px-3 text-sm font-bold text-[var(--color-chip-text)]">
            {selectedRegionName}
          </span>
        </div>

        <label className="mb-3 block">
          <span className="mb-1.5 block text-xs font-extrabold text-[var(--color-muted)]">
            제목
          </span>
          <input
            className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-text)]"
            required
            value={formState.title}
            onChange={(event) =>
              onUpdateForm({
                ...formState,
                title: event.target.value,
              })
            }
            placeholder="성수에서 보낸 오후"
          />
        </label>

        <label className="mb-3 block">
          <span className="mb-1.5 block text-xs font-extrabold text-[var(--color-muted)]">
            사진 URL
          </span>
          <input
            className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-text)]"
            required
            type="url"
            value={formState.imageUrl}
            onChange={(event) =>
              onUpdateForm({
                ...formState,
                imageUrl: event.target.value,
              })
            }
            placeholder="https://..."
          />
        </label>

        <label className="mb-3 block">
          <span className="mb-1.5 block text-xs font-extrabold text-[var(--color-muted)]">
            메모
          </span>
          <textarea
            className="min-h-24 w-full resize-none rounded-xl border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm leading-6 text-[var(--color-text)]"
            required
            value={formState.description}
            onChange={(event) =>
              onUpdateForm({
                ...formState,
                description: event.target.value,
              })
            }
            placeholder="짧은 여행 기록을 남겨보세요."
          />
        </label>

        <div className="mb-3 grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-extrabold text-[var(--color-muted)]">
              날짜
            </span>
            <input
              className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-text)]"
              required
              type="date"
              value={formState.date}
              onChange={(event) =>
                onUpdateForm({
                  ...formState,
                  date: event.target.value,
                })
              }
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-extrabold text-[var(--color-muted)]">
              태그
            </span>
            <input
              className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-text)]"
              value={formState.tags}
              onChange={(event) =>
                onUpdateForm({
                  ...formState,
                  tags: event.target.value,
                })
              }
              placeholder="카페, 산책"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-full bg-[var(--color-chip-bg)] px-2.5 py-1.5 text-xs font-bold text-[var(--color-chip-text)]">
            lat {draftPosition ? draftPosition[0].toFixed(3) : "-"}
          </span>
          <span className="rounded-full bg-[var(--color-chip-bg)] px-2.5 py-1.5 text-xs font-bold text-[var(--color-chip-text)]">
            lng {draftPosition ? draftPosition[1].toFixed(3) : "-"}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 gap-2 border-t border-[var(--color-border-soft)] p-4 pb-[calc(16px_+_env(safe-area-inset-bottom))] lg:pb-4">
        <button
          className="h-11 flex-1 rounded-xl bg-[var(--color-text)] px-3 text-sm font-extrabold text-[var(--color-card-bg)] disabled:cursor-not-allowed disabled:opacity-35"
          disabled={!draftPosition}
          type="submit"
        >
          저장
        </button>
        <button
          className="h-11 rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm font-extrabold text-[var(--color-text)]"
          type="button"
          onClick={onCancel}
        >
          취소
        </button>
      </div>
    </form>
  );
}
