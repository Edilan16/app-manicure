import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { db } from "../config/Firebase";
import { collection, addDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function NovoAgendamento({ navigation }) {
  const [nome, setNome] = useState("");
  const [serv, setServ] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const [data, setData] = useState("");
  const [hora, setHora] = useState("");

  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  // 📌 Abrir date picker
  const abrirCalendario = () => setShowDate(true);
  const abrirRelogio = () => setShowTime(true);

  // 📌 Quando escolher data
  const onChangeData = (event, selectedDate) => {
    setShowDate(false);
    if (selectedDate) {
      const d = selectedDate.toISOString().split("T")[0];
      setData(d);
    }
  };

  // 📌 Quando escolher hora
  const onChangeHora = (event, selectedTime) => {
    setShowTime(false);
    if (selectedTime) {
      const h = selectedTime.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      setHora(h);
    }
  };

  // 📌 SALVAR AGENDAMENTO
  const salvarAgendamento = async () => {
    if (!nome || !data || !hora || !serv) {
      Alert.alert("Erro", "Preencha todos os campos obrigatórios");
      return;
    }

    try {
      await addDoc(collection(db, "agendamentos"), {
        nome,
        data,
        hora,
        serv,
        observacoes,
      });

      await AsyncStorage.multiRemove([
        "agendamentos_cache",
        "agendamentos_cache_timestamp"
      ]);

      Alert.alert("Sucesso", "Agendamento concluído!");
      navigation.goBack();

    } catch (err) {
      Alert.alert("Erro", "Não foi possível salvar o agendamento");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Novo Agendamento</Text>

      <TextInput
        placeholder="Nome"
        style={styles.input}
        value={nome}
        onChangeText={setNome}
      />

      <TouchableOpacity style={styles.btnPicker} onPress={abrirCalendario}>
        <Text style={styles.btnPickerText}>
          {data ? `Data: ${data}` : "Selecionar Data"}
        </Text>
      </TouchableOpacity>

      {showDate && (
        <DateTimePicker mode="date" value={new Date()} onChange={onChangeData} />
      )}

      <TouchableOpacity style={styles.btnPicker} onPress={abrirRelogio}>
        <Text style={styles.btnPickerText}>
          {hora ? `Hora: ${hora}` : "Selecionar Hora"}
        </Text>
      </TouchableOpacity>

      {showTime && (
        <DateTimePicker mode="time" value={new Date()} onChange={onChangeHora} />
      )}

      <TextInput
        placeholder="Serviço"
        style={styles.input}
        value={serv}
        onChangeText={setServ}
      />

      <TextInput
        placeholder="Observações"
        style={[styles.input, { height: 80 }]}
        value={observacoes}
        onChangeText={setObservacoes}
        multiline
      />

      <TouchableOpacity style={styles.btnSalvar} onPress={salvarAgendamento}>
        <Text style={styles.btnSalvarText}>Salvar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 28, marginBottom: 20, fontWeight: "bold" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  btnPicker: {
    backgroundColor: "#ffb6c1",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  btnPickerText: { color: "#fff", fontWeight: "bold" },
  btnSalvar: {
    backgroundColor: "#ff69b4",
    padding: 16,
    borderRadius: 10,
    marginTop: 10,
  },
  btnSalvarText: {
    textAlign: "center",
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
});
