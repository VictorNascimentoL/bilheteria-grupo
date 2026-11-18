import type { Pessoa, TipoIngresso } from "./tipos.ts";
import type { Ingresso } from "./tipos.ts";

export function valorDoIngresso(precoBase:number): (tipoDoIngresso: string) => number {
    return (tipoDoIngresso: string) => {
        if(tipoDoIngresso === "meia"){
            return Math.round((precoBase / 2) * 100) / 100;
        }

        return precoBase;
    };
}

export function aplicarTaxa(percentual: number): (valor: number) => number{
    return (valor: number) => Math.round(((percentual * valor) + valor) * 100) / 100;
}

export function montarIngressos(precoBase: number, pessoas: Pessoa[], direitoAMeia: (pessoa: Pessoa) => boolean): Ingresso[] {
    const novaListaPessoas: Pessoa[] = [...pessoas];
    const calcularValor = valorDoIngresso(precoBase);
    
    const listaIngressos: Ingresso[] = novaListaPessoas.map((pessoa) => {
        const tipo: TipoIngresso = direitoAMeia(pessoa) ? "meia" : "inteira";

        const valor = calcularValor(tipo);

        return{
            nome: pessoa.nome,
            poltrona: pessoa.poltrona,
            tipo: tipo,
            valor: valor
        }
    })

    return listaIngressos;
}

export function calcularTotal(ingressos: Ingresso[]): number{
    const novaListaIngressos: Ingresso[] = [...ingressos];

    const soma: number = novaListaIngressos.reduce((acumulador, valorAtual) => acumulador + valorAtual.valor ,0);
    const total: number = aplicarTaxa(0.1)(soma);
    
    return total;
}