import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator
} from 'react-native';
import { db } from '../config/Firebase';
import { collection, onSnapshot, query, orderBy, where, deleteDoc, doc } from 'firebase/firestore';
import { getCurrentMonthRange } from '../utils/monthlyReportManager';

export default function GerenciarLancamentosScreen({ navigation }) {
  const [lancamentos, setLancamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mesAtual, setMesAtual] = useState('');

  useEffect(() => {
    const { start, end, mesAno } = getCurrentMonthRange();
    setMesAtual(mesAno);
    
    const q = query(
      collection(db, 'financeiro'),
      where('data', '>=', start),
      where('data', '<=', end),
      orderBy('data', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dados = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLancamentos(dados);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const excluirLancamento = async (lancamento) => {
    const valor = Number(lancamento.receita || lancamento.despesa || 0);
    const tipo = lancamento.receita > 0 ? "Receita" : "Despesa";
    const descricao = lancamento.descricaoReceita || lancamento.descricaoDespesa || "Lançamento";

    if (Platform.OS === 'web') {
      const confirmar = window.confirm(
        `Deseja realmente excluir este lançamento?\n\n${tipo}: R$ ${valor.toFixed(2)}\n${descricao}`
      );
      if (!confirmar) return;
    } else {
      Alert.alert(
        'Excluir Lançamento',
        `Deseja realmente excluir este lançamento?\n\n${tipo}: R$ ${valor.toFixed(2)}\n${descricao}`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Excluir',
            style: 'destructive',
            onPress: async () => {
              await executarExclusao(lancamento.id);
            }
          }
        ]
      );
      return;
    }

    await executarExclusao(lancamento.id);
  };

  const executarExclusao = async (id) => {
    try {
      await deleteDoc(doc(db, 'financeiro', id));
      
      if (Platform.OS === 'web') {
        window.alert('Lançamento excluído com sucesso!');
      } else {
        Alert.alert('Sucesso', 'Lançamento excluído com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao excluir:', error);
      if (Platform.OS === 'web') {
        window.alert('Erro ao excluir lançamento');
      } else {
        Alert.alert('Erro', 'Não foi possível excluir o lançamento');
      }
    }
  };

  const formatarMoeda = (valor) => {
    return valor.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Gerenciar Lançamentos</Text>
        <Text style={styles.subtitle}>Mês: {mesAtual}</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EB69A3" />
          <Text style={styles.loadingText}>Carregando lançamentos...</Text>
        </View>
      ) : lancamentos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>💰</Text>
          <Text style={styles.emptyTitle}>Nenhum lançamento</Text>
          <Text style={styles.emptySubtitle}>
            Adicione receitas ou despesas para vê-las aqui
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          <Text style={styles.totalText}>
            Total de {lancamentos.length} lançamento{lancamentos.length !== 1 ? 's' : ''}
          </Text>
          
          {lancamentos.map((item) => {
            const valor = Number(item.receita || item.despesa || 0);
            const tipo = item.receita > 0 ? "Receita" : "Despesa";
            const descricao = item.descricaoReceita || item.descricaoDespesa || "-";

            return (
              <View 
                key={item.id} 
                style={[
                  styles.lancamentoCard,
                  { borderLeftColor: tipo === "Receita" ? '#4caf50' : '#f44336' }
                ]}
              >
                <View style={styles.lancamentoHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.tipoText, { color: tipo === "Receita" ? '#4caf50' : '#f44336' }]}>
                      {tipo === "Receita" ? "✅" : "❌"} {tipo}
                    </Text>
                    <Text style={styles.valorText}>R$ {formatarMoeda(valor)}</Text>
                  </View>
                  
                  <TouchableOpacity 
                    onPress={() => excluirLancamento(item)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteIcon}>🗑️</Text>
                    <Text style={styles.deleteText}>Excluir</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.lancamentoBody}>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Descrição:</Text>
                    <Text style={styles.value}>{descricao}</Text>
                  </View>
                  
                  {item.metodoPagamento && (
                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Método:</Text>
                      <Text style={styles.value}>{item.metodoPagamento}</Text>
                    </View>
                  )}
                  
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Data:</Text>
                    <Text style={styles.value}>
                      {item.data?.seconds 
                        ? new Date(item.data.seconds * 1000).toLocaleString("pt-BR")
                        : "-"}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}

          <View style={{ height: 30 }} />
        </ScrollView>
      )}
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
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
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
  totalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  lancamentoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lancamentoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tipoText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  valorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  deleteText: {
    color: '#f44336',
    fontSize: 14,
    fontWeight: '600',
  },
  lancamentoBody: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  value: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
});
