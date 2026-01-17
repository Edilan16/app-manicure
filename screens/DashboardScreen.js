import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { db, auth } from '../config/Firebase';
import { collection, onSnapshot, query, orderBy, limit, where, deleteDoc, doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { 
  getCurrentMonthRange, 
  verificarArquivamentoNecessario, 
  arquivarMesAnterior 
} from '../utils/monthlyReportManager';

export default function DashboardScreen({ navigation }) {
  const [receita, setReceita] = useState(0);
  const [despesa, setDespesa] = useState(0);
  const [pix, setPix] = useState(0);
  const [cartao, setCartao] = useState(0);
  const [dinheiro, setDinheiro] = useState(0);
  const [extrato, setExtrato] = useState([]);
  const [mesAtual, setMesAtual] = useState('');

  // --------------------------------------------------------------------
  // ✓ VERIFICAR E ARQUIVAR MÊS ANTERIOR (roda uma vez ao abrir)
  // --------------------------------------------------------------------
  useEffect(() => {
    const verificarEArquivar = async () => {
      try {
        const necessario = await verificarArquivamentoNecessario();
        if (necessario) {
          const resultado = await arquivarMesAnterior();
          if (resultado.success && resultado.relatorio) {
            console.log('Mês anterior arquivado automaticamente');
          }
        }
      } catch (error) {
        console.error('Erro ao verificar arquivamento:', error);
      }
    };

    verificarEArquivar();
    
    // Definir mês atual para exibição
    const { mesAno } = getCurrentMonthRange();
    setMesAtual(mesAno);
  }, []);

  // --------------------------------------------------------------------
  // ✓ SOMATÓRIO (receita / despesa / métodos) - APENAS MÊS ATUAL
  // --------------------------------------------------------------------
  useEffect(() => {
    const { start, end } = getCurrentMonthRange();
    
    const q = query(
      collection(db, "financeiro"),
      where("data", ">=", start),
      where("data", "<=", end)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let totalReceita = 0;
      let totalDespesa = 0;
      let totalPix = 0;
      let totalCartao = 0;
      let totalDinheiro = 0;

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const r = Number(data.receita) || 0;
        const d = Number(data.despesa) || 0;

        totalReceita += r;
        totalDespesa += d;

        if (r > 0) {
          const metodo = (data.metodoPagamento || "").toLowerCase().trim();
          
          switch (metodo) {
            case "pix": 
              totalPix += r;
              break;
            case "cartão":
            case "cartao": 
              totalCartao += r;
              break;
            case "dinheiro": 
              totalDinheiro += r;
              break;
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

  // --------------------------------------------------------------------
  // ✓ CARREGA ÚLTIMOS LANÇAMENTOS - APENAS MÊS ATUAL
  // --------------------------------------------------------------------
  useEffect(() => {
    const { start, end } = getCurrentMonthRange();
    
    const q = query(
      collection(db, "financeiro"),
      where("data", ">=", start),
      where("data", "<=", end),
      orderBy("data", "desc"),
      limit(10)
    );
    
    const unsubscribeExtrato = onSnapshot(q, (snapshot) => {
      const dados = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExtrato(dados);
    });

    return () => unsubscribeExtrato();
  }, []);

  // --------------------------------------------------------------------
  // ✓ EXPORTAR PDF COMPLETO COM ANÁLISES
  // --------------------------------------------------------------------
  async function exportarRelatorioPDF() {
    try {
      // Buscar TODOS os dados para análise completa
      const snapshotCompleto = await new Promise((resolve) => {
        const unsubscribe = onSnapshot(collection(db, "financeiro"), (snapshot) => {
          unsubscribe();
          resolve(snapshot);
        });
      });

      const todosLancamentos = snapshotCompleto.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // === ANÁLISE POR MÊS ===
      const porMes = {};
      todosLancamentos.forEach(item => {
        const data = new Date(item.data.seconds * 1000);
        const mesAno = `${data.getMonth() + 1}/${data.getFullYear()}`;
        
        if (!porMes[mesAno]) {
          porMes[mesAno] = { receita: 0, despesa: 0 };
        }
        
        porMes[mesAno].receita += Number(item.receita) || 0;
        porMes[mesAno].despesa += Number(item.despesa) || 0;
      });

      // Encontrar mês com maior entrada
      let melhorMes = { mes: "-", valor: 0 };
      Object.keys(porMes).forEach(mes => {
        if (porMes[mes].receita > melhorMes.valor) {
          melhorMes = { mes, valor: porMes[mes].receita };
        }
      });

      // === ANÁLISE DE DESPESAS ===
      const despesasPorCategoria = {};
      todosLancamentos.forEach(item => {
        if (item.despesa > 0) {
          const categoria = item.descricaoDespesa || "Outros";
          despesasPorCategoria[categoria] = (despesasPorCategoria[categoria] || 0) + Number(item.despesa);
        }
      });

      // Top 5 categorias de despesas
      const topDespesas = Object.entries(despesasPorCategoria)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      // === ANÁLISE DE RECEITAS ===
      const receitasPorServico = {};
      todosLancamentos.forEach(item => {
        if (item.receita > 0) {
          const servico = item.descricaoReceita || "Outros";
          receitasPorServico[servico] = (receitasPorServico[servico] || 0) + Number(item.receita);
        }
      });

      // Top 5 serviços mais lucrativos
      const topReceitas = Object.entries(receitasPorServico)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      // === MÉDIA DIÁRIA ===
      const datasUnicas = [...new Set(todosLancamentos.map(item => 
        new Date(item.data.seconds * 1000).toLocaleDateString("pt-BR")
      ))];
      const mediaDiaria = receita / (datasUnicas.length || 1);

      const total = receita - despesa;

      const html = `
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            @media print {
              body { margin: 0; }
            }
            body { font-family: Arial; padding: 24px; color: #333; }
            h1 { text-align: center; color: #EB69A3; border-bottom: 3px solid #EB69A3; padding-bottom: 10px; page-break-after: avoid; }
            h2 { color: #1565c0; margin-top: 30px; border-left: 5px solid #1565c0; padding-left: 10px; page-break-after: avoid; }
            .destaque { background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 10px 0; page-break-inside: avoid; }
            .positivo { color: #4caf50; font-weight: bold; }
            .negativo { color: #f44336; font-weight: bold; }
            .tabela { width: 100%; border-collapse: collapse; margin: 15px 0; page-break-inside: avoid; }
            .tabela td, .tabela th { border: 1px solid #ddd; padding: 10px; text-align: left; }
            .tabela th { background: #EB69A3; color: white; }
            .lancamento { margin-bottom:15px; padding:10px; border:1px solid #ddd; border-radius:8px; page-break-inside: avoid; }
          </style>
        </head>
        <body>
        
          <h1>📊 Relatório Financeiro Completo</h1>
          <p style="text-align: center; color: #666;">Gerado em ${new Date().toLocaleString("pt-BR")}</p>

          <h2>💰 Resumo Geral</h2>
          <div class="destaque">
            <p><strong>Total de Receitas:</strong> <span class="positivo">R$ ${receita.toFixed(2)}</span></p>
            <p><strong>Total de Despesas:</strong> <span class="negativo">R$ ${despesa.toFixed(2)}</span></p>
            <p style="font-size:20px;"><strong>Lucro Líquido:</strong> <span class="${total >= 0 ? 'positivo' : 'negativo'}">R$ ${total.toFixed(2)}</span></p>
            <p><strong>Margem de Lucro:</strong> ${receita > 0 ? ((total / receita) * 100).toFixed(1) : 0}%</p>
            <p><strong>Média de Receita por Dia:</strong> R$ ${mediaDiaria.toFixed(2)}</p>
          </div>

          <h2>💳 Formas de Pagamento</h2>
          <table class="tabela">
            <tr><th>Método</th><th>Valor</th><th>% do Total</th></tr>
            <tr><td>Pix</td><td>R$ ${pix.toFixed(2)}</td><td>${receita > 0 ? ((pix / receita) * 100).toFixed(1) : 0}%</td></tr>
            <tr><td>Cartão</td><td>R$ ${cartao.toFixed(2)}</td><td>${receita > 0 ? ((cartao / receita) * 100).toFixed(1) : 0}%</td></tr>
            <tr><td>Dinheiro</td><td>R$ ${dinheiro.toFixed(2)}</td><td>${receita > 0 ? ((dinheiro / receita) * 100).toFixed(1) : 0}%</td></tr>
          </table>

          <h2>📈 Análise Mensal</h2>
          <div class="destaque">
            <p><strong>🏆 Melhor Mês:</strong> ${melhorMes.mes} com R$ ${melhorMes.valor.toFixed(2)} em receitas</p>
          </div>
          <table class="tabela">
            <tr><th>Mês</th><th>Receitas</th><th>Despesas</th><th>Lucro</th></tr>
            ${Object.keys(porMes).sort().reverse().map(mes => `
              <tr>
                <td>${mes}</td>
                <td class="positivo">R$ ${porMes[mes].receita.toFixed(2)}</td>
                <td class="negativo">R$ ${porMes[mes].despesa.toFixed(2)}</td>
                <td class="${(porMes[mes].receita - porMes[mes].despesa) >= 0 ? 'positivo' : 'negativo'}">
                  R$ ${(porMes[mes].receita - porMes[mes].despesa).toFixed(2)}
                </td>
              </tr>
            `).join("")}
          </table>

          <h2>⭐ Top 5 Serviços Mais Lucrativos</h2>
          <table class="tabela">
            <tr><th>#</th><th>Serviço</th><th>Receita Total</th></tr>
            ${topReceitas.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item[0]}</td>
                <td class="positivo">R$ ${item[1].toFixed(2)}</td>
              </tr>
            `).join("")}
          </table>

          <h2>💸 Top 5 Maiores Despesas</h2>
          <table class="tabela">
            <tr><th>#</th><th>Categoria</th><th>Valor Total</th></tr>
            ${topDespesas.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item[0]}</td>
                <td class="negativo">R$ ${item[1].toFixed(2)}</td>
              </tr>
            `).join("")}
          </table>

          <h2>📋 Últimos 10 Lançamentos</h2>
          ${extrato.map((item) => `
            <div class="lancamento" style="background: ${item.receita > 0 ? '#e8f5e9' : '#ffebee'};">
              <p><strong>${item.receita > 0 ? "✅ Receita" : "❌ Despesa"}</strong> - 
              <span class="${item.receita > 0 ? 'positivo' : 'negativo'}">R$ ${(item.receita || item.despesa).toFixed(2)}</span></p>
              <p><strong>Descrição:</strong> ${item.descricaoReceita || item.descricaoDespesa || "-"}</p>
              ${item.metodoPagamento ? `<p><strong>Método:</strong> ${item.metodoPagamento}</p>` : ''}
              <p><strong>Data:</strong> ${new Date(item.data.seconds * 1000).toLocaleString("pt-BR")}</p>
            </div>
          `).join("")}

        </body>
        </html>
      `;

      // === SOLUÇÃO ESPECÍFICA PARA WEB ===
      if (Platform.OS === 'web') {
        // Criar uma nova janela com o conteúdo
        const printWindow = window.open('', '_blank');
        printWindow.document.write(html);
        printWindow.document.close();
        
        // Aguardar carregamento e abrir diálogo de impressão
        printWindow.onload = function() {
          printWindow.print();
        };
      } else {
        // Para mobile, usar expo-print
        const { uri } = await Print.printToFileAsync({ 
          html,
          width: 612,
          height: 792,
          base64: false
        });

        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "Exportar relatório completo",
          UTI: "com.adobe.pdf",
        });
      }

    } catch (error) {
      console.log("Erro ao gerar PDF:", error);
      if (Platform.OS === 'web') {
        window.alert("Não foi possível gerar o relatório.");
      } else {
        Alert.alert("Erro", "Não foi possível gerar o relatório.");
      }
    }
  }

  // --------------------------------------------------------------------
  // ✓ FUNÇÃO DE LOGOUT
  // --------------------------------------------------------------------
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('Login');
    } catch (error) {
      console.error('Erro ao sair:', error);
      Alert.alert('Erro', 'Não foi possível sair');
    }
  };

  // --------------------------------------------------------------------
  // ✓ FUNÇÃO PARA EXCLUIR LANÇAMENTO
  // --------------------------------------------------------------------
  const excluirLancamento = async (lancamento) => {
    const valor = Number(lancamento.receita || lancamento.despesa || 0);
    const tipo = lancamento.receita > 0 ? "Receita" : "Despesa";
    const descricao = lancamento.descricaoReceita || lancamento.descricaoDespesa || "Lançamento";

    if (Platform.OS === 'web') {
      const confirmar = window.confirm(
        `Deseja realmente excluir este lançamento?\n\n${tipo}: R$ ${valor.toFixed(2)}\n${descricao}`
      );
      if (!confirmar) return;
    } else {
      Alert.alert(
        'Excluir Lançamento',
        `Deseja realmente excluir este lançamento?\n\n${tipo}: R$ ${valor.toFixed(2)}\n${descricao}`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Excluir',
            style: 'destructive',
            onPress: async () => {
              await executarExclusao(lancamento.id);
            }
          }
        ]
      );
      return;
    }

    await executarExclusao(lancamento.id);
  };

  const executarExclusao = async (id) => {
    try {
      await deleteDoc(doc(db, 'financeiro', id));
      
      if (Platform.OS === 'web') {
        window.alert('Lançamento excluído com sucesso!');
      } else {
        Alert.alert('Sucesso', 'Lançamento excluído com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao excluir:', error);
      if (Platform.OS === 'web') {
        window.alert('Erro ao excluir lançamento');
      } else {
        Alert.alert('Erro', 'Não foi possível excluir o lançamento');
      }
    }
  };

  // --------------------------------------------------------------------
  // ✓ TELA
  // --------------------------------------------------------------------
  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.title}>Dashboard</Text>
            <Text style={styles.subtitle}>Mês Atual: {mesAtual}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>

        {/* Receitas / despesas */}
        <View style={styles.card}>
          <Text style={styles.label}>Receita Total</Text>
          <Text style={styles.value}>R$ {receita.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Despesa Total</Text>
          <Text style={styles.value}>R$ {despesa.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
        </View>

        <View style={styles.cardTotal}>
          <Text style={styles.labelTotal}>Lucro</Text>
          <Text style={styles.valueTotal}>R$ {(receita - despesa).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
        </View>

        {/* Formas de pagamento */}
        <Text style={[styles.title, { marginTop: 30 }]}>Formas de Pagamento</Text>
        <View style={styles.cardInfo}>
          <Text style={styles.labelInfo}>Pix</Text>
          <Text style={styles.valueInfo}>R$ {pix.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.labelInfo}>Cartão</Text>
          <Text style={styles.valueInfo}>R$ {cartao.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.labelInfo}>Dinheiro</Text>
          <Text style={styles.valueInfo}>R$ {dinheiro.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
        </View>

        {/* Últimos lançamentos */}
        <View style={styles.lancamentosHeader}>
          <Text style={[styles.title, { marginTop: 30, marginBottom: 0 }]}>Últimos Lançamentos</Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('GerenciarLancamentos')}
            style={styles.verTodosButton}
          >
            <Text style={styles.verTodosText}>Ver Todos</Text>
          </TouchableOpacity>
        </View>

        {extrato.map((item) => {
          const valor = Number(item.receita || item.despesa || 0);
          const tipo = item.receita > 0 ? "Receita" : "Despesa";
          const descricao = item.descricaoReceita || item.descricaoDespesa || "-";

          return (
            <View key={item.id} style={styles.extratoItem}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.extratoTipo, { color: tipo === "Receita" ? 'green' : 'red' }]}>{tipo}</Text>
                <Text style={styles.extratoDesc}>{descricao}</Text>
                <Text style={styles.extratoMetodo}>{item.metodoPagamento || "-"}</Text>
              </View>

              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.extratoValor}>R$ {valor.toFixed(2)}</Text>
                <Text style={styles.extratoData}>
                  {item.data?.seconds ? new Date(item.data.seconds * 1000).toLocaleDateString("pt-BR") : "-"}
                </Text>
              </View>

              <TouchableOpacity 
                onPress={() => excluirLancamento(item)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteButtonText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          );
        })}

        {/* Botão PDF */}
        <TouchableOpacity
          onPress={exportarRelatorioPDF}
          style={{
            padding: 14,
            backgroundColor: "#4a90e2",
            marginTop: 12,
            borderRadius: 10
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, textAlign: "center", fontWeight: "bold" }}>
            Exportar Relatório em PDF
          </Text>
        </TouchableOpacity>

        {/* Botão Relatórios Mensais */}
        <TouchableOpacity
          onPress={() => navigation.navigate('RelatoriosMensais')}
          style={{
            padding: 14,
            backgroundColor: "#9c27b0",
            marginTop: 12,
            borderRadius: 10
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, textAlign: "center", fontWeight: "bold" }}>
            📊 Ver Relatórios de Meses Anteriores
          </Text>
        </TouchableOpacity>

        {/* Botão Lembretes */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Lembretes')}
          style={{
            padding: 14,
            backgroundColor: "#25D366",
            marginTop: 12,
            marginBottom: 80,
            borderRadius: 10
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, textAlign: "center", fontWeight: "bold" }}>
            💬 Enviar Lembretes de Amanhã
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Botões Flutuantes */}
      <View style={styles.fabContainer}>
        <TouchableOpacity 
          style={[styles.fab, { backgroundColor: '#EB69A3' }]} 
          onPress={() => navigation.navigate('NovoAgendamento')}
        >
          <Text style={styles.fabText}>📅</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.fab, { backgroundColor: '#1565c0' }]} 
          onPress={() => navigation.navigate('Financeiro')}
        >
          <Text style={styles.fabText}>💰</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.fab, { backgroundColor: '#4caf50' }]} 
          onPress={() => navigation.navigate('Agenda')}
        >
          <Text style={styles.fabText}>📋</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// --------------------------------------------------------------------
