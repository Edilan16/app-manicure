import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { db } from '../config/Firebase';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  deleteDoc, 
  doc
} from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
function formatarData(data) {
  // Se for Timestamp do Firestore
  if (data?.toDate) {
    return data.toDate().toLocaleDateString("pt-BR");
  }

  // Se for string normal
  return data;
}

// 📅 Componente de Card memoizado (evita re-render desnecessário)
const AppointmentCard = React.memo(({ item, onDelete }) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardDateTime}>
            📅 {formatarData(item.data)} — ⏰ {item.hora}
          </Text>

          <Text style={styles.cardDetails}>
            👤 {item.nome} — 💅 {item.serv}
          </Text>
          {item.observacoes && (
            <Text style={styles.cardNotes}>
              📝 {item.observacoes}
            </Text>
          )}
        </View>
        <TouchableOpacity 
          style={styles.deleteBtn} 
          onPress={() => onDelete(item.id)}
        >
          <Text style={styles.deleteBtnText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

export default function AgendaScreen({ navigation }) {
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 🔄 Carregar agendamentos com listener real-time
  const carregarAgenda = useCallback(() => {
    setLoading(true);

    try {
      const q = query(
        collection(db, "agendamentos"),
        orderBy("data", "desc")
      );

      // Usa onSnapshot para escutar mudanças em tempo real
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const list = [];
        querySnapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        setAgendamentos(list);
        setLoading(false);
        setRefreshing(false);
      }, (error) => {
        console.error('Erro ao escutar agendamentos:', error.message);
        Alert.alert("Erro", `Falha ao carregar agendamentos: ${error.message}`);
        setLoading(false);
        setRefreshing(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Erro ao configurar listener:', error.message);
      setLoading(false);
      setRefreshing(false);
      return null;
    }
  }, []);

  // ❌ Excluir agendamento
  const deletarAgendamento = useCallback((id) => {
    Alert.alert(
      "Confirmar Exclusão",
      "Deseja realmente deletar este agendamento?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Deletar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "agendamentos", id));
              // Listener real-time atualiza automaticamente
            } catch (error) {
              Alert.alert("Erro", "Falha ao deletar agendamento");
            }
          }
        }
      ]
    );
  }, []);

  // 🔁 Pull to Refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    carregarAgenda();
  }, [carregarAgenda]);

  // 🎯 Iniciar listener ao montar componente
  useEffect(() => {
    const unsubscribe = carregarAgenda();
    
    // Cleanup: desinscrever do listener ao desmontar
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [carregarAgenda]);

  // 📋 Componente de lista vazia
  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#d63384" />
          <Text style={styles.emptyText}>Carregando agenda...</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>📅 Agenda Vazia</Text>
        <Text style={styles.emptySubtext}>
          Toque no botão abaixo para criar um novo agendamento!
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.title}>📅 Agenda</Text>
      </View>

      {/* Lista Otimizada com FlatList */}
      <FlatList
        data={agendamentos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AppointmentCard item={item} onDelete={deletarAgendamento} />
        )}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#d63384']}
            tintColor="#d63384"
          />
        }
        ListEmptyComponent={renderEmpty}
        initialNumToRender={15}
      />

      {/* Botão Fixo */}
      <TouchableOpacity 
        style={styles.newBtn}
        onPress={() => navigation.navigate("NovoAgendamento")}
      >
        <Text style={styles.newBtnText}>+ Novo Agendamento</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#d63384',
    marginBottom: 8
  },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statsText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic'
  },
  weekText: {
    fontSize: 14,
    color: '#d63384',
    fontWeight: '500',
    backgroundColor: '#ffe6f7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80
  },
  card: {
    backgroundColor: '#ffe6f7',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderColor: '#ffb3da',
    borderWidth: 1,
    elevation: 2
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  cardInfo: {
    flex: 1,
    marginRight: 12
  },
  cardDateTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  cardDetails: {
    fontSize: 15,
    color: '#555',
    marginBottom: 4
  },
  cardNotes: {
    fontSize: 14,
    color: '#777',
    fontStyle: 'italic',
    marginTop: 4
  },
  deleteBtn: {
    backgroundColor: '#ff4d4d',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1
  },
  deleteBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  newBtn: {
    backgroundColor: '#d63384',
    margin: 16,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    elevation: 5
  },
  newBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#d63384',
    marginBottom: 12
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic'
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  footerText: {
    fontSize: 14,
    color: '#888',
    marginTop: 8
  }
});