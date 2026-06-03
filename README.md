# EcoSort

EcoSort is a React Native and Expo mobile app for recycling guidance. It helps users search local disposal rules, identify waste items with camera scanning or a configurable vision recognition API, choose council context, and keep a lightweight history of recycling decisions.

## Product-focused improvements in this version

- Scanner now has two real camera pathways: barcode/QR scanning and photo-based visual recognition through a configurable backend API.
- The photo analysis flow captures a camera frame, calls Hugging Face Inference Providers directly from the app when `EXPO_PUBLIC_HF_API_TOKEN` is configured, reads the returned item label/confidence, and maps it to the active council rule set.
- This package is configured for a no-backend API workflow.
- Search and Scanner are council-aware. The active council selected from Location controls which rules are matched first.
- Location supports GPS detection plus manual council selection for reliable testing and privacy.
- The no-sign-in path lets markers enter the app without Firebase `.env` values.
- Result cards show product-style evidence: accepted streams, rejected streams, source label, review date, confidence, and risk note.
- Low-battery scan protection sends users directly to Manual Search instead of only showing an alert.
- Dependency setup has been tightened with `expo-asset` and a pinned `react-test-renderer` version.
- Android permissions have been reduced to the app capabilities actually used.

## Features in this snapshot

- Manual recycling rule search
- Council-aware disposal guidance
- Camera barcode and QR scanning
- Camera photo analysis via external vision recognition API
- Privacy-aware scan history
- Permission-first onboarding
- Location-based council context
- Manual council selection
- Battery and sensor diagnostics
- Local recycling reminders
- Firebase email sign-in, anonymous Firebase sign-in, and no-sign-in access
- Firestore scan history/settings/council metadata sync when Firebase is configured

## Requirements

- Node.js 20 or later
- Expo CLI through `npx expo`
- Android Emulator, iOS Simulator, or Expo Go for device preview

## Install

```bash
npm install
```

## Run

```bash
npm start
```

## Android preview

```bash
npm run android
```

## Firebase configuration

Firebase is optional for local product testing. The app can be opened with **Use without sign-in** without any `.env` file.

Create a local `.env` file from `.env.example` only when testing Firebase Authentication and Firestore sync. Do not commit real secrets.

```env
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
```

## Vision recognition API configuration

This build supports a no-server visual recognition flow. The Scanner captures a camera photo and sends it directly to Hugging Face Inference Providers. The returned labels are mapped to EcoSort waste items and then matched to the active council rule pack. Hugging Face Inference Providers provide serverless access to supported models, including image classification models.

Create an app root `.env` file:

```env
EXPO_PUBLIC_HF_API_TOKEN=
EXPO_PUBLIC_HF_API_BASE=https://router.huggingface.co/hf-inference/models
EXPO_PUBLIC_HF_MODEL_IDS=google/vit-base-patch16-224,facebook/convnext-tiny-224,microsoft/resnet-50
EXPO_PUBLIC_VISION_API_ENDPOINT=
EXPO_PUBLIC_VISION_API_TOKEN=
```

Use a Hugging Face fine-grained token with permission to call Inference Providers. Then restart Expo with:

```bash
npx expo start -c
```

Security note: direct API mode avoids deploying a server, but the token is still a client-side public value once the app is built. For a real public app, a backend proxy or on-device model is safer.

## Project structure

```text
src/
  components/       Shared UI cards, buttons, result display, navigation
  data/             Council rule data and council helpers
  screens/          Home, Search, Scan, History, Settings, Location, Device, Account
  services/         Vision API client, Firebase, SQLite, notifications, scoring, matching, background task, AdMob
  theme/            Colours, type scale, spacing, radius, shadows
  types/            Shared TypeScript app models
  utils/            Accessibility, settings context, error messages
```

## Product notes

EcoSort is designed as a clean, mobile-first product with a restrained green and warm-neutral palette, clear calls to action, large touch targets, graceful empty states, local-first privacy behaviour, and friendly error messages.

Visual item recognition depends on the configured backend API. The app sends only the captured image frame needed for recognition and stores the resulting item/rule metadata in history, not the raw photo.
