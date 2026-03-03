import { useState, useEffect, useRef } from "react";
import { mapClient as supabase } from "../../lib/supabase";

/* ── Dark palette (sampled from /public/img/sideband-icon.png) ─ */
const C = {
  bg:      "#1d2733",   // page background, header background
  surface: "#253040",   // cards, buttons, plot area, tooltips
  text:    "#EEEBE4",   // primary text
  accent:  "#0EA5C9",   // cyan accent
  amber:   "#A97C40",   // secondary accent
};

/* ── Font stacks ───────────────────────────────────────────── */
const F = {
  display: "'Roboto Slab', Georgia, 'Times New Roman', serif",
  body:    "'Lora', Georgia, 'Times New Roman', serif",
  ui:      "'Space Grotesk', system-ui, sans-serif",
  mono:    "monospace",
};

/* ── Type scale ─────────────────────────────────────────────── */
const T = {
  eyebrow:   { d: 13, m: 11 },
  body:      { d: 14, m: 12 },
  label:     { d: 13, m: 11 },
  detail:    { d: 12, m: 10 },
  heading:   { d: 28, m: 20 },
  subtitle:  { d: 15, m: 11 },
  chart: {
    axis:    { d: 13, m: 9  },
    quad:    { d: 12 },
    dot:     { d: 11 },
    tipName: { d: 13, m: 10 },
    tipNote: { d: 11, m: 8  },
  },
};

function ScatterPlot({ data, layers, width, height, selectedLayer, hoveredPoint, setHoveredPoint, showDiagonal }) {
  const narrow = width < 500;
  const pad = narrow
    ? { top: 14, right: 6, bottom: 24, left: 22 }
    : { top: 30, right: 10, bottom: 36, left: 24 };
  const pw = width - pad.left - pad.right;
  const ph = height - pad.top - pad.bottom;
  const toX = (v) => pad.left + (v / 100) * pw;
  const toY = (v) => pad.top + ph - (v / 100) * ph;
  const isSingleLayer = selectedLayer !== "all";
  const filtered = isSingleLayer ? data.filter(d => d.layer === selectedLayer) : data;
  const labelSize = narrow ? T.chart.axis.m : T.chart.axis.d;

  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <rect x={pad.left} y={pad.top} width={pw} height={ph} fill={C.surface} rx={4} />
      {!narrow && <>
        <text x={pad.left + pw * 0.25} y={pad.top + ph * 0.1} fill={`${C.text}66`} fontSize={T.chart.quad.d} textAnchor="middle" fontFamily="monospace">WALLED GARDEN</text>
        <text x={pad.left + pw * 0.75} y={pad.top + ph * 0.1} fill={`${C.text}66`} fontSize={T.chart.quad.d} textAnchor="middle" fontFamily="monospace">PERMISSIONLESS</text>
        <text x={pad.left + pw * 0.25} y={pad.top + ph * 0.95} fill={`${C.text}66`} fontSize={T.chart.quad.d} textAnchor="middle" fontFamily="monospace">GATEKEPT</text>
        <text x={pad.left + pw * 0.75} y={pad.top + ph * 0.95} fill={`${C.text}66`} fontSize={T.chart.quad.d} textAnchor="middle" fontFamily="monospace">OPEN CORE</text>
      </>}
      <line x1={toX(50)} y1={pad.top} x2={toX(50)} y2={pad.top + ph} stroke={`${C.text}12`} strokeDasharray="4,4" />
      <line x1={pad.left} y1={toY(50)} x2={pad.left + pw} y2={toY(50)} stroke={`${C.text}12`} strokeDasharray="4,4" />
      {showDiagonal && <line x1={toX(0)} y1={toY(0)} x2={toX(100)} y2={toY(100)} stroke={`${C.text}30`} strokeWidth={1} strokeDasharray="6,4" />}
      <text x={pad.left} y={pad.top + ph + (narrow ? 22 : 35)} fill={C.text} fontSize={labelSize} fontFamily="monospace">CLOSED</text>
      <text x={pad.left + pw} y={pad.top + ph + (narrow ? 22 : 35)} fill={C.text} fontSize={labelSize} textAnchor="end" fontFamily="monospace">OPEN</text>
      <text x={pad.left - (narrow ? 8 : 14)} y={pad.top + ph} fill={C.text} fontSize={labelSize} fontFamily="monospace" textAnchor="start" transform={`rotate(-90, ${pad.left - (narrow ? 8 : 14)}, ${pad.top + ph})`}>CENTRALIZED</text>
      <text x={pad.left - (narrow ? 8 : 14)} y={pad.top} fill={C.text} fontSize={labelSize} fontFamily="monospace" textAnchor="end" transform={`rotate(-90, ${pad.left - (narrow ? 8 : 14)}, ${pad.top})`}>DISTRIBUTED</text>
      {filtered.map((d) => {
        const isHovered = hoveredPoint === d.id;
        const cx = toX(d.x);
        const cy = toY(d.y);
        const layerColor = layers[d.layer]?.color || C.text;
        return (
          <g key={d.id} onMouseEnter={() => setHoveredPoint(d.id)} onMouseLeave={() => setHoveredPoint(null)} style={{ cursor: "pointer" }}>
            <circle cx={cx} cy={cy} r={14} fill="transparent" />
            <circle cx={cx} cy={cy} r={isHovered ? 7 : 4} fill={layerColor} opacity={isHovered ? 1 : 0.85} stroke={isHovered ? C.text : "none"} strokeWidth={2} />
            {isSingleLayer && !isHovered && !narrow && <text x={cx + 8} y={cy + 3} fill={layerColor} fontSize={T.chart.dot.d} fontFamily="monospace" opacity={0.85}>{d.short}</text>}
            {isHovered && (() => {
              const maxChars = Math.max(d.name.length, d.note.length);
              const charW = narrow ? 6.2 : 7.2;
              const boxW = Math.min(maxChars * charW + 24, pw * 0.7);
              const boxH = narrow ? 46 : 52;
              const flipX = cx + boxW + 20 > pad.left + pw;
              const tx = flipX ? cx - boxW - 14 : cx + 14;
              const flipY = cy - boxH < pad.top;
              const ty = flipY ? cy + 8 : cy - boxH + 4;
              return (<>
                <rect x={tx} y={ty} width={boxW} height={boxH} fill={C.bg} stroke={layerColor} strokeWidth={1} rx={4} opacity={0.95} />
                <text x={tx + 10} y={ty + (narrow ? 17 : 19)} fill={C.text} fontSize={narrow ? T.chart.tipName.m : T.chart.tipName.d} fontFamily="monospace" fontWeight="bold">{d.name}</text>
                <text x={tx + 10} y={ty + (narrow ? 33 : 37)} fill={C.text} fontSize={narrow ? T.chart.tipNote.m : T.chart.tipNote.d} fontFamily="monospace" opacity={0.6}>{d.note}</text>
              </>);
            })()}
          </g>
        );
      })}
    </svg>
  );
}

