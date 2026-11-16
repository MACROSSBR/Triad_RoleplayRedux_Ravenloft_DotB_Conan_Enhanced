---
permalink: projetos/rpr/ravenloft-rpr-project-plan
title: '# Ravenloft RPR Project Plan'
type: note
---

# Ravenloft RPR Project Plan

Planning document · Version 0.2 · 22 October 2026

## 1. Project direction

The project will adapt Ravenloft’s gothic horror, Barovia’s oppressive atmosphere, and selected Dungeons & Dragons mechanics into a character system for Conan Exiles using Tot! Roleplay Redux (RPR).

The first deliverable is a small, functional character-creation prototype, not a complete rules conversion or production configuration. Its purpose is to prove that players can create valid characters through a controlled sequence, receive their automatic benefits, and spend only the points they are entitled to spend.

### Approved design preferences

Rules foundation

Hybrid Ravenloft lore and D&D mechanics.

Setting

Barovia-centered, with Ravenloft lore guiding the adaptation.

Starting power

Ordinary people, investigators, and survivors—not established heroes.

Character creation

Sequential and automated wherever RPR actually supports it.

Magic

Specialized, uncommon, and restricted by explicit rules and costs.

Progression

Earned, spendable points rather than automatic level-based increases alone.

### Scope boundary

The supplied RPR configuration is a reference for organization and data structure, not a ceiling on game design. New mechanics may be proposed where useful; their implementation method must be established through the technical audit.

This document does not generate or modify the final configuration. It defines the player workflow, system requirements, provisional capability findings, rules dependencies, and prototype acceptance criteria.

## 2. Refined sequential player workflow

The workflow is the central design constraint. A player should not have to understand the entire rules system to create a valid character, and should never need to manually add a benefit that the system could apply automatically.

### Proposed creation sequence

### 01

Create character identity

Enter the character name and any required identity fields. Keep this separate from mechanical choices.

### 02

Choose ancestry / race

Display permitted options and their descriptions. Apply racial traits, attribute adjustments, proficiencies, restrictions, and other mandatory benefits automatically.

### 03

Choose starting class

Show only classes compatible with the chosen ancestry and campaign rules. Automatically apply class features, starting proficiencies, abilities, and any class-specific restrictions.

### 04

Choose background

Select an approved background such as a village laborer, hunter, soldier, scholar, or investigator. Apply its mandatory benefits and check for overlap with existing grants.

### 05

Resolve optional choices

Present only genuine player decisions: for example, one of several permitted skills, a starting talent, or an approved piece of equipment. Do not ask players to select mandatory features again.

### 06

Calculate remaining budgets

After all automatic grants and fixed starting values are resolved, calculate the discretionary attribute and skill budgets. Show the player the available and spent amounts.

### 07

Allocate points

Allow only legal allocations. Enforce minimums, maximums, prerequisites, category restrictions, and the available budget.

### 08

Review and validate

Present a summary of ancestry, class, background, automatic grants, optional choices, final values, and remaining points. Block approval if any validation fails.

### 09

Confirm and save

Commit the validated character and record its applied grants and choices, to the extent supported by RPR or a companion workflow.

### Mandatory behavior

- Dependency order: ancestry is resolved before class; class before background; all fixed grants before discretionary allocation.
- Single source of truth: every grant is defined once and has a clear origin—ancestry, class, background, optional choice, or progression.
- No duplicate benefits: if two selections grant the same feature, the system must follow an explicit stacking or replacement rule.
- Recalculation on change: changing ancestry, class, or background during creation must rebuild the derived character state. It must not leave behind bonuses from a previous selection.
- Budget integrity: mandatory grants must not silently consume discretionary points unless the rules explicitly say they do.
- Safe failure: if RPR cannot enforce a step natively, the prototype must clearly identify the limitation and use an approved validation or administrative process rather than pretending the step is automated.

### What the player should see

At every stage, the interface should explain what has been applied, what remains selectable, and what is still required. The player should not have to calculate their own racial bonus, class feature, or remaining point total.

The exact UI sequence depends on the capabilities RPR exposes. The order above is the desired player experience; the audit determines which parts can be enforced directly and which need a different implementation.

## 3. RPR capability audit

