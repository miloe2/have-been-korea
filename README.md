# Have Been Korea

React 기반 여행 기록 앱입니다. 현재는 Vite 웹 앱으로 시작하고, 이후 React Native 확장을 고려해 앱 진입점, 기능, 공유 로직을 분리했습니다.

## Scripts

- `npm run dev`: 개발 서버 실행
- `npm run build`: 타입 체크 후 프로덕션 빌드
- `npm run preview`: 빌드 결과 미리보기
- `npm run lint`: ESLint 실행

## Styling

Tailwind CSS는 Vite 플러그인(`@tailwindcss/vite`)으로 연결했습니다. 전역 스타일 진입점은 `src/app/styles.css`이며, 컴포넌트 스타일은 가능한 한 Tailwind 유틸리티 클래스로 작성합니다.

## Structure

```text
src/
  app/       # 웹 앱 진입점과 전역 스타일
  features/  # 도메인 기능 단위 UI, 모델, 로직
  shared/    # 플랫폼에 덜 의존적인 공용 유틸
```

React Native로 확장할 때는 `features`와 `shared`의 타입과 비즈니스 로직을 재사용하고, 플랫폼별 UI만 `.web.tsx` / `.native.tsx` 또는 별도 앱 패키지로 분리하면 됩니다.
