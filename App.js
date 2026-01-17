import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import { View, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import AgendaScreen from './screens/AgendaScreen';
import NovoAgendamentoScreen from './screens/NovoAgendamentoScreen';
import FinanceiroScreen from './screens/FinanceiroScreen';
import RelatoriosMensaisScreen from './screens/RelatoriosMensaisScreen';
import GerenciarLancamentosScreen from './screens/GerenciarLancamentosScreen';
import LembretesScreen from './screens/LembretesScreen';
import { ensureCollectionExists } from './utils/checkEmptyCollection';
import { auth } from './config/Firebase';

const Stack = createNativeStackNavigator();

export default function App() {
  const [error, setError] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Aguarda o estado de autenticação antes de tentar criar coleções.
    // Muitas regras do Firestore exigem usuário autenticado, então
    // chamar ensureCollectionExists apenas após login evita permission-denied.
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          await ensureCollectionExists('financeiro');
          await ensureCollectionExists('agendamentos');
        } catch (e) {
          // Apenas log — não quebrar a inicialização
          // eslint-disable-next-line no-console
          console.error('Erro ao garantir coleções iniciais:', e);
        }
      }
      
      if (initializing) setInitializing(false);
    });

    return () => unsub();
  }, [initializing]);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, color: 'red', marginBottom: 10 }}>Erro na aplicação:</Text>
        <Text style={{ fontSize: 14, color: '#666' }}>{error.toString()}</Text>
      </View>
    );
  }

  // Tela de loading enquanto verifica autenticação
  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EB69A3' }}>
        <Text style={{ fontSize: 32, marginBottom: 20 }}>💅</Text>
        <Text style={{ fontSize: 20, color: '#fff', fontWeight: 'bold' }}>Carregando...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="Agenda" component={AgendaScreen} />
          <Stack.Screen name="NovoAgendamento" component={NovoAgendamentoScreen} />
          <Stack.Screen name="Financeiro" component={FinanceiroScreen} />
          <Stack.Screen name="RelatoriosMensais" component={RelatoriosMensaisScreen} />
          <Stack.Screen name="GerenciarLancamentos" component={GerenciarLancamentosScreen} />
          <Stack.Screen name="Lembretes" component={LembretesScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
