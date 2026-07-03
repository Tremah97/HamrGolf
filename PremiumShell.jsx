import React, { useState, useEffect } from "react";

// ════════════════════════════════════════════════════════════════════════
//  HAMR GOLF — Premium shell (the "App Store feel" layer)
//  Splash → Onboarding → Paywall → Home. This is what sells the app in the
//  first 30 seconds. Everything here is Tier-1 polish: motion, hierarchy,
//  copy, and a paywall that frames value instead of begging.
// ════════════════════════════════════════════════════════════════════════

const C = {
  turf:"#14351F", turfLite:"#1E4A2C", flag:"#E8B84B", sand:"#E7DCC4",
  chalk:"#F7F4EC", ink:"#0E2415", slate:"#5C6B5F", miss:"#C4602E", ok:"#3E7D4F",
};

export default function PremiumShell() {
  const [stage, setStage] = useState("splash"); // splash|onboard|paywall|home
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    if (stage === "splash") {
      const t = setTimeout(() => setStage("onboard"), 1900);
      return () => clearTimeout(t);
    }
  }, [stage]);

  return (
    <div style={{ fontFamily:"'DM Sans', system-ui, sans-serif", background:C.chalk,
      minHeight:"100vh", maxWidth:440, margin:"0 auto", color:C.ink, overflow:"hidden",
      WebkitTapHighlightColor:"transparent", position:"relative" }}>
      {stage==="splash"  && <Splash />}
      {stage==="onboard" && <Onboarding onDone={()=>setStage("paywall")} />}
      {stage==="paywall" && <Paywall onSubscribe={()=>{setIsPro(true); setStage("home");}}
                                     onSkip={()=>setStage("home")} />}
      {stage==="home"    && <Home isPro={isPro} onUpgrade={()=>setStage("paywall")} />}
    </div>
  );
}

// ── SPLASH: animated logo reveal ─────────────────────────────────────────
function Splash() {
  return (
    <div style={{ position:"absolute", inset:0, background:C.turf, display:"flex",
      flexDirection:"column", alignItems:"center", justifyContent:"center", gap:14 }}>
      <style>{`
        @keyframes rise { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes trace { from{stroke-dashoffset:300} to{stroke-dashoffset:0} }
        @keyframes glow { 0%,100%{opacity:0.5} 50%{opacity:1} }
      `}</style>
      <svg width="88" height="88" viewBox="0 0 88 88" style={{ animation:"glow 2s ease-in-out infinite" }}>
        {/* flag on a green — traced in */}
        <path d="M44 70 L44 20" stroke={C.chalk} strokeWidth="3" fill="none"
          strokeDasharray="300" style={{ animation:"trace 1.2s ease forwards" }} />
        <path d="M44 20 L68 28 L44 36 Z" fill={C.flag}
          style={{ animation:"rise 0.6s ease 0.8s both" }} />
        <ellipse cx="44" cy="72" rx="20" ry="6" fill={C.turfLite}
          style={{ animation:"rise 0.5s ease 1.1s both" }} />
      </svg>
      <div style={{ color:C.chalk, fontSize:26, fontWeight:800, letterSpacing:1,
        fontFamily:"'Fraunces', Georgia, serif", animation:"rise 0.6s ease 1s both" }}>Hamr Golf</div>
      <div style={{ color:C.sand, fontSize:13, letterSpacing:2, textTransform:"uppercase",
        animation:"rise 0.6s ease 1.3s both" }}>Your pocket coach</div>
    </div>
  );
}

