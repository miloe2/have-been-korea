import { ArrowLeft, Search } from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";
import {
  GeoJSON,
  MapContainer,
  Marker,
  Pane,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type { GeoJsonObject } from "geojson";
import type { LeafletMouseEvent } from "leaflet";
import type { LatLngBoundsExpression, Layer, PathOptions } from "leaflet";

import provinceGeoJson from "@/features/records/data/skorea-provinces.geo.json";
import seoulDistrictGeoJson from "@/features/records/data/seoul-districts.geo.json";
import {
  landmarkTopics,
  type LandmarkTopic,
} from "@/features/records/model/landmarkTopics";
import {
  createGooglePlacesSessionToken,
  fetchGooglePlaceSnapshot,
  fetchGooglePlaceSuggestions,
  type GooglePlaceSuggestion,
  type GooglePlacesSessionToken,
} from "@/features/records/model/googlePlaces";
import type {
  GooglePlaceSnapshot,
  RegionRecord,
} from "@/features/records/model/types";
import { GoogleFeedCard } from "@/features/records/ui/GoogleFeedCard";
import {
  MARKER_PANE_Z_INDEX,
  createClusterIcon,
  createDraftIcon,
  createLandmarkIcon,
  createRecordIcon,
} from "@/features/records/ui/mapMarkers";

type KoreaMapProps = {
  mapLevel: "korea" | "seoul";
  selectedRegionCode: string | undefined;
  regionRecordCounts: Record<string, number>;
  records: RegionRecord[];
  selectedRecordId: string | undefined;
  draftPosition: [number, number] | undefined;
  shouldShowDraftMarker: boolean;
  isPickingLocation: boolean;
  isDraftLocationReady: boolean;
  onSelectRegion: (regionCode: string) => void;
  onSelectRecord: (recordId: string) => void;
  onPickLocation: (position: [number, number]) => void;
  onSelectGooglePlace: (googlePlace: GooglePlaceSnapshot) => void;
  onSelectLandmarkTopic: (landmarkTopic: LandmarkTopic) => void;
  onConfirmLocation: () => void;
  onCancelPickingLocation: () => void;
  onBackToKorea: () => void;
};

type Position = [number, number];
type PolygonCoordinates = Position[][];
type MultiPolygonCoordinates = PolygonCoordinates[];

type ProvinceFeature = {
  type: "Feature";
  properties: {
    code: string;
    name: string;
    name_eng: string;
  };
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: PolygonCoordinates | MultiPolygonCoordinates;
  };
};

type MapFeature = ProvinceFeature & {
  properties: ProvinceFeature["properties"];
};
type StyledLayer = Layer & {
  bringToFront: () => void;
  setStyle: (style: PathOptions) => void;
};

const KOREA_CENTER: [number, number] = [36.35, 127.85];
const KOREA_BOUNDS: LatLngBoundsExpression = [
  [33.0, 124.4],
  [38.8, 132.1],
];
const KOREA_DEFAULT_PAN_OFFSET: [number, number] = [0, 0];
const SELECTED_STYLE: PathOptions = {
  color: "#0f766e",
  fillColor: "#14b8a6",
  fillOpacity: 0.3,
  opacity: 1,
  weight: 2.4,
};
const RECORDED_STYLE: PathOptions = {
  color: "#0f766e",
  fillColor: "#14b8a6",
  fillOpacity: 0.42,
  opacity: 0.95,
  weight: 2,
};
const DEFAULT_STYLE: PathOptions = {
  color: "#7b7b7b",
  fillColor: "#f2f2f2",
  fillOpacity: 0.24,
  opacity: 0.7,
  weight: 1.3,
};
const HOVER_STYLE: PathOptions = {
  color: "#111111",
  fillColor: "#d4d4d4",
  fillOpacity: 0.55,
  opacity: 1,
  weight: 3,
};
const MAP_LANGUAGE = "en";
const SEOUL_CLUSTER_POSITION: [number, number] = [37.56, 126.99];
const SEOUL_TO_KOREA_ZOOM = 8;
const SEOUL_DEFAULT_ZOOM_OFFSET = 1;

