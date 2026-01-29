import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "GymTracker Pro: VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não definidos. Crie um arquivo .env com essas variáveis (veja .env.example)."
  );
}

/** True se VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão definidos (auth usa Supabase). */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/** Cliente Supabase para o frontend. Use para Auth e acesso às tabelas (com RLS). */
export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "");

/**
 * Testa se a conexão com o Supabase está OK (para verificação manual).
 * Retorna uma mensagem de sucesso ou erro. Use no console ou num botão "Testar conexão".
 */
export async function testSupabaseConnection(): Promise<{ ok: boolean; message: string }> {
  if (!supabaseUrl || !supabaseAnonKey) {
    return { ok: false, message: "Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não definidas no .env" };
  }
  try {
    const { count, error } = await supabase.from("profiles").select("id", { count: "exact", head: true });
    if (error) return { ok: false, message: `Erro Supabase: ${error.message}` };
    return { ok: true, message: `Conexão OK. Tabela profiles acessível (${count ?? 0} registros).` };
  } catch (e) {
    return { ok: false, message: `Exceção: ${e instanceof Error ? e.message : String(e)}` };
  }
}
