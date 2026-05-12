import provinceGeoJson from "@/features/records/data/skorea-provinces.geo.json";
import seoulDistrictGeoJson from "@/features/records/data/seoul-districts.geo.json";

import type { RegionSummary } from "./types";

type ProvinceFeature = {
  properties: {
    code: string;
    name: string;
    name_eng: string;
  };
};

export const regions: RegionSummary[] = (
  provinceGeoJson.features as ProvinceFeature[]
)
  .map((feature) => ({
    code: feature.properties.code,
    name: feature.properties.name,
    nameEng: feature.properties.name_eng,
  }))
  .sort((a, b) => a.name.localeCompare(b.name, "ko"));

export const seoulDistricts: RegionSummary[] = (
  seoulDistrictGeoJson.features as ProvinceFeature[]
)
  .map((feature) => ({
    code: feature.properties.code,
    name: feature.properties.name,
    nameEng: feature.properties.name_eng,
  }))
  .sort((a, b) => a.name.localeCompare(b.name, "ko"));

export const selectableRegions = [...regions, ...seoulDistricts];
