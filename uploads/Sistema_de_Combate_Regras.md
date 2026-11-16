---
permalink: projetos/rpr/sistema-de-combate-regras
title: Sistema de Combate — regras
type: note
---

# Sistema de Combate — regras

Regras já definidas para o sistema de combate do RPR. Fonte de verdade para os scripts do
Combat Core. Notas relacionadas: [[Rest_Ability_Regras]].

## 1. Proposta do sistema

O combate é uma **adaptação própria** para RPR, com foco em confrontos resolvidos pelos
jogadores, sem necessidade de mestre para determinar acertos, danos e consumo de recursos.

A estrutura combina:

- Pontos de ação, movimento e ação especial por turno.
- Gestão de HP, Mana e Stamina.
- Uma rolagem de precisão contra defesas fixas.
- Rolagem de dano somente depois de acertar.
- Redução de dano aplicada após o dano bruto.
- Cooldowns contados em turnos pessoais, não em minutos.

Buffs, debuffs de classe, vampirismo, licantropia, equipamentos e combate social ficaram para
etapas posteriores.

## 2. Atributos e árvore de skills

As skills vinculadas recebem contribuição do seu atributo-pai. Accuracy e Initiative são
independentes.

| Atributo | Skills vinculadas |
|---|---|
| Body | Strength, Intimidation, Forgery, Breach, Grapple |
| Agility | Athletics, Sleight of Hand, Stealth, Lockpicking, Escape Artist |
| Fortitude | Deciphering, Willpower, Alchemy, Eavesdropping, Binding |
| Charisma | Negotiation, Sense Motive, Healing, First Aid, Disguise, Perception |
| Independentes | Accuracy e Initiative |

Decisões complementares:

- Mind foi substituído por Fortitude.
- Não existe uma skill Dodge. Dodge Defense é um stat.
- Binding foi o nome proposto para substituir Use Rope.
- Negotiation também cobre blefe e declarações enganosas, sem leitura de pensamentos.
- Charisma não entra diretamente nas defesas ou na DR, mas influencia as skills de recuperação
  e interação.
- Os testes sociais e de prender/escapar ainda não tiveram suas comparações finais fechadas.

## 3. Distribuição inicial de pontos

| Configuração | Decisão |
|---|---:|
| Orçamento de atributos | 15 pontos |
| Orçamento de skills | 35 pontos |
| Mínimo de atributo | 0 |
| Mínimo de skill | 0 |
| Máximo de alocação informado | 10 |
| Accuracy | Bônus-base +1, sem atributo-pai |
| Benefícios de raça e classe | Somados separadamente, sem consumir a compra inicial |

Progressão de custo:

| Ponto comprado | Custo |
|---|---:|
| 1º e 2º | 1 cada |
| 3º e 4º | 2 cada |
| 5º e 6º | 3 cada |
| 7º e 8º | 4 cada |

O campo de limite do RPR é lido como **pontos gastos por skill**, não como ranks comprados.
O teto é, portanto, 10 pontos, e o maior rank comprável é +5, adquirido com 9 desses 10
pontos. A opção +8 não existe sob esta progressão.

A configuração nativa já expressa isso:

```
DiceConfig|9502|15|35|10|10|0|t|2|0|0|0|-3|3|-3|3|-3|3|t|t|0
```

Orçamento de 15 atributos, 35 skills e dois tetos de 10. Falta apenas confirmar, na tela de
alocação, que o teto conta pontos e não ranks.

## 4. Recursos do personagem

Os máximos são calculados com os valores efetivos dos atributos, incluindo modificadores
aplicáveis.

| Recurso | Fórmula do máximo |
|---|---|
| HP | 50 + 5·Body + 3·Agility + 2·Fortitude |
| Mana (MP) | 50 + 10·Fortitude |
| Stamina | 50 + 8·Agility + 5·Body |
| Exp Level | Valor inicial 1, reservado para progressão |

Os recursos possuem saldo atual e capacidade máxima, como `20/110`.

Recursos e stats visíveis permitem edição pelo jogador. Contadores de turno, cooldowns e
controles internos ficam protegidos.

## 5. Os três pilares de defesa

São valores fixos da ficha. O defensor não faz uma segunda rolagem no modelo atual.

Cada contribuição fracionária utiliza `floor` separadamente: apenas blocos completos concedem
pontos.

### Armor Class

Base 10:

```
AC = 10 + Body + floor(Agility/2) + floor(Fortitude/3)
```

### Dodge Defense

Base 0:

```
DodgeDefense = Agility + floor(Fortitude/2) + floor(Body/3)
```

### Spell Defense

Base 0:

```
SpellDefense = Fortitude + floor(Body/2) + floor(Agility/3)
```

Equipamentos poderão modificar esses valores futuramente, mas seus bônus ainda não foram
definidos.

## 6. Damage Reduction — DR

