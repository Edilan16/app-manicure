import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert
} from 'react-native';

import { Picker } from '@react-native-picker/picker';
import { db } from '../config/Firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function FinanceiroScreen({ navigation }) {
  const [tipo, setTipo] = useState("Receita");
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");

  const salvar = async () => {
    if (!valor.trim() || !descricao.trim()) {
      Alert.alert("Atenção", "Preencha todos os campos!");
      return;
    }

    try {
      await addDoc(collection(db, "financeiro"), {
        tipo,
        valor: Number(valor),
        descricao,
        data: new Date().toISOString().slice(0, 10)
      });

      Alert.alert("Sucesso", "Lançamento registrado!");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Erro", "Falha ao salvar lançamento.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Financeiro</Text>

      {/* Seleção Receita/Despesa */}
      <View style={styles.pickerBox}>
        <Picker
          selectedValue={tipo}
          onValueChange={(itemValue) => setTipo(itemValue)}
        >
          <Picker.Item label="Receita" value="Receita" />
          <Picker.Item label="Despesa" value="Despesa" />
        </Picker>
      </View>

      {/* Valor */}
      <TextInput
        style={styles.input}
        placeholder="Valor (ex: 40.00)"
        keyboardType="numeric"
        value={valor}
        onChangeText={setValor}
      />

      {/* Descrição */}
      <TextInput
        style={styles.input}
        placeholder="Descrição (ex: Manicure, Gel, Material...)"
        value={descricao}
        onChangeText={setDescricao}
      />

      {/* Botão salvar */}
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
    backgroundColor:'#fff'
  },
  title:{
    fontSize:28,
    fontWeight:'bold',
    color:'#d63384',
    textAlign:'center',
    marginTop:20,
    marginBottom:30
  },
  pickerBox:{
    backgroundColor:'#ffe6f7',
    borderRadius:10,
    borderColor:'#ffb3da',
    borderWidth:1,
    marginBottom:20
  },
  input:{
    backgroundColor:'#ffe6f7',
    padding:12,
    borderRadius:10,
    borderWidth:1,
    borderColor:'#ffb3da',
    fontSize:16,
    marginBottom:15
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
