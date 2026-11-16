/* ============================================================
   RAVENLOFT — THE TRIAD SYSTEM · WIKI APPLICATION
   Single-file, no network dependencies. Hash router + search
   + Character Forge + Compare + Dice.
   ============================================================ */

/* ---------- navigation ---------- */
const NAV = [
  { section: "Welcome", items: [["home", "The Triad System"]] },
  { section: "The Setting", items: [["lore-cosmology", "The Veil, the Blood & the Land"], ["lore-orders", "The Three Orders"]] },
  { section: "The Rules", items: [["rules-attributes", "Attributes & Skills"], ["rules-creation", "Character Creation"], ["rules-combat", "Combat"], ["rules-horror", "The Three Horrors"], ["rules-progression", "Progression & Crossing"]] },
  { section: "The Classes", items: [["classes-index", "All 21 Classes"]] },
  { section: "Tools", items: [["tools-forge", "Character Forge"], ["tools-compare", "Compare Classes"], ["tools-dice", "Dice Roller"]] },
  { section: "Appendix", items: [["appendix-weapons", "Weapons & Armor"], ["appendix-abilities", "Ability Index"], ["appendix-glossary", "Glossary"], ["appendix-design", "Design Notes & Sources"]] }
];
/* class groups injected into nav after "All 21 Classes" */
function buildNav() {
  const groups = [
    { triad: "veil", label: "The Veil · Occultism" },
    { triad: "blood", label: "The Blood · Shapeshifters" },
    { triad: "land", label: "The Land · Terrain" }
  ];
  const classSections = groups.map(g => {
    const base = CLASSES.find(c => c.kind === "base" && c.triad === g.triad);
    const items = [["class-" + base.id, base.name + " (base)"]];
    PATHS.filter(p => p.parent === base.id).forEach(p => {
      items.push(["class-" + p.id, "→ " + p.name]);
      const h = HYBRIDS.find(h => h.parent === p.id);
      if (h) items.push(["class-" + h.id, "⇢ " + h.name + " (hybrid)"]);
    });
    return { section: g.label, color: TRIAD[g.triad].color, items };
  });
  const idx = NAV.findIndex(n => n.section === "The Classes");
  NAV.splice(idx + 1, 0, ...classSections);
}
buildNav();

/* ---------- helpers ---------- */
const $ = sel => document.querySelector(sel);
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const strip = html => String(html).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
function chip(txt, cls) { return `<span class="chip ${cls || ""}">${txt}</span>`; }
function statDelta(v) { return v === 0 ? "" : (v > 0 ? "+" + v : String(v)); }
function lineage(c) {
  if (c.kind === "base") return [c];
  if (c.kind === "path") return [CLASS_BY_ID[c.parent], c];
  return [CLASS_BY_ID[CLASS_BY_ID[c.parent].parent], CLASS_BY_ID[c.parent], c];
}
function lineageTotals(c) {
  const t = { ...CHASSIS };
  lineage(c).forEach(k => { Object.keys(k.stats).forEach(s => t[s] += k.stats[s]); });
  return t;
}
function levelBonuses(c, level) {
  const primary = CLASS_BY_ID[lineage(c)[0].id].primary;
  const b = { hp: 0, mana: 0, stamina: 0, acc: 0 };
  [3, 5, 7, 9].forEach(l => { if (level >= l) { b.hp += 5; b[primary] += 5; } });
  [4, 8].forEach(l => { if (level >= l) b.acc += 1; });
  if (level >= 10) { b.hp += 10; b[primary] += 10; }
  return b;
}
function fullTotals(c, level) {
  const t = lineageTotals(c);
  const b = levelBonuses(c, level);
  t.hp += b.hp; t.mana += b.mana; t.stamina += b.stamina; t.acc += b.acc;
  return t;
}
const KIND_LABEL = { base: "Base Class", path: "Progression", hybrid: "Hybrid Class" };

/* ---------- sigil SVG ---------- */
const SIGIL = `<svg viewBox="0 0 120 120" class="sigil" aria-hidden="true">
  <defs><radialGradient id="sg" cx="50%" cy="45%" r="60%">
    <stop offset="0%" stop-color="#2a2438"/><stop offset="100%" stop-color="#0b0a10"/>
  </radialGradient></defs>
  <circle cx="60" cy="60" r="56" fill="url(#sg)" stroke="#4a4258" stroke-width="1.5"/>
  <path d="M60 18 L98 86 L22 86 Z" fill="none" stroke="#6f6486" stroke-width="1.5"/>
  <circle cx="60" cy="18" r="7" fill="none" stroke="#8b7bd8" stroke-width="1.5"/>
  <circle cx="60" cy="18" r="2.4" fill="#8b7bd8"/>
  <path d="M94 82 a7 7 0 1 0 8 8 a5.4 5.4 0 1 1 -8 -8" fill="#c0392f"/>
  <rect x="17" y="80" width="10" height="13" rx="2" fill="none" stroke="#8a9a5b" stroke-width="1.5"/>
  <line x1="22" y1="83" x2="22" y2="90" stroke="#8a9a5b" stroke-width="1.2"/>
  <circle cx="60" cy="63" r="3" fill="#d8cfc0" opacity="0.85"/>
  <path d="M60 40 L60 60 M48 74 L57 65 M72 74 L63 65" stroke="#4a4258" stroke-width="1"/>
</svg>`;

