"""
Lê o CSV de ocorrências, agrega os dados com pandas e exporta um JSON
pronto para ser consumido pelo dashboard (index.html + script.js).
"""

import json
import pandas as pd

CAMINHO_CSV = "dados/ocorrencias_transito_df.csv"
CAMINHO_JSON = "dados/dados_agregados.json"


def gerar_agregacoes(caminho_csv=CAMINHO_CSV):
    df = pd.read_csv(caminho_csv)

    total_geral = int(df["quantidade"].sum())

    por_regiao = (
        df.groupby("regiao")["quantidade"]
        .sum()
        .sort_values(ascending=False)
        .reset_index()
    )

    por_tipo = (
        df.groupby("tipo_infracao")["quantidade"]
        .sum()
        .sort_values(ascending=False)
        .reset_index()
    )

    ordem_meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
    por_mes = (
        df.groupby("mes")["quantidade"]
        .sum()
        .reindex(ordem_meses)
        .reset_index()
    )

    top_regiao = por_regiao.iloc[0]

    return {
        "total_geral": total_geral,
        "regiao_com_mais_ocorrencias": {
            "regiao": top_regiao["regiao"],
            "quantidade": int(top_regiao["quantidade"]),
        },
        "por_regiao": [
            {"regiao": linha["regiao"], "quantidade": int(linha["quantidade"])}
            for _, linha in por_regiao.iterrows()
        ],
        "por_tipo_infracao": [
            {"tipo": linha["tipo_infracao"], "quantidade": int(linha["quantidade"])}
            for _, linha in por_tipo.iterrows()
        ],
        "por_mes": [
            {"mes": linha["mes"], "quantidade": int(linha["quantidade"])}
            for _, linha in por_mes.iterrows()
        ],
    }


def exportar_json(caminho_json=CAMINHO_JSON):
    agregacoes = gerar_agregacoes()
    with open(caminho_json, "w", encoding="utf-8") as arquivo:
        json.dump(agregacoes, arquivo, ensure_ascii=False, indent=2)
    print(f"JSON agregado exportado em: {caminho_json}")
    return agregacoes


if __name__ == "__main__":
    exportar_json()
