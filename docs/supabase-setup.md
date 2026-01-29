# Configuração do Supabase (GymTracker Pro)

Este guia descreve como configurar o Supabase como banco de dados do GymTracker Pro.

---

## 1. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e faça login.
2. Crie um novo projeto (nome, senha do banco, região).
3. Em **Settings → API** copie:
   - **Project URL** → use como `VITE_SUPABASE_URL`
   - **anon public** (chave pública) → use como `VITE_SUPABASE_ANON_KEY`

---

## 2. Variáveis de ambiente

Na raiz do projeto, crie um arquivo `.env` (não commitar):

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-publica
```

Reinicie o `npm run dev` após criar/alterar o `.env`.

---

## 3. Schema inicial (SQL)

No dashboard do Supabase, vá em **SQL Editor** → **New query** → cole o conteúdo do arquivo **`supabase/001_initial_schema.sql`** → **Run**.

O script cria:

- **Tabelas**: `profiles`, `exercises`, `body_measurements`, `workouts`, `workout_exercises`, `workout_sets`, `goals`, `progress_photos`
- **RLS**: políticas para cada usuário ver e editar apenas seus dados
- **Trigger**: ao registrar usuário no Supabase Auth, um perfil é criado em `profiles`
- **Triggers `updated_at`**: atualizam a coluna `updated_at` em UPDATE

O arquivo está em: **[supabase/001_initial_schema.sql](../supabase/001_initial_schema.sql)**

### Tabela de anamnese (questionário pós-cadastro)

Depois de rodar o schema inicial, execute também **`supabase/002_anamnesis.sql`** no SQL Editor. Esse script cria a tabela `anamnesis`, onde são armazenadas as respostas do questionário que o aluno preenche após o cadastro.

---

## 4. Como verificar que está funcionando

### No dashboard do Supabase

1. **Table Editor**  
   No menu lateral: **Table Editor**. Devem aparecer as tabelas: `profiles`, `exercises`, `body_measurements`, `workouts`, `workout_exercises`, `workout_sets`, `goals`, `progress_photos`.  
   Se todas existirem, o SQL foi aplicado.

2. **RLS (Row Level Security)**  
   Em cada tabela, abra **…** → **View table definition** (ou **Policies**). Deve estar escrito que RLS está **Enabled** e existem políticas (ex.: `profiles_select_own`, `exercises_all_own`, etc.).

3. **Query de teste no SQL Editor**  
   No **SQL Editor**, rode:
   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'
     AND table_type = 'BASE TABLE'
   ORDER BY table_name;
   ```  
   O resultado deve listar as 8 tabelas acima.

### No seu projeto (app)

1. **Variáveis de ambiente**  
   Confirme que o `.env` na raiz tem `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` preenchidos e que você reiniciou o `npm run dev` depois de criar/alterar o `.env`.

2. **Teste de conexão no app**  
   Com o app rodando (`npm run dev`), faça login e vá em **Perfil** (menu lateral). No card **Conta**, clique em **"Testar conexão Supabase"**.  
   - Se aparecer um alert com **"Conexão OK. Tabela profiles acessível (0 registros)."** (ou com um número de registros), a URL e a anon key estão corretas e o app está falando com o Supabase.  
   - Se aparecer **"Variáveis ... não definidas"**, crie/ajuste o `.env` e reinicie o `npm run dev`.  
   - Se aparecer **"Erro Supabase: ..."**, confira a URL e a anon key no Supabase (Settings → API) e se o SQL do schema foi executado (tabela `profiles` deve existir).

### Resumo

| O que verificar | Onde | O que esperar |
|-----------------|------|----------------|
| Tabelas criadas | Supabase → Table Editor | 8 tabelas listadas |
| RLS ativo | Supabase → cada tabela → Policies | RLS enabled + políticas |
| URL e anon key | Seu `.env` + console do app | Sem aviso de variáveis indefinidas |
| Conexão do app | Perfil → Conta → "Testar conexão Supabase" | Alert "Conexão OK. Tabela profiles acessível..." |

---

## 5. Uso no código

O cliente Supabase está em `src/react-app/lib/supabase.ts`:

```ts
import { supabase } from "@/react-app/lib/supabase";

// Exemplo: ler perfil
const { data, error } = await supabase
  .from("profiles")
  .select("*")
  .eq("id", userId)
  .single();

// Exemplo: auth (quando migrar para Supabase Auth)
const { data, error } = await supabase.auth.signInWithPassword({ email, password });
```

---

## 6. Autenticação já usa Supabase (quando .env está configurado)

Quando `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão no `.env`, o app usa **Supabase Auth**:

- **Registro**: cria usuário em **Authentication → Users** e uma linha em **Table Editor → profiles** (trigger).
- **Login**: usa e-mail/senha do Supabase Auth.
- **Logout**: encerra a sessão no Supabase.

Para **não exigir confirmação de e-mail** (entrar logo após registrar): no dashboard do Supabase, vá em **Authentication → Providers → Email** e desative **"Confirm email"**. Caso contrário, após registrar o app mostra uma mensagem pedindo para confirmar o e-mail.

---

## 7. Próximos passos
- **Dados**: Substituir mocks nas páginas por `supabase.from("exercises")`, `supabase.from("workouts")`, etc., usando o `user.id` do Supabase Auth.
- **Storage**: Criar bucket para fotos de progresso e configurar RLS no bucket.
