#!/usr/bin/env bash
set -e

# Screenshot the status page banner + component bars (replaces screenshot-status.mjs)
# Requires: agent-browser, imagemagick

SCALE=2
URL="http://localhost:4321/status/"
OUT="public/img/projects/status.png"
TMP="/tmp/ab-screenshot-status-$$.png"

agent-browser set viewport 740 1200 "$SCALE"
agent-browser open "$URL"

# Get bounding box: .page top through .status-banner bottom + 300px
CLIP=$(agent-browser --json eval "(() => {
  const pg = document.querySelector('.page');
  const banner = document.querySelector('.status-banner');
  const r1 = pg.getBoundingClientRect();
  const r2 = banner.getBoundingClientRect();
  return JSON.stringify({
    x: Math.round(r1.x),
    y: Math.round(r1.y),
    w: Math.round(r1.width),
    h: Math.round(r2.bottom - r1.top + 300)
  });
})()" | jq -r '.data // .')

X=$(echo "$CLIP" | jq -r '.x * '"$SCALE")
Y=$(echo "$CLIP" | jq -r '.y * '"$SCALE")
W=$(echo "$CLIP" | jq -r '.w * '"$SCALE")
H=$(echo "$CLIP" | jq -r '.h * '"$SCALE")

agent-browser screenshot --full "$TMP"
magick "$TMP" -crop "${W}x${H}+${X}+${Y}" +repage "$OUT"
rm -f "$TMP"

echo "Screenshot saved: $((W))x$((H)) ($(echo "$CLIP" | jq -r '.w')x$(echo "$CLIP" | jq -r '.h') @ ${SCALE}x)"
agent-browser close