The audit must cover the system’s full available capabilities—not merely the fields present in the example configuration. The findings below distinguish structures previously identified in the supplied example from functionality that still needs technical verification.

### 3.1 Preliminary inventory from the example

The previously reviewed configuration was reported to include structures or definitions for the following:

| Area                      | Structures or examples observed                                                                             | Relevance to this project                                                                                        |
| ------------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Attributes                | Body, Agility, Mind, Charisma                                                                               | Candidate core attributes; their final names and meanings remain a rules decision.                               |
| Skills                    | Perception, Willpower, Deciphering, Sense Motive, Stealth, Alchemy, First Aid, Healing Advanced             | Possible basis for investigation, survival, and horror-related checks.                                           |
| Perks                     | `PerkDef`, `PerkAction`; example classes including Warrior, Cleric, Assassin, Mage, Knight, Paladin, Ranger | Potential foundation for ancestry and class grants, but the full grant and dependency behavior must be verified. |
| Stats                     | HP, Mana, Armor Class, Attack Bonus, Sanity                                                                 | Possible combat, resource, defense, and horror systems.                                                          |
| Spells and effects        | `SpellDef`, `SpellEffect`, `MutatorDef`                                                                     | Potential basis for restricted supernatural abilities and mechanical effects.                                    |
| Status conditions         | `StatusDef`, `StatusAction`; examples such as Injured, Badly Injured, Bound, Unconscious, Sleeping          | Potential support for injury, restraint, and consequences of dangerous encounters.                               |
| Equipment and proficiency | Weapon categories, armor proficiencies, mutators                                                            | Potential basis for class restrictions and starting equipment rules.                                             |
| Dice                      | `DiceConfig`, `DiceRules`                                                                                   | Possible foundation for resolving checks; the exact available rules and enforcement need verification.           |

These are observations about the example’s reported structure, not proof that all of these systems can be chained into an automated character-creation wizard. They also do not establish that the listed examples are the complete set of RPR features.

### 3.2 Capability matrix to verify

Status labels: “Observed” means a relevant structure was identified in the example; “Unverified” means runtime behavior or complete implementation support has not yet been demonstrated.

| Capability                       | Preliminary status                                     | Audit question                                                                                               |
| -------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Character data and identity      | Unverified                                             | What data is stored, who can edit it, and how is it persisted?                                               |
| Ancestry and class selection     | Perk structures observed; selection flow unverified    | Can RPR restrict and order selections, or are separate commands, menus, or forms required?                   |
| Automatic grants                 | Perk/action structures observed                        | Can selecting an option automatically apply several effects as one transaction?                              |
| Prerequisites and exclusions     | Unverified                                             | Can options require, exclude, or replace other options?                                                      |
| Attribute and skill budgets      | Attribute and skill structures observed                | Can the system enforce point pools, valid ranges, and a zero-overspend rule?                                 |
| Change, reset, and rollback      | Unverified                                             | Can a choice be removed cleanly and all derived values recalculated?                                         |
| Combat and derived statistics    | HP, Armor Class, Attack Bonus and other stats observed | Which values are calculated automatically, and which require manual entry or adjudication?                   |
| Spell restrictions               | Spell and effect structures observed                   | Can spell access be limited by class, prerequisites, resources, or campaign approval?                        |
| Horror and sanity                | Sanity stat observed                                   | Can checks, thresholds, and consequences be applied automatically, or does this require a separate mechanic? |
| Conditions and injuries          | Status structures observed                             | Can conditions be applied, stacked, removed, and persisted reliably?                                         |
| Progression and spendable points | Unverified                                             | Can earned points be granted, tracked, spent, and protected from double spending?                            |
| Administration and audit trail   | Unverified                                             | Can administrators correct characters and review the source of a grant or point expenditure?                 |

### 3.3 How the audit will classify support

Each requirement should be assigned one of three implementation classifications:

- Native: the current RPR version directly supports the behavior and the behavior has been tested.
- Configurable with constraints: RPR supports most of the behavior, but the design must respect specific limitations or require additional steps.
- External or manual: the behavior cannot currently be demonstrated through RPR configuration alone and needs a companion workflow, administrative validation, or a deliberate scope adjustment.

