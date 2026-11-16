---
permalink: projetos/rpr/ravenloft-roleplay-redux-project-dev
title: '# Ravenloft Roleplay Redux — Project Dev'
type: note
---

# Ravenloft Roleplay Redux — Project Development Roadmap

Project proposal · Conan Exiles · Tot! Roleplay Redux (RPR)

The first step is to establish a playable rules framework that captures the atmosphere and core mechanics of Dungeons & Dragons: Ravenloft without exceeding the capabilities of the Tot! Roleplay Redux mod. Before building the full configuration, we should agree on the campaign's identity, character creation rules, skill system, supernatural mechanics, and how much of D&D's original rules we want to preserve.

The uploaded RPR configuration provides a practical starting point. It already contains character attributes, skills, perks, classes, races, health, mana, armor class, attack bonuses, sanity, spells, combat actions, status effects, and conditional modifiers. This means we can design the Ravenloft system around existing structures instead of assuming the mod supports features it may not have.

The goal is a coherent, balanced, lore-faithful tabletop-inspired RPG system implemented through RPR's existing mechanics, with manual roleplay procedures only where the mod cannot automate a rule.

## 1. What the existing RPR configuration supports

The following inventory is based on the uploaded configuration, rather than assumptions about the mod.

Dice and character attributes

The configuration defines `DiceConfig`, `DiceRules`, and four core attributes: Body, Agility, Mind, and Charisma. Individual skill definitions include descriptions, modifiers, and progression-related fields.

Character creation and progression

`PerkDef` and `PerkAction` define race and class perks, including attribute adjustments and granted abilities. The current example includes Warrior, Cleric, Assassin, Mage, Knight, Paladin, and Ranger.

Combat and survivability

`Stat` defines HP, Mana, Armor Class, Attack Bonus, and Sanity. `SpellDef`, `SpellEffect`, and `MutatorDef` support combat actions, healing, magic, and conditional effects.

Investigation, horror, and conditions

Existing skills include Perception, Willpower, Deciphering, Sense Motive, Stealth, Alchemy, First Aid, and Healing Advanced. `StatusDef` and `StatusAction` provide a basis for conditions such as Injured, Badly Injured, Bound, Unconscious, and Sleeping.

The existing combat configuration also distinguishes weapon categories and armor proficiencies through mutators. The spell system includes requirements and effects, while some supernatural mechanics depend on administrative intervention.

Important limitation: the file demonstrates these structures and their current configuration. It does not, by itself, establish every supported field, every engine limitation, or whether the mod can implement a fully automated D&D-style character sheet. We must validate those details before designing the final rules.

## 2. The design principles for Ravenloft

Ravenloft should not simply be a standard fantasy RPG with vampires and gothic buildings. Its defining feature is the relationship between horror, moral choices, supernatural temptation, and imprisonment within the Domains of Dread. Each domain can reflect the nature and failures of its Darklord, while the Mists separate domains and can obstruct escape.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.dungeonsanddragons.com\&sz=32)

Dungeons & Dragons

+1



I recommend the following principles for the project:

- Gothic horror before power fantasy. Ordinary people, investigators, hunters, priests, and desperate survivors should have meaningful roles alongside supernatural characters.
- Competence without invulnerability. Skilled characters should excel at their specialties, but even powerful characters must face meaningful consequences.
- Magic with a price. Supernatural powers should be useful without making mundane skills, investigation, and cooperation obsolete.
- Fear and sanity as roleplay mechanics. Horror should affect decisions, relationships, and behavior rather than merely subtracting points.
- Moral corruption as a choice. Dark Gifts, forbidden knowledge, and bargains should offer tempting advantages with narrative costs.
- Lore with room for original stories. Canonical domains and Darklords provide the foundation, but the campaign should not require every player to follow an existing adventure.

These are design recommendations, not yet implemented rules.

## 3. Proposed project phases

I recommend a six-phase development process. Each phase should produce a concrete deliverable and receive approval before the next phase commits us to major design decisions.

## 1

Project direction and scope

Current phase

Define the campaign's version of Ravenloft, horror intensity, player power level, source editions, and the balance between automated mechanics and manual storytelling.

