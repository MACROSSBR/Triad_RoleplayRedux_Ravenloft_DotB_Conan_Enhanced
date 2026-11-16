/* ============================================================
   RAVENLOFT — THE TRIAD SYSTEM · RULES & SETTING CONTENT
   Source-of-truth alignment: Sistema_de_Combate_Regras.md,
   Ravenloft RPR Project Plan.md, Plano de Orquestração.
   ============================================================ */

const SKILL_TREE = [
  { attr: "Body", color: "#c0392f", desc: "Raw physical power and presence. Feeds force, menace and the body's brutal arts.",
    skills: ["Strength", "Intimidation", "Forgery", "Breach", "Grapple"] },
  { attr: "Agility", color: "#d9a441", desc: "Precision, speed and evasion. Feeds movement, finesse and escape.",
    skills: ["Athletics", "Sleight of Hand", "Stealth", "Lockpicking", "Escape Artist"] },
  { attr: "Fortitude", color: "#8b7bd8", desc: "Endurance of body and mind — the old 'Mind' attribute, renamed. Feeds resolve, lore and craft.",
    skills: ["Deciphering", "Willpower", "Alchemy", "Eavesdropping", "Binding"] },
  { attr: "Charisma", color: "#5ba88a", desc: "Force of personality. Feeds interaction, care and awareness of others.",
    skills: ["Negotiation", "Sense Motive", "Healing", "First Aid", "Disguise", "Perception"] }
];
const INDEPENDENT = ["Accuracy", "Initiative"];

const COST_LADDER = [
  { rank: "+1", cost: 1, total: 1 }, { rank: "+2", cost: 1, total: 2 },
  { rank: "+3", cost: 2, total: 4 }, { rank: "+4", cost: 2, total: 6 },
  { rank: "+5", cost: 3, total: 9 }, { rank: "+6", cost: 3, total: 12 },
  { rank: "+7", cost: 4, total: 16 }, { rank: "+8", cost: 4, total: 20 }
];

const HORROR_TRACKS = [
  {
    id: "fear", name: "Fear", axis: "Acute · the moment", dir: "rises", start: 0, max: 100, color: "#d9a441",
    triad: "The Land's horror — what the moment does to you.",
    thresholds: [
      { at: "≥ 30", name: "Shaken", effect: "−1 Accuracy." },
      { at: "≥ 60", name: "Frightened", effect: "−2 Accuracy, −2 Dodge Defense. Approaching the source of your fear requires Willpower DC 13." },
      { at: "≥ 90", name: "Broken", effect: "You must flee the source or cower (turn lost) unless you pass Willpower DC 15 at turn start. At 100, you collapse if neither is possible." }
    ],
    gains: "Witnessing a horror +10 · facing a Darklord-touched creature +20 · class abilities as listed. Willpower DC 13 halves any witnessed gain.",
    recovery: "Rest in combat −10 · Steady Yourself (1 SP, Willpower DC 13) −10 · safe scene −20 · safe night's rest −40 · Medium & Guardian support."
  },
  {
    id: "sanity", name: "Sanity", axis: "Psychic · the knowledge", dir: "falls", start: 100, max: 100, color: "#8b7bd8",
    triad: "The Veil's horror — what knowing does to you.",
    thresholds: [
      { at: "≤ 70", name: "Frayed", effect: "−1 to Deciphering, Willpower and ritual rolls." },
      { at: "≤ 40", name: "Haunted", effect: "−2 to those rolls. On a natural 1, a hallucination intrudes (roleplay with the GM)." },
      { at: "≤ 10", name: "Shattered", effect: "Madness episodes at GM discretion. At 0, the character is lost — they become an NPC horror." }
    ],
    gains: "Forbidden lore −5 · minor ritual −3 · major ritual −5 · witnessing the impossible −10 · Rite of Crossing into the Veil −10 · class abilities as listed.",
    recovery: "+5 per story arc spent in safety · Rite of Clarity +10 (rare, costly, requires a true anchor — a person, a place, a vow). Never above 100."
  },
  {
    id: "corruption", name: "Corruption", axis: "Moral · the choice", dir: "rises", start: 0, max: 100, color: "#c0392f",
    triad: "The Blood's horror — what choosing does to you.",
    thresholds: [
      { at: "≥ 30", name: "Marked", effect: "A visible stigma (eyes, shadow, scent). −2 to Charisma skills except Intimidation." },
      { at: "≥ 60", name: "Tainted", effect: "Healing you receive is halved. Animals flee you. First meetings gain +5 Fear in the other party." },
      { at: "≥ 90", name: "Forsaken", effect: "The Mists take notice — Darklord attention. Dark Gifts whisper. At 100, you are claimed: become a horror (retire, or a GM Dark Gift scene)." }
    ],
    gains: "Shifting +1 · blood magic +1/+2 · atrocities +5–15 · a Dark Gift +10 · Rite of Crossing into the Blood +10 · class abilities as listed.",
    recovery: "Rite of Absolution −10 (rare, costly, requires genuine atonement — a deed, not a prayer). Never below 0."
  }
];

const DARK_GIFTS = [
  { name: "The Second Heart", triad: "blood", gift: "+20 maximum HP.", price: "+10 Corruption. Your heartbeat is audible to predators within 10 tiles — and to things that collect hearts." },
  { name: "The Unblinking Eye", triad: "veil", gift: "See through darkness, fog and illusions.", price: "−10 maximum Sanity. Something sees back, and it is patient." },
  { name: "The Grave's Patience", triad: "land", gift: "You no longer need sleep, and natural sources of Fear cannot touch you.", price: "+10 Corruption. The land claims your shadow; it is sometimes seen elsewhere, doing things." }
];

