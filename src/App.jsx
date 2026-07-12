import { useState, useEffect, useCallback, useRef } from "react";
import { Home, Image, Gift, Gamepad2, Plus, Check, X, Shuffle, ChevronRight, Settings, AlertCircle, Loader, Camera } from "lucide-react";

const T = {
  paper:    "#F5F1EA",
  paper2:   "#EDE8DF",
  surface:  "#FFFFFF",
  ink:      "#2B2B2B",
  muted:    "#9A9692",
  sage:     "#7A9E8E",
  border:   "#E4DFD6",
  radius:   14,
  font:     "-apple-system,'SF Pro Text','Helvetica Neue',sans-serif",
  fontDisp: "-apple-system,'SF Pro Display','Helvetica Neue',sans-serif",
};

const MOOD = {
  soleil:  { color: "#D4924A", label: "Soleil"  },
  calme:   { color: T.sage,    label: "Calme"   },
  gris:    { color: "#8E8E93", label: "Gris"    },
  tempete: { color: "#7B7FC4", label: "Tempête" },
};

const FALLBACK = [
  { bg: "linear-gradient(135deg,#C9D8C5 0%,#A8C2B5 100%)", emoji: "🌿" },
  { bg: "linear-gradient(135deg,#D5C9B8 0%,#C0AE96 100%)", emoji: "☕" },
  { bg: "linear-gradient(135deg,#BFC8D9 0%,#A4B4CC 100%)", emoji: "🌧️" },
  { bg: "linear-gradient(135deg,#D4C5D0 0%,#BAA8B8 100%)", emoji: "🕯️" },
];

const JOURS = ["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"];
const ADJS  = ["doux","calme","tranquille","léger","suspendu","tendre","paresseux","lumineux"];
const JE_PENSE = ["un lieu","un objet du quotidien","une envie","un souvenir","une personne","un plat"];

function poeticDate(d) { return `un ${JOURS[d.getDay()]} ${ADJS[Math.floor(Math.random() * ADJS.length)]}`; }
function realDate(d)   { return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }); }
function fallback(id)  { return FALLBACK[id % FALLBACK.length]; }

// ── Supabase helpers ──────────────────────────────────────────────────────
function makeHeaders(key) {
  return { "apikey": key, "Authorization": `Bearer ${key}`, "Content-Type": "application/json", "Prefer": "return=representation" };
}
async function sbGet(url, key, table) {
  const r = await fetch(`${url}/rest/v1/${table}?order=created_at.desc`, { headers: makeHeaders(key) });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
async function sbInsert(url, key, table, body) {
  const r = await fetch(`${url}/rest/v1/${table}`, { method: "POST", headers: makeHeaders(key), body: JSON.stringify(body) });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
async function sbUpdate(url, key, table, id, body) {
  const r = await fetch(`${url}/rest/v1/${table}?id=eq.${id}`, { method: "PATCH", headers: makeHeaders(key), body: JSON.stringify(body) });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
async function sbUploadPhoto(url, key, file) {
  const ext  = file.name.split(".").pop();
  const name = `${Date.now()}.${ext}`;
  const r = await fetch(`${url}/storage/v1/object/photo_moment/${name}`, {
    method: "POST",
    headers: { "apikey": key, "Authorization": `Bearer ${key}`, "Content-Type": file.type, "x-upsert": "true" },
    body: file,
  });
  if (!r.ok) throw new Error(await r.text());
  return `${url}/storage/v1/object/public/photo_moment/${name}`;
}

// ── Setup ─────────────────────────────────────────────────────────────────
function SetupScreen({ onSave }) {
  const [url, setUrl] = useState("");
  const [key, setKey] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function test() {
    setErr(""); setLoading(true);
    try {
      const r = await fetch(`${url.trim()}/rest/v1/moments?limit=1`, { headers: makeHeaders(key.trim()) });
      if (!r.ok) throw new Error("Connexion échouée — vérifie l'URL et la clé.");
      onSave(url.trim(), key.trim());
    } catch (e) { setErr(e.message); }
    setLoading(false);
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "28px 22px" }}>
      <div style={{ fontSize: 24, fontWeight: 700, color: T.ink, fontFamily: T.fontDisp, marginBottom: 8 }}>Connexion</div>
      <p style={{ fontSize: 13.5, color: T.muted, marginBottom: 28, lineHeight: 1.6 }}>
        Colle ici les informations de ton projet Supabase.<br />Tu les trouves dans <strong>Settings → API</strong>.
      </p>
      <label style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: ".07em", display: "block", marginBottom: 6 }}>Project URL</label>
      <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://xyz.supabase.co"
        style={{ width: "100%", border: `1px solid ${T.border}`, borderRadius: T.radius, padding: "11px 14px", fontSize: 13.5, background: T.surface, color: T.ink, marginBottom: 18, fontFamily: T.font, boxSizing: "border-box" }} />
      <label style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: ".07em", display: "block", marginBottom: 6 }}>Anon public key</label>
      <input value={key} onChange={e => setKey(e.target.value)} placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpX..."
        style={{ width: "100%", border: `1px solid ${T.border}`, borderRadius: T.radius, padding: "11px 14px", fontSize: 12, background: T.surface, color: T.ink, marginBottom: 6, fontFamily: "monospace", boxSizing: "border-box" }} />
      {err && (
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start", background: "#FFF0EE", border: "1px solid #F5C6C0", borderRadius: 10, padding: "10px 12px", marginBottom: 16 }}>
          <AlertCircle size={15} color="#C0392B" style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 12.5, color: "#C0392B", lineHeight: 1.5 }}>{err}</span>
        </div>
      )}
      <button onClick={test} disabled={!url || !key || loading}
        style={{ width: "100%", padding: "13px 0", borderRadius: 30, background: !url || !key ? T.paper2 : T.ink, color: !url || !key ? T.muted : T.paper, fontSize: 14, fontWeight: 600, marginTop: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: "none", cursor: "pointer", fontFamily: T.font }}>
        {loading ? <><Loader size={15} style={{ animation: "spin 1s linear infinite" }} /> Connexion…</> : "Connecter"}
      </button>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────
