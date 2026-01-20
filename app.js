let totalAbastecido = 0;
let totalCusto = 0;
let horaInicioReal = null;
let horaFimReal = null;

function capturarHora(campo) {
  const agora = new Date();

  const hora = agora.getHours().toString().padStart(2, '0');
  const minutos = agora.getMinutes().toString().padStart(2, '0');

  const input = document.getElementById(campo);
  if (!input) {
    alert("Campo de hora não encontrado: " + campo);
    return;
  }

  input.value = `${hora}:${minutos}`;
  input.dispatchEvent(new Event('input'));

  if (campo === 'horaInicio') {
    horaInicioReal = new Date();
  } else if (campo === 'horaFim') {
    horaFimReal = new Date();
  }

  calcular();
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
  const hInicio = normalizarHora(document.getElementById('horaInicio').value);
const hFim = normalizarHora(document.getElementById('horaFim').value);

document.getElementById('horaInicio').value = hInicio;
document.getElementById('horaFim').value = hFim;


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

function normalizarHora(valor) {
  if (!valor) return '';

  // Remove tudo que não for número
  const numeros = valor.replace(/\D/g, '');

  if (numeros.length === 1) {
    return `0${numeros}:00`;
  }

  if (numeros.length === 2) {
    return `${numeros}:00`;
  }

  if (numeros.length === 3) {
    return `0${numeros[0]}:${numeros.slice(1,3)}`;
  }

  if (numeros.length >= 4) {
    return `${numeros.slice(0,2)}:${numeros.slice(2,4)}`;
  }

  return '';
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