const BACKGROUNDS = [
  { name: "Village Laborer", grants: "+1 Strength, +1 Grapple", note: "A contact among the working folk of one village." },
  { name: "Hunter", grants: "+1 Stealth, +1 Perception", note: "A contact among trappers; a worn map of one forest." },
  { name: "Soldier", grants: "+1 Intimidation, +1 First Aid", note: "A contact in a watch or garrison; an old service token." },
  { name: "Scholar", grants: "+1 Deciphering, +1 Alchemy", note: "A contact in a library or scriptorium; one forbidden footnote." },
  { name: "Investigator", grants: "+1 Sense Motive, +1 Lockpicking", note: "A contact among constables or informants; a case you never closed." }
];

const WEAPON_RULES = [
  { attack: "Unarmed", gross: "1d3 + Strength", cost: "1 AP · 1 Stamina", range: "1.5 tiles" },
  { attack: "Melee, one-handed", gross: "1d4 + Strength", cost: "1 AP · 1 Stamina", range: "1.5 tiles" },
  { attack: "Melee, two-handed", gross: "2d3 + Strength", cost: "1 AP · 1 Stamina", range: "1.5 tiles" },
  { attack: "Bow", gross: "1d4 + Body", cost: "1 AP · 1 Stamina", range: "10 tiles" },
  { attack: "Thrown weapon", gross: "1d4 + Strength", cost: "1 AP · 1 Stamina", range: "10 tiles" },
  { attack: "Slap", gross: "1 (fixed)", cost: "1 AP", range: "1.5 tiles" },
  { attack: "Magic Bolt", gross: "1d8 (no bonus)", cost: "1 AP · 4 Mana (Occultist & Veil-crossed: 3)", range: "10 tiles" }
];

const WEAPON_TAGS = [
  { tag: "Silver", effect: "+1d4 damage vs lycanthropes." },
  { tag: "Blessed", effect: "+1d4 damage vs undead and spirits." },
  { tag: "Cold Iron", effect: "+1d4 damage vs spirits and fey." },
  { tag: "Natural", effect: "Counts as one-handed; cannot be disarmed." },
  { tag: "Ritual Focus", effect: "Required for some rites; channels Mana abilities." },
  { tag: "Throwable", effect: "May be thrown using the thrown profile (1d4 + Strength)." },
  { tag: "Reach", effect: "+0.5 tile melee reach." },
  { tag: "Shield", effect: "+1 AC while wielded." }
];

const ARMOR_RULES = [
  { armor: "Cloth", ac: "+0", dr: "+0", penalty: "—" },
  { armor: "Light", ac: "+1", dr: "+0", penalty: "—" },
  { armor: "Medium", ac: "+2", dr: "+1", penalty: "−1 Stealth" },
  { armor: "Heavy", ac: "+3", dr: "+2", penalty: "−2 Stealth" }
];

const DEFENSE_RULES = [
  { cat: "Melee", def: "Higher of Dodge Defense and Armor Class" },
  { cat: "Ranged (physical)", def: "Higher of Spell Defense and Armor Class" },
  { cat: "Offensive magic", def: "Higher of Spell Defense and Dodge Defense" }
];

const COMBAT_PIPELINE = [
  "Confirm it is the attacker's active turn.",
  "Check Action Points, resources, range and cooldown.",
  "Select another character as the target.",
  "Pay the execution costs.",
  "Roll to hit: 1d20 + Accuracy vs the category defense.",
  "On a miss, no damage is applied (costs are still spent).",
  "On a hit, roll the damage: die + damage bonus.",
  "Apply the critical multiplier if the hit was a natural 20.",
  "Subtract Damage Reduction once.",
  "Clamp final damage to a minimum of 0 and reduce HP.",
  "Check whether the target reached 0 HP (Unconscious).",
  "Report attacker, target, Accuracy, both defenses considered, the check, hit/crit/miss, die + bonus + multiplier + DR, effective damage, and HP before/after."
];

const GLOSSARY = [
  ["AP — Action Point", "2 per turn. Common actions (attacks, most abilities) cost 1 AP."],
  ["SP — Special Action", "1 per combat, separate pool. Signature Abilities cost 1 SP (once per combat)."],
  ["Mov — Movement Point", "1 per turn. One movement opportunity (5 tiles) costs 1 Mov + 1 Stamina."],
  ["AC — Armor Class", "Fixed defense. Base 10 + class + armor. Does not scale with attributes in this system."],
  ["DR — Damage Reduction", "Subtracted once from gross damage after a hit. Base 1 + class + armor."],
  ["Dodge Defense", "Agility + ⌊Fortitude/2⌋ + ⌊Body/3⌋ + class bonuses. Attribute-driven."],
  ["Spell Defense", "Fortitude + ⌊Body/2⌋ + ⌊Agility/3⌋ + class bonuses. Attribute-driven."],
  ["Accuracy", "Independent attack bonus. Base +1; +1 at levels 4 and 8. No attribute parent."],
  ["Initiative", "Independent. 1d20 + Initiative; order is fixed for the whole combat."],
  ["Round vs Turn", "A turn is one combatant's activation. A round completes when everyone in the initiative list has taken a turn."],
  ["Cooldown (personal turns)", "Counted in the owner's turns, not minutes. CD 2 used on turn 1 → available turn 3."],
  ["Shift", "A Skinwalker's transformation. 1 AP + 5 Stamina; +1 Corruption unless waived."],
  ["Burden", "The Wanderer's instability counter, 0–10. Surges at 3/5/7. Resets on a safe night's rest."],
  ["Waystone", "A Landsworn's bound anchor: hearthstone, gravestone or milestone."],
  ["The Turning", "The sanctioned crossing between triad members that produces hybrids."],
  ["Dark Gift", "A bargain with the Dark Powers: real power, +10 Corruption, a narrative debt."],
  ["The Mists", "The architecture of the Domains of Dread. Walls, roads, and sometimes a predator."],
];

