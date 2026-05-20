  # 제품 비전

  사용자가 방문한 장소를 표시하고 지도 위에 개인적인 추억을 저장할 수 있는 한국 여행 기록 지도를 만든다.

  핵심 경험은 익숙한 Google Maps / Naver Maps 장소 상세 패턴을 의도적으로 따라가되, 공개 장소 콘텐츠를 사용자의 여행 추억으로 바꾸는 것이다.
  - 사용자는 한국 지도에서 장소를 선택하거나 탭한다.
  - 모바일은 선택한 POI에서 열린 지도 앱 바텀 시트처럼 느껴져야 한다.
  - 데스크톱은 큰 사진 헤더, 익숙한 액션 버튼, 탭, 정보 섹션을 갖춘 Google 장소 페이지 레이아웃을 가깝게 따라간다.
  - 제품의 차별점은 새롭게 디자인한 지도 UI가 아니다. 매우 익숙한 장소 상세 UI가 사용자의 사진, 메모, 날짜, 태그, 위치로 채워지는 놀라움이다.
  - 예: 남산을 탭하면 Google/Naver 스타일의 장소 상세 화면이 열리지만, 대표 이미지, 리뷰 같은 메모, 업데이트는 공개 비즈니스 데이터가 아니라 사용자가 저장한 추억이다.

  # TODO

  ## 다음
  - Google Places 검색/선택 흐름 추가
    - Google Places Text Search 또는 Autocomplete로 장소 이름 검색
    - 기록을 저장하기 전에 사용자가 실제 장소를 선택하도록 하기
    - 선택한 Google 장소 스냅샷을 사용자의 사진, 메모, 방문 날짜와 함께 저장
    - 피드 화면을 볼 때마다 Google을 다시 호출하지 않고, 저장된 스냅샷을 우선 사용해 렌더링
    - 사용자가 업로드한 사진을 기본 이미지로 유지

  ## 곧
  - 클릭한 지도 좌표에서 행정구역 감지
    - 먼저 GeoJSON point-in-polygon 사용
    - 필요하면 나중에 역지오코딩 검토
  - 전국 시/군/구 단위 GeoJSON 확장 검토
    - 예: 강원도만이 아니라 속초, 강릉, 춘천 단위
  - 실제 마커 클러스터링 추가
    - 단일 기록: 원형 썸네일 마커
    - 여러 기록: 숫자 클러스터 마커
    - 선택된 마커: 은은한 링 상태
  - 지도 롱프레스로 `여기에 기록 만들기` 열기 검토
    - 지도 탐색을 위한 일반 탭 동작은 유지

  ## 보류
  - 생성 폼에서 지역 선택 제거
    - 좌표 기반 지역 감지가 신뢰 가능해질 때까지 보류
  - 현재 선택된 지역만 사용해 기록 저장
    - 위험: 지역과 클릭한 좌표가 어긋날 수 있음
  - 빈 상태 안내
    - 온보딩/기본 예시로 인천공항 추가 검토
  - 소스별 카드 레이아웃
    - Google/Naver/Kakao/Instagram 스타일 변형
  - 소셜 보기 / 다른 사용자의 기록

  ## 백엔드 나중에
  - 로컬 `createRecord(input)`를 API 호출로 교체
    - 현재: 로컬 상태에 추가
    - 나중에: `POST /records`
  - API에서 기록 불러오기
    - 현재: `regionRecords` 시드 데이터
    - 나중에: `GET /records`
  - 백엔드 기록 필드
    - `googlePlaceId`
    - `placeName`
    - `placeRating`
    - `placeReviewCount`
    - `placeAddress`
    - `placeLat`
    - `placeLng`
    - `placeFetchedAt`
    - `regionCode`
    - `regionName`
    - `title`
    - `description`
    - `date`
    - `lat`
    - `lng`
    - `imageUrl`
    - `tags`
  - 프로덕션 전 Google Places 정책 확인
    - 장소 데이터 스냅샷의 저장/캐싱 제한 확인
    - Google 제공 장소 데이터를 표시할 때 필요한 Google 저작자 표시 노출

  ## 나중에
  - 로그인 / 사용자별 기록
  - 다크 모드
  - React Native 디자인 토큰 정리

  ## DONE

  ### 2026-05-19
  - Google/Naver Maps-style personal place detail card for selected pins
  - Selected pin detail as a mobile-friendly bottom sheet
  - Photo file upload preview
    - Current MVP stores object URLs in local state-backed records
    - Later Firebase Storage should replace the object URL with a download URL
  - Static landmark/topic icons on the map
    - Added Seoul starter landmark/topic list with coordinates
    - Rendered SVG-style map markers before Google Places integration
    - Landmark markers act as record-start locations, not public POI detail cards
    - Landmark click selects the coordinate and shows `Create record here`

  ### 2026-05-16
  - Mobile-first map layout
  - Bottom navigation
  - Seoul district map as initial view
  - New record location-picking flow
    - `New record` enters location-pick mode
    - Map click places a temporary dot
    - `Create record here` CTA opens the bottom sheet
  - Create record bottom sheet
    - Fixed header
    - Scrollable body
    - Fixed footer
  - Required create fields
    - Title
    - Memo
    - Photo URL
    - Map-click coordinate
  - Selected pin card
    - Thumbnail
    - Title
    - Description
    - Close button
  - Map UX cleanup
    - Removed Leaflet zoom controls
    - Removed map bounds lock
    - Removed unnecessary lat/lng overlays inside the map
  - Component split
    - `CreateRecordSheet`
    - `BottomNav`
