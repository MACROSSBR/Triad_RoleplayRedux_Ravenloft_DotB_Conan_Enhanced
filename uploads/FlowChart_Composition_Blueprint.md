# FlowCharts/Blueprints Composition Logic — D&D 5e × Ravenloft Core
## Technical Blueprint (pt-BR) — Mod `Projetos` / Conan Exiles UE5 Devkit

**Status**: Draft — Fase 0 pendências não validadas  
**Base**: Documentos em `C:\AI\PROJETOS\RPR\` e `C:\Users\macro\Desktop\Ravenloft_Plans_Site\`  
**Escopo**: Enhanced-only (TotScripting + RPR + TotChat), sem APIs legadas  
**Referência**: Roadmap Fase 0–7, catálogo de nodes, capacidades auditadas

---

## 1. Arquitetura de Scripts/Orquestradores

A arquitetura segue o modelo **FlowChartManager → FlowChartNode → Stack → Variable/Array** do TotScripting Enhanced, com integração direta a RPR e TotChat.

### 1.1 Camadas

| Camada | Prefixo | Responsabilidade |
|--------|---------|------------------|
| **Infra** | `SYS_*` | Utilitários, lookup, idempotência, persistência de state, DTs base |
| **Motor Unificado** | `CORE_*` | Rolagem (d20, expressões), estado, condições, recursos, agendador, notificação |
| **Combate D&D 5e** | `DND_*` | Economia de encontro, iniciativa, turnos, ação/bonus/reação/movimento, dano/cura/condições, morte, concentração, reações, espaço abstrato |
| **Ravenloft** | `RVL_*` | Sanidade/medo/horror, corrupção/dádivas/maldições, perfis de domínio, brumas, rituais, investigação |
| **Progressão** | `PROG_*` | Ledger de nível/marcos, concessão e gasto, validação de prerequisitos, recálculo derivado |
| **Integração** | `RPR_*` | Bindings RPR↔FlowChart, roll wrappers, apply buff/modifier, set status/mutator, link effect |
| **Chat** | `TotChat_*` | Comandos (/combat, /sanity, /fear, /ritual, /level), headers, canais, alcance/idioma |

### 1.2 Orchestrator Flow

```
[Player Action] → TotChat Command (/combat, /roll, /fear, etc.)
        ↓
[TotChat Handler] → CORE_RollD20/RollExpression (d20+mod vs DC)
        ↓
[CORE_CheckDC / Contest] → Result (success/failure/critical)
        ↓
[RVL_FearCheck / SanityCheck] → Horror stress/corruption apply
        ↓
[CORE_ConditionApply/EffectApply] → Status/Mutator apply
        ↓
[RPR_ApplyBuff/SetStatus] → Ficha/RPR update
        ↓