/* ============================ PAGE CONTENT ============================ */

const PAGES = {};

PAGES["lore-cosmology"] = {
  title: "The Veil, the Blood & the Land", section: "The Setting",
  body: `
<p class="lede">Every horror in the Domains of Dread is a wound in one of three things: <em>what is known</em>, <em>what is lived</em>, or <em>what is owned</em>. The Triad doctrine names them the Veil, the Blood and the Land — and every class, every curse, and every Dark Gift belongs to one of the three.</p>
<h2>The Domains of Dread</h2>
<p>Ravenloft is not a place but a prison of places. Domains drift in the Mists like moored ships — Barovia with its castle and its Count, and a hundred other parishes of grief. Each domain is shaped by its Darklord: a soul whose crime was great enough that the Dark Powers built a world around it, a world that repeats the crime forever. The Mists are the walls. They take the lost, they move the borders, and they do not answer to anyone who merely lives here.</p>
<p>Player characters begin as ordinary people — laborers, hunters, scholars, investigators — who have noticed the pattern. The Triad is what they noticed.</p>
<h2>The Three Wounds</h2>
<div class="triad-cards">
  <div class="triad-card" style="--tc:#8b7bd8"><h3>The Veil</h3><p class="axis">Occultism · what is known</p><p>The membrane between the living world and what waits behind it. Rites, pacts, forbidden books. The Veil's workers pay in <strong>Sanity</strong>: knowledge is a debt, and the Dark Powers hold the note.</p></div>
  <div class="triad-card" style="--tc:#c0392f"><h3>The Blood</h3><p class="axis">Shapeshifters · what is lived</p><p>The cursed bloodlines and borrowed shapes. The Blood remembers every form it takes, and every form takes a piece of the taker. Its workers pay in <strong>Corruption</strong>: the Beast keeps the ledger.</p></div>
  <div class="triad-card" style="--tc:#8a9a5b"><h3>The Land</h3><p class="axis">Terrain · what is owned</p><p>Soil, stone, road and mist. The domains belong to the Darklords — the Landsworn dispute that claim, one hearth, one grave, one border at a time. They master <strong>Fear</strong>, because someone must stand in the doorway.</p></div>
</div>
<h2>The Three Horrors</h2>
<p>The Triad's price is paid on three tracks, each 0–100: <strong>Fear</strong> (acute — what the moment does to you), <strong>Sanity</strong> (psychic — what knowing does to you), and <strong>Corruption</strong> (moral — what choosing does to you). A Landsworn stares down Fear; an Occultist spends Sanity; a Skinwalker accrues Corruption. Hybrids pay on two tracks at once. See <a href="#/rules-horror">The Three Horrors</a> for thresholds and recovery.</p>
<h2>The Turning</h2>
<p>No triad member is pure. The orders have known for centuries that the three wounds touch — and that a person can stand in the seam between two. The sanctioned crossing is called <strong>the Turning</strong>, and it produces the nine hybrid classes.</p>
<p>The <em>Greater Turning</em> runs one way around the triad, twice each: <strong>the Veil claims the Land</strong> (Sanctifier, Gravebound — consecration and burial), <strong>the Land claims the Blood</strong> (Bearwarden, Mistshroud — the hearth-beast and the worn mist), <strong>the Blood claims the Veil</strong> (Moonbinder, Doomwing — the leashed moon and the crooked omen). The <em>Lesser Turning</em> runs the other way, once each: Chimerist (Veil→Blood), Landwight (Blood→Land), Hexhunter (Land→Veil).</p>
<p>Every crossing costs. Every crossing is witnessed. The orders disagree about who is doing the witnessing — which is why the Rite of Crossing requires a story, a price, and an administrator's seal. See <a href="#/rules-progression">Progression & the Rite of Crossing</a>.</p>
<blockquote class="lore-quote">"The Count owns the castle. The soil owns the Count. And behind the soil, patient as interest, something owns the soil."<cite>— Warden Petru, at the binding of the Ninth Waystone</cite></blockquote>
`};

