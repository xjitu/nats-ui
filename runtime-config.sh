#!/bin/sh
set -eu

base_url="${MONITORING_BASE_URL:-/monitoring}"
case "$base_url" in
  /*|http://*|https://*) ;;
  *)
    echo "MONITORING_BASE_URL must be an absolute URL or path" >&2
    exit 1
    ;;
esac

escaped=$(printf '%s' "$base_url" | sed 's/[\\\"]/\\&/g')
printf '%s\n' "{\"monitoringBaseUrl\":\"$escaped\"}" > /usr/share/nginx/html/assets/runtime-config.json
exec nginx -g 'daemon off;'
