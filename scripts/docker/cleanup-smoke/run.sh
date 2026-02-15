#!/usr/bin/env bash
set -euo pipefail

cd /repo

export OPENHEARTH_STATE_DIR="/tmp/openhearth-test"
export OPENHEARTH_CONFIG_PATH="${OPENHEARTH_STATE_DIR}/openhearth.json"

echo "==> Build"
pnpm build

echo "==> Seed state"
mkdir -p "${OPENHEARTH_STATE_DIR}/credentials"
mkdir -p "${OPENHEARTH_STATE_DIR}/agents/main/sessions"
echo '{}' >"${OPENHEARTH_CONFIG_PATH}"
echo 'creds' >"${OPENHEARTH_STATE_DIR}/credentials/marker.txt"
echo 'session' >"${OPENHEARTH_STATE_DIR}/agents/main/sessions/sessions.json"

echo "==> Reset (config+creds+sessions)"
pnpm openhearth reset --scope config+creds+sessions --yes --non-interactive

test ! -f "${OPENHEARTH_CONFIG_PATH}"
test ! -d "${OPENHEARTH_STATE_DIR}/credentials"
test ! -d "${OPENHEARTH_STATE_DIR}/agents/main/sessions"

echo "==> Recreate minimal config"
mkdir -p "${OPENHEARTH_STATE_DIR}/credentials"
echo '{}' >"${OPENHEARTH_CONFIG_PATH}"

echo "==> Uninstall (state only)"
pnpm openhearth uninstall --state --yes --non-interactive

test ! -d "${OPENHEARTH_STATE_DIR}"

echo "OK"