/* ---------- page renderers ---------- */
function renderHome() {
  const counts = { base: BASES.length, path: PATHS.length, hybrid: HYBRIDS.length, abilities: CLASSES.length * 3 };
  return `
<div class="hero">
  ${SIGIL}
  <p class="kicker">A Ravenloft-inspired d20 system · Conan Exiles · Tot! Roleplay Redux</p>
  <h1>The Triad System</h1>
  <p class="hero-sub">Three wounds. Three orders. Three prices.<br>
  <strong>The Veil</strong> of occultism · <strong>The Blood</strong> of shapeshifters · <strong>The Land</strong> of terrain.</p>
  <div class="hero-stats">
    <div><b>${counts.base}</b><span>base classes</span></div>
    <div><b>${counts.path}</b><span>progressions</span></div>
    <div><b>${counts.hybrid}</b><span>hybrid classes</span></div>
    <div><b>${counts.abilities}</b><span>abilities</span></div>
    <div><b>3</b><span>horror tracks</span></div>
  </div>
</div>
<div class="triad-cards">
  ${Object.values(TRIAD).map(t => {
    const base = CLASS_BY_ID[t.base];
    const paths = PATHS.filter(p => p.parent === base.id);
    return `<a class="triad-card link" href="#/class-${base.id}" style="--tc:${t.color}">
      <h3>${t.name}</h3><p class="axis">${t.axis} · pays in ${t.horror}</p>
      <p>${t.blurb}</p>
      <p class="triad-line"><strong>${base.name}</strong> → ${paths.map(p => p.name).join(" · ")}</p>
      <p class="triad-motto">“${t.motto}”</p>
    </a>`;
  }).join("")}
</div>
<h2>How the system fits together</h2>
<p>Every character begins as one of three <strong>base classes</strong>. At level 2 they choose one of three <strong>progressions</strong> — nine paths in total, preserving the six legacy archetypes (Hunter, Inquisitor, Scholar, Medium, Guardian, Wanderer). From level 4, a costly and witnessed <strong>Rite of Crossing</strong> can fuse a progression with a different triad member, producing one of nine <strong>hybrid classes</strong>. 3 × 3 × 3: the triad all the way down.</p>
<p>Combat is the project's player-resolved d20 engine: fixed defenses, damage after the hit, DR once, personal-turn cooldowns. Horror is three 0–100 tracks — <strong>Fear</strong>, <strong>Sanity</strong>, <strong>Corruption</strong> — each with three thresholds. Magic is rare, costly, and watched.</p>
<div class="quick-links">
  <a href="#/rules-creation">Create a character →</a>
  <a href="#/classes-index">Browse all 21 classes →</a>
  <a href="#/tools-forge">Open the Character Forge →</a>
  <a href="#/rules-horror">Read the Three Horrors →</a>
</div>
<blockquote class="lore-quote">"I do not open doors. I only read what is written on them."<cite>— Mother Ilvane, Lantern-Keeper of Vallaki</cite></blockquote>`;
}

function renderClassesIndex() {
  const fam = triad => {
    const base = CLASS_BY_ID[TRIAD[triad].base];
    const rows = PATHS.filter(p => p.parent === base.id).map(p => {
      const h = HYBRIDS.find(h => h.parent === p.id);
      return `<tr>
        <td><a href="#/class-${p.id}"><strong>${p.name}</strong></a><br><span class="dim">${p.epithet}</span></td>
        <td>${p.role}</td>
        <td><a href="#/class-${h.id}"><strong>${h.name}</strong></a><br><span class="dim">× ${TRIAD[h.partner].name}</span></td>
        <td>${h.role}</td></tr>`;
    }).join("");
    return `<div class="family" style="--tc:${TRIAD[triad].color}">
      <h2><a href="#/class-${base.id}">${base.name}</a> <span class="dim">— ${TRIAD[triad].name} · ${TRIAD[triad].axis}</span></h2>
      <p>${base.role} · primary resource: <strong>${base.primary === "mana" ? "Mana" : "Stamina"}</strong> · key attributes: ${base.attributes.join(", ")}</p>
      <table class="rules-table"><tr><th>Progression</th><th>Role</th><th>Its hybrid</th><th>Role</th></tr>${rows}</table>
    </div>`;
  };
  return `<p class="lede">Twenty-one entries in strict triads: 3 base classes, each with 3 progressions, each progression with its own hybrid. Every hybrid keeps its full lineage and adds the partner's trait plus three fusion abilities.</p>
  ${fam("veil")}${fam("blood")}${fam("land")}
  <h2>The Turning at a glance</h2>
  <p><strong>Greater Turning</strong> (twice each): Veil→Land (Sanctifier, Gravebound) · Land→Blood (Bearwarden, Mistshroud) · Blood→Veil (Moonbinder, Doomwing).<br>
  <strong>Lesser Turning</strong> (once each): Veil→Blood (Chimerist) · Blood→Land (Landwight) · Land→Veil (Hexhunter).</p>
  <p>Each base is the source of three hybrids and the partner of three hybrids — perfect triadic balance. See <a href="#/rules-progression">the Rite of Crossing</a> for requirements and prices.</p>`;
}

function statTable(c) {
  const keys = [["hp", "HP"], ["mana", "Mana"], ["stamina", "Stamina"], ["ac", "AC"], ["dr", "DR"], ["dodge", "Dodge Def"], ["acc", "Accuracy"]];
  const lin = lineage(c);
  const totals = lineageTotals(c);
  if (c.kind === "base") {
    return `<table class="rules-table stat-table"><tr><th>HP</th><th>Mana</th><th>Stamina</th><th>AC</th><th>DR</th><th>Accuracy</th></tr>
      <tr class="totals">${["hp", "mana", "stamina", "ac", "dr"].map(k => `<td>${totals[k]}</td>`).join("")}<td>+${CHASSIS.acc}</td></tr></table>
      <p class="note">Universal chassis 100 / 50 / 75 / 10 / 1, modified by this class. Dodge & Spell Defense are attribute-driven (see <a href="#/rules-combat">Combat</a>). Accuracy starts at +1.</p>`;
  }
  const deltas = keys.filter(([k]) => c.stats[k] !== 0).map(([k, label]) => chip(label + " " + statDelta(c.stats[k]), "delta")).join(" ");
  return `<p><strong>Adds to the lineage:</strong> ${deltas || "no stat changes"}</p>
    <table class="rules-table stat-table"><tr><th>HP</th><th>Mana</th><th>Stamina</th><th>AC</th><th>DR</th><th>Dodge</th></tr>
    <tr class="totals">${["hp", "mana", "stamina", "ac", "dr", "dodge"].map(k => `<td>${totals[k]}</td>`).join("")}</tr></table>
    <p class="note">Totals shown for the full lineage (${lin.map(k => k.name).join(" + ")}) at level 1, before armor. Use the <a href="#/tools-forge">Character Forge</a> for any level.</p>`;
}