[TotChat SendMessage] → Feedback imersivo
```

---

## 2. Convenções (GUID, entrypoints, Vars/Data/Scopes, idempotência)

### 2.1 GUIDs

- **Formato**: `<modulo>_<tipo>_<descricao_curta>` — ex: `RVL_FearCheck`, `DND_CombatBegin`, `CORE_RollD20`
- **Escopo**: Global dentro do servidor/instance; único por tipo de nó
- **Registry**: Cada módulo mantém seu próprio namespace; conflitos são evitados pelo prefixo
- **Durabilidade**: GUIDs são atribuídos na autoria e não mudam entre sessões

### 2.2 Entrypoints (Entry Points)

Cada FlowChart deve ter exatamente **um entrypoint definido**, identificado pelo campo `IsEntryPoint = true` no node `Tot_DT_FlowChartNode`.

| Entrypoint | Descrição | Módulo típico |
|------------|-----------|---------------|
| `BeginCharacterCreation` | Início do fluxo de criação de personagem | `PROG_` |
| `CombatStart` | Início de encontro de combate | `DND_` |
| `RVL_FearTrigger` | Gatilho de horror/sanidade | `RVL_` |
| `RPR_RollDice` | Rogada de dado via RPR | `RPR_` |
| `TotChat_Command` | Processamento de comando chat | `TotChat_` |

### 2.3 Variáveis (Vars), Dados (Data), Scopes

| Tipo | Campo | Padrão | Observação |
|------|-------|--------|----------|
| **Variable** | `id` | GUID único | Chave de lookup |
| | `name` | String descritiva | Ex: `current_sanity` |
| | `type` | String | `int`, `float`, `d20result`, `condition`, `roll` |
| | `value` | Variável | Valor atual |
| | `min/max` | Limites | Para attrs/skills |
| **Data** | `def` | Definição data-driven | Referência a table/def |
| | `source` | `ancestry\|class\|background\|optional\|progression` | Origem do grant |
| | `stackable` | `true\|false` | Política de stacking |
| **Scope** | `encounter` | Vigência de encontro | Volátil, reset por novo encontro |
| | `session` | Persistência de sessão | Duradouro via Sudo/GlobVars |
| | `character` | Estado da ficha | Persistente por personagem |

### 2.4 Idempotência

- **Regra**: A mesma operação aplicada múltiplas vezes deve produzir o **mesmo estado final**.
- **Implementação**: `SYS_IdempotencyGuard` usa `grant_id + actor_id` como chave; verifica `already_applied` antes de aplicar efeito.
- **Contexto**: Essencial para character creation (mudar ancestry/class não deixa "resíduos" de bônus anteriores) e para stacking de mutators/perks.
- **Violação**: Se dois nodes tentarem aplicar o mesmo grant sem guard, o comportamento é indefinido (duplicate benefit bug).

---

## 3. Prioritized List: FlowCharts e Nodes Customizados por Módulo

### 3.1 Módulo SYS (Utilitários / Infra)

**FlowCharts prioritários**:
1. `SYS_CharacterCreation` — orchestration completa da criação de personagem (ancestry → class → background → optional → allocate → validate → save)
2. `SYS_IdempotencyGuard` — guarda contra aplicação duplicada de grants
3. `SYS_StateLoadSave` — load/save de estado de personagem entre sessões

**Nodes principais**:
- `SYS_LogTrace` — logging estruturado
- `SYS_Assert` — validação de pré-condição
- `SYS_TableLookup` — lookup em tabelas data-driven
- `SYS_IdempotencyGuard` — check before apply
- `SYS_GetNow/Format` — timestamp/formatação

---

### 3.2 Módulo CORE (Motor Unificado)

**FlowCharts prioritários**:
1. `CORE_CombatEngine` — motor de combate D&D 5e (iniciativa → turnos → economia → fim de encontro)
2. `CORE_ResourceManager` — gerenciamento de recursos (slots/cargas, refresh por descanso/marco)
3. `CORE_Scheduler` — agendador de ticks, durações, expiração, reentrada controlada

**Nodes principais**:
- `CORE_RollD20` — rolagem d20 + mods vs DC
- `CORE_RollExpression` — rolagem XdY + mods
- `CORE_CheckDC` — teste contra dificuldade
- `CORE_Contest` — contest de dois rolls
- `CORE_SaveResolve` — save/throw resolution
- `StatModify/Threshold` — modificar atributo/threshold
- `ConditionApply/EffectApply/DurationTick` — aplicar remover condições, tick de duração
- `ResourceCheckSpend` — check e spend de recurso
- `Schedule/TriggerEval` — avaliação de trigger/timer
- `Notify/AuditLog` — notificação e log de auditoria

---

### 3.3 Módulo DND (Combate D&D 5e)

**FlowCharts prioritários**:
1. `DND_CombatBegin` — início de combate (rolar iniciativa, setup de turnos)
2. `DND_TurnSystem` — system de turnos (actor → budget ação/bônus/reação/mov → próximo)
3. `DND_ActionResolve` — resolução de ação (ataque, utilitário, pronto)
4. `DND_CombatEnd` — fim de combate (limpeza, log, ganho de XP/flags)

**Nodes principais**:
- `DND_CombatBegin/End` — setup/limpeza de encontro
- `RollInitiative/TurnNext` — rolar iniciativa, próximo ator
- `ActionBudget` — verificar budget de ação disponível
- `AttackResolve/DamagePipeline/Heal` — ataque → checkDC/AC → dano/cura/condição
- `Concentration` — verificar concentração de magias
- `DeathSave` — saves de morte
- `ReactionWindow/OppAttack` — reações, ataques de oportunidade
- `SpatialQuery/CoverEval` — query de espaço, cobertura

---

### 3.4 Módulo RVL (Ravenloft)

**FlowCharts prioritários** (Fase 0 — não validadas):
1. `RVL_SanityStress` — checks de sanidade/estresse, escalada de consequências
2. `RVL_FearCheck` — gatilho de horror, save vs fear, aplicação de aflição
3. `RVL_CorruptionDarkGift` — sistema de dádivas sombrias, corrupção, custos e obrigações
4. `RVL_RitualMagic` — canalização de rituais, validade de requisitos, backlash
5. `RVL_DomainProfile` — perfil de domínio, brumas, fronteira, atenção do darklord

**Nodes principais**:
- `RVL_Sanity/Stress/Fear/Horror/Affliction` — mecânicas de sanidade e medo
- `CorruptionStage/DarkGift/Curse` — estágios de corrupção, dádivas, maldições
- `DomainProfile/MistIntercept/BorderState` — propriedades do domínio, intercept brumas, estado fronteira
- `RitualBeginStepResolve/SpellGate/Backlash` — início de ritual, gate deSpell, backlash on failure
- `Investigation/Omen/RestResolve` — investigação, presságios, resolução de descanso

---

### 3.5 Módulo PROG (Progressão / Leveling)

**FlowCharts prioritários**:
1. `PROG_GetState` — obter estado atual de progressão (nível, marcos, pontos gastos)
2. `PROG_AwardMilestone` — concessão de marco após encounter/sessão
3. `PROG_LevelUp` — level up completo (grant package, recálculo derivado)
4. `PROG_ValidatePrereq/RecalcDerived` — validar prerequisitos, recalcular stats derivados
5. `PROG_AuditLog` — log de auditoria de mudanças de progression

**Nodes principais**:
- `PROG_GetState/AwardMilestone/LevelUp/GrantPackage/CanSpend/Spend/ValidatePrereq/RecalcDerived/AuditLog`

---

### 3.6 Módulo RPR (Integração Roleplay Redux)

**FlowCharts prioritários**:
1. `RPR_ApplyBuffModifier` — aplicar modifier de buff via RPR
2. `RPR_SetStatusOrStat` — set de status ou stat no ficha RPR
3. `RPR_RollSkillStatD20` — wrapper unificado para rolagem de skill/stat d20
4. `RPR_LinkFlowChartEffect` — linking effect RPR↔FlowChart GUID
5. `RPR_GetContext/Target` — obter contexto e target do ator

**Nodes principais**:
- `RPR_GetContext/Target` — contexto/alvo do actor
- `RollSkillStatD20` — wrapper para RP_I_DiceComponent roll
- `ApplyBuffModifier` — aplicar modifier de buff
- `SetStatusMutatorStat` — set status/mutator/stat
- `LinkFlowChartEffect` — linker effect RPR↔FlowChart

---

### 3.7 Módulo TotChat (Comandos de Chat)

**FlowCharts prioritários**:
1. `TotChat_CombatCommands` — processamento de comandos /combat, /initiative, /turn
2. `TotChat_SanityFear` — comandos /sanity, /fear, /horror
3. `TotChat_Ritual` — comando /ritual
4. `TotChat_LevelProgress` — comando /level, /progress, /spend

**Nodes principais**:
- `ChatServer.SendMessage/ExecuteCommand` — envio de mensagem, execução de comando
- `ChatUser.SendMessageAsUser` — mensagem como personagem
- `ChatChannel` — conect, observers, ranged/cache
- `ChatToolbox.ParseText/bolhas` — parsing de texto, bolhas de feedback

---

## 4. Contratos: Params / Returns dos Nodes-Chave

### 4.1 CORE_RollD20

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `expr` | `string` | Expressão de rolagem (ex: `1d20 + 3`) |
| `adv` | `bool` | Advanteagem (se true, rola 2d20 keep high) |
| `dis` | `bool` | Desvantagem (se true, rola 2d20 keep low) |
| `target` | `string` | Alvo opcional (para contested rolls) |
| `source` | `string` | Fonte do roll (para logging) |

**Returns**:
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `success` | `bool` | Se o roll atingiu o alvo (vs DC) |
| `result` | `int` | Total do roll (1d20 + mods) |
| `nat_result` | `int` | Resultado natural do d20 (antes de mods) |
| `critical` | `bool` | Se foi crítico (nat 20) ou falha (nat 1) |
| `overflow` | `int` | Bônus overflow (se houver) |
| `message` | `string` | Mensagem de feedback para chat |

---

### 4.2 CORE_CheckDC

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `roll_result` | `int` | Resultado da rolagem (output de CORE_RollD20) |
| `dc` | `int` | Difficulty Class |
| `automatic` | `bool` | Se é automático (sem rolagem) |

**Returns**:
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `success` | `bool` | Se o roll >= DC |
| `margin` | `int` | Margin of success/failure (result - DC) |
| `degree` | `string` | `success`, `fail`, `critical_success`, `critical_fail` |

---

### 4.3 CORE_SaveResolve

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `target` | `string` | Actor identifier |
| `save_type` | `string` | Tipo de save (fort/ref/will) ou `rvl_fear/rvl_sanity` |
| `dc` | `int` | Difficulty Class |
| `modifiers` | `array` | Modificadores adicionais |

**Returns**:
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `success` | `bool` | Se o save passou |
| `result` | `int` | Total do roll + mods |
| `effects` | `array` | Efeitos aplicados em sucesso/falha |

---

### 4.4 RVL_FearCheck

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `target` | `string` | Actor identifier |
| `intensity` | `float` | Intensidade do horror (0.0 a 1.0) |
| `source` | `string` | Fonte do medo (domínio, criatura, evento) |

**Returns**:
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `passed` | `bool` | Se o ator resistiu (save vs fear) |
| `stress` | `float` | Quantidade de stress aplicada se falhou |
| `sanity_loss` | `float` | Perda de sanidade se falhou |
| `condition_applied` | `string` | Condição aplicada (frightened, shaken, etc.) |
| `message` | `string` | Mensagem de feedback |

---

### 4.5 RVL_CorruptionDarkGift

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `target` | `string` | Actor identifier |
| `gift_type` | `string` | Tipo da dádiva (dark gift) |
| `cost` | `string` | Custo (corruption points, narrative obligation, etc.) |
| `approval` | `bool` | Se requires admin approval |

**Returns**:
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `granted` | `bool` | Se a dádiva foi concedida |
| `corruption` | `int` | Novo nível de corrupção |
| `obligation` | `string` | Obrigação/narrativa associada |
| `side_effects` | `array` | Efeitos colaterais (mecânicos/narrativos) |

---

### 4.6 DND_CombatBegin

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `actors` | `array` | Lista de atores no encontro |
| `environment` | `string` | Ambiente/condições do encontro |
| `setup_rounds` | `int` | Rodadas de setup opcionais |

**Returns**:
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `init_order` | `array` | Ordem de iniciativa (sorted by result) |
| `round` | `int` | Rodada atual (starts at 1) |
| `budget` | `object` | Budget de ação/bônus/reação/movimento por ator |

---

### 4.7 PROG_AwardMilestone

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `target` | `string` | Actor identifier |
| `milestone_type` | `string` | Tipo de marco (combat, story, ritual, etc.) |
| `award` | `object` | Pacote de concessão (pts, features, etc.) |

**Returns**:
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `granted` | `bool` | Se o marco foi concedido |
| `level` | `int` | Novo nível do personagem |
| `spent` | `int` | Pts gastos desta concessão |
| `remaining` | `int` | Pts restantes para gastar |

---

### 4.8 RPR_RollSkillStatD20

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `actor` | `string` | Actor identifier |
| `skill_or_stat` | `string` | ID de skill ou stat (ex: `perception`, `body`) |
| `adv` | `bool` | Advanteagem |
| `dis` | `bool` | Desvantagem |

**Returns**:
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `success` | `bool` | Se o roll passou vs guidance DC |
| `result` | `int` | Total do roll (1d20 + modifier) |
| `nat_result` | `int` | Resultado natural |
| `critical` | `bool` | Crítico/falha natural |
| `message` | `string` | Mensagem de feedback chat |

---

## 5. Dependências

### 5.1 Dependências entre módulos

| Dependência | De → Para | Descrição |
|-------------|-----------|-----------|
| `RPR_ApplyBuff/SetStatus → CORE_ConditionEffect` | RPR → CORE | RPR usa contratos CORE para aplicar conditions/effects |
| `DND_Combat → RVL_FearCheck` | DND → RVL | Combate pode trigger fear/horror checks |
| `RVL_Corruption → PROG_LevelUp` | RVL → PROG | Corrupção/dádivas afetam progressão/leveling |
| `CORE_Resource → RPR_SetStatusMutatorStat` | CORE → RPR | Resource spend pode modificar status/stat RPR |
| `TotChat_Command → CORE_RollD20` | TotChat → CORE | Comandos chat iniciam rolagens |
| `CORE_Scheduler → RVL_RitualMagic` | CORE → RVL | Scheduler controla ticks de ritual |
| `PROG_AwardMilestone → CORE_Resource` | PROG → CORE | Marcos concedem recursos |

### 5.2 Dependências de arquivos / GUIDs

- Cada node deve ter seu GUID registrado em `Tot_DT_FlowChartNode` com `IsEntryPoint` marcado corretamente
- Conflitos de GUID bloqueiam a carga do FlowChart; registry central evita isso
- `SpellEffect 2|13` format must maintain round-trip validade entre FlowChart ↔ RPR defs

---

## 6. Passos Concretos de Composição no DevKit

### 6.1 Pipeline de Criação de Novo FlowChart

1. **Definir o objetivo** — qual problema o FlowChart resolve (combate, criação, horror, etc.)
2. **Identificar entrypoint** — qual node será o ponto de início (`IsEntryPoint = true`)
3. **Selecionar nodes necessários** — do catálogo pelo prefixo correspondente (SYS/CORE/DND/RVL/PROG/RPR)
4. **Conectar pins** — `Port\TargetGUID\Pin` connections; validar que cada pin tem tipo compatível
5. **Definir Vars/Data/Scopes** — declarar variáveis necessárias com tipos e limites
6. **Inserir IdempotencyGuard** — onde houver risco de apply duplicado
7. **Validar SpellEffect 2|13** — se houver magia/efeito, verificar formato de SpellEffect
8. **Testar no DevKit** — executar flow, verificar logs e comportamento
9. **Documentar contrato** — params/returns no catálogo de nodes
10. **Marcar Fase 0** — se ainda não validado, anotar como pendência

### 6.2 Criação de Novo Node Customizado

1. **Definir o tipo** — `Tot_DT_FlowChartNode` com prefixo módulo (SYS/CORE/DND/RVL/PROG/RPR)
2. **Implementar interface** — OnEnter/Next/DataChanged/Execute, params/returns, Link, IsEntryPoint
3. **Registrar no catálogo** — `Tot_DT_FlowChartNodes` com descrição e contrato
4. **Definir variáveis/data** — fields no Inspector para expressão de dado, atributo/save, tipo de dano, condição/estágio, recurso, perfil de domínio
5. **Testar isoladamente** — executar node único com inputs conhecidos
6. **Integrar ao FlowChart** — conectar ao flow correspondente
7. **Verificar idempotência** — garantir que aplicar twice = same result
8. **Documentar** — adicionar ao apis-nodes.html catalog

---

## 7. Contornos para RPR Embedded (dice-only, sem RoleplayComponent/eventos)

Quando o RPR operar em modo **dice-only** (sem `RP_I_RoleplayComponent` e sem eventos `OnRollDice/OnDiceResult`):

### 7.1 Fluxo alternativo

```
[Roll Request] → RPR_DiceComponent (RP_I_DiceComponent) → resultado cru → FlowChart consume
```

### 7.2 Nodes adaptados

| Node | Modo Normal | Modo Embedded (dice-only) |
|------|-------------|--------------------------|
| `RPR_RollSkillStatD20` | Usa RP_I_DiceComponent + RP_E_OnRollDice + RP_E_OnDiceResult | Apenas RP_I_DiceComponent roll; consumer trata resultado via params/returns |
| `RPR_ApplyBuffModifier` | Pode usar placeholders e consumo via RoleplayComponent | Aplica modifier puro no stat result; consumo manual ou via TotChat command |
| `RPR_SetStatusOrStat` | Set via ficha RPR com contexto/alvo | Set direto no stat/condition da ficha; sem placeholders narrativos |
| `RPR_GetContext/Target` | Contexto completo (target, ownership, restrições) | Apenas ID do actor; contexto narrativo resolvido fora do fluxo |

### 7.3 Contratos ajustados

- **Params**: remover campos que dependem de `RP_I_RoleplayComponent` (whispers, placeholders, target/ownership restrições)
- **Returns**: foco apenas no resultado numérico e modifiers; informações narrativas via TotChat separadamente
- **Idempotência**: ainda necessária para evitar apply duplicado de modifiers/conditions

---

## 8. Pendências Fase 0 — Não Validadas

Estas são as lacunas identificadas que bloqueiam a validação de contratos e devem ser resolvidas antes de Fase 1:

| Lacuna | Impacto | Passo de Validação |
|--------|---------|-------------------|
| Persistência durável (além de stack/refs) | Sanidade, corrupção, maldições, dádivas, ledger de nível não persistem além do stack/refs atuais | Validar CharVars/Sudo/GlobVars ou componente de armazenamento acessível de scripts |
| Inscrição em eventos e zones | OnRollDice/Result, Brumas/zona, ações reativas — bind/observação suportada vs fluxo síncrono/comando/polling | Testar bind no DevKit/RPR; definir se usa polling ou event binding nativo |
| Semântica de rolagem RPR | Adv/dis, XdY, críticos, payload de eventos — retorno/controle de `RP_I_DiceComponent` e acumuladores | Validar exatamente quais mods são suportados (adv/dis, críticos nat 1/20, contest) |
| Leitura/escrita de ficha | Aplicar HP/Sanidade/Status/Mutator/Perk — APIs exatas no runtime instalado e comportamento de stacking | Testar cada write em personagem real no DevKit; verificar se stacking é add ou replace |
| Concorrência/reentrada | Ticks, reações, múltiplos scripts por ator — retentive/enrolled/async simultâneo; necessidade de guards/fila | Testar múltiplos FlowCharts rodando simultâneamente no mesmo ator; verificar race conditions |
| Chat alcance/permissão | Feedback imersivo e comandos restritos — ranges/locks/permissões/canais dedicated | Validar ranges e permissões de comandos (/combat, /sanity, etc.) no TotChat Enhanced |

**Status**: Todas as lacunas acima devem ser marcadas como **não validadas** até que seja realizada a verificação no DevKit/RPR instalado. Nenhum contrato de node deve ser considerado "definitivo" até que estas sejam resolvidas.

---

## 9. Alinhamento aos Planos e Fluxos Existentes

### 9.1 Roadmap Fase a Fase — Conformidade

| Fase | Status | Alinhamento |
|------|--------|-------------|
| **Fase 0** | ⚠️ Não validada — lacunas críticas | Verificar todas as lacunas listadas antes de prosseguir; marcar contratos como "provisionais" |
| **Fase 1** | ⏳ Pending — após validação Fase 0 | Implementar `SYS_*` tipos/fields, `StateLoad/Save`, `idempotência`, audit — forms base para todos os outros módulos |
| **Fase 2** | ⏳ Pending — após Fase 1 | Implementar motor CORE: rolagem/testes, estado, condições/duração/recursos, agendador, notify |
| **Fase 3** | ⏳ Pending | Integrar bindings RPR_* e comandos TotChat; validar SpellEffect 2|13 round-trip |
| **Fase 4** | ⏳ Pending | Implementar D&D 5e núcleo: iniciativa/turno, ataque/dano/saves, condições/concentração |
| **Fase 5** | ⏳ Pending | Implementar Ravenloft núcleo: sanidade/medo/horror, corrupção/dádivas/maldições, brumas/domínio/ritos |
| **Fase 6** | ⏳ Pending | Progressão: ledger de marcos, classes 1–10, recursos, level up |
| **Fase 7** | ⏳ Pending | Dados & E2E: defs Barovia, scripts de composição, cenários cruzados, validação runtime/editor |

### 9.2 Alinhamento ao `C:\AI\PROJETOS\RPR\# Ravenloft RPR Project Plan.md`