function getFeaturePolygons(feature: ProvinceFeature): PolygonCoordinates[] {
  if (feature.geometry.type === "Polygon") {
    return [feature.geometry.coordinates as PolygonCoordinates];
  }

  return feature.geometry.coordinates as MultiPolygonCoordinates;
}

function getBounds(features: ProvinceFeature[]): LatLngBoundsExpression {
  const bounds = {
    minLng: Number.POSITIVE_INFINITY,
    maxLng: Number.NEGATIVE_INFINITY,
    minLat: Number.POSITIVE_INFINITY,
    maxLat: Number.NEGATIVE_INFINITY,
  };

  for (const feature of features) {
    for (const polygon of getFeaturePolygons(feature)) {
      for (const ring of polygon) {
        for (const [lng, lat] of ring) {
          bounds.minLng = Math.min(bounds.minLng, lng);
          bounds.maxLng = Math.max(bounds.maxLng, lng);
          bounds.minLat = Math.min(bounds.minLat, lat);
          bounds.maxLat = Math.max(bounds.maxLat, lat);
        }
      }
    }
  }

  return [
    [bounds.minLat, bounds.minLng],
    [bounds.maxLat, bounds.maxLng],
  ];
}

const seoulDistrictFeatures =
  seoulDistrictGeoJson.features as unknown as ProvinceFeature[];
const seoulBounds = getBounds(seoulDistrictFeatures);

function getRegionRecordCount(
  regionCode: string,
  regionRecordCounts: Record<string, number>,
) {
  if (regionCode.length > 2) {
    return regionRecordCounts[regionCode] ?? 0;
  }

  return Object.entries(regionRecordCounts).reduce(
    (total, [recordRegionCode, count]) => {
      if (
        recordRegionCode === regionCode ||
        recordRegionCode.startsWith(regionCode)
      ) {
        return total + count;
      }

      return total;
    },
    0,
  );
}

function getFeatureRecordCount(
  feature: MapFeature,
  regionRecordCounts: Record<string, number>,
) {
  return getRegionRecordCount(feature.properties.code, regionRecordCounts);
}

function getFeatureLabel(feature: MapFeature) {
  return MAP_LANGUAGE === "en"
    ? feature.properties.name_eng
    : feature.properties.name;
}

function getFeatureStyle(
  feature: MapFeature | undefined,
  selectedRegionCode: string | undefined,
  regionRecordCounts: Record<string, number>,
): PathOptions {
  if (!feature) {
    return DEFAULT_STYLE;
  }

  if (feature.properties.code === selectedRegionCode) {
    return SELECTED_STYLE;
  }

  if (getFeatureRecordCount(feature, regionRecordCounts) > 0) {
    return RECORDED_STYLE;
  }

  return DEFAULT_STYLE;
}

function isStyledLayer(layer: Layer): layer is StyledLayer {
  return (
    "setStyle" in layer &&
    typeof layer.setStyle === "function" &&
    "bringToFront" in layer &&
    typeof layer.bringToFront === "function"
  );
}

function PickLocationEvents({
  enabled,
  onPickLocation,
}: {
  enabled: boolean;
  onPickLocation: (position: [number, number]) => void;
}) {
  useMapEvents({
    click: (event: LeafletMouseEvent) => {
      if (!enabled) {
        return;
      }

      onPickLocation([event.latlng.lat, event.latlng.lng]);
    },
  });

  return null;
}

function ZoomOutLevelEvents({
  enabled,
  onBackToKorea,
}: {
  enabled: boolean;
  onBackToKorea: () => void;
}) {
  const map = useMapEvents({
    zoomend: () => {
      if (!enabled || map.getZoom() > SEOUL_TO_KOREA_ZOOM) {
        return;
      }

      onBackToKorea();
    },
  });

  return null;
}