function abilityCard(a) {
  return `<div class="ability ${a.type === "Special" ? "special" : ""}">
    <div class="ability-head"><span class="rank">${a.rank}</span><h3>${a.name}</h3><span class="atype">${a.type}</span></div>
    <div class="ability-meta">${chip(a.cost, "cost")}${a.cd ? chip("CD " + a.cd + " turns", "cd") : chip("No cooldown", "cd")}${chip(a.range, "range")}</div>
    <p>${a.effect}</p>
    ${a.horror ? `<p class="horror-line">☩ ${a.horror}</p>` : ""}
    <p class="flavor">“${a.flavor}”</p>
  </div>`;
}

function renderClass(c) {
  const t = TRIAD[c.triad];
  const lin = lineage(c);
  const crumb = lin.map(k => `<a href="#/class-${k.id}">${k.name}</a>`).join(" <span class='dim'>→</span> ");
  const partner = c.kind === "hybrid" ? TRIAD[c.partner] : null;
  const crossing = c.kind === "hybrid" ? CROSSING_COSTS[c.partner] : null;
  const siblings = c.kind === "base"
    ? PATHS.filter(p => p.parent === c.id)
    : c.kind === "path" ? PATHS.filter(p => p.parent === c.parent && p.id !== c.id) : [];
  const ownHybrid = c.kind === "path" ? HYBRIDS.find(h => h.parent === c.id) : null;
  const bornHybrids = c.kind === "base" ? HYBRIDS.filter(h => CLASS_BY_ID[h.parent].parent === c.id) : [];
  const received = c.kind === "base" ? HYBRIDS.filter(h => h.partner === c.triad) : [];

  return `
<div class="class-hero" style="--tc:${t.color}">
  <div class="class-badges">${chip(t.name + " · " + t.axis, "triad-badge")}${chip(KIND_LABEL[c.kind], "kind-badge")}</div>
  <h1>${c.name}</h1>
  <p class="epithet">${c.epithet}${c.kind === "hybrid" ? ` · ${CLASS_BY_ID[c.parent].name} × ${CLASS_BY_ID[partner.base].name}` : ""}</p>
  <p class="role-line">${c.role} · primary resource: <strong>${c.primary === "mana" ? "Mana" : "Stamina"}</strong> · lineage: ${crumb}</p>
</div>
${c.kind === "hybrid" ? `<div class="crossing-box" style="--tc:${partner.color}">
  <strong>The Turning:</strong> crossed into <strong>${partner.name}</strong> — price paid: <strong>${crossing.delta}</strong>. ${crossing.text}
  Requires path Adept, partner key skill +3, a played crossing event and GM approval. <a href="#/rules-progression">Full rite →</a>
</div>` : ""}
<h2>Stats</h2>
${statTable(c)}
<h2>Trait — ${c.trait.name}</h2>
<div class="trait-card" style="--tc:${t.color}"><p>${c.trait.text}</p></div>
<h2>Abilities</h2>
<p class="note">Unlocked by rank: ${c.kind === "base" ? "Initiate L1 · Adept L3 · Master L5" : c.kind === "path" ? "Initiate L2 · Adept L4 · Master L6" : "Initiate at the Crossing (L4+) · Adept L7 · Master L9"}. Costs draw from the turn pools: 2 AP · 1 SP · 1 Mov.</p>
${c.abilities.map(abilityCard).join("")}
<h2>Weapons & Armor</h2>
<table class="rules-table"><tr><th>Signature weapon</th><th>Category</th><th>Damage</th><th>Tags</th></tr>
${c.weapons.map(w => `<tr><td>${w.name}</td><td>${w.cat}</td><td><code>${w.dmg}</code></td><td>${w.tags}</td></tr>`).join("")}</table>
<p><strong>Armor proficiency:</strong> ${c.armor}. <a href="#/appendix-weapons">Weapon tags & armor rules →</a></p>
<h2>Attributes & Key Skills</h2>
<p>Recommended attributes: ${c.attributes.map(a => chip(a, "attr")).join(" ")}</p>
<p>Key skills: ${c.skills.map(s => chip(s)).join(" ")}</p>
<h2>Lore</h2>
<div class="lore">${c.lore.map((p, i) => `<p${i === 0 ? ' class="dropcap"' : ""}>${p}</p>`).join("")}</div>
<blockquote class="lore-quote">"${c.quote.text}"<cite>— ${c.quote.by}</cite></blockquote>
${c.kind === "base" ? `
<h2>Progressions of the ${c.name}</h2>
<div class="mini-cards">${siblings.map(p => `<a class="mini-card" href="#/class-${p.id}" style="--tc:${t.color}"><h3>${p.name}</h3><p>${p.epithet}</p><p class="dim">${p.role}</p></a>`).join("")}</div>
<h2>Hybrids born of this class</h2>
<div class="mini-cards">${bornHybrids.map(h => `<a class="mini-card" href="#/class-${h.id}" style="--tc:${TRIAD[h.partner].color}"><h3>${h.name}</h3><p>${h.epithet}</p><p class="dim">${h.role}</p></a>`).join("")}</div>
<h2>Hybrids that cross into ${t.name}</h2>
<p>${received.map(h => `<a href="#/class-${h.id}">${h.name}</a>`).join(" · ")} — each pays ${CROSSING_COSTS[c.triad].delta} at the crossing.</p>` : ""}
${c.kind === "path" ? `
<h2>This path's hybrid</h2>
<div class="mini-cards"><a class="mini-card" href="#/class-${ownHybrid.id}" style="--tc:${TRIAD[ownHybrid.partner].color}"><h3>${ownHybrid.name}</h3><p>${ownHybrid.epithet}</p><p class="dim">${ownHybrid.role} · price: ${CROSSING_COSTS[ownHybrid.partner].delta}</p></a></div>
<h2>Sibling progressions</h2>
<p>${siblings.map(p => `<a href="#/class-${p.id}">${p.name}</a>`).join(" · ")}</p>` : ""}
${c.kind === "hybrid" ? `
<h2>Lineage</h2>
<p>Keeps everything from <a href="#/class-${lin[0].id}">${lin[0].name}</a> and <a href="#/class-${lin[1].id}">${lin[1].name}</a>, adds the <a href="#/class-${partner.base}">${CLASS_BY_ID[partner.base].name}</a> trait and the three fusion abilities above.</p>` : ""}`;
}

