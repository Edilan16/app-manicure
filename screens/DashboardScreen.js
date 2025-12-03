import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList } from 'react-native';
import { db } from '../config/Firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';

export default function DashboardScreen({ navigation }) {
  const [receita, setReceita] = useState(0);
  const [despesa, setDespesa] = useState(0);
  const [pix, setPix] = useState(0);
  const [cartao, setCartao] = useState(0);
  const [dinheiro, setDinheiro] = useState(0);
  const [extrato, setExtrato] = useState([]);

  // Atualiza valores do dashboard
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "financeiro"), (snapshot) => {
      let totalReceita = 0;
      let totalDespesa = 0;
      let totalPix = 0;
      let totalCartao = 0;
      let totalDinheiro = 0;

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const valorReceita = Number(data.receita) || 0;
        const valorDespesa = Number(data.despesa) || 0;

        totalReceita += valorReceita;
        totalDespesa += valorDespesa;

        if (valorReceita > 0) {
          switch ((data.metodoPagamento || "").toLowerCase()) {
            case "pix": totalPix += valorReceita; break;
            case "cartão":
            case "cartao": totalCartao += valorReceita; break;
            case "dinheiro": totalDinheiro += valorReceita; break;
          }
        }
      });

      setReceita(totalReceita);
      setDespesa(totalDespesa);
      setPix(totalPix);
      setCartao(totalCartao);
      setDinheiro(totalDinheiro);
    });

    return () => unsubscribe();
  }, []);

  // Carrega últimos 10 lançamentos
  useEffect(() => {
    const q = query(collection(db, "financeiro"), orderBy("data", "desc"), limit(10));
    const unsubscribeExtrato = onSnapshot(q, (snapshot) => {
      const dados = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExtrato(dados);
    });

    return () => unsubscribeExtrato();
  }, []);

  const renderItem = ({ item }) => {
    const valor = Number(item.receita || item.despesa || 0);
    const tipo = item.receita > 0 ? "Receita" : "Despesa";
    return (
      <View style={styles.extratoItem}>
        <Text style={[styles.extratoTipo, { color: tipo === "Receita" ? 'green' : 'red' }]}>{tipo}</Text>
        <Text style={styles.extratoValor}>R$ {valor.toFixed(2)}</Text>
        <Text style={styles.extratoMetodo}>{item.metodoPagamento || "-"}</Text>
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      {/* Cards de receita e despesa */}
      <View style={styles.card}>
        <Text style={styles.label}>Receita Total</Text>
        <Text style={styles.value}>R$ {receita.toFixed(2)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Despesa Total</Text>
        <Text style={styles.value}>R$ {despesa.toFixed(2)}</Text>
      </View>

      <View style={styles.cardTotal}>
        <Text style={styles.labelTotal}>Lucro</Text>
        <Text style={styles.valueTotal}>R$ {(receita - despesa).toFixed(2)}</Text>
      </View>

      {/* Formas de pagamento */}
      <Text style={[styles.title, { marginTop: 30 }]}>Formas de Pagamento</Text>
      <View style={styles.cardInfo}>
        <Text style={styles.labelInfo}>Pix</Text>
        <Text style={styles.valueInfo}>R$ {pix.toFixed(2)}</Text>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.labelInfo}>Cartão</Text>
        <Text style={styles.valueInfo}>R$ {cartao.toFixed(2)}</Text>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.labelInfo}>Dinheiro</Text>
        <Text style={styles.valueInfo}>R$ {dinheiro.toFixed(2)}</Text>
      </View>

      {/* Últimos lançamentos */}
      <Text style={[styles.title, { marginTop: 30 }]}>Últimos Lançamentos</Text>
      <FlatList
        data={extrato}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        scrollEnabled={false} // evita conflito com ScrollView
        style={{ width: '100%' }}
      />

      {/* Botões de navegação */}
      <TouchableOpacity
        style={styles.buttonPrimary}
        onPress={() => navigation.navigate('Financeiro')}
      >
        <Text style={styles.buttonText}>+ Receita / Despesa</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonSecondary}
        onPress={() => navigation.navigate('Agenda')}
      >
        <Text style={styles.buttonText}>Ver Agenda</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  card: { width: '100%', padding: 20, backgroundColor: '#e3f2fd', borderRadius: 10, marginVertical: 10 },
  cardTotal: { width: '100%', padding: 20, backgroundColor: '#c8e6c9', borderRadius: 10, marginVertical: 10 },
  label: { fontSize: 18, fontWeight: '600' },
  value: { fontSize: 24, fontWeight: 'bold', marginTop: 5 },
  labelTotal: { fontSize: 20, fontWeight: '700' },
  valueTotal: { fontSize: 26, fontWeight: 'bold', marginTop: 5 },
  cardInfo: { width: '100%', padding: 15, backgroundColor: '#fff3e0', borderRadius: 10, marginTop: 10, borderWidth: 1, borderColor: '#f9c27b' },
  labelInfo: { fontSize: 18, fontWeight: '600' },
  valueInfo: { fontSize: 22, fontWeight: 'bold', marginTop: 5 },
  extratoItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1, borderBottomColor: '#ccc', width: '100%' },
  extratoTipo: { fontSize: 16, fontWeight: '600' },
  extratoValor: { fontSize: 16, fontWeight: 'bold' },
  extratoMetodo: { fontSize: 14, color: '#555' },
  buttonPrimary: { width: '100%', backgroundColor: '#1565c0', padding: 15, borderRadius: 10, marginTop: 25, alignItems: 'center' },
  buttonSecondary: { width: '100%', backgroundColor: '#00897b', padding: 15, borderRadius: 10, marginTop: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
