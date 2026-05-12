import type { Trip } from "./types";

export const sampleTrips: Trip[] = [
  {
    id: "seoul-ikseon",
    title: "익선동 골목",
    region: "서울",
    visitedAt: "2026.04",
    imageUrl:
      "https://images.unsplash.com/photo-1535189043414-47a3c49a0bed?auto=format&fit=crop&w=900&q=80",
    note: "작은 한옥 골목과 카페를 함께 저장한 첫 기록입니다.",
  },
  {
    id: "busan-gwangan",
    title: "광안리 해변",
    region: "부산",
    visitedAt: "2025.11",
    imageUrl:
      "https://images.unsplash.com/photo-1548115184-bc6544d06a58?auto=format&fit=crop&w=900&q=80",
    note: "야경, 산책 코스, 다음에 다시 갈 식당 후보를 묶었습니다.",
  },
  {
    id: "jeju-oreum",
    title: "제주 오름",
    region: "제주",
    visitedAt: "2025.08",
    imageUrl:
      "https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=900&q=80",
    note: "짧게 걷기 좋은 코스와 날씨 메모를 남겼습니다.",
  },
];