function renderAbilityIndex() {
  const rows = CLASSES.map(c => c.abilities.map(a =>
    `<tr><td><a href="#/class-${c.id}">${c.name}</a></td><td>${TRIAD[c.triad].name}</td><td>${a.rank}</td><td><strong>${a.name}</strong></td><td>${a.type}</td><td>${a.cost}</td><td>${a.cd ? "CD " + a.cd : "—"}</td></tr>`
  ).join("")).join("");
  return `<p class="lede">All ${CLASSES.length * 3} class abilities (plus the universal basic attacks). Costs: AP = Action Point, SP = Special Action, CD = cooldown in personal turns.</p>
  <table class="rules-table ability-index"><tr><th>Class</th><th>Triad</th><th>Rank</th><th>Ability</th><th>Type</th><th>Cost</th><th>CD</th></tr>${rows}</table>
  <h2>Universal basic attacks</h2>
  <table class="rules-table"><tr><th>Attack</th><th>Gross</th><th>Cost</th><th>Range</th></tr>
  ${WEAPON_RULES.map(w => `<tr><td>${w.attack}</td><td><code>${w.gross}</code></td><td>${w.cost}</td><td>${w.range}</td></tr>`).join("")}</table>`;
}

/* ---------- TOOLS: Character Forge ---------- */
const FORGE = {
  base: "occultist", path: "", hybrid: "", level: 1, armor: "Cloth", background: "",
  attrs: { Body: 0, Agility: 0, Fortitude: 0, Charisma: 0 },
  skills: {}
};
SKILL_TREE.forEach(a => a.skills.forEach(s => FORGE.skills[s] = 0));
INDEPENDENT.forEach(s => FORGE.skills[s] = 0);
const ATTR_BUDGET = 15, SKILL_BUDGET = 35, PT_CAP = 10;
function rankCost(rank) { let c = 0; for (let i = 1; i <= rank; i++) c += COST_LADDER[i - 1].cost; return c; }
function spentAttrs() { return Object.values(FORGE.attrs).reduce((s, r) => s + rankCost(r), 0); }
function spentSkills() { return Object.values(FORGE.skills).reduce((s, r) => s + rankCost(r), 0); }
function bgGrants() {
  const b = BACKGROUNDS.find(x => x.name === FORGE.background);
  if (!b) return {};
  const m = {};
  b.grants.split(",").forEach(g => { const mm = g.trim().match(/\+1 (\w[\w ]*)/); if (mm) m[mm[1]] = 1; });
  return m;
}
function forgeClass() {
  if (FORGE.hybrid) return CLASS_BY_ID[FORGE.hybrid];
  if (FORGE.path) return CLASS_BY_ID[FORGE.path];
  return CLASS_BY_ID[FORGE.base];
}
function forgeTotals() {
  const c = forgeClass();
  const t = fullTotals(c, FORGE.level);
  const armor = ARMOR_RULES.find(a => a.armor === FORGE.armor) || ARMOR_RULES[0];
  t.ac += parseInt(armor.ac) || 0; t.dr += parseInt(armor.dr) || 0;
  const A = FORGE.attrs;
  t.dodge += A.Agility + Math.floor(A.Fortitude / 2) + Math.floor(A.Body / 3);
  t.spelldef = A.Fortitude + Math.floor(A.Body / 2) + Math.floor(A.Agility / 3);
  t.acc += FORGE.skills.Accuracy;
  return t;
}
function effSkill(name) {
  const parent = SKILL_TREE.find(a => a.skills.includes(name));
  const bg = bgGrants()[name] || 0;
  const rank = FORGE.skills[name] + bg;
  if (name === "Accuracy") return CHASSIS.acc + levelBonuses(forgeClass(), FORGE.level).acc + rank;
  return parent ? rank + FORGE.attrs[parent.attr] : rank;
}
function unlocksUpTo(level) {
  return LEVEL_LADDER.filter(l => l.level <= level).map(l => `<li><strong>L${l.level}</strong> — ${l.grant}</li>`).join("");
}

