import React, { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine, Tooltip, Area, AreaChart } from "recharts";

// ════════════════════════════════════════════════════════════════════════
//  HAMR GOLF — full shell with projected handicap + 5-item tab bar
//  Tabs: Home · Stats · Scorecards · Tips · Caddy(Pro)
// ════════════════════════════════════════════════════════════════════════

const C = {
  turf:"#14351F", turfLite:"#1E4A2C", flag:"#E8B84B", sand:"#E7DCC4",
  chalk:"#F7F4EC", ink:"#0E2415", slate:"#5C6B5F", miss:"#C4602E", ok:"#3E7D4F",
};

const ROUNDS = [
  { date:"28 Apr", course:"Eskdale",  score:93, par:67, cr:69.2, slope:124, fwH:6, fwP:12, gir:1, putts:32, udM:0, udA:10 },
  { date:"14 May", course:"Eskdale",  score:97, par:67, cr:69.2, slope:124, fwH:4, fwP:12, gir:0, putts:27, udM:1, udA:11 },
  { date:"30 May", course:"Seascale", score:101,par:71, cr:71.8, slope:131, fwH:7, fwP:14, gir:1, putts:36, udM:0, udA:8  },
  { date:"15 Jun", course:"Eskdale",  score:95, par:67, cr:69.2, slope:124, fwH:5, fwP:12, gir:3, putts:34, udM:0, udA:4  },
  { date:"1 Jul",  course:"Eskdale",  score:89, par:67, cr:69.2, slope:124, fwH:5, fwP:12, gir:3, putts:34, udM:1, udA:12 },
];

// ── Projected handicap ────────────────────────────────────────────────────
// WHS differential = (score − course rating) × 113 / slope.
// Real WHS uses best 8 of last 20. With <20 rounds we project from what we
// have, weighting recent form, and LABEL it as an estimate. Honest by design.
function projectedHandicap(rounds) {
  const diffs = rounds.map(r => ({
    date: r.date,
    diff: +(((r.score - r.cr) * 113) / r.slope).toFixed(1),
  }));
  // take the best half (mimics WHS "best 8 of 20" spirit at small N)
  const sorted = [...diffs].sort((a,b)=>a.diff-b.diff);
  const bestN = sorted.slice(0, Math.max(1, Math.ceil(sorted.length/2)));
  const avgBest = bestN.reduce((s,d)=>s+d.diff,0)/bestN.length;
  return { value: +avgBest.toFixed(1), diffs };
}

export default function HamrHome() {
  const [tab, setTab] = useState("home");
  const [isPro, setIsPro] = useState(false);
  const hcp = useMemo(()=>projectedHandicap(ROUNDS),[]);

  return (
    <div style={{ fontFamily:"'DM Sans', system-ui, sans-serif", background:C.chalk,
      minHeight:"100vh", maxWidth:440, margin:"0 auto", color:C.ink, paddingBottom:78,
      WebkitTapHighlightColor:"transparent", position:"relative" }}>

      {tab==="home"      && <Home isPro={isPro} hcp={hcp} onUpgrade={()=>setIsPro(true)} onTab={setTab} />}
      {tab==="stats"     && <Stats rounds={ROUNDS} />}
      {tab==="scorecards"&& <Scorecards rounds={ROUNDS} />}
      {tab==="tips"      && <Tips />}
      {tab==="caddy"     && <Caddy isPro={isPro} onUpgrade={()=>setIsPro(true)} />}

      <TabBar tab={tab} setTab={setTab} isPro={isPro} />
    </div>
  );
}

