import { useState, useMemo, useCallback } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  BadgeCheck,
  Share2,
  Pencil,
  Scale,
  Target,
  Activity,
  CalendarDays,
  Bell,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/react-app/context/AuthContext";
import { testSupabaseConnection } from "@/react-app/lib/supabase";
import AddMeasurementModal, { type MeasurementRow } from "@/react-app/components/AddMeasurementModal";
import EditProfileModal from "@/react-app/components/EditProfileModal";

type ChartRange = "7" | "30" | "90";

// Dados stub para gráficos (últimos 90 dias)
const stubWeightData: { date: string; dateShort: string; weightKg: number }[] = (() => {
  const out: { date: string; dateShort: string; weightKg: number }[] = [];
  const today = new Date();
  let w = 82.5;
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    w += (Math.random() - 0.5) * 0.4;
    w = Math.max(78, Math.min(85, w));
    out.push({
      date: d.toISOString().slice(0, 10),
      dateShort: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      weightKg: Math.round(w * 10) / 10,
    });
  }
  return out;
})();

const stubVolumeData: { date: string; dateShort: string; volume: number }[] = (() => {
  const out: { date: string; dateShort: string; volume: number }[] = [];
  const today = new Date();
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    out.push({
      date: d.toISOString().slice(0, 10),
      dateShort: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      volume: Math.round(10000 + Math.random() * 5000),
    });
  }
  return out;
})();

// Medidas iniciais (stub)
const initialMeasurements: MeasurementRow[] = [
  { id: "1", date: "2025-01-25", waist: 82, chest: 98, arm: 34 },
  { id: "2", date: "2025-01-18", waist: 82.5, chest: 97.5, arm: 33.5 },
  { id: "3", date: "2025-01-11", waist: 83, chest: 97, arm: 33 },
  { id: "4", date: "2025-01-04", waist: 83.5, chest: 96.5, arm: 33 },
  { id: "5", date: "2024-12-28", waist: 84, chest: 96, arm: 32.5 },
  { id: "6", date: "2024-12-21", waist: 84.5, chest: 95.5, arm: 32.5 },
];

const GOAL_LABELS: Record<string, string> = {
  emagrecer: "Emagrecimento",
  ganhar_massa: "Hipertrofia",
  condicionamento: "Condicionamento",
  forca: "Força",
  outros: "Saúde / Outros",
};