// ✓ ESTILOS
// --------------------------------------------------------------------
const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, alignItems: "center" },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: 15
  },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 5, color: "#444" },
  subtitle: { fontSize: 14, color: "#666", marginBottom: 15 },
  logoutButton: {
    backgroundColor: '#ff5252',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  lancamentosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 30,
  },

  verTodosButton: {
    backgroundColor: '#1565c0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },

  verTodosText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },

  card: {
    width: "100%",
    padding: 18,
    backgroundColor: "#e3f2fd",
    borderRadius: 10,
    marginVertical: 10
  },

  cardTotal: {
    width: "100%",
    padding: 20,
    backgroundColor: "#c8e6c9",
    borderRadius: 10,
    marginVertical: 10
  },

  label: { fontSize: 18, fontWeight: "600", color: "#000" },
  value: { fontSize: 25, fontWeight: "bold", marginTop: 5, color: "#000" },

  labelTotal: { fontSize: 20, fontWeight: "700", color: "#000" },
  valueTotal: { fontSize: 28, fontWeight: "bold", marginTop: 5, color: "#000" },

  cardInfo: {
    width: "100%",
    padding: 15,
    backgroundColor: "#fff3e0",
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#f9c27b"
  },

  labelInfo: { fontSize: 18, fontWeight: "600", color: "#000" },
  valueInfo: { fontSize: 22, fontWeight: "bold", marginTop: 5, color: "#000" },

  extratoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    width: "100%"
  },

  deleteButton: {
    marginLeft: 10,
    padding: 8,
    backgroundColor: '#ffebee',
    borderRadius: 8,
  },

  deleteButtonText: {
    fontSize: 18,
  },

  extratoTipo: { fontSize: 16, fontWeight: "bold" },
  extratoDesc: { fontSize: 14, color: "#555" },
  extratoValor: { fontSize: 16, fontWeight: "bold" },
  extratoMetodo: { fontSize: 14, color: "#777" },
  extratoData: { fontSize: 12, color: "#555" },

  fabContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    flexDirection: "column",
    gap: 12,
  },

  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },

  fabText: {
    fontSize: 24,
  },

  buttonPrimary: {
    width: "100%",
    backgroundColor: "#1565c0",
    padding: 15,
    borderRadius: 10,
    marginTop: 25,
    alignItems: "center"
  },

  buttonSecondary: {
    width: "100%",
    backgroundColor: "#00897b",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center"
  },

  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" }
});
