let totalAbastecido = 0;
let totalCusto = 0;
let horaInicioReal = null;
let horaFimReal = null;

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

  let horas = 0;
  if (horaInicioReal && horaFimReal) {
    horas = (horaFimReal - horaInicioReal) / 3600000;
    if (horas < 0) horas += 24;
    document.getElementById('horasTrabalhadas').value = horas.toFixed(2);
  }

  const apurado = Number(document.getElementById('apurado').value || 0);
  if (horas > 0) {
    document.getElementById('valorHora').value = (apurado / horas).toFixed(2);
  }

  const lucro = apurado - totalAbastecido - totalCusto;
  document.getElementById('lucro').value = lucro.toFixed(2);
}

function salvarDia() {
  if (!horaInicioReal || !horaFimReal) {
    alert("Capture a hora inicial e final.");
    return;
  }

  const dataBase = horaInicioReal.toISOString().split('T')[0];
  let dados = JSON.parse(localStorage.getItem('controleDiario')) || {};

  dados[dataBase] = {
    kmInicial: Number(document.getElementById('kmInicial').value),
    kmFinal: Number(document.getElementById('kmFinal').value),
    horaInicio: horaInicioReal,
    horaFim: horaFimReal,
    apurado: Number(document.getElementById('apurado').value),
    totalAbastecido,
    totalCusto,
    lucro: Number(document.getElementById('lucro').value)
  };

  localStorage.setItem('controleDiario', JSON.stringify(dados));
  alert("Dia salvo com sucesso!");
}
