import { Plus } from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";

import { BottomNav } from "@/features/navigation/ui/BottomNav";
import { regionRecords } from "@/features/records/model/regionRecords";
import { selectableRegions } from "@/features/records/model/regions";
import type { CreateRegionRecordInput } from "@/features/records/model/types";
import {
  CreateRecordSheet,
  type CreateRecordFormState,
} from "@/features/records/ui/CreateRecordSheet";
import { KoreaMap } from "@/features/records/ui/KoreaMap";

export function App() {
  const [records, setRecords] = useState(regionRecords);
  const [selectedRegionCode, setSelectedRegionCode] = useState<string | undefined>(
    regionRecords[0]?.regionCode ?? "11010",
  );
  const [mapLevel, setMapLevel] = useState<"korea" | "seoul">("seoul");
  const [selectedRecordId, setSelectedRecordId] = useState<string | undefined>(
    records[0]?.id,
  );
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [draftPosition, setDraftPosition] = useState<[number, number] | undefined>();
  const [formState, setFormState] = useState<CreateRecordFormState>({
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
  const selectedRegion = selectableRegions.find(
    (region) => region.code === selectedRegionCode,
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

    if (!selectedRegion || !draftPosition) {
      return;
    }

    createRecord({
      regionCode: selectedRegion.code,
      regionName: selectedRegion.name,
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
            <CreateRecordSheet
              draftPosition={draftPosition}
              formState={formState}
              selectedRegionName={selectedRegion?.name ?? "지역"}
              onCancel={handleCancelCreateRecord}
              onSubmit={handleCreateRecord}
              onUpdateForm={setFormState}
            />
          ) : null}
        </div>
      </section>
      <BottomNav onCreateRecord={handleOpenCreateForm} />
    </main>
  );
}
