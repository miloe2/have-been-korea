  # Product Vision

  Build a Korea travel record map where users can mark places they have visited and save personal memories on top of the map.

  The core experience should deliberately copy familiar Google Maps / Naver Maps place-detail patterns, then replace the public place content
  with the user's own travel memories:
  - Users select or tap a place on the Korea map.
  - Mobile should feel like a map app bottom sheet opened from a selected POI.
  - Desktop should closely follow the Google place page layout, with a large photo header, familiar action buttons, tabs, and information sections.
  - The product twist is not a redesigned map UI. It is the surprise of seeing a very familiar place-detail UI filled with the user's own photos,
  notes, dates, tags, and location.
  - Example: tapping Namsan opens a Google/Naver-style place detail view, but the representative image, review-like notes, and updates are the
  user's saved memories instead of public business data.

  # TODO

  ## Next
  - Build a Google/Naver Maps-style personal place detail card for selected pins
  - Show the selected pin detail as a mobile-friendly bottom sheet
  - Support a feed-style list of records for the same place or region

  ## Soon
  - Add photo file upload preview
    - Current MVP uses `imageUrl`
  - Add Google Places search/select flow
    - Search place names with Google Places Text Search or Autocomplete
    - Let the user choose the real place before saving a record
    - Save the selected Google place snapshot with the user's photo, memo, and visit date
    - Render feeds from the saved snapshot first, instead of calling Google again on every feed view
    - Keep the user's uploaded photo as the primary image
  - Detect the administrative region from the clicked map coordinate
    - Use GeoJSON point-in-polygon first
    - Consider reverse geocoding later if needed
  - Review nationwide city/district-level GeoJSON expansion
    - Example: Sokcho, Gangneung, Chuncheon instead of only Gangwon-do
  - Add real marker clustering
    - Single record: circular thumbnail marker
    - Multiple records: numeric cluster marker
    - Selected marker: subtle ring state
  - Consider long-press on the map to open `Create record here`
    - Keep normal tap behavior for map exploration

  ## Deferred
  - Remove region select from the create form
    - Defer until coordinate-based region detection is reliable
  - Save records using only the currently selected region
    - Risk: region and clicked coordinate can mismatch
  - Empty-state guidance
    - Consider adding Incheon Airport as an onboarding/default example
  - Landmark icons
  - Source-specific card layouts
    - Google/Naver/Kakao/Instagram style variants
  - Social viewing / other users' records

  ## Backend Later
  - Replace local `createRecord(input)` with API call
    - Current: local state append
    - Later: `POST /records`
  - Load records from API
    - Current: `regionRecords` seed data
    - Later: `GET /records`
  - Backend record fields
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
  - Google Places policy check before production
    - Confirm storage/caching limits for place data snapshots
    - Show required Google attribution when displaying Google-provided place data

  ## Later
  - Login / user-specific records
  - Dark mode
  - React Native design token cleanup

  ## DONE

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
