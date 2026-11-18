import type { Pessoa } from "./tipos.ts";

export function direitoAMeia(pessoa:Pessoa): boolean{
    if (pessoa.estudante || pessoa.pcd || pessoa.idade >= 60) {
        return true;
    }

    return false;
}