import type { User, AuthSession, LoginForm, RegisterForm } from "@/shared/types";

const SESSION_KEY = "gymtracker_session";
/** Chave para persistir usuários registrados (demo); em produção viria do backend. */
const USERS_KEY = "gymtracker_demo_users";

const SESSION_DAYS = 7;

function generateId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

function expiresAt(): string {
  const d = new Date();
  d.setDate(d.getDate() + SESSION_DAYS);
  return d.toISOString();
}

type StoredUser = { user: User; password: string };

function getStoredUsers(): StoredUser[] {
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as StoredUser[];
  } catch {
    return [];
  }
}

function saveStoredUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/** Simula login: valida credenciais e retorna sessão. Em produção, chamar API. */
export async function login(credentials: LoginForm): Promise<AuthSession> {
  const users = getStoredUsers();
  const found = users.find((u) => u.user.email === credentials.email);
  if (!found || found.password !== credentials.password) {
    throw new Error("E-mail ou senha incorretos.");
  }
  const session: AuthSession = {
    user: found.user,
    token: generateId(),
    expiresAt: expiresAt(),
  };
  return session;
}

/** Simula registro: cria usuário e retorna sessão. Em produção, chamar API. */
export async function register(data: RegisterForm): Promise<AuthSession> {
  const users = getStoredUsers();
  if (users.some((u) => u.user.email === data.email)) {
    throw new Error("Este e-mail já está em uso.");
  }
  const user: User = {
    id: generateId(),
    email: data.email,
    name: data.name,
    createdAt: now(),
    profile: data.profile,
  };
  users.push({ user, password: data.password });
  saveStoredUsers(users);
  const session: AuthSession = {
    user,
    token: generateId(),
    expiresAt: expiresAt(),
  };
  return session;
}

/** Persiste sessão no localStorage (para restauração ao reabrir o app). */
export function persistSession(session: AuthSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

/** Remove sessão do localStorage. */
export function clearStoredSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

/** Lê sessão salva e retorna se ainda é válida (não expirada). */
export function getStoredSession(): AuthSession | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as AuthSession;
    if (new Date(session.expiresAt) <= new Date()) {
      clearStoredSession();
      return null;
    }
    return session;
  } catch {
    clearStoredSession();
    return null;
  }
}

/** Atualiza o usuário na sessão e na lista de usuários (demo). Em produção, chamar API. */
export function updateUser(updatedUser: User): void {
  const session = getStoredSession();
  if (!session) return;
  const users = getStoredUsers();
  const idx = users.findIndex((u) => u.user.id === updatedUser.id || u.user.email === updatedUser.email);
  if (idx >= 0) {
    users[idx] = { ...users[idx], user: updatedUser };
    saveStoredUsers(users);
  }
  persistSession({ ...session, user: updatedUser });
}
