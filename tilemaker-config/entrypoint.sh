#!/bin/sh
set -e

PBF_FILE="/data/venezuela-latest.osm.pbf"
MBTILES_FILE="/data/venezuela.mbtiles"

echo "Waiting for PBF file from Valhalla..."
while [ ! -f "$PBF_FILE" ]; do
  sleep 30
done
echo "PBF file found: $PBF_FILE"

if [ -f "$MBTILES_FILE" ]; then
  echo "MBTiles already exists, skipping tilemaker"
  exit 0
fi

echo "Starting tilemaker conversion..."
tilemaker --input "$PBF_FILE" \
          --output "$MBTILES_FILE" \
          --config /config/config.json \
          --process /config/process.lua

echo "Tilemaker complete: $MBTILES_FILE"
