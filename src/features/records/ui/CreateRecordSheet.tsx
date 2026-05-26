import { ImagePlus, Instagram, MapPinned, Search, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState, type SubmitEventHandler } from "react";

import {
  createGooglePlacesSessionToken,
  fetchGooglePlaceSnapshot,
  fetchGooglePlaceSuggestions,
  type GooglePlaceSuggestion,
  type GooglePlacesSessionToken,
} from "@/features/records/model/googlePlaces";
import type {
  GooglePlaceSnapshot,
  RecordSourceType,
} from "@/features/records/model/types";

export type CreateRecordFormState = {
  sourceType: RecordSourceType;
  title: string;
  googlePlace?: GooglePlaceSnapshot;
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
  onSelectGooglePlace: (googlePlace: GooglePlaceSnapshot) => void;
  onSubmit: SubmitEventHandler<HTMLFormElement>;
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
  onSelectGooglePlace,
  onSubmit,
  onUpdateForm,
}: CreateRecordSheetProps) {
  const sessionTokenRef = useRef<GooglePlacesSessionToken | undefined>(
    undefined,
  );
  const [placeSuggestions, setPlaceSuggestions] = useState<
    GooglePlaceSuggestion[]
  >([]);
  const [placeSearchStatus, setPlaceSearchStatus] = useState<
    "idle" | "loading" | "error"
  >("idle");
  const [placeSearchMessage, setPlaceSearchMessage] = useState("");
  const hasPhoto = Boolean(
    formState.photoPreviewUrl || formState.imageUrl.trim(),
  );
  const selectedGooglePlace = formState.googlePlace;

  useEffect(() => {
    const query = formState.title.trim();

    if (formState.sourceType !== "google") {
      setPlaceSuggestions([]);
      setPlaceSearchStatus("idle");
      setPlaceSearchMessage("");
      return;
    }

    if (
      selectedGooglePlace &&
      query === selectedGooglePlace.placeName.trim()
    ) {
      setPlaceSuggestions([]);
      setPlaceSearchStatus("idle");
      setPlaceSearchMessage("");
      return;
    }

    if (query.length < 2) {
      setPlaceSuggestions([]);
      setPlaceSearchStatus("idle");
      setPlaceSearchMessage("");
      return;
    }

    let isActive = true;
    const timeoutId = window.setTimeout(() => {
      setPlaceSearchStatus("loading");
      setPlaceSearchMessage("");

      void (async () => {
        try {
          if (!sessionTokenRef.current) {
            sessionTokenRef.current = await createGooglePlacesSessionToken();
          }

          const suggestions = await fetchGooglePlaceSuggestions(
            query,
            sessionTokenRef.current,
          );

          if (!isActive) {
            return;
          }

          setPlaceSuggestions(suggestions);
          setPlaceSearchStatus("idle");
          setPlaceSearchMessage(
            suggestions.length > 0 ? "" : "검색 결과가 없습니다.",
          );
        } catch (error) {
          if (!isActive) {
            return;
          }

          setPlaceSuggestions([]);
          setPlaceSearchStatus("error");
          setPlaceSearchMessage(
            error instanceof Error
              ? error.message
              : "장소 검색에 실패했습니다.",
          );
        }
      })();
    }, 250);

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
    };
  }, [formState.sourceType, formState.title, selectedGooglePlace]);

  const handleSelectPlaceSuggestion = async (
    suggestion: GooglePlaceSuggestion,
  ) => {
    setPlaceSearchStatus("loading");
    setPlaceSearchMessage("");

    try {
      const googlePlace = await fetchGooglePlaceSnapshot(suggestion);

      onSelectGooglePlace(googlePlace);
      setPlaceSuggestions([]);
      setPlaceSearchStatus("idle");
      setPlaceSearchMessage("");
      sessionTokenRef.current = undefined;
    } catch (error) {
      setPlaceSearchStatus("error");
      setPlaceSearchMessage(
        error instanceof Error
          ? error.message
          : "장소 상세 정보를 가져오지 못했습니다.",
      );
    }
  };

  return (
    <form
      className="hbk-surface hbk-card-shadow hbk-create-sheet fixed bottom-0 left-0 right-0 flex flex-col overflow-hidden rounded-t-2xl lg:bottom-4 lg:left-auto lg:right-4 lg:top-4 lg:w-96 lg:max-h-none lg:rounded-2xl"
      onSubmit={onSubmit}
    >
      <div className="hbk-soft-border flex shrink-0 items-start justify-between gap-3 border-b p-4">
        <div>
          <strong className="hbk-text block text-lg font-extrabold">
            새 기록
          </strong>
          <p className="hbk-muted mt-1 text-sm">
            지도에서 위치를 클릭한 뒤 기록을 저장하세요.
          </p>
        </div>
        <button
          className="hbk-surface grid size-9 shrink-0 place-items-center rounded-full"
          type="button"
          aria-label="새 기록 닫기"
          onClick={onCancel}
        >
          <X size={17} strokeWidth={2.4} aria-hidden="true" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <div className="mb-3">
          <span className="hbk-muted mb-2 block text-xs font-extrabold">
            지역
          </span>
          <span className="hbk-chip flex h-11 items-center rounded-xl px-3 text-sm font-bold">
            {selectedRegionName}
          </span>
        </div>

        <div className="mb-3">
          <span className="hbk-muted mb-2 block text-xs font-extrabold">
            타입
          </span>
          <div className="grid grid-cols-3 gap-2">
            {sourceOptions.map(({ label, type, Icon }) => {
              const isSelected = formState.sourceType === type;

              return (
                <button
                  key={type}
                  className={`flex h-11 items-center justify-center gap-2 rounded-xl px-2 text-xs font-extrabold ${
                    isSelected
                      ? "bg-neutral-950 text-white"
                      : "hbk-surface"
                  }`}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() =>
                    onUpdateForm({
                      ...formState,
                      sourceType: type,
                      googlePlace:
                        type === "google" ? formState.googlePlace : undefined,
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

        <div className="mb-3">
          <span className="hbk-muted mb-2 block text-xs font-extrabold">
            장소
          </span>
          <div className="relative">
            <input
              className="hbk-surface h-11 w-full rounded-xl px-3 text-sm"
              required
              value={formState.title}
              onChange={(event) =>
                onUpdateForm({
                  ...formState,
                  title: event.target.value,
                  googlePlace: undefined,
                })
              }
              placeholder="성수 카페골목"
            />
            {placeSuggestions.length > 0 ? (
              <div className="hbk-panel hbk-panel-shadow absolute left-0 right-0 top-12 z-[1400] overflow-hidden rounded-xl">
                {placeSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.placeId}
                    className="hbk-soft-border block w-full border-b px-3 py-2 text-left last:border-b-0"
                    type="button"
                    onClick={() => void handleSelectPlaceSuggestion(suggestion)}
                  >
                    <span className="hbk-text block truncate text-sm font-extrabold">
                      {suggestion.text}
                    </span>
                    {suggestion.secondaryText ? (
                      <span className="hbk-muted mt-0.5 block truncate text-xs">
                        {suggestion.secondaryText}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          {placeSearchStatus === "loading" ? (
            <p className="hbk-muted mt-2 text-xs font-bold">장소 검색 중...</p>
          ) : placeSearchMessage ? (
            <p
              className={`mt-2 text-xs font-bold ${
                placeSearchStatus === "error"
                  ? "text-red-600"
                  : "hbk-muted"
              }`}
            >
              {placeSearchMessage}
            </p>
          ) : null}
          {selectedGooglePlace ? (
            <div className="hbk-chip mt-2 rounded-xl px-3 py-2 text-xs font-bold">
              <p className="hbk-text truncate">{selectedGooglePlace.placeName}</p>
              <p className="hbk-muted mt-1 truncate">
                {selectedGooglePlace.placeAddress}
              </p>
              <p className="hbk-muted mt-1">
                평점 {selectedGooglePlace.placeRating ?? "-"} · 리뷰{" "}
                {selectedGooglePlace.placeReviewCount ?? "-"}
              </p>
            </div>
          ) : null}
        </div>

        <div className="mb-3">
          <span className="hbk-muted mb-2 block text-xs font-extrabold">
            사진
          </span>
          {formState.photoPreviewUrl || formState.imageUrl ? (
            <div className="hbk-chip mb-2 overflow-hidden rounded-xl">
              <img
                className="aspect-square w-full object-cover"
                src={formState.photoPreviewUrl || formState.imageUrl}
                alt=""
              />
            </div>
          ) : null}
          <label className="hbk-surface mb-2 flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border-dashed px-3 text-sm font-extrabold">
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
                className="hbk-surface grid size-11 shrink-0 place-items-center rounded-xl"
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
          <span className="hbk-muted mb-2 block text-xs font-extrabold">
            메모
          </span>
          <textarea
            className="hbk-surface min-h-24 w-full resize-none rounded-xl px-3 py-3 text-sm leading-6"
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
            <span className="hbk-muted mb-2 block text-xs font-extrabold">
              날짜
            </span>
            <input
              className="hbk-surface h-11 w-full rounded-xl px-3 text-sm"
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
            <span className="hbk-muted mb-2 block text-xs font-extrabold">
              태그
            </span>
            <input
              className="hbk-surface h-11 w-full rounded-xl px-3 text-sm"
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

        <div className="flex flex-wrap gap-2">
          <span className="hbk-chip rounded-full px-3 py-2 text-xs font-bold">
            lat {draftPosition ? draftPosition[0].toFixed(3) : "-"}
          </span>
          <span className="hbk-chip rounded-full px-3 py-2 text-xs font-bold">
            lng {draftPosition ? draftPosition[1].toFixed(3) : "-"}
          </span>
        </div>
      </div>

      <div className="hbk-soft-border hbk-safe-footer flex shrink-0 gap-2 border-t p-4 lg:pb-4">
        <button
          className="hbk-surface h-11 rounded-xl px-3 text-sm font-extrabold disabled:cursor-not-allowed disabled:opacity-35"
          disabled={!canPreview}
          type="button"
          onClick={onPreview}
        >
          미리보기
        </button>
        <button
          className="h-11 flex-1 rounded-xl bg-neutral-950 px-3 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-35"
          disabled={
            !draftPosition ||
            !hasPhoto ||
            !formState.title.trim() ||
            !formState.googlePlace
          }
          type="submit"
        >
          저장
        </button>
        <button
          className="hbk-surface h-11 rounded-xl px-3 text-sm font-extrabold"
          type="button"
          onClick={onCancel}
        >
          취소
        </button>
      </div>
    </form>
  );
}
