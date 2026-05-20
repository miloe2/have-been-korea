export type RecordSourceType = "google" | "naver" | "instagram";

export type RegionRecord = {
  id: string;
  regionCode: string;
  regionName: string;
  title: string;
  description: string;
  date: string;
  lat: number;
  lng: number;
  imageUrl: string;
  sourceType: RecordSourceType;
  sourceLabel?: string;
  tags?: string[];
};

export type CreateRegionRecordInput = {
  regionCode: string;
  regionName: string;
  title: string;
  description: string;
  date: string;
  lat: number;
  lng: number;
  imageUrl: string;
  sourceType: RecordSourceType;
  tags?: string[];
};

export type RegionSummary = {
  code: string;
  name: string;
  nameEng: string;
};
