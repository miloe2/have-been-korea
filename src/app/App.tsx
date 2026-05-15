import {
  Bookmark,
  Heart,
  MapPinned,
  MessageCircle,
  Plus,
  Send,
  SquarePen,
  UserRound,
  X,
} from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";

import { regionRecords } from "@/features/records/model/regionRecords";
import { selectableRegions } from "@/features/records/model/regions";
import type { CreateRegionRecordInput } from "@/features/records/model/types";
import { KoreaMap } from "@/features/records/ui/KoreaMap";

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function App() {
  const [records, setRecords] = useState(regionRecords);
  const [selectedRegionCode, setSelectedRegionCode] = useState<string | undefined>("11");
  const [mapLevel, setMapLevel] = useState<"korea" | "seoul">("korea");
  const [selectedRecordId, setSelectedRecordId] = useState<string | undefined>(
    records[0]?.id,
  );
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [draftPosition, setDraftPosition] = useState<[number, number] | undefined>();
  const [formState, setFormState] = useState({
    regionCode: "11040",
    title: "",
    description: "",
    date: new Date().toISOString().slice(0, 10),
    imageUrl: "",
    tags: "",
  });

  const regionRecordCounts = useMemo(
    () =>
      records.reduce<Record<string, number>>((counts, record) => {
        counts[record.regionCode] = (counts[record.regionCode] ?? 0) + 1;
        return counts;
      }, {}),
    [records],
  );

  const handleSelectRegion = (regionCode: string) => {
    setSelectedRegionCode(regionCode);

    if (regionCode === "11") {
      setMapLevel("seoul");
    }

    const nextRecord = records.find(
      (record) =>
        record.regionCode === regionCode ||
        (regionCode.length === 2 && record.regionCode.startsWith(regionCode)),
    );

    if (nextRecord) {
      setSelectedRecordId(nextRecord.id);
    }
  };

  const handleSelectRecord = (recordId: string) => {
    const record = records.find((item) => item.id === recordId);

    setSelectedRecordId(recordId);

    if (record) {
      setSelectedRegionCode(record.regionCode);
    }
  };

  const handleBackToKorea = () => {
    setMapLevel("korea");
    setSelectedRegionCode("11");
  };

  const handleOpenCreateForm = () => {
    setIsPickingLocation(true);
    setIsCreateFormOpen(false);
    setDraftPosition(undefined);
  };

  const handlePickLocation = (position: [number, number]) => {
    setDraftPosition(position);
  };

  const handleConfirmLocation = () => {
    if (!draftPosition) {
      return;
    }

    setIsPickingLocation(false);
    setIsCreateFormOpen(true);
  };

  const handleCancelCreateRecord = () => {
    setIsPickingLocation(false);
    setIsCreateFormOpen(false);
    setDraftPosition(undefined);
  };

  const createRecord = (input: CreateRegionRecordInput) => {
    const record = {
      ...input,
      id: `local-${Date.now()}`,
      sourceLabel: "Upload",
    };

    setRecords((currentRecords) => [record, ...currentRecords]);
    setSelectedRecordId(record.id);
    setSelectedRegionCode(record.regionCode);
    setIsPickingLocation(false);
    setIsCreateFormOpen(false);
    setDraftPosition(undefined);
    setFormState((currentFormState) => ({
      ...currentFormState,
      title: "",
      description: "",
      imageUrl: "",
      tags: "",
    }));
  };

  const handleCreateRecord = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const region = selectableRegions.find(
      (item) => item.code === formState.regionCode,
    );

    if (!region || !draftPosition) {
      return;
    }

    createRecord({
      regionCode: region.code,
      regionName: region.name,
      title: formState.title.trim(),
      description: formState.description.trim(),
      date: formState.date,
      lat: draftPosition[0],
      lng: draftPosition[1],
      imageUrl: formState.imageUrl.trim(),
      tags: formState.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    });
  };

  const selectedRegionName =
    selectableRegions.find((region) => region.code === formState.regionCode)?.name ??
    "지역";

  return (
    <main className="h-[100svh] overflow-hidden text-[var(--color-text)] lg:mx-auto lg:h-auto lg:max-w-6xl lg:overflow-visible lg:px-[18px] lg:pb-[18px] lg:pt-[18px]">
      <header className="mb-[18px] hidden items-center justify-between gap-4 lg:flex">
        <h1 className="m-0 text-[28px] font-extrabold tracking-normal">
          Have Been Korea
        </h1>
        <button
          className="inline-flex h-[42px] items-center gap-2 rounded-xl bg-[var(--color-text)] px-3.5 text-sm font-extrabold text-[var(--color-card-bg)]"
          aria-label="새 기록"
          type="button"
          onClick={handleOpenCreateForm}
        >
          <Plus size={18} strokeWidth={2.4} aria-hidden="true" />
          새 기록
        </button>
      </header>

      <section
        className="grid h-[calc(100svh_-_78px_-_env(safe-area-inset-bottom))] items-stretch lg:h-auto lg:items-start lg:gap-[18px] lg:grid-cols-[360px_minmax(0,1fr)]"
        aria-label="방문 기록"
      >
        <div className="h-full min-h-0 lg:sticky lg:top-[18px]">
          <KoreaMap
            mapLevel={mapLevel}
            selectedRegionCode={selectedRegionCode}
            regionRecordCounts={regionRecordCounts}
            records={records}
            selectedRecordId={selectedRecordId}
            draftPosition={draftPosition}
            isPickingLocation={isPickingLocation || isCreateFormOpen}
            isDraftLocationReady={isPickingLocation && Boolean(draftPosition)}
            onSelectRegion={handleSelectRegion}
            onSelectRecord={handleSelectRecord}
            onPickLocation={handlePickLocation}
            onConfirmLocation={handleConfirmLocation}
            onCancelPickingLocation={handleCancelCreateRecord}
            onBackToKorea={handleBackToKorea}
          />
        </div>

        <div className="contents lg:block lg:columns-1 lg:gap-[18px] xl:columns-2">
          {isCreateFormOpen ? (
            <form
              className="fixed bottom-0 left-0 right-0 z-[1200] flex max-h-[82vh] flex-col overflow-hidden rounded-t-[18px] border border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-[0_-16px_40px_rgba(15,15,15,0.18)] lg:bottom-4 lg:left-auto lg:right-4 lg:top-4 lg:w-[390px] lg:max-h-none lg:rounded-[18px] lg:shadow-[var(--shadow-card)]"
              onSubmit={handleCreateRecord}
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
                  onClick={handleCancelCreateRecord}
                >
                  <X size={17} strokeWidth={2.4} aria-hidden="true" />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-4">
                <label className="mb-3 block">
                  <span className="mb-1.5 block text-xs font-extrabold text-[var(--color-muted)]">
                    지역
                  </span>
                  <select
                    className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm font-bold text-[var(--color-text)]"
                    value={formState.regionCode}
                    onChange={(event) =>
                      setFormState((currentFormState) => ({
                        ...currentFormState,
                        regionCode: event.target.value,
                      }))
                    }
                  >
                    {selectableRegions.map((region) => (
                      <option key={region.code} value={region.code}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="mb-3 block">
                  <span className="mb-1.5 block text-xs font-extrabold text-[var(--color-muted)]">
                    제목
                  </span>
                  <input
                    className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-text)]"
                    required
                    value={formState.title}
                    onChange={(event) =>
                      setFormState((currentFormState) => ({
                        ...currentFormState,
                        title: event.target.value,
                      }))
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
                      setFormState((currentFormState) => ({
                        ...currentFormState,
                        imageUrl: event.target.value,
                      }))
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
                      setFormState((currentFormState) => ({
                        ...currentFormState,
                        description: event.target.value,
                      }))
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
                        setFormState((currentFormState) => ({
                          ...currentFormState,
                          date: event.target.value,
                        }))
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
                        setFormState((currentFormState) => ({
                          ...currentFormState,
                          tags: event.target.value,
                        }))
                      }
                      placeholder="카페, 산책"
                    />
                  </label>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-[var(--color-chip-bg)] px-2.5 py-1.5 text-xs font-bold text-[var(--color-chip-text)]">
                    {selectedRegionName}
                  </span>
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
                  onClick={handleCancelCreateRecord}
                >
                  취소
                </button>
              </div>
            </form>
          ) : null}

          {/* {records.map((record) => (
            <article
              key={record.id}
              className="mb-[18px] inline-block w-full break-inside-avoid overflow-hidden rounded-[18px] border border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-[var(--shadow-card)]"
            >
              <button
                className="block w-full text-left"
                type="button"
                onClick={() => handleSelectRecord(record.id)}
              >
                <div className="flex items-center gap-2.5 p-3">
                  <div className="size-[34px] rounded-full bg-[linear-gradient(135deg,#f7f7f7,#dcdcdc)]" />
                  <div className="min-w-0">
                    <strong className="block truncate text-sm font-bold text-[var(--color-text)]">
                      {record.regionName}
                    </strong>
                    <span className="block text-xs text-[var(--color-muted)]">
                      {dateFormatter.format(new Date(record.date))}
                    </span>
                  </div>
                  <span className="ml-auto rounded-full bg-[var(--color-chip-bg)] px-2.5 py-1.5 text-[11px] font-extrabold text-[var(--color-chip-text)]">
                    {record.sourceLabel ?? "Upload"}
                  </span>
                </div>

                <div
                  className="h-[300px] bg-cover bg-center"
                  style={{ backgroundImage: `url(${record.imageUrl})` }}
                />

                <div className="flex items-center justify-between px-3 pb-0.5 pt-3 text-[var(--color-text)]">
                  <span className="inline-flex items-center gap-3">
                    <Heart size={21} strokeWidth={2.1} aria-hidden="true" />
                    <MessageCircle size={21} strokeWidth={2.1} aria-hidden="true" />
                    <Send size={21} strokeWidth={2.1} aria-hidden="true" />
                  </span>
                  <Bookmark size={21} strokeWidth={2.1} aria-hidden="true" />
                </div>

                <div className="px-3 pb-3.5 pt-2">
                  <strong className="mb-1 block text-base font-bold text-[var(--color-text)]">
                    {record.title}
                  </strong>
                  <p className="m-0 text-sm leading-6 text-[var(--color-subdued)]">
                    {record.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-[var(--color-chip-bg)] px-2.5 py-1.5 text-xs font-bold text-[var(--color-chip-text)]">
                      {record.regionName}
                    </span>
                    <span className="rounded-full bg-[var(--color-chip-bg)] px-2.5 py-1.5 text-xs font-bold text-[var(--color-chip-text)]">
                      lat {record.lat.toFixed(3)}
                    </span>
                    <span className="rounded-full bg-[var(--color-chip-bg)] px-2.5 py-1.5 text-xs font-bold text-[var(--color-chip-text)]">
                      lng {record.lng.toFixed(3)}
                    </span>
                  </div>
                </div>
              </button>
            </article>
          ))} */}
        </div>
      </section>
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
            지도
          </button>
          <button
            className="grid min-h-14 place-items-center gap-1 rounded-xl bg-[var(--color-text)] text-xs font-extrabold text-[var(--color-card-bg)]"
            type="button"
            onClick={handleOpenCreateForm}
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
    </main>
  );
}
