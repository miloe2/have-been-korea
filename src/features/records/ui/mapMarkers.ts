import { divIcon } from "leaflet";

import type { RegionRecord } from "@/features/records/model/types";

export const MARKER_PANE_Z_INDEX = {
  landmark: 520,
  record: 540,
  draft: 560,
} as const;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function createRecordIcon(record: RegionRecord, isSelected: boolean) {
  const imageUrl = escapeHtml(record.imageUrl);

  return divIcon({
    className: "record-map-marker",
    html: `<div class="record-map-dot${isSelected ? " is-selected" : ""}" style="--record-image: url('${imageUrl}')"></div>`,
    iconAnchor: [23, 23],
    iconSize: [46, 46],
  });
}

export function createClusterIcon(count: number) {
  return divIcon({
    className: "record-map-marker",
    html: `<div class="record-map-cluster">${count}</div>`,
    iconAnchor: [24, 24],
    iconSize: [48, 48],
  });
}

export function createDraftIcon() {
  return divIcon({
    className: "record-map-marker",
    html: `<div class="record-map-draft-dot"></div>`,
    iconAnchor: [12, 12],
    iconSize: [24, 24],
  });
}

export function createLandmarkIcon() {
  return divIcon({
    className: "record-map-marker",
    html: `<div class="landmark-map-dot" aria-hidden="true">
      <svg viewBox="0 0 16 16" width="16" height="16" focusable="false">
        <path d="M8 1.5 9.2 4h1.4L9.3 6.6l2.4 6.9H4.3l2.4-6.9L5.4 4h1.4L8 1.5Z" fill="currentColor"/>
        <path d="M5.4 8.4h5.2M4.9 10.6h6.2" fill="none" stroke="white" stroke-linecap="round" stroke-width="1.1"/>
      </svg>
    </div>`,
    iconAnchor: [18, 18],
    iconSize: [36, 36],
  });
}