function renderForge() {
  const paths = PATHS.filter(p => p.parent === FORGE.base);
  const hybrids = FORGE.path ? HYBRIDS.filter(h => h.parent === FORGE.path) : [];
  const c = forgeClass();
  const t = forgeTotals();
  const sa = spentAttrs(), ss = spentSkills();
  const attrRows = Object.keys(FORGE.attrs).map(k => {
    const r = FORGE.attrs[k], cost = rankCost(r);
    return `<div class="stepper-row"><label>${k}</label>
      <button class="step" data-forge="attr" data-key="${k}" data-d="-1">−</button>
      <span class="step-val">+${r}</span>
      <button class="step" data-forge="attr" data-key="${k}" data-d="1">+</button>
      <span class="step-cost">${cost} pts</span></div>`;
  }).join("");
  const skillRows = [...SKILL_TREE.flatMap(a => a.skills), ...INDEPENDENT].map(k => {
    const r = FORGE.skills[k], cost = rankCost(r), bg = bgGrants()[k] || 0;
    return `<div class="stepper-row"><label>${k}${bg ? ' <span class="bg-tag">+' + bg + ' bg</span>' : ""}</label>
      <button class="step" data-forge="skill" data-key="${k}" data-d="-1">−</button>
      <span class="step-val">+${r}</span>
      <button class="step" data-forge="skill" data-key="${k}" data-d="1">+</button>
      <span class="step-cost">${cost} pts</span>
      <span class="step-eff">= ${effSkill(k)}</span></div>`;
  }).join("");
  const overA = sa > ATTR_BUDGET, overS = ss > SKILL_BUDGET;
  return `
<p class="lede">Build a legal character: the Forge enforces the 15/35 budgets, the cost ladder, the 10-point caps, level gating and every class delta. Attributes feed skills and defenses — resources come from the class lineage.</p>
<div class="forge-grid">
  <div class="forge-col">
    <h2>1 · Lineage</h2>
    <div class="field"><label>Base class</label><select data-forge="base">${BASES.map(b => `<option value="${b.id}" ${b.id === FORGE.base ? "selected" : ""}>${b.name} — ${TRIAD[b.triad].name}</option>`).join("")}</select></div>
    <div class="field"><label>Progression ${FORGE.level < 2 ? '<span class="dim">(unlocks L2)</span>' : ""}</label>
      <select data-forge="path" ${FORGE.level < 2 ? "disabled" : ""}><option value="">— none —</option>${paths.map(p => `<option value="${p.id}" ${p.id === FORGE.path ? "selected" : ""}>${p.name}</option>`).join("")}</select></div>
    <div class="field"><label>Hybrid (Rite of Crossing) ${FORGE.level < 4 ? '<span class="dim">(unlocks L4)</span>' : ""}</label>
      <select data-forge="hybrid" ${FORGE.level < 4 || !FORGE.path ? "disabled" : ""}><option value="">— none —</option>${hybrids.map(h => `<option value="${h.id}" ${h.id === FORGE.hybrid ? "selected" : ""}>${h.name} × ${TRIAD[h.partner].name}</option>`).join("")}</select></div>
    <div class="field"><label>Level: <strong id="forge-level-label">${FORGE.level}</strong></label>
      <input type="range" min="1" max="10" value="${FORGE.level}" data-forge="level"></div>
    <div class="field"><label>Background</label><select data-forge="background"><option value="">— none —</option>${BACKGROUNDS.map(b => `<option ${b.name === FORGE.background ? "selected" : ""}>${b.name}</option>`).join("")}</select></div>
    <div class="field"><label>Armor</label><select data-forge="armor">${ARMOR_RULES.map(a => `<option ${a.armor === FORGE.armor ? "selected" : ""}>${a.armor}</option>`).join("")}</select>
      <p class="dim small">Class proficiency: ${c.armor}. Non-proficient: AC bonus halved, Stealth penalty doubled (apply manually).</p></div>
    <h2>2 · Attributes <span class="budget ${overA ? "over" : ""}">${sa}/${ATTR_BUDGET}</span></h2>
    ${attrRows}
    ${overA ? '<p class="warn">Over budget — allocation rejected at save.</p>' : ""}
    <h2>3 · Skills <span class="budget ${overS ? "over" : ""}">${ss}/${SKILL_BUDGET}</span></h2>
    <div class="skill-steppers">${skillRows}</div>
    ${overS ? '<p class="warn">Over budget — allocation rejected at save.</p>' : ""}
    <p class="dim small">Cap: 10 points spent per attribute/skill (max rank +5 at creation). Background grants are fixed and free. Accuracy & Initiative have no attribute parent.</p>
  </div>
  <div class="forge-col">
    <h2>Sheet — ${c.name} <span class="dim">L${FORGE.level}</span></h2>
    <div class="sheet-stats">
      ${[["HP", t.hp, "#c0392f"], ["Mana", t.mana, "#8b7bd8"], ["Stamina", t.stamina, "#d9a441"], ["AC", t.ac, "#9aa5b1"], ["DR", t.dr, "#9aa5b1"], ["Accuracy", "+" + t.acc, "#5ba88a"], ["Dodge Def", t.dodge, "#5ba88a"], ["Spell Def", t.spelldef, "#5ba88a"]].map(s =>
        `<div class="sheet-stat" style="--sc:${s[2]}"><b>${s[1]}</b><span>${s[0]}</span></div>`).join("")}
    </div>
    <div class="sheet-pools">${chip("2 AP / turn")}${chip("1 Mov / turn")}${chip("1 SP / turn")}${chip("Fear 0/100")}${chip("Sanity 100/100")}${chip("Corruption 0/100")}</div>
    <h3>Trait — ${c.trait.name}</h3><p class="small">${c.trait.text}</p>
    ${FORGE.hybrid ? `<p class="small crossing-note">Crossing price paid: <strong>${CROSSING_COSTS[CLASS_BY_ID[FORGE.hybrid].partner].delta}</strong>.</p>` : ""}
    <h3>Unlocked so far</h3><ul class="small unlocks">${unlocksUpTo(FORGE.level)}</ul>
    <h3>Effective skills</h3>
    <div class="eff-grid">${[...SKILL_TREE.flatMap(a => a.skills), ...INDEPENDENT].map(k => `<div><span>${k}</span><b>${effSkill(k)}</b></div>`).join("")}</div>
    <button class="btn" id="forge-copy">Copy build as JSON</button>
    <span id="forge-copy-msg" class="dim small"></span>
  </div>
</div>`;
}

