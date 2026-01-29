import { useState, useMemo } from "react";
import {
  Download,
  FileSpreadsheet,
  Filter,
  Calendar,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  X,
  RefreshCw,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { Workout, BodyMeasurement, Exercise } from "@/shared/types";

// Dados mockados - em produção viriam de um contexto ou API
const mockWorkouts: Workout[] = [];
const mockMeasurements: BodyMeasurement[] = [];
const mockExercises: Exercise[] = [];

const COLORS = ["#f97316", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899", "#f59e0b"];

type ReportType = "treinos" | "medidas" | "exercicios" | "todos";
type PeriodType = "7dias" | "30dias" | "90dias" | "personalizado" | "todos";

export default function Reports() {
  const [reportType, setReportType] = useState<ReportType>("todos");
  const [periodType, setPeriodType] = useState<PeriodType>("30dias");
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(true);

  const categories = [
    { value: "peito", label: "Peito" },
    { value: "costas", label: "Costas" },
    { value: "ombros", label: "Ombros" },
    { value: "braços", label: "Braços" },
    { value: "pernas", label: "Pernas" },
    { value: "abdômen", label: "Abdômen" },
    { value: "cardio", label: "Cardio" },
    { value: "outros", label: "Outros" },
  ];

  const getDateRange = useMemo(() => {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    let start: Date;

    switch (periodType) {
      case "7dias":
        start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30dias":
        start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90dias":
        start = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "personalizado":
        start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        break;
      default:
        start = new Date(0);
    }

    return { start, end };
  }, [periodType, startDate, endDate]);

  const filteredData = useMemo(() => {
    const { start, end } = getDateRange;
    const data: {
      workouts: Workout[];
      measurements: BodyMeasurement[];
      exercises: Exercise[];
    } = {
      workouts: [],
      measurements: [],
      exercises: [],
    };

    // Filtrar treinos
    if (reportType === "treinos" || reportType === "todos") {
      data.workouts = mockWorkouts.filter((w) => {
        const workoutDate = new Date(w.date);
        return workoutDate >= start && workoutDate <= end;
      });
    }

    // Filtrar medidas
    if (reportType === "medidas" || reportType === "todos") {
      data.measurements = mockMeasurements.filter((m) => {
        const measureDate = new Date(m.date);
        return measureDate >= start && measureDate <= end;
      });
    }

    // Filtrar exercícios
    if (reportType === "exercicios" || reportType === "todos") {
      data.exercises = mockExercises.filter((e) => {
        if (selectedCategories.length === 0) return true;
        return selectedCategories.includes(e.category);
      });
    }

    return data;
  }, [reportType, getDateRange, selectedCategories]);

  const statistics = useMemo(() => {
    const stats = {
      totalWorkouts: filteredData.workouts.length,
      totalVolume: filteredData.workouts.reduce((sum, w) => {
        return (
          sum +
          w.exercises.reduce((exSum, ex) => {
            return (
              exSum +
              ex.sets.reduce((setSum, set) => setSum + set.weight * set.reps, 0)
            );
          }, 0)
        );
      }, 0),
      avgWorkoutDuration: 0,
      totalMeasurements: filteredData.measurements.length,
      weightChange: 0,
      totalExercises: filteredData.exercises.length,
      exercisesByCategory: {} as Record<string, number>,
    };

    // Calcular duração média dos treinos
    const workoutsWithDuration = filteredData.workouts.filter((w) => w.duration);
    if (workoutsWithDuration.length > 0) {
      stats.avgWorkoutDuration =
        workoutsWithDuration.reduce((sum, w) => sum + (w.duration || 0), 0) /
        workoutsWithDuration.length;
    }

    // Calcular mudança de peso
    if (filteredData.measurements.length >= 2) {
      const sorted = [...filteredData.measurements].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      const first = sorted[0].weight;
      const last = sorted[sorted.length - 1].weight;
      if (first && last) {
        stats.weightChange = last - first;
      }
    }

    // Contar exercícios por categoria
    filteredData.exercises.forEach((ex) => {
      stats.exercisesByCategory[ex.category] =
        (stats.exercisesByCategory[ex.category] || 0) + 1;
    });

    return stats;
  }, [filteredData]);

  const chartData = useMemo(() => {
    const { start, end } = getDateRange;
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const data: Array<{
      date: string;
      workouts: number;
      volume: number;
      weight?: number;
    }> = [];

    if (daysDiff <= 30) {
      // Por dia
      for (let i = 0; i <= daysDiff; i++) {
        const date = new Date(start);
        date.setDate(date.getDate() + i);
        const dateStr = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

        const dayWorkouts = filteredData.workouts.filter((w) => {
          const wDate = new Date(w.date);
          return (
            wDate.getDate() === date.getDate() &&
            wDate.getMonth() === date.getMonth() &&
            wDate.getFullYear() === date.getFullYear()
          );
        });

        const volume = dayWorkouts.reduce((sum, w) => {
          return (
            sum +
            w.exercises.reduce((exSum, ex) => {
              return (
                exSum +
                ex.sets.reduce((setSum, set) => setSum + set.weight * set.reps, 0)
              );
            }, 0)
          );
        }, 0);

        const measurement = filteredData.measurements.find((m) => {
          const mDate = new Date(m.date);
          return (
            mDate.getDate() === date.getDate() &&
            mDate.getMonth() === date.getMonth() &&
            mDate.getFullYear() === date.getFullYear()
          );
        });

        data.push({
          date: dateStr,
          workouts: dayWorkouts.length,
          volume,
          weight: measurement?.weight,
        });
      }
    } else {
      // Por semana
      const weeks: Record<string, { workouts: Workout[]; measurements: BodyMeasurement[] }> = {};
      filteredData.workouts.forEach((w) => {
        const date = new Date(w.date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = weekStart.toISOString().split("T")[0];
        if (!weeks[weekKey]) {
          weeks[weekKey] = { workouts: [], measurements: [] };
        }
        weeks[weekKey].workouts.push(w);
      });

      filteredData.measurements.forEach((m) => {
        const date = new Date(m.date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = weekStart.toISOString().split("T")[0];
        if (!weeks[weekKey]) {
          weeks[weekKey] = { workouts: [], measurements: [] };
        }
        weeks[weekKey].measurements.push(m);
      });

      Object.entries(weeks)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([weekKey, weekData]) => {
          const weekDate = new Date(weekKey);
          const weekNum = Math.floor((weekDate.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
          const dateStr = `Sem ${weekNum}`;

          const volume = weekData.workouts.reduce((sum, w) => {
            return (
              sum +
              w.exercises.reduce((exSum, ex) => {
                return (
                  exSum +
                  ex.sets.reduce((setSum, set) => setSum + set.weight * set.reps, 0)
                );
              }, 0)
            );
          }, 0);

          const avgWeight =
            weekData.measurements.length > 0
              ? weekData.measurements.reduce((sum, m) => sum + (m.weight || 0), 0) /
                weekData.measurements.length
              : undefined;

          data.push({
            date: dateStr,
            workouts: weekData.workouts.length,
            volume,
            weight: avgWeight,
          });
        });
    }

    return data;
  }, [filteredData, getDateRange]);

  const categoryChartData = useMemo(() => {
    return Object.entries(statistics.exercisesByCategory).map(([name, value]) => ({
      name: categories.find((c) => c.value === name)?.label || name,
      value,
    }));
  }, [statistics.exercisesByCategory, categories]);

  const handleToggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleResetFilters = () => {
    setReportType("todos");
    setPeriodType("30dias");
    setStartDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
    setEndDate(new Date().toISOString().split("T")[0]);
    setSelectedCategories([]);
  };

  const handleExport = (type: "workouts" | "measurements" | "all") => {
    // Simulação de exportação - em produção seria implementado com biblioteca de CSV
    alert(`Exportando ${type === "all" ? "todos os dados" : type}...`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Relatórios</h1>
          <p className="text-slate-400">Análise detalhada e exportação de dados</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
          >
            <Filter size={20} />
            {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
          </button>
        </div>
      </div>

      {/* Filtros Avançados */}
      {showFilters && (
        <div className="rounded-xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Filter size={20} />
              Filtros Avançados
            </h2>
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-sm transition-colors"
            >
              <RefreshCw size={16} />
              Resetar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Tipo de Relatório */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tipo de Relatório
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as ReportType)}
                className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              >
                <option value="todos">Todos os Dados</option>
                <option value="treinos">Treinos</option>
                <option value="medidas">Medidas Corporais</option>
                <option value="exercicios">Exercícios</option>
              </select>
            </div>

            {/* Período */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Período</label>
              <select
                value={periodType}
                onChange={(e) => setPeriodType(e.target.value as PeriodType)}
                className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              >
                <option value="7dias">Últimos 7 dias</option>
                <option value="30dias">Últimos 30 dias</option>
                <option value="90dias">Últimos 90 dias</option>
                <option value="personalizado">Personalizado</option>
                <option value="todos">Todo o Período</option>
              </select>
            </div>

            {/* Data Inicial (se personalizado) */}
            {periodType === "personalizado" && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Data Inicial</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
              </div>
            )}

            {/* Data Final (se personalizado) */}
            {periodType === "personalizado" && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Data Final</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
              </div>
            )}
          </div>

          {/* Filtros de Categoria (se exercícios) */}
          {(reportType === "exercicios" || reportType === "todos") && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Categorias de Exercícios
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => handleToggleCategory(cat.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategories.includes(cat.value)
                        ? "bg-gradient-to-r from-orange-500 to-red-600 text-white"
                        : "bg-slate-700/50 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-600">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Treinos</p>
              <p className="text-2xl font-bold text-white">{statistics.totalWorkouts}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Volume Total</p>
              <p className="text-2xl font-bold text-white">
                {(statistics.totalVolume / 1000).toFixed(1)}k kg
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Mudança de Peso</p>
              <p
                className={`text-2xl font-bold ${
                  statistics.weightChange > 0
                    ? "text-green-400"
                    : statistics.weightChange < 0
                    ? "text-red-400"
                    : "text-white"
                }`}
              >
                {statistics.weightChange > 0 ? "+" : ""}
                {statistics.weightChange.toFixed(1)} kg
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
              <PieChart className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Exercícios</p>
              <p className="text-2xl font-bold text-white">{statistics.totalExercises}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Treinos e Volume */}
          {(reportType === "treinos" || reportType === "todos") && (
            <div className="rounded-xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Treinos e Volume</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorWorkouts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                  <YAxis yAxisId="left" stroke="#94a3b8" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="workouts"
                    stroke="#f97316"
                    strokeWidth={2}
                    fill="url(#colorWorkouts)"
                    name="Treinos"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="volume"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#colorVolume)"
                    name="Volume (kg)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Gráfico de Peso */}
          {(reportType === "medidas" || reportType === "todos") && chartData.some((d) => d.weight) && (
            <div className="rounded-xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Evolução do Peso</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData.filter((d) => d.weight !== undefined)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    formatter={(value: number | undefined) => [
                      value !== undefined ? `${value} kg` : "-",
                      "Peso",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: "#10b981", r: 4 }}
                    name="Peso"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Gráfico de Exercícios por Categoria */}
          {(reportType === "exercicios" || reportType === "todos") &&
            categoryChartData.length > 0 && (
              <div className="rounded-xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Exercícios por Categoria
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            )}
        </div>
      )}

      {/* Exportação */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => handleExport("workouts")}
          className="rounded-xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-6 hover:bg-slate-800/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-1">Exportar Treinos</h3>
              <p className="text-sm text-slate-400">
                {filteredData.workouts.length} treino(s) no período
              </p>
            </div>
            <Download className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
          </div>
        </div>

        <div
          onClick={() => handleExport("measurements")}
          className="rounded-xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-6 hover:bg-slate-800/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-1">Exportar Medidas</h3>
              <p className="text-sm text-slate-400">
                {filteredData.measurements.length} medição(ões) no período
              </p>
            </div>
            <Download className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
          </div>
        </div>

        <div
          onClick={() => handleExport("all")}
          className="rounded-xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-6 hover:bg-slate-800/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-1">Exportar Tudo</h3>
              <p className="text-sm text-slate-400">Todos os dados filtrados</p>
            </div>
            <Download className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
          </div>
        </div>
      </div>
    </div>
  );
}
