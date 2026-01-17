import { Linking, Platform } from 'react-native';

/**
 * Formata número de telefone para WhatsApp (remove caracteres especiais)
 */
export function formatarTelefoneWhatsApp(telefone) {
  if (!telefone) return '';
  
  // Remove tudo exceto números
  let numeroLimpo = telefone.replace(/\D/g, '');
  
  // Se o número não começar com 55 (código do Brasil), adiciona
  if (!numeroLimpo.startsWith('55')) {
    numeroLimpo = '55' + numeroLimpo;
  }
  
  return numeroLimpo;
}

/**
 * Abre o WhatsApp com mensagem pré-formatada
 * @param {string} telefone - Número com DDD (ex: 11999999999)
 * @param {string} mensagem - Texto da mensagem
 */
export async function enviarWhatsApp(telefone, mensagem) {
  const numeroLimpo = formatarTelefoneWhatsApp(telefone);
  
  if (!numeroLimpo) {
    throw new Error('Número de telefone inválido');
  }

  // Usa encodeURIComponent que preserva UTF-8 corretamente
  const mensagemCodificada = encodeURIComponent(mensagem);
  
  // URL do WhatsApp (funciona em web e mobile)
  const url = `https://wa.me/${numeroLimpo}?text=${mensagemCodificada}`;
  
  try {
    const supported = await Linking.canOpenURL(url);
    
    if (supported) {
      await Linking.openURL(url);
      return true;
    } else {
      // Se não conseguir abrir, tenta URL alternativa
      const urlAlternativa = `https://api.whatsapp.com/send?phone=${numeroLimpo}&text=${mensagemCodificada}`;
      await Linking.openURL(urlAlternativa);
      return true;
    }
  } catch (error) {
    console.error('Erro ao abrir WhatsApp:', error);
    throw error;
  }
}

/**
 * Cria mensagem de lembrete de agendamento
 */
export function criarMensagemLembrete(agendamento) {
  const { nome, data, hora, serv, observacoes } = agendamento;
  
  // Formatar data bonita
  let dataBonita = data;
  if (typeof data === 'string' && data.includes('-')) {
    const [ano, mes, dia] = data.split('-');
    dataBonita = `${dia}/${mes}/${ano}`;
  }
  
  // Mensagem com português correto, sem emojis para evitar problemas de codificação
  let mensagem = `Olá ${nome}!\n\n`;
  mensagem += `Este é um lembrete do seu agendamento:\n\n`;
  mensagem += `Data: ${dataBonita}\n`;
  mensagem += `Horário: ${hora}\n`;
  mensagem += `Serviço: ${serv}\n`;
  
  if (observacoes) {
    mensagem += `\nObservações: ${observacoes}\n`;
  }
  
  mensagem += `\nAguardo você!`;
  
  return mensagem;
}

/**
 * Cria mensagem personalizada
 */
export function criarMensagemPersonalizada(nome, mensagem) {
  return `Ola ${nome}!\n\n${mensagem}`;
}

/**
 * Valida número de telefone brasileiro
 */
export function validarTelefoneBR(telefone) {
  const numeroLimpo = formatarTelefoneWhatsApp(telefone);
  
  // Aceita com ou sem código do país
  // Formato: (55)11999999999 ou 11999999999
  const regex = /^(\d{2})?\d{10,11}$/;
  
  return regex.test(numeroLimpo);
}

/**
 * Formata telefone para exibição (11) 99999-9999
 */
export function formatarTelefoneExibicao(telefone) {
  const numeroLimpo = formatarTelefoneWhatsApp(telefone);
  
  if (numeroLimpo.length === 11) {
    return `(${numeroLimpo.slice(0, 2)}) ${numeroLimpo.slice(2, 7)}-${numeroLimpo.slice(7)}`;
  } else if (numeroLimpo.length === 10) {
    return `(${numeroLimpo.slice(0, 2)}) ${numeroLimpo.slice(2, 6)}-${numeroLimpo.slice(6)}`;
  }
  
  return telefone;
}

/**
 * Identifica agendamentos próximos (nas próximas 24h)
 */
export function identificarAgendamentosProximos(agendamentos) {
  const agora = new Date();
  const em24h = new Date(agora.getTime() + 24 * 60 * 60 * 1000);
  
  return agendamentos.filter(agendamento => {
    try {
      let dataAgendamento;
      
      // Se a data for um Timestamp do Firestore
      if (agendamento.data?.seconds) {
        dataAgendamento = new Date(agendamento.data.seconds * 1000);
      } 
      // Se for string YYYY-MM-DD
      else if (typeof agendamento.data === 'string') {
        const [ano, mes, dia] = agendamento.data.split('-');
        const [hora, minuto] = (agendamento.hora || '00:00').split(':');
        dataAgendamento = new Date(ano, mes - 1, dia, hora, minuto);
      }
      // Se for objeto Date
      else {
        dataAgendamento = new Date(agendamento.data);
      }
      
      // Verifica se está entre agora e 24h
      return dataAgendamento >= agora && dataAgendamento <= em24h;
    } catch (error) {
      console.error('Erro ao processar agendamento:', error);
      return false;
    }
  });
}
