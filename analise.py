"""
Lê o CSV de ocorrências, agrega os dados com pandas e exporta um JSON
pronto para ser consumido pelo dashboard (index.html + script.js).
"""

import json
from pathlib import Path
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent
CAMINHO_CSV = BASE_DIR / "dados" / "ocorrencias_transito_df.csv"
CAMINHO_JSON = BASE_DIR / "dados" / "dados_agregados.json"

ORDEM_MESES = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez",
]


def gerar_agregacoes(caminho_csv=CAMINHO_CSV):
    df = pd.read_csv(caminho_csv)

    if df.empty:
        raise ValueError("O arquivo CSV está vazio. Execute gerar_dados.py antes.")

    df["quantidade"] = pd.to_numeric(df["quantidade"], errors="coerce").fillna(0).astype(int)

    total_geral = int(df["quantidade"].sum())

    por_regiao = (
        df.groupby("regiao", as_index=False)["quantidade"]
        .sum()
        .sort_values(by="quantidade", ascending=False)
    )

    por_tipo = (
        df.groupby("tipo_infracao", as_index=False)["quantidade"]
        .sum()
        .sort_values(by="quantidade", ascending=False)
    )

    por_mes = (
        df.groupby("mes")["quantidade"]
        .sum()
        .reindex(ORDEM_MESES, fill_value=0)
        .reset_index()
    )

    detalhado = (
        df.groupby(["regiao", "mes", "tipo_infracao"], as_index=False)["quantidade"]
        .sum()
    )

    top_regiao = por_regiao.iloc[0]

    return {
        "total_geral": total_geral,
        "ordem_meses": ORDEM_MESES,
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
        "detalhado": [
            {
                "regiao": linha["regiao"],
                "mes": linha["mes"],
                "tipo_infracao": linha["tipo_infracao"],
                "quantidade": int(linha["quantidade"]),
            }
            for _, linha in detalhado.iterrows()
        ],
    }


def exportar_json(caminho_csv=CAMINHO_CSV, caminho_json=CAMINHO_JSON):
    agregacoes = gerar_agregacoes(caminho_csv)
    destino = Path(caminho_json)
    destino.parent.mkdir(parents=True, exist_ok=True)

    with destino.open("w", encoding="utf-8") as arquivo:
        json.dump(agregacoes, arquivo, ensure_ascii=False, indent=2)

    print(f"JSON agregado exportado em: {destino}")
    return agregacoes


if __name__ == "__main__":
    exportar_json()
