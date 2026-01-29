# GymTracker Pro

Aplicativo de gerenciamento de treinos e exercícios desenvolvido com React, TypeScript e Vite.

## 📋 Pré-requisitos

- Node.js (versão 18 ou superior)
- npm (vem junto com o Node.js)

## 🚀 Instalação

### 1. Instalar Node.js

Se você não tem o Node.js instalado, escolha uma das opções:

#### Opção A: Instalar via Homebrew (Recomendado para macOS)

```bash
# Instalar Homebrew (se ainda não tiver)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar Node.js
brew install node
```

#### Opção B: Instalar via NVM (Node Version Manager)

```bash
# Instalar NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Recarregar o terminal ou executar:
source ~/.zshrc

# Instalar a versão LTS do Node.js
nvm install --lts
nvm use --lts
```

#### Opção C: Download direto

1. Acesse [nodejs.org](https://nodejs.org/)
2. Baixe a versão LTS (Long Term Support)
3. Execute o instalador

### 2. Verificar instalação

```bash
node --version
npm --version
```

### 3. Instalar dependências do projeto

```bash
npm install
```

### 4. Executar o projeto

```bash
npm run dev
```

O projeto será aberto em `http://localhost:5173` (ou outra porta se 5173 estiver ocupada).

### 5. Banco de dados (Supabase)

Para usar o Supabase como banco de dados:

1. Crie um arquivo `.env` na raiz do projeto (veja `.env.example`):
   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-anon-key-publica
   ```
2. Crie um projeto em [supabase.com](https://supabase.com) e copie a URL e a chave anon em **Settings → API**.
3. No **SQL Editor** do Supabase, execute o script em **[docs/supabase-setup.md](docs/supabase-setup.md)** para criar as tabelas e RLS.

Sem o `.env`, o app continua funcionando com dados locais (mock/localStorage).

## 📁 Estrutura do Projeto

```
GymTracker Pro/
├── src/
│   ├── react-app/          # Aplicação React
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/          # Páginas da aplicação
│   │   └── App.tsx         # Componente principal
│   ├── shared/             # Código compartilhado
│   │   └── types.ts        # Tipos TypeScript
│   └── worker/             # Cloudflare Worker (backend)
├── package.json
└── vite.config.ts
```

## 🛠️ Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run lint` - Executa o linter
- `npm run check` - Verifica tipos e faz build de teste

## 📝 Funcionalidades

- ✅ Dashboard com estatísticas e gráficos
- ✅ Gerenciamento de exercícios (CRUD completo)
- ✅ Gerenciamento de treinos
- ✅ Métricas e medidas corporais
- ✅ Galeria de fotos de progresso
- ✅ Metas (objetivos e acompanhamento)
- ✅ Recomendações (dicas por categoria)
- ✅ Relatórios com filtros avançados
- ✅ Layout responsivo para mobile

## 🎨 Tecnologias

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Recharts
- Lucide React (ícones)
- Zod (validação)
- Hono (backend)
- **Supabase** (banco de dados e auth – opcional)

## 📋 Próximos passos

- Configurar Supabase (projeto + `.env` + SQL em [docs/supabase-setup.md](docs/supabase-setup.md))
- Migrar autenticação para Supabase Auth
- Conectar páginas ao Supabase (exercícios, treinos, medidas, metas)
- Testes e deploy

Ver **[docs/proximos-passos.md](docs/proximos-passos.md)** para o roteiro detalhado.

## 🐙 Publicar no GitHub

1. **Crie um repositório no GitHub**  
   Em [github.com/new](https://github.com/new), crie um repositório **vazio** (sem README, .gitignore ou licença). Anote a URL (ex.: `https://github.com/seu-usuario/gymtracker-pro.git`).

2. **Na pasta do projeto, no terminal:**

   ```bash
   # Se ainda não tiver inicializado o Git
   git init

   # Adicione o remote (troque pela URL do seu repositório)
   git remote add origin https://github.com/SEU-USUARIO/gymtracker-pro.git

   # Adicione todos os arquivos, faça o primeiro commit e envie
   git add .
   git commit -m "Initial commit: GymTracker Pro"
   git branch -M main
   git push -u origin main
   ```

3. **Segurança**  
   O arquivo `.env` (com as chaves do Supabase) está no `.gitignore` e **não** será enviado. Quem clonar o projeto deve criar um `.env` a partir do `.env.example` e preencher com as próprias chaves.

## 📄 Licença

Este projeto é privado.
