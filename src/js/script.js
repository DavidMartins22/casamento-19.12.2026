// =========================================
// CONEXÃO COM O SUPABASE
// =========================================

// Dados do projeto Supabase
const SUPABASE_URL = "https://rirhllndepjbnflxfaob.supabase.co";
const SUPABASE_KEY = "sb_publishable_6yAUyWpsKyCNJKbVbyOWVw_TZuS3eXv";

// Certifique-se de que esta linha está exatamente com este nome:
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// =========================================
// CONFIGURAÇÃO DA Z-API (ENVIO AUTOMÁTICO)
// =========================================
const Z_API_URL = "https://api.z-api.io/instances/3FB9E64497D87155337C0E222DF99AA0/token/CE22EB85E00F483D4F195923/send-text"; 
const Z_API_CLIENT_TOKEN = "F846db06f883a4590860b85a021caced2S"; // Token de segurança


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
const formulario = document.getElementById("form-presenca");
const mensagemForm = document.getElementById("mensagem-form");

if (formulario && mensagemForm) {
  formulario.addEventListener("submit", async function (evento) {
    // Impede o recarregamento da página
    evento.preventDefault();

    // Obtém os dados preenchidos pelo convidado
    const nome = document.getElementById("nome").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const campoSelect = document.getElementById("confirmacao");
    const presenca = campoSelect ? campoSelect.value : "";

    // Verifica se todos os campos foram preenchidos
    if (!nome || !telefone || !presenca) {
      mensagemForm.textContent = "Por favor, preencha todos os campos.";
      return;
    }

    // Informa que o cadastro está sendo enviado
    mensagemForm.textContent = "Enviando sua confirmação...";

    try {
      // 1. SALVA NO BANCO DE DADOS DO SUPABASE
      const { error } = await supabaseClient.from("convidados").insert([
        { nome: nome, telefone: telefone, presenca: presenca }
      ]);

      // Verifica se ocorreu algum erro no banco de dados
      if (error) {
        console.error("Erro ao salvar no Supabase:", error);
        mensagemForm.textContent = "Não foi possível registrar sua presença. Tente novamente.";
        return;
      }

      // 2. DEFINE A MENSAGEM CORRETA CONFORME A RESPOSTA
      let mensagem;
      if (presenca === "Sim") {
        mensagem = `Olá, ${nome}! ❤️ Ficamos muito felizes com sua confirmação! Estamos preparando tudo com muito carinho para esse dia tão especial. Esperamos você no nosso casamento, dia 19 de dezembro de 2026! Com carinho, David & Luísa.`;
      } else {
        mensagem = `Olá, ${nome}! ❤️ Muito obrigado por nos avisar! Sentiremos sua falta nesse dia tão especial, mas ficamos felizes por fazer parte da sua história. Desejamos tudo de melhor para você! Com carinho, David & Luísa.`;
      }

      // Limpa o número deixando apenas os dígitos e garante o DDI do Brasil (55)
      let numeroLimpo = telefone.replace(/\D/g, "");
      if (!numeroLimpo.startsWith("55")) {
        numeroLimpo = "55" + numeroLimpo;
      }

      // 3. DISPARA O ENVIO INVISÍVEL EM SEGUNDO PLANO PELA Z-API
      const respostaZapi = await fetch(Z_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Client-Token": Z_API_CLIENT_TOKEN
        },
        body: JSON.stringify({
          phone: numeroLimpo,
          message: mensagem
        })
      });

      if (!respostaZapi.ok) {
        const erroZapi = await respostaZapi.json();
        console.error("Erro no disparo da Z-API:", erroZapi);
      }

      // Mostra a mensagem de sucesso final para o convidado
      mensagemForm.textContent = "Sua confirmação foi registrada com sucesso! ❤️";
      
      // Limpa o formulário na tela
      formulario.reset();

    } catch (erro) {
      console.error("Erro na comunicação geral:", erro);
      mensagemForm.textContent = "Ocorreu um erro ao processar. Tente novamente.";
    }
  });
} else {
  console.error("Formulário ou mensagem de confirmação não encontrados.");
}

// =========================================
// LISTA DE CONVIDADOS (ADMINISTRAÇÃO PÚBLICA)
// =========================================
const botaoLista = document.getElementById("mostrar-lista");
const listaConvidados = document.getElementById("lista-convidados");

if (botaoLista && listaConvidados) {
  // Esconde a lista inicialmente
  listaConvidados.style.display = "none";

  botaoLista.addEventListener("click", async function () {
    if (listaConvidados.style.display === "block") {
      listaConvidados.style.display = "none";
      botaoLista.textContent = "Mostrar convidados";
    } else {
      // Defesa simples contra acessos acidentais de convidados curiosos
      const senhaAdmin = "1234"; 
      const senhaDigitada = prompt("Digite a senha de administrador para visualizar a lista:");

      if (senhaDigitada !== senhaAdmin) {
        alert("Senha incorreta!");
        return;
      }

      listaConvidados.style.display = "block";
      botaoLista.textContent = "Ocultar convidados";
      listaConvidados.innerHTML = "<p>Carregando lista de convidados...</p>";

      try {
        // Busca os dados cadastrados diretamente do seu Supabase
        const { data, error } = await supabaseClient
          .from("convidados")
          .select("nome, telefone, presenca")
          .order("nome", { ascending: true });

        if (error) throw error;

        if (!data || data.length === 0) {
          listaConvidados.innerHTML = "<p>Nenhum convidado registrado ainda.</p>";
          return;
        }

        // Renderiza a tabela limpa estruturada em HTML
        let htmlLista = `
          <div style="margin-top: 15px; overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; background: #fff; color: #333; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              <thead>
                <tr style="background-color: #f4f4f4; font-weight: bold;">
                  <th style="padding: 12px 15px; border-bottom: 2px solid #ddd;">Nome</th>
                  <th style="padding: 12px 15px; border-bottom: 2px solid #ddd;">Telefone</th>
                  <th style="padding: 12px 15px; border-bottom: 2px solid #ddd;">Confirmou?</th>
                </tr>
              </thead>
              <tbody>
        `;

        data.forEach(item => {
          const corPresenca = item.presenca === "Sim" ? "green" : "red";
          htmlLista += `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px 15px;">${item.nome}</td>
              <td style="padding: 10px 15px;">${item.telefone}</td>
              <td style="padding: 10px 15px; color: ${corPresenca}; font-weight: bold;">${item.presenca}</td>
            </tr>
          `;
        });

        htmlLista += `
              </tbody>
            </table>
            <p style="margin-top: 10px; font-weight: bold; color: #fff;">Total de registros: ${data.length}</p>
          </div>
        `;

        listaConvidados.innerHTML = htmlLista;

      } catch (erro) {
        console.error("Erro ao carregar lista:", erro);
        listaConvidados.innerHTML = "<p>Erro ao carregar a lista. Certifique-se de que o RLS do Supabase permite a leitura pública.</p>";
      }
    }
  });
}
