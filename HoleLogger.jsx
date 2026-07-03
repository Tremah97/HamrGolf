import React, { useState, useMemo } from "react";

// ── Course seed data (Eskdale front/back pars from Tom's cards) ──────────
const ESKDALE_PARS = [4,4,4,3,4,4,4,3,4, 3,4,4,5,3,4,3,4,3];

// A hole's logged state
const emptyHole = (par) => ({
  strokes: par,          // default to par, tap ± to adjust
  fairwayHit: null,      // 'HIT' | 'LEFT' | 'RIGHT' | 'SHORT' — null on par 3
  gir: false,
  putts: 2,
  penalties: 0,
  upDownAtt: false,      // auto-derived, shown for confirmation
  upDownMade: false,
});

// ── Palette: dawn-round greens, warm and legible in sun ─────────────────
const C = {
  turf: "#14351F",       // deep fairway green (primary)
  turfLite: "#1E4A2C",
  flag: "#E8B84B",       // flagstick gold — the accent
  sand: "#E7DCC4",       // bunker sand — surfaces/cards
  chalk: "#F7F4EC",      // background
  ink: "#0E2415",
  slate: "#5C6B5F",
  miss: "#C4602E",       // clay — misses/penalties
  ok: "#3E7D4F",         // success green
};

export default function HoleLogger() {
  const pars = ESKDALE_PARS;
  const [holes, setHoles] = useState(() => pars.map(emptyHole));
  const [current, setCurrent] = useState(0);      // hole index 0-17
  const [showSummary, setShowSummary] = useState(false);

  const par = pars[current];
  const isPar3 = par === 3;
  const h = holes[current];

  const update = (patch) => {
    setHoles((prev) => {
      const next = [...prev];
      const merged = { ...next[current], ...patch };
      // derive up-and-down opportunity: missed green but got on + 1 putt
      const missedGreen = !merged.gir;
      const gotUpAndDown = missedGreen && merged.putts <= 1 && merged.strokes <= par + 1;
      merged.upDownAtt = missedGreen && merged.strokes < par + 3; // had a realistic chance
      merged.upDownMade = gotUpAndDown;
      next[current] = merged;
      return next;
    });
  };

  const go = (dir) => {
    const n = current + dir;
    if (n < 0) return;
    if (n > 17) { setShowSummary(true); return; }
    setCurrent(n);
  };

  // ── Running totals ────────────────────────────────────────────────────
  const totals = useMemo(() => {
    const played = holes.slice(0, current + 1);
    const score = played.reduce((s, x) => s + x.strokes, 0);
    const parSoFar = pars.slice(0, current + 1).reduce((s, p) => s + p, 0);
    return { score, toPar: score - parSoFar, thru: current + 1 };
  }, [holes, current, pars]);

  if (showSummary) return <Summary holes={holes} pars={pars} onBack={() => setShowSummary(false)} />;

  const scoreVsPar = h.strokes - par;
  const scoreLabel =
    scoreVsPar <= -2 ? "Eagle" : scoreVsPar === -1 ? "Birdie" :
    scoreVsPar === 0 ? "Par" : scoreVsPar === 1 ? "Bogey" :
    scoreVsPar === 2 ? "Double" : `+${scoreVsPar}`;

  return (
    <div style={{
      fontFamily: "'DM Sans', system-ui, sans-serif",
      background: C.chalk, color: C.ink, minHeight: "100vh",
      maxWidth: 440, margin: "0 auto", padding: "0 0 90px",
      WebkitTapHighlightColor: "transparent",
    }}>
      {/* ── Top bar: hole + live score ── */}
      <div style={{
        background: C.turf, color: C.chalk, padding: "18px 20px 22px",
        borderBottomLeftRadius: 22, borderBottomRightRadius: 22,
        display: "flex", justifyContent: "space-between", alignItems: "flex-end",
      }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: 2, opacity: 0.7, textTransform: "uppercase" }}>Hole</div>
          <div style={{ fontSize: 52, fontWeight: 800, lineHeight: 0.95, fontFamily: "'Fraunces', Georgia, serif" }}>
            {current + 1}
          </div>
          <div style={{ fontSize: 14, opacity: 0.85, marginTop: 2 }}>Par {par}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, letterSpacing: 1, opacity: 0.7 }}>THRU {totals.thru}</div>
          <div style={{ fontSize: 30, fontWeight: 800, fontFamily: "'Fraunces', Georgia, serif" }}>{totals.score}</div>
          <div style={{
            fontSize: 13, fontWeight: 700,
            color: totals.toPar > 0 ? C.flag : C.sand,
          }}>
            {totals.toPar === 0 ? "E" : totals.toPar > 0 ? `+${totals.toPar}` : totals.toPar}
          </div>
        </div>
      </div>

      {/* ── Score stepper: the big one-handed control ── */}
      <Card>
        <Label>Score</Label>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <StepBtn onClick={() => update({ strokes: Math.max(1, h.strokes - 1) })}>−</StepBtn>
          <div style={{ textAlign: "center", flex: 1 }}>
            <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1, fontFamily: "'Fraunces', Georgia, serif", color: C.turf }}>
              {h.strokes}
            </div>
            <div style={{
              fontSize: 13, fontWeight: 700, marginTop: 2,
              color: scoreVsPar > 0 ? C.miss : scoreVsPar < 0 ? C.ok : C.slate,
            }}>{scoreLabel}</div>
          </div>
          <StepBtn onClick={() => update({ strokes: h.strokes + 1 })}>+</StepBtn>
        </div>
      </Card>

      {/* ── Fairway (hidden on par 3s — that's what makes fairway % honest) ── */}
      {!isPar3 && (
        <Card>
          <Label>Off the tee</Label>
          <div style={{ display: "flex", gap: 8 }}>
            {[["LEFT","◀ Left"],["HIT","Fairway"],["RIGHT","Right ▶"],["SHORT","Short"]].map(([val,txt]) => (
              <Pill key={val} active={h.fairwayHit === val}
                activeColor={val === "HIT" ? C.ok : C.miss}
                onClick={() => update({ fairwayHit: h.fairwayHit === val ? null : val })}>
                {txt}
              </Pill>
            ))}
          </div>
        </Card>
      )}

      {/* ── GIR ── */}
      <Card>
        <Label>Green in regulation</Label>
        <div style={{ display: "flex", gap: 8 }}>
          <Pill active={h.gir === true} activeColor={C.ok} onClick={() => update({ gir: true })} big>Hit</Pill>
          <Pill active={h.gir === false} activeColor={C.miss} onClick={() => update({ gir: false })} big>Missed</Pill>
        </div>
      </Card>

      {/* ── Putts ── */}
      <Card>
        <Label>Putts</Label>
        <div style={{ display: "flex", gap: 8 }}>
          {[0,1,2,3,4].map((p) => (
            <Pill key={p} active={h.putts === p} activeColor={C.turf}
              onClick={() => update({ putts: p })} big>{p}{p===4?"+":""}</Pill>
          ))}
        </div>
      </Card>

      {/* ── Penalties (compact, defaults to 0) ── */}
      <Card>
        <Label>Penalty strokes</Label>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <StepBtn small onClick={() => update({ penalties: Math.max(0, h.penalties - 1) })}>−</StepBtn>
          <div style={{ fontSize: 26, fontWeight: 800, minWidth: 30, textAlign: "center",
            color: h.penalties > 0 ? C.miss : C.slate }}>{h.penalties}</div>
          <StepBtn small onClick={() => update({ penalties: h.penalties + 1 })}>+</StepBtn>
          {!h.gir && h.upDownMade && (
            <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, color: C.ok,
              background: "#E4F0E7", padding: "5px 10px", borderRadius: 20 }}>
              Up &amp; down ✓
            </span>
          )}
          {!h.gir && h.upDownAtt && !h.upDownMade && (
            <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, color: C.miss,
              background: "#F6E5DA", padding: "5px 10px", borderRadius: 20 }}>
              Scramble missed
            </span>
          )}
        </div>
      </Card>

      {/* ── Bottom nav ── */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, maxWidth: 440, margin: "0 auto",
        display: "flex", gap: 10, padding: "12px 16px",
        background: "linear-gradient(to top, " + C.chalk + " 70%, transparent)",
      }}>
        <button onClick={() => go(-1)} disabled={current === 0} style={{
          flex: "0 0 auto", padding: "16px 22px", borderRadius: 16, border: "none",
          background: C.sand, color: C.ink, fontWeight: 700, fontSize: 16,
          opacity: current === 0 ? 0.4 : 1,
        }}>Back</button>
        <button onClick={() => go(1)} style={{
          flex: 1, padding: "16px", borderRadius: 16, border: "none",
          background: C.turf, color: C.chalk, fontWeight: 800, fontSize: 17,
        }}>{current === 17 ? "Finish round" : "Next hole →"}</button>
      </div>
    </div>
  );
}