Deliverable: approved design brief.

## 2

RPR technical audit

Map every relevant configuration record to its purpose, dependencies, available modifiers, and limitations. Verify the installed RPR version and test uncertain behavior in a development environment.

Deliverable: capability matrix and technical specification.

## 3

Core rules and character creation

Design attribute allocation, skills, proficiencies, classes, backgrounds, character advancement, and combat resolution. Establish consistent formulas and point budgets.

Deliverable: rules document and character creation examples.

## 4

Ravenloft-specific mechanics

Define fear, sanity, curses, Dark Gifts, supernatural corruption, magic, monster-hunting, and the treatment of undead, lycanthropes, and other supernatural beings.

Deliverable: horror and supernatural systems.

## 5

Configuration and implementation

Translate approved mechanics into `SkillDef`, `PerkDef`, `PerkAction`, `Stat`, `SpellDef`, `SpellEffect`, `MutatorDef`, and other supported records. Document every manual procedure and administrative action.

Deliverable: implementation-ready RPR configuration and documentation.

## 6

Testing, balancing, and release

Test character builds, opposed rolls, damage, healing, spell costs, supernatural traits, edge cases, and progression. Revise the system based on playtest results.

Deliverable: validated release candidate, change log, and player guide.

The official RPR documentation also describes custom dice systems, configurable character attributes and skills, perks, and an embedded configuration approach using data tables. That provides a useful implementation path, but the exact implementation must match the server's installed edition and API.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://steamcommunity.com\&sz=32)

Steam Community

+1



## 4. Proposed character sheet architecture

The following is the initial structure to evaluate, not a final list of configured records.

| Character sheet section | Proposed contents                                        | Implementation approach                                        |
| ----------------------- | -------------------------------------------------------- | -------------------------------------------------------------- |
| Attributes              | Body, Agility, Mind, Charisma                            | Reuse the four existing core attributes initially              |
| Derived statistics      | HP, Armor Class, Attack Bonus, Sanity, optional Mana     | Reuse existing stats where appropriate                         |
| Skills                  | Combat, investigation, social, survival, medical, occult | Retain and revise existing skills; add only justified new ones |
| Background              | Occupation, origin, motivation, personal tragedy         | Perks or character biography, depending on available UI        |
| Class or archetype      | Fighter, investigator, healer, occultist, hunter         | Perk-based features and ability access                         |
| Proficiencies           | Weapons, armor, specialist equipment                     | Existing mutators and relevant perks                           |
| Supernatural traits     | Species, curses, Dark Gifts, transformations             | Conditional perks, modifiers, and statuses where supported     |
| Spells and powers       | Learned magic, rituals, supernatural abilities           | `SpellDef`, `SpellEffect`, and related requirements            |
| Conditions              | Fear, injury, exhaustion, corruption, possession         | Existing statuses and new statuses where technically supported |

One significant decision is whether to retain the current four-attribute structure or introduce a closer adaptation of D&D's six abilities: Strength, Dexterity, Constitution, Intelligence, Wisdom, and Charisma.

My initial recommendation is to retain the four existing attributes and map D&D abilities into them, unless the audit demonstrates that six attributes can be introduced cleanly without breaking dependent mechanics.

For example, Strength and Constitution could initially map to Body; Dexterity to Agility; Intelligence and Wisdom to Mind; and Charisma to Charisma. Skills would then distinguish activities that the broader attributes cannot.

This keeps the interface simpler, but it sacrifices some of D&D's mechanical distinctions. We should make that trade-off explicitly rather than quietly treating the two systems as identical.

## 5. Character creation and point distribution

We should not finalize numerical budgets until we have established the campaign's desired power level and tested the RPR dice configuration.

The proposed rules should cover the following:

1. Attributes: a fixed starting budget, defined minimum and maximum values, and a documented conversion from D&D abilities.
2. Skills: a separate pool of skill points, with higher ranks costing more or being restricted by background and training.
3. Background: a package of starting proficiencies, knowledge, contacts, or advantages rather than unrestricted bonus points.
4. Class or archetype: a defined set of starting features, equipment proficiencies, and eligible abilities.
5. Species and supernatural origins: mechanical benefits paired with meaningful drawbacks, restrictions, or story obligations where appropriate.
6. Advancement: a consistent method for gaining skills and powers through approved milestones, training, or earned progression.