PAGES["lore-orders"] = {
  title: "The Three Orders", section: "The Setting",
  body: `
<p class="lede">Three fellowships keep the Triad doctrine alive in the Domains of Dread. They are not armies. They are networks of the desperate, the learned, and the cursed — and they disagree about almost everything except the price.</p>
<h2 style="color:#8b7bd8">The Pallid Lantern — keepers of the Veil</h2>
<p>An occult society of hedge-mages, defrocked priests and disgraced scholars. Each initiate carries a lantern lit from a deathbed candle; its pale flame reveals what pretends to be ordinary. The Lantern's Inquisitors prosecute the wearing-skins, its Scholars copy what the Inquisitors would burn, and its Mediums listen at the Veil so the dead can finish their sentences.</p>
<p><strong>Seat:</strong> a shuttered scriptorium above a Vallaki chandler's shop. <strong>Sign:</strong> a lantern with no flame drawn in chalk. <strong>Dread:</strong> the correspondence — the second handwriting that appears in the eldest Scholars' margins.</p>
<h2 style="color:#c0392f">The Red Kin — keepers of the Blood</h2>
<p>The cursed bloodlines: wolf packs of the Balinok forests, murder-flights above the gallows fields, and the unbound Errant Kin who belong to no shape at all. They do not call it a curse — a curse is done to you; the Blood is what you are. The Kin hunts the monsters that give monstrosity a bad name, because no one else will do it fairly.</p>
<p><strong>Seat:</strong> wherever the pack den is; the Kin's parliament is a howl answered. <strong>Sign:</strong> three parallel scratches, healed silver-white. <strong>Dread:</strong> the Red Moon's ledger — every Shift is a withdrawal, and no one has seen the balance.</p>
<h2 style="color:#8a9a5b">The Black Soil Wardens — keepers of the Land</h2>
<p>Hunters, hearth-keepers, road-walkers and grave-tenders sworn to the land beneath the Darklords' claim. Each binds a waystone — hearthstone, gravestone, milestone — and the binding is mutual: the Warden keeps the parish, and the parish keeps the Warden. They fight the way the land fights: slowly, patiently, with roots and frost and the memory of every body buried in it.</p>
<p><strong>Seat:</strong> the Ninth Waystone, a crossroads milestone no map agrees on. <strong>Sign:</strong> a knot of rowan tied around a stone. <strong>Dread:</strong> the Grey Road — the only road the Darklords do not fully own, and the thing that owns the rest of it.</p>
<h2>Relations</h2>
<p>The Lantern fears the Kin and needs them; the Kin resents the Lantern and saves them; the Wardens bury both, respectfully, and keep the lists. The Turning — the sanctioned crossing between orders — is the only treaty all three sign, and each order believes the other two are the ones being infiltrated.</p>
<blockquote class="lore-quote">"Three orders, one price. The Lantern pays in mind, the Kin in soul, the Wardens in sleep. None of us has ever paid in coin."<cite>— overheard at the Ninth Waystone</cite></blockquote>
`};

PAGES["rules-attributes"] = {
  title: "Attributes & Skills", section: "The Rules",
  body: `
<p class="lede">Four attributes, nineteen skills, two independent combat stats. Attributes feed skills and rolls — <strong>not</strong> resources. HP, Mana, Stamina, AC and DR are fixed bases modified only by class, progression and equipment.</p>
<h2>The Four Attributes</h2>
${SKILL_TREE.map(a => `
<div class="attr-block" style="--ac:${a.color}">
  <h3>${a.attr}</h3><p>${a.desc}</p>
  <div class="skill-chips">${a.skills.map(s => `<span class="chip">${s}</span>`).join("")}</div>
</div>`).join("")}
<div class="attr-block" style="--ac:#9aa5b1">
  <h3>Independent</h3><p>No attribute parent. Trained within the skill budget.</p>
  <div class="skill-chips">${INDEPENDENT.map(s => `<span class="chip">${s}</span>`).join("")}</div>
</div>
<h2>How rolls work</h2>
<ul>
<li><strong>Skill check:</strong> 1d20 + effective skill, where <em>effective skill = purchased rank + parent attribute</em>. Accuracy and Initiative use their purchased value alone.</li>
<li><strong>Difficulty Classes:</strong> 8 (easy) · 10 (routine) · 13 (hard) · 15 (very hard) · 18 (extreme) · 20 (near-impossible).</li>
<li><strong>Situational modifiers:</strong> ±1, exceptionally ±2. Stacked bonuses cap at +2. Advantage/disadvantage = 2d20 keep high/low; they do not stack.</li>
<li><strong>Natural 20:</strong> critical success (a minor extra benefit). <strong>Natural 1:</strong> critical failure (a complication, if risk exists).</li>
<li><strong>Opposed checks:</strong> higher total wins; ties favor the defender/reactor.</li>
</ul>
<h2>Point budgets at creation</h2>
<table class="rules-table"><tr><th>Budget</th><th>Points</th><th>Notes</th></tr>
<tr><td>Attributes</td><td>15</td><td>Minimum 0 per attribute; cap 10 points spent per attribute.</td></tr>
<tr><td>Skills</td><td>35</td><td>Minimum 0; cap 10 points spent per skill (includes Accuracy & Initiative).</td></tr>
<tr><td>Class / ancestry / background grants</td><td>—</td><td>Added separately; never consume the discretionary budgets.</td></tr></table>
<h2>Cost ladder (per attribute or skill)</h2>
<table class="rules-table"><tr><th>Rank bought</th><th>Cost of that point</th><th>Total spent</th></tr>
${COST_LADDER.map(r => `<tr><td>${r.rank}</td><td>${r.cost}</td><td>${r.total}</td></tr>`).join("")}</table>
<p class="note">The cap counts <em>points spent</em>, not ranks: with 10 points the highest purchasable rank is <strong>+5</strong> (9 points); the 10th point cannot buy +6 (cost 3). The +8 row exists only for earned progression beyond the creation cap.</p>
<h2>Design note — why attributes don't scale resources</h2>
<p>This system deliberately departs from the Combat Core draft formulas (<code>HP = 50 + 5·Body…</code>). The approved chassis is flat — HP 100, Mana 50, Stamina 75, AC 10, DR 1 — and class identity, not attribute arithmetic, decides survivability. The two evasion defenses (<strong>Dodge Defense</strong>, <strong>Spell Defense</strong>) remain attribute-driven, exactly as in the Combat Core document, because they are roll targets, not resources.</p>
`};

