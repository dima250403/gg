#!/usr/bin/env bash
set -euo pipefail

EXE_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/Build/Windows/UnityShooter.exe"

if [[ ! -f "$EXE_PATH" ]]; then
  echo "EXE not found: $EXE_PATH"
  echo "Build it on Windows/Unity first (build_windows.bat)."
  exit 1
fi

if command -v wine >/dev/null 2>&1; then
  exec wine "$EXE_PATH"
fi

echo "wine is not installed. Run the EXE on Windows."
exit 1