- O blueprint respeita a **workflow sequencial** proposta (ancestry → class → background → optional → allocate → validate → save)
- As **grant categories** (fixed ancestry, fixed class, fixed background, optional selections, discretionary attributes/skills) são refletidas nos `SYS_CharacterCreation` FlowChart e nodes `PROG_*`
- A **point budget separation** (atributos vs skills vs optional choices vs progression) está contemplada nos contratos `CORE_Resource` e `PROG_GetState/AwardMilestone`
- A prioridade em **não finalizar números** antes da validação RPR é mantida — orçamentos permanecem como `TBD` até audit completa

### 9.3 Alinhamento ao `C:\Users\macro\Desktop\Ravenloft_Plans_Site\`

- O catálogo de nodes por prefixo (SYS_*/CORE_*/DND_*/RVL_*/PROG_*/RPR_*) corresponde exatamente ao mapeamento do site
- Os fluxos de combate, medo, dádiva/ maldiçao, ritual e level up nos `flows.html` são os casos de uso principais dos FlowCharts definidos aqui
- As **lacunas P1–P5** do site correspondem às pendências Fase 0 listadas acima
- O princípio de **motor dirigido por dados** (data-driven) é a base da abordagem — defs em tabelas, não hardcoded

---

## 10. Próximos Passos Imediatos

1. **Validar Fase 0**: executar probes no DevKit/RPR instalado para confirmar/negar cada lacuna da tabela 8.1
2. **Congelar catálogo de nodes**: criar/atualizar `Tot_DT_FlowChartNodes` com os nodes listados na seção 3, usando GUIDs padronizados
3. **Implementar SYS_CharacterCreation**: FlowChart orchestrator completo como protótipo inicial
4. **Desenvolver CORE_RollD20 + CheckDC**: nodes de rolagem base para todos os outros módulos
5. **Alinhar com plans site**: sincronizar o catalog de nodes com `apis-nodes.html` após cada iteração
6. **Documentar conforme validado**: mover itens de "provisional" para "validated" conforme probes confirmarem

---
*Blueprint gerado em 2026-11-13. Conforme roadmap Fase 0–7. Todas as afirmações de capacidade são provisórias até validação no DevKit/RPR instalado.*