### How the dice rules should be handled

The uploaded file includes skill checks that describe success at 15 or higher and opposed checks where the higher result wins. These are useful examples of the current system's conventions, but they do not prove that every skill uses an identical resolution formula.

Before choosing the final rules, we need to verify:

- Whether skills use a d20 roll plus a modifier, a configured dice pool, or another calculation.
- How attributes contribute to skill rolls and whether skill modifiers are capped.
- Whether natural 1s and 20s have special effects.
- How opposed checks, difficulty classes, and ties are resolved.
- How Armor Class and Attack Bonus interact with damage and defensive actions.

Once those details are confirmed, we can build a consistent conversion from D&D-style checks to RPR rolls without introducing contradictory formulas.

## 6. Ravenloft's defining systems

[Battle in Barovia: Session Six of Curse of Strahd Adventure](https://images.openai.com/static-rsc-4/2DCSAOHR23LINFFYGT5I4mbUGiTilpsJuu5bPaSiQJX-byDpaknWVw-QVceuo1Lf_V3uxIacr4OGMR-CPMm43lrJjEkPjIDxg58dKF7soCjSS9vYpSO1NzjHCP3qatbC7xjF6KaAC_EFvJDr1Ee0Mll9AViAyZmeWM4JkukTEWs?purpose=inline)

Fear, horror, and sanity

The existing Sanity statistic gives us a possible foundation. We should distinguish immediate fear, traumatic horror, and gradual psychological deterioration rather than using one generic penalty for everything.

Proposed behavior: situational checks, escalating consequences, recovery conditions, and opportunities for character-driven roleplay. Automatic psychological effects must be tested before implementation.

[Barovia In DnD 5e | Ravenloft Domain Of Dread | Dungeon Mister](https://images.openai.com/static-rsc-4/_3s1nqrtkBsHHgbd7SK6yG_37ZlC29M3fQ8W2m2vLIRmUXRinVu5He1kUoy9hwcwkjvuPzcD-a4c7NU7PWA8jmG08EhsFaX7mpTCRi-z--31X8fA0BfD_8c7YWQwHar4jMx3YbszGYhRhcGI7ct7hjCx2p1mLA2VPu1mUakN4eE?purpose=inline)

Dark Gifts and corruption

Supernatural bargains should give characters compelling abilities in exchange for a risk, limitation, debt, or narrative consequence. Some consequences may be automated; others may require player and administrator cooperation.

[Steampunk Fantasy](https://images.openai.com/static-rsc-4/n3Bt-gUAgoEZZtIXMvM9JJduzjsthKtVDpX4N7A7bPkv6D2OAlFnXjaxF-du6AtED4SydK-6w4494NMQ8K_mqI7jQTRbVUXWEr9yE871uCU7pGNSkLrBC08TBiBKPC_Jmp5sGxL72wRXWQCcGtkq98VAySIpcFU5wZJwmp2d3Tc?purpose=inline)

Monster hunting and occult investigation

Perception, Deciphering, Alchemy, First Aid, and Sense Motive can form the foundation for investigating hauntings, identifying monsters, researching weaknesses, preparing remedies, and surviving encounters.

[Join Curse of Strahd: Darkness Eternal - Discord / Foundry VTT / D&D Beyond - Dungeons & Dragons 5e | StartPlaying Games](https://images.openai.com/static-rsc-4/S5mbyAbfE5afpsbsaKXVSyzXqDRJC3qNkuQRkf6iRTwGg0PjeVB4wESSLgBZ5LbJomp4w51eQxeL9kjlpB_xqSe-I18X52nGCGp8rBF29SLs9ol24w7YiLUj0ntwljo7rBFTpIxGXBV3BGURjc8eM1Q89c3OINyjMSTjSMDXd0s?purpose=inline)

The Mists, domains, and Darklords

The world structure should support isolated domains, distinctive local rules, domain-specific supernatural threats, and Darklords whose histories shape their territories. Travel and escape should remain narrative challenges rather than routine teleportation mechanics.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.dungeonsanddragons.com\&sz=32)

Dungeons & Dragons

+1



## 7. Decisions required before development

This is the most important stage. The choices below will affect almost every subsequent rule, so I recommend deciding them before we produce the full configuration.

## Project direction questionnaire

Choose the options that best reflect your intended server. These are proposals to guide development, not rules already established.

1\. Which D&D rules edition should be the primary reference?

D&D 5e / 2024 rules, using Ravenloft lore

Classic Ravenloft rules and older editions

A curated hybrid: Ravenloft lore, modern D&D design, and RPR-compatible mechanics

2\. What kind of campaign world are we building?

Barovia-centered campaign inspired by Curse of Strahd

A broader Domains of Dread setting with multiple domains

An original domain within Ravenloft, with selected canonical elements

3\. How powerful should player characters be at creation?

Low power: ordinary people, investigators, survivors, and hunters

Heroic: capable adventurers with room to grow

High power: established adventurers and frequent supernatural abilities

4\. How should magic work?

Rare, dangerous, socially feared, and tightly controlled

Available to specialist characters, with meaningful costs and limitations

Broad D&D-style spellcasting, adapted to RPR

5\. What horror intensity should the rules support?

Atmospheric gothic horror; character agency takes priority

Balanced horror: fear, injuries, corruption, and consequential choices

Harsh survival horror: high risk, severe consequences, and scarce recovery

6\. How much should RPR automate?

Maximize automation, even if some rules must be simplified

Hybrid: automate supported mechanics and use clear procedures for the rest

Prioritize fidelity to D&D, accepting more manual adjudication

7\. How should character creation be balanced?

Fixed attribute and skill budgets for consistent starting power

Predefined class and background packages with limited customization

Fixed budgets plus class and background benefits

8\. What should the first release include?

Core system first: attributes, skills, combat, and character creation

Complete first release: core rules, classes, magic, horror, and supernatural options

Small playable prototype, followed by staged expansions

Additional requirements or restrictions (optional)

Submit project preferences

## 8. Acceptance criteria for the final system

Before calling the project complete, I recommend requiring all of the following:

- Every attribute, skill, perk, stat, spell, and status has a defined purpose.
- Character creation uses explicit point budgets and documented eligibility rules.
- No character build can gain unintended advantages by combining perks, modifiers, or classes.
- Combat, healing, opposed checks, and supernatural effects follow consistent resolution rules.
- Fear and corruption contribute to the Ravenloft experience without arbitrarily removing player agency.
- All proposed automation has been verified in the installed RPR version.
- Any rule that cannot be automated has a concise, standardized manual procedure.
- The final configuration is tested for parsing, record references, duplicate IDs, balance, and gameplay behavior.
- The documentation distinguishes official Ravenloft lore, adapted D&D mechanics, and original server rules.

Recommended next step: approve the project direction through the questionnaire above. After that, the first technical deliverable should be a verified RPR capability matrix and a proposed character creation and dice framework. Only then should we commit to the complete Ravenloft skill list, classes, spells, perks, and final configuration.

### Research references

- [Ravenloft — Forgotten Realms Wiki](https://forgottenrealms.fandom.com/wiki/Ravenloft?utm_source=chatgpt.com)
- [Ravenloft: The Horrors Within — Official D&D](https://www.dungeonsanddragons.com/ravenloft/?utm_source=chatgpt.com)
- [Welcome to Ravenloft: An Adventurer's Guide to the Domains of Dread](https://www.dndbeyond.com/posts/2143-welcome-to-ravenloft-an-adventurers-guide-to-the?utm_source=chatgpt.com)
- [Tot! Roleplay Redux — Mod overview](https://steamcommunity.com/sharedfiles/filedetails/?id=3036058836\&utm_source=chatgpt.com)
- [Roleplay Redux API documentation](https://github.com/Totchinuko/apiconan.totchinuko.fr/blob/master/roleplay.md?utm_source=chatgpt.com)