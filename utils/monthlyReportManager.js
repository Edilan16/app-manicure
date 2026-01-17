import { collection, getDocs, addDoc, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../config/Firebase';

/**
 * Obtém o primeiro e último dia do mês atual
 */
export function getCurrentMonthRange() {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  
  return {
    start: Timestamp.fromDate(firstDay),
    end: Timestamp.fromDate(lastDay),
    mesAno: `${now.getMonth() + 1}/${now.getFullYear()}`,
    mes: now.getMonth() + 1,
    ano: now.getFullYear()
  };
}

/**
 * Verifica se precisa arquivar o mês anterior
 * Retorna true se ainda não existe relatório para o mês anterior
 */
export async function verificarArquivamentoNecessario() {
  const now = new Date();
  const mesAnterior = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const mesAnoAnterior = `${mesAnterior.getMonth() + 1}/${mesAnterior.getFullYear()}`;
  
  try {
    const q = query(
      collection(db, 'relatorios_mensais'),
      where('mesAno', '==', mesAnoAnterior)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.empty; // Retorna true se ainda não existe relatório
  } catch (error) {
    console.error('Erro ao verificar arquivamento:', error);
    return false;
  }
}

/**
 * Arquiva os dados do mês anterior em um relatório mensal
 */
export async function arquivarMesAnterior() {
  try {
    const now = new Date();
    const mesAnterior = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const mesAnoAnterior = `${mesAnterior.getMonth() + 1}/${mesAnterior.getFullYear()}`;
    
    // Verificar se já existe relatório para este mês
    const verificacao = await verificarArquivamentoNecessario();
    if (!verificacao) {
      console.log('Relatório do mês anterior já existe');
      return { success: true, message: 'Relatório já existe' };
    }
    
    // Buscar todos os lançamentos do mês anterior
    const primeiroDia = new Date(mesAnterior.getFullYear(), mesAnterior.getMonth(), 1);
    const ultimoDia = new Date(mesAnterior.getFullYear(), mesAnterior.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const q = query(
      collection(db, 'financeiro'),
      where('data', '>=', Timestamp.fromDate(primeiroDia)),
      where('data', '<=', Timestamp.fromDate(ultimoDia))
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log('Nenhum dado para arquivar do mês anterior');
      return { success: true, message: 'Sem dados para arquivar' };
    }
    
    // Calcular totalizadores
    let totalReceita = 0;
    let totalDespesa = 0;
    let totalPix = 0;
    let totalCartao = 0;
    let totalDinheiro = 0;
    
    const lancamentos = [];
    const receitasPorServico = {};
    const despesasPorCategoria = {};
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const r = Number(data.receita) || 0;
      const d = Number(data.despesa) || 0;
      
      totalReceita += r;
      totalDespesa += d;
      
      if (r > 0) {
        const metodo = (data.metodoPagamento || "").toLowerCase().trim();
        switch (metodo) {
          case "pix":
            totalPix += r;
            break;
          case "cartão":
          case "cartao":
            totalCartao += r;
            break;
          case "dinheiro":
            totalDinheiro += r;
            break;
        }
        
        // Agrupar por serviço
        const servico = data.descricaoReceita || "Outros";
        receitasPorServico[servico] = (receitasPorServico[servico] || 0) + r;
      }
      
      if (d > 0) {
        // Agrupar por categoria de despesa
        const categoria = data.descricaoDespesa || "Outros";
        despesasPorCategoria[categoria] = (despesasPorCategoria[categoria] || 0) + d;
      }
      
      // Armazenar lançamento completo
      lancamentos.push({
        id: doc.id,
        ...data,
        dataTimestamp: data.data
      });
    });
    
    // Criar documento do relatório mensal
    const relatorio = {
      mesAno: mesAnoAnterior,
      mes: mesAnterior.getMonth() + 1,
      ano: mesAnterior.getFullYear(),
      totalReceita,
      totalDespesa,
      lucro: totalReceita - totalDespesa,
      totalPix,
      totalCartao,
      totalDinheiro,
      receitasPorServico,
      despesasPorCategoria,
      quantidadeLancamentos: lancamentos.length,
      dataArquivamento: new Date(),
      // Não armazenar os lançamentos individuais para economizar espaço
      // Os dados originais permanecem na collection 'financeiro'
    };
    
    // Salvar relatório
    await addDoc(collection(db, 'relatorios_mensais'), relatorio);
    
    console.log(`Relatório do mês ${mesAnoAnterior} arquivado com sucesso`);
    return { success: true, message: 'Relatório arquivado com sucesso', relatorio };
    
  } catch (error) {
    console.error('Erro ao arquivar mês anterior:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Busca todos os relatórios mensais arquivados
 */
export async function buscarRelatoriosMensais() {
  try {
    const snapshot = await getDocs(collection(db, 'relatorios_mensais'));
    const relatorios = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Ordenar por ano e mês (mais recentes primeiro)
    relatorios.sort((a, b) => {
      if (a.ano !== b.ano) return b.ano - a.ano;
      return b.mes - a.mes;
    });
    
    return relatorios;
  } catch (error) {
    console.error('Erro ao buscar relatórios mensais:', error);
    return [];
  }
}

/**
 * Busca lançamentos do mês especificado da collection financeiro
 */
export async function buscarLancamentosMes(mes, ano) {
  try {
    const primeiroDia = new Date(ano, mes - 1, 1);
    const ultimoDia = new Date(ano, mes, 0, 23, 59, 59, 999);
    
    const q = query(
      collection(db, 'financeiro'),
      where('data', '>=', Timestamp.fromDate(primeiroDia)),
      where('data', '<=', Timestamp.fromDate(ultimoDia))
    );
    
    const snapshot = await getDocs(q);
    const lancamentos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return lancamentos;
  } catch (error) {
    console.error('Erro ao buscar lançamentos do mês:', error);
    return [];
  }
}