PAGES["rules-creation"] = {
  title: "Character Creation", section: "The Rules",
  body: `
<p class="lede">Creation is sequential and dependency-ordered: identity → ancestry → class → background → optional choices → budgets → allocation → review → save. Fixed grants apply automatically; the player only spends what is genuinely discretionary.</p>
<h2>The Sequence</h2>
<ol class="steps">
<li><strong>Identity.</strong> Name and concept. No mechanics yet.</li>
<li><strong>Ancestry.</strong> Human is the prototype baseline (no modifiers). Other ancestries are GM-gated. A "Touched" bloodline (narrative only) is the usual doorway into Skinwalker lore.</li>
<li><strong>Base class.</strong> Occultist, Skinwalker or Landsworn. Apply the trait, Initiate ability, proficiencies and stat deltas automatically.</li>
<li><strong>Background.</strong> One of the five below. Fixed grants; overlap with class grants follows the stacking rule (highest wins, no double-dip).</li>
<li><strong>Optional choices.</strong> Only genuine decisions: home terrain (Landsworn & Land-crossed), favored prey (Hunter), one permitted piece of equipment.</li>
<li><strong>Budgets.</strong> 15 attribute points, 35 skill points — calculated <em>after</em> all fixed grants.</li>
<li><strong>Allocation.</strong> Cost ladder enforced; caps enforced; overspend rejected.</li>
<li><strong>Review & save.</strong> Summary of every grant's origin (ancestry / class / background / optional / discretionary). Changing an earlier choice rebuilds the sheet — no residual bonuses.</li>
</ol>
<h2>Backgrounds (provisional)</h2>
<table class="rules-table"><tr><th>Background</th><th>Fixed grants</th><th>Narrative benefit</th></tr>
${BACKGROUNDS.map(b => `<tr><td>${b.name}</td><td>${b.grants}</td><td>${b.note}</td></tr>`).join("")}</table>
<h2>The Universal Chassis</h2>
<table class="rules-table"><tr><th>Stat</th><th>Base</th><th>Modified by</th></tr>
<tr><td>HP</td><td>100</td><td>Class + progression + hybrid + level + Dark Gifts</td></tr>
<tr><td>Mana</td><td>50</td><td>Class + progression + hybrid + level</td></tr>
<tr><td>Stamina</td><td>75</td><td>Class + progression + hybrid + level</td></tr>
<tr><td>Armor Class</td><td>10</td><td>Class + armor</td></tr>
<tr><td>Damage Reduction</td><td>1</td><td>Class + armor</td></tr>
<tr><td>Accuracy</td><td>+1</td><td>Levels 4 & 8 (+1 each)</td></tr>
<tr><td>Action Points</td><td>2 / turn</td><td>—</td></tr>
<tr><td>Movement Points</td><td>1 / turn</td><td>Class abilities (e.g., Moon-Fury)</td></tr>
<tr><td>Special Actions</td><td>1 / combat</td><td>Signature Ability</td></tr>
<tr><td>Fear</td><td>0 / 100</td><td>Events, abilities, recovery</td></tr>
<tr><td>Sanity</td><td>100 / 100</td><td>Rites, knowledge, recovery</td></tr>
<tr><td>Corruption</td><td>0 / 100</td><td>Shifts, gifts, choices, atonement</td></tr></table>
<p class="note">Resources display as current/max (e.g. <code>80/80</code>). Players may edit visible values; turn counters, cooldowns and internal ledgers are protected. There is no automatic regeneration of HP, Mana or Stamina at turn start.</p>
<h2>Worked example — Inquisitor of the Lantern</h2>
<p>Human (no mods) → <strong>Occultist</strong> (HP 100, Mana 80, Stamina 60, AC 10, DR 1) → background <strong>Scholar</strong> (+1 Deciphering, +1 Alchemy) → <strong>15 attribute points:</strong> Body 2 (cost 2), Agility 2 (2), Fortitude 5 (9), Charisma 2 (2) = 15 exactly. → <strong>35 skill points:</strong> Willpower +4 (6), Intimidation +3 (4), Binding +3 (4), Deciphering +3 (4), Perception +3 (4), Accuracy +3 (4), Initiative +2 (2), First Aid +2 (2), Stealth +2 (2), Alchemy +1 (1), Sense Motive +1 (1), Eavesdropping +1 (1) = 35 exactly.</p>
<p>Final sheet: effective Willpower 9, Binding 8, Deciphering 9 (8 + background), Accuracy +4 (base +1, bought +3), Dodge Defense 4, Spell Defense 6. At level 2 the Inquisitor path adds +10 HP and +10 Mana automatically — no points spent.</p>
<p class="note">The <a href="#/tools-forge">Character Forge</a> enforces all of this automatically — budgets, ladder, caps and class deltas — so no player ever does this arithmetic by hand.</p>
`};

