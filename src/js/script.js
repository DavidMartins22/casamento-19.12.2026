// =========================================
// CONEXÃO COM O SUPABASE
// =========================================

// Dados do projeto Supabase
const SUPABASE_URL = "https://rirhllndepjbnflxfaob.supabase.co";
const SUPABASE_KEY = "sb_publishable_6yAUyWpsKyCNJKbVbyOWVw_TZuS3eXv";

// Cria a conexão com o Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// =========================================
// CONTAGEM REGRESSIVA
// =========================================

// Data do casamento: 19 de dezembro de 2026
const dataCasamento = new Date("2026-12-19T00:00:00");

// Seleciona o espaço onde ficará a contagem
const inicioConteudo = document.querySelector(".inicio-conteudo");

if (inicioConteudo) {
  const contador = document.createElement("p");
  contador.classList.add("contador");
  inicioConteudo.appendChild(contador);

  // Atualiza a contagem regressiva
  function atualizarContagem() {
    const agora = new Date();
    const diferenca = dataCasamento - agora;

    if (diferenca <= 0) {
      contador.textContent = "O nosso grande dia chegou!";
      return;
    }

    const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));

    contador.textContent = `Faltam ${dias} dias para o nosso casamento!`;
  }

  atualizarContagem();
}

// =========================================
// CONFIRMAÇÃO DE PRESENÇA
// =========================================

// Seleciona os elementos do formulário
const formulario = document.getElementById("form-presenca");
const mensagemForm = document.getElementById("mensagem-form");

// Quando o formulário for enviado
if (formulario && mensagemForm) {
  formulario.addEventListener("submit", async function (evento) {
    // Impede o recarregamento da página
    evento.preventDefault();

    // Obtém os dados preenchidos pelo convidado
    const nome = document.getElementById("nome").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const presenca = document.getElementById("presenca").value;

    // Verifica se os campos estão preenchidos
    if (!nome || !telefone || !presenca) {
      mensagemForm.textContent = "Preencha todos os campos.";
      return;
    }

    // Informa que o cadastro está sendo enviado
    mensagemForm.textContent = "Enviando sua confirmação...";

    // Envia os dados para a tabela convidados
    const { error } = await supabaseClient.from("convidados").insert([
      {
        nome: nome,
        telefone: telefone,
        presenca: presenca,
      },
    ]);

    // Verifica se ocorreu algum erro
    if (error) {
      console.error("Erro ao salvar convidado:", error);

      mensagemForm.textContent =
        "Não foi possível registrar sua presença. Tente novamente.";

      return;
    }

    // Mostra a mensagem de sucesso
    mensagemForm.textContent = "Sua confirmação foi registrada com sucesso! ❤️";

    // Limpa o formulário
    formulario.reset();
  });
}

// =========================================
// LISTA DE CONVIDADOS
// =========================================

// Seleciona os elementos da lista
const botaoLista = document.getElementById("mostrar-lista");
const listaConvidados = document.getElementById("lista-convidados");

// Esconde a lista inicialmente
if (botaoLista && listaConvidados) {
  listaConvidados.style.display = "none";

  // Mostra ou esconde a lista de convidados
  botaoLista.addEventListener("click", function () {
    if (listaConvidados.style.display === "block") {
      listaConvidados.style.display = "none";
      botaoLista.textContent = "Mostrar convidados";
    } else {
      listaConvidados.style.display = "block";
      botaoLista.textContent = "Ocultar convidados";

      // A lista administrativa será implementada
      // após configurarmos o acesso do administrador.
      listaConvidados.textContent =
        "A lista de convidados será disponibilizada na área administrativa.";
    }
  });
}

// =========================================
// WHATSAPP
// =========================================

// Abre o WhatsApp com uma mensagem personalizada
function enviarWhatsApp(convidado) {
  // Remove caracteres que não sejam números
  const telefone = convidado.telefone.replace(/\D/g, "");

  // Adiciona o código do Brasil, caso necessário
  const numero = telefone.startsWith("55") ? telefone : "55" + telefone;

  // Define a mensagem conforme a confirmação
  let mensagem;

  if (convidado.presenca === "Sim") {
    mensagem = `Olá, ${convidado.nome}! ❤️

Ficamos muito felizes com sua confirmação!

Estamos preparando tudo com muito carinho para esse dia tão especial.

Esperamos você no nosso casamento, dia 19 de dezembro de 2026!

Com carinho, David & Luísa.`;
  } else {
    mensagem = `Olá, ${convidado.nome}! ❤️

Muito obrigado por nos avisar!

Sentiremos sua falta nesse dia tão especial, mas ficamos felizes por fazer parte da sua história.

Desejamos tudo de melhor para você!

Com carinho, David & Luísa.`;
  }

  // Codifica a mensagem para utilizar na URL
  const mensagemCodificada = encodeURIComponent(mensagem);

  // Abre o WhatsApp com a mensagem pronta
  window.open(`https://wa.me/${numero}?text=${mensagemCodificada}`, "_blank");
}
