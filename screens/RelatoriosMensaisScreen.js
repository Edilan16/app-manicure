import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import { buscarRelatoriosMensais, buscarLancamentosMes } from '../utils/monthlyReportManager';

export default function RelatoriosMensaisScreen({ navigation }) {
  const [relatorios, setRelatorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [relatorioSelecionado, setRelatorioSelecionado] = useState(null);
  const [lancamentos, setLancamentos] = useState([]);
  const [loadingLancamentos, setLoadingLancamentos] = useState(false);

  useEffect(() => {
    carregarRelatorios();
  }, []);

  const carregarRelatorios = async () => {
    setLoading(true);
    const dados = await buscarRelatoriosMensais();
    setRelatorios(dados);
    setLoading(false);
  };

  const visualizarDetalhes = async (relatorio) => {
    setRelatorioSelecionado(relatorio);
    setLoadingLancamentos(true);
    
    const lancamentosMes = await buscarLancamentosMes(relatorio.mes, relatorio.ano);
    setLancamentos(lancamentosMes);
    setLoadingLancamentos(false);
  };

  const voltarParaLista = () => {
    setRelatorioSelecionado(null);
    setLancamentos([]);
  };

  const formatarMoeda = (valor) => {
    return valor.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const obterNomeMes = (mes) => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return meses[mes - 1] || mes;
  };

  // ====================== VISUALIZAÇÃO DE LISTA ======================
  if (!relatorioSelecionado) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Relatórios Mensais</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#EB69A3" />
            <Text style={styles.loadingText}>Carregando relatórios...</Text>
          </View>
        ) : relatorios.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>📊</Text>
            <Text style={styles.emptyTitle}>Nenhum relatório encontrado</Text>
            <Text style={styles.emptySubtitle}>
              Os relatórios mensais serão criados automaticamente
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.scrollView}>
            {relatorios.map((relatorio) => {
              const lucro = relatorio.lucro || (relatorio.totalReceita - relatorio.totalDespesa);
              const porcentagemLucro = relatorio.totalReceita > 0 
                ? ((lucro / relatorio.totalReceita) * 100).toFixed(1)
                : 0;

              return (
                <TouchableOpacity
                  key={relatorio.id}
                  style={styles.relatorioCard}
                  onPress={() => visualizarDetalhes(relatorio)}
                >
                  <View style={styles.relatorioHeader}>
                    <Text style={styles.relatorioMes}>
                      {obterNomeMes(relatorio.mes)} {relatorio.ano}
                    </Text>
                    <Text style={styles.relatorioData}>
                      {relatorio.mesAno}
                    </Text>
                  </View>

                  <View style={styles.relatorioResumo}>
                    <View style={styles.resumoItem}>
                      <Text style={styles.resumoLabel}>Receitas</Text>
                      <Text style={[styles.resumoValor, styles.positivo]}>
                        R$ {formatarMoeda(relatorio.totalReceita)}
                      </Text>
                    </View>

                    <View style={styles.resumoItem}>
                      <Text style={styles.resumoLabel}>Despesas</Text>
                      <Text style={[styles.resumoValor, styles.negativo]}>
                        R$ {formatarMoeda(relatorio.totalDespesa)}
                      </Text>
                    </View>

                    <View style={styles.resumoItem}>
                      <Text style={styles.resumoLabel}>Lucro</Text>
                      <Text style={[styles.resumoValor, lucro >= 0 ? styles.positivo : styles.negativo]}>
                        R$ {formatarMoeda(lucro)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.relatorioFooter}>
                    <Text style={styles.footerText}>
                      💳 {relatorio.quantidadeLancamentos || 0} lançamentos
                    </Text>
                    <Text style={styles.footerText}>
                      📊 Margem: {porcentagemLucro}%
                    </Text>
                  </View>

                  <Text style={styles.verDetalhes}>Ver Detalhes →</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>
    );
  }

  // ====================== VISUALIZAÇÃO DE DETALHES ======================
  const lucro = relatorioSelecionado.lucro || 
    (relatorioSelecionado.totalReceita - relatorioSelecionado.totalDespesa);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={voltarParaLista} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          {obterNomeMes(relatorioSelecionado.mes)} {relatorioSelecionado.ano}
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Resumo Financeiro */}
        <View style={styles.detalhesCard}>
          <Text style={styles.detalhesTitle}>💰 Resumo Financeiro</Text>
          
          <View style={styles.detalhesRow}>
            <Text style={styles.detalhesLabel}>Receitas Totais:</Text>
            <Text style={[styles.detalhesValor, styles.positivo]}>
              R$ {formatarMoeda(relatorioSelecionado.totalReceita)}
            </Text>
          </View>

          <View style={styles.detalhesRow}>
            <Text style={styles.detalhesLabel}>Despesas Totais:</Text>
            <Text style={[styles.detalhesValor, styles.negativo]}>
              R$ {formatarMoeda(relatorioSelecionado.totalDespesa)}
            </Text>
          </View>

          <View style={[styles.detalhesRow, styles.lucroRow]}>
            <Text style={styles.detalhesLabelLucro}>Lucro Líquido:</Text>
            <Text style={[styles.detalhesValorLucro, lucro >= 0 ? styles.positivo : styles.negativo]}>
              R$ {formatarMoeda(lucro)}
            </Text>
          </View>
        </View>

        {/* Formas de Pagamento */}
        <View style={styles.detalhesCard}>
          <Text style={styles.detalhesTitle}>💳 Formas de Pagamento</Text>
          
          <View style={styles.detalhesRow}>
            <Text style={styles.detalhesLabel}>Pix:</Text>
            <Text style={styles.detalhesValor}>
              R$ {formatarMoeda(relatorioSelecionado.totalPix || 0)}
            </Text>
          </View>

          <View style={styles.detalhesRow}>
            <Text style={styles.detalhesLabel}>Cartão:</Text>
            <Text style={styles.detalhesValor}>
              R$ {formatarMoeda(relatorioSelecionado.totalCartao || 0)}
            </Text>
          </View>

          <View style={styles.detalhesRow}>
            <Text style={styles.detalhesLabel}>Dinheiro:</Text>
            <Text style={styles.detalhesValor}>
              R$ {formatarMoeda(relatorioSelecionado.totalDinheiro || 0)}
            </Text>
          </View>
        </View>

        {/* Top Serviços */}
        {relatorioSelecionado.receitasPorServico && 
         Object.keys(relatorioSelecionado.receitasPorServico).length > 0 && (
          <View style={styles.detalhesCard}>
            <Text style={styles.detalhesTitle}>⭐ Top Serviços</Text>
            {Object.entries(relatorioSelecionado.receitasPorServico)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([servico, valor], index) => (
                <View key={index} style={styles.detalhesRow}>
                  <Text style={styles.detalhesLabel}>{index + 1}. {servico}:</Text>
                  <Text style={[styles.detalhesValor, styles.positivo]}>
                    R$ {formatarMoeda(valor)}
                  </Text>
                </View>
              ))}
          </View>
        )}

        {/* Top Despesas */}
        {relatorioSelecionado.despesasPorCategoria && 
         Object.keys(relatorioSelecionado.despesasPorCategoria).length > 0 && (
          <View style={styles.detalhesCard}>
            <Text style={styles.detalhesTitle}>💸 Top Despesas</Text>
            {Object.entries(relatorioSelecionado.despesasPorCategoria)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([categoria, valor], index) => (
                <View key={index} style={styles.detalhesRow}>
                  <Text style={styles.detalhesLabel}>{index + 1}. {categoria}:</Text>
                  <Text style={[styles.detalhesValor, styles.negativo]}>
                    R$ {formatarMoeda(valor)}
                  </Text>
                </View>
              ))}
          </View>
        )}

        {/* Lançamentos */}
        <View style={styles.detalhesCard}>
          <Text style={styles.detalhesTitle}>📋 Todos os Lançamentos ({lancamentos.length})</Text>
          
          {loadingLancamentos ? (
            <ActivityIndicator size="small" color="#EB69A3" />
          ) : lancamentos.length === 0 ? (
            <Text style={styles.emptySubtitle}>Nenhum lançamento encontrado</Text>
          ) : (
            lancamentos
              .sort((a, b) => b.data.seconds - a.data.seconds)
              .map((item, index) => {
                const valor = Number(item.receita || item.despesa || 0);
                const tipo = item.receita > 0 ? "Receita" : "Despesa";
                const descricao = item.descricaoReceita || item.descricaoDespesa || "-";

                return (
                  <View 
                    key={item.id || index} 
                    style={[
                      styles.lancamentoItem,
                      { backgroundColor: tipo === "Receita" ? '#e8f5e9' : '#ffebee' }
                    ]}
                  >
                    <View style={styles.lancamentoHeader}>
                      <Text style={[styles.lancamentoTipo, { color: tipo === "Receita" ? 'green' : 'red' }]}>
                        {tipo === "Receita" ? "✅" : "❌"} {tipo}
                      </Text>
                      <Text style={styles.lancamentoValor}>R$ {formatarMoeda(valor)}</Text>
                    </View>
                    <Text style={styles.lancamentoDesc}>{descricao}</Text>
                    <View style={styles.lancamentoFooter}>
                      <Text style={styles.lancamentoMetodo}>{item.metodoPagamento || "-"}</Text>
                      <Text style={styles.lancamentoData}>
                        {item.data?.seconds 
                          ? new Date(item.data.seconds * 1000).toLocaleDateString("pt-BR")
                          : "-"}
                      </Text>
                    </View>
                  </View>
                );
              })
          )}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#EB69A3',
    padding: 20,
    paddingTop: 40,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 15,
  },
  relatorioCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  relatorioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  relatorioMes: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  relatorioData: {
    fontSize: 14,
    color: '#666',
  },
  relatorioResumo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  resumoItem: {
    flex: 1,
    alignItems: 'center',
  },
  resumoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  resumoValor: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  positivo: {
    color: '#4caf50',
  },
  negativo: {
    color: '#f44336',
  },
  relatorioFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  footerText: {
    fontSize: 13,
    color: '#666',
  },
  verDetalhes: {
    marginTop: 10,
    fontSize: 14,
    color: '#EB69A3',
    fontWeight: '600',
    textAlign: 'right',
  },
  detalhesCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detalhesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  detalhesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detalhesLabel: {
    fontSize: 15,
    color: '#555',
    flex: 1,
  },
  detalhesValor: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  lucroRow: {
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: '#eee',
  },
  detalhesLabelLucro: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  detalhesValorLucro: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  lancamentoItem: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  lancamentoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  lancamentoTipo: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  lancamentoValor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  lancamentoDesc: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  lancamentoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lancamentoMetodo: {
    fontSize: 13,
    color: '#666',
  },
  lancamentoData: {
    fontSize: 13,
    color: '#666',
  },
});