function FitMapToLevel({
  enabled,
  mapLevel,
}: {
  enabled: boolean;
  mapLevel: KoreaMapProps["mapLevel"];
}) {
  const map = useMap();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const bounds = mapLevel === "seoul" ? seoulBounds : KOREA_BOUNDS;
    const fitMap = () => {
      map.invalidateSize();
      map.fitBounds(bounds, {
        animate: false,
        padding: [18, 18],
      });

      if (mapLevel === "seoul") {
        map.setZoom(map.getZoom() + SEOUL_DEFAULT_ZOOM_OFFSET, {
          animate: false,
        });
      }

      if (mapLevel === "korea") {
        map.panBy(KOREA_DEFAULT_PAN_OFFSET, { animate: false });
      }
    };
    const frameId = window.requestAnimationFrame(fitMap);
    const timeoutId = window.setTimeout(fitMap, 180);
    const observer = new ResizeObserver(fitMap);

    observer.observe(map.getContainer());

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [enabled, map, mapLevel]);

  return null;
}

function PanToDraftPosition({
  draftPosition,
  enabled,
}: {
  draftPosition: [number, number] | undefined;
  enabled: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    if (!enabled || !draftPosition) {
      return;
    }

    map.flyTo(draftPosition, Math.max(map.getZoom(), 12), {
      animate: true,
      duration: 0.5,
    });
  }, [draftPosition, enabled, map]);

  return null;
}

