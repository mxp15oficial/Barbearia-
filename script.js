const listaCortes = [
  { id: 1, nome: "Degradê Navalhado", preco: 35.00, img: "https://picsum.photos/300/300?random=1" },
  { id: 2, nome: "Corte Social", preco: 30.00, img: "https://picsum.photos/300/300?random=2" },
  { id: 3, nome: "Barba Imperial", preco: 25.00, img: "https://picsum.photos/300/300?random=3" },
  { id: 4, nome: "Platinado Cassino", preco: 80.00, img: "https://picsum.photos/300/300?random=4" },
  { id: 5, nome: "Moicano Moderno", preco: 40.00, img: "https://picsum.photos/300/300?random=5" },
  { id: 6, nome: "Freestyle Desenho", preco: 50.00, img: "https://picsum.photos/300/300?random=6" }
];

let corteSelecionado = null;

function validarTelefone13Digitos(numero) {
  const apenasNumeros = numero.replace(/\D/g, '');
  return apenasNumeros.length === 13;
}

window.addEventListener('DOMContentLoaded', () => {
  const jaVisitou = localStorage.getItem('usuario_ja_cadastrado');

  if (jaVisitou) {
    document.getElementById('tabCadastro').classList.add('hidden');
    document.getElementById('tabLogin').click();
  } else {
    document.getElementById('tabCadastro').click();
  }
});

document.getElementById('tabLogin').addEventListener('click', () => {
  document.getElementById('tabLogin').classList.add('active');
  document.getElementById('tabCadastro').classList.remove('active');
  document.getElementById('formLogin').classList.remove('hidden');
  document.getElementById('formCadastro').classList.add('hidden');
});

document.getElementById('tabCadastro').addEventListener('click', () => {
  document.getElementById('tabCadastro').classList.add('active');
  document.getElementById('tabLogin').classList.remove('active');
  document.getElementById('formCadastro').classList.remove('hidden');
  document.getElementById('formLogin').classList.add('hidden');
});

document.getElementById('formCadastro').addEventListener('submit', (e) => {
  e.preventDefault();
  const tel = document.getElementById('cadTel').value.trim();
  const s1 = document.getElementById('cadSenha1').value;
  const s2 = document.getElementById('cadSenha2').value;

  if (!validarTelefone13Digitos(tel)) {
    alert("O número de celular deve conter exatamente 13 dígitos no formato: 5599999999999");
    return;
  }

  if (s1 !== s2) {
    alert("As senhas não coincidem!");
    return;
  }

  localStorage.setItem(`user_${tel}`, JSON.stringify({ tel, senha: s1 }));
  localStorage.setItem('usuario_ja_cadastrado', 'true');

  alert("Cadastro realizado com sucesso! Entrando no sistema...");

  document.getElementById('telaAuth').classList.add('hidden');
  document.getElementById('telaPrincipal').classList.remove('hidden');
  carregarGradeCortes();
});

document.getElementById('formLogin').addEventListener('submit', (e) => {
  e.preventDefault();
  const tel = document.getElementById('loginTel').value.trim();
  const senha = document.getElementById('loginSenha').value;

  if (!validarTelefone13Digitos(tel)) {
    alert("O número de celular deve conter exatamente 13 dígitos no formato: 5599999999999");
    return;
  }

  const usuarioSalvo = JSON.parse(localStorage.getItem(`user_${tel}`));

  if (usuarioSalvo && usuarioSalvo.senha === senha) {
    document.getElementById('telaAuth').classList.add('hidden');
    document.getElementById('telaPrincipal').classList.remove('hidden');
    carregarGradeCortes();
  } else {
    alert("Celular ou senha incorretos!");
  }
});

function carregarGradeCortes() {
  const grid = document.getElementById('gridCabelos');
  grid.innerHTML = '';

  listaCortes.forEach(corte => {
    const card = document.createElement('div');
    card.className = 'quadrado-cabelo';
    card.innerHTML = `
      <img src="${corte.img}" alt="${corte.nome}">
      <div class="label-corte">${corte.nome}</div>
    `;
    card.addEventListener('click', () => abrirModalCorte(corte));
    grid.appendChild(card);
  });
}

function abrirModalCorte(corte) {
  corteSelecionado = corte;
  document.getElementById('modalNomeCorte').textContent = corte.nome;
  document.getElementById('modalImgCorte').src = corte.img;
  document.getElementById('modalPrecoCorte').textContent = `R$ ${corte.preco.toFixed(2)}`;
  document.getElementById('modalCorte').classList.remove('hidden');
}

document.getElementById('btnFecharModal').addEventListener('click', () => {
  document.getElementById('modalCorte').classList.add('hidden');
});

document.getElementById('btnConfirmarCorte').addEventListener('click', () => {
  document.getElementById('modalCorte').classList.add('hidden');
  document.getElementById('modalAgendamento').classList.remove('hidden');
});

document.getElementById('btnMarcarCorteRapido').addEventListener('click', () => {
  if (!corteSelecionado) corteSelecionado = listaCortes[0];
  document.getElementById('modalAgendamento').classList.remove('hidden');
});

document.getElementById('btnCancelarAgendamento').addEventListener('click', () => {
  document.getElementById('modalAgendamento').classList.add('hidden');
});

function horaParaMinutos(horaStr) {
  const [h, m] = horaStr.split(':').map(Number);
  return h * 60 + m;
}

document.getElementById('btnFinalizarAgendamento').addEventListener('click', () => {
  const data = document.getElementById('agendamentoData').value;
  const hora = document.getElementById('agendamentoHora').value;

  if (!data || !hora) {
    alert("Por favor, escolha a data e o horário!");
    return;
  }

  const agendamentosExistentes = JSON.parse(localStorage.getItem('barbearia_agendamentos')) || [];
  const minNovo = horaParaMinutos(hora);

  const conflito = agendamentosExistentes.some(item => {
    if (item.data === data) {
      const minExistente = horaParaMinutos(item.hora);
      const diferenca = Math.abs(minNovo - minExistente);
      return diferenca < 30;
    }
    return false;
  });

  if (conflito) {
    alert("🚨 HORÁRIO INDISPONÍVEL! Já existe outro agendamento dentro da janela de 30 minutos deste horário. Escolha outro horário!");
    return;
  }

  agendamentosExistentes.push({
    corte: corteSelecionado ? corteSelecionado.nome : "Corte Padrão",
    data,
    hora
  });

  localStorage.setItem('barbearia_agendamentos', JSON.stringify(agendamentosExistentes));
  alert(`✅ AGENDAMENTO CONFIRMADO!\n\nCorte: ${corteSelecionado ? corteSelecionado.nome : 'Geral'}\nData: ${data}\nHorário: ${hora}`);
  document.getElementById('modalAgendamento').classList.add('hidden');
});
                        
