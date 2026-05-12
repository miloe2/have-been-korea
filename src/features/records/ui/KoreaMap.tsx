import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo } from "react";
import { GeoJSON, MapContainer, TileLayer, useMap } from "react-leaflet";
import type { GeoJsonObject } from "geojson";
import type { LatLngBoundsExpression, Layer, PathOptions } from "leaflet";

import provinceGeoJson from "@/features/records/data/skorea-provinces.geo.json";
import seoulDistrictGeoJson from "@/features/records/data/seoul-districts.geo.json";

type KoreaMapProps = {
  mapLevel: "korea" | "seoul";
  selectedRegionCode: string | undefined;
  regionRecordCounts: Record<string, number>;
  onSelectRegion: (regionCode: string) => void;
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
const SELECTED_STYLE: PathOptions = {
  color: "#7f1d1d",
  fillColor: "#dc2626",
  fillOpacity: 0.62,
  opacity: 1,
  weight: 3,
};
const RECORDED_STYLE: PathOptions = {
  color: "#065f46",
  fillColor: "#047857",
  fillOpacity: 0.42,
  opacity: 0.95,
  weight: 2,
};
const DEFAULT_STYLE: PathOptions = {
  color: "#57534e",
  fillColor: "#d6d3d1",
  fillOpacity: 0.24,
  opacity: 0.7,
  weight: 1.3,
};
const HOVER_STYLE: PathOptions = {
  color: "#b91c1c",
  fillColor: "#f87171",
  fillOpacity: 0.55,
  opacity: 1,
  weight: 3,
};
const MAP_LANGUAGE = "en";

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

function FitMapToLevel({ mapLevel }: { mapLevel: KoreaMapProps["mapLevel"] }) {
  const map = useMap();

  useEffect(() => {
    const bounds = mapLevel === "seoul" ? seoulBounds : KOREA_BOUNDS;

    map.fitBounds(bounds, {
      animate: false,
      padding: [18, 18],
    });
    map.setZoom(map.getZoom() + 1, { animate: false });
  }, [map, mapLevel]);

  return null;
}

export function KoreaMap({
  mapLevel,
  selectedRegionCode,
  regionRecordCounts,
  onSelectRegion,
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

  return (
    <div className="rounded-lg border border-stone-300 bg-white p-3 sm:p-5">
      <div className="mb-3 flex min-h-10 items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase text-emerald-800">
            {mapLevel === "seoul" ? "Si-Gun-Gu" : "Province"}
          </p>
          <h3 className="text-xl font-semibold text-stone-950">{mapTitle}</h3>
        </div>
        {mapLevel === "seoul" ? (
          <button
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 text-sm font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-stone-50"
            type="button"
            onClick={onBackToKorea}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Korea
          </button>
        ) : null}
      </div>

      <div
        className="h-[430px] overflow-hidden rounded-lg border border-stone-200 bg-stone-100 sm:h-[560px]"
        aria-label={mapTitle}
      >
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
        </MapContainer>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-stone-600">
        <span className="inline-flex items-center gap-2">
          <span className="size-3 rounded-sm bg-emerald-700" aria-hidden="true" />
          Has records
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="size-3 rounded-sm bg-red-600" aria-hidden="true" />
          Selected
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="size-3 rounded-sm bg-stone-300" aria-hidden="true" />
          No records
        </span>
      </div>
    </div>
  );
}
