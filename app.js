let totalAbastecido = 0;
let totalCusto = 0;
let horaInicioReal = null;
let horaFimReal = null;

function capturarHora(campo) {
  const agora = new Date();

  const hora = agora.getHours().toString().padStart(2, '0');
  const minutos = agora.getMinutes().toString().padStart(2, '0');

  document.getElementById(campo).value = `${hora}:${minutos}`;

  if (campo === 'horaInicio') {
    horaInicioReal = new Date();
  } else {
    horaFimReal = new Date();
  }

  calcular(); // atualiza horas e valor da hora na hora
}

function addAbastecimento() {
  const v = Number(document.getElementById('abastecimento').value || 0);
  totalAbastecido += v;
  document.getElementById('totalAbastecido').value = totalAbastecido.toFixed(2);
  document.getElementById('abastecimento').value = '';
  calcular();
}

function addCusto() {
  const v = Number(document.getElementById('custo').value || 0);
  totalCusto += v;
  document.getElementById('totalCusto').value = totalCusto.toFixed(2);
  document.getElementById('custo').value = '';
  calcular();
}

function calcular() {
  const kmI = Number(document.getElementById('kmInicial').value || 0);
  const kmF = Number(document.getElementById('kmFinal').value || 0);
  if (kmF > kmI) {
    document.getElementById('kmPercorrido').value = kmF - kmI;
  }

  // ====== HORAS TRABALHADAS ======
  const hInicio = document.getElementById('horaInicio').value;
  const hFim = document.getElementById('horaFim').value;

  let horas = 0;

  if (hInicio && hFim) {
    const hoje = new Date();
    let inicio = horaInicioReal ?? new Date(`${hoje.toISOString().split('T')[0]}T${hInicio}`);
    let fim = horaFimReal ?? new Date(`${hoje.toISOString().split('T')[0]}T${hFim}`);

    // Se passou da meia-noite
    if (fim < inicio) {
      fim.setDate(fim.getDate() + 1);
    }

    horas = (fim - inicio) / 3600000;

    document.getElementById('horasTrabalhadas').value = horas.toFixed(2);
  }

  // ====== VALOR DA HORA ======
  const apurado = Number(document.getElementById('apurado').value || 0);
  if (horas > 0) {
    document.getElementById('valorHora').value = (apurado / horas).toFixed(2);
  } else {
    document.getElementById('valorHora').value = '';
  }

  // ====== LUCRO ======
  const lucro = apurado - totalAbastecido - totalCusto;
  document.getElementById('lucro').value = lucro.toFixed(2);
}

function salvarDia() {
  const hInicio = document.getElementById('horaInicio').value;
  const hFim = document.getElementById('horaFim').value;

  if (!hInicio || !hFim) {
    alert("Preencha a hora inicial e final.");
    return;
  }

  const hoje = new Date();
  const dataBase = hoje.toISOString().split('T')[0];

  // Usa hora capturada OU cria a partir da digitada
  let inicio = horaInicioReal ?? new Date(`${dataBase}T${hInicio}`);
  let fim = horaFimReal ?? new Date(`${dataBase}T${hFim}`);

  // Trata virada após meia-noite
  if (fim < inicio) {
    fim.setDate(fim.getDate() + 1);
  }

  let dados = JSON.parse(localStorage.getItem('controleDiario')) || {};

  dados[dataBase] = {
    kmInicial: Number(document.getElementById('kmInicial').value || 0),
    kmFinal: Number(document.getElementById('kmFinal').value || 0),
    horaInicio: inicio.toISOString(),
    horaFim: fim.toISOString(),
    apurado: Number(document.getElementById('apurado').value || 0),
    totalAbastecido,
    totalCusto,
    lucro: Number(document.getElementById('lucro').value || 0)
  };

  localStorage.setItem('controleDiario', JSON.stringify(dados));
  alert("Dia salvo com sucesso!");
}