// ── HOME (now with density) ───────────────────────────────────────────────
function Home({ isPro, hcp, onUpgrade, onTab }) {
  const latest = ROUNDS[ROUNDS.length-1];
  const trendData = hcp.diffs.map(d=>({ date:d.date, hcp:d.diff }));

  return (
    <div>
      <div style={{ background:C.turf, color:C.chalk, padding:"24px 22px 22px",
        borderBottomLeftRadius:24, borderBottomRightRadius:24 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div style={{ fontSize:13, letterSpacing:3, opacity:0.7, textTransform:"uppercase" }}>Hamr Golf</div>
            <div style={{ fontSize:15, opacity:0.9, marginTop:2 }}>Evening, Tom</div>
          </div>
          {isPro
            ? <span style={{ background:C.flag, color:C.turf, fontSize:11, fontWeight:800, padding:"5px 12px", borderRadius:20, letterSpacing:1 }}>PRO</span>
            : <button onClick={onUpgrade} style={{ background:"rgba(232,184,75,0.15)", color:C.flag,
                border:`1px solid ${C.flag}`, fontSize:12, fontWeight:700, padding:"6px 12px", borderRadius:20, cursor:"pointer" }}>Upgrade</button>}
        </div>

        {/* HERO: projected handicap — the number that makes it feel alive */}
        <div style={{ display:"flex", alignItems:"flex-end", gap:20, marginTop:18 }}>
          <div>
            <div style={{ fontSize:11, letterSpacing:1.5, opacity:0.7, textTransform:"uppercase" }}>Projected handicap</div>
            <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
              <span style={{ fontSize:52, fontWeight:800, fontFamily:"'Fraunces', Georgia, serif", lineHeight:0.95 }}>{hcp.value}</span>
              <span style={{ fontSize:14, color:C.ok, fontWeight:700 }}>▼ trending down</span>
            </div>
          </div>
        </div>
        {/* mini handicap trend */}
        <div style={{ height:56, marginTop:10, marginLeft:-6, marginRight:-6 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top:6, right:8, left:8, bottom:0 }}>
              <defs>
                <linearGradient id="hg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.flag} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={C.flag} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="hcp" stroke={C.flag} strokeWidth={2.5} fill="url(#hg)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={{ fontSize:11, opacity:0.6, marginTop:2 }}>
          Estimate from {ROUNDS.length} rounds · becomes official at 20
        </div>
      </div>

      {/* Primary action */}
      <div style={{ padding:"16px 18px 0" }}>
        <button style={{ width:"100%", padding:"18px", borderRadius:18, border:"none",
          background:C.flag, color:C.turf, fontWeight:800, fontSize:17, cursor:"pointer",
          boxShadow:"0 2px 8px rgba(232,184,75,0.4)" }}>+ Start a new round</button>
      </div>

      {/* Quick-stat strip — density that also teaches the game */}
      <div style={{ display:"flex", gap:10, padding:"16px 16px 0" }}>
        <MiniStat label="Last round" val={latest.score} tag={`+${latest.score-latest.par}`} />
        <MiniStat label="Greens/rnd" val="1.6" tag="focus area" tagColor={C.miss} />
        <MiniStat label="Putts/rnd" val="32.6" tag="solid" tagColor={C.ok} />
      </div>

      {/* Caddy tile — paywalled */}
      <div style={{ padding:"16px 16px 0" }}>
        <div style={{ background:C.turf, color:C.chalk, borderRadius:20, padding:"20px" }}>
          <div style={{ fontSize:11, letterSpacing:1.5, textTransform:"uppercase", color:C.flag, fontWeight:700 }}>
            {isPro?"Your caddy":"Pro · Virtual caddy"}</div>
          <div style={{ fontSize:20, fontWeight:800, fontFamily:"'Fraunces', Georgia, serif", marginTop:6 }}>
            {isPro?"150 yds · take the 6 iron":"Club & strategy, every shot"}</div>
          <div style={{ fontSize:14, opacity:0.9, marginTop:6, lineHeight:1.5 }}>
            {isPro?"Open green, good lie — commit and swing at 80%."
                  :"Plays the distances you really hit, not your best-ever."}</div>
          <button onClick={()=> isPro ? onTab("caddy") : onUpgrade()} style={{ marginTop:14,
            background:C.flag, color:C.turf, border:"none", fontWeight:800, fontSize:14,
            padding:"11px 18px", borderRadius:12, cursor:"pointer" }}>
            {isPro?"Open caddy →":"Unlock the caddy →"}</button>
        </div>
      </div>

      {/* Recent rounds preview → deep-links to Scorecards tab */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"22px 20px 8px" }}>
        <span style={{ fontSize:12, letterSpacing:1.4, textTransform:"uppercase", color:C.slate, fontWeight:700 }}>Recent rounds</span>
        <button onClick={()=>onTab("scorecards")} style={{ background:"none", border:"none", color:C.turf, fontSize:13, fontWeight:700, cursor:"pointer" }}>See all →</button>
      </div>
      <div style={{ padding:"0 16px" }}>
        {[...ROUNDS].reverse().slice(0,2).map((r,i)=>(
          <div key={i} style={{ background:"#fff", padding:"14px 18px", borderRadius:16, marginBottom:10,
            display:"flex", justifyContent:"space-between", alignItems:"center", boxShadow:"0 1px 3px rgba(20,53,31,0.06)" }}>
            <div><div style={{ fontSize:16, fontWeight:800, color:C.turf }}>{r.course}</div>
              <div style={{ fontSize:13, color:C.slate }}>{r.date}</div></div>
            <div style={{ fontSize:24, fontWeight:800, fontFamily:"'Fraunces', Georgia, serif" }}>{r.score}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── STATS TAB ─────────────────────────────────────────────────────────────
function Stats({ rounds }) {
  const [view, setView] = useState("score");
  const scoreData = rounds.map(r=>({ date:r.date, score:r.score }));
  const skills = useMemo(()=>{
    const n=rounds.length;
    const fwPct=rounds.reduce((s,r)=>s+r.fwH,0)/rounds.reduce((s,r)=>s+r.fwP,0)*100;
    const girPct=rounds.reduce((s,r)=>s+r.gir,0)/(n*18)*100;
    const udPct=rounds.reduce((s,r)=>s+r.udM,0)/rounds.reduce((s,r)=>s+r.udA,0)*100;
    const avgPutts=rounds.reduce((s,r)=>s+r.putts,0)/n;
    const rate=(v,t)=>Math.min(100,Math.round(v/t*100));
    return [
      { name:"Driving", value:rate(fwPct,50), raw:`${Math.round(fwPct)}% fairways` },
      { name:"Approach", value:rate(girPct,30), raw:`${Math.round(girPct)}% greens` },
      { name:"Short game", value:rate(udPct,30), raw:`${Math.round(udPct)}% up & down` },
      { name:"Putting", value:Math.min(100,Math.round((40-avgPutts)/10*100)), raw:`${avgPutts.toFixed(0)} putts/round` },
    ].sort((a,b)=>a.value-b.value);
  },[rounds]);

  return (
    <div>
      <Header title="Stats" sub={`Your game across ${rounds.length} rounds`} />
      <div style={{ display:"flex", gap:8, padding:"16px 18px 6px" }}>
        <Toggle active={view==="score"} onClick={()=>setView("score")}>Score trend</Toggle>
        <Toggle active={view==="skills"} onClick={()=>setView("skills")}>Strengths</Toggle>
      </div>
      {view==="score" ? (
        <div style={{ background:"#fff", margin:"8px 16px 0", padding:"18px 14px 10px", borderRadius:18, boxShadow:"0 1px 3px rgba(20,53,31,0.06)" }}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={scoreData} margin={{ top:10, right:12, left:-18, bottom:0 }}>
              <XAxis dataKey="date" tick={{ fontSize:12, fill:C.slate }} axisLine={false} tickLine={false} />
              <YAxis domain={[85,105]} tick={{ fontSize:12, fill:C.slate }} axisLine={false} tickLine={false} />
              <ReferenceLine y={90} stroke={C.flag} strokeDasharray="4 4" label={{ value:"Break 90", fill:C.flag, fontSize:11, position:"insideTopRight" }} />
              <Tooltip contentStyle={{ borderRadius:12, border:"none", fontSize:13 }} />
              <Line type="monotone" dataKey="score" stroke={C.turf} strokeWidth={3} dot={{ r:5, fill:C.turf }} activeDot={{ r:7, fill:C.flag }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div style={{ margin:"8px 16px 0" }}>
          {skills.map((s,i)=>(
            <div key={s.name} style={{ background:"#fff", padding:"14px 16px", borderRadius:16, marginBottom:10, boxShadow:"0 1px 3px rgba(20,53,31,0.06)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:8 }}>
                <div style={{ fontSize:16, fontWeight:800, color:C.turf }}>{i===0&&<span style={{color:C.miss}}>⚑ </span>}{s.name}</div>
                <div style={{ fontSize:13, color:C.slate, fontWeight:600 }}>{s.raw}</div>
              </div>
              <div style={{ height:12, background:C.sand, borderRadius:6, overflow:"hidden" }}>
                <div style={{ width:`${s.value}%`, height:"100%", borderRadius:6, background: s.value<40?C.miss:s.value<70?C.flag:C.ok, transition:"width 0.5s" }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── SCORECARDS TAB ────────────────────────────────────────────────────────
function Scorecards({ rounds }) {
  const best = Math.min(...rounds.map(r=>r.score));
  return (
    <div>
      <Header title="Scorecards" sub="Every round you've logged" />
      <div style={{ padding:"14px 16px 0" }}>
        {[...rounds].reverse().map((r,i)=>(
          <div key={i} style={{ background:"#fff", padding:"16px 18px", borderRadius:16, marginBottom:10, boxShadow:"0 1px 3px rgba(20,53,31,0.06)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:16, fontWeight:800, color:C.turf }}>{r.course}</div>
                <div style={{ fontSize:13, color:C.slate }}>{r.date}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:26, fontWeight:800, fontFamily:"'Fraunces', Georgia, serif", color:r.score===best?C.ok:C.ink }}>{r.score}</div>
                <div style={{ fontSize:12, color:C.flag, fontWeight:700 }}>+{r.score-r.par}{r.score===best&&" · best"}</div>
              </div>
            </div>
            <div style={{ display:"flex", gap:16, marginTop:12, paddingTop:12, borderTop:`1px solid ${C.sand}` }}>
              <Cell label="Fairways" val={`${r.fwH}/${r.fwP}`} />
              <Cell label="Greens" val={`${r.gir}/18`} />
              <Cell label="Putts" val={r.putts} />
              <Cell label="Up&down" val={`${r.udM}/${r.udA}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── TIPS TAB ──────────────────────────────────────────────────────────────
function Tips() {
  const tips = [
    { tag:"Your #1 focus", color:C.miss, title:"Hit more greens", body:"You're reaching greens in good time on ~10% of holes. Take one more club than you think and swing at 80% — under-clubbing is quietly costing you 4–6 shots a round.", drill:"Towel drill: lay a towel 2\" ahead of the ball, hit 20 seven-irons, divot must start past the ball." },
    { tag:"Second focus", color:C.flag, title:"Sharpen the up-and-down", body:"When you miss a green you're rarely getting up and down, turning bogeys into doubles. One reliable chip beats three fancy ones.", drill:"Landing-spot chipping: put a towel where you want the ball to land, chip 20 with one club." },
    { tag:"Leave it alone", color:C.ok, title:"Your putting is fine", body:"Don't waste range time here — your putts-per-round only look high because chip-ons leave long first putts. Fix the approach and this improves on its own." },
  ];
  return (
    <div>
      <Header title="Tips" sub="Coaching from your own rounds" />
      <div style={{ padding:"14px 16px 0" }}>
        {tips.map((t,i)=>(
          <div key={i} style={{ background:"#fff", padding:"16px 18px", borderRadius:18, marginBottom:12, boxShadow:"0 1px 3px rgba(20,53,31,0.06)" }}>
            <div style={{ fontSize:11, letterSpacing:1.2, textTransform:"uppercase", color:t.color, fontWeight:800 }}>{t.tag}</div>
            <div style={{ fontSize:18, fontWeight:800, color:C.turf, margin:"4px 0 6px", fontFamily:"'Fraunces', Georgia, serif" }}>{t.title}</div>
            <div style={{ fontSize:14, color:C.slate, lineHeight:1.55 }}>{t.body}</div>
            {t.drill && <div style={{ fontSize:13.5, lineHeight:1.5, background:C.chalk, padding:"11px 14px", borderRadius:12, borderLeft:`3px solid ${t.color}`, marginTop:10 }}>
              <strong style={{ color:C.turf }}>Drill · </strong>{t.drill}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── CADDY TAB (paywalled) ─────────────────────────────────────────────────
function Caddy({ isPro, onUpgrade }) {
  if (!isPro) return (
    <div>
      <Header title="Caddy" sub="Club & strategy, every shot" />
      <div style={{ padding:"20px 18px" }}>
        <div style={{ background:C.turf, color:C.chalk, borderRadius:20, padding:"26px 22px", textAlign:"center" }}>
          <div style={{ fontSize:46, marginBottom:12 }}>🎯</div>
          <div style={{ fontSize:22, fontWeight:800, fontFamily:"'Fraunces', Georgia, serif" }}>A caddy in your pocket</div>
          <div style={{ fontSize:14.5, opacity:0.9, lineHeight:1.55, margin:"10px 0 18px" }}>
            Every shot: the right club for the distances you really hit, plus where to aim and when to lay up. Learns from your rounds.</div>
          <button onClick={onUpgrade} style={{ background:C.flag, color:C.turf, border:"none",
            fontWeight:800, fontSize:16, padding:"15px 28px", borderRadius:14, cursor:"pointer",
            boxShadow:"0 4px 14px rgba(232,184,75,0.35)" }}>Unlock with Pro · £4.99/mo</button>
        </div>
      </div>
    </div>
  );
  // Pro view: a live-feeling recommendation
  return (
    <div>
      <Header title="Caddy" sub="150 yds to the pin" />
      <div style={{ background:C.turf, color:C.chalk, margin:"16px 16px 0", padding:"22px", borderRadius:20 }}>
        <div style={{ fontSize:11, letterSpacing:1.5, textTransform:"uppercase", color:C.flag, fontWeight:700 }}>Caddy says</div>
        <div style={{ display:"flex", alignItems:"baseline", gap:10, marginTop:6 }}>
          <span style={{ fontSize:36, fontWeight:800, fontFamily:"'Fraunces', Georgia, serif" }}>6 Iron</span>
          <span style={{ fontSize:13, color:C.sand }}>150 yd reliable carry</span>
        </div>
        <div style={{ fontSize:14.5, lineHeight:1.55, marginTop:10, opacity:0.95 }}>
          It's 150 to the pin. Your 6-iron carries 150 on a stock swing — most players your level grab a 7 here and come up short. Take the 6.</div>
        <div style={{ marginTop:12, padding:"12px 14px", background:"rgba(232,184,75,0.15)", borderRadius:12, borderLeft:`3px solid ${C.flag}` }}>
          <div style={{ fontSize:11, letterSpacing:1, textTransform:"uppercase", color:C.flag, fontWeight:700, marginBottom:4 }}>Strategy</div>
          <div style={{ fontSize:14, lineHeight:1.5 }}>Open green, good lie — commit and swing at 80%. This is a green-in-reg chance, exactly what your game needs.</div>
        </div>
      </div>
    </div>
  );
}

// ── shared ────────────────────────────────────────────────────────────────
function TabBar({ tab, setTab, isPro }) {
  const items = [
    ["home","Home","⌂"],["stats","Stats","◔"],["scorecards","Cards","▤"],
    ["tips","Tips","💡"],["caddy","Caddy","🎯"],
  ];
  return (
    <div style={{ position:"fixed", bottom:0, left:0, right:0, maxWidth:440, margin:"0 auto",
      background:"#fff", borderTop:`1px solid ${C.sand}`, display:"flex", padding:"8px 0 10px" }}>
      {items.map(([k,l,i])=>{
        const locked = k==="caddy" && !isPro;
        return (
          <button key={k} onClick={()=>setTab(k)} style={{ flex:1, background:"none", border:"none",
            cursor:"pointer", color: tab===k?C.turf:C.slate, fontWeight: tab===k?800:600, position:"relative" }}>
            <div style={{ fontSize:19, lineHeight:1 }}>{i}</div>
            <div style={{ fontSize:10.5, marginTop:3 }}>{l}</div>
            {locked && <div style={{ position:"absolute", top:-1, right:"50%", marginRight:-22,
              fontSize:9, background:C.flag, color:C.turf, borderRadius:8, padding:"0 4px", fontWeight:800 }}>PRO</div>}
          </button>
        );
      })}
    </div>
  );
}
const Header = ({title,sub}) => (
  <div style={{ background:C.turf, color:C.chalk, padding:"22px 22px 18px", borderBottomLeftRadius:22, borderBottomRightRadius:22 }}>
    <div style={{ fontSize:24, fontWeight:800, fontFamily:"'Fraunces', Georgia, serif" }}>{title}</div>
    <div style={{ fontSize:13, opacity:0.8, marginTop:2 }}>{sub}</div>
  </div>
);
const MiniStat = ({label,val,tag,tagColor}) => (
  <div style={{ flex:1, background:"#fff", borderRadius:14, padding:"12px 14px", boxShadow:"0 1px 3px rgba(20,53,31,0.06)" }}>
    <div style={{ fontSize:11, color:C.slate, fontWeight:600 }}>{label}</div>
    <div style={{ fontSize:22, fontWeight:800, fontFamily:"'Fraunces', Georgia, serif", color:C.turf, margin:"2px 0" }}>{val}</div>
    <div style={{ fontSize:10.5, fontWeight:700, color:tagColor||C.slate }}>{tag}</div>
  </div>
);
const Cell = ({label,val}) => (
  <div style={{ flex:1 }}><div style={{ fontSize:11, color:C.slate }}>{label}</div>
    <div style={{ fontSize:15, fontWeight:800, color:C.turf }}>{val}</div></div>
);
const Toggle = ({children,active,onClick}) => (
  <button onClick={onClick} style={{ flex:1, padding:"11px 0", borderRadius:12, border:"none",
    background: active?C.turf:C.sand, color: active?"#fff":C.ink, fontWeight:700, fontSize:13.5, cursor:"pointer" }}>{children}</button>
);
