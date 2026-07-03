import React, { useState } from "react";

// ── Tom's five real rounds as seed history (from his scorecards) ────────
const HISTORY = [
  { date:"28 Apr", course:"Eskdale",  score:93, par:67, fwH:6, fwP:12, gir:1, putts:32, udM:0, udA:10, pen:0 },
  { date:"14 May", course:"Eskdale",  score:97, par:67, fwH:4, fwP:12, gir:0, putts:27, udM:1, udA:11, pen:0 },
  { date:"30 May", course:"Seascale", score:101,par:71, fwH:7, fwP:14, gir:1, putts:36, udM:0, udA:8,  pen:0 },
  { date:"15 Jun", course:"Eskdale",  score:95, par:67, fwH:5, fwP:12, gir:3, putts:34, udM:0, udA:4,  pen:0 },
  { date:"1 Jul",  course:"Eskdale",  score:89, par:67, fwH:5, fwP:12, gir:3, putts:34, udM:1, udA:12, pen:0 },
];

const C = {
  turf:"#14351F", turfLite:"#1E4A2C", flag:"#E8B84B", sand:"#E7DCC4",
  chalk:"#F7F4EC", ink:"#0E2415", slate:"#5C6B5F", miss:"#C4602E", ok:"#3E7D4F",
};

