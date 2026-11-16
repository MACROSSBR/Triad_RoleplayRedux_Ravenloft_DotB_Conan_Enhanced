# Plano de Orquestração e Composição — Sistema D&D 5e × Ravenloft (DnD Ravenloft)
**Mod alvo:** `D:\SteamLibrary\steamapps\common\CEUE5Devkit\UE4\Content\Mods\Projetos`  
**DevKit:** Conan Exiles UE5 DevKit (UE 5.8.2-383024+++exiles+release), bpkit bridge conectado (PID 29576, validado 2026-11-13)  
**Escopo (Enhanced-only):** Sudo + Tot!Admin Scripting/FlowChart + Tot!Chat 2 + **RPR Embedded**.  
**Fora de escopo:** Tot!Custom, Decoration Handler, CrossMod Events, iHud, Codex.  
**Data:** 2026-11-13 · **Status:** draft acionável (Fase 0 bloqueadora; sem evidência runtime = não completo)

---

## 1. Consolidação da orquestração (agentes)

| Trilha | Agente/resultado | Artefato/saída | Situação |
|---|---|---|---|
| Composição técnica (FlowCharts/Blueprints) | Aggregator A — `deleg_70671b61/task-0` (concluído) | `C:\AI\PROJETOS\RPR\FlowChart_Composition_Blueprint.md` (blueprint técnico: arquitetura, convenções, catálogo SYS/CORE/DND/RVL/PROG/RPR, contratos-chave, dependências, passos DevKit, contornos RPR Embedded, pendências F0) | **Base de implementação** |
| Validação e QA | Aggregator B — `deleg_70671b61/task-1` (concluído) | Estrutura QA em chat (matriz rastreabilidade, checklist P1–P5, E2E por módulo/integrações, estrutural vs runtime, conformidade RPR Embedded, template evidência, lacunas). *Nota:* genérico em partes; consolidado/refinado neste plano. | **Base de validação** |
| Domínio/calibração D&D5e×Ravenloft | Especialista Creative — `deleg_d7fbb9c5/task-2` (concluído) | Recomendações priorizadas, parâmetros calibráveis (DC/custos/durações/limiares/economia), riscos/anti-abuso, critérios MVP/jogável/completo, gate F0 técnico | **Base de regras** |
| Tentativas anteriores (Coder) | `deleg_d7fbb9c5/task-0,1` | Falha: `HTTP 403: API key is not allowed to use model 'deepseek-v4.1-flash-1017'` | Reatribuídas/consolidadas |

**Regra de trabalho:** `Especialista (parâmetros/regras) → Compositor (FlowChart/node/defs) → Validador estrutural (harness .txt) → Validador runtime (DevKit/editor, evidência) → Aggregator (integra/congela/libera)`. Iterar por módulo; sem evidência runtime = `draft/não validado`.

---

## 2. Base verificada, restrições e contornos (obrigatório)

