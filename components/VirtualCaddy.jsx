import React, { useState, useMemo } from "react";

// ════════════════════════════════════════════════════════════════════════
//  HAMR GOLF — Virtual Caddy (premium)
//  Two screens: Bag Mapping (range session) + Caddy recommendation (on course)
// ════════════════════════════════════════════════════════════════════════

const C = {
  turf:"#14351F", turfLite:"#1E4A2C", flag:"#E8B84B", sand:"#E7DCC4",
  chalk:"#F7F4EC", ink:"#0E2415", slate:"#5C6B5F", miss:"#C4602E", ok:"#3E7D4F",
};

// A realistic starter bag for an improver. Distances are CARRY, in yards.
// Each club stores a distribution, not a single hero number — that's the point.
const STARTER_BAG = [
  { club:"Driver", shots:[241,228,205,235,218] },
  { club:"3 Wood", shots:[212,198,205,190] },
  { club:"5 Hybrid", shots:[188,175,182] },
  { club:"5 Iron", shots:[172,160,168,155] },
  { club:"6 Iron", shots:[160,148,155,150] },
  { club:"7 Iron", shots:[150,138,145,142,135] },
  { club:"8 Iron", shots:[138,128,133] },
  { club:"9 Iron", shots:[126,115,122] },
  { club:"PW", shots:[112,102,108] },
  { club:"GW", shots:[95,88,92] },
  { club:"SW", shots:[78,70,82] },
];

// stats from a shot distribution
function clubStats(shots) {
  if (!shots.length) return null;
  const avg = Math.round(shots.reduce((a,b)=>a+b,0)/shots.length);
  const min = Math.min(...shots), max = Math.max(...shots);
  // "reliable carry" = the distance you beat most of the time (avg minus spread)
  const reliable = Math.round(avg - (avg-min)*0.5);
  return { avg, min, max, reliable, count:shots.length };
}

