# 💅 App Manicure

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-~54.0.25-000020.svg)](https://expo.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-12.6.0-orange.svg)](https://firebase.google.com/)

Aplicativo mobile para gestão completa de salão de manicure, desenvolvido com React Native e Expo. Sistema robusto para controle de agendamentos, clientes e finanças do seu negócio.

## 📋 Funcionalidades Principais

### 🔐 Autenticação (LoginScreen)
- Sistema de login seguro com Firebase Authentication
- Controle de acesso com e-mail e senha
- Gerenciamento automático de sessão de usuário
- Verificação de estado de autenticação
- Interface intuitiva com feedback visual de carregamento

### 📊 Dashboard (DashboardScreen)
- Painel principal com visão geral completa do negócio
- Resumo financeiro em tempo real (receitas e despesas)
- Análise de métodos de pagamento (PIX, Cartão, Dinheiro)
- Extrato de movimentações recentes
- Geração e compartilhamento de relatórios em PDF
- Navegação rápida para todas as funcionalidades
- Atualização automática de dados via Firebase Firestore

### 📅 Agenda (AgendaScreen)
- Visualização completa de agendamentos
- Lista de clientes e horários marcados
- Gerenciamento eficiente de compromissos
- Interface organizada por ordem cronológica
- Integração em tempo real com Firebase Firestore

### ➕ Novo Agendamento (NovoAgendamentoScreen)
- Criação rápida de novos agendamentos
- Seleção de data e horário com DateTimePicker nativo
- Registro detalhado de informações do cliente
- Cadastro de serviços realizados
- Integração direta com Firebase Firestore
- Validação de campos obrigatórios

### 💰 Financeiro (FinanceiroScreen)
- Controle completo de receitas e despesas
- Registro de métodos de pagamento (PIX, Cartão, Dinheiro)
- Relatórios financeiros detalhados
- Gestão eficiente de pagamentos
- Geração de relatórios em PDF com expo-print
- Compartilhamento de relatórios via expo-sharing
- Visualização de extrato financeiro em tempo real

## 🚀 Tecnologias Utilizadas

- **React Native** (0.81.5) - Framework para desenvolvimento mobile multiplataforma
- **Expo** (~54.0.25) - Plataforma de desenvolvimento e build
- **Firebase** (^12.6.0) - Backend as a Service (BaaS)
  - Firebase Authentication - Autenticação de usuários
  - Cloud Firestore - Banco de dados NoSQL em tempo real
- **React Navigation** (^7.1.22) - Navegação entre telas
  - Native Stack Navigator - Navegação nativa para melhor performance
- **AsyncStorage** (^2.2.0) - Armazenamento local persistente
- **DateTimePicker** (^8.5.1) - Seleção de data e hora nativa
- **TypeScript** (~5.9.2) - Tipagem estática para maior segurança
- **Expo Print** (~15.0.7) - Geração de documentos PDF
- **Expo Sharing** (~14.0.7) - Compartilhamento de arquivos
- **React Native Gesture Handler** (^2.29.1) - Gestão de gestos
- **Picker** (2.11.1) - Seleção de opções em listas

## 📁 Estrutura do Projeto

```
app-manicure/
├── screens/                    # Telas do aplicativo
│   ├── LoginScreen.js          # Tela de autenticação
│   ├── DashboardScreen.js      # Painel principal
│   ├── AgendaScreen.js         # Visualização de agendamentos
│   ├── NovoAgendamentoScreen.js # Criação de agendamentos
│   └── FinanceiroScreen.js     # Controle financeiro
├── config/                     # Configurações
│   └── Firebase.js             # Configuração do Firebase
├── utils/                      # Utilitários e funções auxiliares
│   └── checkEmptyCollection.js # Verificação de coleções
├── assets/                     # Imagens e recursos
│   ├── icon.png                # Ícone do app
│   ├── splash-icon.png         # Tela de splash
│   ├── adaptive-icon.png       # Ícone adaptativo (Android)
│   └── favicon.png             # Favicon (Web)
├── App.js                      # Componente principal da aplicação
├── index.ts                    # Ponto de entrada TypeScript
├── app.json                    # Configuração do Expo
├── package.json                # Dependências do projeto
├── tsconfig.json               # Configuração do TypeScript
├── firebase.json               # Configuração do Firebase Hosting
└── README.md                   # Documentação do projeto
```

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 16 ou superior) - [Download](https://nodejs.org/)
- **npm** ou **yarn** - Gerenciador de pacotes
- **Expo CLI** - Instale com `npm install -g expo-cli`
- **Conta Firebase** - Crie em [Firebase Console](https://console.firebase.google.com/)
- **Expo Go** (opcional) - App para testar em dispositivos físicos
  - [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)
  - [iOS](https://apps.apple.com/app/expo-go/id982107779)

## 🔧 Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/Edilan16/app-manicure.git
```

2. **Entre no diretório do projeto**
```bash
cd app-manicure
```

3. **Instale as dependências**
```bash
npm install
```

Ou, se preferir usar yarn:
```bash
yarn install
```

## 🔥 Configuração do Firebase

Para que o aplicativo funcione corretamente, você precisa configurar o Firebase:

### 1. Criar Projeto no Firebase

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Siga as instruções para criar seu projeto

### 2. Configurar Authentication

1. No Firebase Console, vá em **Authentication**
2. Clique em "Começar"
3. Ative o método de login **E-mail/Senha**
4. Adicione usuários manualmente ou permita cadastro

### 3. Configurar Firestore Database

1. No Firebase Console, vá em **Firestore Database**
2. Clique em "Criar banco de dados"
3. Escolha o modo de produção ou teste
4. Selecione a localização do servidor

**Coleções necessárias:**
- `agendamentos` - Armazena os agendamentos
- `financeiro` - Armazena movimentações financeiras

### 4. Adicionar Credenciais

1. No Firebase Console, vá em **Configurações do Projeto** (ícone de engrenagem)
2. Em "Seus apps", clique no ícone da Web `</>`
3. Registre o app e copie as credenciais
4. Abra o arquivo `config/Firebase.js`
5. Substitua as credenciais pelas suas:

```javascript
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_AUTH_DOMAIN",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_STORAGE_BUCKET",
  messagingSenderId: "SEU_MESSAGING_SENDER_ID",
  appId: "SEU_APP_ID",
  measurementId: "SEU_MEASUREMENT_ID"
};
```

⚠️ **Importante:** Nunca compartilhe suas credenciais do Firebase publicamente!

## ▶️ Como Executar

### Iniciar o servidor de desenvolvimento
```bash
npm start
```

### Executar no Android
```bash
npm run android
```

**Requisitos:**
- Android Studio instalado
- Emulador Android configurado ou dispositivo físico conectado

### Executar no iOS
```bash
npm run ios
```

**Requisitos:**
- macOS com Xcode instalado
- Simulador iOS ou dispositivo físico conectado

### Executar na Web
```bash
npm run web
```

Abrirá automaticamente no navegador em `http://localhost:19006`

### Testar em Dispositivo Físico

1. Instale o **Expo Go** no seu dispositivo
2. Execute `npm start`
3. Escaneie o QR Code com:
   - **Android:** App Expo Go
   - **iOS:** Câmera nativa do iPhone

## 📱 Uso do Aplicativo

1. **Login:** Faça login com suas credenciais configuradas no Firebase
2. **Dashboard:** Visualize o resumo financeiro e acesse as funcionalidades
3. **Agenda:** Consulte os agendamentos do salão
4. **Novo Agendamento:** Adicione novos clientes e horários
5. **Financeiro:** Registre receitas, despesas e gere relatórios

## 🛠️ Scripts Disponíveis

- `npm start` - Inicia o servidor de desenvolvimento Expo
- `npm run android` - Executa o app no emulador/dispositivo Android
- `npm run ios` - Executa o app no simulador/dispositivo iOS
- `npm run web` - Executa o app no navegador

## 🤝 Contribuindo

Contribuições são sempre bem-vindas! Para contribuir:

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Edilan16**

- GitHub: [@Edilan16](https://github.com/Edilan16)

---

⭐ Se este projeto foi útil para você, considere dar uma estrela no repositório!

Desenvolvido com ❤️ e ☕
