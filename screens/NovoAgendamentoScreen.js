import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { db } from '../config/Firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function NovoAgendamentoScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [servico, setServico] = useState('');
  const [data, setData] = useState(new Date());
  const [hora, setHora] = useState(new Date());
  const [mostrarData, setMostrarData] = useState(false);
  const [mostrarHora, setMostrarHora] = useState(false);

  // 📌 Formatadores
  const formatarData = (date) =>
    `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;

  const formatarHora = (date) =>
    `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

  const salvar = async () => {
    if (!nome.trim() || !servico.trim()) {
      Alert.alert("Atenção", "Preencha todos os campos!");
      return;
    }

    try {
      await addDoc(collection(db, "agendamentos"), {
        nome: nome.trim(),
        serv: servico.trim(),
        data: formatarData(data),
        hora: formatarHora(hora)
      });

      Alert.alert("Sucesso", "Agendamento salvo!");
      navigation.goBack();

    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Novo Agendamento</Text>

      {/* Nome */}
      <TextInput
        style={styles.input}
        placeholder="Nome da cliente"
        value={nome}
        onChangeText={setNome}
      />

      {/* Serviço */}
      <TextInput
        style={styles.input}
        placeholder="Serviço (Ex: Manicure, Gel, Francesinha...)"
        value={servico}
        onChangeText={setServico}
      />

      {/* Data */}
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setMostrarData(true)}
      >
        <Text style={styles.selectorText}>📅 {formatarData(data)}</Text>
      </TouchableOpacity>

      {mostrarData && (
        <DateTimePicker
          value={data}
          mode="date"
          display="spinner"
          onChange={(event, selectedDate) => {
            setMostrarData(false);
            if (selectedDate) setData(selectedDate);
          }}
        />
      )}

      {/* Hora */}
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setMostrarHora(true)}
      >
        <Text style={styles.selectorText}>⏰ {formatarHora(hora)}</Text>
      </TouchableOpacity>

      {mostrarHora && (
        <DateTimePicker
          value={hora}
          mode="time"
          is24Hour={true}
          display="spinner"
          onChange={(event, selectedHour) => {
            setMostrarHora(false);
            if (selectedHour) setHora(selectedHour);
          }}
        />
      )}

      {/* Botão Salvar */}
      <TouchableOpacity style={styles.btn} onPress={salvar}>
        <Text style={styles.btnText}>Salvar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    padding:20,
    backgroundColor:'#fff',
  },
  title:{
    fontSize:28,
    fontWeight:'bold',
    marginTop:20,
    marginBottom:30,
    color:'#d63384',
    textAlign:'center'
  },
  input:{
    backgroundColor:'#ffe6f7',
    padding:12,
    borderRadius:10,
    fontSize:16,
    marginBottom:15,
    borderWidth:1,
    borderColor:'#ffb3da'
  },
  selector:{
    backgroundColor:'#ffd9f0',
    padding:15,
    borderRadius:10,
    marginBottom:15,
    borderWidth:1,
    borderColor:'#ffb3da'
  },
  selectorText:{
    fontSize:18,
    color:'#444'
  },
  btn:{
    backgroundColor:'#d63384',
    padding:15,
    borderRadius:12,
    alignItems:'center',
    marginTop:20
  },
  btnText:{
    color:'white',
    fontSize:18,
    fontWeight:'bold'
  }
});
