import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SectionList,
  Platform,
  ActivityIndicator,
  Animated,
} from "react-native";
import { db } from "../config/Firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { Swipeable } from "react-native-gesture-handler";

// 🔥 Função de formatação segura de data
function formatarData(valor) {
  if (!valor) return "0000-00-00";

  // Firestore Timestamp
  if (valor?.seconds) {
    const date = new Date(valor.seconds * 1000);
    return date.toISOString().slice(0, 10);
  }

  // Já é string
  return valor;
}

export default function AgendaScreen() {
  const navigation = useNavigation();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "agendamentos"), orderBy("data"));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.docs.length) {
          setSections([]);
          setLoading(false);
          return;
        }

        let lista = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          const dataFormatada = formatarData(d.data);

          return {
            id: docSnap.id,
            nome: d.nome || "Sem nome",
            data: dataFormatada,
            hora: d.hora || "--:--",
            serv: d.serv || "Sem serviço",
            observacoes: d.observacoes || "",
          };
        });

        // Ordenação correta
        lista.sort((a, b) => {
          const dataA = new Date(`${a.data} ${a.hora}`);
          const dataB = new Date(`${b.data} ${b.hora}`);
          return dataA - dataB;
        });

        // Agrupar por data
        const agrupado = lista.reduce((acc, item) => {
          if (!acc[item.data]) acc[item.data] = [];
          acc[item.data].push(item);
          return acc;
        }, {});

        const formatado = Object.keys(agrupado).map((data) => ({
          title: data,
          data: agrupado[data],
        }));

        setSections(formatado);
        setLoading(false);
      },
      (err) => {
        console.log("Erro ao carregar:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  // Função de exclusão (compatível com PWA/Web)
  const deletar = async (id) => {
    console.log("=== DELETAR CHAMADO ===");
    console.log("ID recebido:", id);
    
    // Usar window.confirm para PWA/Web (funciona no iPhone)
    const confirmar = window.confirm("Deseja realmente excluir este agendamento?");
    
    if (!confirmar) {
      console.log("Cancelou exclusão");
      return;
    }

    console.log("Usuário confirmou exclusão");
    try {
      console.log("Criando referência do documento...");
      const ref = doc(db, "agendamentos", id);
      console.log("Referência criada:", ref.path);
      
      console.log("Iniciando exclusão...");
      await deleteDoc(ref);
      console.log("✅ Agendamento excluído com sucesso!");
      window.alert("Agendamento excluído com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao excluir:", error);
      console.error("Código do erro:", error.code);
      console.error("Mensagem:", error.message);
      window.alert(`Erro ao excluir: ${error.message}`);
    }
  };

  const novoAgendamento = () => {
    navigation.navigate("NovoAgendamento");
  };

  // Renderiza o botão de excluir que aparece ao deslizar
  const renderRightActions = (item) => {
    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => {
          console.log("Clicou no botão de deletar:", item.id);
          deletar(item.id);
        }}
      >
        <Text style={styles.deleteActionText}>🗑️ Excluir</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#EB69A3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header moderno */}
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => navigation.navigate("Dashboard")}
        >
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>📅 Agenda</Text>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Swipeable
            renderRightActions={() => renderRightActions(item)}
            overshootRight={false}
          >
            <View style={styles.item}>
              <View style={styles.timeIndicator}>
                <Text style={styles.timeText}>{item.hora}</Text>
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.nome}>👤 {item.nome}</Text>
                <Text style={styles.det}>💅 {item.serv}</Text>
                {item.observacoes ? (
                  <Text style={styles.obs}>📝 {item.observacoes}</Text>
                ) : null}
              </View>
            </View>
          </Swipeable>
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.headerSection}>
            <Text style={styles.headerDate}>📆 {formatarDataBonita(section.title)}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.empty}>Nenhum agendamento</Text>
            <Text style={styles.emptySubtext}>Toque em "+ Novo" para criar</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <TouchableOpacity style={styles.addBtn} onPress={novoAgendamento}>
        <Text style={styles.addText}>+ Novo Agendamento</Text>
      </TouchableOpacity>
    </View>
  );
}

// Formatar data de forma bonita
function formatarDataBonita(data) {
  if (!data || data === "0000-00-00") return "Data inválida";
  
  const [ano, mes, dia] = data.split("-");
  const dataObj = new Date(ano, mes - 1, dia);
  
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  const amanha = new Date(hoje);
  amanha.setDate(hoje.getDate() + 1);
  
  dataObj.setHours(0, 0, 0, 0);
  
  if (dataObj.getTime() === hoje.getTime()) {
    return "Hoje";
  } else if (dataObj.getTime() === amanha.getTime()) {
    return "Amanhã";
  }
  
  const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sext", "Sáb"];
  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  
  return `${diasSemana[dataObj.getDay()]}, ${dia} de ${meses[parseInt(mes) - 1]}`;
}

// 🎨 ESTILOS
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },

  headerContainer: {
    backgroundColor: "#EB69A3",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },

  pageTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginTop: 10,
  },

  backBtn: {
    alignSelf: "flex-start",
  },
  backText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },

  headerSection: {
    backgroundColor: "#fff",
    marginTop: 20,
    marginHorizontal: 15,
    marginBottom: 10,
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#EB69A3",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },

  headerDate: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },

  item: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 15,
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },

  timeIndicator: {
    backgroundColor: "#EB69A3",
    width: 70,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
  },

  timeText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  itemContent: {
    flex: 1,
    padding: 15,
    justifyContent: "center",
  },

  nome: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  det: {
    fontSize: 15,
    color: "#666",
    marginBottom: 3,
  },
  obs: {
    fontSize: 13,
    color: "#999",
    marginTop: 5,
    fontStyle: "italic",
  },

  deleteAction: {
    backgroundColor: "#FF4444",
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    borderRadius: 15,
    marginRight: 15,
    marginBottom: 10,
  },
  deleteActionText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },

  emptyIcon: {
    fontSize: 64,
    marginBottom: 10,
  },

  empty: {
    textAlign: "center",
    color: "#666",
    fontSize: 18,
    fontWeight: "600",
  },

  emptySubtext: {
    textAlign: "center",
    color: "#999",
    fontSize: 14,
    marginTop: 5,
  },

  addBtn: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#4caf50",
    padding: 18,
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  addText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
