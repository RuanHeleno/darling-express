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
  sleep 1
fi

# Start Metro with watch mode enabled (no CI=1) and open on Android
npx expo start --localhost --clear --android &
EXPO_PID=$!

# Poll until Metro is ready (up to 30 s)
echo "Waiting for Metro on :8081..."
for i in $(seq 1 30); do
  if curl -sf http://localhost:8081/status >/dev/null 2>&1; then
    echo "Metro ready — Fast Refresh is active."
    break
  fi
  sleep 1
done

wait "$EXPO_PID"