// ── Summary screen ────────────────────────────────────────────────────
function Summary({ holes, pars, onBack }) {
  const t = useMemo(() => {
    let score=0, putts=0, fwH=0, fwP=0, gir=0, udM=0, udA=0, pen=0;
    holes.forEach((h,i) => {
      score += h.strokes; putts += h.putts; pen += h.penalties;
      if (pars[i] !== 3) { fwP++; if (h.fairwayHit === "HIT") fwH++; }
      if (h.gir) gir++;
      if (h.upDownAtt) udA++;
      if (h.upDownMade) udM++;
    });
    return { score, putts, fwH, fwP, gir, udM, udA, pen,
      par: pars.reduce((s,p)=>s+p,0) };
  }, [holes, pars]);

  const Row = ({ label, val, sub }) => (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline",
      padding:"14px 0", borderBottom:`1px solid ${C.sand}` }}>
      <span style={{ fontSize:15, color:C.slate }}>{label}</span>
      <span style={{ fontSize:20, fontWeight:800, color:C.turf }}>{val}
        {sub && <span style={{ fontSize:13, color:C.slate, fontWeight:600 }}> {sub}</span>}</span>
    </div>
  );

  return (
    <div style={{ fontFamily:"'DM Sans', system-ui, sans-serif", background:C.chalk,
      minHeight:"100vh", maxWidth:440, margin:"0 auto", padding:"0 0 40px", color:C.ink }}>
      <div style={{ background:C.turf, color:C.chalk, padding:"26px 22px 30px",
        borderBottomLeftRadius:22, borderBottomRightRadius:22, textAlign:"center" }}>
        <div style={{ fontSize:12, letterSpacing:2, opacity:0.7, textTransform:"uppercase" }}>Round complete</div>
        <div style={{ fontSize:66, fontWeight:800, fontFamily:"'Fraunces', Georgia, serif", lineHeight:1 }}>{t.score}</div>
        <div style={{ fontSize:16, color:C.flag, fontWeight:700 }}>
          {t.score - t.par > 0 ? `+${t.score - t.par}` : t.score - t.par} to par
        </div>
      </div>
      <div style={{ padding:"8px 22px" }}>
        <Row label="Fairways hit" val={`${t.fwH}/${t.fwP}`} sub={`${Math.round(t.fwH/t.fwP*100)}%`} />
        <Row label="Greens in regulation" val={`${t.gir}/18`} sub={`${Math.round(t.gir/18*100)}%`} />
        <Row label="Putts" val={t.putts} />
        <Row label="Up &amp; downs" val={`${t.udM}/${t.udA}`}
          sub={t.udA ? `${Math.round(t.udM/t.udA*100)}%` : "—"} />
        <Row label="Penalties" val={t.pen} />
      </div>
      <div style={{ padding:"4px 22px", fontSize:13, color:C.slate, lineHeight:1.5 }}>
        This is the exact payload the home analysis engine reads — GIR, up-and-down rate and
        fairway split are already computed, ready to hand to the coach.
      </div>
      <div style={{ padding:"16px 22px" }}>
        <button onClick={onBack} style={{ width:"100%", padding:"16px", borderRadius:16,
          border:"none", background:C.sand, color:C.ink, fontWeight:700, fontSize:16 }}>
          ← Back to holes
        </button>
      </div>
    </div>
  );
}

