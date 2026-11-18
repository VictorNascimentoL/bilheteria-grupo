import type { EventoInfo } from "./tipos.ts";

export abstract class ErroDeNegocio extends Error{
    status:number;
    
    constructor(mensagem: string, status: number){
        super(mensagem);
        this.status = status;
        this.name = new.target.name;
    }
}

export class DadosInvalidosErro extends ErroDeNegocio{
    constructor(mensagem: string){
        super(mensagem, 400);
    }
}

export class NaoEncontradoErro extends ErroDeNegocio{
    constructor(mensagem: string){
        super(mensagem, 404);
    }
}
export class PoltronaOcupadaErro extends ErroDeNegocio{
    constructor(mensagem: string){
        super(mensagem, 409);
    }
}
export class PagamentoErro extends ErroDeNegocio{
    constructor(mensagem: string){
        super(mensagem, 502);
    }
}

export class Evento{
    id:number;
    nome:string;
    preco:number;
    capacidade:number;
    #poltronasVendidas: number[] = [];

    constructor(id:number, nome:string, preco: number, capacidade: number){
        this.id = id;
        this.nome = nome;
        this.preco = preco;
        this.capacidade = capacidade
    }

    get disponivel():number{
        return this.capacidade - this.#poltronasVendidas.length;
    }

    reservar(poltronas:number[]):void{

        const semRepeticao= new Set(poltronas);// o Set armazen só números únicos

        if(poltronas.length === 0){
            throw new DadosInvalidosErro("Nenhuma poltrona selecionada");
        
        }else if(poltronas.some(poltrona => Number.isInteger(poltrona) === false)){
            throw new DadosInvalidosErro("Número de poltrona inválido");

        }else if(poltronas.length !== semRepeticao.size){
            throw new DadosInvalidosErro("Há poltronas repetidas");
        
        }else if(poltronas.some(poltrona => poltrona < 1 || poltrona > this.capacidade)){// some() verifica cada elemento da lista
            throw new DadosInvalidosErro("Número de poltrona inválido");
        }
        else if(poltronas.some(poltrona => this.#poltronasVendidas.includes(poltrona))){// includes() vai verificar se cada 
//poltrona existe na lista de poltronas já vendidas, se pelo menos uma existir ele já retorna true
            const acentosOcupados = poltronas.filter(poltrona => this.#poltronasVendidas.includes(poltrona));

            throw new PoltronaOcupadaErro(`As poltronas ${acentosOcupados} estão ocupadas`);
        }

        this.#poltronasVendidas.push(...poltronas);
    }

    liberar(poltronas: number[]): void {
        if (poltronas.length === 0) {
            throw new DadosInvalidosErro("Nenhuma poltrona selecionada");
        }

        const semRepeticao = new Set(poltronas);

        if (poltronas.length !== semRepeticao.size) {
            throw new DadosInvalidosErro("Há poltronas repetidas");
        }

        if (poltronas.some(poltrona => !this.#poltronasVendidas.includes(poltrona))) {
            throw new DadosInvalidosErro("Uma ou mais poltronas não estão vendidas");
        }

        this.#poltronasVendidas = this.#poltronasVendidas.filter(
            poltrona => !poltronas.includes(poltrona)
        );
    }

    info(): EventoInfo{
        return{
            id: this.id,
            nome: this.nome,
            preco: this.preco,
            capacidade: this.capacidade,
            disponivel: this.disponivel
        };
    }
}