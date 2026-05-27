#!/usr/bin/env bash
set -euo pipefail

export ANDROID_SDK_ROOT="${ANDROID_SDK_ROOT:-/opt/android-sdk}"
export PATH="$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools:$PATH"

BUILD_TYPE="${1:-debug}"

cd /app/android
./gradlew "assemble${BUILD_TYPE^}" --no-daemon

exec "$@"