No feature should be marked native merely because a similarly named data structure exists.

Audit limitation: I can establish the audit scope and identify the structures reported in the example, but I cannot honestly certify the complete RPR capability set without the full current configuration/source and a test environment or reliable documentation of the installed RPR version. The next technical step is to inspect all relevant definitions and exercise the uncertain behaviors. This is a verification requirement, not a reason to limit the design to the example file.

## 4. Automatic ancestry, class, and background grants

The rules catalog should be designed independently from the technical format used to store it. This allows the rules to grow without forcing every new mechanic into the shape of the example configuration.

### 4.1 Grant categories

Every character benefit must be classified before point budgets are calculated.

| Grant category            | Examples                                                         | Treatment                                      |
| ------------------------- | ---------------------------------------------------------------- | ---------------------------------------------- |
| Fixed ancestry grants     | Ancestry traits, fixed modifiers, special restrictions           | Automatic                                      |
| Fixed class grants        | Starting proficiencies, core class abilities, class restrictions | Automatic                                      |
| Fixed background grants   | Occupational training, background-specific benefits              | Automatic                                      |
| Optional selections       | A skill chosen from a limited list, one permitted talent         | Player selects; system validates               |
| Discretionary attributes  | Improvements purchased using the attribute budget                | Player allocates points                        |
| Discretionary skills      | Improvements purchased using the skill budget                    | Player allocates points                        |
| Campaign-awarded benefits | Earned abilities, improvements, or special permissions           | Granted through progression rules              |
| Narrative-only traits     | History, personality, fears, obligations, relationships          | No mechanical budget unless explicitly defined |

Each mechanical grant should have a unique identifier, source category, effect, prerequisites, stacking policy, and removal or recalculation behavior.

For example, an ancestry grant should be distinguishable from a class grant even if both modify the same attribute. That distinction makes validation, refunds, and character reviews possible.

### 4.2 Proposed initial catalog

The prototype should use a deliberately small catalog. The following are candidate archetypes, not finalized rules or claims about existing RPR classes.

