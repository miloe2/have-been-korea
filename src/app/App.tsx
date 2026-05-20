import { Plus } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { BottomNav, type AppTab } from "@/features/navigation/ui/BottomNav";
import type { LandmarkTopic } from "@/features/records/model/landmarkTopics";
import { regionRecords } from "@/features/records/model/regionRecords";
import { selectableRegions } from "@/features/records/model/regions";
import type {
  CreateRegionRecordInput,
  RegionRecord,
} from "@/features/records/model/types";
import {
  CreateRecordSheet,
  type CreateRecordFormState,
} from "@/features/records/ui/CreateRecordSheet";
import { GoogleFeedCard } from "@/features/records/ui/GoogleFeedCard";
import { KoreaMap } from "@/features/records/ui/KoreaMap";
import { FeedScreen } from "@/screens/FeedScreen";

const sourceLabelByType = {
  google: "Google",
  naver: "Naver",
  instagram: "Instagram",
} as const;

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
  const [isCreatePreviewOpen, setIsCreatePreviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AppTab>("map");
  const [draftPosition, setDraftPosition] = useState<[number, number] | undefined>();
  const [formState, setFormState] = useState<CreateRecordFormState>({
    sourceType: "google",
    title: "",
    description: "",
    date: new Date().toISOString().slice(0, 10),
    imageUrl: "",
    photoPreviewUrl: "",
    tags: "",
  });
  const activePhotoPreviewUrlRef = useRef("");
  const savedObjectUrlsRef = useRef(new Set<string>());

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
  const createPreviewImageUrl =
    formState.photoPreviewUrl || formState.imageUrl.trim();
  const createPreviewTitle = formState.title.trim();
  const createPreviewDate =
    formState.date || new Date().toISOString().slice(0, 10);
  const createPreviewTags = formState.tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const createPreviewRecord: RegionRecord | undefined =
    selectedRegion &&
    draftPosition &&
    createPreviewImageUrl &&
    createPreviewTitle
      ? {
          id: "create-preview",
          regionCode: selectedRegion.code,
          regionName: selectedRegion.name,
          title: createPreviewTitle,
          description: formState.description.trim() || "아직 메모가 없습니다.",
          date: createPreviewDate,
          lat: draftPosition[0],
          lng: draftPosition[1],
          imageUrl: createPreviewImageUrl,
          sourceType: formState.sourceType,
          sourceLabel: sourceLabelByType[formState.sourceType],
          tags: createPreviewTags,
        }
      : undefined;

  useEffect(
    () => () => {
      if (activePhotoPreviewUrlRef.current) {
        URL.revokeObjectURL(activePhotoPreviewUrlRef.current);
      }

      savedObjectUrlsRef.current.forEach((objectUrl) => {
        URL.revokeObjectURL(objectUrl);
      });
    },
    [],
  );

  const updateFormState = (nextFormState: CreateRecordFormState) => {
    setFormState((currentFormState) => {
      if (
        currentFormState.photoPreviewUrl &&
        currentFormState.photoPreviewUrl !== nextFormState.photoPreviewUrl
      ) {
        URL.revokeObjectURL(currentFormState.photoPreviewUrl);
      }

      activePhotoPreviewUrlRef.current = nextFormState.photoPreviewUrl;

      return nextFormState;
    });
  };

  const resetCreateForm = ({ keepPhotoPreview = false } = {}) => {
    setFormState((currentFormState) => {
      if (currentFormState.photoPreviewUrl && !keepPhotoPreview) {
        URL.revokeObjectURL(currentFormState.photoPreviewUrl);
      }

      activePhotoPreviewUrlRef.current = "";

      return {
        ...currentFormState,
        title: "",
        description: "",
        imageUrl: "",
        photoFile: undefined,
        photoPreviewUrl: "",
        tags: "",
      };
    });
  };

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
      setMapLevel(record.regionCode.startsWith("11") ? "seoul" : "korea");
      setActiveTab("map");
    }
  };

  const handleBackToKorea = () => {
    setMapLevel("korea");
    setSelectedRegionCode("11");
  };

  const handleOpenCreateForm = () => {
    setIsPickingLocation(true);
    setIsCreateFormOpen(false);
    setIsCreatePreviewOpen(false);
    setActiveTab("map");
    setDraftPosition(undefined);
  };

  const handleSelectTab = (tab: AppTab) => {
    setActiveTab(tab);
    setIsCreatePreviewOpen(false);

    if (tab !== "map") {
      setIsPickingLocation(false);
      setIsCreateFormOpen(false);
      setDraftPosition(undefined);
      resetCreateForm();
    }
  };

  const handlePickLocation = (position: [number, number]) => {
    setDraftPosition(position);
  };

  const handleSelectLandmarkTopic = (landmarkTopic: LandmarkTopic) => {
    setSelectedRegionCode(landmarkTopic.regionCode);
    setDraftPosition([landmarkTopic.lat, landmarkTopic.lng]);
    setIsPickingLocation(true);
    setIsCreateFormOpen(false);
    setIsCreatePreviewOpen(false);
    setActiveTab("map");
    setFormState((currentFormState) => {
      if (currentFormState.photoPreviewUrl) {
        URL.revokeObjectURL(currentFormState.photoPreviewUrl);
      }

      activePhotoPreviewUrlRef.current = "";

      return {
        ...currentFormState,
        title: landmarkTopic.title,
        sourceType: "google",
        description: "",
        imageUrl: "",
        photoFile: undefined,
        photoPreviewUrl: "",
        tags: "",
      };
    });
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
    setIsCreatePreviewOpen(false);
    setDraftPosition(undefined);
    resetCreateForm();
  };

  const createRecord = (input: CreateRegionRecordInput) => {
    const record = {
      ...input,
      id: `local-${Date.now()}`,
      sourceLabel: sourceLabelByType[input.sourceType],
    };

    if (formState.photoPreviewUrl) {
      savedObjectUrlsRef.current.add(formState.photoPreviewUrl);
    }

    setRecords((currentRecords) => [record, ...currentRecords]);
    setSelectedRecordId(record.id);
    setSelectedRegionCode(record.regionCode);
    setIsPickingLocation(false);
    setIsCreateFormOpen(false);
    setIsCreatePreviewOpen(false);
    setDraftPosition(undefined);
    resetCreateForm({ keepPhotoPreview: Boolean(formState.photoPreviewUrl) });
  };

  const handleCreateRecord = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const imageUrl =
      formState.photoPreviewUrl || formState.imageUrl.trim();
    const title = formState.title.trim();

    if (!selectedRegion || !draftPosition || !imageUrl || !title) {
      return;
    }

    createRecord({
      regionCode: selectedRegion.code,
      regionName: selectedRegion.name,
      title,
      description: formState.description.trim(),
      date: formState.date || new Date().toISOString().slice(0, 10),
      lat: draftPosition[0],
      lng: draftPosition[1],
      imageUrl,
      sourceType: formState.sourceType,
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

      {activeTab === "feed" ? (
        <FeedScreen records={records} onSelectRecord={handleSelectRecord} />
      ) : activeTab === "profile" ? (
        <section className="h-[calc(100svh_-_78px)] px-4 py-4">
          <div className="rounded-lg border border-[var(--color-border)] bg-white p-5">
            <h2 className="text-xl font-extrabold text-[var(--color-text)]">
              내 정보
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
              로그인과 사용자별 기록은 TODO Later 단계입니다.
            </p>
          </div>
        </section>
      ) : (
        <section
          className="grid h-[calc(100svh_-_78px)] items-stretch lg:h-auto lg:items-start lg:gap-[18px] lg:grid-cols-[360px_minmax(0,1fr)]"
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
              isDraftLocationReady={Boolean(draftPosition) && !isCreateFormOpen}
              onSelectRegion={handleSelectRegion}
              onSelectRecord={handleSelectRecord}
              onPickLocation={handlePickLocation}
              onSelectLandmarkTopic={handleSelectLandmarkTopic}
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
                canPreview={Boolean(createPreviewRecord)}
                onCancel={handleCancelCreateRecord}
                onPreview={() => setIsCreatePreviewOpen(true)}
                onSubmit={handleCreateRecord}
                onUpdateForm={updateFormState}
              />
            ) : null}
          </div>
        </section>
      )}
      {isCreatePreviewOpen && createPreviewRecord ? (
        <div className="fixed inset-0 z-[1300]">
          <div className="absolute inset-0">
            <GoogleFeedCard
              record={createPreviewRecord}
              onClose={() => setIsCreatePreviewOpen(false)}
            />
          </div>
        </div>
      ) : null}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onCreateRecord={handleOpenCreateForm}
      />
    </main>
  );
}