/* ---------- TOOLS: Compare ---------- */
const COMPARE = { a: "occultist", b: "skinwalker", c: "landsworn", level: 10 };
function renderCompare() {
  const opts = sel => CLASSES.map(c => `<option value="${c.id}" ${c.id === sel ? "selected" : ""}>${c.name} (${KIND_LABEL[c.kind]})</option>`).join("");
  const cols = ["a", "b", "c"].map(k => CLASS_BY_ID[COMPARE[k]]);
  const totals = cols.map(c => fullTotals(c, COMPARE.level));
  const maxes = { hp: Math.max(...totals.map(t => t.hp)), mana: Math.max(...totals.map(t => t.mana)), stamina: Math.max(...totals.map(t => t.stamina)) };
  const bar = (v, max, color) => `<div class="bar"><div class="bar-fill" style="width:${Math.round(100 * v / max)}%;background:${color}"></div><span>${v}</span></div>`;
  return `
<p class="lede">Three classes side by side — a triad, naturally. Totals include the full lineage (base + progression + hybrid) at the chosen level, before armor and attributes.</p>
<div class="compare-controls">
  ${["a", "b", "c"].map(k => `<select data-compare="${k}">${opts(COMPARE[k])}</select>`).join("")}
  <label>Level <input type="range" min="1" max="10" value="${COMPARE.level}" data-compare="level"> <strong>${COMPARE.level}</strong></label>
</div>
<div class="compare-grid">
${cols.map((c, i) => {
  const t = totals[i], tr = TRIAD[c.triad];
  return `<div class="compare-col" style="--tc:${tr.color}">
    <h2><a href="#/class-${c.id}">${c.name}</a></h2>
    <p class="dim">${c.epithet}<br>${KIND_LABEL[c.kind]} · ${tr.name} · ${c.role}</p>
    <p class="small">Lineage: ${lineage(c).map(k => k.name).join(" + ")}</p>
    <h3>HP</h3>${bar(t.hp, maxes.hp, "#c0392f")}
    <h3>Mana</h3>${bar(t.mana, maxes.mana, "#8b7bd8")}
    <h3>Stamina</h3>${bar(t.stamina, maxes.stamina, "#d9a441")}
    <div class="compare-minis">${chip("AC " + t.ac)}${chip("DR " + t.dr)}${chip("Acc +" + t.acc)}${chip("Dodge +" + t.dodge)}</div>
    <h3>Trait — ${c.trait.name}</h3><p class="small">${c.trait.text}</p>
    <h3>Abilities</h3>
    <ul class="small">${c.abilities.map(a => `<li><strong>${a.name}</strong> <span class="dim">(${a.rank}, ${a.type}, ${a.cost}${a.cd ? ", CD " + a.cd : ""})</span></li>`).join("")}</ul>
    <h3>Weapons</h3><p class="small">${c.weapons.map(w => w.name).join(" · ")}</p>
    <p class="small"><strong>Armor:</strong> ${c.armor} · <strong>Attributes:</strong> ${c.attributes.join(", ")}</p>
  </div>`;
}).join("")}
</div>`;
}

/* ---------- TOOLS: Dice ---------- */
const DICE = { mod: 0, mode: "normal", log: [] };
function rollDie(n) { return 1 + Math.floor(Math.random() * n); }
function rollD20() {
  const r1 = rollDie(20), r2 = rollDie(20);
  let nat = r1, kept = [r1];
  if (DICE.mode === "adv") { nat = Math.max(r1, r2); kept = [r1, r2]; }
  if (DICE.mode === "dis") { nat = Math.min(r1, r2); kept = [r1, r2]; }
  const total = nat + DICE.mod;
  const crit = nat === 20 ? "CRITICAL HIT" : nat === 1 ? "CRITICAL MISS" : "";
  DICE.log.unshift({ expr: `d20${DICE.mod >= 0 ? "+" : ""}${DICE.mod}${DICE.mode !== "normal" ? " (" + DICE.mode + ")" : ""}`, kept, nat, total, crit });
  DICE.log = DICE.log.slice(0, 12);
  paintDiceResult();
}
function rollExpr(expr) {
  const m = expr.trim().match(/^(\d*)d(\d+)\s*([+-]\s*\d+)?$/i);
  if (!m) { DICE.log.unshift({ expr, error: "Use XdY+Z (e.g. 2d3+4)" }); paintDiceResult(); return; }
  const n = parseInt(m[1] || "1"), faces = parseInt(m[2]), bonus = m[3] ? parseInt(m[3].replace(/\s/g, "")) : 0;
  if (n < 1 || n > 20 || faces < 2 || faces > 100) { DICE.log.unshift({ expr, error: "1–20 dice, d2–d100" }); paintDiceResult(); return; }
  const rolls = Array.from({ length: n }, () => rollDie(faces));
  const total = rolls.reduce((a, b) => a + b, 0) + bonus;
  DICE.log.unshift({ expr, kept: rolls, total, bonus });
  DICE.log = DICE.log.slice(0, 12);
  paintDiceResult();
}
function paintDiceResult() {
  const el = $("#dice-log");
  if (!el) return;
  el.innerHTML = DICE.log.map((r, i) => r.error
    ? `<div class="dice-row err"><span class="dice-expr">${esc(r.expr)}</span><span>${r.error}</span></div>`
    : `<div class="dice-row ${i === 0 ? "latest" : ""} ${r.crit === "CRITICAL HIT" ? "crit" : r.crit === "CRITICAL MISS" ? "fumble" : ""}">
      <span class="dice-expr">${esc(r.expr)}</span>
      <span class="dice-kept">[${r.kept.join(", ")}]${r.bonus ? (r.bonus > 0 ? " +" + r.bonus : " " + r.bonus) : ""}</span>
      <span class="dice-total">${r.total}</span>
      ${r.crit ? `<span class="dice-crit">${r.crit}</span>` : ""}
    </div>`).join("") || '<p class="dim">No rolls yet. The Mists are listening.</p>';
}
function renderDice() {
  return `
<p class="lede">The system's dice: 1d20 + modifier for attacks and checks (advantage/disadvantage = 2d20 keep high/low), XdY+Z for damage. Natural 20 doubles the gross damage package; natural 1 always misses.</p>
<div class="dice-panel">
  <div class="dice-controls">
    <label>Modifier <input type="number" id="dice-mod" value="${DICE.mod}" min="-20" max="30"></label>
    <div class="dice-modes">
      ${["normal", "adv", "dis"].map(m => `<button class="btn mode ${DICE.mode === m ? "active" : ""}" data-dice-mode="${m}">${m === "normal" ? "Normal" : m === "adv" ? "Advantage" : "Disadvantage"}</button>`).join("")}
    </div>
    <button class="btn big" id="dice-roll">Roll d20</button>
  </div>
  <div class="dice-expr-row">
    <input type="text" id="dice-expr" placeholder="Damage expression, e.g. 2d3+4" value="1d4+3">
    <button class="btn" id="dice-expr-roll">Roll</button>
    ${["1d3", "1d4", "2d3", "1d6", "1d8", "2d6", "1d4+3", "2d3+4"].map(e => `<button class="btn tiny" data-dice-quick="${e}">${e}</button>`).join("")}
  </div>
  <div id="dice-log" class="dice-log"></div>
</div>
<p class="note">Damage quick-reference: unarmed 1d3+Str · one-handed 1d4+Str · two-handed 2d3+Str · bow 1d4+Body · thrown 1d4+Str · Magic Bolt 1d8. Subtract DR once, after the crit multiplier.</p>`;
}

