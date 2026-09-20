"""
Gera um dataset SINTÉTICO (fictício, apenas para fins de demonstração) de
ocorrências de trânsito por Região Administrativa do DF, simulando o tipo
de dado público que órgãos como o DETRAN-DF costumam divulgar.

⚠️ Os números aqui NÃO são dados oficiais — servem apenas para alimentar
o dashboard de exemplo deste repositório.
"""

import csv
import random

REGIOES = [
    "Plano Piloto", "Taguatinga", "Ceilândia", "Samambaia", "Águas Claras",
    "Gama", "Sobradinho", "Planaltina", "Guará", "Santa Maria",
]

MESES = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez",
]

TIPOS_INFRACAO = ["Excesso de velocidade", "Sinal vermelho", "Estacionamento irregular", "Celular ao volante"]


def gerar_dataset(caminho_csv="dados/ocorrencias_transito_df.csv", seed=7):
    random.seed(seed)

    with open(caminho_csv, "w", newline="", encoding="utf-8") as arquivo:
        escritor = csv.writer(arquivo)
        escritor.writerow(["regiao", "mes", "tipo_infracao", "quantidade"])

        for regiao in REGIOES:
            fator_regiao = random.uniform(0.6, 1.8)  # regiões maiores tendem a ter mais ocorrências
            for mes in MESES:
                for tipo in TIPOS_INFRACAO:
                    base = random.randint(5, 40)
                    quantidade = max(1, int(base * fator_regiao))
                    escritor.writerow([regiao, mes, tipo, quantidade])

    print(f"Dataset sintético gerado em: {caminho_csv}")


if __name__ == "__main__":
    gerar_dataset()
