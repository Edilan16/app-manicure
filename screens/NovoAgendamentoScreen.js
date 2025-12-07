import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import { db } from "../config/Firebase";
import { addDoc, collection } from "firebase/firestore";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";

export default function NovoAgendamento() {
  const navigation = useNavigation();

  const [nome, setNome] = useState("");
  const [serv, setServ] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const [data, setData] = useState(new Date());
  const [hora, setHora] = useState(new Date());
  const [dataText, setDataText] = useState(new Date().toISOString().slice(0, 10));
  const [horaText, setHoraText] = useState(new Date().toTimeString().slice(0, 5));

  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  // Serviços comuns para seleção rápida
  const servicosComuns = [
    "💅 Manicure",
    "🦶 Pedicure",
    "💅🦶 Mão e Pé",
    "✨ Unha em Gel",
    "🎨 Nail Art",
    "💆 Massagem",
  ];

  // Formatar data automaticamente (dd/mm/yyyy)
  const formatarData = (text) => {
    // Remove tudo que não é número
    const numbers = text.replace(/\D/g, '');
    
    // Aplica a máscara dd/mm/yyyy
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
    }
  };

  // Formatar hora automaticamente (hh:mm)
  const formatarHora = (text) => {
    // Remove tudo que não é número
    const numbers = text.replace(/\D/g, '');
    
    // Aplica a máscara hh:mm
    if (numbers.length <= 2) {
      return numbers;
    } else {
      return `${numbers.slice(0, 2)}:${numbers.slice(2, 4)}`;
    }
  };

  // Processar mudança de data
  const handleDataChange = (text) => {
    const formatted = formatarData(text);
    setDataText(formatted);
    
    // Se tiver formato completo dd/mm/yyyy, converte
    if (formatted.length === 10) {
      const [dia, mes, ano] = formatted.split('/');
      if (dia && mes && ano && ano.length === 4) {
        const novaData = new Date(ano, mes - 1, dia);
        if (!isNaN(novaData.getTime())) {
          setData(novaData);
        }
      }
    }
  };

  // Processar mudança de hora
  const handleHoraChange = (text) => {
    const formatted = formatarHora(text);
    setHoraText(formatted);
    
    // Se tiver formato completo hh:mm, converte
    if (formatted.length === 5) {
      const [h, m] = formatted.split(':');
      if (h && m && !isNaN(h) && !isNaN(m)) {
        const novaHora = new Date();
        novaHora.setHours(parseInt(h), parseInt(m));
        setHora(novaHora);
      }
    }
  };

  // 📅 Atualiza a data escolhida
  const onChangeDate = (_, selectedDate) => {
    setShowDate(false);
    if (selectedDate) {
      setData(selectedDate);
      setDataText(selectedDate.toISOString().slice(0, 10));
    }
  };

  // ⏰ Atualiza a hora escolhida
  const onChangeTime = (_, selectedTime) => {
    setShowTime(false);
    if (selectedTime) {
      setHora(selectedTime);
      setHoraText(selectedTime.toTimeString().slice(0, 5));
    }
  };

  // 💾 Salvar automaticamente e voltar
  const salvar = async () => {
    if (!nome.trim() || !serv.trim()) {
      if (Platform.OS === 'web') {
        window.alert("Preencha nome e serviço.");
      } else {
        Alert.alert("Erro", "Preencha nome e serviço.");
      }
      return;
    }

    try {
      await addDoc(collection(db, "agendamentos"), {
        nome,
        serv,
        observacoes,
        data: data.toISOString().slice(0, 10),
        hora: hora.toTimeString().slice(0, 5),
      });

      if (Platform.OS === 'web') {
        window.alert("✅ Agendamento salvo!");
      } else {
        Alert.alert("Sucesso", "Agendamento salvo!");
      }
      
      navigation.navigate("Dashboard"); // volta automático
    } catch (e) {
      console.log("Erro ao salvar: ", e);
      if (Platform.OS === 'web') {
        window.alert("Não foi possível salvar.");
      } else {
        Alert.alert("Erro", "Não foi possível salvar.");
      }
    }
  };

  // Preencher data de hoje
  const preencherHoje = () => {
    const hoje = new Date();
    setData(hoje);
    const dia = String(hoje.getDate()).padStart(2, '0');
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const ano = hoje.getFullYear();
    setDataText(`${dia}/${mes}/${ano}`);
  };

  // Preencher hora atual
  const preencherAgora = () => {
    const agora = new Date();
    setHora(agora);
    const h = String(agora.getHours()).padStart(2, '0');
    const m = String(agora.getMinutes()).padStart(2, '0');
    setHoraText(`${h}:${m}`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>📅 Novo Agendamento</Text>
      </View>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>👤 Nome da Cliente</Text>
        <TextInput
          style={[styles.input, nome.trim() && styles.inputPreenchido]}
          value={nome}
          onChangeText={setNome}
          placeholder="Ex: Maria Silva"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>💅 Serviço</Text>
        <TextInput
          style={[styles.input, serv.trim() && styles.inputPreenchido]}
          value={serv}
          onChangeText={setServ}
          placeholder="Ex: Unha Gel, Pedicure..."
          placeholderTextColor="#999"
        />

        {/* Botões de serviços rápidos */}
        <View style={styles.servicosRapidos}>
          {servicosComuns.map((servico, index) => (
            <TouchableOpacity
              key={index}
              style={styles.btnServico}
              onPress={() => setServ(servico)}
            >
              <Text style={styles.txtServico}>{servico}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>📅 Data</Text>
              <TouchableOpacity onPress={preencherHoje} style={styles.btnQuick}>
                <Text style={styles.txtQuick}>Hoje</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              value={dataText}
              onChangeText={handleDataChange}
              placeholder="DD/MM/AAAA"
              placeholderTextColor="#999"
              keyboardType="numeric"
              maxLength={10}
            />
            <Text style={styles.hint}>Ex: 07/12/2025</Text>
          </View>

          <View style={styles.halfInput}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>⏰ Hora</Text>
              <TouchableOpacity onPress={preencherAgora} style={styles.btnQuick}>
                <Text style={styles.txtQuick}>Agora</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              value={horaText}
              onChangeText={handleHoraChange}
              placeholder="HH:MM"
              placeholderTextColor="#999"
              keyboardType="numeric"
              maxLength={5}
            />
            <Text style={styles.hint}>Ex: 14:30</Text>
          </View>
        </View>

        {showDate && Platform.OS !== 'web' && (
          <DateTimePicker
            value={data}
            mode="date"
            display="spinner"
            onChange={onChangeDate}
          />
        )}

        {showTime && Platform.OS !== 'web' && (
          <DateTimePicker
            value={hora}
            mode="time"
            display="spinner"
            onChange={onChangeTime}
          />
        )}

        <Text style={styles.label}>📝 Observações (opcional)</Text>
        <TextInput
          style={styles.inputObservacoes}
          value={observacoes}
          onChangeText={setObservacoes}
          placeholder="Ex: Cliente prefere esmalte claro, alérgica a produtos com acetona..."
          placeholderTextColor="#999"
          multiline
        />

        <TouchableOpacity style={styles.btnSalvar} onPress={salvar}>
          <Text style={styles.txtSalvar}>💾 Salvar Agendamento</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// 🎨 ESTILOS
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  header: {
    backgroundColor: "#EB69A3",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },

  backBtn: {
    marginBottom: 10,
  },
  backText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },

  form: {
    padding: 20,
  },

  label: {
    fontSize: 15,
    marginBottom: 8,
    marginTop: 15,
    fontWeight: "600",
    color: "#333",
  },

  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  btnQuick: {
    backgroundColor: "#EB69A3",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },

  txtQuick: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  inputPreenchido: {
    borderColor: "#EB69A3",
    backgroundColor: "#FFF5F9",
  },

  servicosRapidos: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    marginBottom: 5,
  },

  btnServico: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#EB69A3",
  },

  txtServico: {
    color: "#EB69A3",
    fontSize: 13,
    fontWeight: "600",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  halfInput: {
    flex: 1,
    marginHorizontal: 5,
  },

  hint: {
    fontSize: 11,
    color: "#999",
    marginTop: 4,
    marginLeft: 4,
  },

  inputObservacoes: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    height: 100,
    textAlignVertical: "top",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  btnSalvar: {
    marginTop: 30,
    backgroundColor: "#4caf50",
    padding: 18,
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#4caf50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 8,
  },
  txtSalvar: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});
