#!/bin/sh
set -e

PBF="/data/venezuela-latest.osm.pbf"
MBTILES="/data/venezuela.mbtiles"
HASH_FILE="/data/.tilemaker-hash"

if [ ! -f "$PBF" ]; then
  echo "Waiting for PBF..."
  while [ ! -f "$PBF" ]; do sleep 30; done
fi

NEW_HASH=$(/usr/src/app/tilemaker --version 2>/dev/null | md5sum | cut -d' ' -f1 | head -c 8)
OLD_HASH=$(cat "$HASH_FILE" 2>/dev/null || echo "")

if [ "$NEW_HASH" != "$OLD_HASH" ] || [ ! -f "$MBTILES" ]; then
  echo "Generating MBTiles with OpenMapTiles schema..."
  rm -f "$MBTILES"
  /usr/src/app/tilemaker "$PBF" \
    --output "$MBTILES" \
    --config /usr/src/app/resources/config-openmaptiles.json \
    --process /usr/src/app/resources/process-openmaptiles.lua
  echo "$NEW_HASH" > "$HASH_FILE"
  echo "Done"
fi
