import { useState } from "react";
import { Link, useLocation, Navigate } from "react-router";
import { Dumbbell } from "lucide-react";
import { useAuth } from "@/react-app/context/AuthContext";
import { LoginFormSchema, type LoginForm } from "@/shared/types";

export default function Login() {
  const { login, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const result = LoginFormSchema.safeParse({ email, password });
    if (!result.success) {
      setError(result.error.errors[0]?.message ?? "Dados inválidos.");
      return;
    }
    try {
      await login(result.data as LoginForm);
      // Redirecionamento acontece no re-render: isAuthenticated vira true e retornamos <Navigate /> abaixo
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao entrar.");
    }
  }

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">GymTracker Pro</h1>
            <p className="text-slate-400 text-sm mt-1">Entre na sua conta</p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-slate-800/60 border border-slate-700/50 p-6 sm:p-8 shadow-xl"
        >
          {error && (
            <div
              role="alert"
              className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
            >
              {error}
            </div>
          )}
          <div className="space-y-5">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-slate-300 mb-2">
                E-mail
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-900/60 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-slate-300 mb-2">
                Senha
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-900/60 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50"
                placeholder="••••••••"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 w-full py-3 px-4 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </button>
          <p className="mt-6 text-center text-slate-400 text-sm">
            Ainda não tem conta?{" "}
            <Link to="/register" className="text-orange-400 hover:text-orange-300 font-medium">
              Criar conta
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