// ── Small UI primitives ───────────────────────────────────────────────
function Card({ children }) {
  return <div style={{ background:"#fff", margin:"12px 16px 0", padding:"16px 18px",
    borderRadius:18, boxShadow:"0 1px 3px rgba(20,53,31,0.06)" }}>{children}</div>;
}
function Label({ children }) {
  return <div style={{ fontSize:12, letterSpacing:1.2, textTransform:"uppercase",
    color:C.slate, fontWeight:700, marginBottom:12 }}>{children}</div>;
}
function StepBtn({ children, onClick, small }) {
  const d = small ? 40 : 60;
  return <button onClick={onClick} style={{ width:d, height:d, borderRadius:d/2,
    border:`2px solid ${C.turf}`, background:"#fff", color:C.turf,
    fontSize:small?24:32, fontWeight:700, lineHeight:1, cursor:"pointer",
    display:"flex", alignItems:"center", justifyContent:"center" }}>{children}</button>;
}
function Pill({ children, active, activeColor, onClick, big }) {
  return <button onClick={onClick} style={{
    flex:1, padding: big ? "16px 0" : "13px 0", borderRadius:12, border:"none",
    background: active ? (activeColor || C.turf) : C.sand,
    color: active ? "#fff" : C.ink,
    fontWeight:700, fontSize: big ? 17 : 14, cursor:"pointer",
    transition:"all 0.12s",
  }}>{children}</button>;
}
