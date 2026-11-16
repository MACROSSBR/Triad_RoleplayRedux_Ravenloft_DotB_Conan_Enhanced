/* Smoke test: data integrity + all renderers, with a minimal DOM stub. */
const fs = require("fs");
const path = require("path");
const SRC = path.join(__dirname, "src");

const listeners = {};
const elStub = () => ({
  innerHTML: "", textContent: "", value: "", scrollTop: 0,
  classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
  addEventListener() {}, setAttribute() {}, getAttribute() { return ""; },
  querySelectorAll() { return []; }, closest() { return null; }, select() {}, focus() {}
});
global.document = {
  addEventListener(ev, fn) { listeners[ev] = fn; },
  querySelector() { return elStub(); },
  querySelectorAll() { return []; },
  createElement() { return elStub(); },
  body: { classList: { add() {}, remove() {}, toggle() {} }, appendChild() {}, removeChild() {} },
  title: ""
};
global.window = { addEventListener() {}, scrollTo() {} };
global.location = { hash: "#/home" };
global.navigator = {};

const srcAll = ["data-classes.js", "data-rules.js", "app.js"].map(f => fs.readFileSync(path.join(SRC, f), "utf8")).join("\n;\n");
const expose = `
Object.assign(globalThis, { TRIAD, CHASSIS, CLASSES, CLASS_BY_ID, BASES, PATHS, HYBRIDS, RANKS, SKILL_TREE, INDEPENDENT,
  COST_LADDER, HORROR_TRACKS, PAGES, FORGE, COMPARE, DICE, NAV,
  spentAttrs, spentSkills, forgeTotals, effSkill, fullTotals, lineageTotals, pageContent,
  renderSidebar, buildSearchIndex, rollD20, rollExpr, rankCost,
  getSearchIndex: () => SEARCH_INDEX });
`;
eval(srcAll + "\n;" + expose);
const SEARCH_INDEX_REF = () => globalThis.getSearchIndex();

let failures = 0;
const check = (name, cond) => { if (!cond) { failures++; console.error("FAIL:", name); } else console.log("ok:", name); };

/* ---- data integrity ---- */
check("21 classes", CLASSES.length === 21);
check("3 bases / 9 paths / 9 hybrids", BASES.length === 3 && PATHS.length === 9 && HYBRIDS.length === 9);
check("each base has 3 paths", BASES.every(b => PATHS.filter(p => p.parent === b.id).length === 3));
check("each path has exactly 1 hybrid", PATHS.every(p => HYBRIDS.filter(h => h.parent === p.id).length === 1));
check("hybrid partner differs from own triad", HYBRIDS.every(h => h.partner !== CLASS_BY_ID[h.parent].triad));
const partnerCount = { veil: 0, blood: 0, land: 0 };
HYBRIDS.forEach(h => partnerCount[h.partner]++);
check("partner balance 3/3/3", Object.values(partnerCount).every(v => v === 3));
check("every class has 3 abilities (Initiate/Adept/Master)", CLASSES.every(c => c.abilities.length === 3 && RANKS.every(r => c.abilities.some(a => a.rank === r))));
check("every class has 3 weapons", CLASSES.every(c => c.weapons.length === 3));
check("every class has lore + quote", CLASSES.every(c => c.lore.length >= 2 && c.quote.text && c.quote.by));
check("6 legacy names present", ["hunter", "inquisitor", "scholar", "medium", "guardian", "wanderer"].every(id => CLASS_BY_ID[id] && CLASS_BY_ID[id].kind === "path"));
check("unique ids", new Set(CLASSES.map(c => c.id)).size === 21);

/* ---- math: worked example from the creation page ---- */
FORGE.base = "occultist"; FORGE.path = ""; FORGE.hybrid = ""; FORGE.level = 1; FORGE.armor = "Cloth"; FORGE.background = "Scholar";
FORGE.attrs = { Body: 2, Agility: 2, Fortitude: 5, Charisma: 2 };
Object.keys(FORGE.skills).forEach(k => FORGE.skills[k] = 0);
Object.assign(FORGE.skills, { Willpower: 4, Intimidation: 3, Binding: 3, Deciphering: 3, Perception: 3, Accuracy: 3, Initiative: 2, "First Aid": 2, Stealth: 2, Alchemy: 1, "Sense Motive": 1, Eavesdropping: 1 });
check("attr budget = 15", spentAttrs() === 15);
check("skill budget = 35", spentSkills() === 35);
const t = forgeTotals();
check("Occultist L1 totals 100/80/60/10/1", t.hp === 100 && t.mana === 80 && t.stamina === 60 && t.ac === 10 && t.dr === 1);
check("Dodge 4 / SpellDef 6 / Acc 4", t.dodge === 4 && t.spelldef === 6 && t.acc === 4);
check("eff Willpower 9, Deciphering 9 (bg), Binding 8", effSkill("Willpower") === 9 && effSkill("Deciphering") === 9 && effSkill("Binding") === 8);

/* L10 Sanctifier lineage totals */
const sanc = fullTotals(CLASS_BY_ID["sanctifier"], 10);
check("Sanctifier L10: HP 150, Mana 125, Acc 3", sanc.hp === 150 && sanc.mana === 125 && sanc.acc === 3);
const bear = fullTotals(CLASS_BY_ID["bearwarden"], 10);
check("Bearwarden L10: HP 170, Stam 115, DR 3, AC 12", bear.hp === 170 && bear.stamina === 115 && bear.dr === 3 && bear.ac === 12);

/* ---- renderers ---- */
const pages = ["home", "classes-index", "appendix-abilities", "tools-forge", "tools-compare", "tools-dice",
  ...Object.keys(PAGES), ...CLASSES.map(c => "class-" + c.id)];
pages.forEach(id => {
  try {
    const p = pageContent(id);
    check("render " + id, p.body.length > 200 && !/undefined|NaN|\[object Object\]/.test(p.body));
  } catch (e) { failures++; console.error("FAIL render", id, e.message); }
});
try { renderSidebar(); buildSearchIndex(); check("sidebar + search index (" + SEARCH_INDEX_REF().length + " entries)", SEARCH_INDEX_REF().length >= 35); }
catch (e) { failures++; console.error("FAIL sidebar/search", e.message); }

/* dice */
try {
  DICE.mod = 3; rollD20();
  check("d20 roll logged", DICE.log.length === 1 && DICE.log[0].total >= 4 && DICE.log[0].total <= 23);
  rollExpr("2d3+4");
  check("2d3+4 in range 6..10", DICE.log[0].total >= 6 && DICE.log[0].total <= 10);
  rollExpr("bogus");
  check("bad expression rejected", !!DICE.log[0].error);
} catch (e) { failures++; console.error("FAIL dice", e.message); }

console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} FAILURES`);
process.exit(failures ? 1 : 0);
