import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SectionList, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { db } from '../config/Firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';

// Função para formatar data
function formatarData(data) {
  if (data?.toDate) return data.toDate().toLocaleDateString("pt-BR");
  return data;
}

// Card de agendamento
const AppointmentCard = React.memo(({ item, onDelete }) => {
  const agora = new Date();
  const horaParts = item.hora.split(':');
  const itemHora = new Date(item.data?.toDate ? item.data.toDate() : item.data);
  itemHora.setHours(Number(horaParts[0]), Number(horaParts[1]));

  const isPassado = itemHora < agora;

  return (
    <Swipeable renderRightActions={() => (
      <TouchableOpacity style={styles.deleteBtnSwipe} onPress={() => onDelete(item.id)}>
        <Text style={styles.deleteBtnText}>🗑️</Text>
      </TouchableOpacity>
    )}>
      <View style={[styles.card, isPassado && styles.cardPast]}>
        <Text style={[styles.cardHighlight, isPassado && styles.cardHighlightPast]}>
          👤 {item.nome} — ⏰ {item.hora}
        </Text>
        <Text style={styles.cardDetails}>💅 {item.serv}</Text>
        {item.observacoes && <Text style={styles.cardNotes}>📝 {item.observacoes}</Text>}
      </View>
    </Swipeable>
  );
});

export default function AgendaScreen({ navigation }) {
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregarAgenda = useCallback(() => {
    setLoading(true);
    try {
      const q = query(collection(db, "agendamentos"), orderBy("data", "desc"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const list = [];
        querySnapshot.forEach(docSnap => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        setAgendamentos(list);
        setLoading(false);
        setRefreshing(false);
      }, error => {
        console.error(error.message);
        Alert.alert("Erro", `Falha ao carregar agendamentos: ${error.message}`);
        setLoading(false);
        setRefreshing(false);
      });
      return unsubscribe;
    } catch (error) {
      console.error(error.message);
      setLoading(false);
      setRefreshing(false);
      return null;
    }
  }, []);

  const deletarAgendamento = useCallback((id) => {
    Alert.alert(
      "Confirmar Exclusão",
      "Deseja realmente deletar este agendamento?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Deletar", style: "destructive", onPress: async () => {
          try { await deleteDoc(doc(db, "agendamentos", id)); } 
          catch { Alert.alert("Erro", "Falha ao deletar agendamento"); }
        } }
      ]
    );
  }, []);

  const onRefresh = useCallback(() => { setRefreshing(true); carregarAgenda(); }, [carregarAgenda]);

  useEffect(() => { const unsubscribe = carregarAgenda(); return () => unsubscribe && unsubscribe(); }, [carregarAgenda]);

  // Agrupar por data
  const sections = agendamentos.reduce((acc, ag) => {
    const dataKey = formatarData(ag.data);
    const section = acc.find(s => s.title === dataKey);
    if (section) section.data.push(ag);
    else acc.push({ title: dataKey, data: [ag] });
    return acc;
  }, []).sort((a, b) => new Date(a.title.split('/').reverse().join('-')) - new Date(b.title.split('/').reverse().join('-')));

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      {loading ? <ActivityIndicator size="large" color="#d63384" /> : (
        <>
          <Text style={styles.emptyTitle}>📅 Agenda Vazia</Text>
          <Text style={styles.emptySubtext}>Toque no botão abaixo para criar um novo agendamento!</Text>
        </>
      )}
    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <AppointmentCard item={item} onDelete={deletarAgendamento} />}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#d63384']} tintColor="#d63384" />}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={{ paddingBottom: 80, paddingHorizontal: 16 }}
        />

        <TouchableOpacity style={styles.newBtn} onPress={() => navigation.navigate("NovoAgendamento")}>
          <Text style={styles.newBtnText}>+ Novo Agendamento</Text>
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  sectionHeader: { fontSize: 18, fontWeight: '700', color: '#d63384', marginTop: 20, marginBottom: 8 },
  card: { backgroundColor: '#ffe6f7', padding: 16, borderRadius: 16, marginBottom: 12, borderColor: '#ffb3da', borderWidth: 1 },
  cardPast: { backgroundColor: '#f0f0f0' },
  cardHighlight: { fontSize: 18, fontWeight: '700', color: '#d63384', marginBottom: 4 },
  cardHighlightPast: { color: '#999' },
  cardDetails: { fontSize: 14, color: '#333', marginBottom: 2 },
  cardNotes: { fontSize: 13, color: '#777', fontStyle: 'italic', marginTop: 2 },
  deleteBtnSwipe: { backgroundColor: '#ff4d4d', width: 60, justifyContent: 'center', alignItems: 'center', borderRadius: 16, marginVertical: 8 },
  deleteBtnText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  newBtn: { backgroundColor: '#d63384', margin: 16, padding: 16, borderRadius: 16, alignItems: 'center', position: 'absolute', bottom: 0, left: 16, right: 16, elevation: 5 },
  newBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 24, fontWeight: 'bold', color: '#d63384', marginBottom: 12 },
  emptySubtext: { fontSize: 14, color: '#999', textAlign: 'center', fontStyle: 'italic' }
});
