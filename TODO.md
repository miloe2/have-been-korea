# TODO

## Next
- 기록 추가 폼에서 지역 select 제거
- 기록 저장 시 현재 선택 지역과 지도 클릭 좌표를 사용
- 기록 추가 중 지도 클릭 UX 정리
  - `새 기록` 클릭 시 위치 선택 모드 진입
  - 지도 클릭 시 임시 dot 표시
  - 좌표 chip에 `lat`, `lng` 표시
- 저장 전 필수값 정리
  - 제목
  - 메모
  - 사진 URL 또는 이후 파일 업로드
  - 지도 클릭 좌표

## Soon
- 클릭 좌표가 어느 지역인지 자동 판정
  - MVP에서는 현재 선택 지역 사용
  - 이후 GeoJSON point-in-polygon 또는 reverse geocoding 검토
- 실제 클러스터링 도입
  - 단일 기록은 원형 썸네일 marker
  - 여러 기록은 숫자 cluster
  - 선택된 marker는 얇은 ring 표시
- 사진 파일 업로드 preview 추가
  - 현재는 `imageUrl` 입력 방식

## Backend Later
- `createRecord(input)`를 API 호출로 교체
  - 현재는 local state append
  - 이후 `POST /records`
- 기록 목록을 API에서 가져오도록 변경
  - 현재 `regionRecords`는 seed data
  - 이후 `GET /records`
- 백엔드에서 저장할 기본 필드
  - `regionCode`
  - `regionName`
  - `title`
  - `description`
  - `date`
  - `lat`
  - `lng`
  - `imageUrl`
  - `tags`

## Later
- 로그인/사용자별 기록
- Google/Naver/Kakao/Instagram 소스별 카드 레이아웃
- 다크모드
- React Native 확장용 디자인 토큰 정리
