import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Button, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import { db } from '../config/Firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

export default function AgendaScreen({ navigation }) {
  const [agendamentos, setAgendamentos] = useState([]);

  // 🔄 Carrega lista do Firebase
  const carregarAgenda = async () => {
    try {
      const q = await getDocs(collection(db, "agendamentos"));
      let list = [];
      q.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });

      // ➕ Ordenar por data e hora corretamente
      list.sort((a, b) => {
        const dataA = `${a.data} ${a.hora}`;
        const dataB = `${b.data} ${b.hora}`;
        return dataA.localeCompare(dataB);
      });

      setAgendamentos(list);
    } catch (error) {
      Alert.alert("Erro", "Falha ao carregar agendamentos");
    }
  };

  // ❌ Excluir agendamento
  const deletarAgendamento = (id) => {
    Alert.alert(
      "Confirmar",
      "Deseja realmente deletar este agendamento?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Deletar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "agendamentos", id));
              carregarAgenda();
            } catch (error) {
              Alert.alert("Erro", "Não foi possível deletar");
            }
          }
        }
      ]
    );
  };

  // 🔁 Carregar ao abrir tela
  useEffect(() => { carregarAgenda(); }, []);

  // 🔁 Recarregar quando voltar para a tela
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', carregarAgenda);
    return unsubscribe;
  }, [navigation]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      
      <Text style={styles.title}>Agenda</Text>

      {agendamentos.length === 0 && (
        <Text style={{ marginTop:20, fontSize:16, opacity:0.5 }}>
          Nenhum agendamento encontrado.
        </Text>
      )}

      {agendamentos.map((a) => (
        <View key={a.id} style={styles.card}>
          <View style={styles.cardContent}>

            <View>
              <Text style={styles.cardText}>
                📅 {a.data} — ⏰ {a.hora}
              </Text>
              <Text style={styles.cardText}>
                💅 {a.nome} — {a.serv}
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.deleteBtn} 
              onPress={() => deletarAgendamento(a.id)}
            >
              <Text style={styles.deleteBtnText}>X</Text>
            </TouchableOpacity>

          </View>
        </View>
      ))}

      <TouchableOpacity 
        style={styles.newBtn}
        onPress={() => navigation.navigate("NovoAgendamento")}
      >
        <Text style={styles.newBtnText}>+ Novo Agendamento</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:{ 
    flexGrow:1,
    alignItems:'center', 
    padding:20 
  },
  title:{
    fontSize:30, 
    marginBottom:20, 
    fontWeight:'bold',
    color:'#d63384'
  },
  card:{
    backgroundColor:'#ffe6f7',
    padding:15,
    borderRadius:12,
    width:'100%',
    marginBottom:12,
    borderColor:'#ffb3da',
    borderWidth:1
  },
  cardContent:{
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center'
  },
  cardText:{
    fontSize:16,
    marginVertical:3,
    color:'#444'
  },
  deleteBtn:{
    backgroundColor:'#ff4d4d',
    width:40,
    height:40,
    borderRadius:8,
    alignItems:'center',
    justifyContent:'center'
  },
  deleteBtnText:{
    color:'white',
    fontSize:18,
    fontWeight:'bold'
  },
  newBtn:{
    backgroundColor:'#d63384',
    marginTop:25,
    padding:15,
    borderRadius:12,
    width:'100%',
    alignItems:'center'
  },
  newBtnText:{
    color:'white',
    fontSize:18,
    fontWeight:'bold'
  }
});
