const ORDEM_MESES_PADRAO = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

const instanciasGraficos = {};

async function carregarDados() {
  const resposta = await fetch("dados/dados_agregados.json");
  if (!resposta.ok) {
    throw new Error(`Erro HTTP ${resposta.status} ao carregar dados_agregados.json`);
  }
  return resposta.json();
}

function exibirErro(mensagem) {
  const erroEl = document.getElementById("mensagem-erro");
  erroEl.hidden = false;
  erroEl.innerHTML = `
    <strong>Não foi possível carregar os dados do painel.</strong><br />
    ${mensagem}<br />
    <small>Dica: execute <code>python gerar_dados.py</code>, <code>python analise.py</code> e abra via servidor local (<code>python -m http.server 8000</code>).</small>
  `;
}

function preencherFiltros(dados) {
  const selectRegiao = document.getElementById("filtro-regiao");
  const selectMes = document.getElementById("filtro-mes");

  const regioes = [...dados.por_regiao]
    .map((item) => item.regiao)
    .sort((a, b) => a.localeCompare(b, "pt-br"));

  regioes.forEach((regiao) => {
    const option = document.createElement("option");
    option.value = regiao;
    option.textContent = regiao;
    selectRegiao.appendChild(option);
  });

  const meses = dados.ordem_meses || ORDEM_MESES_PADRAO;
  meses.forEach((mes) => {
    const option = document.createElement("option");
    option.value = mes;
    option.textContent = mes;
    selectMes.appendChild(option);
  });
}

function agregarFiltrado(dados, regiaoSelecionada, mesSelecionado) {
  if (!Array.isArray(dados.detalhado)) {
    return {
      totalGeral: dados.total_geral,
      porRegiao: dados.por_regiao,
      porTipo: dados.por_tipo_infracao,
      porMes: dados.por_mes,
    };
  }

  const registros = dados.detalhado.filter((item) => {
    const bateRegiao = regiaoSelecionada === "todas" || item.regiao === regiaoSelecionada;
    const bateMes = mesSelecionado === "todos" || item.mes === mesSelecionado;
    return bateRegiao && bateMes;
  });

  const mapaRegiao = new Map();
  const mapaTipo = new Map();
  const mapaMes = new Map();
  let totalGeral = 0;

  registros.forEach((item) => {
    totalGeral += item.quantidade;
    mapaRegiao.set(item.regiao, (mapaRegiao.get(item.regiao) || 0) + item.quantidade);
    mapaTipo.set(item.tipo_infracao, (mapaTipo.get(item.tipo_infracao) || 0) + item.quantidade);
    mapaMes.set(item.mes, (mapaMes.get(item.mes) || 0) + item.quantidade);
  });

  const porRegiao = Array.from(mapaRegiao, ([regiao, quantidade]) => ({ regiao, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade);

  const porTipo = Array.from(mapaTipo, ([tipo, quantidade]) => ({ tipo, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade);

  const ordemMeses = dados.ordem_meses || ORDEM_MESES_PADRAO;
  const porMes = ordemMeses.map((mes) => ({
    mes,
    quantidade: mapaMes.get(mes) || 0,
  }));

  return { totalGeral, porRegiao, porTipo, porMes };
}

function montarKpis(resumo, mesSelecionado) {
  const kpisEl = document.getElementById("kpis");
  const topRegiao = resumo.porRegiao[0] || { regiao: "-", quantidade: 0 };
  const topTipo = resumo.porTipo[0] || { tipo: "-", quantidade: 0 };
  const divisorMeses = mesSelecionado === "todos" ? 12 : 1;
  const mediaMensal = Math.round(resumo.totalGeral / divisorMeses);

  kpisEl.innerHTML = `
    <div class="kpi">
      <span>Total de ocorrências</span>
      <strong>${resumo.totalGeral.toLocaleString("pt-br")}</strong>
      <small>${resumo.porRegiao.length} região(ões) no recorte</small>
    </div>
    <div class="kpi">
      <span>Região com mais ocorrências</span>
      <strong>${topRegiao.regiao}</strong>
      <small>${topRegiao.quantidade.toLocaleString("pt-br")} ocorrências</small>
    </div>
    <div class="kpi">
      <span>Infração mais frequente</span>
      <strong>${topTipo.tipo}</strong>
      <small>${topTipo.quantidade.toLocaleString("pt-br")} registros</small>
    </div>
    <div class="kpi">
      <span>${mesSelecionado === "todos" ? "Média mensal" : `Total em ${mesSelecionado}`}</span>
      <strong>${mediaMensal.toLocaleString("pt-br")}</strong>
      <small>ocorrências/mês</small>
    </div>
  `;
}

function renderizarGrafico(idCanvas, config) {
  if (instanciasGraficos[idCanvas]) {
    instanciasGraficos[idCanvas].destroy();
  }
  instanciasGraficos[idCanvas] = new Chart(document.getElementById(idCanvas), config);
}

function graficoBarras(idCanvas, labels, valores, cor) {
  renderizarGrafico(idCanvas, {
    type: "bar",
    data: {
      labels,
      datasets: [{ data: valores, backgroundColor: cor, borderRadius: 6 }],
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.parsed.y.toLocaleString("pt-br")} ocorrências`,
          },
        },
      },
      scales: { y: { beginAtZero: true } },
    },
  });
}

function graficoLinha(idCanvas, labels, valores) {
  renderizarGrafico(idCanvas, {
    type: "line",
    data: {
      labels,
      datasets: [{
        data: valores,
        borderColor: "#1d4ed8",
        backgroundColor: "rgba(29, 78, 216, 0.12)",
        fill: true,
        tension: 0.3,
      }],
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.parsed.y.toLocaleString("pt-br")} ocorrências`,
          },
        },
      },
      scales: { y: { beginAtZero: true } },
    },
  });
}

function atualizarDashboard(dados) {
  const regiaoSelecionada = document.getElementById("filtro-regiao").value;
  const mesSelecionado = document.getElementById("filtro-mes").value;
  const btnLimpar = document.getElementById("btn-limpar");

  btnLimpar.disabled = regiaoSelecionada === "todas" && mesSelecionado === "todos";

  const resumo = agregarFiltrado(dados, regiaoSelecionada, mesSelecionado);

  montarKpis(resumo, mesSelecionado);

  graficoBarras(
    "grafico-regiao",
    resumo.porRegiao.map((item) => item.regiao),
    resumo.porRegiao.map((item) => item.quantidade),
    "#2563eb"
  );

  graficoBarras(
    "grafico-tipo",
    resumo.porTipo.map((item) => item.tipo),
    resumo.porTipo.map((item) => item.quantidade),
    "#f97316"
  );

  graficoLinha(
    "grafico-mes",
    resumo.porMes.map((item) => item.mes),
    resumo.porMes.map((item) => item.quantidade)
  );
}

(async function iniciar() {
  try {
    const dados = await carregarDados();
    preencherFiltros(dados);
    atualizarDashboard(dados);

    document.getElementById("filtro-regiao").addEventListener("change", () => atualizarDashboard(dados));
    document.getElementById("filtro-mes").addEventListener("change", () => atualizarDashboard(dados));
    document.getElementById("btn-limpar").addEventListener("click", () => {
      document.getElementById("filtro-regiao").value = "todas";
      document.getElementById("filtro-mes").value = "todos";
      atualizarDashboard(dados);
    });
  } catch (erro) {
    console.error(erro);
    exibirErro(erro.message);
  }
})();
