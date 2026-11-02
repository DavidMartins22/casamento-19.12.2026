
// =========================================
// CONTAGEM REGRESSIVA
// =========================================

// Data do casamento: 27 de dezembro de 2026
// Altere a data abaixo se o casamento mudar de dia.
const dataCasamento = new Date("2026-12-27T00:00:00");

const contador = document.createElement("p");
contador.classList.add("contador");

document.querySelector(".inicio-conteudo").appendChild(contador);

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

// Executa a contagem regressiva
atualizarContagem();


// =========================================
// CONFIRMAÇÃO DE PRESENÇA
// =========================================

// Seleciona os elementos do formulário
const formulario = document.getElementById("form-presenca");
const mensagemForm = document.getElementById("mensagem-form");

// Recupera os convidados salvos no navegador.
// Se não existir nenhum registro, começa com uma lista vazia.
let convidados = JSON.parse(localStorage.getItem("convidados")) || [];

// Salva a lista atualizada no navegador
function salvarConvidados() {
    localStorage.setItem("convidados", JSON.stringify(convidados));
}

// Quando o formulário for enviado
formulario.addEventListener("submit", function(evento) {

    // Impede o recarregamento da página
    evento.preventDefault();

    // Obtém os dados preenchidos pelo convidado
    const nome = document.getElementById("nome").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const presenca = document.getElementById("presenca").value;

    // Cria um objeto com os dados do convidado
    const convidado = {
        id: Date.now(),
        nome: nome,
        telefone: telefone,
        presenca: presenca
    };

    // Adiciona o convidado à lista
    convidados.push(convidado);

    // Salva os dados no navegador
    salvarConvidados();

    // Mostra uma mensagem de confirmação
    mensagemForm.textContent = "Presença registrada com sucesso!";

    // Limpa o formulário
    formulario.reset();

    // Atualiza a lista de convidados
    mostrarConvidados();
});


// =========================================
// LISTA DE CONVIDADOS
// =========================================

const botaoLista = document.getElementById("mostrar-lista");
const listaConvidados = document.getElementById("lista-convidados");

// Esconde a lista inicialmente
listaConvidados.style.display = "none";

// Mostra ou esconde a lista de convidados
botaoLista.addEventListener("click", function() {

    if (listaConvidados.style.display === "block") {

        listaConvidados.style.display = "none";
        botaoLista.textContent = "Mostrar convidados";

    } else {

        listaConvidados.style.display = "block";
        botaoLista.textContent = "Ocultar convidados";

        mostrarConvidados();
    }

});


// =========================================
// EXIBIR CONVIDADOS
// =========================================

// Exibe todos os convidados registrados
function mostrarConvidados() {

    // Limpa a lista antes de atualizar
    listaConvidados.innerHTML = "";

    // Verifica se existem convidados registrados
    if (convidados.length === 0) {
        listaConvidados.textContent = "Nenhum convidado registrado.";
        return;
    }

    // Percorre todos os convidados
    convidados.forEach(function(convidado) {

        // Cria o bloco de cada convidado
        const bloco = document.createElement("div");
        bloco.classList.add("convidado");

        // Cria a área de informações do convidado
        const informacoes = document.createElement("div");

        const nome = document.createElement("p");
        nome.textContent = `Nome: ${convidado.nome}`;

        const telefone = document.createElement("p");
        telefone.textContent = `Telefone: ${convidado.telefone}`;

        const presenca = document.createElement("p");
        presenca.textContent = `Presença: ${convidado.presenca}`;

        // Adiciona as informações ao bloco
        informacoes.append(nome, telefone, presenca);


        // =========================================
        // BOTÃO DE ENVIO PELO WHATSAPP
        // =========================================

        const botaoWhatsApp = document.createElement("button");

        botaoWhatsApp.textContent = "Enviar confirmação pelo WhatsApp";
        botaoWhatsApp.classList.add("botao-excluir");

        // Ao clicar, abre o WhatsApp com uma mensagem personalizada
        botaoWhatsApp.addEventListener("click", function() {

            // Remove caracteres que não sejam números do telefone
            const telefone = convidado.telefone.replace(/\D/g, "");

            // Verifica se o telefone possui DDD e adiciona o código do Brasil
            const numero = telefone.startsWith("55")
                ? telefone
                : "55" + telefone;

            // Verifica qual mensagem será enviada
            let mensagem;

            if (convidado.presenca === "Sim") {

                // Mensagem para quem confirmou presença
                mensagem = `Olá, ${convidado.nome}! ❤️

Ficamos muito felizes com sua confirmação!

Estamos preparando tudo com muito carinho para esse dia tão especial.

Esperamos você no nosso casamento, dia 27 de dezembro de 2026!

Com carinho, David & Luísa.`;

            } else {

                // Mensagem para quem não poderá comparecer
                mensagem = `Olá, ${convidado.nome}! ❤️

Muito obrigado por nos avisar!

Sentiremos sua falta nesse dia tão especial, mas ficamos felizes por fazer parte da sua história.

Desejamos tudo de melhor para você!

Com carinho, David & Luísa.`;

            }

            // Codifica a mensagem para utilizar na URL
            const mensagemCodificada = encodeURIComponent(mensagem);

            // Monta o endereço do WhatsApp
            const linkWhatsApp = `https://wa.me/${numero}?text=${mensagemCodificada}`;

            // Abre o WhatsApp em uma nova aba
            window.open(linkWhatsApp, "_blank");

        });


        // =========================================
        // BOTÃO PARA EXCLUIR CONVIDADO
        // =========================================

        const botaoExcluir = document.createElement("button");

        botaoExcluir.textContent = "Excluir";
        botaoExcluir.classList.add("botao-excluir");

        // Evento para excluir o convidado
        botaoExcluir.addEventListener("click", function() {
            excluirConvidado(convidado.id);
        });


        // =========================================
        // ADICIONAR ELEMENTOS À LISTA
        // =========================================

        bloco.append(informacoes, botaoWhatsApp, botaoExcluir);

        listaConvidados.appendChild(bloco);

    });

}


// =========================================
// EXCLUIR CONVIDADO
// =========================================

// Exclui um convidado pelo identificador
function excluirConvidado(id) {

    // Mantém somente os convidados com IDs diferentes
    convidados = convidados.filter(function(convidado) {
        return convidado.id !== id;
    });

    // Atualiza os dados salvos
    salvarConvidados();

    // Atualiza a lista exibida
    mostrarConvidados();
}