/* ---------- router ---------- */
function pageContent(id) {
  if (id === "home") return { title: "The Triad System", section: "Welcome", body: renderHome(), raw: true };
  if (id === "classes-index") return { title: "All 21 Classes", section: "The Classes", body: renderClassesIndex(), raw: true };
  if (id === "appendix-abilities") return { title: "Ability Index", section: "Appendix", body: renderAbilityIndex(), raw: true };
  if (id === "tools-forge") return { title: "Character Forge", section: "Tools", body: renderForge(), raw: true };
  if (id === "tools-compare") return { title: "Compare Classes", section: "Tools", body: renderCompare(), raw: true };
  if (id === "tools-dice") return { title: "Dice Roller", section: "Tools", body: renderDice(), raw: true };
  if (id.startsWith("class-")) {
    const c = CLASS_BY_ID[id.slice(6)];
    if (c) return { title: c.name, section: TRIAD[c.triad].name + " · " + KIND_LABEL[c.kind], body: renderClass(c), raw: true, triad: c.triad };
  }
  if (PAGES[id]) return { ...PAGES[id], raw: true };
  return { title: "Lost in the Mists", section: "404", body: `<p class="lede">This page drifted beyond the borders. <a href="#/home">Return to the waystone</a>.</p>`, raw: true };
}

let CURRENT = "home";
function navigate() {
  let id = (location.hash || "#/home").replace(/^#\//, "") || "home";
  CURRENT = id;
  const p = pageContent(id);
  document.title = p.title + " · Ravenloft Triad Wiki";
  $("#page").innerHTML = `<div class="page-head"><span class="page-section">${p.section}</span><h1 class="page-title">${p.title}</h1></div>${p.body}`;
  $("#page").scrollTop = 0;
  window.scrollTo(0, 0);
  document.querySelectorAll("#sidebar a").forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#/" + id));
  bindPageHandlers(id);
  closeSidebar();
}

/* ---------- page event bindings ---------- */
function bindPageHandlers(id) {
  if (id === "tools-forge") {
    document.querySelectorAll("[data-forge]").forEach(el => {
      const kind = el.dataset.forge;
      if (el.tagName === "SELECT" || el.type === "range") {
        el.addEventListener("input", () => {
          if (kind === "base") { FORGE.base = el.value; FORGE.path = ""; FORGE.hybrid = ""; }
          if (kind === "path") { FORGE.path = el.value; FORGE.hybrid = ""; }
          if (kind === "hybrid") FORGE.hybrid = el.value;
          if (kind === "level") {
            FORGE.level = parseInt(el.value);
            if (FORGE.level < 2) FORGE.path = "";
            if (FORGE.level < 4) FORGE.hybrid = "";
          }
          if (kind === "background") FORGE.background = el.value;
          if (kind === "armor") FORGE.armor = el.value;
          navigate();
        });
      } else if (el.tagName === "BUTTON" && el.classList.contains("step")) {
        el.addEventListener("click", () => {
          const key = el.dataset.key, d = parseInt(el.dataset.d);
          const store = kind === "attr" ? FORGE.attrs : FORGE.skills;
          const next = store[key] + d;
          if (next < 0 || next > 8) return;
          if (rankCost(next) > PT_CAP) return;
          store[key] = next;
          navigate();
        });
      }
    });
    const copy = $("#forge-copy");
    if (copy) copy.addEventListener("click", () => {
      const c = forgeClass();
      const build = { system: "ravenloft-triad", class: c.id, lineage: lineage(c).map(k => k.id), level: FORGE.level, background: FORGE.background || null, armor: FORGE.armor, attributes: FORGE.attrs, skills: FORGE.skills, budgets: { attributes: spentAttrs() + "/" + ATTR_BUDGET, skills: spentSkills() + "/" + SKILL_BUDGET }, totals: forgeTotals(), effectiveSkills: Object.fromEntries([...SKILL_TREE.flatMap(a => a.skills), ...INDEPENDENT].map(k => [k, effSkill(k)])) };
      const txt = JSON.stringify(build, null, 2);
      const done = () => { $("#forge-copy-msg").textContent = "Copied — paste into your RPR ledger or FlowChart defs."; };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, () => fallbackCopy(txt, done));
      else fallbackCopy(txt, done);
    });
  }
  if (id === "tools-compare") {
    document.querySelectorAll("[data-compare]").forEach(el => el.addEventListener("input", () => {
      const k = el.dataset.compare;
      if (k === "level") COMPARE.level = parseInt(el.value); else COMPARE[k] = el.value;
      navigate();
    }));
  }
  if (id === "tools-dice") {
    $("#dice-mod").addEventListener("input", e => DICE.mod = parseInt(e.target.value) || 0);
    document.querySelectorAll("[data-dice-mode]").forEach(b => b.addEventListener("click", () => { DICE.mode = b.dataset.diceMode; navigate(); }));
    $("#dice-roll").addEventListener("click", rollD20);
    $("#dice-expr-roll").addEventListener("click", () => rollExpr($("#dice-expr").value));
    $("#dice-expr").addEventListener("keydown", e => { if (e.key === "Enter") rollExpr(e.target.value); });
    document.querySelectorAll("[data-dice-quick]").forEach(b => b.addEventListener("click", () => { $("#dice-expr").value = b.dataset.diceQuick; rollExpr(b.dataset.diceQuick); }));
    paintDiceResult();
  }
}
function fallbackCopy(txt, done) {
  const ta = document.createElement("textarea");
  ta.value = txt; document.body.appendChild(ta); ta.select();
  try { document.execCommand("copy"); done(); } catch (e) { $("#forge-copy-msg").textContent = "Copy blocked by sandbox — select the JSON manually."; }
  document.body.removeChild(ta);
}

