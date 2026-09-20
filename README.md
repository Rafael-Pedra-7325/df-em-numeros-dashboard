# 📊 DF em Números — Dashboard de Trânsito

Pipeline de dados (Python + pandas) que gera, agrega e visualiza ocorrências de trânsito por Região Administrativa do DF, em um dashboard estático publicável no GitHub Pages.

> ⚠️ **Dados sintéticos**: este projeto gera um dataset fictício apenas para fins de demonstração. Não representa números oficiais do DETRAN-DF ou de qualquer órgão público.

## ✨ Funcionalidades
- Geração de dataset sintético em CSV (`gerar_dados.py`)
- Agregação com **pandas** (por região, por tipo de infração, por mês) exportada em JSON
- Dashboard estático (HTML + Chart.js) consumindo o JSON — sem back-end necessário

## 🏗️ Arquitetura
```
df-em-numeros-dashboard/
├── gerar_dados.py   # gera o CSV sintético
├── analise.py       # agrega os dados com pandas -> JSON
├── dados/
│   ├── ocorrencias_transito_df.csv
│   └── dados_agregados.json
├── index.html        # dashboard
├── style.css
└── script.js
```

## 🚀 Como executar
```bash
pip install -r requirements.txt
python gerar_dados.py   # gera o CSV
python analise.py       # gera o JSON agregado

# sirva os arquivos estáticos (o fetch() do navegador exige um servidor, não file://)
python -m http.server 8000
```
Depois acesse `http://localhost:8000`.

## 🌐 Publicando no GitHub Pages
Como o dashboard é 100% estático (HTML/CSS/JS + um JSON), basta ativar o GitHub Pages apontando para a branch `main` — o link pode ir direto no seu portfólio.

## 🧠 Conceitos praticados
- Manipulação e agregação de dados com `pandas` (`groupby`, `sort_values`, `reindex`)
- Geração de dados sintéticos controlada por seed (reprodutibilidade)
- Consumo de JSON via `fetch` e renderização de gráficos com Chart.js
- Separação entre pipeline de dados (Python) e camada de visualização (front-end)

## 🔭 Próximos passos
- Trocar o dataset sintético por dados abertos reais (ex: portal de dados abertos do DF, quando a rede permitir)
- Adicionar filtro por região/mês no próprio dashboard
- Automatizar a geração do JSON com GitHub Actions agendado
