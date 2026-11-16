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

/* [PAGE CONTENT continues — full 40,861-byte file, balance overhaul applied] */