PAGES["rules-combat"] = {
  title: "Combat", section: "The Rules",
  body: `
<p class="lede">Player-resolved combat: one d20 attack roll against fixed defenses, damage rolled only after a hit, DR subtracted once, cooldowns counted in personal turns. No GM is required to adjudicate hits, damage or costs.</p>
<h2>The Turn</h2>
<table class="rules-table"><tr><th>Pool</th><th>Per turn</th><th>Spent on</th></tr>
<tr><td>Action Points</td><td>2</td><td>Common actions: attacks, most abilities (1 AP each)</td></tr>
<tr><td>Movement Points</td><td>1</td><td>One movement opportunity: 5 tiles + 1 Stamina</td></tr>
<tr><td>Special Actions</td><td>1 per combat</td><td>Signature Ability (1 SP + resources)</td></tr></table>
<p>Common and special pools are separate: a turn can hold two common actions and one movement; the Special Action is a once-per-combat Signature pool. The first personal turn is 1. Re-opening an already-active turn never refreshes pools.</p>
<h2>Rounds & Initiative</h2>
<p>Initiative: 1d20 + Initiative, rolled once; the order is fixed for the whole combat. A <strong>round</strong> completes when the last combatant in the list ends their turn and the first begins again. Joining mid-round adds you to the list; you are counted from the next round. Cooldowns count <em>personal turns</em>, never rounds or minutes.</p>
<h2>The Three Defenses</h2>
<table class="rules-table"><tr><th>Defense</th><th>Formula</th></tr>
<tr><td>Armor Class</td><td>10 + class bonuses + armor (fixed; no attribute scaling)</td></tr>
<tr><td>Dodge Defense</td><td>Agility + ⌊Fortitude/2⌋ + ⌊Body/3⌋ + class bonuses</td></tr>
<tr><td>Spell Defense</td><td>Fortitude + ⌊Body/2⌋ + ⌊Agility/3⌋ + class bonuses</td></tr></table>
<p>Each fractional contribution floors separately — only complete blocks grant points. The defender never rolls a second die.</p>
<h2>What the attack compares against</h2>
<p><code>Attack = 1d20 + Accuracy</code>. The attacker never chooses the lower defense; ties favor the defender; outside critical exceptions the attack must <em>exceed</em> the defense.</p>
<table class="rules-table"><tr><th>Category</th><th>Defense used</th></tr>
${DEFENSE_RULES.map(d => `<tr><td>${d.cat}</td><td>${d.def}</td></tr>`).join("")}</table>
<h2>Damage</h2>
<table class="rules-table"><tr><th>Attack</th><th>Gross damage</th><th>Cost</th><th>Range</th></tr>
${WEAPON_RULES.map(w => `<tr><td>${w.attack}</td><td><code>${w.gross}</code></td><td>${w.cost}</td><td>${w.range}</td></tr>`).join("")}</table>
<ul>
<li><strong>Normal hit:</strong> <code>final = max(0, gross − DR)</code>.</li>
<li><strong>Critical (natural 20):</strong> <code>final = max(0, 2 × gross − DR)</code> — the whole damage package doubles, including its bonus; DR is subtracted once, after.</li>
<li><strong>Natural 1:</strong> automatic miss. Critical-failure punishments are deferred to the buff/debuff phase.</li>
<li>DR above damage never heals. The report distinguishes gross damage from effective HP loss. One damage roll feeds both the HP deduction and the chat text.</li>
</ul>
<h2>The Offensive Sequence</h2>
<ol class="steps">${COMBAT_PIPELINE.map(s => `<li>${s}</li>`).join("")}</ol>
<p class="note">A blocked attempt (insufficient resources, out of range, on cooldown) consumes nothing. An executed attack that misses consumes its costs normally. No ammunition is tracked. There is no line-of-sight check — participant common sense governs.</p>
<h2>Rest (during combat)</h2>
<p>Rest replaces the entire turn. Requirements: your turn, conscious, no common/special/movement action used yet. Effects: <strong>+16 Mana, +16 Stamina</strong> (⌊50/3⌋), capped at effective maxima; no HP recovery; all pools exhausted; no second Rest that turn; end the turn manually. <strong>Triad addition:</strong> Rest also reduces Fear by 10.</p>
<h2>Cooldowns</h2>
<table class="rules-table"><tr><th>Cooldown</th><th>Used on turn 1</th><th>Next use</th></tr>
<tr><td>2</td><td>Turn 1</td><td>Turn 3</td></tr><tr><td>3</td><td>Turn 1</td><td>Turn 4</td></tr><tr><td>4</td><td>Turn 1</td><td>Turn 5</td></tr></table>
<p class="note">RPR limitation (documented): the <code>SpellDef</code> cooldown field is real-time, not turns. Personal-turn cooldowns require a script-side counter. Basic attacks have no cooldown; Magic Bolt costs Mana only.</p>
<h2>Defeat</h2>
<p>0 HP grants <strong>Unconscious</strong>: no attacks, movement or Rest. 0 HP is not automatic permanent death — the Resolution phase (injuries of the defeated, progression of the victor) is a later module. Fear 100 can also end a fight without a single wound.</p>
`};

PAGES["rules-horror"] = {
  title: "The Three Horrors", section: "The Rules",
  body: `
<p class="lede">Fear, Sanity and Corruption — three tracks, each 0–100, each with three thresholds. Fear is the moment; Sanity is the knowledge; Corruption is the choice. Horror changes decisions, not just numbers.</p>
${HORROR_TRACKS.map(t => `
<div class="track-block" style="--tc:${t.color}">
  <h2>${t.name} <span class="track-axis">${t.axis}</span></h2>
  <p class="track-triad">${t.triad} Starts at <strong>${t.start}</strong>, ${t.dir} toward ${t.dir === "rises" ? "100" : "0"}.</p>
  <table class="rules-table"><tr><th>Threshold</th><th>State</th><th>Effect</th></tr>
  ${t.thresholds.map(th => `<tr><td>${th.at}</td><td><strong>${th.name}</strong></td><td>${th.effect}</td></tr>`).join("")}</table>
  <p><strong>Gains:</strong> ${t.gains}</p>
  <p><strong>Recovery:</strong> ${t.recovery}</p>
</div>`).join("")}
<h2>Steady Yourself</h2>
<p>Any character may spend their once-per-combat Special Action to steady: Willpower DC 13, success reduces Fear by 10. Allies can help — a Medium's Séance Whisper, a Guardian's Anchor, a Hunter's completed Long Hunt.</p>
<h2>Dark Gifts</h2>
<p>The Dark Powers bargain. A Dark Gift is real power with a real price: always <strong>+10 Corruption</strong>, always a narrative debt, always GM-approved. Three canonical examples:</p>
<table class="rules-table"><tr><th>Gift</th><th>Triad</th><th>Power</th><th>Price</th></tr>
${DARK_GIFTS.map(g => `<tr><td><strong>${g.name}</strong></td><td>${TRIAD[g.triad].name}</td><td>${g.gift}</td><td>${g.price}</td></tr>`).join("")}</table>
<h2>Design principles</h2>
<ul>
<li><strong>Agency first:</strong> thresholds penalize and complicate; they rarely remove control outright, and never without a roll or a choice.</li>
<li><strong>Triad symmetry:</strong> each base class masters one track and risks another; hybrids live on two tracks at once.</li>
<li><strong>Recovery is narrative:</strong> safety, anchors, atonement and completed hunts — not waiting out a timer.</li>
<li><strong>The Mists are watching:</strong> Corruption ≥ 90 and Sanity ≤ 10 draw Darklord attention (a later-module hook, per the orchestration plan).</li>
</ul>
`};