// ── ONBOARDING: 3-card value story ───────────────────────────────────────
function Onboarding({ onDone }) {
  const [i, setI] = useState(0);
  const cards = [
    { icon:"⛳", title:"Log a round in seconds", body:"Tap through 18 holes one-handed. Big buttons, no typing, works with no signal on the course." },
    { icon:"🧠", title:"A coach that reads your game", body:"After each round, find the one or two things actually costing you strokes — even when it's not what you'd expect." },
    { icon:"🎯", title:"A caddy in your pocket", body:"Club and strategy for every shot, based on the distances you really hit — not your best-ever." },
  ];
  const last = i === cards.length-1;
  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column",
      padding:"0 24px", background:C.chalk }}>
      <style>{`@keyframes fade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center",
        alignItems:"center", textAlign:"center" }}>
        <div key={i} style={{ animation:"fade 0.4s ease" }}>
          <div style={{ fontSize:72, marginBottom:24 }}>{cards[i].icon}</div>
          <div style={{ fontSize:28, fontWeight:800, color:C.turf, marginBottom:14,
            fontFamily:"'Fraunces', Georgia, serif", lineHeight:1.15 }}>{cards[i].title}</div>
          <div style={{ fontSize:16, color:C.slate, lineHeight:1.55, maxWidth:320 }}>{cards[i].body}</div>
        </div>
      </div>
      <div style={{ display:"flex", justifyContent:"center", gap:8, marginBottom:24 }}>
        {cards.map((_,n)=>(
          <div key={n} style={{ width:n===i?24:8, height:8, borderRadius:4,
            background:n===i?C.turf:C.sand, transition:"width 0.3s" }} />
        ))}
      </div>
      <button onClick={()=> last ? onDone() : setI(i+1)} style={{ marginBottom:20, padding:"17px",
        borderRadius:16, border:"none", background:C.turf, color:C.chalk, fontWeight:800,
        fontSize:17, cursor:"pointer" }}>{last ? "Get started" : "Next"}</button>
    </div>
  );
}

// ── PAYWALL: frames value, offers a real free tier, no dark patterns ──────
function Paywall({ onSubscribe, onSkip }) {
  const [plan, setPlan] = useState("annual");
  return (
    <div style={{ minHeight:"100vh", background:C.turf, color:C.chalk, padding:"52px 24px 28px",
      display:"flex", flexDirection:"column" }}>
      <div style={{ textAlign:"center", marginBottom:10 }}>
        <div style={{ fontSize:12, letterSpacing:2, textTransform:"uppercase", color:C.flag, fontWeight:700 }}>Hamr Golf Pro</div>
        <div style={{ fontSize:30, fontWeight:800, fontFamily:"'Fraunces', Georgia, serif", marginTop:6, lineHeight:1.15 }}>
          Play like you've got a coach and caddy on the bag</div>
      </div>

      <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:18, padding:"18px 20px", margin:"18px 0" }}>
        {[
          ["🎯","Virtual caddy","Club + strategy on every shot"],
          ["🧠","Full round analysis","Powered by your real history"],
          ["📈","Deep trends","Strengths, weaknesses, progress"],
          ["🏌️","Bag mapping","Your true distances, dialled in"],
        ].map(([ic,t,s])=>(
          <div key={t} style={{ display:"flex", alignItems:"center", gap:14, padding:"9px 0" }}>
            <div style={{ fontSize:22 }}>{ic}</div>
            <div><div style={{ fontSize:15, fontWeight:700 }}>{t}</div>
              <div style={{ fontSize:13, color:C.sand }}>{s}</div></div>
            <div style={{ marginLeft:"auto", color:C.flag, fontSize:18 }}>✓</div>
          </div>
        ))}
      </div>

      {/* plans */}
      <div style={{ display:"flex", gap:10, marginBottom:18 }}>
        <PlanCard active={plan==="monthly"} onClick={()=>setPlan("monthly")}
          title="Monthly" price="£4.99" sub="per month" />
        <PlanCard active={plan==="annual"} onClick={()=>setPlan("annual")}
          title="Annual" price="£34.99" sub="£2.92/mo · save 42%" badge="Best value" />
      </div>

      <button onClick={onSubscribe} style={{ padding:"17px", borderRadius:16, border:"none",
        background:C.flag, color:C.turf, fontWeight:800, fontSize:17, cursor:"pointer",
        boxShadow:"0 4px 14px rgba(232,184,75,0.35)" }}>
        Start 7-day free trial</button>
      <div style={{ textAlign:"center", fontSize:12, color:C.sand, margin:"12px 0" }}>
        Then {plan==="annual"?"£34.99/year":"£4.99/month"}. Cancel anytime.</div>
      <button onClick={onSkip} style={{ background:"none", border:"none", color:C.sand,
        fontSize:14, cursor:"pointer", padding:"6px" }}>Continue with the free version</button>
    </div>
  );
}
function PlanCard({ active, onClick, title, price, sub, badge }) {
  return (
    <button onClick={onClick} style={{ flex:1, position:"relative", padding:"16px 12px",
      borderRadius:16, cursor:"pointer", textAlign:"center",
      border: active?`2px solid ${C.flag}`:`2px solid rgba(255,255,255,0.15)`,
      background: active?"rgba(232,184,75,0.12)":"transparent", color:C.chalk }}>
      {badge && <div style={{ position:"absolute", top:-10, left:"50%", transform:"translateX(-50%)",
        background:C.flag, color:C.turf, fontSize:10, fontWeight:800, padding:"3px 10px",
        borderRadius:10, whiteSpace:"nowrap" }}>{badge}</div>}
      <div style={{ fontSize:14, fontWeight:700 }}>{title}</div>
      <div style={{ fontSize:24, fontWeight:800, fontFamily:"'Fraunces', Georgia, serif", margin:"4px 0" }}>{price}</div>
      <div style={{ fontSize:11, color:C.sand }}>{sub}</div>
    </button>
  );
}

// ── HOME: shows the free/pro distinction cleanly ─────────────────────────
function Home({ isPro, onUpgrade }) {
  return (
    <div style={{ minHeight:"100vh" }}>
      <div style={{ background:C.turf, color:C.chalk, padding:"26px 22px 24px",
        borderBottomLeftRadius:24, borderBottomRightRadius:24 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:13, letterSpacing:3, opacity:0.7, textTransform:"uppercase" }}>Hamr Golf</div>
            <div style={{ fontSize:15, opacity:0.9, marginTop:2 }}>Evening, Tom</div>
          </div>
          {isPro
            ? <div style={{ background:C.flag, color:C.turf, fontSize:11, fontWeight:800,
                padding:"5px 12px", borderRadius:20, letterSpacing:1 }}>PRO</div>
            : <button onClick={onUpgrade} style={{ background:"rgba(232,184,75,0.15)", color:C.flag,
                border:`1px solid ${C.flag}`, fontSize:12, fontWeight:700, padding:"6px 12px",
                borderRadius:20, cursor:"pointer" }}>Upgrade</button>}
        </div>
        <div style={{ display:"flex", gap:26, marginTop:18 }}>
          {[["Best",89],["Average",95],["Rounds",5]].map(([l,v])=>(
            <div key={l}><div style={{ fontSize:11, opacity:0.65 }}>{l}</div>
              <div style={{ fontSize:24, fontWeight:800, fontFamily:"'Fraunces', Georgia, serif" }}>{v}</div></div>
          ))}
        </div>
      </div>

      <div style={{ padding:"18px 18px 0" }}>
        <button style={{ width:"100%", padding:"18px", borderRadius:18, border:"none",
          background:C.flag, color:C.turf, fontWeight:800, fontSize:17, cursor:"pointer",
          boxShadow:"0 2px 8px rgba(232,184,75,0.4)" }}>+ Start a new round</button>
      </div>

      {/* Caddy tile — the premium gate, shown locked to free users */}
      <div style={{ padding:"18px 16px 0" }}>
        <div style={{ position:"relative", background:C.turf, color:C.chalk, borderRadius:20,
          padding:"20px", overflow:"hidden" }}>
          <div style={{ fontSize:11, letterSpacing:1.5, textTransform:"uppercase", color:C.flag, fontWeight:700 }}>
            {isPro ? "Your caddy" : "Pro · Virtual caddy"}</div>
          <div style={{ fontSize:20, fontWeight:800, fontFamily:"'Fraunces', Georgia, serif", marginTop:6 }}>
            {isPro ? "150 yds · take the 6 iron" : "Club & strategy, every shot"}</div>
          <div style={{ fontSize:14, opacity:0.9, marginTop:6, lineHeight:1.5 }}>
            {isPro
              ? "Open green, good lie — commit and swing at 80%. A green-in-reg chance."
              : "Plays the distances you really hit. Unlock with Pro."}</div>
          {!isPro && (
            <button onClick={onUpgrade} style={{ marginTop:14, background:C.flag, color:C.turf,
              border:"none", fontWeight:800, fontSize:14, padding:"11px 18px", borderRadius:12,
              cursor:"pointer" }}>Unlock the caddy →</button>
          )}
        </div>
      </div>

      <div style={{ padding:"20px 22px", fontSize:13, color:C.slate, lineHeight:1.5, textAlign:"center" }}>
        {isPro ? "You're on Pro — coach and caddy fully unlocked."
               : "Free: logging, analysis & trends. Pro: adds the caddy & bag mapping."}
      </div>
    </div>
  );
}
