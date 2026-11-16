#!/usr/bin/env python3
"""Build the single-file Ravenloft Triad Wiki + JSON data export."""
import json, re, pathlib, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "site" / "src"

def read(name): return (SRC / name).read_text(encoding="utf-8")

template = read("template.html")
style = read("style.css")
data_classes = read("data-classes.js")
data_rules = read("data-rules.js")
app = read("app.js")

# sigil for the sidebar (extract from app.js SIGIL constant)
m = re.search(r"const SIGIL = `(.*?)`;", app, re.S)
sigil = m.group(1) if m else ""
# avoid duplicate gradient id in sidebar vs home: rename sidebar's
sigil_side = sigil.replace('id="sg"', 'id="sg2"').replace("url(#sg)", "url(#sg2)")

html = template.replace("/*__STYLE__*/", style)
html = html.replace("<!--__SIGIL__-->", sigil_side)
html = html.replace("/*__DATA_CLASSES__*/", data_classes)
html = html.replace("/*__DATA_RULES__*/", data_rules)
html = html.replace("/*__APP__*/", app)

out = ROOT / "Ravenloft_Triad_Wiki.html"
out.write_text(html, encoding="utf-8")
print(f"Built {out} ({len(html)/1024:.1f} KB)")

# ---- JSON export for the FlowChart/data-driven pipeline ----
# run node to dump the class catalog as JSON
dump_js = """
const fs = require('fs');
const src = [process.argv[2], process.argv[3]].map(f => fs.readFileSync(f, 'utf8')).join('\\n;\\n');
const expose = '\\n;globalThis.__OUT = { CHASSIS, TRIAD, CLASSES, SKILL_TREE, INDEPENDENT, COST_LADDER, HORROR_TRACKS, DARK_GIFTS, BACKGROUNDS, WEAPON_RULES, WEAPON_TAGS, ARMOR_RULES, DEFENSE_RULES, LEVEL_LADDER, CROSSING_COSTS };';
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
"""
(ROOT / "site" / "dump.js").write_text(dump_js, encoding="utf-8")
json_out = ROOT / "data" / "ravenloft-triad.json"
json_out.parent.mkdir(exist_ok=True)
r = subprocess.run(["node", str(ROOT / "site" / "dump.js"), str(SRC / "data-classes.js"), str(SRC / "data-rules.js"), str(json_out)], capture_output=True, text=True)
print(r.stdout.strip() or r.stderr.strip())
if r.returncode != 0: sys.exit(1)
