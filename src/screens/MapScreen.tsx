import {
  type Dispatch,
  type SetStateAction,
  type SubmitEventHandler,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { LandmarkTopic } from "@/features/records/model/landmarkTopics";
import provinceGeoJson from "@/features/records/data/skorea-provinces.geo.json";
import seoulDistrictGeoJson from "@/features/records/data/seoul-districts.geo.json";
import { regionRecords } from "@/features/records/model/regionRecords";
import { selectableRegions } from "@/features/records/model/regions";
import type {
  CreateRegionRecordInput,
  GooglePlaceSnapshot,
  RegionRecord,
} from "@/features/records/model/types";
import {
  CreateRecordSheet,
  type CreateRecordFormState,
} from "@/features/records/ui/CreateRecordSheet";
import { GoogleFeedCard } from "@/features/records/ui/GoogleFeedCard";
import { KoreaMap } from "@/features/records/ui/KoreaMap";

const sourceLabelByType = {
  google: "Google",
  naver: "Naver",
  instagram: "Instagram",
} as const;

type DraftLocationSource = "map" | "landmark";
type GeoJsonPosition = [number, number];
type GeoJsonPolygon = GeoJsonPosition[][];
type GeoJsonMultiPolygon = GeoJsonPolygon[];
type RegionFeature = {
  properties: {
    code: string;
  };
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: GeoJsonPolygon | GeoJsonMultiPolygon;
  };
};

type MapScreenProps = {
  records: RegionRecord[];
  selectedRecordId: string | undefined;
  shouldStartCreateRecord: boolean;
  onSelectRecord: (recordId: string) => void;
  onStartCreateRecordHandled: () => void;
  setRecords: Dispatch<SetStateAction<RegionRecord[]>>;
};

const regionFeatures = [
  ...(seoulDistrictGeoJson.features as unknown as RegionFeature[]),
  ...(provinceGeoJson.features as unknown as RegionFeature[]),
];

function isPointInRing(
  [pointLng, pointLat]: GeoJsonPosition,
  ring: GeoJsonPosition[],
) {
  let isInside = false;

  for (let index = 0, prevIndex = ring.length - 1; index < ring.length; prevIndex = index++) {
    const [lng, lat] = ring[index];
    const [prevLng, prevLat] = ring[prevIndex];
    const intersects =
      lat > pointLat !== prevLat > pointLat &&
      pointLng <
        ((prevLng - lng) * (pointLat - lat)) / (prevLat - lat) + lng;

    if (intersects) {
      isInside = !isInside;
    }
  }

  return isInside;
}

function getFeaturePolygons(feature: RegionFeature) {
  if (feature.geometry.type === "Polygon") {
    return [feature.geometry.coordinates as GeoJsonPolygon];
  }

  return feature.geometry.coordinates as GeoJsonMultiPolygon;
}

function findRegionCodeByPosition(lat: number, lng: number) {
  const point: GeoJsonPosition = [lng, lat];

  return regionFeatures.find((feature) =>
    getFeaturePolygons(feature).some((polygon) => {
      if (!isPointInRing(point, polygon[0])) {
        return false;
      }

      return polygon.slice(1).every((hole) => !isPointInRing(point, hole));
    }),
  )?.properties.code;
}

