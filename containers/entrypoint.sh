#!/bin/sh
set -eu
PORT="${PORT:-8080}"
case "${PORT:-8080}" in
  ''|*[!0-9]*) echo 'PORT must be numeric' >&2; exit 64 ;;
esac
if [ "$PORT" -lt 1 ] || [ "$PORT" -gt 65535 ]; then
  echo 'PORT must be in 1..65535' >&2; exit 64
fi
case "$FPA_SERVICE" in
  fpa-proxy) export FPA_PROXY_LISTEN_ADDR="${FPA_PROXY_LISTEN_ADDR:-0.0.0.0:$PORT}" ;;
  fpa-gateway) export FPA_GATEWAY_LISTEN_ADDR="${FPA_GATEWAY_LISTEN_ADDR:-0.0.0.0:$PORT}" ;;
  *) echo 'Unknown FPA_SERVICE' >&2; exit 64 ;;
esac
exec /usr/local/bin/service "$@"
