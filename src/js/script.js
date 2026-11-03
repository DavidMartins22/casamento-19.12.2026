// =========================================
// CONEXÃO COM O SUPABASE
// =========================================

// Dados do projeto Supabase
const SUPABASE_URL = "https://rirhllndepjbnflxfaob.supabase.co";
const SUPABASE_KEY = "sb_publishable_6yAUyWpsKyCNJKbVbyOWVw_TZuS3eXv";

// Certifique-se de que esta linha está exatamente com este nome:
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// =========================================
// CONFIRMAÇÃO DE PRESENÇA (Passo 1 Integrado)
// =========================================
const formulario = document.getElementById("form-presenca");
const mensagemForm = document.getElementById("mensagem-form");

if (formulario && mensagemForm) {
  formulario.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const campoSelect = document.getElementById("confirmacao");
    const presenca = campoSelect ? campoSelect.value : "";

    if (!nome || !telefone || !presenca) {
      mensagemForm.textContent = "Por favor, preencha todos os campos.";
      return;
    }

    mensagemForm.textContent = "Enviando sua confirmação...";

    try {
      const dadosConvidado = { nome, telefone, presenca };

      const { error } = await supabaseClient.from("convidados").insert([dadosConvidado]);

      if (error) {
        console.error("Erro ao salvar convidado:", error);
        mensagemForm.textContent = "Não foi possível registrar sua presença. Tente novamente.";
        return;
      }

      mensagemForm.textContent = "Sua confirmação foi registrada com sucesso! ❤️";
      formulario.reset();

      // === PASSO 1: Dispara o WhatsApp automaticamente após o sucesso ===
      setTimeout(() => {
        enviarWhatsApp(dadosConvidado);
      }, 1000);

    } catch (erro) {
      console.error("Erro na comunicação com o Supabase:", erro);
      mensagemForm.textContent = "Ocorreu um erro na comunicação. Tente novamente.";
    }
  });
}

// =========================================
// LISTA DE CONVIDADOS (Passo 2 Realtime + Segurança)
// =========================================
const botaoLista = document.getElementById("mostrar-lista");
const listaConvidados = document.getElementById("lista-convidados");

if (botaoLista && listaConvidados) {
  listaConvidados.style.display = "none";

  botaoLista.addEventListener("click", async function () {
    if (listaConvidados.style.display === "block") {
      listaConvidados.style.display = "none";
      botaoLista.textContent = "Mostrar convidados";
    } else {
      // Defina uma senha simples para evitar que qualquer convidado curioso veja a lista completa
      const senhaAdmin = "casamento@2026"; // 💡 Altere aqui para a senha que você preferir!
      const senhaDigitada = prompt("Digite a senha de administrador para visualizar a lista:");

      if (senhaDigitada !== senhaAdmin) {
        alert("Senha incorreta!");
        return;
      }

      listaConvidados.style.display = "block";
      botaoLista.textContent = "Ocultar convidados";
      listaConvidados.innerHTML = "<p>Carregando lista de convidados...</p>";

      try {
        // Busca os dados diretamente do Supabase ordenando por nome
        const { data, error } = await supabaseClient
          .from("convidados")
          .select("nome, telefone, presenca")
          .order("nome", { ascending: true });

        if (error) throw error;

        if (!data || data.length === 0) {
          listaConvidados.innerHTML = "<p>Nenhum convidado registrado ainda.</p>";
          return;
        }

        // Cria a estrutura visual da lista
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
        listaConvidados.innerHTML = "<p>Erro ao carregar a lista. Certifique-se de que o RLS do Supabase permite a leitura (SELECT) pública.</p>";
      }
    }
  });
}

// =========================================
// FUNÇÃO DO WHATSAPP (Original mantida)
// =========================================
function enviarWhatsApp(convidado) {
  const telefone = convidado.telefone.replace(/\D/g, "");
  const numero = telefone.startsWith("55") ? telefone : "55" + telefone;
  let mensagem;

  if (convidado.presenca === "Sim") {
    mensagem = `Olá, ${convidado.nome}! ❤️ Ficamos muito felizes com sua confirmação! Estamos preparando tudo com muito carinho para esse dia tão especial. Esperamos você no nosso casamento, dia 19 de dezembro de 2026! Com carinho, David & Luísa.`;
  } else {
    mensagem = `Olá, ${convidado.nome}! ❤️ Muito obrigado por nos avisar! Sentiremos sua falta nesse dia tão especial, mas ficamos felizes por fazer parte da sua história. Desejamos tudo de melhor para você! Com carinho, David & Luísa.`;
  }

  const mensagemCodificada = encodeURIComponent(mensagem);
  window.open(`https://wa.me{numero}?text=${mensagemCodificada}`, "_blank");
}
