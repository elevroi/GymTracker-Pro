import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Dumbbell, Target, Calendar, Award, Activity } from "lucide-react";
import StatCard from "@/react-app/components/StatCard";

// Stub data for demonstration
const weightData = [
  { date: "01/12", weight: 82.5 },
  { date: "08/12", weight: 82.0 },
  { date: "15/12", weight: 81.5 },
  { date: "22/12", weight: 81.2 },
  { date: "29/12", weight: 80.8 },
  { date: "05/01", weight: 80.5 },
  { date: "12/01", weight: 80.0 },
];

const volumeData = [
  { week: "Sem 1", volume: 12500 },
  { week: "Sem 2", volume: 13200 },
  { week: "Sem 3", volume: 14100 },
  { week: "Sem 4", volume: 13800 },
];

const exerciseProgress = [
  { exercise: "Supino", current: 80, pr: 85 },
  { exercise: "Agachamento", current: 120, pr: 130 },
  { exercise: "Levantamento Terra", current: 140, pr: 150 },
  { exercise: "Desenvolvimento", current: 50, pr: 55 },
];

const recentPRs = [
  { exercise: "Supino Reto", weight: "85kg", reps: "5 reps", date: "10/01/2025" },
  { exercise: "Agachamento", weight: "130kg", reps: "3 reps", date: "08/01/2025" },
  { exercise: "Rosca Direta", weight: "35kg", reps: "8 reps", date: "05/01/2025" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400">Acompanhe sua evolução e conquiste seus objetivos</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="px-4 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50">
            <option>Últimos 7 dias</option>
            <option>Últimos 30 dias</option>
            <option>Últimos 90 dias</option>
            <option>Personalizado</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Peso Atual"
          value="80.0 kg"
          subtitle="Meta: 78kg"
          icon={TrendingUp}
          trend={{ value: -2.5, isPositive: true }}
          gradient="from-orange-500 to-red-600"
        />
        <StatCard
          title="Treinos no Mês"
          value="16"
          subtitle="Média: 4/semana"
          icon={Dumbbell}
          trend={{ value: 12, isPositive: true }}
          gradient="from-blue-500 to-cyan-600"
        />
        <StatCard
          title="Volume Total (Semana)"
          value="13.8k"
          subtitle="kg levantados"
          icon={Target}
          trend={{ value: 8, isPositive: true }}
          gradient="from-purple-500 to-pink-600"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight Progress Chart */}
        <div className="rounded-xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-600">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Evolução do Peso</h3>
              <p className="text-sm text-slate-400">Últimas 7 semanas</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={weightData}>
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} domain={[79, 83]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="weight" 
                stroke="#f97316" 
                strokeWidth={2}
                fill="url(#colorWeight)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Volume Chart */}
        <div className="rounded-xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Volume por Semana</h3>
              <p className="text-sm text-slate-400">Total de carga levantada</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={volumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="week" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
              <Bar dataKey="volume" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Exercise Progress and Recent PRs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exercise Progress */}
        <div className="rounded-xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">Progresso por Exercício</h3>
          </div>
          <div className="space-y-4">
            {exerciseProgress.map((exercise) => (
              <div key={exercise.exercise}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-slate-300">{exercise.exercise}</span>
                  <span className="text-sm text-slate-400">{exercise.current}kg / {exercise.pr}kg</span>
                </div>
                <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-600 rounded-full transition-all"
                    style={{ width: `${(exercise.current / exercise.pr) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent PRs */}
        <div className="rounded-xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600">
              <Award className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">Recordes Recentes</h3>
          </div>
          <div className="space-y-3">
            {recentPRs.map((pr, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30 border border-slate-600/30 hover:bg-slate-700/50 transition-colors"
              >
                <div>
                  <p className="font-medium text-white">{pr.exercise}</p>
                  <p className="text-sm text-slate-400">{pr.weight} × {pr.reps}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="w-3 h-3" />
                    {pr.date}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
