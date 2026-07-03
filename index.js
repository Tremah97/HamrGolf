import { useState } from "react";
import dynamic from "next/dynamic";

// Load each prototype. ssr:false because they use browser-only state/charts.
const HamrHome       = dynamic(() => import("../components/HamrHome"), { ssr: false });
const PremiumShell   = dynamic(() => import("../components/PremiumShell"), { ssr: false });
const HoleLogger     = dynamic(() => import("../components/HoleLogger"), { ssr: false });
const AnalysisEngine = dynamic(() => import("../components/AnalysisEngine"), { ssr: false });
const VirtualCaddy   = dynamic(() => import("../components/VirtualCaddy"), { ssr: false });

const C = {
  turf:"#14351F", turfLite:"#1E4A2C", flag:"#E8B84B", sand:"#E7DCC4",
  chalk:"#F7F4EC", ink:"#0E2415", slate:"#5C6B5F",
};

const SCREENS = [
  { key:"home",    label:"Home & tabs",     desc:"Projected handicap, stats, cards, tips, caddy", C:HamrHome },
  { key:"shell",   label:"First-run flow",  desc:"Splash, onboarding, paywall", C:PremiumShell },
  { key:"logger",  label:"Log a round",     desc:"On-course hole-by-hole entry", C:HoleLogger },
  { key:"analysis",label:"Round analysis",  desc:"Coaching from a finished round", C:AnalysisEngine },
  { key:"caddy",   label:"Virtual caddy",   desc:"Club + strategy, bag mapping", C:VirtualCaddy },
];

export default function Launcher() {
  const [active, setActive] = useState(null);

  if (active) {
    const Screen = SCREENS.find(s => s.key === active).C;
    return (
      <div>
        <button onClick={() => setActive(null)} style={{
          position:"fixed", top:12, left:12, zIndex:999, background:C.ink, color:C.chalk,
          border:"none", borderRadius:20, padding:"8px 16px", fontSize:13, fontWeight:700,
          fontFamily:"system-ui", cursor:"pointer", opacity:0.85 }}>← Menu</button>
        <Screen />
      </div>
    );
  }

  return (
    <div style={{ fontFamily:"system-ui, sans-serif", background:C.chalk, minHeight:"100vh",
      maxWidth:440, margin:"0 auto", padding:"0 0 40px", color:C.ink }}>
      <div style={{ background:C.turf, color:C.chalk, padding:"40px 24px 30px",
        borderBottomLeftRadius:24, borderBottomRightRadius:24 }}>
        <div style={{ fontSize:13, letterSpacing:3, opacity:0.7, textTransform:"uppercase" }}>Hamr Golf</div>
        <div style={{ fontSize:28, fontWeight:800, marginTop:8, lineHeight:1.2 }}>Prototype preview</div>
        <div style={{ fontSize:15, opacity:0.85, marginTop:8, lineHeight:1.5 }}>
          Tap through any screen below. This is an early build — I'd love your honest take on what
          works, what's confusing, and what you'd actually pay for.
        </div>
      </div>

      <div style={{ padding:"18px 16px 0" }}>
        {SCREENS.map(s => (
          <button key={s.key} onClick={() => setActive(s.key)} style={{ width:"100%", textAlign:"left",
            background:"#fff", border:"none", padding:"18px 20px", borderRadius:16, marginBottom:12,
            cursor:"pointer", boxShadow:"0 1px 3px rgba(20,53,31,0.08)", display:"flex",
            justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontSize:17, fontWeight:800, color:C.turf }}>{s.label}</div>
              <div style={{ fontSize:13.5, color:C.slate, marginTop:3 }}>{s.desc}</div>
            </div>
            <div style={{ fontSize:22, color:C.flag }}>→</div>
          </button>
        ))}
      </div>

      <div style={{ padding:"14px 24px", fontSize:13, color:C.slate, lineHeight:1.5, textAlign:"center" }}>
        Feedback? Text me, or note the screen name + what you'd change.
      </div>
    </div>
  );
}
