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
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { enviarWhatsApp, criarMensagemLembrete, formatarTelefoneExibicao } from '../utils/whatsappHelper';

export default function LembretesScreen({ navigation }) {
  const [agendamentosPendentes, setAgendamentosPendentes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Calcular data de amanhã (início e fim do dia)
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    amanha.setHours(0, 0, 0, 0);
    
    const fimAmanha = new Date(amanha);
    fimAmanha.setHours(23, 59, 59, 999);
    
    const amanhaStr = amanha.toISOString().slice(0, 10);
    
    console.log('Buscando agendamentos para:', amanhaStr);
    
    const q = query(
      collection(db, 'agendamentos'),
      where('data', '==', amanhaStr),
      orderBy('hora')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const agendamentos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('Agendamentos encontrados:', agendamentos.length);
      setAgendamentosPendentes(agendamentos);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const enviarLembrete = async (agendamento) => {
    if (!agendamento.telefone) {
      if (Platform.OS === 'web') {
        window.alert('Este agendamento não tem telefone cadastrado.');
      } else {
        Alert.alert('Aviso', 'Este agendamento não tem telefone cadastrado.');
      }
      return;
    }

    try {
      const mensagem = criarMensagemLembrete(agendamento);
      await enviarWhatsApp(agendamento.telefone, mensagem);
    } catch (error) {
      console.error('Erro ao enviar WhatsApp:', error);
      if (Platform.OS === 'web') {
        window.alert('Erro ao abrir WhatsApp. Verifique se o número está correto.');
      } else {
        Alert.alert('Erro', 'Não foi possível abrir o WhatsApp.');
      }
    }
  };

  const enviarTodos = () => {
    const comTelefone = agendamentosPendentes.filter(a => a.telefone);
    
    if (comTelefone.length === 0) {
      if (Platform.OS === 'web') {
        window.alert('Nenhum agendamento tem telefone cadastrado.');
      } else {
        Alert.alert('Aviso', 'Nenhum agendamento tem telefone cadastrado.');
      }
      return;
    }

    const mensagem = `Você tem ${comTelefone.length} lembrete(s) para enviar. Deseja continuar?`;
    
    if (Platform.OS === 'web') {
      const confirmar = window.confirm(mensagem);
      if (confirmar) {
        comTelefone.forEach((agendamento, index) => {
          setTimeout(() => {
            enviarLembrete(agendamento);
          }, index * 2000); // 2 segundos entre cada mensagem
        });
      }
    } else {
      Alert.alert(
        'Enviar Lembretes',
        mensagem,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Enviar',
            onPress: () => {
              comTelefone.forEach((agendamento, index) => {
                setTimeout(() => {
                  enviarLembrete(agendamento);
                }, index * 2000);
              });
            }
          }
        ]
      );
    }
  };

  const formatarDataBonita = (dataStr) => {
    if (!dataStr) return '';
    const [ano, mes, dia] = dataStr.split('-');
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${dia} de ${meses[parseInt(mes) - 1]}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Lembretes de Amanhã</Text>
        <Text style={styles.subtitle}>Envie lembretes para seus clientes</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#25D366" />
          <Text style={styles.loadingText}>Carregando agendamentos...</Text>
        </View>
      ) : agendamentosPendentes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📅</Text>
          <Text style={styles.emptyTitle}>Nenhum agendamento amanhã</Text>
          <Text style={styles.emptySubtitle}>
            Quando houver agendamentos para o dia seguinte, eles aparecerão aqui
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              {agendamentosPendentes.length} agendamento(s) para amanhã
            </Text>
            <Text style={styles.infoSubtext}>
              {agendamentosPendentes.filter(a => a.telefone).length} com telefone
            </Text>
          </View>

          {agendamentosPendentes.filter(a => a.telefone).length > 0 && (
            <TouchableOpacity
              style={styles.enviarTodosButton}
              onPress={enviarTodos}
            >
              <Text style={styles.enviarTodosText}>
                📱 Enviar Todos os Lembretes
              </Text>
            </TouchableOpacity>
          )}

          <ScrollView style={styles.scrollView}>
            {agendamentosPendentes.map((agendamento) => (
              <View key={agendamento.id} style={styles.agendamentoCard}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.nomeText}>{agendamento.nome}</Text>
                    {agendamento.telefone ? (
                      <Text style={styles.telefoneText}>
                        📱 {formatarTelefoneExibicao(agendamento.telefone)}
                      </Text>
                    ) : (
                      <Text style={styles.semTelefoneText}>
                        ⚠️ Sem telefone cadastrado
                      </Text>
                    )}
                  </View>
                  <View style={styles.horaContainer}>
                    <Text style={styles.horaText}>{agendamento.hora}</Text>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  <Text style={styles.servicoText}>💅 {agendamento.serv}</Text>
                  <Text style={styles.dataText}>
                    📅 {formatarDataBonita(agendamento.data)}
                  </Text>
                  {agendamento.observacoes && (
                    <Text style={styles.obsText}>
                      📝 {agendamento.observacoes}
                    </Text>
                  )}
                </View>

                {agendamento.telefone && (
                  <TouchableOpacity
                    style={styles.enviarButton}
                    onPress={() => enviarLembrete(agendamento)}
                  >
                    <Text style={styles.enviarButtonText}>
                      💬 Enviar Lembrete
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <View style={{ height: 30 }} />
          </ScrollView>
        </>
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
    backgroundColor: '#25D366',
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
  emptyIcon: {
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
  infoContainer: {
    backgroundColor: '#fff',
    padding: 15,
    margin: 15,
    marginBottom: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  infoSubtext: {
    fontSize: 14,
    color: '#666',
  },
  enviarTodosButton: {
    backgroundColor: '#25D366',
    padding: 16,
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  enviarTodosText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 15,
  },
  agendamentoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  nomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  telefoneText: {
    fontSize: 14,
    color: '#25D366',
    fontWeight: '600',
  },
  semTelefoneText: {
    fontSize: 14,
    color: '#f44336',
    fontStyle: 'italic',
  },
  horaContainer: {
    backgroundColor: '#EB69A3',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  horaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardBody: {
    marginBottom: 12,
  },
  servicoText: {
    fontSize: 15,
    color: '#555',
    marginBottom: 5,
  },
  dataText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  obsText: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 5,
  },
  enviarButton: {
    backgroundColor: '#25D366',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  enviarButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});
