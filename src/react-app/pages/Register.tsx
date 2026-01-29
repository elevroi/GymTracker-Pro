import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router";
import { Dumbbell } from "lucide-react";
import { useAuth } from "@/react-app/context/AuthContext";
import { RegisterFormSchema, type RegisterForm, type UserProfile } from "@/shared/types";

const GOAL_LABELS: Record<string, string> = {
  emagrecer: "Emagrecer",
  ganhar_massa: "Ganhar massa",
  condicionamento: "Condicionamento",
  forca: "Força",
  outros: "Outros",
};

export default function Register() {
  const { register, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [goal, setGoal] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const result = RegisterFormSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
      profile: goal ? { goal: goal as UserProfile["goal"] } : undefined,
    });
    if (!result.success) {
      const first = result.error.errors[0];
      setError(first?.message ?? "Dados inválidos.");
      return;
    }
    try {
      await register({
        name: result.data.name,
        email: result.data.email,
        password: result.data.password,
        confirmPassword: result.data.confirmPassword,
        profile: result.data.profile,
      });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao criar conta.");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">GymTracker Pro</h1>
            <p className="text-slate-400 text-sm mt-1">Crie sua conta e comece a evoluir</p>
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
              <label htmlFor="reg-name" className="block text-sm font-medium text-slate-300 mb-2">
                Nome
              </label>
              <input
                id="reg-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-900/60 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50"
                placeholder="Seu nome"
              />
            </div>
            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-slate-300 mb-2">
                E-mail
              </label>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-900/60 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-slate-300 mb-2">
                Senha
              </label>
              <input
                id="reg-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-900/60 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div>
              <label htmlFor="reg-confirm" className="block text-sm font-medium text-slate-300 mb-2">
                Confirmar senha
              </label>
              <input
                id="reg-confirm"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-900/60 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50"
                placeholder="Repita a senha"
              />
            </div>
            <div>
              <label htmlFor="reg-goal" className="block text-sm font-medium text-slate-300 mb-2">
                Objetivo (opcional)
              </label>
              <select
                id="reg-goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-900/60 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50"
              >
                <option value="">Selecione</option>
                {Object.entries(GOAL_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 w-full py-3 px-4 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? "Criando conta..." : "Criar conta"}
          </button>
          <p className="mt-6 text-center text-slate-400 text-sm">
            Já tem conta?{" "}
            <Link to="/login" className="text-orange-400 hover:text-orange-300 font-medium">
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