[Commoner | D&D 5E Monster | Friends & Fables](https://images.openai.com/static-rsc-4/knCFn1wCBfm_IYlnCxuTpAzbMUsnVy6Gb9xlxVMKIwPLR276gejLzwxRTJ1BxBHtbmFnbUtcpfa_NnbB-olp7Saf-ZLWb3VVxy0G-SDXaXSwCIxV21eIKse0RHEJC9j6wuWMTnRIdO_l96tg9N9kENnPAvCsMVtQMExobaghCZM?purpose=inline)

Ancestry: Human

Prototype baseline

Use as the baseline for testing. Its fixed grants should be explicit, even if they consist only of standard starting values and no special modifiers.

[Cinematic Frames, Mysterious Figure | Snack Prompt](https://images.openai.com/static-rsc-4/k4J20MUZ5de0cv7QTv3Exv5Yh4bYu_oXYj57Gn7PNXFiPPTcZkzJ8eT_EnBZzV968XzdMOaGN1QHg7-zFlCDYqzO02Bu2lLkG6Tyua-HEDkQa8XfjYev2Vnc7PESQtxK-BgG-5R9quxBAKJ_wbCN38PK2mmRBBqb8lcxY92qRNc?purpose=inline)

Class: Hunter

Ordinary survivor archetype

A candidate for testing a small package of fixed survival or weapon proficiencies, with any additional skill choice handled separately.

[文件:Backgrounds-VRGR-Investigator.webp - 龙与地下城TRPG - 灰机wiki - 北京嘉闻杰诺网络科技有限公司](https://images.openai.com/static-rsc-4/kWVLM6Tbb_kNW0dpn6hjyBShJ7Ohla6UlzOW5jkLbLS8ANiEMBAQKrPJcGOgJPBql0u8yQNgGK6mDuEv9NAiLtBGk9dr5M1S_reDXAqty8Ij8OcniiC09P9FY1mCgVN-tv5V08bEsycAZ9powEdn6_m92NXAQiv69ozILn4wt8I?purpose=inline)

Background: Investigator

Occupational history

A candidate for testing background grants involving investigation or observation without automatically duplicating benefits already granted by class.

The initial prototype should not begin with every D&D race, class, subclass, feat, spell, and background. It should prove the grant system using a small number of mechanically distinct options. More options can be added after the grant and validation model is reliable.

### 4.3 Grant resolution rules

The implementation should use these rules as requirements:

1. Resolve the selected ancestry and apply its fixed grants.
2. Resolve the class and apply its fixed grants.
3. Resolve the background and apply its fixed grants.
4. Evaluate optional choices and their prerequisites.
5. Detect duplicates, conflicts, and incompatible combinations.
6. Calculate discretionary budgets only after fixed values and grants have been resolved.
7. Rebuild the derived character state whenever an earlier selection changes.

A benefit must not be applied twice because two steps in creation happen to reference it. The system should calculate the final character from the current selections rather than repeatedly adding bonuses to an already modified value.

## 5. Point budgets and progression

No numeric point budget should be finalized yet. The available points depend on the complete list of fixed grants, the chosen attribute and skill scales, and the mechanics that RPR can enforce.

### 5.1 Separate the budgets

Use separate budgets for distinct kinds of advancement:

- Attribute budget: discretionary improvement of core attributes.
- Skill budget: discretionary improvement of skills.
- Optional choice limits: the number and type of permitted selections, governed by prerequisites rather than silently deducted from either budget.
- Progression balance: earned points available for later spending, with the applicable purchase costs and restrictions.

This prevents a racial modifier or mandatory class ability from accidentally consuming a player's discretionary allocation.

The eventual calculation should follow this order:

1\. Establish base values

Defined starting attributes, skills, and resources

2\. Apply fixed grants

Ancestry + class + background

3\. Resolve restrictions and optional choices

Validate prerequisites, conflicts, and fixed selections

4\. Calculate remaining budgets

Determine legal discretionary points from the finalized starting state

5\. Allocate, validate, and save

No overspending or invalid values

### 5.2 Calculation model

For a given attribute, the final starting value can be represented as:

\\[ A\_{\mathrm{final}} = A\_{\mathrm{base}} + R_A + C_A + B_A + O_A \\]

Where:

- \\(A\_{\mathrm{base}}\\) is the standard starting value.
- \\(R_A\\) is the ancestry modifier.
- \\(C_A\\) is the class modifier.
- \\(B_A\\) is the background modifier.
- \\(O_A\\) is any explicitly permitted optional modifier.

This is a proposed accounting model, not a claim that RPR uses this formula internally.

The discretionary budget should be tracked separately from the final value. If the rules use different costs for different improvements, the system must calculate expenditure using those costs and reject any purchase that exceeds the available balance.

### 5.3 Earned, spendable progression

Progression should be based on earned points that players can spend within the campaign's restrictions.

The progression rules must define:

- What earns points: campaign milestones, achievements, or administrator-awarded progression.
- Which purchases use attribute points, skill points, or another defined resource.
- Whether abilities, magic, and supernatural traits require additional prerequisites or costs.
- Whether purchases are immediate or require approval.
- How spent points and remaining balances are recorded.
- What happens when an ability is removed, a character is corrected, or an invalid purchase is discovered.

The initial character-creation budget and later earned progression should be distinct concepts. A new character must not receive a progression award simply because the character was created, and players must not be able to claim the same award repeatedly.

Only after the fixed-grant catalog is established should we run representative builds, compare their final values, and settle starting budgets and purchase costs.

## 6. Magic, horror, and Barovia

The system should reinforce the setting rather than reproduce every D&D option by default.

### Magic

Magic is specialized and restricted. The rules design should distinguish between:

- Ordinary skills and knowledge.
- Trained or specialized supernatural practice.
- Specific abilities or spells available only through defined prerequisites.
- Resources and costs associated with supernatural use.
- Campaign permissions or restrictions that cannot be bypassed by ordinary character points.

The exact resource model—such as whether Mana is retained, replaced, or supplemented by other costs—must be decided after reviewing RPR's supported mechanics and the intended D&D rules basis.

### Horror and survival

Sanity, injuries, conditions, fear, and supernatural consequences are candidate systems, not yet finalized rules. Each should have a defined purpose and a clear interaction with character creation, play, and progression.

The prototype does not need to implement the entire horror system. It should, however, avoid a character architecture that makes later integration impossible.

### Barovia-centered scope

Initial character options and equipment should be appropriate to a gothic-horror campaign populated by ordinary people and survivors. Unusual ancestries, powerful supernatural classes, and high-impact magic should not become default options merely because a D&D source includes them.

The first prototype should prioritize reliable creation and validation over breadth.

## 7. First deliverable: functional character-creation prototype

The prototype should demonstrate one complete creation path from beginning to saved character, with enough variation to test automatic grants and budget integrity.

### Minimum feature set

- Sequential ancestry, class, and background selection.
- Automatic application of fixed grants wherever technically supported.
- A clear distinction between fixed benefits and discretionary choices.
- Point budgets calculated only after fixed grants are resolved.
- Validated attribute and skill allocation.
- Duplicate and incompatible selection checks.
- Recalculation after changing an earlier selection.
- A final review screen or equivalent summary.
- A reliable way to save and review the completed character, using the capabilities actually available in RPR.

If native RPR functionality cannot provide a particular step, the prototype must document the gap and demonstrate the chosen workaround. It should not present manual administration as native automation.

### Acceptance tests

| Test case                                            | Expected result                                                                                                |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Baseline human character                             | Correct standard values and no unintended ancestry bonuses                                                     |
| Ancestry with modifiers                              | All fixed ancestry grants are applied once                                                                     |
| Class with mandatory features                        | Features appear automatically without requiring the player to select them again                                |
| Background overlaps with a class benefit             | The defined stacking or replacement rule is applied                                                            |
| Player attempts to overspend                         | The allocation is rejected                                                                                     |
| Player selects an incompatible option                | The system blocks it or routes it through the defined approval process                                         |
| Player changes ancestry or class before confirmation | Old grants are removed or recalculated without residual bonuses                                                |
| Player submits an incomplete character               | Approval is blocked with a clear explanation                                                                   |
| Player earns and spends progression points           | The balance changes correctly and duplicate spending is prevented, if progression is included in the prototype |

### Prototype completion criteria

The first deliverable is complete when a player can create a valid character through the intended sequence, see all automatic grants and discretionary allocations, correct an earlier choice without corrupting the character, and produce a validated result.

A large catalog of options is not a completion criterion for this phase.

## 8. Project roadmap

1. Phase 1 — Lock the player workflow

   Finalize creation steps, dependencies, validation points, and what the player sees at each stage.
2. Phase 2 — Complete the RPR technical audit

   Inspect the full available configuration and relevant source or documentation. Test automatic grants, prerequisites, budgets, persistence, recalculation, and progression. Classify each requirement as native, configurable with constraints, or external/manual.
3. Phase 3 — Define the rules catalog

   Establish base values, ancestry/class/background grants, optional choices, stacking rules, prerequisites, and restrictions. Keep the data model independent from the sample configuration's limits.
4. Phase 4 — Balance representative characters

   Apply the grants first, then calculate and test budgets. Compare a baseline survivor, a character with meaningful ancestry modifiers, a skill-focused character, and a character with restricted supernatural access.
5. Phase 5 — Implement the prototype

   Build the smallest complete character-creation path using verified RPR capabilities and clearly documented workarounds.
6. Phase 6 — Validate and expand

   Test the acceptance cases, correct failures, then expand the catalog and add broader combat, magic, horror, and progression systems.

## 9. Immediate next action

The next deliverable should be a technical specification for the creation workflow and the RPR capability audit, not the final configuration.

It should include:

1. The complete player journey and dependency order.
2. A full inventory of available RPR definitions and supported behaviors.
3. A list of which grants are automatic, optional, discretionary, or progression-based.
4. A list of unverified features requiring a test.
5. A prototype implementation map showing what can be built directly and what needs a workaround.

Once that specification is grounded in the complete RPR materials and verified behavior, we can define the initial ancestry, class, and background grants. Only then should we calculate point budgets and implement the first functional prototype.

Important source requirement: the example configuration is not enough to certify every available RPR capability. To complete the technical audit rather than leave it as a verification plan, the full current configuration and any relevant RPR source or documentation need to be available for inspection. No final configuration is being generated at this stage.