export function MapScreen({
  records,
  selectedRecordId,
  shouldStartCreateRecord,
  onSelectRecord,
  onStartCreateRecordHandled,
  setRecords,
}: MapScreenProps) {
  const selectedRecord = records.find(
    (record) => record.id === selectedRecordId,
  );
  const [selectedRegionCode, setSelectedRegionCode] = useState<
    string | undefined
  >(selectedRecord?.regionCode ?? regionRecords[0]?.regionCode ?? "11010");
  const [mapLevel, setMapLevel] = useState<"korea" | "seoul">(
    selectedRecord && !selectedRecord.regionCode.startsWith("11")
      ? "korea"
      : "seoul",
  );
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [isCreatePreviewOpen, setIsCreatePreviewOpen] = useState(false);
  const [draftPosition, setDraftPosition] = useState<
    [number, number] | undefined
  >();
  const [draftLocationSource, setDraftLocationSource] =
    useState<DraftLocationSource>("map");
  const [formState, setFormState] = useState<CreateRecordFormState>({
    sourceType: "google",
    title: "",
    googlePlace: undefined,
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
    createPreviewTitle &&
    formState.googlePlace
      ? {
          id: "create-preview",
          regionCode: selectedRegion.code,
          regionName: selectedRegion.name,
          title: createPreviewTitle,
          description: formState.description.trim(),
          date: createPreviewDate,
          lat: draftPosition[0],
          lng: draftPosition[1],
          imageUrl: createPreviewImageUrl,
          sourceType: formState.sourceType,
          sourceLabel: sourceLabelByType[formState.sourceType],
          tags: createPreviewTags,
          ...formState.googlePlace,
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

  useEffect(() => {
    if (!selectedRecord) {
      return;
    }

    setSelectedRegionCode(selectedRecord.regionCode);
    setMapLevel(selectedRecord.regionCode.startsWith("11") ? "seoul" : "korea");
  }, [selectedRecord]);

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
        googlePlace: undefined,
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
      onSelectRecord(nextRecord.id);
    }
  };

  const handleSelectRecord = (recordId: string) => {
    const record = records.find((item) => item.id === recordId);

    onSelectRecord(recordId);

    if (record) {
      setSelectedRegionCode(record.regionCode);
      setMapLevel(record.regionCode.startsWith("11") ? "seoul" : "korea");
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
    setDraftPosition(undefined);
    setDraftLocationSource("map");
  };

  useEffect(() => {
    if (!shouldStartCreateRecord) {
      return;
    }

    handleOpenCreateForm();
    onStartCreateRecordHandled();
  }, [shouldStartCreateRecord]);

  const handlePickLocation = (position: [number, number]) => {
    setDraftPosition(position);
    setDraftLocationSource("map");
  };

  const handleSelectLandmarkTopic = (landmarkTopic: LandmarkTopic) => {
    setSelectedRegionCode(landmarkTopic.regionCode);
    setDraftPosition([landmarkTopic.lat, landmarkTopic.lng]);
    setDraftLocationSource("landmark");
    setIsPickingLocation(true);
    setIsCreateFormOpen(false);
    setIsCreatePreviewOpen(false);
    setFormState((currentFormState) => {
      if (currentFormState.photoPreviewUrl) {
        URL.revokeObjectURL(currentFormState.photoPreviewUrl);
      }

      activePhotoPreviewUrlRef.current = "";

      return {
        ...currentFormState,
        title: landmarkTopic.title,
        googlePlace: undefined,
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
    setDraftLocationSource("map");
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
    onSelectRecord(record.id);
    setSelectedRegionCode(record.regionCode);
    setIsPickingLocation(false);
    setIsCreateFormOpen(false);
    setIsCreatePreviewOpen(false);
    setDraftPosition(undefined);
    setDraftLocationSource("map");
    resetCreateForm({ keepPhotoPreview: Boolean(formState.photoPreviewUrl) });
  };

  const updateGooglePlaceDraft = (googlePlace: GooglePlaceSnapshot) => {
    const regionCode = findRegionCodeByPosition(
      googlePlace.placeLat,
      googlePlace.placeLng,
    );

    setDraftPosition([googlePlace.placeLat, googlePlace.placeLng]);
    setDraftLocationSource("map");
    if (regionCode) {
      setSelectedRegionCode(regionCode);
      setMapLevel(regionCode.startsWith("11") ? "seoul" : "korea");
    }
    setFormState((currentFormState) => ({
      ...currentFormState,
      title: googlePlace.placeName,
      sourceType: "google",
      googlePlace,
    }));
  };

  const handleSelectMapGooglePlace = (googlePlace: GooglePlaceSnapshot) => {
    updateGooglePlaceDraft(googlePlace);
    setIsPickingLocation(true);
    setIsCreateFormOpen(false);
    setIsCreatePreviewOpen(false);
  };

  const handleSelectFormGooglePlace = (googlePlace: GooglePlaceSnapshot) => {
    updateGooglePlaceDraft(googlePlace);
  };

  const handleCreateRecord: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    const imageUrl = formState.photoPreviewUrl || formState.imageUrl.trim();
    const title = formState.title.trim();

    if (
      !selectedRegion ||
      !draftPosition ||
      !imageUrl ||
      !title ||
      !formState.googlePlace
    ) {
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
      ...formState.googlePlace,
      tags: formState.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    });
  };

  return (
    <>
      <section
        className="grid h-[calc(100svh_-_56px)] items-stretch lg:h-auto lg:items-start lg:gap-4 lg:grid-cols-[360px_minmax(0,1fr)]"
        aria-label="방문 기록"
      >
        <div className="h-full min-h-0 lg:sticky lg:top-4">
          <KoreaMap
            mapLevel={mapLevel}
            selectedRegionCode={selectedRegionCode}
            regionRecordCounts={regionRecordCounts}
            records={records}
            selectedRecordId={selectedRecordId}
            draftPosition={draftPosition}
            shouldShowDraftMarker={draftLocationSource === "map"}
            isPickingLocation={isPickingLocation || isCreateFormOpen}
            isDraftLocationReady={Boolean(draftPosition) && !isCreateFormOpen}
            onSelectRegion={handleSelectRegion}
            onSelectRecord={handleSelectRecord}
            onPickLocation={handlePickLocation}
            onSelectGooglePlace={handleSelectMapGooglePlace}
            onSelectLandmarkTopic={handleSelectLandmarkTopic}
            onConfirmLocation={handleConfirmLocation}
            onCancelPickingLocation={handleCancelCreateRecord}
            onBackToKorea={handleBackToKorea}
          />
        </div>

        <div className="contents lg:block lg:columns-1 lg:gap-4 xl:columns-2">
          {isCreateFormOpen ? (
            <CreateRecordSheet
              draftPosition={draftPosition}
              formState={formState}
              selectedRegionName={selectedRegion?.name ?? "지역"}
              canPreview={Boolean(createPreviewRecord)}
              onCancel={handleCancelCreateRecord}
              onPreview={() => setIsCreatePreviewOpen(true)}
              onSelectGooglePlace={handleSelectFormGooglePlace}
              onSubmit={handleCreateRecord}
              onUpdateForm={updateFormState}
            />
          ) : null}
        </div>
      </section>
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
    </>
  );
}
