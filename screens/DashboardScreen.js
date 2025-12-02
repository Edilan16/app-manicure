import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { db } from '../config/Firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export default function DashboardScreen({ navigation }) {
  const [receita, setReceita] = useState(0);
  const [despesa, setDespesa] = useState(0);

  const [pix, setPix] = useState(0);
  const [cartao, setCartao] = useState(0);
  const [dinheiro, setDinheiro] = useState(0);

  const carregarDashboard = () => {
    // Usa onSnapshot para escutar mudanças em tempo real
    const unsubscribe = onSnapshot(collection(db, "financeiro"), (snapshot) => {
      let r = 0, d = 0;
      let totalPix = 0, totalCartao = 0, totalDinheiro = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();

        // soma geral
        if (data.tipo === "Receita") r += data.valor || 0;
        else d += data.valor || 0;

        // soma por forma de pagamento (somente receitas)
        if (data.tipo === "Receita") {
          if (data.formaPagamento === "Pix") totalPix += data.valor || 0;
          if (data.formaPagamento === "Cartão") totalCartao += data.valor || 0;
          if (data.formaPagamento === "Dinheiro") totalDinheiro += data.valor || 0;
        }
      });

      setReceita(r);
      setDespesa(d);

      setPix(totalPix);
      setCartao(totalCartao);
      setDinheiro(totalDinheiro);
    });

    // Retorna função para desinscrever do listener quando componente desmontar
    return unsubscribe;
  };

  useEffect(() => {
    // Inicia o listener e guarda função para desinscrever
    const unsubscribe = carregarDashboard();

    // Cleanup: desinscreve ao desmontar o componente
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      {/* Receita e despesa */}
      <View style={styles.card}>
        <Text style={styles.label}>Receita Total</Text>
        <Text style={styles.value}>R$ {receita.toFixed(2)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Despesa Total</Text>
        <Text style={styles.value}>R$ {despesa.toFixed(2)}</Text>
      </View>

      {/* Lucro */}
      <View style={styles.cardTotal}>
        <Text style={styles.labelTotal}>Lucro</Text>
        <Text style={styles.valueTotal}>R$ {(receita - despesa).toFixed(2)}</Text>
      </View>

      {/* NOVO – Forma de Pagamento */}
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

      {/* Navegação */}
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
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  card: {
    width: '100%',
    padding: 20,
    backgroundColor: '#e3f2fd',
    borderRadius: 10,
    marginVertical: 10,
  },
  cardTotal: {
    width: '100%',
    padding: 20,
    backgroundColor: '#c8e6c9',
    borderRadius: 10,
    marginVertical: 10,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 5,
  },
  labelTotal: {
    fontSize: 20,
    fontWeight: '700',
  },
  valueTotal: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 5,
  },

  // NOVOS CARDS
  cardInfo: {
    width: '100%',
    padding: 15,
    backgroundColor: '#fff3e0',
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#f9c27b',
  },
  labelInfo: {
    fontSize: 18,
    fontWeight: '600',
  },
  valueInfo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 5,
  },

  buttonPrimary: {
    width: '100%',
    backgroundColor: '#1565c0',
    padding: 15,
    borderRadius: 10,
    marginTop: 25,
    alignItems: 'center',
  },
  buttonSecondary: {
    width: '100%',
    backgroundColor: '#00897b',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
