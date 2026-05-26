import type { GooglePlaceSnapshot } from "@/features/records/model/types";

export type GooglePlacesSessionToken = object;

export type GooglePlaceSuggestion = {
  placeId: string;
  text: string;
  secondaryText: string;
  prediction: GooglePlacePrediction;
};

type GoogleMapsGlobal = {
  maps: {
    importLibrary: (name: "places") => Promise<GooglePlacesLibrary>;
  };
};

type GooglePlacesLibrary = {
  AutocompleteSessionToken: new () => GooglePlacesSessionToken;
  AutocompleteSuggestion: {
    fetchAutocompleteSuggestions: (
      request: GoogleAutocompleteRequest,
    ) => Promise<GoogleAutocompleteResponse>;
  };
};

type GoogleAutocompleteRequest = {
  input: string;
  includedRegionCodes: string[];
  sessionToken: GooglePlacesSessionToken;
};

type GoogleAutocompleteResponse = {
  suggestions?: GoogleAutocompleteSuggestion[];
};

type GoogleAutocompleteSuggestion = {
  placePrediction?: GooglePlacePrediction;
};

export type GooglePlacePrediction = {
  placeId?: string;
  text?: GoogleTextValue | string;
  mainText?: GoogleTextValue | string;
  secondaryText?: GoogleTextValue | string;
  toPlace: () => GooglePlace;
};

type GooglePlace = {
  id?: string;
  displayName?: GoogleTextValue | string;
  formattedAddress?: string;
  location?: {
    lat?: number | (() => number);
    lng?: number | (() => number);
  };
  rating?: number;
  userRatingCount?: number;
  googleMapsURI?: string;
  googleMapsUri?: string;
  primaryType?: string;
  fetchFields: (request: { fields: string[] }) => Promise<void>;
};

type GoogleTextValue = {
  text?: string;
};

let scriptLoadPromise: Promise<void> | undefined;
let placesLibraryPromise: Promise<GooglePlacesLibrary> | undefined;

function getGoogleMapsApiKey() {
  return import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim() ?? "";
}

function readGoogleMapsGlobal() {
  const googleMaps = (
    globalThis as typeof globalThis & { google?: GoogleMapsGlobal }
  ).google;

  if (!googleMaps?.maps.importLibrary) {
    throw new Error("Google Maps JavaScript API를 불러오지 못했습니다.");
  }

  return googleMaps;
}

function loadGoogleMapsScript() {
  const apiKey = getGoogleMapsApiKey();

  if (!apiKey) {
    return Promise.reject(
      new Error("VITE_GOOGLE_MAPS_API_KEY 환경변수가 필요합니다."),
    );
  }

  if (scriptLoadPromise) {
    return scriptLoadPromise;
  }

  if (
    (globalThis as typeof globalThis & { google?: GoogleMapsGlobal }).google
      ?.maps.importLibrary
  ) {
    scriptLoadPromise = Promise.resolve();
    return scriptLoadPromise;
  }

  scriptLoadPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      "script[data-google-maps-api]",
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Google Maps JavaScript API 로드에 실패했습니다.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    const params = new URLSearchParams({
      key: apiKey,
      v: "weekly",
      language: "ko",
      region: "KR",
      loading: "async",
    });

    script.dataset.googleMapsApi = "true";
    script.async = true;
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.onload = () => resolve();
    script.onerror = () => {
      reject(new Error("Google Maps JavaScript API 로드에 실패했습니다."));
    };

    document.head.append(script);
  });

  return scriptLoadPromise;
}

async function getPlacesLibrary() {
  if (!placesLibraryPromise) {
    placesLibraryPromise = loadGoogleMapsScript().then(() =>
      readGoogleMapsGlobal().maps.importLibrary("places"),
    );
  }

  return placesLibraryPromise;
}

function readText(value: GoogleTextValue | string | undefined) {
  if (!value) {
    return "";
  }

  return typeof value === "string" ? value : value.text ?? "";
}

function readCoordinate(value: number | (() => number) | undefined) {
  if (typeof value === "function") {
    return value();
  }

  return value;
}

export async function createGooglePlacesSessionToken() {
  const placesLibrary = await getPlacesLibrary();

  return new placesLibrary.AutocompleteSessionToken();
}

export async function fetchGooglePlaceSuggestions(
  input: string,
  sessionToken: GooglePlacesSessionToken,
) {
  const trimmedInput = input.trim();

  if (trimmedInput.length < 2) {
    return [];
  }

  const placesLibrary = await getPlacesLibrary();
  const response =
    await placesLibrary.AutocompleteSuggestion.fetchAutocompleteSuggestions({
      input: trimmedInput,
      includedRegionCodes: ["kr"],
      sessionToken,
    });

  return (response.suggestions ?? [])
    .map((suggestion) => suggestion.placePrediction)
    .filter((prediction): prediction is GooglePlacePrediction =>
      Boolean(prediction?.placeId),
    )
    .map<GooglePlaceSuggestion>((prediction) => ({
      placeId: prediction.placeId ?? "",
      text: readText(prediction.text) || readText(prediction.mainText),
      secondaryText: readText(prediction.secondaryText),
      prediction,
    }))
    .filter((suggestion) => suggestion.text);
}

export async function fetchGooglePlaceSnapshot(
  suggestion: GooglePlaceSuggestion,
): Promise<GooglePlaceSnapshot> {
  const place = suggestion.prediction.toPlace();

  await place.fetchFields({
    fields: [
      "id",
      "displayName",
      "formattedAddress",
      "location",
      "rating",
      "userRatingCount",
      "googleMapsURI",
      "primaryType",
    ],
  });

  const placeLat = readCoordinate(place.location?.lat);
  const placeLng = readCoordinate(place.location?.lng);
  const placeName = readText(place.displayName) || suggestion.text;
  const googlePlaceId = place.id ?? suggestion.placeId;

  if (!googlePlaceId || !placeName || placeLat === undefined || placeLng === undefined) {
    throw new Error("선택한 장소의 필수 정보를 가져오지 못했습니다.");
  }

  return {
    googlePlaceId,
    placeName,
    placeAddress: place.formattedAddress ?? suggestion.secondaryText,
    placeLat,
    placeLng,
    placeRating: place.rating,
    placeReviewCount: place.userRatingCount,
    placeGoogleMapsUri: place.googleMapsURI ?? place.googleMapsUri,
    placePrimaryType: place.primaryType,
    placeFetchedAt: new Date().toISOString(),
  };
}