Base 10:

```
DR = 10 + Body + floor(Athletics/2) + floor(Willpower/2)
```

São usados os valores efetivos das skills:

- Athletics inclui sua contribuição de Agility.
- Willpower inclui sua contribuição de Fortitude.
- Body contribui diretamente.
- Não há contribuição de uma skill Dodge.

A DR não evita o acerto: ela reduz o dano depois que o ataque acertou.

## 7. Sequência de uma ação ofensiva

1. Confirmar que é o turno ativo do atacante.
2. Verificar pontos de ação, recursos, alcance e cooldown.
3. Selecionar outro personagem como alvo.
4. Consumir os custos da execução.
5. Rolar o acerto.
6. Em caso de falha, não aplicar dano.
7. Em caso de sucesso, rolar o dano.
8. Aplicar o multiplicador crítico, se houver.
9. Descontar a DR uma vez.
10. Limitar o dano mínimo a zero e reduzir o HP.
11. Verificar se o alvo chegou a HP zero.
12. Exibir o resultado e os valores relevantes no chat.

Uma tentativa bloqueada antes da execução não deve consumir recurso. Uma ação executada que
erra consome seus custos normalmente.

## 8. O que é comparado no acerto

O atacante utiliza:

```
Ataque = 1d20 + Accuracy
```

A defesa depende da categoria:

| Categoria | Defesa utilizada |
|---|---|
| Melee | Maior entre Dodge Defense e Armor Class |
| Ranged físico | Maior entre Spell Defense e Armor Class |
| Magia ofensiva | Maior entre Spell Defense e Dodge Defense |

Regras:

- Accuracy não recebe bônus automático de Body, Agility ou Fortitude.
- O atacante não escolhe a menor defesa.
- Fora das exceções de crítico, o ataque precisa superar a defesa.
- Empate favorece o defensor.

## 9. Dano, falhas e críticos

O dano bruto depende da arma ou magia:

```
DanoBruto = Dado + BônusDeDano
```

Acerto normal:

```
DanoFinal = max(0, DanoBruto - DR)
```

Acerto crítico:

```
DanoFinal = max(0, 2·DanoBruto - DR)
```

O crítico dobra o resultado completo da rolagem de dano, incluindo o bônus que compõe aquele
pacote. A DR é descontada depois, uma única vez.

- Falha normal não causa dano.
- DR superior ao dano não gera cura.
- O relatório deve diferenciar dano bruto de perda efetiva de HP.
- A regra geral de crítico natural adotada foi 20 para sucesso e 1 para falha.
- Punições por falha crítica foram discutidas, mas não ficaram concluídas no módulo atual sem
  buffs/debuffs.

O bônus de dano está definido e já é o que o pack executa:

| Ataque | Dano bruto |
|---|---|
| Desarmado | `1d3 + Strength` |
| Corpo a corpo, uma mão | `1d4 + Strength` |
| Corpo a corpo, duas mãos | `2d3 + Strength` |
| Arco | `1d4 + Body` |
| Arma de arremesso | `1d4 + Strength` |
| Bofetada | `1` fixo |
| Magic Bolt | `1d8`, sem bônus |

O ataque mágico básico é o Magic Bolt, com `1d8` e sem bônus. O custo de recurso também já
está no pack: 1 Action Point e 1 Stamina por ataque físico. Não há mais balanceamento
pendente para o núcleo.

## 10. Saldos renovados no início do turno

| Saldo renovado no início do turno | Quantidade padrão |
|---|---:|
| Action Points | 2 |
| Movement Points | 1 |
| Special Action Points | 1 |

- Ação comum consome 1 Action Point.
- Especial consome 1 Special Action Point, além de seus recursos.
- Movimento consome sua oportunidade de movimentação.
- Ações comuns e especiais usam saldos separados.

Assim, um turno pode comportar duas ações comuns, uma especial e uma movimentação, desde que
haja recursos e disponibilidade.

O primeiro turno pessoal é 1. Abrir novamente um turno já ativo não deve renovar pontos —
caso de jogador que reconecta no meio do próprio turno. **Adiado:** não é essencial agora e
fica para outra revisão do sistema.

### Rodadas

Quando todos os combatentes da lista de iniciativa terminam os seus turnos, conta-se uma nova
**rodada**. A ordem de iniciativa já estabelecida continua valendo — não se re-rola iniciativa
no começo de cada rodada.

- A rodada 1 começa junto com o combate.
- A rodada avança quando o último da lista termina o turno e o próximo é o primeiro de novo.
- Cooldowns continuam contados em turnos pessoais, não em rodadas.
- Entrar no meio de uma rodada não cria rodada nova: o recém-chegado entra na lista e passa a
  ser contado nas rodadas seguintes.

## 11. Mana, Stamina e esgotamento

