#!/bin/sh
set -e

PBF="/data/venezuela-latest.osm.pbf"
MBTILES="/data/venezuela.mbtiles"
HASH_FILE="/data/.tilemaker-hash"

NEW_HASH=$(md5sum /config/config.json /config/process.lua | md5sum | cut -d' ' -f1)
OLD_HASH=$(cat "$HASH_FILE" 2>/dev/null || echo "")

if [ ! -f "$PBF" ]; then
  echo "Waiting for PBF file from Valhalla..."
  while [ ! -f "$PBF" ]; do sleep 30; done
fi

if [ "$NEW_HASH" != "$OLD_HASH" ] || [ ! -f "$MBTILES" ]; then
  echo "Config changed or missing MBTiles. Regenerating..."
  rm -f "$MBTILES"
  /usr/src/app/tilemaker "$PBF" \
    --output "$MBTILES" \
    --config /config/config.json \
    --process /config/process.lua
  echo "$NEW_HASH" > "$HASH_FILE"
  echo "MBTiles regeneration complete"
fi