/* ---------- sidebar & search ---------- */
function renderSidebar() {
  $("#sidebar-nav").innerHTML = NAV.map(g => `
    <div class="nav-group">
      <div class="nav-section" ${g.color ? `style="color:${g.color}"` : ""}>${g.section}</div>
      ${g.items.map(([id, label]) => `<a href="#/${id}" class="${id.startsWith("class-") && CLASS_BY_ID[id.slice(6)]?.kind === "hybrid" ? "nav-hybrid" : ""}">${label}</a>`).join("")}
    </div>`).join("");
}
let SEARCH_INDEX = [];
function buildSearchIndex() {
  SEARCH_INDEX = [];
  const add = (id, title, section, text) => SEARCH_INDEX.push({ id, title, section, text: (title + " " + text).toLowerCase() });
  add("home", "The Triad System", "Welcome", strip(renderHome()));
  add("classes-index", "All 21 Classes", "The Classes", strip(renderClassesIndex()));
  Object.entries(PAGES).forEach(([id, p]) => add(id, p.title, p.section, strip(p.body)));
  CLASSES.forEach(c => add("class-" + c.id, c.name, TRIAD[c.triad].name + " · " + KIND_LABEL[c.kind],
    strip(renderClass(c)) + " " + c.weapons.map(w => w.name).join(" ")));
  add("appendix-abilities", "Ability Index", "Appendix", strip(renderAbilityIndex()));
  add("tools-forge", "Character Forge", "Tools", "build calculator attributes skills budget stats");
  add("tools-compare", "Compare Classes", "Tools", "compare side by side stats");
  add("tools-dice", "Dice Roller", "Tools", "d20 roll advantage disadvantage damage");
}
function doSearch(q) {
  const box = $("#search-results");
  q = q.trim().toLowerCase();
  if (q.length < 2) { box.innerHTML = ""; box.classList.remove("open"); return; }
  const terms = q.split(/\s+/);
  const hits = SEARCH_INDEX.map(e => {
    let score = 0;
    terms.forEach(t => {
      if (e.title.toLowerCase().includes(t)) score += 10;
      const idx = e.text.indexOf(t);
      if (idx >= 0) score += 3;
    });
    return { ...e, score };
  }).filter(e => e.score > 0).sort((a, b) => b.score - a.score).slice(0, 10);
  box.innerHTML = hits.length
    ? hits.map(h => {
      const idx = h.text.indexOf(terms[0]);
      const snip = idx >= 0 ? "…" + h.text.slice(Math.max(0, idx - 30), idx + 70) + "…" : h.text.slice(0, 90) + "…";
      return `<a href="#/${h.id}" class="search-hit"><strong>${h.title}</strong><span class="dim">${h.section}</span><span class="snip">${esc(snip)}</span></a>`;
    }).join("")
    : '<div class="search-hit dim">Nothing found. The Mists keep their secrets.</div>';
  box.classList.add("open");
}
function closeSidebar() { document.body.classList.remove("nav-open"); }

/* ---------- boot ---------- */
function boot() {
  renderSidebar();
  buildSearchIndex();
  $("#search").addEventListener("input", e => doSearch(e.target.value));
  $("#search").addEventListener("focus", e => { if (e.target.value) doSearch(e.target.value); });
  document.addEventListener("click", e => {
    if (!e.target.closest(".search-wrap")) $("#search-results").classList.remove("open");
    if (e.target.closest("#sidebar a")) closeSidebar();
  });
  $("#nav-toggle").addEventListener("click", () => document.body.classList.toggle("nav-open"));
  window.addEventListener("hashchange", navigate);
  navigate();
}
document.addEventListener("DOMContentLoaded", boot);
