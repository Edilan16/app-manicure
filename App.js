import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import AgendaScreen from './screens/AgendaScreen';
import NovoAgendamentoScreen from './screens/NovoAgendamentoScreen';
import FinanceiroScreen from './screens/FinanceiroScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown:false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Agenda" component={AgendaScreen} />
        <Stack.Screen name="NovoAgendamento" component={NovoAgendamentoScreen} />
        <Stack.Screen name="Financeiro" component={FinanceiroScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
