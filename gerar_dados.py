"""
Gera um dataset SINTÉTICO (fictício, apenas para fins de demonstração) de
ocorrências de trânsito por Região Administrativa do DF, simulando o tipo
de dado público que órgãos como o DETRAN-DF costumam divulgar.

⚠️ Os números aqui NÃO são dados oficiais — servem apenas para alimentar
o dashboard de exemplo deste repositório.
"""

import csv
from pathlib import Path
import random

BASE_DIR = Path(__file__).resolve().parent
CAMINHO_CSV_PADRAO = BASE_DIR / "dados" / "ocorrencias_transito_df.csv"

# Pesos relativos aproximados para tornar a simulação mais coerente com o fluxo das RAs
PESOS_REGIOES = {
    "Plano Piloto": 1.75,
    "Taguatinga": 1.60,
    "Ceilândia": 1.65,
    "Águas Claras": 1.40,
    "Samambaia": 1.25,
    "Guará": 1.15,
    "Gama": 1.10,
    "Sobradinho": 0.95,
    "Planaltina": 1.00,
    "Santa Maria": 0.90,
}

MESES = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez",
]

PESOS_INFRACAO = {
    "Excesso de velocidade": 1.25,
    "Estacionamento irregular": 1.10,
    "Sinal vermelho": 0.95,
    "Celular ao volante": 0.85,
}


def gerar_dataset(caminho_csv=CAMINHO_CSV_PADRAO, seed=7):
    random.seed(seed)
    caminho = Path(caminho_csv)
    caminho.parent.mkdir(parents=True, exist_ok=True)

    with caminho.open("w", newline="", encoding="utf-8") as arquivo:
        escritor = csv.writer(arquivo)
        escritor.writerow(["regiao", "mes", "tipo_infracao", "quantidade"])

        for regiao, peso_regiao in PESOS_REGIOES.items():
            variacao_regiao = peso_regiao * random.uniform(0.9, 1.1)
            for mes in MESES:
                for tipo, peso_tipo in PESOS_INFRACAO.items():
                    base = random.randint(8, 36)
                    quantidade = max(1, round(base * variacao_regiao * peso_tipo))
                    escritor.writerow([regiao, mes, tipo, quantidade])

    print(f"Dataset sintético gerado em: {caminho}")


if __name__ == "__main__":
    gerar_dataset()
