import React, { useState, useEffect } from "react";

// ════════════════════════════════════════════════════════════════════════
//  PRACTICE LOG — range reps vs on-course conversion
//  Tracks the two drills against the two numbers that matter: GIR and
//  up-and-down %. The point is seeing whether range work is moving them.
// ════════════════════════════════════════════════════════════════════════

const C = {
  turf:"#14351F", turfLite:"#1E4A2C", flag:"#E8B84B", sand:"#E7DCC4",
  chalk:"#F7F4EC", ink:"#0E2415", slate:"#5C6B5F", miss:"#C4602E", ok:"#3E7D4F",
};

const STORAGE_KEY = "practice-sessions";

const DRILL_INFO = {
  towel: {
    title: "Towel drill — low point control",
    what: "Lay a towel (or draw a line) about 2 inches in front of where the ball sits. Hit 7-irons at about 70% effort.",
    lookFor: "Where the divot starts. It must start at or after the towel — never before it. A divot that starts behind the ball means you're hitting the ground first (fat/inconsistent contact). Starting past it means you're compressing the ball properly.",
    why: "This is the single biggest lever for hitting more greens. Inconsistent contact is why your approach shots \"vary a lot\" — this drill trains a repeatable low point so strikes stop being a lottery.",
  },
  chip: {
    title: "Landing-spot chipping",
    what: "Put a towel down on the green where you want the ball to land (not on the hole itself). Chip 20 balls with one club — a pitching wedge or 9-iron — aiming to land on the towel.",
    lookFor: "Whether the ball actually lands on or very near the towel, not where it ends up after rolling. Landing spot is what you control; roll-out depends on the shot.",
    why: "Distance control, not fancy technique, is what turns a missed green into a tap-in instead of a 3-putt. One reliable chip beats three different \"trick\" shots.",
  },
  updown: {
    title: "Up & down game",
    what: "Drop 10 balls in different spots around the practice green (some rough, some tight lies). For each: chip it, then putt out. No gimmes — you must hole it.",
    lookFor: "How many of the 10 you get down in 2 shots total (chip + 1 putt). This is your practice-green scrambling percentage — the same stat as your on-course up-and-down number.",
    why: "This is your most costly leak on the course — roughly 1 in 15 attempts converts right now. This drill is the direct rehearsal for that exact situation, under a bit of self-imposed pressure.",
  },
};

function DrillHelp({ drillKey }) {
  const [open, setOpen] = useState(false);
  const d = DRILL_INFO[drillKey];
  return (
    <div style={{ marginBottom: open ? 12 : 0 }}>
      <button onClick={()=>setOpen(!open)} style={{ background:"none", border:"none", padding:0,
        display:"flex", alignItems:"center", gap:6, cursor:"pointer", color:C.turf,
        fontSize:12.5, fontWeight:700 }}>
        <span style={{ fontSize:14 }}>{open ? "▾" : "▸"}</span> What am I doing / looking for?
      </button>
      {open && (
        <div style={{ background:C.chalk, borderRadius:12, padding:"12px 14px", marginTop:8,
          borderLeft:`3px solid ${C.flag}`, fontSize:13, lineHeight:1.55, color:C.ink }}>
          <div style={{ marginBottom:8 }}><strong style={{ color:C.turf }}>Do this: </strong>{d.what}</div>
          <div style={{ marginBottom:8 }}><strong style={{ color:C.turf }}>Look for: </strong>{d.lookFor}</div>
          <div style={{ color:C.slate }}><strong style={{ color:C.turf }}>Why it matters: </strong>{d.why}</div>
        </div>
      )}
    </div>
  );
}

