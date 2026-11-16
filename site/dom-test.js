const fs = require("fs");
const { JSDOM } = require("/tmp/domtest/node_modules/jsdom");
const html = fs.readFileSync(process.argv[2] || "Ravenloft_Triad_Wiki.html", "utf8");

const errors = [];
const dom = new JSDOM(html, { runScripts: "dangerously", url: "https://wiki.local/#/home", pretendToBeVisual: true });
const { window } = dom;
window.scrollTo = () => {};
window.addEventListener("error", e => errors.push("window error: " + e.message));
const doc = window.document;
const $ = s => doc.querySelector(s);
const $$ = s => [...doc.querySelectorAll(s)];
const sleep = ms => new Promise(r => setTimeout(r, ms));

let fail = 0;
const check = (name, cond) => { if (!cond) { fail++; console.error("FAIL:", name); } else console.log("ok:", name); };
const nav = async hash => { window.location.hash = hash; await sleep(40); };
const fire = (el, type = "input") => el.dispatchEvent(new window.Event(type, { bubbles: true }));

(async () => {
  await sleep(250);
  try {
    check("boot: sidebar populated", $$("#sidebar-nav a").length >= 37);
    check("boot: home rendered", $("#page").textContent.includes("The Triad System"));
    check("boot: hero shows 63 abilities", $("#page").textContent.includes("63"));

    await nav("#/class-mistshroud");
    check("nav: mistshroud page", $("#page").textContent.includes("Mistshroud") && $("#page").textContent.includes("The White Silence"));
    check("nav: crossing box present", !!$(".crossing-box"));
    check("nav: active sidebar link", !!$('#sidebar-nav a.active[href="#/class-mistshroud"]'));

    await nav("#/rules-combat");
    check("nav: combat pipeline", $("#page").textContent.includes("Subtract Damage Reduction once"));

    await nav("#/tools-forge");
    check("forge: renders", $("#page").textContent.includes("Sheet"));
    const baseSel = $('select[data-forge="base"]');
    baseSel.value = "landsworn"; fire(baseSel); await sleep(20);
    check("forge: base switch → Landsworn", $("#page").textContent.includes("Landsworn"));
    const lvl = $('input[data-forge="level"]');
    lvl.value = "6"; fire(lvl); await sleep(20);
    check("forge: level 6 applied", $("#forge-level-label").textContent === "6");
    const pathSel = $('select[data-forge="path"]');
    check("forge: path enabled at L6", !pathSel.disabled);
    pathSel.value = "guardian"; fire(pathSel); await sleep(20);
    const hybSel = $('select[data-forge="hybrid"]');
    check("forge: hybrid enabled with path at L6", !hybSel.disabled);
    hybSel.value = "bearwarden"; fire(hybSel); await sleep(20);
    check("forge: Bearwarden selected", $("#page").textContent.includes("Bearwarden"));
    const plus = $('button.step[data-forge="attr"][data-key="Fortitude"][data-d="1"]');
    plus.click(); await sleep(10);
    $('button.step[data-forge="attr"][data-key="Fortitude"][data-d="1"]').click(); await sleep(10);
    check("forge: attr stepper (Fortitude +2 = 2 pts)", $("#page").textContent.includes("2 pts"));
    for (let i = 0; i < 6; i++) { const b = $('button.step[data-forge="skill"][data-key="Stealth"][data-d="1"]'); if (b) { b.click(); await sleep(10); } }
    check("forge: skill rank capped at +5 (9 pts)", $("#page").textContent.includes("9 pts"));

    await nav("#/tools-compare");
    check("compare: 3 columns", $$(".compare-col").length === 3);
    const selA = $('select[data-compare="a"]');
    selA.value = "doomwing"; fire(selA); await sleep(20);
    check("compare: swap to Doomwing", $(".compare-col").textContent.includes("Doomwing"));

    await nav("#/tools-dice");
    $("#dice-roll").click(); await sleep(10);
    check("dice: d20 logged", $$("#dice-log .dice-row").length === 1);
    $('button[data-dice-quick="2d3+4"]').click(); await sleep(10);
    check("dice: quick expr logged", $$("#dice-log .dice-row").length === 2);
    const total = parseInt($("#dice-log .dice-row.latest .dice-total").textContent);
    check("dice: 2d3+4 in range 6..10", total >= 6 && total <= 10);

    const search = $("#search");
    search.value = "moonbinder"; fire(search); await sleep(10);
    check("search: finds Moonbinder", $("#search-results").textContent.includes("Moonbinder"));
    search.value = "witchlight"; fire(search); await sleep(10);
    check("search: finds ability text", $("#search-results").textContent.includes("Occultist"));

    await nav("#/class-nonexistent");
    check("404 graceful", $("#page").textContent.includes("Lost in the Mists"));

    check("no window errors", errors.length === 0);
    if (errors.length) console.error(errors.join("\n"));
    console.log(fail === 0 ? "\nDOM TEST: ALL PASSED" : `\nDOM TEST: ${fail} FAILURES`);
    process.exit(fail ? 1 : 0);
  } catch (e) { console.error("DOM TEST CRASH:", e); process.exit(1); }
})();
