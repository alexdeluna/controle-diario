let totalAbastecido = 0;
let totalCusto = 0;
let horaInicioReal = null;
let horaFimReal = null;

/* ================= HORA ================= */

function capturarHora(campo) {
  const agora = new Date();
  const hora = agora.getHours().toString().padStart(2, '0');
  const minutos = agora.getMinutes().toString().padStart(2, '0');

  const input = document.getElementById(campo);
  input.value = `${hora}:${minutos}`;

  if (campo === 'horaInicio') horaInicioReal = agora;
  if (campo === 'horaFim') horaFimReal = agora;

  calcular();
}

function normalizarHora(valor) {
  if (!valor) return '';
  const n = valor.replace(/\D/g, '');
  if (n.length === 4) return `${n.slice(0,2)}:${n.slice(2,4)}`;
  if (n.length === 3) return `0${n[0]}:${n.slice(1)}`;
  if (n.length === 2) return `${n}:00`;
  return valor.includes(':') ? valor : '';
}

/* ================= CÁLCULOS ================= */

function calcular() {
  const kmI = Number(kmInicial.value || 0);
  const kmF = Number(kmFinal.value || 0);
  if (kmF > kmI) kmPercorrido.value = kmF - kmI;

  let horas = 0;
  const hI = horaInicio.value;
  const hF = horaFim.value;

  if (hI && hF) {
    const hoje = new Date().toISOString().split('T')[0];
    let ini = horaInicioReal || new Date(`${hoje}T${hI}`);
    let fim = horaFimReal || new Date(`${hoje}T${hF}`);
    if (fim < ini) fim.setDate(fim.getDate() + 1);
    const diffMs = fim - ini;
    const totalMinutos = Math.round(diffMs / 60000);

// Formato visual HH:MM
const h = Math.floor(totalMinutos / 60);
const m = totalMinutos % 60;
horasTrabalhadas.value =
  `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`;

// Valor real em horas (somente para cálculo)
horas = totalMinutos / 60;
  }

  const ap = Number(apurado.value || 0);
  valorHora.value = horas > 0 ? (ap / horas).toFixed(2) : '';

  lucro.value = (ap - totalAbastecido - totalCusto).toFixed(2);

  salvarRascunho();
}

/* ================= CUSTOS ================= */

function addAbastecimento() {
  const campo = document.getElementById('abastecimento');
  const totalInput = document.getElementById('totalAbastecido');

  const valor = Number(campo.value);

  if (!valor || valor <= 0) return;

  totalAbastecido += valor;
  totalInput.value = totalAbastecido.toFixed(2);

  campo.value = '';
  calcular();
}

function addCusto() {
  const campo = document.getElementById('custo');
  const valor = parseFloat(campo.value);

  if (!valor || valor <= 0) return;

  totalCusto += valor;

  document.getElementById('totalCusto').value =
    totalCusto.toFixed(2);

  campo.value = ''; // limpa o campo

  calcular();
}

/* ================= RASCUNHO ================= */

function salvarRascunho() {
  localStorage.setItem('rascunhoDia', JSON.stringify({
    kmInicial: kmInicial.value,
    kmFinal: kmFinal.value,
    horaInicio: horaInicio.value,
    horaFim: horaFim.value,
    apurado: apurado.value,
    totalAbastecido,
    totalCusto,
    horaInicioReal,
    horaFimReal
  }));
}

/* ================= SALVAR DIA ================= */

function salvarDia() {
  if (!horaInicio.value || !horaFim.value) {
    alert("Preencha a hora inicial e final.");
    return;
  }

  const data = new Date().toISOString().split('T')[0];
  const dados = JSON.parse(localStorage.getItem('controleDiario')) || {};

  if (!dados[data]) dados[data] = [];

  dados[data].push({
    km: Number(kmPercorrido.value),
    horas: Number(horasTrabalhadas.value),
    valorHora: Number(valorHora.value),
    apurado: Number(apurado.value),
    custos: totalAbastecido + totalCusto,
    lucro: Number(lucro.value)
  });

  localStorage.setItem('controleDiario', JSON.stringify(dados));
  limparFormulario();
  carregarHistorico();
  alert("Dia salvo com sucesso!");
}

/* ================= LIMPAR ================= */

function limparFormulario() {
  document.querySelectorAll('input').forEach(i => i.value = '');
  totalAbastecido = totalCusto = 0;
  horaInicioReal = horaFimReal = null;
  localStorage.removeItem('rascunhoDia');
}

/* ================= HISTÓRICO ================= */

function carregarHistorico() {
  const lista = document.getElementById('listaHistorico');
  lista.innerHTML = '';
  const dados = JSON.parse(localStorage.getItem('controleDiario')) || {};

  Object.keys(dados).reverse().forEach(data => {
    dados[data].forEach((s, i) => {
      lista.innerHTML += `
        <div class="dia">
          <strong>${data} – Saída ${i+1}</strong>
          KM: ${s.km} | Horas: ${s.horas}
          <br>Apurado: R$ ${s.apurado}
          <br>Lucro: R$ ${s.lucro}
        </div>
      `;
    });
  });
}

/* ================= LOAD ================= */

window.onload = () => {
  const r = JSON.parse(localStorage.getItem('rascunhoDia'));
  if (!r) return;

  kmInicial.value = r.kmInicial || '';
  kmFinal.value = r.kmFinal || '';
  horaInicio.value = r.horaInicio || '';
  horaFim.value = r.horaFim || '';
  apurado.value = r.apurado || '';

  totalAbastecido = r.totalAbastecido || 0;
  totalCusto = r.totalCusto || 0;
  horaInicioReal = r.horaInicioReal ? new Date(r.horaInicioReal) : null;
  horaFimReal = r.horaFimReal ? new Date(r.horaFimReal) : null;

  calcular();
  carregarHistorico();
};


