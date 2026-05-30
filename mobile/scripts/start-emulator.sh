#!/usr/bin/env bash
set -euo pipefail

if ! command -v adb >/dev/null 2>&1; then
  echo "adb not found. Install Android platform-tools to use the emulator workflow." >&2
  exit 1
fi

if ! adb get-state >/dev/null 2>&1; then
  echo "No Android emulator/device detected by adb. Start the emulator first." >&2
  exit 1
fi

adb reverse tcp:8081 tcp:8081 || true
adb reverse tcp:19000 tcp:19000 || true
adb reverse tcp:19001 tcp:19001 || true

echo "Emulator reverse configured. Starting Expo on localhost..."

# Free port 8081 if already in use
EXISTING=$(lsof -ti tcp:8081 2>/dev/null || true)
if [ -n "$EXISTING" ]; then
  echo "Killing existing process(es) on port 8081 (pids: $(echo $EXISTING | tr '\n' ' '))..."
  echo "$EXISTING" | xargs kill -9 2>/dev/null || true
  sleep 2
fi

CI=1 npx expo start --localhost --clear &
EXPO_PID=$!

sleep 8
adb shell am start -a android.intent.action.VIEW -d 'exp://127.0.0.1:8081' host.exp.exponent >/dev/null

wait "$EXPO_PID" || true
