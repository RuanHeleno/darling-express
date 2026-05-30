#!/usr/bin/env bash
set -euo pipefail

if ! command -v adb >/dev/null 2>&1; then
  echo "adb not found. Install Android platform-tools and enable USB debugging on your phone." >&2
  exit 1
fi

if ! adb get-state >/dev/null 2>&1; then
  echo "No Android device detected by adb. Connect device via USB and accept debugging prompt." >&2
  exit 1
fi

adb reverse tcp:8081 tcp:8081
adb reverse tcp:19000 tcp:19000 || true
adb reverse tcp:19001 tcp:19001 || true

echo "USB reverse configured. Starting Expo on localhost..."
exec npx expo start --localhost --clear
