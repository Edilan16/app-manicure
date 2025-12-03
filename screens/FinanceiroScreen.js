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
  
  // ID único para o Input Accessory View (só iOS)
  const inputAccessoryViewID = 'numeric_keyboard_done_toolbar';

  // Função para formatar como moeda enquanto digita
  const formatarParaMoeda = (text) => {
    // Remove tudo exceto números
    const apenasNumeros = text.replace(/\D/g, '');
    
    if (apenasNumeros === '') return '';
    
    // Converte para número e divide por 100 para ter centavos
    const valorEmCentavos = parseInt(apenasNumeros, 10);
    const valorEmReais = valorEmCentavos / 100;
    
    // Formata como R$ brasileiro
    return valorEmReais.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Função para salvar valor numérico
  const handleReceitaChange = (text) => {
    // Remove formatação para guardar o valor puro
    const apenasNumeros = text.replace(/\D/g, '');
    setReceita(apenasNumeros);
  };

  const handleDespesaChange = (text) => {
    const apenasNumeros = text.replace(/\D/g, '');
    setDespesa(apenasNumeros);
  };

  // Renderiza a barra com botão "CONCLUÍDO" acima do teclado (iOS)
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

  // Salvar dados
const handleSalvar = async () => {
  Keyboard.dismiss();

  if (!metodoPagamento) {
    Alert.alert("Erro", "Escolha o método de pagamento");
    return;
  }

  // Converter centavos → reais
  const receitaValor = receita ? parseFloat(receita) / 100 : 0;
  const despesaValor = despesa ? parseFloat(despesa) / 100 : 0;

  try {
    await addDoc(collection(db, "financeiro"), {
      receita: receitaValor,
      despesa: despesaValor,
      metodoPagamento,
      data: new Date()
    });

    Alert.alert("Sucesso!", "Registro salvo com sucesso!");

    // 🔥 VOLTA AUTOMÁTICO PARA O DASHBOARD
    navigation.navigate("Dashboard");

    // Limpa os campos
    setReceita("");
    setDespesa("");
    setMetodoPagamento("");

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
        showsVerticalScrollIndicator={false}
      >
                <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.btnVoltar}
        >
        <Text style={styles.btnVoltarText}>← Voltar</Text>
        </TouchableOpacity>

        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.title}>💰 Financeiro</Text>
          <Text style={styles.subtitle}>Controle suas finanças</Text>
        </View>

        {/* Seção RECEITA */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📈 RECEITA</Text>
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
              returnKeyType="done"
              onSubmitEditing={() => Keyboard.dismiss()}
            />
          </View>
        </View>

        {/* Seção DESPESA */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📉 DESPESA</Text>
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
              returnKeyType="done"
              onSubmitEditing={() => Keyboard.dismiss()}
            />
          </View>
        </View>

        {/* Métodos de Pagamento */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>💳 MÉTODO DE PAGAMENTO</Text>
          
          <View style={styles.paymentOptions}>
            <TouchableOpacity
              style={[
                styles.paymentButton,
                metodoPagamento === 'pix' && styles.paymentButtonSelected
              ]}
              onPress={() => setMetodoPagamento('pix')}
            >
              <Text style={[
                styles.paymentButtonText,
                metodoPagamento === 'pix' && styles.paymentButtonTextSelected
              ]}>
                PIX
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.paymentButton,
                metodoPagamento === 'dinheiro' && styles.paymentButtonSelected
              ]}
              onPress={() => setMetodoPagamento('dinheiro')}
            >
              <Text style={[
                styles.paymentButtonText,
                metodoPagamento === 'dinheiro' && styles.paymentButtonTextSelected
              ]}>
                DINHEIRO
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.paymentButton,
                metodoPagamento === 'cartao' && styles.paymentButtonSelected
              ]}
              onPress={() => setMetodoPagamento('cartao')}
            >
              <Text style={[
                styles.paymentButtonText,
                metodoPagamento === 'cartao' && styles.paymentButtonTextSelected
              ]}>
                CARTÃO
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Botão Salvar */}
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSalvar}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>💾 SALVAR REGISTRO</Text>
        </TouchableOpacity>

        {/* Resumo */}
        {(receita || despesa) && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>📊 RESUMO</Text>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Receita:</Text>
              <Text style={styles.summaryValuePositive}>
                R$ {formatarParaMoeda(receita) || '0,00'}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Despesa:</Text>
              <Text style={styles.summaryValueNegative}>
                R$ {formatarParaMoeda(despesa) || '0,00'}
              </Text>
            </View>
            
            <View style={styles.separator} />
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Saldo:</Text>
              <Text style={styles.summaryValueTotal}>
                R$ {formatarParaMoeda(String(parseInt(receita || 0) - parseInt(despesa || 0)))}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Barra do botão "CONCLUÍDO" (APENAS iOS) */}
      {Platform.OS === 'ios' && renderInputAccessory()}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 15,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#fafafa',
    overflow: 'hidden',
  },
  currencyContainer: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  currencySymbol: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  input: {
    flex: 1,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    paddingHorizontal: 15,
    paddingVertical: 15,
    minHeight: 65,
  },
  paymentOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  paymentButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  paymentButtonSelected: {
    backgroundColor: '#3498db',
    borderColor: '#2980b9',
  },
  paymentButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c757d',
  },
  paymentButtonTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  saveButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginTop: 10,
    borderWidth: 2,
    borderColor: '#f1f2f6',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  summaryValuePositive: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  summaryValueNegative: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  summaryValueTotal: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3498db',
  },
  separator: {
    height: 1,
    backgroundColor: '#ecf0f1',
    marginVertical: 15,
  },
  // Estilos para o Input Accessory View (iOS)
  accessoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    backgroundColor: '#fff',
    height: 50,
  },
  doneButton: {
    paddingHorizontal: 25,
    paddingVertical: 10,
    backgroundColor: '#3498db',
    borderRadius: 8,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  btnVoltar: {
  backgroundColor: "#eee",
  paddingVertical: 10,
  paddingHorizontal: 18,
  borderRadius: 10,
  alignSelf: "flex-start",
  marginBottom: 10,
  borderWidth: 1,
  borderColor: "#ccc"
},
btnVoltarText: {
  fontSize: 16,
  fontWeight: "600",
  color: "#333"
}

});