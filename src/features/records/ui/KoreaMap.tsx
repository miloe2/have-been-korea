import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo } from "react";
import {
  GeoJSON,
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type { GeoJsonObject } from "geojson";
import { divIcon } from "leaflet";
import type { LeafletMouseEvent } from "leaflet";
import type { LatLngBoundsExpression, Layer, PathOptions } from "leaflet";

import provinceGeoJson from "@/features/records/data/skorea-provinces.geo.json";
import seoulDistrictGeoJson from "@/features/records/data/seoul-districts.geo.json";
import type { RegionRecord } from "@/features/records/model/types";

type KoreaMapProps = {
  mapLevel: "korea" | "seoul";
  selectedRegionCode: string | undefined;
  regionRecordCounts: Record<string, number>;
  records: RegionRecord[];
  selectedRecordId: string | undefined;
  draftPosition: [number, number] | undefined;
  isPickingLocation: boolean;
  onSelectRegion: (regionCode: string) => void;
  onSelectRecord: (recordId: string) => void;
  onPickLocation: (position: [number, number]) => void;
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
const KOREA_DEFAULT_PAN_OFFSET: [number, number] = [-40, 0];
const SELECTED_STYLE: PathOptions = {
  color: "#111111",
  fillColor: "#111111",
  fillOpacity: 0.62,
  opacity: 1,
  weight: 3,
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

  return Object.entries(regionRecordCounts).reduce((total, [recordRegionCode, count]) => {
    if (recordRegionCode === regionCode || recordRegionCode.startsWith(regionCode)) {
      return total + count;
    }

    return total;
  }, 0);
}

function getFeatureRecordCount(
  feature: MapFeature,
  regionRecordCounts: Record<string, number>,
) {
  return getRegionRecordCount(feature.properties.code, regionRecordCounts);
}

function getFeatureLabel(feature: MapFeature) {
  return MAP_LANGUAGE === "en" ? feature.properties.name_eng : feature.properties.name;
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

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function createRecordIcon(record: RegionRecord, isSelected: boolean) {
  const imageUrl = escapeHtml(record.imageUrl);

  return divIcon({
    className: "record-map-marker",
    html: `<div class="record-map-dot${isSelected ? " is-selected" : ""}" style="--record-image: url('${imageUrl}')"></div>`,
    iconAnchor: [23, 23],
    iconSize: [46, 46],
  });
}

function createClusterIcon(count: number) {
  return divIcon({
    className: "record-map-marker",
    html: `<div class="record-map-cluster">${count}</div>`,
    iconAnchor: [24, 24],
    iconSize: [48, 48],
  });
}

function createDraftIcon() {
  return divIcon({
    className: "record-map-marker",
    html: `<div class="record-map-draft-dot"></div>`,
    iconAnchor: [12, 12],
    iconSize: [24, 24],
  });
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

function FitMapToLevel({ mapLevel }: { mapLevel: KoreaMapProps["mapLevel"] }) {
  const map = useMap();

  useEffect(() => {
    const bounds = mapLevel === "seoul" ? seoulBounds : KOREA_BOUNDS;

    map.fitBounds(bounds, {
      animate: false,
      padding: [18, 18],
    });

    if (mapLevel === "korea") {
      map.panBy(KOREA_DEFAULT_PAN_OFFSET, { animate: false });
    }
  }, [map, mapLevel]);

  return null;
}

export function KoreaMap({
  mapLevel,
  selectedRegionCode,
  regionRecordCounts,
  records,
  selectedRecordId,
  draftPosition,
  isPickingLocation,
  onSelectRegion,
  onSelectRecord,
  onPickLocation,
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
  const seoulRecords = records.filter((record) => record.regionCode.startsWith("11"));
  const markerRecords =
    mapLevel === "seoul"
      ? seoulRecords
      : records.filter((record) => !record.regionCode.startsWith("11"));
  const selectedRecord =
    records.find((record) => record.id === selectedRecordId) ?? records[0];

  return (
    <div className="overflow-hidden rounded-[18px] border border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-[var(--shadow-card)]">
      <div className="flex min-h-[59px] items-center justify-between gap-3 border-b border-[var(--color-border-soft)] px-4 py-3">
        <div>
          <h3 className="text-[17px] font-semibold text-[var(--color-text)]">
            방문 지도
          </h3>
          <p className="mt-0.5 text-xs text-[var(--color-muted)]">
            지도 클릭으로 lat/lng 저장
          </p>
        </div>
        {mapLevel === "seoul" ? (
          <button
            className="inline-flex h-9 items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 text-xs font-bold text-[var(--color-text)] transition hover:bg-[var(--color-chip-bg)]"
            type="button"
            onClick={onBackToKorea}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Korea
          </button>
        ) : null}
      </div>

      <div
        className="relative h-[640px] overflow-hidden bg-[linear-gradient(145deg,var(--color-map-bg-end)_0%,var(--color-map-bg-start)_100%)]"
        aria-label={mapTitle}
      >
        <div className="pointer-events-none absolute left-3.5 right-3.5 top-3.5 z-[450] grid gap-2">
          <div className="flex h-[42px] items-center gap-2 rounded-[13px] border border-[var(--color-border)] bg-[var(--color-panel-bg)] px-3 text-sm shadow-[0_10px_22px_rgba(15,15,15,0.08)]">
            <span className="font-bold text-[var(--color-text)]">⌕</span>
            <span className="text-[var(--color-muted)]">
              {isPickingLocation ? "지도에서 위치를 클릭하세요" : "지도에서 위치 찍기"}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-full bg-[var(--color-text)] px-2.5 py-1.5 text-[11px] font-extrabold text-[var(--color-card-bg)]">
              {selectedRecord?.regionName ?? "지역 선택"}
            </span>
            {selectedRecord ? (
              <>
                <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-panel-bg)] px-2.5 py-1.5 text-[11px] font-extrabold text-[var(--color-chip-text)]">
                  lat {selectedRecord.lat.toFixed(3)}
                </span>
                <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-panel-bg)] px-2.5 py-1.5 text-[11px] font-extrabold text-[var(--color-chip-text)]">
                  lng {selectedRecord.lng.toFixed(3)}
                </span>
              </>
            ) : null}
          </div>
        </div>
        <MapContainer
          className="h-full w-full"
          center={KOREA_CENTER}
          zoom={7}
          minZoom={6}
          maxZoom={13}
          maxBounds={KOREA_BOUNDS}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          <FitMapToLevel mapLevel={mapLevel} />
          <PickLocationEvents
            enabled={isPickingLocation}
            onPickLocation={onPickLocation}
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
          {markerRecords.map((record) => (
            <Marker
              key={record.id}
              eventHandlers={{
                click: () => {
                  onSelectRegion(record.regionCode);
                  onSelectRecord(record.id);
                },
              }}
              icon={createRecordIcon(record, record.id === selectedRecordId)}
              position={[record.lat, record.lng]}
            />
          ))}
          {draftPosition ? (
            <Marker icon={createDraftIcon()} position={draftPosition} />
          ) : null}
        </MapContainer>
        {selectedRecord ? (
          <article className="absolute bottom-4 left-4 right-4 z-[450] grid grid-cols-[74px_minmax(0,1fr)] gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-2.5 shadow-[var(--shadow-panel)]">
            <div
              className="min-h-[74px] rounded-xl bg-cover bg-center"
              style={{ backgroundImage: `url(${selectedRecord.imageUrl})` }}
            />
            <div className="min-w-0">
              <small className="block text-[11px] font-black text-[var(--color-accent)]">
                SELECTED PIN
              </small>
              <strong className="mt-1 block truncate text-[15px] font-bold text-[var(--color-text)]">
                {selectedRecord.title}
              </strong>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--color-muted)]">
                {selectedRecord.description}
              </p>
            </div>
          </article>
        ) : null}
      </div>
    </div>
  );
}