function RubricAccordion({ mobile }) {
  const [openSection, setOpenSection] = useState(null);
  const toggle = (key) => setOpenSection(openSection === key ? null : key);

  const xLevels = [
    { range: "0-20", label: "Closed", desc: "Single entity controls access, pricing, rules, and can revoke at will. Proprietary spec or no spec.", test: "Can you use this without one company's agreement? No." },
    { range: "20-40", label: "Gated", desc: "Multiple vendors or open-ish spec, but participation requires approval or ecosystem buy-in.", test: "Could a solo dev ship on this in a weekend without asking? Unlikely." },
    { range: "40-60", label: "Mixed", desc: "Open spec, but practical usage involves controlled components: auth layers, hosting, compliance.", test: "Open spec AND usable without a controlled dependency? Partially." },
    { range: "60-80", label: "Open-governed", desc: "Open spec under neutral governance (IETF, Linux Foundation, W3C). Anyone can implement.", test: "Neutral governance body AND multiple independent implementations? Yes." },
    { range: "80-100", label: "Permissionless", desc: "No permission needed. No account, no API key, no ToS. Fork it, run it, modify it.", test: "Use it right now with zero interaction with any organization? Yes." },
  ];

  const yLevels = [
    { range: "0-20", label: "Centralized", desc: "Runs in one company's infrastructure. Single point of failure. One operator.", test: "Company's servers go down, everything stops? Yes." },
    { range: "20-40", label: "Hosted", desc: "Runs on shared infrastructure, small number of providers. Self-hosting possible but rare.", test: "Fewer than 5 meaningful operators? Yes." },
    { range: "40-60", label: "Federated", desc: "Multiple independent operators running compatible infrastructure. No single point of failure.", test: "10+ independent parties operate without coordinating? Getting there." },
    { range: "60-80", label: "Multi-operator", desc: "Many independent operators. No single entity required. Some concentration remains.", test: "Top 3 operators vanish, keeps working? Probably." },
    { range: "80-100", label: "Fully distributed", desc: "Thousands+ independent nodes. No privileged operator. Peer-to-peer or on-device.", test: "Works offline or on a peer mesh, no central coordination? Yes." },
  ];

  const chevron = (isOpen) => (
    <span style={{ display: "inline-block", transition: "transform 0.2s", transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", marginRight: 8, fontSize: mobile ? 10 : 12, opacity: 0.5 }}>{"\u25B6"}</span>
  );

  const renderLevels = (levels) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 0, marginTop: 12, marginBottom: 8 }}>
      {levels.map((lv, i) => (
        <div key={i} style={{ display: "flex", gap: 0, fontSize: mobile ? T.body.m : T.body.d, lineHeight: 1.5, paddingBottom: 10 }}>
          <div style={{ width: 52, fontFamily: F.mono, fontSize: mobile ? T.detail.m : T.detail.d, color: C.text, opacity: 0.35, flexShrink: 0, paddingTop: 1 }}>{lv.range}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontFamily: F.ui, fontSize: mobile ? T.detail.m : T.label.d, fontWeight: 700, color: C.text, opacity: 0.8 }}>{lv.label}</span>
            <span style={{ fontFamily: F.body, color: C.text, opacity: 0.45, marginLeft: 8, fontSize: mobile ? T.detail.m : T.label.d }}>{lv.desc}</span>
            <div style={{ fontFamily: F.mono, fontSize: mobile ? T.detail.m : T.detail.d, color: C.accent, opacity: 0.5, marginTop: 2 }}>{lv.test}</div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ marginTop: mobile ? 20 : 28, padding: "16px 0", borderTop: `1px solid ${C.text}15` }}>
      <div style={{ fontFamily: F.ui, fontSize: mobile ? T.detail.m : T.detail.d, color: C.text, opacity: 0.4, marginBottom: mobile ? 10 : 14, letterSpacing: "0.05em" }}>SCORING RUBRIC</div>
      <button onClick={() => toggle("x")} style={{ background: "none", border: "none", color: C.text, cursor: "pointer", fontFamily: F.ui, fontSize: mobile ? T.body.m : T.body.d, padding: "8px 0", width: "100%", textAlign: "left", display: "flex", alignItems: mobile ? "flex-start" : "center", flexDirection: mobile ? "column" : "row" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          {chevron(openSection === "x")}
          <span style={{ fontWeight: 700 }}>{"Closed \u2194 Open"}</span>
        </div>
        <span style={{ opacity: 0.4, marginLeft: mobile ? 18 : 12, fontWeight: 400, fontSize: mobile ? T.detail.m : T.label.d }}>Who decides if you can participate?</span>
      </button>
      {openSection === "x" && <div style={{ padding: "0 0 8px 18px" }}>{renderLevels(xLevels)}</div>}
      <button onClick={() => toggle("y")} style={{ background: "none", border: "none", color: C.text, cursor: "pointer", fontFamily: F.ui, fontSize: mobile ? T.body.m : T.body.d, padding: "8px 0", width: "100%", textAlign: "left", display: "flex", alignItems: mobile ? "flex-start" : "center", flexDirection: mobile ? "column" : "row" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          {chevron(openSection === "y")}
          <span style={{ fontWeight: 700 }}>{"Centralized \u2194 Distributed"}</span>
        </div>
        <span style={{ opacity: 0.4, marginLeft: mobile ? 18 : 12, fontWeight: 400, fontSize: mobile ? T.detail.m : T.label.d }}>Where does it run and who operates it?</span>
      </button>
      {openSection === "y" && <div style={{ padding: "0 0 8px 18px" }}>{renderLevels(yLevels)}</div>}
    </div>
  );
}

// SSR-safe initial width estimate
function getInitialWidth() {
  if (typeof window !== 'undefined') {
    return Math.min(window.innerWidth - 32, 1200);
  }
  return 760;
}

export default function AgentInfraMap() {
  const [view, setView] = useState("all");
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [showDiagonal, setShowDiagonal] = useState(true);
  const [layers, setLayers] = useState(null);
  const [layerKeys, setLayerKeys] = useState([]);
  const [data, setData] = useState(null);
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState(null);
  const [chartWidth, setChartWidth] = useState(getInitialWidth);
  const observerRef = useRef(null);

  const setChartRef = (node) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    if (node) {
      const observer = new ResizeObserver(entries => {
        setChartWidth(entries[0].contentRect.width);
      });
      observer.observe(node);
      observerRef.current = observer;
    }
  };

  useEffect(() => {
    if (!supabase) return;
    Promise.all([
      supabase.from("layers").select("*").order("sort_order"),
      supabase.from("entities").select("*").eq("reviewed", true),
      supabase.from("insights").select("*").eq("active", true).order("sort_order"),
    ]).then(([layersRes, entitiesRes, insightsRes]) => {
      if (layersRes.error) throw layersRes.error;
      if (entitiesRes.error) throw entitiesRes.error;
      if (insightsRes.error) throw insightsRes.error;

      const layersObj = {};
      const keys = [];
      for (const row of layersRes.data) {
        keys.push(row.key);
        layersObj[row.key] = {
          name: row.name,
          color: row.color,
          status: row.status,
          statusNote: row.status_note,
        };
      }
      setLayers(layersObj);
      setLayerKeys(keys);

      setData(entitiesRes.data.map(e => ({
        id: e.id,
        layer: e.layer,
        short: e.short_name,
        name: e.full_name,
        x: e.current_x,
        y: e.current_y,
        note: e.note,
      })).filter(e => layersObj[e.layer]));

      setInsights(insightsRes.data.map(i => ({
        title: i.title,
        text: i.body,
        color: i.color,
      })));
    }).catch(err => {
      console.error("Failed to load map data:", err);
      setError(err.message || "Failed to load map data");
    });
  }, []);

  const loading = !layers && !error;

  if (loading) {
    return (
      <div style={{ background: C.bg, minHeight: "100vh", padding: "32px 24px", fontFamily: F.ui, color: C.text, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: F.ui, fontSize: 12, opacity: 0.4 }}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: C.bg, minHeight: "100vh", padding: "32px 24px", fontFamily: F.ui, color: C.text, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: F.ui, fontSize: 12, opacity: 0.5, color: C.amber }}>Unable to load map data</div>
      </div>
    );
  }

  const mobile = chartWidth < 500;
  const chartHeight = Math.round(Math.min(chartWidth * (mobile ? 0.85 : 0.6), 680));

  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: mobile ? "20px 16px" : "32px 40px", fontFamily: F.ui, color: C.text }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: mobile ? 14 : 20 }}>
          <h1 style={{ fontFamily: F.display, fontSize: mobile ? T.heading.m : T.heading.d, fontWeight: 700, margin: 0, lineHeight: 1.2, color: C.text }}>Agent-Era Infrastructure Map</h1>
          <p style={{ fontFamily: F.body, fontSize: mobile ? T.body.m : T.body.d, opacity: 0.5, margin: "8px 0 0", lineHeight: 1.5, maxWidth: 640 }}>Companies and protocols scored on how open and how distributed they are, across five layers of the emerging agent stack—each with a maturity verdict.</p>
        </div>
        {mobile ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
            {["all", ...layerKeys].map(v => (
              <button key={v} onClick={() => { setView(v); setHoveredPoint(null); }} style={{
                background: view === v ? (layers[v]?.color || C.text) : C.surface,
                color: view === v ? C.bg : C.text,
                border: `1px solid ${view === v ? (layers[v]?.color || C.text) : `${C.text}20`}`,
                padding: "5px 10px", borderRadius: 4, cursor: "pointer",
                fontFamily: F.ui, fontSize: 11, fontWeight: view === v ? 700 : 400, transition: "all 0.15s"
              }}>{v === "all" ? "All" : layers[v].name}</button>
            ))}
            <button onClick={() => setShowDiagonal(!showDiagonal)} style={{
              background: showDiagonal ? `${C.text}20` : "transparent", color: C.text,
              border: `1px solid ${showDiagonal ? `${C.text}40` : `${C.text}20`}`,
              padding: "5px 10px", borderRadius: 4, cursor: "pointer",
              fontFamily: F.ui, fontSize: 11, opacity: showDiagonal ? 1 : 0.5, transition: "all 0.15s"
            }}>{showDiagonal ? "\u2713 " : ""}Diagonal</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20, alignItems: "center" }}>
            {["all", ...layerKeys].map(v => (
              <button key={v} onClick={() => { setView(v); setHoveredPoint(null); }} style={{
                background: view === v ? (layers[v]?.color || C.text) : C.surface,
                color: view === v ? C.bg : C.text,
                border: `1px solid ${view === v ? (layers[v]?.color || C.text) : `${C.text}20`}`,
                padding: "5px 14px", borderRadius: 4, cursor: "pointer",
                fontFamily: F.ui, fontSize: T.label.d, fontWeight: view === v ? 700 : 400, transition: "all 0.15s"
              }}>{v === "all" ? "All layers" : layers[v].name}</button>
            ))}
            <div style={{ flex: 1 }} />
            <button onClick={() => setShowDiagonal(!showDiagonal)} style={{
              background: showDiagonal ? `${C.text}20` : "transparent", color: C.text,
              border: `1px solid ${showDiagonal ? `${C.text}40` : `${C.text}20`}`,
              padding: "5px 14px", borderRadius: 4, cursor: "pointer",
              fontFamily: F.ui, fontSize: T.label.d, opacity: showDiagonal ? 1 : 0.5, transition: "all 0.15s"
            }}>{showDiagonal ? "\u2713 " : ""}Diagonal</button>
          </div>
        )}
        {view === "all" && (
          <div style={{
            fontFamily: F.ui,
            fontSize: mobile ? T.detail.m : T.detail.d,
            color: C.text, opacity: 0.35,
            letterSpacing: "0.03em",
            marginBottom: mobile ? 4 : 8,
            marginTop: mobile ? 0 : -12,
          }}>
            Select a layer to reveal labels
          </div>
        )}
        <div ref={setChartRef}>
          <ScatterPlot data={data} layers={layers} width={chartWidth} height={chartHeight} selectedLayer={view} hoveredPoint={hoveredPoint} setHoveredPoint={setHoveredPoint} showDiagonal={showDiagonal} />
        </div>
        <div style={{ marginTop: mobile ? 20 : 28, padding: "16px 0", borderTop: `1px solid ${C.text}15` }}>
          <div style={{ fontFamily: F.ui, fontSize: mobile ? T.detail.m : T.detail.d, color: C.text, opacity: 0.4, marginBottom: mobile ? 10 : 14, letterSpacing: "0.05em" }}>LAYER MATURITY</div>
          {mobile ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {layerKeys.map(key => (
                <div key={key} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: layers[key].color, flexShrink: 0 }} />
                    <div style={{ fontFamily: F.ui, fontSize: T.label.m, color: layers[key].color, fontWeight: "bold" }}>{layers[key].name}</div>
                    <div style={{ fontFamily: F.ui, fontSize: T.detail.m, color: C.text, opacity: 0.9, background: C.surface, padding: "2px 8px", borderRadius: 4 }}>{layers[key].status}</div>
                  </div>
                  <div style={{ fontFamily: F.body, fontSize: T.detail.m, color: C.text, opacity: 0.4, paddingLeft: 14, lineHeight: 1.4 }}>{layers[key].statusNote}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${layerKeys.length}, 1fr)`, gap: 10 }}>
              {layerKeys.map(key => (
                <div key={key} style={{
                  background: C.surface,
                  border: "1px solid transparent",
                  borderRadius: 6, padding: "14px 16px", textAlign: "left",
                  display: "flex", flexDirection: "column",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: layers[key].color, flexShrink: 0 }} />
                    <div style={{ fontFamily: F.ui, fontSize: T.label.d, color: layers[key].color, fontWeight: "bold" }}>{layers[key].name}</div>
                  </div>
                  <div style={{ fontFamily: F.ui, fontSize: T.detail.d, color: C.text, opacity: 0.9, background: C.bg, display: "inline-block", padding: "2px 8px", borderRadius: 4, marginBottom: 8, alignSelf: "flex-start" }}>{layers[key].status}</div>
                  <div style={{ fontFamily: F.body, fontSize: T.detail.d, color: C.text, opacity: 0.4, lineHeight: 1.45 }}>{layers[key].statusNote}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        {insights && insights.length > 0 && (
          <div style={{ marginTop: mobile ? 20 : 28, padding: "16px 0", borderTop: `1px solid ${C.text}15` }}>
            <div style={{ fontFamily: F.ui, fontSize: mobile ? T.detail.m : T.detail.d, color: C.text, opacity: 0.4, marginBottom: mobile ? 10 : 14, letterSpacing: "0.05em" }}>WHAT THE MAP REVEALS</div>
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 12 }}>
              {insights.map((card, i) => (
                <div key={i} style={{ background: C.surface, padding: mobile ? "12px 14px" : "16px 20px", borderRadius: 6, borderLeft: `3px solid ${card.color}40` }}>
                  <div style={{ fontFamily: F.ui, fontSize: mobile ? T.label.m : T.label.d, fontWeight: 700, color: card.color, marginBottom: 6 }}>{card.title}</div>
                  <div style={{ fontFamily: F.body, fontSize: mobile ? T.body.m : T.body.d, opacity: 0.6, lineHeight: 1.5 }}>{card.text}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        <RubricAccordion mobile={mobile} />
      </div>
    </div>
  );
}
