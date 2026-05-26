export type RecordSourceType = "google" | "naver" | "instagram";

export type GooglePlaceSnapshot = {
  googlePlaceId: string;
  placeName: string;
  placeAddress: string;
  placeLat: number;
  placeLng: number;
  placeRating?: number;
  placeReviewCount?: number;
  placeGoogleMapsUri?: string;
  placePrimaryType?: string;
  placeFetchedAt: string;
};

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
} & Partial<GooglePlaceSnapshot>;

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
} & GooglePlaceSnapshot;

export type RegionSummary = {
  code: string;
  name: string;
  nameEng: string;
};