PAGES["rules-progression"] = {
  title: "Progression & the Rite of Crossing", section: "The Rules",
  body: `
<p class="lede">Levels 1–10, earned by milestones — never by grinding. Each class track (base, progression, hybrid) has three ranks: <strong>Initiate → Adept → Master</strong>. The Turning is optional, costly, and witnessed.</p>
<h2>The Ladder</h2>
<table class="rules-table"><tr><th>Level</th><th>Grant</th></tr>
${LEVEL_LADDER.map(l => `<tr><td>${l.level}</td><td>${l.grant}</td></tr>`).join("")}</table>
<p class="note">"Primary resource" = Mana for the Veil, Stamina for the Blood and the Land. Hybrids keep their base class's primary. Earned discretionary points: +2 skill points per level, +1 attribute point every even level. Milestone awards are idempotent — one grant per source per scene/day, ledgered.</p>
<h2>Choosing a Progression (level 2)</h2>
<p>Each base class offers three paths. The choice is narrative as well as mechanical: an Occultist becomes Inquisitor, Scholar or Medium; a Skinwalker becomes Wolfbound, Ravenkin or Wanderer; a Landsworn becomes Hunter, Guardian or Mistwalker. Path traits and abilities stack on top of the base class — nothing is replaced.</p>
<h2>The Rite of Crossing (level 4+)</h2>
<p>A hybrid is a progression fused with a <em>different</em> triad member. Requirements:</p>
<ul>
<li>Level 4+ and your path's <strong>Adept</strong> ability unlocked.</li>
<li>Partner's key skill at <strong>+3 or better</strong> — Veil: Deciphering or Willpower · Blood: Athletics or Stealth · Land: Perception or Willpower.</li>
<li>A <strong>narrative crossing event</strong> (a vigil, a bite, a burial, a séance — played out, not declared).</li>
<li><strong>GM/administrator approval</strong> and a ledger entry. One crossing per character, ever.</li>
</ul>
<p>The crossing grants the partner base's <strong>trait</strong> plus the hybrid track (Initiate at the crossing, Adept at 7, Master at 9). The price is paid immediately:</p>
<table class="rules-table"><tr><th>Crossing into…</th><th>Price</th><th>Why</th></tr>
${Object.entries(CROSSING_COSTS).map(([k, v]) => `<tr><td>${TRIAD[k].name}</td><td><strong>${v.delta}</strong></td><td>${v.text}</td></tr>`).join("")}</table>
<h2>The Nine Crossings</h2>
<table class="rules-table"><tr><th>Progression</th><th>×</th><th>Partner</th><th>Hybrid</th><th>Turning</th></tr>
${HYBRIDS.map(h => {
  const p = CLASS_BY_ID[h.parent];
  const greater = (p.triad === "veil" && h.partner === "land") || (p.triad === "land" && h.partner === "blood") || (p.triad === "blood" && h.partner === "veil");
  return `<tr><td><a href="#/class-${p.id}">${p.name}</a></td><td>×</td><td>${TRIAD[h.partner].name}</td><td><a href="#/class-${h.id}">${h.name}</a></td><td>${greater ? "Greater" : "Lesser"}</td></tr>`;
}).join("")}</table>
<h2>Anti-abuse rails (per project plan)</h2>
<ul>
<li>No farm/grind: points come from milestones, once per source per scene/day.</li>
<li>Stacked situational bonuses cap at +2; conditions do not stack by default (refresh or escalate).</li>
<li>Every grant has one origin; changing a choice rebuilds the sheet (idempotency guard).</li>
<li>Retrain: once per major milestone, GM-approved, ledgered.</li>
</ul>
`};

PAGES["appendix-weapons"] = {
  title: "Weapons & Armor", section: "Appendix",
  body: `
<p class="lede">Damage profiles follow the Combat Core document exactly. Gothic tags (silver, blessed, cold iron) add small, capped bonuses against the right horror — preparation beats power.</p>
<h2>Attack profiles</h2>
<table class="rules-table"><tr><th>Attack</th><th>Gross damage</th><th>Cost</th><th>Range</th></tr>
${WEAPON_RULES.map(w => `<tr><td>${w.attack}</td><td><code>${w.gross}</code></td><td>${w.cost}</td><td>${w.range}</td></tr>`).join("")}</table>
<h2>Weapon tags</h2>
<table class="rules-table"><tr><th>Tag</th><th>Effect</th></tr>
${WEAPON_TAGS.map(t => `<tr><td><strong>${t.tag}</strong></td><td>${t.effect}</td></tr>`).join("")}</table>
<h2>Armor</h2>
<table class="rules-table"><tr><th>Armor</th><th>AC</th><th>DR</th><th>Penalty</th></tr>
${ARMOR_RULES.map(a => `<tr><td>${a.armor}</td><td>${a.ac}</td><td>${a.dr}</td><td>${a.penalty}</td></tr>`).join("")}</table>
<p class="note">Armor proficiency is granted by class (see each class page). Wearing armor you lack proficiency in: its AC bonus is halved and its Stealth penalty doubles. Equipment bonuses to defenses were left open in the Combat Core; the values above are the Triad proposal, marked calibratable.</p>
<h2>Signature weapons by class</h2>
<table class="rules-table"><tr><th>Class</th><th>Triad</th><th>Signature weapons</th></tr>
${CLASSES.map(c => `<tr><td><a href="#/class-${c.id}">${c.name}</a></td><td>${TRIAD[c.triad].name}</td><td>${c.weapons.map(w => w.name).join(" · ")}</td></tr>`).join("")}</table>
`};

