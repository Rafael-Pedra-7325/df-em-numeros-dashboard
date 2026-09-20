async function carregarDados() {
  const resposta = await fetch("dados/dados_agregados.json");
  return resposta.json();
}

function montarKpis(dados) {
  const kpisEl = document.getElementById("kpis");
  kpisEl.innerHTML = `
    <div class="kpi">
      <span>Total de ocorrências</span>
      <strong>${dados.total_geral.toLocaleString("pt-br")}</strong>
    </div>
    <div class="kpi">
      <span>Região com mais ocorrências</span>
      <strong>${dados.regiao_com_mais_ocorrencias.regiao}</strong>
    </div>
    <div class="kpi">
      <span>Regiões monitoradas</span>
      <strong>${dados.por_regiao.length}</strong>
    </div>
  `;
}

function graficoBarras(idCanvas, labels, valores, cor) {
  new Chart(document.getElementById(idCanvas), {
    type: "bar",
    data: {
      labels,
      datasets: [{ data: valores, backgroundColor: cor }],
    },
    options: {
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } },
    },
  });
}

function graficoLinha(idCanvas, labels, valores) {
  new Chart(document.getElementById(idCanvas), {
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
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } },
    },
  });
}

(async function iniciar() {
  const dados = await carregarDados();

  montarKpis(dados);

  graficoBarras(
    "grafico-regiao",
    dados.por_regiao.map((item) => item.regiao),
    dados.por_regiao.map((item) => item.quantidade),
    "#2563eb"
  );

  graficoBarras(
    "grafico-tipo",
    dados.por_tipo_infracao.map((item) => item.tipo),
    dados.por_tipo_infracao.map((item) => item.quantidade),
    "#f97316"
  );

  graficoLinha(
    "grafico-mes",
    dados.por_mes.map((item) => item.mes),
    dados.por_mes.map((item) => item.quantidade)
  );
})();
