# Próximos passos do GymTracker Pro

Este documento descreve os próximos passos sugeridos para evoluir o projeto.

---

## 1. Persistência de dados (curto prazo)

**Situação atual:** Todos os dados (exercícios, treinos, medidas, fotos, metas, recomendações) estão em estado local do React e são perdidos ao recarregar a página.

**Próximos passos:**

- [ ] **localStorage** – Persistir dados no navegador para não perder ao recarregar (rápido de implementar).
- [ ] **Context API ou Zustand** – Centralizar estado global (exercícios, treinos, medidas etc.) para ser usado em várias páginas e facilitar a troca futura por API.
- [ ] **Sincronização** – Definir se haverá sync com backend depois; se sim, desenhar o modelo de dados para evitar retrabalho.

---

## 2. Backend e banco de dados (Supabase)

**Situação atual:** O Supabase está configurado como banco de dados. Cliente em `src/react-app/lib/supabase.ts`; variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no `.env` (veja `.env.example`).

**Já feito:**

- [x] **Cliente Supabase** – `@supabase/supabase-js` instalado; `supabase` exportado em `src/react-app/lib/supabase.ts`.
- [x] **Variáveis de ambiente** – `.env.example` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`; `.gitignore` ignora `.env` e `.env.local`.
- [x] **Documentação** – `docs/supabase-setup.md` com: criar projeto, configurar `.env`, SQL inicial (tabelas `profiles`, `exercises`, `body_measurements`, `workouts`, `workout_exercises`, `workout_sets`, `goals`, `progress_photos`) e RLS.

**Próximos passos:**

- [ ] **Criar projeto no Supabase** – Seguir `docs/supabase-setup.md`; copiar URL e anon key para `.env`.
- [ ] **Rodar o SQL inicial** – No SQL Editor do Supabase, executar o script em `docs/supabase-setup.md` para criar tabelas e políticas RLS.
- [ ] **Migrar auth para Supabase Auth** – Trocar `authApi.ts` por `supabase.auth.signInWithPassword` / `signUp` / `signOut`; usar `onAuthStateChange` no AuthContext.
- [ ] **Conectar páginas ao Supabase** – Substituir mocks por `supabase.from("exercises")`, `supabase.from("workouts")`, etc., usando o `user.id` do Supabase Auth.
- [ ] **Worker (opcional)** – Se quiser API própria, implementar rotas no `src/worker/index.ts` que usem o Supabase (ou manter apenas frontend → Supabase direto).

---

## 3. Autenticação (médio prazo)

**Situação atual:** Fluxo de autenticação implementado no frontend (registro, login, sessão persistente em localStorage, rotas protegidas, logout). Preparado para dashboards com dados do usuário (aluno: nome, e-mail, perfil com objetivo, altura, etc.).

**Já implementado:**

- [x] **Registro de usuário** – Página `/register` com nome, e-mail, senha, confirmação e objetivo (opcional).
- [x] **Login** – Página `/login` com e-mail e senha; redirecionamento após login para a rota de origem (`returnUrl`).
- [x] **Sessão persistente** – Sessão salva em localStorage e restaurada ao reabrir o app; expira em 7 dias (simulado).
- [x] **Rotas protegidas** – Componente `ProtectedRoute`; redireciona para `/login` se não autenticado.
- [x] **Logout** – Botão "Sair" na sidebar; limpa sessão e redireciona para login.
- [x] **Dados do usuário para dashboards** – `useAuth()` expõe `user` (id, name, email, profile com goal, height, gender, birthDate). Use em qualquer página: `const { user } = useAuth();`.

**Próximos passos:**

- [ ] **Backend de auth** – Trocar o mock em `src/react-app/lib/authApi.ts` por chamadas à API (Worker) para login/registro e validação de token.
- [ ] **Sessões / JWT** – Garantir que cada usuário veja apenas seus próprios dados; validar token nas rotas da API.
- [ ] **Integração com Cloudflare** – Avaliar Workers Auth ou integração com provedor externo (Auth0, Clerk, etc.).

---

## 4. Conectar frontend ao backend (médio prazo)

**Situação atual:** O frontend usa dados mockados em cada página.

**Próximos passos:**

- [ ] **Serviços de API** – Criar módulos (ex.: `api/exercises.ts`, `api/workouts.ts`) que chamam as rotas do Worker.
- [ ] **Substituir mocks** – Trocar `useState` com dados iniciais por chamadas à API (ou por estado global que é preenchido pela API).
- [ ] **Estados de loading e erro** – Loading ao carregar listas/detalhes e mensagens de erro amigáveis.
- [ ] **React Query ou SWR** – Opcional: usar para cache, refetch e estados de loading/erro.

---

## 5. Upload de fotos (médio prazo)

**Situação atual:** Fotos usam base64 no estado local; não há upload real.

**Próximos passos:**

- [ ] **Storage** – Configurar armazenamento de arquivos (ex.: **R2** da Cloudflare ou S3).
- [ ] **Rota de upload** – No Worker, receber o arquivo, validar tipo/tamanho, salvar no R2 e retornar URL.
- [ ] **Frontend** – Enviar arquivo para a API e salvar a URL no modelo de “foto de progresso”; exibir pela URL.

---

## 6. Dashboard e relatórios com dados reais (médio prazo)

**Situação atual:** Dashboard e Relatórios usam dados fixos/mockados.

**Próximos passos:**

- [ ] **Dashboard** – Buscar treinos, medidas e metas da API e calcular totais, tendências e gráficos em cima desses dados.
- [ ] **Relatórios** – Aplicar filtros (período, tipo) nas chamadas à API e montar gráficos e tabelas com a resposta.
- [ ] **Exportação** – Implementar exportação real (CSV/PDF) a partir dos dados retornados pela API.

---

## 7. Testes (contínuo)

**Próximos passos:**

- [ ] **Testes unitários** – Funções de cálculo (ex.: volume de treino, progresso de meta) e validações (Zod).
- [ ] **Testes de componentes** – React Testing Library para componentes críticos (formulários, listas).
- [ ] **Testes E2E** – Playwright ou Cypress para fluxos principais (cadastrar exercício, registrar treino, etc.).

---

## 8. PWA e uso offline (opcional)

**Próximos passos:**

- [ ] **Service Worker** – Configurar para cache de assets e, se possível, de dados.
- [ ] **manifest.json** – Nome, ícones e tema para “Adicionar à tela inicial” no celular.
- [ ] **Estratégia offline** – Exibir dados em cache e fila de sincronização quando voltar online (se houver backend).

---

## 9. Deploy e ambiente (curto/médio prazo)

**Próximos passos:**

- [ ] **Deploy do frontend** – Build (`npm run build`) e hospedagem em Cloudflare Pages, Vercel ou Netlify.
- [ ] **Deploy do Worker** – `wrangler deploy` para a API na Cloudflare.
- [ ] **Variáveis de ambiente** – URLs da API, chaves (se necessário) em `.env` e no painel da Cloudflare.
- [ ] **CI/CD** – GitHub Actions (ou similar) para rodar lint, testes e deploy em push/PR.

---

## 10. Melhorias de produto e UX (contínuo)

- [ ] **Onboarding** – Pequeno tour ou tela inicial para novos usuários.
- [ ] **Notificações** – Lembretes (ex.: registrar treino, medir peso), se fizer sentido no produto.
- [ ] **Metas** – Conectar metas às medidas e treinos (ex.: “Meta de peso” usando última medição).
- [ ] **Recomendações** – Gerar recomendações a partir de dados reais (treinos, medidas, metas).
- [ ] **Acessibilidade** – Revisar contraste, foco, labels e navegação por teclado.
- [ ] **Internacionalização** – Se for público em mais de um idioma, preparar i18n.

---

## Ordem sugerida para começar

1. **Persistência (localStorage) + estado global** – Para não perder dados e organizar o código.
2. **Backend mínimo** – Schema do banco + rotas CRUD para exercícios e treinos.
3. **Conectar frontend à API** – Exercícios e treinos primeiro.
4. **Autenticação** – Para multi-usuário e dados por usuário.
5. **Demais entidades** – Medidas, fotos, metas, recomendações na API e no frontend.
6. **Dashboard e relatórios** com dados reais e exportação.
7. **Testes e deploy** contínuos.

Se quiser, posso detalhar um desses tópicos (por exemplo: schema do banco, rotas do Worker ou como conectar uma página ao backend) em um próximo passo concreto no código.