- Magias consomem Mana.
- Ações físicas e movimentação consomem Stamina.
- Toda ação de jogo possui um custo de recurso ou de oportunidade.
- Não há consumo de flechas ou de outras munições.
- Não há regeneração automática de HP, Mana ou Stamina ao iniciar o turno.
- Mana insuficiente bloqueia a magia, mas não impede ações físicas pagáveis.
- Stamina insuficiente bloqueia ações que dependem dela, mas não impede magias pagáveis.
- Esgotamento não causa um debuff adicional automático.

Os custos numéricos individuais usados nos arquivos de teste são provisórios, salvo quando
expressamente aprovados.

## 12. Descanso durante o combate

Descansar (Rest) substitui o turno inteiro. Detalhes completos em [[Rest_Ability_Regras]].

Requisitos:

- Estar no próprio turno.
- Estar consciente.
- Ainda não ter usado ação comum, especial ou movimento.

Efeitos:

- Recuperar 16 Mana.
- Recuperar 16 Stamina.
- Respeitar o máximo efetivo de cada recurso.
- Não recuperar HP.
- Esgotar ações, especial e movimento.
- Impedir novo descanso naquele turno.
- Pedir ao jogador que finalize o turno manualmente.

A quantidade vem de `floor(50/3) = 16`.

Pode ser usado antes do esgotamento ou mesmo com os recursos cheios, como forma de passar o
turno. Não possui cooldown nem rolagem crítica.

O teto de 37 discutido anteriormente não se aplica ao descanso atual: ele pode recuperar até o
máximo efetivo, ao longo de vários turnos sacrificados.

## 13. Movimento e alcance

| Ação ofensiva | Alcance definido |
|---|---:|
| Melee | 1,5 tiles |
| Ranged | 10 tiles |
| Magia ofensiva | 10 tiles |

O movimento distingue:

- Quantidade de movimentações disponíveis.
- Distância disponível em tiles.

O jogador utiliza o contador de passos do jogo para informar a distância percorrida. A
integração automática desse contador ainda não foi concluída.

Os cinco tiles por movimentação e o custo de 1 Stamina foram valores de teste, não decisões
finais de balanceamento.

Não haverá verificação adicional de linha de visão: isso fica sob bom senso dos participantes.

## 14. Cooldowns

Os cooldowns são medidos em turnos pessoais do dono da habilidade.

**Limitação do RPR:** o campo de cooldown do `SpellDef` (campo 16) é tempo real, não turnos.
Nos packs em disco aparecem 60, 120, 240 e 1440 — o último lido como um dia em minutos. Não
existe, portanto, cooldown em turnos pessoais por configuração: qualquer habilidade futura com
essa regra precisa de um contador próprio em script. No pack atual o campo está em 0 nas 27
habilidades, o que satisfaz a regra dos ataques básicos.

- Ataques básicos físicos: sem cooldown adicional.
- Ataque mágico básico: sem cooldown adicional, mas com custo de Mana.
- Magias especiais: cooldown por habilidade.
- O tempo real gasto escrevendo ou esperando não recarrega habilidades.

Convenção proposta para os testes:

| Cooldown | Uso no turno 1 | Próximo uso |
|---:|---|---|
| 2 | Turno 1 | Turno 3 |
| 3 | Turno 1 | Turno 4 |
| 4 | Turno 1 | Turno 5 |

Os valores 2/3/4 foram sugestões de playtest, não um balanceamento final aprovado para cada
magia.

## 15. Derrota e encerramento

- HP zero concede Unconscious.
- Personagem inconsciente não pode atacar, mover-se ou descansar.
- HP zero não significa morte permanente automática.
- A condição precisa aparecer e bloquear as ações, não apenas ser anunciada.

A etapa futura de Resolution foi definida como o momento para tratar ferimentos dos derrotados
e progressão do vencedor. Suas regras detalhadas ainda não foram fechadas.

## 16. Configuração e apresentação no RPR

| Área | Decisão |
|---|---|
| Dados | 1d20 |
| Campos de comentário/modificador nas habilidades | Desativados |
| Alvo dos ataques | Outro personagem, um alvo |
| Recursos visíveis | Atual/máximo; editáveis pelo jogador |
| Contadores internos | Ocultos e protegidos |
| Public | Informação compartilhada no alcance de chat |
| Private | Informação somente para o caster |
| Secret | Sem informação no chat |
| Mensagens | Inglês, curtas e com cores padronizadas |

O relatório de combate deve mostrar:

1. Atacante e alvo.
2. Accuracy e as duas defesas consideradas.
3. Resultado da checagem.
4. Acerto, crítico ou falha.
5. Dado, bônus, multiplicador e DR.
6. Dano efetivamente aplicado.
7. HP anterior e posterior.

A mesma rolagem de dano deve alimentar o desconto de HP e o texto — nunca uma segunda rolagem
feita apenas para exibição.
