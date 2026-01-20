window.onerror = function (msg, url, line) {
  alert("Erro JS: " + msg + " (linha " + line + ")");
};

á a função limparformula´riolet totalAbastecido = 0;
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

function salvarRascunho() {
  const rascunho = {
    kmInicial: document.getElementById('kmInicial').value,
    kmFinal: document.getElementById('kmFinal').value,
    horaInicio: document.getElementById('horaInicio').value,
    horaFim: document.getElementById('horaFim').value,
    apurado: document.getElementById('apurado').value,
    totalAbastecido,
    totalCusto,
    horaInicioReal,
    horaFimReal
  };

  localStorage.setItem('rascunhoDia', JSON.stringify(rascunho));
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
  salvarRascunho();
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

function getValorSeguro(id) {
  const el = document.getElementById(id);
  return el ? Number(el.value || 0) : 0;
}

function salvarDia() {
  const hInicio = document.getElementById('horaInicio').value;
  const hFim = document.getElementById('horaFim').value;

  if (!hInicio || !hFim) {
    alert("Preencha a hora inicial e final.");
    return;
  }

  const dataBase = new Date().toISOString().split('T')[0];

  let dados = JSON.parse(localStorage.getItem('controleDiario')) || {};

  // Cria o dia se não existir
  if (!dados[dataBase]) {
    dados[dataBase] = {
      totalDia: {
        apurado: 0,
        totalAbastecido: 0,
        totalCusto: 0,
        lucro: 0
      },
      saidas: []
    };
  }

  // Dados da saída
  // Dados da saída (leitura segura)
const kmPercorrido = getValorSeguro('kmPercorrido');
const horasTrabalhadas = getValorSeguro('horasTrabalhadas');
const valorHora = getValorSeguro('valorHora');
const apurado = getValorSeguro('apurado');
const lucro = getValorSeguro('lucro');

  const novaSaida = {
    id: dados[dataBase].saidas.length + 1,
    kmPercorrido,
    horasTrabalhadas,
    valorHora,
    apurado,
    totalAbastecido,
    totalCusto,
    custoTotal: totalAbastecido + totalCusto,
    lucro
  };

  // Salva saída
  dados[dataBase].saidas.push(novaSaida);

  // Atualiza total do dia
  dados[dataBase].totalDia.apurado += apurado;
  dados[dataBase].totalDia.totalAbastecido += totalAbastecido;
  dados[dataBase].totalDia.totalCusto += totalCusto;
  dados[dataBase].totalDia.lucro += lucro;

  localStorage.setItem('controleDiario', JSON.stringify(dados));

  alert(`Saída ${novaSaida.id} salva com sucesso!`);

  localStorage.removeItem('rascunhoDia');
  limparFormulario();
  carregarHistorico();
}

function apagarRegistroAtual() {
  const confirmar = confirm(
    "Isso vai apagar o registro em andamento.\nOs dias já salvos NÃO serão apagados.\n\nDeseja continuar?"
  );

  if (!confirmar) return;

  // Remove rascunho
  localStorage.removeItem('rascunhoDia');

  // Limpa memória
  totalAbastecido = 0;
  totalCusto = 0;
  horaInicioReal = null;
  horaFimReal = null;

  // Limpa tela
  limparFormulario();

  alert("Registro atual apagado com sucesso!");
}


window.onload = function () {
  const rascunho = JSON.parse(localStorage.getItem('rascunhoDia'));
  if (!rascunho) return;

  document.getElementById('kmInicial').value = rascunho.kmInicial || '';
  document.getElementById('kmFinal').value = rascunho.kmFinal || '';
  document.getElementById('horaInicio').value = rascunho.horaInicio || '';
  document.getElementById('horaFim').value = rascunho.horaFim || '';
  document.getElementById('apurado').value = rascunho.apurado || '';

  totalAbastecido = rascunho.totalAbastecido || 0;
  totalCusto = rascunho.totalCusto || 0;
  horaInicioReal = rascunho.horaInicioReal ? new Date(rascunho.horaInicioReal) : null;
  horaFimReal = rascunho.horaFimReal ? new Date(rascunho.horaFimReal) : null;

  document.getElementById('totalAbastecido').value = totalAbastecido.toFixed(2);
  document.getElementById('totalCusto').value = totalCusto.toFixed(2);

  calcular();
  carregarHistorico();

};

function carregarHistorico() {
  const lista = document.getElementById('listaHistorico');
  if (!lista) return;

  const dados = JSON.parse(localStorage.getItem('controleDiario')) || {};
  const datas = Object.keys(dados).sort().reverse();

  lista.innerHTML = '';

  if (datas.length === 0) {
    lista.innerHTML = '<em>Nenhum dia salvo ainda.</em>';
    return;
  }

  datas.forEach(data => {
    const d = dados[data];

    const div = document.createElement('div');
    div.className = 'dia';

    let html = `<strong>${formatarData(data)}</strong><br><br>`;

d.saidas.forEach(saida => {
  html += `
    🔹 <strong>Saída ${saida.id}</strong><br>
    🚗 KM percorrido: ${saida.kmPercorrido} km<br>
    ⏱ Horas trabalhadas: ${saida.horasTrabalhadas.toFixed(2)} h<br>
    💰 Valor da hora: R$ ${saida.valorHora.toFixed(2)}<br>

    ⛽ Combustível: R$ ${saida.totalAbastecido.toFixed(2)}<br>
    📦 Outros custos: R$ ${saida.totalCusto.toFixed(2)}<br>
    🧾 Custo total: R$ ${saida.custoTotal.toFixed(2)}<br>

    💵 Apurado: R$ ${saida.apurado.toFixed(2)}<br>
    🟢 Lucro: <strong>R$ ${saida.lucro.toFixed(2)}</strong>
    <hr>
  `;
});

html += `
  <strong>📊 TOTAL DO DIA</strong><br>
  💵 Apurado: R$ ${d.totalDia.apurado.toFixed(2)}<br>
  🧾 Custos: R$ ${(d.totalDia.totalAbastecido + d.totalDia.totalCusto).toFixed(2)}<br>
  🟢 Lucro do dia: <strong>R$ ${d.totalDia.lucro.toFixed(2)}</strong>
`;

div.innerHTML = html;

    lista.appendChild(div);
  });
}

function formatarData(dataISO) {
  const [y, m, d] = dataISO.split('-');
  return `${d}/${m}/${y}`;
}
function limparFormulario() {
  // Limpa todos os inputs editáveis
  document.querySelectorAll('input').forEach(input => {
    if (!input.classList.contains('readonly')) {
      input.value = '';
    }
  });

  // Limpa campos calculados (proteção contra null)
  ['kmPercorrido', 'horasTrabalhadas', 'valorHora', 'lucro']
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });

  // Zera variáveis internas
  totalAbastecido = 0;
  totalCusto = 0;
  horaInicioReal = null;
  horaFimReal = null;

  // Reseta totais visuais
  const ab = document.getElementById('totalAbastecido');
  const cu = document.getElementById('totalCusto');

  if (ab) ab.value = '0.00';
  if (cu) cu.value = '0.00';

  // 🔥 ESSENCIAL: remove qualquer rascunho ativo
  localStorage.removeItem('rascunhoDia');
}
function apagarRegistroAtual() {
  if (!confirm("Deseja apagar os dados atuais em edição?")) return;

  localStorage.removeItem('rascunhoDia');
  limparFormulario();

  alert("Registro atual apagado.");
}



