import type { User, UserProfile, LoginForm, RegisterForm } from "@/shared/types";
import { supabase } from "@/react-app/lib/supabase";

/** Linha da tabela profiles no Supabase (snake_case). */
interface ProfileRow {
  id: string;
  email: string | null;
  name: string;
  birth_date: string | null;
  height_cm: number | null;
  goal: string | null;
  gender: string | null;
  avatar_url: string | null;
  plan_status: string | null;
  weight_goal_kg: number | null;
  weekly_frequency: number | null;
  notes: string | null;
  injuries: string[] | null;
  created_at: string;
  updated_at: string;
}

function profileRowToUserProfile(row: ProfileRow): UserProfile {
  return {
    birthDate: row.birth_date ?? undefined,
    height: row.height_cm ?? undefined,
    goal: (row.goal as UserProfile["goal"]) ?? undefined,
    gender: (row.gender as UserProfile["gender"]) ?? undefined,
    avatarUrl: row.avatar_url ?? undefined,
    planStatus: (row.plan_status as UserProfile["planStatus"]) ?? undefined,
    weightGoal: row.weight_goal_kg ?? undefined,
    weeklyFrequency: row.weekly_frequency ?? undefined,
    notes: row.notes ?? undefined,
    injuries: row.injuries ?? undefined,
  };
}

function buildUserFromSupabase(
  id: string,
  email: string,
  name: string,
  createdAt: string,
  profileRow: ProfileRow | null
): User {
  return {
    id,
    email,
    name,
    createdAt,
    profile: profileRow ? profileRowToUserProfile(profileRow) : undefined,
  };
}

/** Busca o perfil na tabela profiles e monta o User. */
async function getUserWithProfile(
  id: string,
  email: string,
  name: string,
  createdAt: string
): Promise<User> {
  const { data: row, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") {
    console.warn("authSupabase: erro ao buscar perfil", error);
  }
  return buildUserFromSupabase(id, email, name, createdAt, row as ProfileRow | null);
}

export async function loginSupabase(credentials: LoginForm): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });
  if (error) throw new Error(error.message === "Invalid login credentials" ? "E-mail ou senha incorretos." : error.message);
  const u = data.user;
  if (!u?.email) throw new Error("Sessão inválida.");
  const name = (u.user_metadata?.name as string) ?? u.email;
  const createdAt = u.created_at ?? new Date().toISOString();
  return getUserWithProfile(u.id, u.email, name, createdAt);
}

export async function registerSupabase(data: RegisterForm): Promise<User> {
  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        name: data.name,
        goal: data.profile?.goal ?? null,
      },
    },
  });
  if (error) {
    if (error.message.includes("already registered") || error.message.includes("already exists"))
      throw new Error("Este e-mail já está em uso.");
    throw new Error(error.message);
  }
  const u = authData.user;
  if (!u?.email) throw new Error("Conta criada, mas não foi possível obter os dados. Confirme seu e-mail se necessário.");
  if (!authData.session) {
    throw new Error(
      "Conta criada! Confirme seu e-mail (verifique a caixa de entrada) e depois faça login. " +
      "Se quiser entrar sem confirmar, desative 'Confirm email' em Supabase → Authentication → Providers → Email."
    );
  }
  const name = (u.user_metadata?.name as string) ?? data.name;
  const createdAt = u.created_at ?? new Date().toISOString();
  const user = await getUserWithProfile(u.id, u.email, name, createdAt);
  if (data.profile?.goal && user.profile) {
    user.profile.goal = data.profile.goal;
    await supabase.from("profiles").update({ goal: data.profile.goal }).eq("id", u.id);
  }
  return user;
}

export async function getSessionSupabase(): Promise<User | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.email) return null;
  const u = session.user;
  const name = (u.user_metadata?.name as string) ?? u.email;
  const createdAt = u.created_at ?? new Date().toISOString();
  return getUserWithProfile(u.id, u.email, name, createdAt);
}

export function logoutSupabase(): void {
  supabase.auth.signOut();
}

export async function updateUserSupabase(updatedUser: User): Promise<void> {
  const p = updatedUser.profile;
  await supabase
    .from("profiles")
    .update({
      name: updatedUser.name,
      email: updatedUser.email,
      goal: p?.goal ?? null,
      height_cm: p?.height ?? null,
      weight_goal_kg: p?.weightGoal ?? null,
      weekly_frequency: p?.weeklyFrequency ?? null,
      plan_status: p?.planStatus ?? null,
      notes: p?.notes ?? null,
      injuries: p?.injuries ?? null,
      avatar_url: p?.avatarUrl ?? null,
      gender: p?.gender ?? null,
      birth_date: p?.birthDate ?? null,
    })
    .eq("id", updatedUser.id);
}