function MapPlaceSearch({
  mapLevel,
  onBackToKorea,
  onSelectGooglePlace,
}: {
  mapLevel: KoreaMapProps["mapLevel"];
  onBackToKorea: () => void;
  onSelectGooglePlace: (googlePlace: GooglePlaceSnapshot) => void;
}) {
  const sessionTokenRef = useRef<GooglePlacesSessionToken | undefined>(
    undefined,
  );
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GooglePlaceSuggestion[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      setSuggestions([]);
      setStatus("idle");
      setMessage("");
      return;
    }

    let isActive = true;
    const timeoutId = window.setTimeout(() => {
      setStatus("loading");
      setMessage("");

      void (async () => {
        try {
          if (!sessionTokenRef.current) {
            sessionTokenRef.current = await createGooglePlacesSessionToken();
          }

          const nextSuggestions = await fetchGooglePlaceSuggestions(
            trimmedQuery,
            sessionTokenRef.current,
          );

          if (!isActive) {
            return;
          }

          setSuggestions(nextSuggestions);
          setStatus("idle");
          setMessage(
            nextSuggestions.length > 0 ? "" : "검색 결과가 없습니다.",
          );
        } catch (error) {
          if (!isActive) {
            return;
          }

          setSuggestions([]);
          setStatus("error");
          setMessage(
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
  }, [query]);

  const handleSelectSuggestion = async (suggestion: GooglePlaceSuggestion) => {
    setStatus("loading");
    setMessage("");

    try {
      const googlePlace = await fetchGooglePlaceSnapshot(suggestion);

      onSelectGooglePlace(googlePlace);
      setQuery(googlePlace.placeName);
      setSuggestions([]);
      setStatus("idle");
      setMessage("");
      sessionTokenRef.current = undefined;
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "장소 상세 정보를 가져오지 못했습니다.",
      );
    }
  };

  return (
    <div className="hbk-map-control-layer absolute left-3 right-3 top-3 lg:left-4 lg:right-4 lg:top-4">
      <div className="flex gap-2">
        {mapLevel === "seoul" ? (
          <button
            className="hbk-surface inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl px-3 text-xs font-extrabold shadow-md transition hover:bg-neutral-50"
            type="button"
            onClick={onBackToKorea}
          >
            <ArrowLeft size={15} aria-hidden="true" />
            Korea
          </button>
        ) : null}
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
            size={17}
            strokeWidth={2.4}
            aria-hidden="true"
          />
          <input
            className="hbk-surface h-11 w-full rounded-xl pl-9 pr-3 text-sm font-bold shadow-md"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="장소 검색"
            aria-label="장소 검색"
          />
          {suggestions.length > 0 ? (
            <div className="hbk-panel hbk-panel-shadow absolute left-0 right-0 top-12 overflow-hidden rounded-xl">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.placeId}
                  className="hbk-soft-border block w-full border-b px-3 py-2 text-left last:border-b-0"
                  type="button"
                  onClick={() => void handleSelectSuggestion(suggestion)}
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
      </div>
      {status === "loading" ? (
        <p className="hbk-panel hbk-panel-shadow mt-2 inline-flex rounded-full px-3 py-1.5 text-xs font-bold">
          장소 검색 중...
        </p>
      ) : message ? (
        <p
          className={`hbk-panel hbk-panel-shadow mt-2 inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${
            status === "error" ? "text-red-600" : ""
          }`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}

export function KoreaMap({
  mapLevel,
  selectedRegionCode,
  regionRecordCounts,
  records,
  selectedRecordId,
  draftPosition,
  shouldShowDraftMarker,
  isPickingLocation,
  isDraftLocationReady,
  onSelectRegion,
  onSelectRecord,
  onPickLocation,
  onSelectGooglePlace,
  onSelectLandmarkTopic,
  onConfirmLocation,
  onCancelPickingLocation,
  onBackToKorea,
}: KoreaMapProps) {
  const activeGeoJson = useMemo(
    () =>
      mapLevel === "seoul"
        ? (seoulDistrictGeoJson as GeoJsonObject)
        : (provinceGeoJson as GeoJsonObject),
    [mapLevel],
  );
  const mapTitle =
    mapLevel === "seoul" ? "Seoul District Map" : "South Korea Province Map";
  const geoJsonKey = `${mapLevel}-${selectedRegionCode ?? "none"}`;
  const seoulRecords = records.filter((record) =>
    record.regionCode.startsWith("11"),
  );
  const markerRecords =
    mapLevel === "seoul"
      ? seoulRecords
      : records.filter((record) => !record.regionCode.startsWith("11"));
  const selectedRecord = records.find(
    (record) => record.id === selectedRecordId,
  );
  const [hiddenRecordCardId, setHiddenRecordCardId] = useState<
    string | undefined
  >();
  const shouldShowSelectedRecordCard =
    selectedRecord &&
    !isPickingLocation &&
    selectedRecord.id !== hiddenRecordCardId;
  const shouldShowPickLocationNotice = isPickingLocation && !draftPosition;

  return (
    <div className="hbk-surface hbk-card-shadow h-full overflow-hidden lg:rounded-2xl">
      <div
        className="hbk-map-canvas relative h-full min-h-0 overflow-hidden"
        aria-label={mapTitle}
      >
        <MapPlaceSearch
          mapLevel={mapLevel}
          onBackToKorea={onBackToKorea}
          onSelectGooglePlace={onSelectGooglePlace}
        />
        {shouldShowPickLocationNotice ? (
          <div
            className={`hbk-panel hbk-panel-shadow hbk-map-control-layer absolute left-3 right-3 flex min-h-12 items-center justify-between gap-3 rounded-2xl px-3 py-2 lg:left-4 lg:right-4 ${
              mapLevel === "seoul" ? "top-28 lg:top-28" : "top-16 lg:top-20"
            }`}
          >
            <span className="hbk-text text-sm font-extrabold">
              기록할 위치를 지도에서 선택하세요
            </span>
            <button
              className="hbk-surface h-8 shrink-0 rounded-full px-3 text-xs font-extrabold"
              type="button"
              onClick={onCancelPickingLocation}
            >
              취소
            </button>
          </div>
        ) : null}
        <MapContainer
          className="h-full w-full"
          center={KOREA_CENTER}
          zoom={6}
          zoomControl={false}
          minZoom={6}
          maxZoom={13}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          <FitMapToLevel enabled={!draftPosition} mapLevel={mapLevel} />
          <PanToDraftPosition
            draftPosition={draftPosition}
            enabled={shouldShowDraftMarker}
          />
          <PickLocationEvents
            enabled={isPickingLocation}
            onPickLocation={onPickLocation}
          />
          <ZoomOutLevelEvents
            enabled={mapLevel === "seoul"}
            onBackToKorea={onBackToKorea}
          />
          <GeoJSON
            key={geoJsonKey}
            data={activeGeoJson}
            style={(feature) =>
              getFeatureStyle(
                feature as MapFeature | undefined,
                selectedRegionCode,
                regionRecordCounts,
              )
            }
            onEachFeature={(feature, layer: Layer) => {
              const mapFeature = feature as MapFeature;
              const recordCount = getFeatureRecordCount(
                mapFeature,
                regionRecordCounts,
              );
              const label = `${getFeatureLabel(mapFeature)}${
                recordCount > 0 ? ` (${recordCount})` : ""
              }`;

              layer.bindTooltip(label, {
                direction: "top",
                opacity: 0.92,
                sticky: true,
              });
              layer.on({
                click: () => onSelectRegion(mapFeature.properties.code),
                mouseout: () => {
                  if (isStyledLayer(layer)) {
                    layer.setStyle(
                      getFeatureStyle(
                        mapFeature,
                        selectedRegionCode,
                        regionRecordCounts,
                      ),
                    );
                  }
                },
                mouseover: () => {
                  if (isStyledLayer(layer)) {
                    layer.setStyle(HOVER_STYLE);
                    layer.bringToFront();
                  }
                },
              });
            }}
          />
          {mapLevel === "korea" && seoulRecords.length > 1 ? (
            <Marker
              eventHandlers={{
                click: () => {
                  onSelectRegion("11");
                  onSelectRecord(seoulRecords[0].id);
                },
              }}
              icon={createClusterIcon(seoulRecords.length)}
              position={SEOUL_CLUSTER_POSITION}
            />
          ) : null}
          <Pane
            name="landmark-markers"
            style={{ zIndex: MARKER_PANE_Z_INDEX.landmark }}
          >
            <Pane
              name="landmark-tooltips"
              style={{ zIndex: MARKER_PANE_Z_INDEX.landmark + 20 }}
            />
            {mapLevel === "seoul"
              ? landmarkTopics.map((landmarkTopic) => (
                  <Marker
                    key={landmarkTopic.id}
                    eventHandlers={{
                      click: () => onSelectLandmarkTopic(landmarkTopic),
                    }}
                    icon={createLandmarkIcon(landmarkTopic.iconKey)}
                    position={[landmarkTopic.lat, landmarkTopic.lng]}
                    title={landmarkTopic.title}
                  >
                    <Tooltip
                      className="landmark-map-tooltip"
                      direction="top"
                      opacity={0.92}
                      pane="landmark-tooltips"
                    >
                      {landmarkTopic.title}
                    </Tooltip>
                  </Marker>
                ))
              : null}
          </Pane>
          <Pane
            name="record-markers"
            style={{ zIndex: MARKER_PANE_Z_INDEX.record }}
          >
            {markerRecords.map((record) => (
              <Marker
                key={record.id}
                eventHandlers={{
                  click: () => {
                    onSelectRegion(record.regionCode);
                    onSelectRecord(record.id);
                    setHiddenRecordCardId(undefined);
                  },
                }}
                icon={createRecordIcon(record, record.id === selectedRecordId)}
                position={[record.lat, record.lng]}
              />
            ))}
          </Pane>
          {shouldShowDraftMarker && draftPosition ? (
            <Pane
              name="draft-marker"
              style={{ zIndex: MARKER_PANE_Z_INDEX.draft }}
            >
              <Marker icon={createDraftIcon()} position={draftPosition} />
            </Pane>
          ) : null}
        </MapContainer>
        {isDraftLocationReady ? (
          <div className="hbk-panel hbk-panel-shadow hbk-map-control-layer absolute bottom-3 left-3 right-3 rounded-2xl p-3 lg:bottom-4 lg:left-4 lg:right-4">
            <div className="flex gap-2">
              <button
                className="h-11 flex-1 rounded-xl bg-neutral-950 px-3 text-sm font-extrabold text-white"
                type="button"
                onClick={onConfirmLocation}
              >
                이 위치에 새 기록 작성
              </button>
              <button
                className="hbk-surface h-11 rounded-xl px-3 text-sm font-extrabold"
                type="button"
                onClick={onCancelPickingLocation}
              >
                취소
              </button>
            </div>
          </div>
        ) : null}
        {shouldShowSelectedRecordCard ? (
          <div className="hbk-map-card-layer absolute inset-0">
            <GoogleFeedCard
              record={selectedRecord}
              onClose={() => setHiddenRecordCardId(selectedRecord.id)}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
