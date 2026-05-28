#!/usr/bin/env bash
# Capture thumbnail + OG image for a project, enforcing the dimension standard.
#
# Standard (from CLAUDE.md):
#   - Thumbnail: full chart-island, no constraints on dimensions
#   - OG image:  1880×988 device px (940×494 CSS px at 2× scale)
#                = 1.903 aspect ratio = matches og:image:width/height meta
#
# Usage:  scripts/capture-og.sh <slug> [wait_ms] [extra_hide_selector]
#
# Requires: dev server at localhost:4321, agent-browser, imagemagick (magick), jq

set -euo pipefail

SLUG="${1:?Usage: $0 <slug> [wait_ms] [extra_hide_selector]}"
WAIT_MS="${2:-1500}"
EXTRA_HIDE="${3:-}"
SCALE=2

# Canonical OG dimensions in CSS pixels (1.903 ratio)
OG_W_CSS=940
OG_H_CSS=494

URL="http://localhost:4321/${SLUG}/"
THUMB_OUT="src/assets/projects/${SLUG}.png"
OG_OUT="public/img/og/${SLUG}.png"
TMP_FULL="/tmp/ab-full-${SLUG}-$$.png"

echo "→ ${SLUG}: opening ${URL}"
agent-browser set viewport 1200 1400 "$SCALE"
agent-browser open "$URL"
agent-browser wait "$WAIT_MS"

agent-browser eval "(() => {
  const hide = sel => { const el = document.querySelector(sel); if (el) el.style.display = 'none'; };
  hide('.site-header-fixed');
  hide('.project-breadcrumb');
  hide('.title-block');
  hide('.project-byline');
  ${EXTRA_HIDE:+hide('$EXTRA_HIDE');}
  document.body.style.paddingTop = '0';
  document.body.style.background = '#1d2733';
})()"

agent-browser wait 300

CLIP=$(agent-browser --json eval "(() => {
  const viz = document.querySelector('.chart-island');
  const r = viz.getBoundingClientRect();
  return JSON.stringify({
    x: Math.round(r.x),
    y: Math.round(r.y),
    w: Math.round(r.width),
    h: Math.round(r.height)
  });
})()" | jq -r '.data.result // .data // .')

X_CSS=$(jq -r '.x' <<<"$CLIP")
Y_CSS=$(jq -r '.y' <<<"$CLIP")
W_CSS=$(jq -r '.w' <<<"$CLIP")
H_CSS=$(jq -r '.h' <<<"$CLIP")

echo "→ ${SLUG}: chart-island = ${W_CSS}x${H_CSS} CSS px"

if [ "$W_CSS" -ne "$OG_W_CSS" ]; then
  echo "  ⚠ chart-island is ${W_CSS}px wide, expected ${OG_W_CSS}px. OG aspect ratio may be off."
fi

X=$(( X_CSS * SCALE ))
Y=$(( Y_CSS * SCALE ))
W=$(( W_CSS * SCALE ))
H=$(( H_CSS * SCALE ))

agent-browser screenshot --full "$TMP_FULL"

# Thumbnail = full chart-island
magick "$TMP_FULL" -crop "${W}x${H}+${X}+${Y}" +repage "$THUMB_OUT"
echo "→ ${SLUG}: thumbnail → $THUMB_OUT (${W_CSS}x${H_CSS} CSS px)"

# OG image = chart-island top, cropped to exactly 1880×988 (or padded with navy if shorter)
OG_W_DEV=$(( OG_W_CSS * SCALE ))
OG_H_DEV=$(( OG_H_CSS * SCALE ))

if [ "$H_CSS" -ge "$OG_H_CSS" ]; then
  # Tall enough — crop to the canonical height from the top
  magick "$TMP_FULL" -crop "${W}x${OG_H_DEV}+${X}+${Y}" +repage "$OG_OUT"
else
  # Too short — crop what we have, then pad bottom with the chart's navy background
  magick "$TMP_FULL" -crop "${W}x${H}+${X}+${Y}" +repage \
    -background "#1d2733" -gravity north -extent "${OG_W_DEV}x${OG_H_DEV}" \
    "$OG_OUT"
fi

# Verify
ACTUAL=$(identify -format "%wx%h" "$OG_OUT")
if [ "$ACTUAL" != "${OG_W_DEV}x${OG_H_DEV}" ]; then
  echo "  ❌ OG image is ${ACTUAL}, expected ${OG_W_DEV}x${OG_H_DEV}"
  exit 1
fi
echo "→ ${SLUG}: og image  → $OG_OUT (${OG_W_DEV}x${OG_H_DEV} device px = ${OG_W_CSS}x${OG_H_CSS} CSS px)"

rm -f "$TMP_FULL"