export default function PracticeLog() {
  const [sessions, setSessions] = useState([]);
  const [view, setView] = useState("log"); // "log" | "history"
  const [saving, setSaving] = useState(false);

  // form state
  const [type, setType] = useState("range"); // "range" | "round"
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10));
  // range fields
  const [towelReps, setTowelReps] = useState(20);
  const [towelGood, setTowelGood] = useState(0);
  const [chipReps, setChipReps] = useState(20);
  const [chipGood, setChipGood] = useState(0);
  const [udReps, setUdReps] = useState(10);
  const [udMade, setUdMade] = useState(0);
  const [notes, setNotes] = useState("");
  // round fields
  const [course, setCourse] = useState("");
  const [score, setScore] = useState(90);
  const [gir, setGir] = useState(2);
  const [roundUdAtt, setRoundUdAtt] = useState(8);
  const [roundUdMade, setRoundUdMade] = useState(0);

  const [storageAvailable, setStorageAvailable] = useState(true);

  // Load saved sessions on mount, using real browser localStorage —
  // this persists on-device across visits on any deployed website,
  // unlike the artifact-preview-only storage API used previously.
  useEffect(() => {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        setStorageAvailable(false);
        return;
      }
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setSessions(JSON.parse(raw));
    } catch (e) {
      // private browsing mode, storage disabled, or corrupted data —
      // fall back to in-memory only rather than crash
      setStorageAvailable(false);
    }
  }, []);

  const persist = (next) => {
    setSessions(next);
    if (!storageAvailable) return; // in-memory only for this session
    setSaving(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      setStorageAvailable(false); // e.g. storage quota exceeded or blocked
    }
    setSaving(false);
  };

  const addSession = () => {
    const entry = type === "range"
      ? { type, date, towelReps:+towelReps, towelGood:+towelGood,
          chipReps:+chipReps, chipGood:+chipGood, udReps:+udReps, udMade:+udMade, notes }
      : { type, date, course, score:+score, gir:+gir, udAtt:+roundUdAtt, udMade:+roundUdMade };
    const next = [...sessions, entry].sort((a,b)=>a.date.localeCompare(b.date));
    persist(next);
    // reset light fields
    setNotes(""); setTowelGood(0); setChipGood(0); setUdMade(0); setRoundUdMade(0); setCourse("");
  };

  const rangeSessions = sessions.filter(s=>s.type==="range");
  const roundSessions = sessions.filter(s=>s.type==="round");

  return (
    <div style={{ fontFamily:"'DM Sans', system-ui, sans-serif", background:C.chalk,
      minHeight:"100vh", maxWidth:440, margin:"0 auto", color:C.ink, paddingBottom:40,
      WebkitTapHighlightColor:"transparent" }}>

      <div style={{ background:C.turf, color:C.chalk, padding:"22px 22px 18px",
        borderBottomLeftRadius:22, borderBottomRightRadius:22 }}>
        <div style={{ fontSize:12, letterSpacing:2, opacity:0.7, textTransform:"uppercase" }}>Practice log</div>
        <div style={{ fontSize:22, fontWeight:800, fontFamily:"'Fraunces', Georgia, serif", marginTop:4 }}>
          Range reps vs on-course results</div>
        <div style={{ fontSize:13, opacity:0.85, marginTop:6, lineHeight:1.5 }}>
          Tracking whether the towel drill &amp; up-and-down practice actually move your GIR and scrambling.
        </div>
        {!storageAvailable && (
          <div style={{ fontSize:11.5, color:C.flag, marginTop:8, background:"rgba(232,184,75,0.15)",
            padding:"6px 10px", borderRadius:8, display:"inline-block" }}>
            Saving isn't available right now — entries will last this session only.
          </div>
        )}
      </div>

      <div style={{ display:"flex", gap:8, padding:"16px 18px 6px" }}>
        <Toggle active={view==="log"} onClick={()=>setView("log")}>Log a session</Toggle>
        <Toggle active={view==="history"} onClick={()=>setView("history")}>Progress</Toggle>
      </div>

      {view==="log" && (
        <div style={{ padding:"8px 16px 0" }}>
          <div style={{ display:"flex", gap:8, margin:"8px 0 4px" }}>
            <Pill active={type==="range"} onClick={()=>setType("range")}>Range session</Pill>
            <Pill active={type==="round"} onClick={()=>setType("round")}>Played a round</Pill>
          </div>

          <Card>
            <Lab>Date</Lab>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)}
              style={inputStyle} />
          </Card>

          {type==="range" ? (
            <>
              <Card>
                <Lab>Towel drill — low point control (7-iron)</Lab>
                <DrillHelp drillKey="towel" />
                <RepRow label="Balls hit" value={towelReps} set={setTowelReps} />
                <RepRow label="Good contact (ball-first divot)" value={towelGood} set={setTowelGood} max={towelReps} />
              </Card>
              <Card>
                <Lab>Landing-spot chipping</Lab>
                <DrillHelp drillKey="chip" />
                <RepRow label="Chips hit" value={chipReps} set={setChipReps} />
                <RepRow label="Landed on/near towel" value={chipGood} set={setChipGood} max={chipReps} />
              </Card>
              <Card>
                <Lab>Up &amp; down game (10 balls around green)</Lab>
                <DrillHelp drillKey="updown" />
                <RepRow label="Attempts" value={udReps} set={setUdReps} />
                <RepRow label="Holed out in 2 (chip+putt)" value={udMade} set={setUdMade} max={udReps} />
              </Card>
              <Card>
                <Lab>Notes (optional)</Lab>
                <textarea value={notes} onChange={e=>setNotes(e.target.value)}
                  placeholder="e.g. contact felt thin early on, better after 10 balls"
                  style={{ ...inputStyle, minHeight:70, resize:"vertical" }} />
              </Card>
            </>
          ) : (
            <>
              <Card>
                <Lab>Course</Lab>
                <input value={course} onChange={e=>setCourse(e.target.value)} placeholder="e.g. Eskdale"
                  style={inputStyle} />
              </Card>
              <Card>
                <Lab>Score</Lab>
                <input type="number" value={score} onChange={e=>setScore(e.target.value)} style={inputStyle} />
              </Card>
              <Card>
                <Lab>Greens reached in good time (of 18)</Lab>
                <input type="number" value={gir} onChange={e=>setGir(e.target.value)} style={inputStyle} />
              </Card>
              <Card>
                <Lab>Up &amp; down</Lab>
                <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                  <input type="number" value={roundUdMade} onChange={e=>setRoundUdMade(e.target.value)}
                    style={{ ...inputStyle, width:70 }} />
                  <span style={{ color:C.slate }}>made of</span>
                  <input type="number" value={roundUdAtt} onChange={e=>setRoundUdAtt(e.target.value)}
                    style={{ ...inputStyle, width:70 }} />
                  <span style={{ color:C.slate }}>attempts</span>
                </div>
              </Card>
            </>
          )}

          <div style={{ padding:"6px 2px 18px" }}>
            <button onClick={addSession} style={{ width:"100%", padding:"16px", borderRadius:16,
              border:"none", background:C.turf, color:C.chalk, fontWeight:800, fontSize:16, cursor:"pointer" }}>
              {saving ? "Saving…" : "Save session"}
            </button>
          </div>
        </div>
      )}

      {view==="history" && (
        <div style={{ padding:"8px 16px 0" }}>
          {sessions.length===0 && (
            <div style={{ textAlign:"center", padding:"40px 20px", color:C.slate, fontSize:14 }}>
              No sessions logged yet. Log tomorrow's range session and it'll show up here.
            </div>
          )}

          {rangeSessions.length>0 && (
            <>
              <SectionLabel>Range sessions</SectionLabel>
              {rangeSessions.map((s,i)=>{
                const towelPct = s.towelReps ? Math.round(s.towelGood/s.towelReps*100) : 0;
                const chipPct = s.chipReps ? Math.round(s.chipGood/s.chipReps*100) : 0;
                const udPct = s.udReps ? Math.round(s.udMade/s.udReps*100) : 0;
                return (
                  <div key={i} style={{ background:"#fff", padding:"14px 16px", borderRadius:16, marginBottom:10,
                    boxShadow:"0 1px 3px rgba(20,53,31,0.06)" }}>
                    <div style={{ fontSize:13, fontWeight:700, color:C.turf, marginBottom:8 }}>{s.date}</div>
                    <StatLine label="Towel drill contact" val={`${s.towelGood}/${s.towelReps}`} pct={towelPct} />
                    <StatLine label="Chip landing accuracy" val={`${s.chipGood}/${s.chipReps}`} pct={chipPct} />
                    <StatLine label="Up & down conversion" val={`${s.udMade}/${s.udReps}`} pct={udPct} />
                    {s.notes && <div style={{ fontSize:12.5, color:C.slate, marginTop:8, fontStyle:"italic" }}>{s.notes}</div>}
                  </div>
                );
              })}
            </>
          )}

          {roundSessions.length>0 && (
            <>
              <SectionLabel>Rounds since you started tracking</SectionLabel>
              {roundSessions.map((s,i)=>{
                const udPct = s.udAtt ? Math.round(s.udMade/s.udAtt*100) : 0;
                return (
                  <div key={i} style={{ background:"#fff", padding:"14px 16px", borderRadius:16, marginBottom:10,
                    boxShadow:"0 1px 3px rgba(20,53,31,0.06)" }}>
                    <div style={{ display:"flex", justifyContent:"space-between" }}>
                      <div style={{ fontSize:13, fontWeight:700, color:C.turf }}>{s.course || "Round"} · {s.date}</div>
                      <div style={{ fontSize:18, fontWeight:800, fontFamily:"'Fraunces', Georgia, serif" }}>{s.score}</div>
                    </div>
                    <StatLine label="Greens reached" val={`${s.gir}/18`} pct={Math.round(s.gir/18*100)} />
                    <StatLine label="Up & down" val={`${s.udMade}/${s.udAtt}`} pct={udPct} />
                  </div>
                );
              })}
            </>
          )}

          {rangeSessions.length>0 && roundSessions.length>0 && (
            <div style={{ background:C.turfLite, color:C.chalk, padding:"16px 18px", borderRadius:16,
              marginTop:6, fontSize:13.5, lineHeight:1.5 }}>
              Once you've got a few of each logged, compare the trend: if range up-and-down % climbs
              and on-course up-and-down % follows a few rounds later, the practice is transferring.
              If range numbers rise but course numbers don't move, that's a sign to add pressure to
              the range drills — hit each shot as if it's the only one you get.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  width:"100%", padding:"12px 14px", borderRadius:10, border:`1.5px solid ${C.sand}`,
  fontSize:15, outline:"none", fontFamily:"inherit", color:C.ink, background:"#fff",
};

function RepRow({ label, value, set, max }) {
  return (
    <div style={{ marginBottom:10 }}>
      <div style={{ fontSize:13, color:C.slate, marginBottom:6 }}>{label}</div>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <button onClick={()=>set(Math.max(0,+value-1))} style={stepBtn}>−</button>
        <div style={{ fontSize:20, fontWeight:800, color:C.turf, minWidth:32, textAlign:"center" }}>{value}</div>
        <button onClick={()=>set(+value+1)} style={stepBtn}>+</button>
        {max && <div style={{ fontSize:12, color:C.slate, marginLeft:6 }}>of {max}</div>}
      </div>
    </div>
  );
}
const stepBtn = { width:38, height:38, borderRadius:19, border:`1.5px solid ${C.turf}`,
  background:"#fff", color:C.turf, fontSize:20, fontWeight:700, cursor:"pointer" };

function StatLine({ label, val, pct }) {
  return (
    <div style={{ marginBottom:8 }}>
      <div style={{ display:"flex", justifyContent:"space-between", fontSize:12.5, marginBottom:4 }}>
        <span style={{ color:C.slate }}>{label}</span>
        <span style={{ fontWeight:700, color:C.turf }}>{val} · {pct}%</span>
      </div>
      <div style={{ height:6, background:C.sand, borderRadius:3, overflow:"hidden" }}>
        <div style={{ width:`${pct}%`, height:"100%", background: pct<30?C.miss:pct<60?C.flag:C.ok, borderRadius:3 }} />
      </div>
    </div>
  );
}

const Card = ({children}) => <div style={{ background:"#fff", margin:"10px 0", padding:"14px 16px",
  borderRadius:16, boxShadow:"0 1px 3px rgba(20,53,31,0.06)" }}>{children}</div>;
const Lab = ({children}) => <div style={{ fontSize:12, letterSpacing:1, textTransform:"uppercase",
  color:C.slate, fontWeight:700, marginBottom:9 }}>{children}</div>;
const SectionLabel = ({children}) => <div style={{ fontSize:12, letterSpacing:1.2, textTransform:"uppercase",
  color:C.slate, fontWeight:700, margin:"14px 2px 8px" }}>{children}</div>;
const Toggle = ({children,active,onClick}) => <button onClick={onClick} style={{ flex:1, padding:"11px 0",
  borderRadius:12, border:"none", background: active?C.turf:C.sand, color: active?"#fff":C.ink,
  fontWeight:700, fontSize:13.5, cursor:"pointer" }}>{children}</button>;
const Pill = ({children,active,onClick}) => <button onClick={onClick} style={{ flex:1, padding:"10px 0",
  borderRadius:10, border:"none", background: active?C.flag:C.sand, color: active?C.turf:C.ink,
  fontWeight:700, fontSize:13, cursor:"pointer" }}>{children}</button>;