export default function VirtualCaddy() {
  const [screen, setScreen] = useState("caddy"); // "caddy" | "bag"
  const [bag, setBag] = useState(STARTER_BAG);

  return (
    <div style={{ fontFamily:"'DM Sans', system-ui, sans-serif", background:C.chalk,
      minHeight:"100vh", maxWidth:440, margin:"0 auto", color:C.ink, paddingBottom:70,
      WebkitTapHighlightColor:"transparent", position:"relative" }}>
      {screen==="caddy" ? <Caddy bag={bag} /> : <BagMapping bag={bag} setBag={setBag} />}

      <div style={{ position:"fixed", bottom:0, left:0, right:0, maxWidth:440, margin:"0 auto",
        background:"#fff", borderTop:`1px solid ${C.sand}`, display:"flex", padding:"8px 0 10px" }}>
        {[["caddy","Caddy","⛳"],["bag","Bag map","🎯"]].map(([k,l,i])=>(
          <button key={k} onClick={()=>setScreen(k)} style={{ flex:1, background:"none", border:"none",
            cursor:"pointer", color: screen===k?C.turf:C.slate, fontWeight: screen===k?800:600 }}>
            <div style={{ fontSize:20 }}>{i}</div>
            <div style={{ fontSize:11, marginTop:3 }}>{l}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── CADDY: on-course recommendation ──────────────────────────────────────
function Caddy({ bag }) {
  const [distance, setDistance] = useState(150);
  const [lie, setLie] = useState("fairway");
  const [wind, setWind] = useState("none");
  const [trouble, setTrouble] = useState("green"); // what's the miss risk

  const rec = useMemo(() => buildRec({ distance, lie, wind, trouble, bag }),
    [distance, lie, wind, trouble, bag]);

  return (
    <div>
      <div style={{ background:C.turf, color:C.chalk, padding:"22px 22px 20px",
        borderBottomLeftRadius:22, borderBottomRightRadius:22 }}>
        <div style={{ fontSize:12, letterSpacing:2, opacity:0.7, textTransform:"uppercase" }}>Your caddy</div>
        <div style={{ fontSize:14, opacity:0.85, marginTop:2 }}>Based on your last 5 rounds &amp; bag map</div>
      </div>

      {/* Distance input */}
      <Card>
        <Lab>Distance to target</Lab>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <Step onClick={()=>setDistance(Math.max(30,distance-5))}>−</Step>
          <div style={{ textAlign:"center" }}>
            <span style={{ fontSize:48, fontWeight:800, fontFamily:"'Fraunces', Georgia, serif", color:C.turf }}>{distance}</span>
            <span style={{ fontSize:18, color:C.slate, fontWeight:700 }}> yds</span>
          </div>
          <Step onClick={()=>setDistance(distance+5)}>+</Step>
        </div>
        <div style={{ fontSize:11, color:C.slate, textAlign:"center", marginTop:8 }}>
          At launch this is entered/GPS distance-to-green. Course mapping upgrades it later.
        </div>
      </Card>

      {/* Conditions */}
      <Card>
        <Lab>Lie</Lab>
        <Row opts={[["fairway","Fairway"],["rough","Rough"],["bunker","Bunker"]]} val={lie} set={setLie} />
      </Card>
      <Card>
        <Lab>Wind</Lab>
        <Row opts={[["none","None"],["into","Into"],["helping","Helping"]]} val={wind} set={setWind} />
      </Card>
      <Card>
        <Lab>Main danger</Lab>
        <Row opts={[["green","Open green"],["short","Trouble short"],["long","Trouble long"]]} val={trouble} set={setTrouble} />
      </Card>

      {/* THE RECOMMENDATION */}
      <div style={{ background:C.turf, color:C.chalk, margin:"16px 16px 0", padding:"20px", borderRadius:20 }}>
        <div style={{ fontSize:11, letterSpacing:1.5, textTransform:"uppercase", color:C.flag, fontWeight:700 }}>Caddy says</div>
        <div style={{ display:"flex", alignItems:"baseline", gap:10, marginTop:6 }}>
          <div style={{ fontSize:38, fontWeight:800, fontFamily:"'Fraunces', Georgia, serif" }}>{rec.club}</div>
          <div style={{ fontSize:14, color:C.sand }}>{rec.clubReliable} yd reliable carry</div>
        </div>
        <div style={{ fontSize:14.5, lineHeight:1.55, marginTop:10, opacity:0.95 }}>{rec.reasoning}</div>
        {rec.strategy && (
          <div style={{ marginTop:12, padding:"12px 14px", background:"rgba(232,184,75,0.15)",
            borderRadius:12, borderLeft:`3px solid ${C.flag}` }}>
            <div style={{ fontSize:11, letterSpacing:1, textTransform:"uppercase", color:C.flag, fontWeight:700, marginBottom:4 }}>Strategy</div>
            <div style={{ fontSize:14, lineHeight:1.5 }}>{rec.strategy}</div>
          </div>
        )}
      </div>
      <div style={{ fontSize:12, color:C.slate, padding:"12px 22px", lineHeight:1.5 }}>
        In the live app this reasoning comes from Claude with your full history. This preview runs
        the same logic locally so you can feel the flow.
      </div>
    </div>
  );
}

// caddy logic — mirrors the Claude prompt's priorities: play REALISTIC distance,
// not hero distance; factor lie/wind; give strategy based on where the trouble is.
function buildRec({ distance, lie, wind, trouble, bag }) {
  // adjust the effective distance the shot needs to cover
  let need = distance;
  if (wind==="into") need += Math.round(distance*0.08);
  if (wind==="helping") need -= Math.round(distance*0.06);
  if (lie==="rough") need += 6;      // rough kills carry
  if (lie==="bunker") need += 10;

  // pick the club whose RELIABLE carry covers the need (not the hero carry —
  // this is the whole insight: amateurs under-club by playing their best shot)
  const withStats = bag.map(c => ({ club:c.club, ...clubStats(c.shots) }))
                       .sort((a,b)=>a.reliable-b.reliable);
  let pick = withStats.find(c => c.reliable >= need) || withStats[withStats.length-1];

  // strategy layer
  let strategy = null;
  const canReach = pick && pick.max >= need;
  if (trouble==="short" && lie!=="fairway") {
    strategy = "Trouble short and an awkward lie — take one more club and commit. Coming up short is the real miss here.";
  } else if (trouble==="long") {
    strategy = "Danger is long, so favour the shorter read. Aim for the front-middle of the green and let it release, don't chase the flag.";
  } else if (!canReach) {
    strategy = "This is past your reliable range — lay up to a comfortable full-wedge number rather than forcing a career shot into trouble.";
  } else {
    strategy = "Open green, good lie — commit to the number and swing smooth at 80%. This is a green-in-regulation chance, exactly what your game needs more of.";
  }

  const reasoning = wind!=="none" || lie!=="fairway"
    ? `It's ${distance} to the target, but playing ${need} after the ${lie==="fairway"?"":lie+" and "}${wind==="none"?"conditions":wind+" wind"}. Your ${pick.club} carries ${pick.reliable} reliably (up to ${pick.max} flushed), so it covers the number without needing your best.`
    : `It's ${distance} to the target. Your ${pick.club} carries ${pick.reliable} on a stock swing — enough to cover it without over-swinging. Most players your level would grab a shorter club and come up short.`;

  return { club:pick.club, clubReliable:pick.reliable, reasoning, strategy };
}

// ── BAG MAPPING: the range session ──────────────────────────────────────
function BagMapping({ bag, setBag }) {
  const [active, setActive] = useState(null); // club being mapped
  const [entry, setEntry] = useState("");

  const addShot = (clubName) => {
    const yds = parseInt(entry);
    if (!yds || yds<20 || yds>350) return;
    setBag(prev => prev.map(c => c.club===clubName ? { ...c, shots:[...c.shots, yds] } : c));
    setEntry("");
  };
  const clearLast = (clubName) => {
    setBag(prev => prev.map(c => c.club===clubName ? { ...c, shots:c.shots.slice(0,-1) } : c));
  };

  return (
    <div>
      <div style={{ background:C.turf, color:C.chalk, padding:"22px 22px 20px",
        borderBottomLeftRadius:22, borderBottomRightRadius:22 }}>
        <div style={{ fontSize:12, letterSpacing:2, opacity:0.7, textTransform:"uppercase" }}>Bag mapping</div>
        <div style={{ fontSize:14, opacity:0.85, marginTop:2 }}>At the range, log 5+ carries per club. The spread matters more than the best one.</div>
      </div>

      <div style={{ padding:"14px 16px 0" }}>
        {bag.map(c => {
          const s = clubStats(c.shots);
          const open = active===c.club;
          return (
            <div key={c.club} style={{ background:"#fff", borderRadius:16, marginBottom:10,
              boxShadow:"0 1px 3px rgba(20,53,31,0.06)", overflow:"hidden" }}>
              <button onClick={()=>setActive(open?null:c.club)} style={{ width:"100%", border:"none",
                background:"none", padding:"14px 18px", display:"flex", justifyContent:"space-between",
                alignItems:"center", cursor:"pointer" }}>
                <div style={{ fontSize:16, fontWeight:800, color:C.turf }}>{c.club}</div>
                <div style={{ textAlign:"right" }}>
                  {s ? <>
                    <div style={{ fontSize:18, fontWeight:800, fontFamily:"'Fraunces', Georgia, serif" }}>
                      {s.avg}<span style={{ fontSize:12, color:C.slate, fontWeight:600 }}> avg</span></div>
                    <div style={{ fontSize:11, color:C.slate }}>{s.min}–{s.max} · {s.count} shots</div>
                  </> : <div style={{ fontSize:13, color:C.slate }}>Tap to map</div>}
                </div>
              </button>

              {open && (
                <div style={{ padding:"0 18px 16px" }}>
                  {/* spread bar */}
                  {s && (
                    <div style={{ margin:"4px 0 14px" }}>
                      <div style={{ position:"relative", height:8, background:C.sand, borderRadius:4 }}>
                        <div style={{ position:"absolute", left:`${(s.reliable-s.min)/(s.max-s.min||1)*100}%`,
                          top:-3, width:3, height:14, background:C.turf, borderRadius:2 }} />
                      </div>
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:C.slate, marginTop:4 }}>
                        <span>{s.min} mishit</span><span style={{ color:C.turf, fontWeight:700 }}>{s.reliable} reliable</span><span>{s.max} flushed</span>
                      </div>
                    </div>
                  )}
                  <div style={{ display:"flex", gap:8 }}>
                    <input value={entry} onChange={e=>setEntry(e.target.value.replace(/\D/g,""))}
                      placeholder="carry (yds)" inputMode="numeric" style={{ flex:1, padding:"12px 14px",
                      borderRadius:10, border:`1.5px solid ${C.sand}`, fontSize:15, outline:"none" }} />
                    <button onClick={()=>addShot(c.club)} style={{ padding:"12px 18px", borderRadius:10,
                      border:"none", background:C.turf, color:"#fff", fontWeight:700, fontSize:15, cursor:"pointer" }}>Add</button>
                  </div>
                  {c.shots.length>0 && (
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:10, alignItems:"center" }}>
                      {c.shots.map((sh,i)=>(
                        <span key={i} style={{ fontSize:12, background:C.chalk, padding:"4px 9px",
                          borderRadius:20, color:C.ink }}>{sh}</span>))}
                      <button onClick={()=>clearLast(c.club)} style={{ fontSize:11, color:C.miss,
                        background:"none", border:"none", cursor:"pointer", marginLeft:4 }}>undo last</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── shared bits ──────────────────────────────────────────────────────────
const Card = ({children}) => <div style={{ background:"#fff", margin:"12px 16px 0", padding:"15px 18px",
  borderRadius:18, boxShadow:"0 1px 3px rgba(20,53,31,0.06)" }}>{children}</div>;
const Lab = ({children}) => <div style={{ fontSize:12, letterSpacing:1.2, textTransform:"uppercase",
  color:C.slate, fontWeight:700, marginBottom:11 }}>{children}</div>;
const Step = ({children,onClick}) => <button onClick={onClick} style={{ width:52, height:52, borderRadius:26,
  border:`2px solid ${C.turf}`, background:"#fff", color:C.turf, fontSize:28, fontWeight:700, cursor:"pointer",
  display:"flex", alignItems:"center", justifyContent:"center" }}>{children}</button>;
function Row({ opts, val, set }) {
  return <div style={{ display:"flex", gap:7 }}>
    {opts.map(([v,t])=>(
      <button key={v} onClick={()=>set(v)} style={{ flex:1, padding:"12px 0", borderRadius:12, border:"none",
        background: val===v?C.turf:C.sand, color: val===v?"#fff":C.ink, fontWeight:700, fontSize:13.5,
        cursor:"pointer" }}>{t}</button>))}
  </div>;
}
