#!/usr/bin/env bash
set -e

# Screenshot the three-body-problem chart + zone-bar (replaces screenshot.mjs)
# Requires: agent-browser, imagemagick

SCALE=2
URL="http://localhost:4321/three-body-problem/"
OUT="public/img/projects/three-body-problem.png"
TMP="/tmp/ab-screenshot-full-$$.png"

agent-browser set viewport 1050 2000 "$SCALE"
agent-browser open "$URL"
agent-browser wait 2000

# Get bounding box of chart-container + zone-bar combined (CSS pixels)
CLIP=$(agent-browser --json eval "(() => {
  const chart = document.querySelector('.chart-container');
  const zoneBar = document.querySelector('.zone-bar');
  const r1 = chart.getBoundingClientRect();
  const r2 = zoneBar.getBoundingClientRect();
  return JSON.stringify({
    x: Math.round(r1.x),
    y: Math.round(r1.y),
    w: Math.round(r1.width),
    h: Math.round(r2.bottom - r1.top)
  });
})()" | jq -r '.data // .')

X=$(echo "$CLIP" | jq -r '.x * '"$SCALE")
Y=$(echo "$CLIP" | jq -r '.y * '"$SCALE")
W=$(echo "$CLIP" | jq -r '.w * '"$SCALE")
H=$(echo "$CLIP" | jq -r '.h * '"$SCALE")

agent-browser screenshot --full "$TMP"
magick "$TMP" -crop "${W}x${H}+${X}+${Y}" +repage "$OUT"
rm -f "$TMP"

echo "Screenshot saved: ${W}x${H} ($(echo "$CLIP" | jq -r '.w')x$(echo "$CLIP" | jq -r '.h') @ ${SCALE}x)"
agent-browser close