PAGES["appendix-glossary"] = {
  title: "Glossary", section: "Appendix",
  body: `
<p class="lede">Every term of art in the Triad system, alphabetized for the table.</p>
<table class="rules-table glossary"><tr><th>Term</th><th>Meaning</th></tr>
${[...GLOSSARY].sort((a, b) => a[0].localeCompare(b[0])).map(g => `<tr><td><strong>${g[0]}</strong></td><td>${g[1]}</td></tr>`).join("")}</table>
`};

PAGES["appendix-design"] = {
  title: "Design Notes & Sources", section: "Appendix",
  body: `
<p class="lede">What was decided, what was inherited, and what remains calibratable — the audit trail behind the Triad system.</p>
<h2>Approved decisions (this consolidation)</h2>
<table class="rules-table"><tr><th>Question</th><th>Decision</th></tr>
<tr><td>Structure</td><td>Literal triads: 3 base classes × 3 progressions = 9 paths; each path has its own hybrid → 9 hybrids. <strong>21 class entries.</strong></td></tr>
<tr><td>Stats</td><td>Fixed chassis (HP 100 / Mana 50 / Stamina 75 / AC 10 / DR 1). Only class, progression, hybrid, level and equipment modify them. Attributes feed skills and rolls, not resources.</td></tr>
<tr><td>Horror</td><td>Triad of tracks: Fear 0–100 (acute), Sanity 100→0 (psychic), Corruption 0–100 (moral), three thresholds each.</td></tr>
<tr><td>Legacy classes</td><td>All six names from the orchestration plan reused as progressions (mapping below).</td></tr>
<tr><td>Deliverable</td><td>Full rulebook wiki in English + interactive tools (Character Forge, Compare, Dice).</td></tr></table>
<h2>Legacy class mapping</h2>
<table class="rules-table"><tr><th>Plan name (pt-BR)</th><th>Triad name (en)</th><th>Position</th></tr>
<tr><td>Caçador</td><td><a href="#/class-hunter">Hunter</a></td><td>Landsworn progression</td></tr>
<tr><td>Inquisidor</td><td><a href="#/class-inquisitor">Inquisitor</a></td><td>Occultist progression</td></tr>
<tr><td>Erudito</td><td><a href="#/class-scholar">Scholar</a></td><td>Occultist progression</td></tr>
<tr><td>Médium</td><td><a href="#/class-medium">Medium</a></td><td>Occultist progression</td></tr>
<tr><td>Guardião</td><td><a href="#/class-guardian">Guardian</a></td><td>Landsworn progression</td></tr>
<tr><td>Errante</td><td><a href="#/class-wanderer">Wanderer</a></td><td>Skinwalker progression (Burden/surge identity preserved)</td></tr></table>
<p class="note">Implementation hook: <code>PROG_Class_*</code> FlowChart GUIDs from the orchestration plan map 1:1 to progression IDs; bases and hybrids extend the same namespace (e.g. <code>PROG_Class_Occultist</code>, <code>PROG_Class_Sanctifier</code>).</p>
<h2>Inherited from the source documents</h2>
<ul>
<li><strong>Sistema_de_Combate_Regras.md:</strong> attribute/skill tree (verbatim), d20 + Accuracy vs fixed defenses, defense categories, damage profiles, crit ×2 then DR once, AP 2 / Mov 1 / SP 1, Rest +16/+16, personal-turn cooldowns, ranges 1.5 / 10 tiles, Unconscious at 0 HP, 15/35 budgets and the cost ladder, RPR cooldown-field limitation.</li>
<li><strong>Ravenloft RPR Project Plan.md:</strong> sequential creation workflow, grant-origin accounting, no duplicate benefits, rebuild-on-change, low starting power, magic with a price.</li>
<li><strong>Plano de Orquestração:</strong> DC ladder 8–20, +2 bonus cap, milestone/idempotent progression, levels 1–10, calibration doctrine (), the six legacy class identities, horror-as-decisions.</li>
<li><strong>FlowChart Composition Blueprint:</strong> data-driven catalog structure — this wiki's class data is exported as JSON for direct reuse in <code>SYS_TableLookup</code> defs.</li>
</ul>
<h2>Deliberate departures</h2>
<ul>
<li>Resource formulas rebased to the flat chassis (approved). Dodge/Spell Defense remain attribute-driven (they are roll targets, not resources).</li>
<li>Fear/Sanity/Corruption rescaled to 0–100 with three thresholds each (approved), replacing Stress 0–6 / Medo 0–2 / Sanidade 0–10 / Corrupção 0–3.</li>
<li>Rest additionally reduces Fear by 10 (Triad addition,).</li>
<li>Magic Bolt priced at 4 Mana (3 for Veil workers) — the Combat Core left the cost open.</li>
</ul>
<h2>Still open (later modules, per plan)</h2>
<p>Buffs/debuffs and class mutators · vampirism & full lycanthropy as ancestries · equipment bonus catalog · Resolution phase (injuries, victory progression) · social combat comparisons · Darklord attention & domain profiles · RPR runtime validation gates (F0: persistence, events, dice capture, sheet writes, concurrency). Nothing in this wiki claims runtime validation; all automation claims remain provisional until DevKit evidence exists.</p>
`};
