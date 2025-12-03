import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, Alert, KeyboardAvoidingView, ScrollView 
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/Firebase';

export default function NovoAgendamento({ navigation }) {
  const [nome, setNome] = useState('');
  const [servico, setServico] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [data, setData] = useState(new Date());
  const [hora, setHora] = useState(new Date());

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const salvarAgendamento = async () => {
    if (!nome || !servico) {
      Alert.alert('Atenção', 'Nome e serviço são obrigatórios!');
      return;
    }

    try {
      await addDoc(collection(db, "agendamentos"), {
        nome,
        serv: servico,
        observacoes,
        data: Timestamp.fromDate(data),
        hora: hora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        criadoEm: Timestamp.now()
      });
      Alert.alert('Sucesso', 'Agendamento salvo!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Falha ao salvar agendamento: ' + error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Nome do Cliente</Text>
        <TextInput
          style={[styles.input, styles.inputNome]}
          value={nome}
          onChangeText={setNome}
          placeholder="Digite o nome"
        />

        <Text style={styles.label}>Serviço</Text>
        <TextInput
          style={styles.input}
          value={servico}
          onChangeText={setServico}
          placeholder="Digite o serviço"
        />

        <Text style={styles.label}>Observações</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          value={observacoes}
          onChangeText={setObservacoes}
          placeholder="Observações adicionais"
          multiline
        />

        <Text style={styles.label}>Data</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.pickerButton}>
          <Text style={styles.pickerText}>{data.toLocaleDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={data}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              if (Platform.OS === 'android') setShowDatePicker(false);
              if (selectedDate) setData(selectedDate);
            }}
          />
        )}

        <Text style={styles.label}>Hora</Text>
        <TouchableOpacity onPress={() => setShowTimePicker(true)} style={[styles.pickerButton, styles.horaButton]}>
          <Text style={styles.horaText}>{hora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={hora}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            is24Hour={true}
            onChange={(event, selectedTime) => {
              if (Platform.OS === 'android') setShowTimePicker(false);
              if (selectedTime) setHora(selectedTime);
            }}
          />
        )}

        {/* Botão de confirmação (só para iOS) */}
        {Platform.OS === 'ios' && showTimePicker && (
          <TouchableOpacity 
            style={[styles.saveBtn, { backgroundColor: '#ffb3da', marginTop: 10 }]} 
            onPress={() => setShowTimePicker(false)}
          >
            <Text style={[styles.saveBtnText, { color: '#d63384' }]}>Confirmar Hora</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.saveBtn} onPress={salvarAgendamento}>
          <Text style={styles.saveBtnText}>💾 Salvar Agendamento</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 6, color: '#d63384' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 12, marginBottom: 16, fontSize: 16 },
  inputNome: { fontSize: 20, fontWeight: 'bold', color: '#222' },
  pickerButton: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 12, marginBottom: 16 },
  pickerText: { fontSize: 16, color: '#333' },
  horaButton: { backgroundColor: '#ffe6f7', borderColor: '#ffb3da' },
  horaText: { fontSize: 20, fontWeight: 'bold', color: '#d63384', textAlign: 'center' },
  saveBtn: { backgroundColor: '#d63384', padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 20 },
  saveBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
