
const fs = require('fs');
const src = [process.argv[2], process.argv[3]].map(f => fs.readFileSync(f, 'utf8')).join('\n;\n');
const expose = '\n;globalThis.__OUT = { CHASSIS, TRIAD, CLASSES, SKILL_TREE, INDEPENDENT, COST_LADDER, HORROR_TRACKS, DARK_GIFTS, BACKGROUNDS, WEAPON_RULES, WEAPON_TAGS, ARMOR_RULES, DEFENSE_RULES, LEVEL_LADDER, CROSSING_COSTS };';
eval(src + expose);
const O = globalThis.__OUT;
const out = {
  system: "ravenloft-triad", version: "1.0", generated: new Date().toISOString().slice(0,10),
  chassis: O.CHASSIS, triad: O.TRIAD, classes: O.CLASSES,
  skillTree: O.SKILL_TREE, independent: O.INDEPENDENT, costLadder: O.COST_LADDER,
  horrorTracks: O.HORROR_TRACKS, darkGifts: O.DARK_GIFTS, backgrounds: O.BACKGROUNDS,
  weaponRules: O.WEAPON_RULES, weaponTags: O.WEAPON_TAGS, armorRules: O.ARMOR_RULES,
  defenseRules: O.DEFENSE_RULES, levelLadder: O.LEVEL_LADDER, crossingCosts: O.CROSSING_COSTS,
  budgets: { attributes: 15, skills: 35, pointCapPerEntry: 10 }
};
fs.writeFileSync(process.argv[4], JSON.stringify(out, null, 2));
console.log("JSON export written:", process.argv[4]);
