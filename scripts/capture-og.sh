#!/usr/bin/env bash
# Capture thumbnail + OG image for a project, enforcing the dimension standards
# defined in CLAUDE.md.
#
#   - Thumbnail: 1880×1175 device px (940×587.5 CSS) — 16:10 ratio
#                Matches the homepage card's aspect-ratio: 16/10 (object-fit:
#                cover, object-position: top), so the card displays the full
#                image with no clipping.
#                Canonical reference: public/img/og/http-402.png et al.
#
#   - OG image:  1880×988 device px (940×494 CSS) — 1.903 ratio
#                Matches og:image:width=1200 / og:image:height=630 declared by
#                projectMeta().
#
# Both are captured from the chart-island, top-aligned, height-clamped, and
# (when the natural cut falls mid-row) snapped UP to the nearest clean gap
# between rows. Width must equal 940 CSS px (the canonical chart-island width).
#
# Works for both the standalone HTML projects (which set .chart-island to 940px
# via their own CSS) and the React-island projects like /map/, whose chart width
# tracks the viewport. The script measures the chart-island once, then adjusts
# the viewport so the island renders at exactly 940 CSS px before capturing — a
# no-op for projects already at 940. Row-gap snapping is skipped when the project
# has no .agent-row/.bar-row elements (e.g. the scatter map).
#
# Usage:  scripts/capture-og.sh <slug> [wait_ms] [extra_hide_selector]
#
# Requires: dev server at localhost:4321, agent-browser, imagemagick (magick), jq

set -euo pipefail

SLUG="${1:?Usage: $0 <slug> [wait_ms] [extra_hide_selector]}"
WAIT_MS="${2:-1500}"
EXTRA_HIDE="${3:-}"
# Optional 4th arg: shift the crop window down by N CSS px. Lets a tall island
# (one that would otherwise clip its x-axis) trade top whitespace for bottom
# breathing room. Default 0 — every existing project is unaffected.
CROP_Y_OFFSET="${4:-0}"
SCALE=2

CHART_W_CSS=940
THUMB_H_CSS=588   # 1880×1176/2 — 16:10 ratio. (Allowing 1px of rounding slack.)
OG_H_CSS=494      # 1880×988/2 — 1.903 ratio.

VIEWPORT_W=1200   # starting width; adjusted below so the island lands at 940
VIEWPORT_H=1600

URL="http://localhost:4321/${SLUG}/"
THUMB_OUT="src/assets/projects/${SLUG}.png"
OG_OUT="public/img/og/${SLUG}.png"
TMP_FULL="/tmp/ab-full-${SLUG}-$$.png"

# Open the page at a given viewport width, hide chrome, and settle.
prepare_page() {
  local vp_w="$1"
  agent-browser set viewport "$vp_w" "$VIEWPORT_H" "$SCALE"
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
}

# Measure chart-island geometry + row-gap centerlines (gaps empty when no rows).
measure() {
  agent-browser --json eval "(() => {
    const island = document.querySelector('.chart-island');
    if (!island) return JSON.stringify({ error: 'no chart-island' });
    const ir = island.getBoundingClientRect();

    // Collect candidate gap centerlines. Works for either .agent-row or .bar-row.
    const rowSel = document.querySelectorAll('.agent-row').length
      ? '.agent-row'
      : '.bar-row';
    const rows = [...document.querySelectorAll(rowSel)];
    const gaps = [];
    for (let i = 0; i < rows.length - 1; i++) {
      const a = rows[i].getBoundingClientRect();
      const b = rows[i + 1].getBoundingClientRect();
      gaps.push({ y: (a.bottom + b.top) / 2, afterRow: i });
    }
    if (rows.length) {
      const last = rows[rows.length - 1].getBoundingClientRect();
      gaps.push({ y: last.bottom + 6, afterRow: rows.length - 1 });
    }
    return JSON.stringify({
      islandX: Math.round(ir.x),
      islandY: Math.round(ir.y),
      islandW: Math.round(ir.width),
      islandH: Math.round(ir.height),
      gaps: gaps.map(g => ({ y: Math.round(g.y - ir.y), afterRow: g.afterRow })),
    });
  })()" | jq -r '.data.result // .data // .'
}

require_island() {
  if jq -e '.error' <<<"$1" >/dev/null; then
    echo "❌ $(jq -r '.error' <<<"$1")"
    exit 1
  fi
}

echo "→ ${SLUG}: opening ${URL}"
prepare_page "$VIEWPORT_W"
MEASURE=$(measure)
require_island "$MEASURE"

# Island width tracks viewport width minus fixed page chrome. One linear
# adjustment lands it on the canonical 940 CSS px: solve new_vp such that
# island == CHART_W_CSS, given island == vp - (VIEWPORT_W - islandW).
ISLAND_W=$(jq -r '.islandW' <<<"$MEASURE")
if [ "$ISLAND_W" -ne "$CHART_W_CSS" ]; then
  NEW_VP=$(( CHART_W_CSS + VIEWPORT_W - ISLAND_W ))
  echo "→ ${SLUG}: chart-island measured ${ISLAND_W}px; adjusting viewport ${VIEWPORT_W}→${NEW_VP}px to hit ${CHART_W_CSS}px"
  VIEWPORT_W="$NEW_VP"
  prepare_page "$VIEWPORT_W"
  MEASURE=$(measure)
  require_island "$MEASURE"