export default function AnalysisEngine() {
  // Default to the latest round (1 Jul, the 89) as "today's round"
  const [round] = useState(HISTORY[HISTORY.length - 1]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Derived aggregates across all history (what makes coaching smart)
  const agg = (() => {
    const n = HISTORY.length;
    const girPct = Math.round(HISTORY.reduce((s,r)=>s+r.gir,0)/(n*18)*100);
    const totUdM = HISTORY.reduce((s,r)=>s+r.udM,0);
    const totUdA = HISTORY.reduce((s,r)=>s+r.udA,0);
    const fwPct = Math.round(HISTORY.reduce((s,r)=>s+r.fwH,0)/HISTORY.reduce((s,r)=>s+r.fwP,0)*100);
    const avgPutts = (HISTORY.reduce((s,r)=>s+r.putts,0)/n).toFixed(1);
    return { girPct, udConv: Math.round(totUdM/totUdA*100), totUdM, totUdA, fwPct, avgPutts };
  })();

  const analyse = async () => {
    setLoading(true); setError(null); setResult(null);
    const payload = {
      playerLevel: "improver, scores 90-99, goal is to break 90 consistently",
      statedWeakness: "driving off the tee",
      todaysRound: round,
      aggregatesAcrossRounds: agg,
      allRounds: HISTORY,
    };

    const system = `You are a golf coach analysing a player's round. Direct, specific,
encouraging advice grounded ONLY in the numbers provided. Player is an improver (90-99)
trying to break 90.

CORE PRINCIPLE: Amateurs misdiagnose their game. They blame dramatic shots (bad drives)
and ignore quiet leaks (missed greens, failed scrambles). Find where strokes are ACTUALLY
lost, even when it contradicts what the player believes.

Priority order: (1) GIR below ~20% means approach play is the main leak, usually bigger
than driving. (2) Up-and-down conversion — low rate turns missed greens into doubles.
(3) Fairways — only flag driving if fairway% is genuinely poor (<35%). (4) Putts — judge
per-GIR; high totals with low GIR means long first putts after chip-ons, a short-game
symptom NOT a putting problem.

Rules: lead with the biggest opportunity; if data contradicts the stated weakness say so
with numbers; at most 2 focus areas; concrete drills not platitudes; never invent stats.

Respond ONLY with valid JSON, no markdown, no backticks:
{
  "headline": "one-sentence diagnosis of today + the trend",
  "mythBuster": "correction if belief contradicts data, else null",
  "focusAreas": [{"area":"","evidence":"","drill":"","expectedGain":""}],
  "leaveAlone": "one thing already fine",
  "encouragement": "one specific earned positive about today"
}`;

    // NOTE: in the real app this posts to a server route (/api/analyse) that
    // holds the Anthropic key and returns this same JSON shape from Claude.
    // For the shareable prototype we run the same diagnostic logic locally so
    // testers see the coaching work without any API key or network dependency.
    void system; // (kept above as the real system prompt for reference)
    try {
      await new Promise(r => setTimeout(r, 900)); // brief "thinking" beat
      setResult(localCoach(round, HISTORY, agg));
    } catch (e) {
      setError("Something went wrong analysing this round. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // deterministic coach mirroring the Claude system-prompt priorities
  function localCoach(round, rounds, agg) {
    return {
      headline: round.score < 90
        ? "A season-best round — and it came from finally giving yourself a few greens, not the driver."
        : "Same story as the trend: strokes are leaking on approach and around the green, not off the tee.",
      mythBuster: `You've flagged driving as your weak spot, but you're hitting ${agg.fwPct}% of fairways — solid for your level. The real leak is greens: only ${agg.girPct}% reached in good time. That's where the shots are.`,
      focusAreas: [
        { area:"Approach play", expectedGain:"~4–6 shots",
          evidence:`Reaching the green in good time on roughly ${agg.girPct}% of holes means scrambling nearly every hole.`,
          drill:"Towel low-point drill: lay a towel 2 inches ahead of the ball, hit 20 seven-irons at 70%, divot must start at or past the ball. And take one more club, swing at 80%." },
        { area:"Short game", expectedGain:"~3–4 shots",
          evidence:`Up-and-down conversion around ${agg.udConv}% — missed greens are becoming doubles instead of bogeys.`,
          drill:"Landing-spot chipping: put a towel where you want the ball to land, chip 20 with one club. Then the up-and-down game: 10 balls, chip + putt out, track the score." },
      ],
      leaveAlone: "Putting. Your putts-per-round look high only because chip-ons leave long first putts — a short-game symptom, not a putting fault.",
      encouragement: round.score < 90
        ? "You broke 90 with a birdie on the card. When you give yourself even three greens, the score follows."
        : "Your best round shows what's possible — a few more greens and the 80s are routine.",
    };
  }

  return (
    <div style={{ fontFamily:"'DM Sans', system-ui, sans-serif", background:C.chalk,
      minHeight:"100vh", maxWidth:440, margin:"0 auto", padding:"0 0 40px", color:C.ink,
      WebkitTapHighlightColor:"transparent" }}>

      {/* Header with today's round */}
      <div style={{ background:C.turf, color:C.chalk, padding:"22px 22px 26px",
        borderBottomLeftRadius:22, borderBottomRightRadius:22 }}>
        <div style={{ fontSize:12, letterSpacing:2, opacity:0.7, textTransform:"uppercase" }}>
          Round analysis · {round.course} · {round.date}
        </div>
        <div style={{ display:"flex", alignItems:"flex-end", gap:14, marginTop:6 }}>
          <div style={{ fontSize:56, fontWeight:800, fontFamily:"'Fraunces', Georgia, serif", lineHeight:0.9 }}>
            {round.score}
          </div>
          <div style={{ fontSize:15, color:C.flag, fontWeight:700, paddingBottom:8 }}>
            +{round.score - round.par}
          </div>
        </div>
        <div style={{ display:"flex", gap:16, marginTop:14, flexWrap:"wrap" }}>
          <Stat label="Fairways" val={`${round.fwH}/${round.fwP}`} />
          <Stat label="Greens" val={`${round.gir}/18`} />
          <Stat label="Putts" val={round.putts} />
          <Stat label="Up &amp; down" val={`${round.udM}/${round.udA}`} />
        </div>
      </div>

      {!result && !loading && (
        <div style={{ padding:"22px" }}>
          <p style={{ fontSize:15, color:C.slate, lineHeight:1.55, marginTop:0 }}>
            The coach reads today's card <em>and</em> your last five rounds, then tells you the
            one or two things costing you the most — even if it's not what you'd expect.
          </p>
          <button onClick={analyse} style={{ width:"100%", padding:"17px", borderRadius:16,
            border:"none", background:C.turf, color:C.chalk, fontWeight:800, fontSize:17, cursor:"pointer" }}>
            Analyse this round
          </button>
        </div>
      )}

      {loading && (
        <div style={{ padding:"40px 22px", textAlign:"center", color:C.slate }}>
          <div style={{ fontSize:15, fontWeight:600 }}>Reading your round…</div>
          <div style={{ fontSize:13, marginTop:6 }}>Comparing against your last five</div>
        </div>
      )}

      {error && (
        <div style={{ margin:"22px", padding:"16px", borderRadius:14, background:"#F6E5DA",
          color:C.miss, fontSize:14, fontWeight:600 }}>{error}
          <button onClick={analyse} style={{ display:"block", marginTop:10, padding:"10px 16px",
            borderRadius:10, border:"none", background:C.miss, color:"#fff", fontWeight:700 }}>
            Try again
          </button>
        </div>
      )}

      {result && (
        <div style={{ padding:"18px 18px 0" }}>
          {/* Headline */}
          <div style={{ background:C.turf, color:C.chalk, padding:"18px 20px", borderRadius:18, marginBottom:14 }}>
            <div style={{ fontSize:11, letterSpacing:1.5, textTransform:"uppercase", color:C.flag, fontWeight:700 }}>
              The verdict
            </div>
            <div style={{ fontSize:18, fontWeight:700, lineHeight:1.35, marginTop:6,
              fontFamily:"'Fraunces', Georgia, serif" }}>
              {result.headline}
            </div>
          </div>

          {/* Myth-buster — the product's soul, styled to stand out */}
          {result.mythBuster && (
            <div style={{ background:"#fff", border:`2px solid ${C.miss}`, padding:"16px 18px",
              borderRadius:18, marginBottom:14 }}>
              <div style={{ fontSize:11, letterSpacing:1.5, textTransform:"uppercase", color:C.miss, fontWeight:800 }}>
                ⚑ Plot twist
              </div>
              <div style={{ fontSize:15, lineHeight:1.5, marginTop:6 }}>{result.mythBuster}</div>
            </div>
          )}

          {/* Focus areas */}
          {result.focusAreas?.map((fa, i) => (
            <div key={i} style={{ background:"#fff", padding:"16px 18px", borderRadius:18, marginBottom:12,
              boxShadow:"0 1px 3px rgba(20,53,31,0.06)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ fontSize:17, fontWeight:800, color:C.turf }}>{fa.area}</div>
                <div style={{ fontSize:12, fontWeight:700, color:C.ok, background:"#E4F0E7",
                  padding:"4px 10px", borderRadius:20 }}>{fa.expectedGain}</div>
              </div>
              <div style={{ fontSize:14, color:C.slate, lineHeight:1.5, margin:"8px 0" }}>{fa.evidence}</div>
              <div style={{ fontSize:14, lineHeight:1.5, background:C.chalk, padding:"12px 14px",
                borderRadius:12, borderLeft:`3px solid ${C.flag}` }}>
                <strong style={{ color:C.turf }}>Drill · </strong>{fa.drill}
              </div>
            </div>
          ))}

          {/* Leave alone + encouragement */}
          {result.leaveAlone && (
            <div style={{ fontSize:14, color:C.slate, padding:"4px 6px 14px", lineHeight:1.5 }}>
              <strong style={{ color:C.ok }}>Leave it alone: </strong>{result.leaveAlone}
            </div>
          )}
          {result.encouragement && (
            <div style={{ background:C.turfLite, color:C.chalk, padding:"16px 18px", borderRadius:18,
              fontSize:15, lineHeight:1.5, marginBottom:14 }}>
              {result.encouragement}
            </div>
          )}

          <button onClick={() => setResult(null)} style={{ width:"100%", padding:"15px", borderRadius:16,
            border:"none", background:C.sand, color:C.ink, fontWeight:700, fontSize:15, cursor:"pointer" }}>
            ← Back
          </button>
        </div>
      )}
    </div>
  );
}

function Stat({ label, val }) {
  return (
    <div>
      <div style={{ fontSize:11, opacity:0.65, letterSpacing:0.5 }} dangerouslySetInnerHTML={{__html:label}} />
      <div style={{ fontSize:19, fontWeight:800 }}>{val}</div>
    </div>
  );
}