const PLAN_BADGE: Record<string, { label: string; className: string }> = {
  active: { label: "Ativo", className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  late: { label: "Em atraso", className: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  inactive: { label: "Inativo", className: "bg-slate-500/20 text-slate-400 border-slate-500/30" },
};

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDateBR(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [chartRange, setChartRange] = useState<ChartRange>("30");
  const [measurements, setMeasurements] = useState<MeasurementRow[]>(initialMeasurements);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [notificationsOn, setNotificationsOn] = useState(true);

  const planStatus = (user?.profile as { planStatus?: "active" | "late" | "inactive" } | undefined)
    ?.planStatus ?? "active";
  const heightM = (user?.profile?.height ?? 175) / 100;
  const weightKg = 80;
  const bodyFatPercent = 18;
  const weeklyFrequency = (user?.profile as { weeklyFrequency?: number } | undefined)?.weeklyFrequency ?? 4;
  const weightGoal = (user?.profile as { weightGoal?: number } | undefined)?.weightGoal ?? 78;
  const goalKey = user?.profile?.goal ?? "condicionamento";
  const notes = (user?.profile as { notes?: string } | undefined)?.notes ?? "";
  const injuries = (user?.profile as { injuries?: string[] } | undefined)?.injuries ?? [];

  const imc = useMemo(() => {
    if (!heightM || heightM <= 0 || !weightKg) return null;
    return (weightKg / (heightM * heightM)).toFixed(1);
  }, [heightM, weightKg]);

  const weightChartData = useMemo(() => {
    const n = Number(chartRange);
    return stubWeightData.slice(-n);
  }, [chartRange]);

  const volumeChartData = useMemo(() => {
    const n = Number(chartRange);
    return stubVolumeData.slice(-n);
  }, [chartRange]);

  const sortedMeasurements = useMemo(
    () => [...measurements].sort((a, b) => (b.date > a.date ? 1 : -1)).slice(0, 6),
    [measurements]
  );

  const handleSaveMeasurement = useCallback(
    (data: { date: string; waistCm?: number; chestCm?: number; armCm?: number }) => {
      const row: MeasurementRow = {
        id: crypto.randomUUID(),
        date: data.date,
        waist: data.waistCm,
        chest: data.chestCm,
        arm: data.armCm,
      };
      setMeasurements((prev) => [row, ...prev]);
    },
    []
  );

  const handleLogoutClick = useCallback(() => {
    console.log("Logout placeholder");
  }, []);

  const badge = PLAN_BADGE[planStatus] ?? PLAN_BADGE.active;

  return (
    <div className="space-y-6 sm:space-y-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-white sr-only">Perfil do aluno</h1>

      {/* Header do perfil */}
      <section
        className="rounded-2xl bg-slate-800/60 border border-slate-700/50 p-4 sm:p-6 shadow-xl"
        aria-labelledby="profile-header"
      >
        <div id="profile-header" className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white text-xl sm:text-2xl font-bold shrink-0"
              aria-hidden
            >
              {user?.profile?.avatarUrl ? (
                <img
                  src={user.profile.avatarUrl}
                  alt=""
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                getInitials(user?.name ?? "U")
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-white truncate">{user?.name ?? "Aluno"}</h2>
              <p className="text-slate-400 text-sm truncate">{user?.email ?? ""}</p>
              <span
                className={`inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-full text-xs font-medium border ${badge.className}`}
              >
                <BadgeCheck size={14} />
                {badge.label}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 sm:ml-auto">
            <button
              type="button"
              onClick={() => setEditProfileOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-colors"
            >
              <Pencil size={18} />
              <span>Editar perfil</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-colors"
            >
              <Share2 size={18} />
              <span>Compartilhar</span>
            </button>
          </div>
        </div>
      </section>

      {/* KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4" aria-labelledby="kpi-title">
        <h2 id="kpi-title" className="sr-only">
          Indicadores
        </h2>
        <div className="rounded-xl bg-slate-800/60 border border-slate-700/50 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
            <Scale className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Peso atual</p>
            <p className="text-lg font-semibold text-white">{weightKg} kg</p>
          </div>
        </div>
        {bodyFatPercent != null && (
          <div className="rounded-xl bg-slate-800/60 border border-slate-700/50 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">% Gordura</p>
              <p className="text-lg font-semibold text-white">{bodyFatPercent}%</p>
            </div>
          </div>
        )}
        {imc != null && (
          <div className="rounded-xl bg-slate-800/60 border border-slate-700/50 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">IMC</p>
              <p className="text-lg font-semibold text-white">{imc}</p>
            </div>
          </div>
        )}
        <div className="rounded-xl bg-slate-800/60 border border-slate-700/50 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Frequência semanal</p>
            <p className="text-lg font-semibold text-white">{weeklyFrequency}x</p>
          </div>
        </div>
        <div className="rounded-xl bg-slate-800/60 border border-slate-700/50 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <Target className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Meta</p>
            <p className="text-lg font-semibold text-white">{weightGoal} kg</p>
          </div>
        </div>
      </section>

      {/* Gráficos */}
      <section
        className="rounded-2xl bg-slate-800/60 border border-slate-700/50 p-4 sm:p-6 shadow-xl"
        aria-labelledby="progress-title"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 id="progress-title" className="text-lg font-semibold text-white">
            Progresso
          </h2>
          <div className="flex rounded-lg bg-slate-900/60 border border-slate-600/50 p-1">
            {(["7", "30", "90"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setChartRange(r)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${
                  chartRange === r
                    ? "bg-orange-500/30 text-orange-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {r}d
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-slate-400 mb-2">Peso (kg)</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightChartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="dateShort" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} domain={["auto", "auto"]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                    labelStyle={{ color: "#cbd5e1" }}
                    formatter={(value: number | undefined) => [value != null ? `${value} kg` : "", "Peso"]}
                    labelFormatter={(label) => label}
                  />
                  <Line
                    type="monotone"
                    dataKey="weightKg"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={{ fill: "#f97316", r: 3 }}
                    name="Peso"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-2">Volume de treino (kg)</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeChartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="dateShort" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                    formatter={(value: number | undefined) => [value != null ? `${value} kg` : "", "Volume"]}
                  />
                  <Bar dataKey="volume" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Volume" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Medidas corporais */}
      <section
        className="rounded-2xl bg-slate-800/60 border border-slate-700/50 p-4 sm:p-6 shadow-xl"
        aria-labelledby="measurements-title"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 id="measurements-title" className="text-lg font-semibold text-white">
            Medidas corporais
          </h2>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500/20 border border-orange-500/30 text-orange-400 hover:bg-orange-500/30 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-colors"
          >
            Adicionar medição
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700/50">
                <th className="py-3 px-2 font-medium">Data</th>
                <th className="py-3 px-2 font-medium">Cintura (cm)</th>
                <th className="py-3 px-2 font-medium">Peito (cm)</th>
                <th className="py-3 px-2 font-medium">Braço (cm)</th>
              </tr>
            </thead>
            <tbody>
              {sortedMeasurements.map((row) => (
                <tr key={row.id} className="border-b border-slate-700/30 text-white">
                  <td className="py-3 px-2">{formatDateBR(row.date)}</td>
                  <td className="py-3 px-2">{row.waist ?? "—"}</td>
                  <td className="py-3 px-2">{row.chest ?? "—"}</td>
                  <td className="py-3 px-2">{row.arm ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Objetivos e preferências + Conta em grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section
          className="rounded-2xl bg-slate-800/60 border border-slate-700/50 p-4 sm:p-6 shadow-xl"
          aria-labelledby="goals-title"
        >
          <h2 id="goals-title" className="text-lg font-semibold text-white mb-4">
            Objetivos
          </h2>
          <ul className="space-y-2 text-sm">
            <li className="text-slate-300">
              <span className="text-slate-400">Objetivo principal:</span>{" "}
              {GOAL_LABELS[goalKey] ?? goalKey}
            </li>
            <li className="text-slate-300">
              <span className="text-slate-400">Meta de peso:</span> {weightGoal} kg
            </li>
            <li className="text-slate-300">
              <span className="text-slate-400">Frequência semanal:</span> {weeklyFrequency}x
            </li>
            {notes && (
              <li className="text-slate-300">
                <span className="text-slate-400">Notas:</span> {notes}
              </li>
            )}
            {injuries.length > 0 && (
              <li className="text-slate-300">
                <span className="text-slate-400">Lesões / restrições:</span> {injuries.join(", ")}
              </li>
            )}
          </ul>
        </section>

        <section
          className="rounded-2xl bg-slate-800/60 border border-slate-700/50 p-4 sm:p-6 shadow-xl"
          aria-labelledby="account-title"
        >
          <h2 id="account-title" className="text-lg font-semibold text-white mb-4">
            Conta
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-sm flex items-center gap-2">
                <Bell size={18} />
                Notificações
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={notificationsOn}
                onClick={() => setNotificationsOn((v) => !v)}
                className={`relative w-11 h-6 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${
                  notificationsOn ? "bg-orange-500" : "bg-slate-600"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    notificationsOn ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            <button
              type="button"
              onClick={async () => {
                const result = await testSupabaseConnection();
                window.alert(result.ok ? result.message : result.message);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-colors text-sm"
            >
              Testar conexão Supabase
            </button>
            <button
              type="button"
              onClick={handleLogoutClick}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-colors"
            >
              <LogOut size={18} />
              Sair
            </button>
          </div>
        </section>
      </div>

      <AddMeasurementModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveMeasurement}
      />
      <EditProfileModal
        isOpen={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        user={user}
        onSave={updateUser}
      />
    </div>
  );
}
