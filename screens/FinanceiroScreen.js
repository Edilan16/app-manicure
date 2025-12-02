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
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export default function FinanceiroScreen({ navigation }) {
  const [tipo, setTipo] = useState('Receita');
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('Pix');

  // Aceita entrada numérica simples sem formatação automática
  const handleValorChange = (text) => {
    // Aceita apenas números e vírgula (para decimal)
    const filtered = String(text).replace(/[^0-9,]/g, '');
    setValor(filtered);
  };

  const salvar = async () => {
    if (!valor.trim() || !descricao.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos!');
      return;
    }

    // Converte valor para número: substitui vírgula por ponto
    const numericStr = String(valor).replace(/,/g, '.');
    const numeric = parseFloat(numericStr);

    if (Number.isNaN(numeric) || numeric <= 0) {
      Alert.alert('Atenção', 'Valor deve ser um número maior que zero');
      return;
    }

    try {
      await addDoc(collection(db, 'financeiro'), {
        tipo,
        valor: numeric,
        descricao,
        formaPagamento,
        data: Timestamp.fromDate(new Date())
      });

      Alert.alert('Sucesso', 'Lançamento registrado!');
      setValor('');
      setDescricao('');
      navigation.goBack();
    } catch (error) {
      console.log(error);
      Alert.alert('Erro', 'Falha ao salvar lançamento.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Financeiro</Text>

      {/* Receita ou Despesa */}
      <View style={styles.pickerBox}>
        <Picker selectedValue={tipo} onValueChange={(itemValue) => setTipo(itemValue)}>
          <Picker.Item label="Receita" value="Receita" />
          <Picker.Item label="Despesa" value="Despesa" />
        </Picker>
      </View>

      {/* Forma de Pagamento */}
      <View style={styles.pickerBox}>
        <Picker
          selectedValue={formaPagamento}
          onValueChange={(itemValue) => setFormaPagamento(itemValue)}
        >
          <Picker.Item label="Pix" value="Pix" />
          <Picker.Item label="Dinheiro" value="Dinheiro" />
          <Picker.Item label="Cartão" value="Cartão" />
        </Picker>
      </View>

      {/* Valor */}
      <TextInput
        style={styles.input}
        placeholder="Valor (ex: 40,00)"
        keyboardType="numeric"
        value={valor}
        onChangeText={handleValorChange}
      />

      {/* Descrição */}
      <TextInput
        style={styles.input}
        placeholder="Descrição (ex: Manicure, Gel, Material...)"
        value={descricao}
        onChangeText={setDescricao}
      />

      {/* Botão */}
      <TouchableOpacity style={styles.btn} onPress={salvar}>
        <Text style={styles.btnText}>Salvar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#d63384',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30
  },
  pickerBox: {
    backgroundColor: '#ffe6f7',
    borderRadius: 10,
    borderColor: '#ffb3da',
    borderWidth: 1,
    marginBottom: 20
  },
  input: {
    backgroundColor: '#ffe6f7',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffb3da',
    fontSize: 16,
    marginBottom: 15
  },
  
  btn: {
    backgroundColor: '#d63384',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20
  },
  btnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  }
});
