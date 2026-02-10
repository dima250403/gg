#!/usr/bin/env bash
set -euo pipefail

PROJECT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ -n "${UNITY_BIN:-}" && -x "${UNITY_BIN}" ]]; then
  exec "${UNITY_BIN}" -projectPath "${PROJECT_PATH}"
fi

if command -v unity-editor >/dev/null 2>&1; then
  exec unity-editor -projectPath "${PROJECT_PATH}"
fi

if command -v Unity >/dev/null 2>&1; then
  exec Unity -projectPath "${PROJECT_PATH}"
fi

echo "Не найден Unity executable в PATH."
echo "Укажи путь так: UNITY_BIN='/path/to/Unity' ./start_unity_project.sh"
exit 1