| Item | Estado |
|---|---|
| **ModsShared** | `D:\...\UE4\Content\ModsShared` (435). SudoExile, TotAdmin/FlowChart (`Tot_I_FlowChartManager/Node/NodeGUI/Stack/Variable/Array/Inspector/Field/FieldCallback`, DTs Nodes/Variables/Fields, helpers), TotChat2 presentes. |
| **RPR Embedded** | `RoleplayRedux\I_RP_DiceComponent.uasset`, `Dice\Config\RP_DT_Dice_Embedded_Config.uasset`, `Dice\Config\RP_S_Dice_Embedded_Config.uasset`. **Sem** `RP_I_RoleplayComponent` e **sem** `RP_E_OnRollDice/OnDiceResult`. |
| **Arquitetura** | `RPR = rolagem/dice + convenção` · `TotScripting = regras/estado/validação/orquestração` · `TotChat = I/O, comandos, feedback, auditoria`. |
| **Contorno: rolagem sem eventos** | Não há hook automático `OnRollDice/OnDiceResult` → acionar resolução explicitamente (comando TotChat / `RunFlowChart*` / `SpellEffect 2|13`) e registrar `RollResult` em estado/ledger. Wrapper `RPR_Roll` normaliza para CORE. |
| **Contorno: sem RoleplayComponent** | Contexto/alvo/placeholders/whispers/restrições de chat-RP não garantidos → modelar via params, TotChat e estado próprio; não assumir binding profundo de ficha. |
| **Ficha/efeitos** | Leitura/escrita de Stats/Skills/Perks/Spells/Statuses/Mutators sob Embedded = **gate F0**. Preferir estado canônico SYS/CORE (persistência validada) + espelhamento só se suportado. |
| **Geometria/tempo** | Zonas abstratas (Perto/Médio/Longe/Fora) e resolução por checkpoint preferidos no MVP; timers/DelayRun/zonas reais sujeitos a F0. |
| **Fonte da verdade** | Planos: `C:\AI\PROJETOS\RPR\Ravenloft_Plans_Site\` (cruzamento, apis-nodes, classes-progression, flows). Harness/visualizador `.txt`: `C:\AI\PROJETOS\RPR`. |

---

## 3. Arquitetura e convenções de composição (FlowCharts)

### 3.1 Módulos (prefixos)
| Módulo | Responsabilidade |
|---|---|
| **SYS** | Infra/utilitários: log/assert/lookup, persistência `StateSave/Load`, idempotência, tempo/formato, tipos/DTs/fields |
| **CORE** | Motor unificado: rolagem (d20/expr/adv-dis/DC/contest/save), estado/limiares, condições/efeitos/duração/stacking, recursos/custos/refresh, agendador/gatilhos, notify/audit |
| **DND** | Combate 5e abstrato: encontro, iniciativa/turnos, economia ação/mov/reação, ataque/dano/cura/temp HP, concentração, morte/saves, reações/AoO, espacial por zonas |
| **RVL** | Ravenloft: stress/medo/horror/sanidade/aflições, corrupção/dádivas/maldições, Brumas/domínio/atenção, rituais/backlash, investigação/presságios/descanso, traços/vulnerabilidades |
| **PROG** | Progressão: estado/ledger idempotente, marcos, level 1–10, grant de features, PP/PA/PT (can/spend/validate/retrain), recálculo derivado, audit |
| **RPR** | Wrappers/adaptadores: `RPR_Roll` via `I_RP_DiceComponent`, normalização, contexto (adaptado), espelhamento ficha (se F0 permitir) |
| **CMD/TotChat** | Comandos e feedback: `/combat /sanity /fear /ritual /level /progress /spend`, headers/templates, logs imersivos |

### 3.2 Convenções (congelar após F0/F1)
- **Formato `.txt`:** `<o>|Guid|...|Nodes|<a>|...|Vars|...|Data|...|<e>`; nós `GUID&...`; conexões `Port\TargetGUID\Pin` (`&pip;`), null `000...0`; Start `type 0`. SpellEffect: `2|13` = `FlowChart|<script GUID>|[var GUID]`.
- **GUIDs/nomes:** estáveis, namespace por módulo (ex. `SYS_LogTrace`, `CORE_CheckDC`, `RVL_FearCheck`, `PROG_AwardMilestone`).
- **Entrypoints:** `IsEntryPoint=true` por gatilho: `OnCommand`, `OnSpellEffect_2|13`, `OnTick/DelayRun`, `OnManual/Admin`, `OnScene/Rest/Checkpoint`.
- **Vars/Data/Scopes:** Vars tipadas; Data 1:1 com nós; escopos por ator/encontro/cena; estado durável **fora do stack**.
- **Idempotência:** chave `(char_id, source_id, action, tick/marco/scene_id)` para marcos, gastos, aplicação de efeitos/condições.
- **1 concentração/efeito sustentado forte por personagem**; stacking padrão = não acumula (renova/eleva se definido); teto de bônus situacional +2.
- **Auditoria:** toda mutação relevante gera log (trace/chat staff) com causa, rolagem, custo, resultado.

> Detalhe de contratos params/returns e lista expandida de nodes/FlowCharts: ver `FlowChart_Composition_Blueprint.md`.

---

## 4. Catálogo priorizado de FlowCharts e nodes (backlog de composição)

| Fase | FlowCharts/artefatos (prioridade) | Nodes-chave / entregáveis | Dependências |
|---|---|---|---|
| **F0 Gate (bloqueador)** | `F0_Ping`, `F0_Persist`, `F0_DiceRoll`, `F0_CommandDispatch`, `F0_ReentryDelay`, `F0_SpellEffect` | `SYS_LogTrace/Assert`, `SYS_StateSave/Load`, `SYS_IdempotencyGuard`, `RPR_Roll_Dice` (captura manual), `CMD_Dispatch` mínimo | DevKit + ModsShared + mod `Projetos` |
| **F1 Fundação** | `SYS_Core`, `SYS_LedgerBase`, defs/DTs | `SYS_TableLookup/GetNow/Format`; tipos (EntityRef, RollResult, Condition, Resource, Domain/Progress state); registro em `Tot_DT_FlowChartNodes/Variables/Fields` (conforme suporte) | F0 aprovado (mecanismo persistência/execução) |
| **F2 CORE** | `CORE_Roll`, `CORE_State`, `CORE_Condition`, `CORE_Resource`, `CORE_Scheduler`, `CORE_Notify` | `RollD20/RollExpression/CheckDC/Contest/SaveResolve`, `EntityGetSet/StatModify/Threshold`, `ConditionApplyRemove/Query/EffectApply/DurationTick`, `ResourceCheckSpendRestoreRefresh`, `Schedule/TriggerEval`, `Notify/AuditLog` | F1 |
| **F3 Integração** | `RPR_Bridge`, `CHAT_Bridge`, `FX_Orchestrator` | `RPR_Roll` wrapper, normalização, `Link_SpellEffect_2|13`, comandos `/combat /sanity /fear /ritual /level /progress /spend`, templates de mensagem | F2 |
| **F4 DND** | `DND_Combat`, `DND_Turn`, `DND_Resolve`, `DND_Reaction` | `CombatBeginEnd/RollInitiative/TurnNext/ActionBudget`, `AttackResolve/DamagePipeline/Heal/TempHP`, `ConcentrationCheck/DeathSave`, `ReactionWindow/OppAttack`, `SpatialQuery/CoverEval` (zonas) | F3 |
| **F5 RVL** | `RVL_SanityFear`, `RVL_CorruptionGiftCurse`, `RVL_DomainMist`, `RVL_Ritual`, `RVL_InvestigationRest` | `Stress/Fear/Horror/Save/Sanity/Threshold/Affliction`, `CorruptionStage/DarkGift(cost)/Curse(progress/cleanse)`, `DomainProfile/MistIntercept/BorderState/DarklordAttention`, `RitualBegin/Step/Resolve/SpellGate/Backlash`, `Investigation/Omen/RestResolve` | F3 |
| **F6 PROG** | `PROG_Ledger`, `PROG_LevelSpend`, `PROG_Class_Cacador|Inquisidor|Erudito|Medium|Guardiao|Errante` | `GetState/AwardMilestone(idempotent)/LevelUp/GrantPackage/CanSpend/Spend/ValidatePrereq/ApplyRetrain/RecalcDerived/AuditLog` | F3 |
| **F7 Dados/E2E** | Defs Barovia, mapa IDs RPR↔defs, composições/encadeamento, cenários cruzados | Catálogo data-driven: condições, efeitos, rituais (3–6 MVP), dádivas/maldições, domínios, 6 classes/features 1–10, balanceamento | F4–F6 |

---

## 5. Calibração de domínio (MVP, baixo poder — *todos os valores calibráveis*)

| Área | Parâmetros iniciais (ajustar em playtest) |
|---|---|
| **DC/Testes** | DC 8/10/13/15/18/20; situacional ±1 (±2 excepcional); vantagem/desvantagem 2d20 (não empilhar); crítico 20 nat = benefício menor; falha 1 nat = complicação se houver risco; teto bônus empilhado **+2**. |
| **Economia** | 1 Ação + 1 Movimento (zona Perto/Médio/Longe/Fora) + 1 Reação/rodada; bônus só por feature (raro); 1 concentração; durações em turno/cena/descanso; condições não acumulam por padrão. |
| **Recursos N1→N10** | Caçador Preparações 2→5; Inquisidor Convicção 2→5; Erudito Essência/Mana 3→6; Médium Sintonia 2→5; Guardião Vigília 2→5; Errante Fardo acumula (limiares 3/5/7, surto = pico curto + complicação). Recuperação: descanso longo seguro/rito/marco (precário recupera pouco). |
| **Horror RVL** | Stress 0–6 (3 Abalado, 5 Amedrontado, 6 exaustão/aflição temp.); Medo 0–2; Horror → teste DC 12–16; Sanidade 0–10 (7 marca, 4 aflição, 1 crise; recuperação ~1/arco/rito custoso); Corrupção 0–3 (estigma→complicação→crise). |
| **Brumas/Rituais** | Atenção 0–5 (2 presságio, 3 obstáculo, 4 ameaça, 5 manifestação); +1 por magia/ritual visível, dádiva, profanação, confronto, surto. Ritual menor 10min/DC12, maior 1+cena/DC15, proibido DC18. Backlash d6: stress / sanidade-1 / corrupção+marca / atenção+1 / componente perdido ou parcial / complicação severa. Custo múltiplo: tempo+componente+teste+preço. |
| **Progressão** | Nível 1–10 por marco + elegibilidade; PP 1–2/sessão, 2–3/marco menor (4→8 acumulado p/ avançar); PA 1/nível (opção 1–2); ganho 1x/fonte/cena-dia; retrain 1/marco; ledger idempotente `{char_id, source_id, tipo, valor, motivo, ts, autor}`. Sem farm/grind. |
| **Classes (identidade)** | Caçador=preparo/tático situacional; Inquisidor=convicção/ritos menores (não cura massiva); Erudito=ritual-first, risco sanidade/corrupção; Médium=presságios simbólicos/custo; Guardião=proteção localizada/âncora; Errante=poder instável com preço obrigatório. Capstones raros, alto risco/custo/gate. |

---

## 6. Plano de validação e QA

### 6.1 Matriz de rastreabilidade (template — preencher por entrega)
| ID | Requisito/Plano (fonte) | Módulo/FlowChart/Node (GUID) / Asset | Critério de aceite | Método (estrutural / runtime / E2E) | Evidência | Status |
|---|---|---|---|---|---|---|
| RT-CORE-001 | ex: rolagem d20+DC (`apis-nodes`, CORE) | `CORE_RollD20` / `CORE_CheckDC` | Resultado e margem corretos; adv/dis ok | estrutural `.txt` + runtime DevKit | log/screenshot | draft |

### 6.2 Checklist Fase 0 — gates P1–P5 (experimentos no DevKit, mod `Projetos`)
| Gate | Experimento | Aceite | Evidência |
|---|---|---|---|
| **P1 Persistência durável** | `F0_Persist`: gravar/ler estado+ledger por `char_id/key`; recarregar sessão/editor se aplicável; idempotência por `source_id` | Valor persiste e é consistente; duplicata não reaplica | log antes/depois |
| **P2 Eventos/gatilhos/zones** | `F0_CommandDispatch` (TotChat→script), `F0_SpellEffect` (2|13), `F0_ReentryDelay` (DelayRun/tick); probe de zona se disponível | Disparo reproduzível; fallback checkpoint definido se instável | comando/script/GUID/resultado |
| **P3 Rolagem RPR Embedded** | `F0_DiceRoll`: rolar via `I_RP_DiceComponent`+config; capturar/normalizar `RollResult` sem eventos RC | Resultado utilizável por CORE ou limitação documentada com contorno | saída roll + log |
| **P4 Ficha/efeitos** | Escrever/ler estado equivalente (recurso/condição) e testar espelho Stats/Statuses/Mutators/Perks se exposto | Mecanismo definido (estado próprio e/ou espelho suportado) | leitura/escrita observada |
| **P5 Concorrência/reentrada/chat** | Disparos simultâneos, guards idempotentes, DelayRun reentrante; ranges/permissões/alcance TotChat | Sem corrupção/duplicação; comportamento de chat conhecido | logs concorrentes |

### 6.3 Casos E2E mínimos por módulo/integração
| Módulo | Cenários E2E |
|---|---|
| **CORE** | d20 adv/dis, expr XdY, DC/save/contest; condição apply/remove/query + duração/expiração + não-stacking; recurso check/spend/refresh; agendador/tick; notify/audit. |
| **DND** | Iniciativa→ordem→turnos/budget; ataque vs defesa, dano/crit menor, cura/temp HP; concentração sob dano; 0 PV/death save; reação/AoO (limitada); zonas. |
| **RVL** | Gatilho horror→save medo→stress/sanidade/aflição; corrupção estágio↑ e dádiva com preço; maldição aplicar→progredir→aliviar; ritual (requisito→canalização→sucesso/falha→backlash+atenção); Brumas/atenção; descanso seguro vs precário. |
| **PROG** | `/progress` leitura; marco idempotente→`/level` elegível→grant; `/spend` PP/PA/PT com prereq/gate/saldo; retrain restrito; recálculo derivado; auditoria. |
| **Integrações** | `RPR_Roll` wrapper; TotChat comando→dispatch→feedback; `SpellEffect 2|13` round-trip; ausência de dependência de `RP_I_RoleplayComponent`/eventos RC. |
| **Cruzado (piloto)** | Combate sob medo/Brumas; concentração+saves de sanidade; ritual em risco com atenção/backlash; marco→level→spend em sessão. |

### 6.4 Estratégia estrutural vs runtime
- **Estrutural (contínuo, a cada `.txt`):** harness/visualizador `C:\AI\PROJETOS\RPR` + `test_flowchart_import.py` quando aplicável — Start type 0, GUIDs únicos/referências resolvidas, conexões válidas, Data↔Nodes alinhado, Vars/entrypoints, seções toleradas, round-trip.
- **Runtime (DevKit/editor, evidência):** importar/executar no Tot!Admin Scripting do `Projetos`, `RunFlowChart*`, `SpellEffect 2|13`, comandos TotChat, DelayRun, persistência observada; cenários E2E. Sem runtime = não “completo”.
- **Conformidade RPR Embedded:** uso exclusivo de `I_RP_DiceComponent`+config; zero dependência de RoleplayComponent/eventos RC; adaptações documentadas; integrações de ficha só após gate F0.

### 6.5 Template de evidência/log
`DataHora | Fase/Módulo | FlowChart/Node(GUID)/Asset | Requisito(ID) | Método (estrutural/runtime/E2E) | Passos | Esperado | Observado | Status (pass/fail/blocked/draft) | Evidência (path/log/screenshot) | Desvio/ação | Responsável`

---

## 7. Passos concretos para iniciar composição no DevKit (execução imediata)

1. **Preparar workspace de composição (Compositor):**
   - Criar estrutura: `C:\AI\PROJETOS\RPR\FlowCharts\Projetos\{F0,F1,...}\`, `defs\`, `evidence\`, `manifest_guid.json`.
   - Definir convenção inicial de GUIDs/entrypoints (provisória até F0/F1).
2. **F0 spikes no `Mods/Projetos` (Compositor, em Tot!Admin Scripting):**
   - `F0_Ping`: Start→Log/Notify; validar execução por `RunFlowChart*` e por `SpellEffect 2|13`.
   - `F0_Persist`: `SYS_StateSave/Load` com candidato (CharVars/Sudo/vars acessíveis); teste de releitura + idempotência.
   - `F0_DiceRoll`: rolagem `I_RP_DiceComponent` + captura/normalização manual.
   - `F0_CommandDispatch`: TotChat comando → script → feedback.
   - `F0_ReentryDelay`: DelayRun/reentrada + guard concorrência.
3. **Validação paralela (QA):** cada spike → estrutural (harness) + runtime (DevKit) + registro no template de evidência; atualizar matriz/gates P1–P5.
4. **Calibração aplicada (Especialista→Compositor):** congelar parâmetros MVP (DC, pools N1, Stress/Sanidade/Corrupção/Atenção, backlash, custos rituais) como defs data-driven versionadas.
5. **Gate F0 → F1:** se P1–P5 atendidos/contornados e documentados, congelar convenções e iniciar `SYS_Core`/ledger/tipos; caso contrário, ajustar arquitetura ao fallback (ex. checkpoint-only, estado próprio) e reprovar escala.
6. **Integração contínua (Aggregator):** consolidar evidências, resolver conflitos blueprint↔QA↔domínio, liberar próximo módulo na ordem `SYS→CORE→Integração→(DND,RVL,PROG paralelo)→Dados/E2E`.

---

## 8. Critérios de “sistema completo/jogável” e definição de pronto

**MVP jogável (piloto Barovia):** F0 aprovado; 6 classes selecionáveis com recursos iniciais; d20/mod/vant-desv/DC contest/save logados (RPR+Chat); combate abstrato funcional (iniciativa, turnos, economia, ataque/dano, ≥3 condições, 0 PV/saves morte); Stress+Medo + 1 trilha longa (Sanidade ou Corrupção) com limiares; recursos/refresh corretos; 3–6 rituais com custo/backlash/atenção; `/progress /spend /level` com ledger idempotente; persistência/auditoria; evidência runtime.

**Completo:** features 1–10 + arquétipos das 6 classes; RVL integrado (sanidade/stress/medo/horror/corrupção/dádivas/maldições/atenção/investigação/presságios/descanso); catálogo data-driven consistente; economia sem loops/farm e magia rara/cara; tooling/logs staff; E2E cruzados aprovados; docs alinhadas.

**Qualitativo (horror gótico, baixo poder):** escolhas custosas, magia com peso, mistério preservado, sobrevivência frágil, legibilidade das consequências.

**Definição de pronto por entrega:** requisito rastreado → script/node/def implementado → estrutural OK → runtime OK com evidência → sem dependência fora de escopo/RPR não-Embedded → parâmetros marcados calibráveis/documentados.

---

## 9. Riscos, pendências e lacunas (não inventar evidência)

| Risco/pendência | Impacto | Mitigação |
|---|---|---|
| P1 Persistência durável inacessível/inconsistente | Bloqueia ledger, sanidade, corrupção, progressão | F0 spike + fallback (mecanismo alternativo suportado); idempotência/transações lógicas. |
| P2 Eventos/timers/zones limitados | Gatilhos automáticos/Brumas/reações frágeis | Preferir checkpoint/comando/SpellEffect; timers só se estáveis. |
| P3 Rolagem Embedded sem captura rica | Automação de checks limitada | Resolução explícita + `RollResult` registrado; sem depender de eventos RC. |
| P4 Ficha/Stats/Perks/Mutators indisponíveis | Integração profunda RPR limitada | Estado canônico em SYS/CORE; espelho opcional se suportado. |
| P5 Concorrência/chat | Corrupção de estado, UX inconsistente | Guards idempotentes, locks lógicos por char, canais/headers padronizados. |
| Calibração/power creep | Quebra de tom e balanceamento | Teto bônus, recursos escassos, custos múltiplos, revisão por playtest. |
| Evidência runtime ausente | “Completo” não comprovável | Gate obrigatório por módulo/fase. |

**Artefatos de referência:** `FlowChart_Composition_Blueprint.md` (composição) · `Ravenloft_Plans_Site\*` (planos) · `C:\AI\PROJETOS\RPR` (scripts/harness existentes) · este plano (orquestração/QA/início).