fi

ISLAND_X=$(jq -r '.islandX' <<<"$MEASURE")
ISLAND_Y=$(jq -r '.islandY' <<<"$MEASURE")
ISLAND_W=$(jq -r '.islandW' <<<"$MEASURE")
ISLAND_H=$(jq -r '.islandH' <<<"$MEASURE")

if [ "$ISLAND_W" -ne "$CHART_W_CSS" ]; then
  echo "⚠ chart-island is ${ISLAND_W}px wide after adjustment, expected ${CHART_W_CSS}px. Cropping to ${CHART_W_CSS}px from the island's left edge."
fi

echo "→ ${SLUG}: chart-island ${ISLAND_W}×${ISLAND_H} CSS px, $(jq '.gaps | length' <<<"$MEASURE") row gaps measured"

agent-browser screenshot --full "$TMP_FULL"

# Pick the gap centerline at or just below a target height. If no gap is below
# the target, fall back to the target (image will end mid-row but at correct
# aspect). If the chart-island is shorter than the target, the script pads with
# the chart's navy background.
pick_height_with_gap_snap() {
  local target_h="$1"
  local picked
  picked=$(jq --argjson t "$target_h" '
    [.gaps[] | select(.y <= $t)] | sort_by(.y) | last // null
  ' <<<"$MEASURE")
  if [ "$picked" = "null" ] || [ -z "$picked" ]; then
    echo "$target_h"
  else
    jq -r '.y' <<<"$picked"
  fi
}

crop_to() {
  local out_path="$1"
  local target_h_css="$2"
  local snap_to_gap="$3"  # "yes" or "no"

  local h_css="$target_h_css"
  if [ "$snap_to_gap" = "yes" ] && [ "$ISLAND_H" -ge "$target_h_css" ]; then
    h_css=$(pick_height_with_gap_snap "$target_h_css")
  fi

  local target_w_dev=$(( CHART_W_CSS * SCALE ))
  local target_h_dev=$(( target_h_css * SCALE ))
  local crop_h_dev=$(( h_css * SCALE ))
  # Width is locked to the canonical 940 CSS px (not the measured island width),
  # so a sub-pixel island measurement can't push the output off 1880 device px.
  local crop_w_dev=$(( CHART_W_CSS * SCALE ))
  local x_dev=$(( ISLAND_X * SCALE ))
  local y_dev=$(( (ISLAND_Y + CROP_Y_OFFSET) * SCALE ))

  if [ "$crop_h_dev" -lt "$target_h_dev" ] && [ "$snap_to_gap" = "yes" ]; then
    # Snap landed above target: pad the bottom with navy to reach exact target
    magick "$TMP_FULL" -crop "${crop_w_dev}x${crop_h_dev}+${x_dev}+${y_dev}" +repage \
      -background "#1d2733" -gravity north -extent "${target_w_dev}x${target_h_dev}" \
      "$out_path"
  elif [ "$ISLAND_H" -lt "$target_h_css" ]; then
    # Chart-island shorter than target: crop what's there, pad to target
    local island_h_dev=$(( ISLAND_H * SCALE ))
    magick "$TMP_FULL" -crop "${crop_w_dev}x${island_h_dev}+${x_dev}+${y_dev}" +repage \
      -background "#1d2733" -gravity north -extent "${target_w_dev}x${target_h_dev}" \
      "$out_path"
  else
    # Exact crop at target height
    magick "$TMP_FULL" -crop "${target_w_dev}x${target_h_dev}+${x_dev}+${y_dev}" +repage \
      "$out_path"
  fi
}

# Thumbnail: 16:10, snap to clean gap so no bar is clipped on the homepage card
crop_to "$THUMB_OUT" "$THUMB_H_CSS" yes

# OG image: 1.903 ratio. Snap to gap too — social previews look better clean.
crop_to "$OG_OUT" "$OG_H_CSS" yes

# Verify dimensions
verify_dim() {
  local file="$1" target_w="$2" target_h="$3"
  local actual; actual=$(identify -format "%wx%h" "$file")
  local expected="${target_w}x${target_h}"
  if [ "$actual" != "$expected" ]; then
    echo "❌ $file is $actual, expected $expected"
    return 1
  fi
}

verify_dim "$THUMB_OUT" $(( CHART_W_CSS * SCALE )) $(( THUMB_H_CSS * SCALE ))
verify_dim "$OG_OUT" $(( CHART_W_CSS * SCALE )) $(( OG_H_CSS * SCALE ))

echo "→ ${SLUG}: thumbnail → $THUMB_OUT ($(identify -format "%wx%h" "$THUMB_OUT"), 16:10 for homepage card)"
echo "→ ${SLUG}: og image  → $OG_OUT ($(identify -format "%wx%h" "$OG_OUT"), 1.903 for og:image meta)"

rm -f "$TMP_FULL"
