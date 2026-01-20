let totalAbastecido = 0;
let totalCustos = 0;
let horaInicioReal, horaFimReal;

function capturarHora(tipo) {
  const agora = new Date();
  const hora = agora.toISOString().substring(11,16);

  if (tipo === 'inicio') {
    document.getElementById('horaInicio').value = hora;
    horaInicioReal = agora;
  } else {
    document.getElementById('horaFim').value = hora;
    horaFimReal = agora;
  }
}

function addAbastecimento() {
  totalAbastecido += Number(document.getElementById('abastecimento').value || 0);
  document.getElementById('abastecimento').value = '';
}

function addCusto() {
  totalCustos += Number(document.getElementById('custo').value || 0);
  document.getElementById('custo').value = '';
}

function salvarDia() {
  const hoje = horaInicioReal.toISOString().split('T')[0];

  let dados = JSON.parse(localStorage.getItem('controleDiario')) || {};

  const apurado = Number(document.getElementById('apurado').value);

  dados[hoje] = {
    horaInicio: horaInicioReal,
    horaFim: horaFimReal,
    apurado,
    totalAbastecido,
    totalCustos,
    lucro: apurado - totalAbastecido - totalCustos
  };

  localStorage.setItem('controleDiario', JSON.stringify(dados));
  alert('Dia salvo com sucesso!');
}

function calcularMeta() {
  const meta = Number(document.getElementById('metaMensal').value);
  const diaria = Number(document.getElementById('metaDiaria').value);
  const hoje = new Date();
  const mesAtual = hoje.toISOString().substring(0,7);

  const dados = JSON.parse(localStorage.getItem('controleDiario')) || {};
  let lucroMes = 0;
  let diasUteis = 0;

  for (let d in dados) {
    if (d.startsWith(mesAtual)) lucroMes += dados[d].lucro;
  }

  let data = new Date();
  while (data.getMonth() === hoje.getMonth()) {
    if (data.getDay() !== 0 && data.getDay() !== 6) diasUteis++;
    data.setDate(data.getDate() + 1);
  }

  const falta = meta - lucroMes;
  const mediaNecessaria = falta / diasUteis;

  let aviso = mediaNecessaria > diaria
    ? "⚠️ Será necessário trabalhar finais de semana ou feriados."
    : "✅ Meta atingível apenas em dias úteis.";

  document.getElementById('resultadoMeta').innerText =
    `Lucro atual: R$ ${lucroMes}
Falta: R$ ${falta}
Média necessária: R$ ${mediaNecessaria.toFixed(2)}
${aviso}`;
}
