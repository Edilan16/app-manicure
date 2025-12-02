import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { db } from '../config/Firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function DashboardScreen({ navigation }) {
  const [receita, setReceita] = useState(0);
  const [despesa, setDespesa] = useState(0);

  const carregarDashboard = async () => {
    const q = await getDocs(collection(db, "financeiro"));
    let r = 0, d = 0;

    q.forEach(doc => {
      const data = doc.data();
      if (data.tipo === 'Receita') r += data.valor;
      else d += data.valor;
    });

    setReceita(r);
    setDespesa(d);
  };

  useEffect(() => { carregarDashboard(); }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Receita</Text>
        <Text style={styles.value}>R$ {receita.toFixed(2)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Despesa</Text>
        <Text style={styles.value}>R$ {despesa.toFixed(2)}</Text>
      </View>

      <View style={styles.cardTotal}>
        <Text style={styles.labelTotal}>Lucro</Text>
        <Text style={styles.valueTotal}>R$ {(receita - despesa).toFixed(2)}</Text>
      </View>

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
    alignItems: 'center'
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20
  },
  card: {
    width: '100%',
    padding: 20,
    backgroundColor: '#e3f2fd',
    borderRadius: 10,
    marginVertical: 10
  },
  cardTotal: {
    width: '100%',
    padding: 20,
    backgroundColor: '#c8e6c9',
    borderRadius: 10,
    marginVertical: 10
  },
  label: {
    fontSize: 20,
    fontWeight: '600'
  },
  value: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 5
  },
  labelTotal: {
    fontSize: 22,
    fontWeight: '700'
  },
  valueTotal: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 5
  },
  buttonPrimary: {
    width: '100%',
    backgroundColor: '#1565c0',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center'
  },
  buttonSecondary: {
    width: '100%',
    backgroundColor: '#00897b',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600'
  }
});
