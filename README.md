# Bilheteria concorrente

Projeto final de Paradigmas de Linguagens de Programação. Enunciado completo no Blackboard.

Os arquivos de `src/` que vocês escrevem já existem, vazios; o `tipos.ts` e o `servidor.ts` vêm prontos. O que vai em cada um está no passo
indicado do enunciado:

| Arquivo | Passo do enunciado |
| :--- | :--- |
| `src/tipos.ts` (pronto) | 1: os tipos |
| `src/regras.ts` | 2: meia-entrada |
| `src/preco.ts` | 3: preço (funcional) |
| `src/dominio.ts` | 4: evento e erros (orientado a objetos) |
| `src/bilheteria.ts` | 5: a venda, onde a concorrência aparece |
| `src/servidor.ts` (pronto) e `src/main.ts` | 6: ligar o servidor |

Não alterem `src/pagamento.ts`, `src/servidor.ts`, `src/bench.ts` nem `testes/`: a correção usa os originais.

Para começar, sigam o `GUIA.md`. Depois dele, os comandos são:

```bash
npm install
npm test          # correção automática: mostra os pontos
npm start         # serviço em http://localhost:3000
npm run bench     # com o serviço no ar: 200 pedidos simultâneos no evento 1, dois por poltrona
```

Exemplo de pedido:

```bash
curl -X POST localhost:3000/reservas -H 'Content-Type: application/json' \
  -d '{"eventoId":1,"ingressos":[{"nome":"Ana","idade":20,"estudante":true,"pcd":false,"poltrona":7}]}'
```

---

## Preencham (avaliado no vídeo)

**Link do vídeo:** https://youtu.be/4erWqSGUHpo?si=_t62ZfhkGojsL2zo 

### Integrantes

| Nome | Usuário do GitHub | Parte principal |
| :--- | :--- | :--- |
| Laura Lavínia | lauralaviinia | Passo 6 |
| Victor Eduardo | VictorNascimentoL | Passos 3 |
| William Henrique | William-Henrique-Leite | Passo 5 |

### Decisões

1. **Concorrência.** Como vocês garantem que duas pessoas não ficam com a mesma poltrona? Onde estava o
   `await` perigoso?
   **Resposta:** primeiro validamos e marcamos as poltronas com `evento.reservar`, sem
   fazer nenhum `await` entre a consulta e essa atualização. No JavaScript do Node, esse trecho síncrono
   termina antes de outro pedido poder executar seu trecho síncrono; assim, o próximo pedido já encontra
   as poltronas ocupadas. Só depois iniciamos e aguardamos o pagamento. Se esperássemos o pagamento antes
   de reservar, dois pedidos poderiam verificar a mesma poltrona livre enquanto o primeiro pagamento
   estivesse pendente. Se o pagamento falha ou excede o limite, liberamos as poltronas.

2. **OO.** O que o `Evento` esconde e por quê? Por que o `reservar` é tudo ou nada? Por que os erros são uma hierarquia de classes?
Resposta:** o `Evento` mantém a lista de poltronas vendidas como estado privado. Assim, outras partes do programa não podem alterá-la diretamente e precisam usar operações que validam os assentos. `reservar` verifica a lista inteira antes de marcar qualquer poltrona; se uma estiver inválida ou ocupada, o pedido todo é recusado, sem venda parcial. Os erros herdam de `ErroDeNegocio`, que fornece uma mensagem e um status HTTP; cada tipo específico representa uma falha diferente, que o servidor traduz para a resposta adequada (por exemplo, 404, 409 ou 502).

3. **Funcional.** O que ganhamos com `preco.ts` puro? Como vocês testariam ele sem subir o servidor?
Resposta:** as funções de preço recebem os dados necessários e devolvem os resultados sem depender do servidor nem alterar a entrada. Isso deixa os cálculos previsíveis e fáceis de reutilizar. Podemos importar `montarIngressos` e `calcularTotal`, passar pessoas e preços de exemplo e conferir os resultados diretamente, como fazem os testes automatizados.

4. **Se fosse em outro paradigma.** Escolham uma das partes e expliquem como ficaria em outro
   paradigma, e se ficaria melhor ou pior.
Resposta:** a reserva de poltronas poderia ser escrita de forma funcional: em vez de alterar o estado do `Evento`, uma função receberia o evento atual e o pedido e devolveria um novo estado com as poltronas ocupadas, ou um erro. Isso facilitaria testar cada transição e evitaria mutações escondidas. Porém, seria necessário garantir que o novo estado substituísse o antigo de forma segura; com vários pedidos concorrentes, ainda precisaríamos controlar atualizações simultâneas. Para este projeto, o objeto `Evento` concentra bem essa regra e protege seu estado.

5. **Concorrente × paralelo.** O Node roda o JavaScript numa linha só: os pedidos de vocês são
   concorrentes, não paralelos. O que mudaria se a venda rodasse em vários núcleos ao mesmo tempo?
Resposta:** pedidos concorrentes podem avançar enquanto outros aguardam operações de entrada e saída, como o pagamento. No nosso processo Node, a parte síncrona que reserva as poltronas é executada por uma linha de JavaScript. Se vários núcleos pudessem executar essa verificação e atualização ao mesmo tempo, dois poderiam ler a mesma poltrona como livre antes de qualquer um marcá-la. Seria preciso coordenar o acesso ao estado compartilhado, por exemplo com um bloqueio por evento ou uma transação e restrição de unicidade no banco de dados. O estado em memória também precisaria ser compartilhado ou centralizado entre os processos.


### Resultados do bench

| Cenário | Pedidos | Tempo (ms) | Vendidos | Poltrona ocupada | Falha de pagamento |
| :--- | ---: | ---: | ---: | ---: | ---: |
| Padrão (`main.ts`) | 200 | 205 | 90 | 100 | 10 |

O bench ocupa as poltronas do evento 1: para rodar de novo, parem o `npm start` (Ctrl+C) e subam outra
vez.

O que os números mostram: os 200 pedidos disputaram as 100 poltronas do evento 1, com dois pedidos
para cada poltrona. Neste resultado, 100 pedidos receberam 409 porque as poltronas já estavam
reservadas, 10 pagamentos falharam e receberam 502, e 90 vendas foram concluídas com 201. As 10
falhas de pagamento liberaram as poltronas, por isso o evento terminou com 10 poltronas disponíveis;
os pedidos recusados não tentam novamente. A operadora falha aleatoriamente em 10% das cobranças,
então os números podem variar em outra execução.
