import { criarBilheteria } from "./bilheteria.ts";
import { Evento } from "./dominio.ts";
import { criarPagamentoFalso } from "./pagamento.ts";
import { criarServidor } from "./servidor.ts";

const eventos = [
  new Evento(1, "Show de encerramento", 100, 100),
  new Evento(2, "Peça de teatro", 80, 40),
  new Evento(3, "Festival de música", 150, 100),
];

const bilheteria = criarBilheteria({
  eventos,
  pagar: criarPagamentoFalso({ latenciaMs: 80, taxaDeFalha: 0.1 }),
  limitePagamentoMs: 500,
});

const porta = Number(process.env.PORT ?? 3000);

criarServidor(bilheteria).listen(porta, () => {
  console.log(`Bilheteria no ar em http://localhost:${porta}`);
});