import React, { useState } from 'react';
import { addDoc, collection } from "firebase/firestore";
import { db } from "../config/Firebase";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  InputAccessoryView,
  Alert
} from 'react-native';

export default function FinanceiroScreen({ navigation }) {
  const [receita, setReceita] = useState('');
  const [despesa, setDespesa] = useState('');
  const [metodoPagamento, setMetodoPagamento] = useState('');

  // NOVOS CAMPOS
  const [descricaoReceita, setDescricaoReceita] = useState('');
  const [descricaoDespesa, setDescricaoDespesa] = useState('');

  const inputAccessoryViewID = 'numeric_keyboard_done_toolbar';

  const formatarParaMoeda = (text) => {
    const apenasNumeros = text.replace(/\D/g, '');
    if (apenasNumeros === '') return '';
    const valorEmCentavos = parseInt(apenasNumeros, 10);
    const valorEmReais = valorEmCentavos / 100;
    return valorEmReais.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleReceitaChange = (text) => {
    const apenasNumeros = text.replace(/\D/g, '');
    setReceita(apenasNumeros);
  };

  const handleDespesaChange = (text) => {
    const apenasNumeros = text.replace(/\D/g, '');
    setDespesa(apenasNumeros);
  };

  const renderInputAccessory = () => (
    <InputAccessoryView backgroundColor="#f8f8f8" nativeID={inputAccessoryViewID}>
      <View style={styles.accessoryContainer}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => Keyboard.dismiss()}
        >
          <Text style={styles.doneButtonText}>CONCLUÍDO</Text>
        </TouchableOpacity>
      </View>
    </InputAccessoryView>
  );

  // SALVAR DADOS
  const handleSalvar = async () => {
    Keyboard.dismiss();

    if (!metodoPagamento) {
      Alert.alert("Erro", "Escolha o método de pagamento");
      return;
    }

    const receitaValor = receita ? parseFloat(receita) / 100 : 0;
    const despesaValor = despesa ? parseFloat(despesa) / 100 : 0;

    if (receitaValor === 0 && despesaValor === 0) {
      Alert.alert("Erro", "Digite um valor de receita ou despesa");
      return;
    }

    try {
      await addDoc(collection(db, "financeiro"), {
        receita: receitaValor,
        despesa: despesaValor,
        metodoPagamento,
        descricaoReceita,
        descricaoDespesa,
        data: new Date()
      });

      navigation.navigate("Dashboard");

      // LIMPAR CAMPOS
      setReceita("");
      setDespesa("");
      setMetodoPagamento("");
      setDescricaoDespesa("");
      setDescricaoReceita("");

    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar o registro");
      console.log(error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >

        {/* BOTÃO VOLTAR */}
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.btnVoltar}
        >
          <Text style={styles.btnVoltarText}>← Voltar</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>💰 Financeiro</Text>
          <Text style={styles.subtitle}>Controle suas finanças</Text>
        </View>

        {/* RECEITA */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📈 RECEITA</Text>

          <TextInput
            style={styles.inputDescricao}
            placeholder="Descrição da receita (opcional)"
            placeholderTextColor="#888"
            value={descricaoReceita}
            onChangeText={setDescricaoReceita}
          />

          <View style={styles.inputCard}>
            <View style={styles.currencyContainer}>
              <Text style={styles.currencySymbol}>R$</Text>
            </View>
            <TextInput
              style={styles.input}
              value={formatarParaMoeda(receita)}
              onChangeText={handleReceitaChange}
              placeholder="0,00"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              inputAccessoryViewID={inputAccessoryViewID}
            />
          </View>
        </View>

        {/* DESPESA */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📉 DESPESA</Text>

          <TextInput
            style={styles.inputDescricao}
            placeholder="Descrição da despesa (ex: gasolina, material...)"
            placeholderTextColor="#888"
            value={descricaoDespesa}
            onChangeText={setDescricaoDespesa}
          />

          <View style={styles.inputCard}>
            <View style={styles.currencyContainer}>
              <Text style={styles.currencySymbol}>R$</Text>
            </View>
            <TextInput
              style={styles.input}
              value={formatarParaMoeda(despesa)}
              onChangeText={handleDespesaChange}
              placeholder="0,00"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              inputAccessoryViewID={inputAccessoryViewID}
            />
          </View>
        </View>

        {/* MÉTODO */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>💳 MÉTODO DE PAGAMENTO</Text>

          <View style={styles.paymentOptions}>
            {["pix", "dinheiro", "cartao"].map((m) => (
              <TouchableOpacity
                key={m}
                style={[
                  styles.paymentButton,
                  metodoPagamento === m && styles.paymentButtonSelected
                ]}
                onPress={() => setMetodoPagamento(m)}
              >
                <Text
                  style={[
                    styles.paymentButtonText,
                    metodoPagamento === m && styles.paymentButtonTextSelected
                  ]}
                >
                  {m.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* SALVAR */}
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSalvar}
        >
          <Text style={styles.saveButtonText}>💾 SALVAR REGISTRO</Text>
        </TouchableOpacity>

      </ScrollView>

      {Platform.OS === 'ios' && renderInputAccessory()}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f2" },
  scrollContent: { padding: 20, paddingBottom: 40 },

  btnVoltar: {
    marginBottom: 15
  },
  btnVoltarText: {
    fontSize: 18,
    fontWeight: "600"
  },

  header: {
    marginBottom: 20
  },
  title: {
    fontSize: 28,
    fontWeight: "bold"
  },
  subtitle: {
    color: "#666"
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10
  },

  inputDescricao: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    backgroundColor: "#fafafa",
    fontSize: 16,
    color: "#333"
  },

  inputCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    backgroundColor: "#fff"
  },

  currencyContainer: {
    paddingHorizontal: 12
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: "bold"
  },

  input: {
    flex: 1,
    padding: 12,
    fontSize: 18
  },

  paymentOptions: {
    flexDirection: "row",
    justifyContent: "space-between"
  },

  paymentButton: {
    flex: 1,
    padding: 12,
    marginHorizontal: 5,
    borderRadius: 10,
    backgroundColor: "#eee"
  },
  paymentButtonSelected: {
    backgroundColor: "#4CAF50"
  },
  paymentButtonText: {
    textAlign: "center",
    fontWeight: "bold"
  },
  paymentButtonTextSelected: {
    color: "#fff"
  },

  saveButton: {
    backgroundColor: "#0066FF",
    padding: 15,
    borderRadius: 10,
    marginTop: 10
  },
  saveButtonText: {
    textAlign: "center",
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold"
  },

  accessoryContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 10
  },
  doneButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#007bff",
    borderRadius: 8
  },
  doneButtonText: {
    color: "#fff",
    fontSize: 16
  }
});