export default function Bulle() {
  const [sbUrl, setSbUrl] = useState(() => localStorage.getItem("sb_url") || "");
  const [sbKey, setSbKey] = useState(() => localStorage.getItem("sb_key") || "");
  const [ready, setReady] = useState(() => !!(localStorage.getItem("sb_url") && localStorage.getItem("sb_key")));

  const [tab,        setTab]        = useState("accueil");
  const [moments,    setMoments]    = useState([]);
  const [idees,      setIdees]      = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [draftText,  setDraftText]  = useState("");
  const [draftAm,    setDraftAm]    = useState(null);
  const [draftPhoto, setDraftPhoto] = useState(null);    // File object
  const [draftPreview, setDraftPreview] = useState(null); // base64 preview
  const [saving,     setSaving]     = useState(false);

  const [newIdee,   setNewIdee]   = useState("");
  const [pioche,    setPioche]    = useState(null);
  const [categorie, setCategorie] = useState(null);
  const [showCfg,   setShowCfg]   = useState(false);

  const fileRef = useRef();

  const load = useCallback(async () => {
    if (!ready) return;
    setLoading(true); setError("");
    try {
      const [m, i] = await Promise.all([sbGet(sbUrl, sbKey, "moments"), sbGet(sbUrl, sbKey, "idees")]);
      setMoments(m);
      setIdees(i);
    } catch (e) { setError("Impossible de charger les données."); }
    setLoading(false);
  }, [ready, sbUrl, sbKey]);

  useEffect(() => { load(); }, [load]);

  function handleSave(url, key) {
    localStorage.setItem("sb_url", url); localStorage.setItem("sb_key", key);
    setSbUrl(url); setSbKey(key); setReady(true);
  }
  function disconnect() {
    localStorage.removeItem("sb_url"); localStorage.removeItem("sb_key");
    setSbUrl(""); setSbKey(""); setReady(false); setMoments([]); setIdees([]); setShowCfg(false);
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setDraftPhoto(file);
    const reader = new FileReader();
    reader.onload = ev => setDraftPreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  async function addMoment() {
    if (!draftText.trim() || !draftAm) return;
    setSaving(true);
    try {
      const now = new Date();
      let photo_url = null;
      if (draftPhoto) {
        photo_url = await sbUploadPhoto(sbUrl, sbKey, draftPhoto);
      }
      const [inserted] = await sbInsert(sbUrl, sbKey, "moments", {
        text: draftText.trim(), ambiance: draftAm, poetic: poeticDate(now), photo_url,
      });
      setMoments([inserted, ...moments]);
      setDraftText(""); setDraftAm(null); setDraftPhoto(null); setDraftPreview(null); setShowCreate(false);
    } catch (e) { setError("Erreur lors de l'enregistrement : " + e.message); }
    setSaving(false);
  }

  async function addIdee() {
    if (!newIdee.trim()) return;
    try {
      const [inserted] = await sbInsert(sbUrl, sbKey, "idees", { text: newIdee.trim() });
      setIdees([inserted, ...idees]); setNewIdee("");
    } catch (e) { setError("Erreur lors de l'ajout."); }
  }

  async function toggleDone(id, current) {
    setIdees(idees.map(i => i.id === id ? { ...i, done: !current } : i));
    try { await sbUpdate(sbUrl, sbKey, "idees", id, { done: !current }); }
    catch (e) { setIdees(idees.map(i => i.id === id ? { ...i, done: current } : i)); }
  }

  function piocher() {
    if (!moments.length) return;
    let n;
    do { n = moments[Math.floor(Math.random() * moments.length)]; }
    while (moments.length > 1 && pioche && n.id === pioche.id);
    setPioche(n);
  }

  const sortedIdees = [...idees.filter(i => !i.done), ...idees.filter(i => i.done)];
  const hero = moments.length ? moments[Math.floor(Math.random() * moments.length)] : null;

  // ── Photo display ──────────────────────────────────────────────────────
  function PhotoBlock({ moment, height = 200 }) {
    const fb = fallback(moment.id);
    if (moment.photo_url) {
      return (
        <div style={{ width: "100%", height, overflow: "hidden" }}>
          <img src={moment.photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      );
    }
    return (
      <div style={{ width: "100%", height, background: fb.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: height * 0.28, opacity: .25 }}>{fb.emoji}</span>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes cardIn  { from{opacity:0;transform:translateY(8px) scale(.98)} to{opacity:1;transform:none} }
        @keyframes slideUp { from{opacity:0;transform:translateY(100%)} to{opacity:1;transform:none} }
        @keyframes popIn   { from{opacity:0;transform:scale(.94)} to{opacity:1;transform:none} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        input, textarea, button { font-family: -apple-system,'SF Pro Text','Helvetica Neue',sans-serif; }
        input:focus, textarea:focus { outline: none; }
        input::placeholder, textarea::placeholder { color: #B0A898; }
        textarea { resize: none; }
        .scroll::-webkit-scrollbar { display: none; }
        .tab-btn { background: none; border: none; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 6px 10px; }
      `}</style>

      <div style={{ minHeight: "100vh", background: T.paper, display: "flex", flexDirection: "column", maxWidth: 430, margin: "0 auto", position: "relative" }}>

        {/* header */}
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", padding: "54px 22px 0", flexShrink: 0 }}>
          {ready && (
            <button onClick={() => setShowCfg(!showCfg)} style={{ background: "none", border: "none", cursor: "pointer" }}>
              <Settings size={16} color={T.muted} />
            </button>
          )}
        </div>

        {showCfg && (
          <div style={{ position: "absolute", top: 80, right: 16, background: T.surface, borderRadius: 12, border: `1px solid ${T.border}`, zIndex: 30, boxShadow: "0 4px 16px rgba(0,0,0,.12)", animation: "popIn .2s ease" }}>
            <button onClick={disconnect} style={{ padding: "12px 20px", fontSize: 13.5, color: "#C0392B", display: "block", width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer" }}>
              Changer de base Supabase
            </button>
          </div>
        )}

        {error && (
          <div style={{ margin: "10px 16px 0", background: "#FFF0EE", border: "1px solid #F5C6C0", borderRadius: 10, padding: "10px 14px", display: "flex", gap: 8, alignItems: "center" }}>
            <AlertCircle size={14} color="#C0392B" />
            <span style={{ fontSize: 12.5, color: "#C0392B", flex: 1 }}>{error}</span>
            <button onClick={() => setError("")} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={13} color="#C0392B" /></button>
          </div>
        )}

        {loading && (
          <div style={{ display: "flex", justifyContent: "center", padding: "16px 0" }}>
            <Loader size={18} color={T.muted} style={{ animation: "spin 1s linear infinite" }} />
          </div>
        )}

        {!ready ? <SetupScreen onSave={handleSave} /> : (
          <>
            <div className="scroll" style={{ flex: 1, overflowY: "auto" }}>

              {/* ── ACCUEIL ── */}
              {tab === "accueil" && (
                <div>
                  <div style={{ position: "relative", width: "100%", height: 300, overflow: "hidden" }}>
                    {hero?.photo_url ? (
                      <img src={hero.photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: hero ? fallback(hero.id).bg : FALLBACK[0].bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 80, opacity: .2 }}>{hero ? fallback(hero.id).emoji : FALLBACK[0].emoji}</span>
                      </div>
                    )}
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,transparent 35%,rgba(245,241,234,.95) 100%)" }} />
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 22px 20px" }}>
                      {hero ? (
                        <>
                          <div style={{ fontSize: 16, fontWeight: 600, color: T.ink, lineHeight: 1.35, marginBottom: 5, fontFamily: T.fontDisp }}>
                            {hero.text?.slice(0, 65)}{hero.text?.length > 65 ? "…" : ""}
                          </div>
                          <div style={{ fontSize: 12.5, color: T.muted }}>{hero.poetic}</div>
                        </>
                      ) : (
                        <div style={{ fontSize: 14, color: T.muted, fontStyle: "italic" }}>Votre premier souvenir vous attend.</div>
                      )}
                    </div>
                  </div>

                  <div style={{ padding: "20px 22px 0" }}>
                    {[
                      { key: "moments", label: "Moments", sub: `${moments.length} souvenir${moments.length !== 1 ? "s" : ""}` },
                      { key: "idees",   label: "Idées",   sub: `${idees.filter(i => !i.done).length} en attente` },
                      { key: "jeux",    label: "Jeux",    sub: "à deux, sans enjeu" },
                    ].map(({ key, label, sub }) => (
                      <button key={key} onClick={() => setTab(key)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderBottom: `1px solid ${T.border}`, textAlign: "left", background: "none", border: "none", cursor: "pointer" }}>
                        <div>
                          <div style={{ fontSize: 16, fontWeight: 600, color: T.ink, fontFamily: T.fontDisp, marginBottom: 2 }}>{label}</div>
                          <div style={{ fontSize: 13, color: T.muted }}>{sub}</div>
                        </div>
                        <ChevronRight size={17} color={T.muted} />
                      </button>
                    ))}
                  </div>
                  <div style={{ textAlign: "center", padding: "30px 0 16px", fontSize: 11, color: T.muted, letterSpacing: ".12em", textTransform: "uppercase" }}>Bulle</div>
                </div>
              )}

              {/* ── MOMENTS ── */}
              {tab === "moments" && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 22px 20px" }}>
                    <span style={{ fontSize: 26, fontWeight: 700, color: T.ink, fontFamily: T.fontDisp }}>Moments</span>
                    <button onClick={() => setShowCreate(true)} style={{ width: 34, height: 34, borderRadius: "50%", background: T.ink, display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer" }}>
                      <Plus size={17} color={T.paper} />
                    </button>
                  </div>
                  {moments.length === 0 && !loading && (
                    <div style={{ textAlign: "center", padding: "50px 24px", color: T.muted, fontSize: 14, fontStyle: "italic" }}>Votre premier souvenir vous attend.</div>
                  )}
                  <div style={{ padding: "0 22px 100px", display: "flex", flexDirection: "column", gap: 24 }}>
                    {moments.map(m => (
                      <div key={m.id} style={{ borderRadius: T.radius, overflow: "hidden", background: T.surface, boxShadow: "0 2px 10px rgba(0,0,0,.07)", animation: "cardIn .5s ease" }}>
                        <PhotoBlock moment={m} height={220} />
                        <div style={{ padding: "14px 16px 16px", borderLeft: `3px solid ${MOOD[m.ambiance]?.color || T.sage}` }}>
                          <div style={{ fontSize: 14.5, color: T.ink, lineHeight: 1.55, marginBottom: 10 }}>{m.text}</div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                            <span style={{ fontSize: 12.5, color: MOOD[m.ambiance]?.color || T.sage }}>{m.poetic}</span>
                            <span style={{ fontSize: 11, color: T.muted }}>{realDate(m.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── IDÉES ── */}
              {tab === "idees" && (
                <div>
                  <div style={{ padding: "16px 22px 20px" }}>
                    <span style={{ fontSize: 26, fontWeight: 700, color: T.ink, fontFamily: T.fontDisp }}>Idées</span>
                  </div>
                  <div style={{ padding: "0 22px 100px" }}>
                    <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                      <input value={newIdee} onChange={e => setNewIdee(e.target.value)} onKeyDown={e => e.key === "Enter" && addIdee()} placeholder="Une idée à garder en tête..."
                        style={{ flex: 1, border: `1px solid ${T.border}`, borderRadius: 30, padding: "10px 16px", fontSize: 13.5, background: T.surface, color: T.ink, boxSizing: "border-box" }} />
                      <button onClick={addIdee} style={{ width: 38, height: 38, borderRadius: "50%", background: T.sage, display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", flexShrink: 0 }}>
                        <Plus size={17} color="#fff" />
                      </button>
                    </div>
                    {sortedIdees.map((idee, i) => (
                      <div key={idee.id}>
                        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", opacity: idee.done ? .45 : 1, transition: "opacity .3s" }}>
                          <button onClick={() => toggleDone(idee.id, idee.done)} style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${idee.done ? T.sage : T.border}`, background: idee.done ? T.sage : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>
                            {idee.done && <Check size={13} color="#fff" strokeWidth={2.5} />}
                          </button>
                          <span style={{ fontSize: 14.5, color: T.ink, textDecoration: idee.done ? "line-through" : "none", flex: 1, lineHeight: 1.45 }}>{idee.text}</span>
                        </div>
                        {i < sortedIdees.length - 1 && <div style={{ height: 1, background: T.border, marginLeft: 36 }} />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── JEUX ── */}
              {tab === "jeux" && (
                <div style={{ padding: "16px 22px 100px" }}>
                  <span style={{ fontSize: 26, fontWeight: 700, color: T.ink, fontFamily: T.fontDisp, display: "block", marginBottom: 22 }}>Jeux</span>
                  <div style={{ background: T.surface, borderRadius: T.radius, padding: "18px 20px", marginBottom: 16, border: `1px solid ${T.border}` }}>
                    <div style={{ fontSize: 16, fontWeight: 600, color: T.ink, marginBottom: 6, fontFamily: T.fontDisp }}>Je pense à…</div>
                    <p style={{ fontSize: 13, color: T.muted, marginBottom: 16, lineHeight: 1.5 }}>L'autre doit trouver en posant des questions. Pas de score — juste la discussion.</p>
                    {categorie && <div style={{ fontSize: 15, color: MOOD.tempete.color, marginBottom: 14, fontWeight: 500 }}>Indice : <em>{categorie}</em></div>}
                    <button onClick={() => setCategorie(JE_PENSE[Math.floor(Math.random() * JE_PENSE.length)])}
                      style={{ fontSize: 13.5, color: "#fff", background: T.ink, borderRadius: 30, padding: "9px 20px", border: "none", cursor: "pointer", fontWeight: 500 }}>
                      Lancer
                    </button>
                  </div>
                  <div style={{ background: T.surface, borderRadius: T.radius, padding: "18px 20px", border: `1px solid ${T.border}` }}>
                    <div style={{ fontSize: 16, fontWeight: 600, color: T.ink, marginBottom: 6, fontFamily: T.fontDisp }}>Souvenirs à deux</div>
                    <p style={{ fontSize: 13, color: T.muted, marginBottom: 16, lineHeight: 1.5 }}>Un souvenir est tiré au sort. Sans relire le texte, répondez ensemble.</p>
                    {pioche && (
                      <div style={{ borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
                        <PhotoBlock moment={pioche} height={120} />
                        <div style={{ background: T.paper2, padding: "12px 14px", borderLeft: `3px solid ${MOOD[pioche.ambiance]?.color || T.sage}` }}>
                          <div style={{ fontSize: 11, color: T.muted, marginBottom: 8 }}>{pioche.poetic}</div>
                          {["Où était-ce ?", "Quand était-ce ?", "Quel sentiment vous revient ?"].map(q => (
                            <div key={q} style={{ fontSize: 13.5, color: T.ink, padding: "4px 0" }}>{q}</div>
                          ))}
                        </div>
                      </div>
                    )}
                    <button onClick={piocher} disabled={!moments.length}
                      style={{ fontSize: 13.5, color: "#fff", background: moments.length ? T.sage : T.muted, borderRadius: 30, padding: "9px 20px", display: "flex", alignItems: "center", gap: 8, border: "none", cursor: moments.length ? "pointer" : "default", fontWeight: 500 }}>
                      <Shuffle size={14} /> Piocher
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* tab bar */}
            <div style={{ flexShrink: 0, display: "flex", justifyContent: "space-around", padding: "8px 8px 28px", borderTop: `1px solid ${T.border}`, background: "rgba(245,241,234,.97)", position: "sticky", bottom: 0 }}>
              {[
                { key: "accueil",  icon: Home,     label: "Accueil"  },
                { key: "moments",  icon: Image,    label: "Moments"  },
                { key: "idees",    icon: Gift,     label: "Idées"    },
                { key: "jeux",     icon: Gamepad2, label: "Jeux"     },
              ].map(({ key, icon: Icon, label }) => (
                <button key={key} onClick={() => setTab(key)} className="tab-btn">
                  <Icon size={24} color={tab === key ? T.sage : T.muted} strokeWidth={tab === key ? 2.3 : 1.8} />
                  <span style={{ fontSize: 10, color: tab === key ? T.ink : T.muted, fontWeight: tab === key ? 600 : 400 }}>{label}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* modal création */}
        {showCreate && (
          <div onClick={() => setShowCreate(false)} style={{ position: "fixed", inset: 0, background: "rgba(28,28,30,.5)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50 }}>
            <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 430, background: T.paper, borderRadius: "26px 26px 0 0", padding: "22px 24px 40px", animation: "slideUp .35s ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <span style={{ fontSize: 18, fontWeight: 600, color: T.ink, fontFamily: T.fontDisp }}>Nouveau souvenir</span>
                <button onClick={() => { setShowCreate(false); setDraftPhoto(null); setDraftPreview(null); }} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={18} color={T.muted} /></button>
              </div>

              <textarea value={draftText} onChange={e => setDraftText(e.target.value)} placeholder="Raconte un instant…" rows={3}
                style={{ width: "100%", border: `1px solid ${T.border}`, borderRadius: T.radius, padding: "12px 14px", fontSize: 14, background: T.surface, color: T.ink, marginBottom: 14, boxSizing: "border-box" }} />

              {/* photo picker */}
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
              {draftPreview ? (
                <div style={{ position: "relative", marginBottom: 14, borderRadius: 12, overflow: "hidden" }}>
                  <img src={draftPreview} alt="" style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }} />
                  <button onClick={() => { setDraftPhoto(null); setDraftPreview(null); }}
                    style={{ position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: "50%", background: "rgba(0,0,0,.5)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <X size={14} color="#fff" />
                  </button>
                </div>
              ) : (
                <button onClick={() => fileRef.current.click()}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, border: `1px dashed ${T.border}`, borderRadius: 12, padding: "12px 16px", background: "transparent", cursor: "pointer", color: T.muted, fontSize: 13.5, marginBottom: 14 }}>
                  <Camera size={16} color={T.muted} /> Ajouter une photo (optionnel)
                </button>
              )}

              <p style={{ fontSize: 13, color: T.ink, marginBottom: 10 }}>Comment va votre couple aujourd'hui ?</p>
              <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
                {Object.entries(MOOD).map(([key, m]) => (
                  <button key={key} onClick={() => setDraftAm(key)}
                    style={{ flex: 1, padding: "10px 4px", borderRadius: 12, border: draftAm === key ? `2px solid ${m.color}` : `1px solid ${T.border}`, background: draftAm === key ? `${m.color}18` : T.surface, cursor: "pointer", transition: "all .15s" }}>
                    <div style={{ width: 9, height: 9, borderRadius: "50%", background: m.color, margin: "0 auto 6px" }} />
                    <div style={{ fontSize: 10.5, color: T.ink }}>{m.label}</div>
                  </button>
                ))}
              </div>

              <button onClick={addMoment} disabled={!draftText.trim() || !draftAm || saving}
                style={{ width: "100%", padding: "13px 0", borderRadius: 30, background: !draftText.trim() || !draftAm ? T.paper2 : T.ink, color: !draftText.trim() || !draftAm ? T.muted : T.paper, fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {saving ? <><Loader size={15} style={{ animation: "spin 1s linear infinite" }} /> Enregistrement…</> : "Enregistrer"}
              </button>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
