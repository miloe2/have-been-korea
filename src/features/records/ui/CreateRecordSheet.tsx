import { ImagePlus, Instagram, MapPinned, Search, Trash2, X } from "lucide-react";
import type { FormEventHandler } from "react";

import type { RecordSourceType } from "@/features/records/model/types";

export type CreateRecordFormState = {
  sourceType: RecordSourceType;
  title: string;
  description: string;
  date: string;
  imageUrl: string;
  photoFile?: File;
  photoPreviewUrl: string;
  tags: string;
};

type CreateRecordSheetProps = {
  draftPosition: [number, number] | undefined;
  formState: CreateRecordFormState;
  selectedRegionName: string;
  canPreview: boolean;
  onCancel: () => void;
  onPreview: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onUpdateForm: (formState: CreateRecordFormState) => void;
};

const sourceOptions: {
  label: string;
  type: RecordSourceType;
  Icon: typeof Search;
}[] = [
  { label: "Google", type: "google", Icon: Search },
  { label: "Naver", type: "naver", Icon: MapPinned },
  { label: "Insta", type: "instagram", Icon: Instagram },
];

export function CreateRecordSheet({
  draftPosition,
  formState,
  selectedRegionName,
  canPreview,
  onCancel,
  onPreview,
  onSubmit,
  onUpdateForm,
}: CreateRecordSheetProps) {
  const hasPhoto = Boolean(
    formState.photoPreviewUrl || formState.imageUrl.trim(),
  );

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

        <div className="mb-3">
          <span className="mb-1.5 block text-xs font-extrabold text-[var(--color-muted)]">
            타입
          </span>
          <div className="grid grid-cols-3 gap-2">
            {sourceOptions.map(({ label, type, Icon }) => {
              const isSelected = formState.sourceType === type;

              return (
                <button
                  key={type}
                  className={`flex h-11 items-center justify-center gap-1.5 rounded-xl border px-2 text-xs font-extrabold ${
                    isSelected
                      ? "border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-card-bg)]"
                      : "border-[var(--color-border)] bg-white text-[var(--color-text)]"
                  }`}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() =>
                    onUpdateForm({
                      ...formState,
                      sourceType: type,
                    })
                  }
                >
                  <Icon size={15} strokeWidth={2.4} aria-hidden="true" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <label className="mb-3 block">
          <span className="mb-1.5 block text-xs font-extrabold text-[var(--color-muted)]">
            장소
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
            placeholder="성수 카페골목"
          />
        </label>

        <div className="mb-3">
          <span className="mb-1.5 block text-xs font-extrabold text-[var(--color-muted)]">
            사진
          </span>
          {formState.photoPreviewUrl || formState.imageUrl ? (
            <div className="mb-2 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-chip-bg)]">
              <img
                className=" aspect-square w-full object-cover"
                src={formState.photoPreviewUrl || formState.imageUrl}
                alt=""
              />
            </div>
          ) : null}
          <label className="mb-2 flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--color-border)] bg-white px-3 text-sm font-extrabold text-[var(--color-text)]">
            <ImagePlus size={17} strokeWidth={2.4} aria-hidden="true" />
            사진 파일 선택
            <input
              className="sr-only"
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (!file) {
                  return;
                }

                onUpdateForm({
                  ...formState,
                  imageUrl: "",
                  photoFile: file,
                  photoPreviewUrl: URL.createObjectURL(file),
                });
                event.target.value = "";
              }}
            />
          </label>
          <div className="flex gap-2">
            {hasPhoto ? (
              <button
                className="grid size-11 shrink-0 place-items-center rounded-xl border border-[var(--color-border)] bg-white text-[var(--color-text)]"
                type="button"
                aria-label="사진 제거"
                onClick={() =>
                  onUpdateForm({
                    ...formState,
                    imageUrl: "",
                    photoFile: undefined,
                    photoPreviewUrl: "",
                  })
                }
              >
                <Trash2 size={16} strokeWidth={2.4} aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </div>

        <label className="mb-3 block">
          <span className="mb-1.5 block text-xs font-extrabold text-[var(--color-muted)]">
            메모
          </span>
          <textarea
            className="min-h-24 w-full resize-none rounded-xl border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm leading-6 text-[var(--color-text)]"
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
          className="h-11 rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm font-extrabold text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-35"
          disabled={!canPreview}
          type="button"
          onClick={onPreview}
        >
          미리보기
        </button>
        <button
          className="h-11 flex-1 rounded-xl bg-[var(--color-text)] px-3 text-sm font-extrabold text-[var(--color-card-bg)] disabled:cursor-not-allowed disabled:opacity-35"
          disabled={!draftPosition || !hasPhoto || !formState.title.trim()}
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
