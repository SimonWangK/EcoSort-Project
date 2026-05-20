# EcoSort

EcoSort is a React Native and Expo mobile app for privacy-aware recycling guidance. It helps users search local disposal rules, understand the right bin, and keep a lightweight history of recycling decisions.

## Current snapshot

**Commit 05** — `feat: add privacy offline mode and haptic feedback`

Add privacy-first mode, offline demo state, cached rule metadata, and haptic feedback.

## Features in this snapshot

- Manual recycling rule search
- Council-aware disposal guidance
- Privacy-aware scan history
- Offline-friendly cached rules

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

## Project structure

```text
src/
  components/
  data/
  screens/
  services/
  theme/
  types/
  utils/
```

## Product notes

EcoSort is designed as a clean, mobile-first product with a restrained green and warm-neutral palette, clear calls to action, large touch targets, graceful empty states, and friendly error messages.
