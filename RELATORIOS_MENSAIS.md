# Sistema de Relatórios Mensais

## 📋 Resumo das Mudanças

O sistema foi atualizado para arquivar automaticamente os dados financeiros de cada mês e manter o dashboard sempre mostrando apenas os dados do mês atual.

## ✨ Funcionalidades Implementadas

### 1. Dashboard Mensal (DashboardScreen.js)
- **Filtragem Automática**: Dashboard agora mostra apenas dados do mês atual
- **Indicador Visual**: Exibe o mês atual no topo da tela
- **Arquivamento Automático**: Ao abrir o dashboard, verifica se há dados do mês anterior que precisam ser arquivados

### 2. Arquivamento Automático (monthlyReportManager.js)
- **Verificação Inteligente**: Detecta quando um novo mês começa
- **Criação de Relatórios**: Automaticamente cria um relatório consolidado do mês anterior
- **Dados Preservados**: Mantém os dados originais na collection `financeiro` e cria resumo em `relatorios_mensais`

### 3. Tela de Relatórios Mensais (RelatoriosMensaisScreen.js)
- **Histórico Completo**: Lista todos os meses anteriores
- **Visualização Detalhada**: Ao clicar em um mês, exibe:
  - Resumo financeiro (receitas, despesas, lucro)
  - Formas de pagamento utilizadas
  - Top 5 serviços mais lucrativos
  - Top 5 categorias de despesas
  - Todos os lançamentos do mês
- **Interface Intuitiva**: Cards organizados com cores indicativas

## 🗂️ Estrutura do Firebase

### Collection: `financeiro`
- Mantém TODOS os lançamentos históricos
- Cada documento contém: receita, despesa, metodoPagamento, descricaoReceita, descricaoDespesa, data

### Collection: `relatorios_mensais` (NOVA)
- Criada automaticamente quando um mês termina
- Cada documento representa um mês e contém:
  ```javascript
  {
    mesAno: "12/2025",           // Identificador do mês
    mes: 12,                     // Número do mês
    ano: 2025,                   // Ano
    totalReceita: 15000.00,      // Total de receitas
    totalDespesa: 5000.00,       // Total de despesas
    lucro: 10000.00,             // Lucro líquido
    totalPix: 8000.00,           // Total recebido via Pix
    totalCartao: 5000.00,        // Total recebido via Cartão
    totalDinheiro: 2000.00,      // Total recebido em Dinheiro
    receitasPorServico: {        // Agrupamento por serviço
      "Manicure": 6000.00,
      "Pedicure": 4000.00,
      ...
    },
    despesasPorCategoria: {      // Agrupamento por categoria
      "Produtos": 3000.00,
      "Aluguel": 2000.00,
      ...
    },
    quantidadeLancamentos: 150,  // Total de lançamentos no mês
    dataArquivamento: Date()     // Quando foi arquivado
  }
  ```

## 🔄 Fluxo de Funcionamento

### Ao Abrir o Dashboard:
1. Sistema verifica se existe relatório do mês anterior
2. Se não existir E o mês mudou, cria automaticamente
3. Dashboard carrega apenas dados do mês atual (filtrado por data)
4. Usuário vê informações atualizadas do mês corrente

### Ao Mudar de Mês (exemplo: 31/dez → 01/jan):
1. Primeiro acesso em janeiro:
   - Sistema detecta que não existe relatório de dezembro
   - Busca todos os lançamentos de dezembro na collection `financeiro`
   - Calcula totalizadores e métricas
   - Cria documento em `relatorios_mensais` com resumo de dezembro
   - Dashboard limpa e mostra apenas janeiro (vazio no início)

2. Acessos seguintes em janeiro:
   - Dashboard continua mostrando apenas janeiro
   - Relatório de dezembro já está arquivado
   - Não há re-processamento

### Ao Visualizar Relatórios Anteriores:
1. Usuário clica em "Ver Relatórios de Meses Anteriores"
2. Sistema busca todos os documentos de `relatorios_mensais`
3. Exibe lista ordenada por data (mais recentes primeiro)
4. Ao clicar em um mês:
   - Mostra resumo consolidado do relatório
   - Busca lançamentos originais da collection `financeiro` para detalhes

## 📱 Interface do Usuário

### Dashboard
```
┌─────────────────────────────┐
│     Dashboard               │
│  Mês Atual: 1/2026          │
├─────────────────────────────┤
│  Receita Total: R$ 5.000,00 │ ← Apenas janeiro
│  Despesa Total: R$ 2.000,00 │
│  Lucro: R$ 3.000,00         │
├─────────────────────────────┤
│  [Exportar Relatório PDF]   │
│  [📊 Ver Meses Anteriores]  │ ← NOVO BOTÃO
└─────────────────────────────┘
```

### Tela de Relatórios Mensais
```
┌─────────────────────────────┐
│  ← Voltar                   │
│  Relatórios Mensais         │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ Dezembro 2025           │ │
│ │ Receitas: R$ 15.000,00  │ │
│ │ Despesas: R$ 5.000,00   │ │
│ │ Lucro: R$ 10.000,00     │ │
│ │ 💳 150 lançamentos      │ │
│ │ Ver Detalhes →          │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ Novembro 2025           │ │
│ │ ...                     │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

## 🎯 Vantagens do Sistema

1. **Performance**: Dashboard carrega apenas dados do mês atual
2. **Organização**: Histórico separado e facilmente acessível
3. **Automático**: Não requer ação manual para arquivar
4. **Preservação**: Dados originais nunca são deletados
5. **Análise**: Relatórios consolidados facilitam comparação entre meses
6. **Escalável**: Mesmo com anos de dados, dashboard permanece rápido

## 🔧 Manutenção

### Arquivos Modificados
- `screens/DashboardScreen.js` - Filtros e verificação automática
- `App.js` - Nova rota de navegação

### Arquivos Criados
- `utils/monthlyReportManager.js` - Lógica de arquivamento
- `screens/RelatoriosMensaisScreen.js` - Visualização de histórico
- `RELATORIOS_MENSAIS.md` - Esta documentação

## ⚠️ Notas Importantes

1. **Primeira Execução**: O sistema só arquiva meses anteriores quando detecta mudança de mês
2. **Dados Existentes**: Lançamentos anteriores à implementação permanecem na collection `financeiro` e podem ser visualizados normalmente
3. **Backup**: Os dados originais nunca são deletados, apenas organizados
4. **Firebase**: Certifique-se de que as regras do Firestore permitem leitura/escrita na collection `relatorios_mensais`

## 🔐 Regras Sugeridas do Firestore

Adicione estas regras ao Firebase Console:

```javascript
match /relatorios_mensais/{document} {
  allow read, write: if request.auth != null;
}
```

## 📊 Exemplo de Uso

1. **Janeiro 2026**: Usuário trabalha normalmente, adiciona lançamentos
2. **01 Fevereiro**: Ao abrir o app, sistema automaticamente:
   - Arquiva janeiro em `relatorios_mensais`
   - Dashboard mostra fevereiro zerado
3. **Durante Fevereiro**: Usuário adiciona novos lançamentos
4. **Consulta**: A qualquer momento, pode acessar "Relatórios Mensais" e ver:
   - Janeiro 2026 (arquivado)
   - Dezembro 2025 (se existir)
   - Novembro 2025 (se existir)
   - etc.

---

**Desenvolvido para**: App Manicure
**Data**: Janeiro 2026
**Versão**: 2.0
