import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Calendar,
  Target,
  TrendingUp,
  CheckCircle2,
  PauseCircle,
  XCircle,
  Filter,
  Trophy,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Goal, GoalForm } from "@/shared/types";

// Dados mockados para demonstração
const initialGoals: Goal[] = [
  {
    id: "1",
    title: "Perder 5kg",
    description: "Meta de perda de peso para o primeiro trimestre",
    goalType: "peso",
    targetValue: 75,
    currentValue: 80,
    unit: "kg",
    targetDate: new Date(2025, 3, 1).toISOString(),
    status: "ativa",
    notes: "Foco em dieta e cardio",
    createdAt: new Date(2025, 0, 1).toISOString(),
    updatedAt: new Date(2025, 0, 1).toISOString(),
  },
  {
    id: "2",
    title: "Aumentar peito para 110cm",
    description: "Desenvolvimento do peitoral",
    goalType: "medida",
    targetValue: 110,
    currentValue: 102,
    unit: "cm",
    targetDate: new Date(2025, 5, 1).toISOString(),
    status: "ativa",
    measurementType: "chest",
    notes: "",
    createdAt: new Date(2025, 0, 1).toISOString(),
    updatedAt: new Date(2025, 0, 1).toISOString(),
  },
  {
    id: "3",
    title: "Supino 100kg",
    description: "Meta de força no supino",
    goalType: "exercicio",
    targetValue: 100,
    currentValue: 75,
    unit: "kg",
    targetDate: new Date(2025, 5, 1).toISOString(),
    status: "ativa",
    exerciseId: "1",
    exerciseName: "Supino Reto",
    notes: "1RM",
    createdAt: new Date(2025, 0, 1).toISOString(),
    updatedAt: new Date(2025, 0, 1).toISOString(),
  },
  {
    id: "4",
    title: "Treinar 4x por semana",
    description: "Consistência nos treinos",
    goalType: "frequencia",
    targetValue: 4,
    currentValue: 3,
    unit: "vezes/semana",
    targetDate: new Date(2025, 2, 1).toISOString(),
    status: "concluida",
    notes: "",
    createdAt: new Date(2024, 11, 1).toISOString(),
    updatedAt: new Date(2025, 1, 1).toISOString(),
  },
];

const goalTypeLabels: Record<string, string> = {
  peso: "Peso",
  medida: "Medida Corporal",
  exercicio: "Exercício",
  volume: "Volume",
  frequencia: "Frequência",
  outros: "Outros",
};

const statusLabels: Record<string, string> = {
  ativa: "Ativa",
  concluida: "Concluída",
  pausada: "Pausada",
  cancelada: "Cancelada",
};

const statusColors: Record<string, string> = {
  ativa: "from-blue-500 to-cyan-600",
  concluida: "from-green-500 to-emerald-600",
  pausada: "from-yellow-500 to-orange-600",
  cancelada: "from-red-500 to-pink-600",
};

const statusIcons: Record<string, typeof Target> = {
  ativa: Target,
  concluida: CheckCircle2,
  pausada: PauseCircle,
  cancelada: XCircle,
};

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("todos");
  const [selectedType, setSelectedType] = useState<string>("todos");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState<GoalForm>({
    title: "",
    description: "",
    goalType: "peso",
    targetValue: 0,
    currentValue: 0,
    unit: "",
    targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] + "T00:00:00",
    status: "ativa",
    exerciseId: undefined,
    exerciseName: undefined,
    measurementType: undefined,
    notes: "",
  });

  const filteredGoals = useMemo(() => {
    return goals.filter((goal) => {
      const matchesSearch =
        goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        goal.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === "todos" || goal.status === selectedStatus;
      const matchesType = selectedType === "todos" || goal.goalType === selectedType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [goals, searchTerm, selectedStatus, selectedType]);

  const calculateProgress = (goal: Goal): number => {
    if (!goal.currentValue || goal.currentValue === 0) return 0;
    if (goal.targetValue === 0) return 100;
    const progress = (goal.currentValue / goal.targetValue) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  const getDaysRemaining = (targetDate: string): number => {
    const target = new Date(targetDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    const diff = target.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const statistics = useMemo(() => {
    return {
      total: goals.length,
      active: goals.filter((g) => g.status === "ativa").length,
      completed: goals.filter((g) => g.status === "concluida").length,
      averageProgress: goals
        .filter((g) => g.status === "ativa")
        .reduce((sum, g) => sum + calculateProgress(g), 0) /
        Math.max(1, goals.filter((g) => g.status === "ativa").length),
    };
  }, [goals]);

  const handleOpenModal = (goal?: Goal) => {
    if (goal) {
      setEditingGoal(goal);
      setFormData({
        title: goal.title,
        description: goal.description || "",
        goalType: goal.goalType,
        targetValue: goal.targetValue,
        currentValue: goal.currentValue,
        unit: goal.unit,
        targetDate: goal.targetDate,
        status: goal.status,
        exerciseId: goal.exerciseId,
        exerciseName: goal.exerciseName,
        measurementType: goal.measurementType,
        notes: goal.notes || "",
      });
    } else {
      setEditingGoal(null);
      setFormData({
        title: "",
        description: "",
        goalType: "peso",
        targetValue: 0,
        currentValue: 0,
        unit: "",
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] + "T00:00:00",
        status: "ativa",
        exerciseId: undefined,
        exerciseName: undefined,
        measurementType: undefined,
        notes: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingGoal(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ajustar unidade baseado no tipo
    let unit = formData.unit;
    if (!unit) {
      switch (formData.goalType) {
        case "peso":
          unit = "kg";
          break;
        case "medida":
          unit = "cm";
          break;
        case "exercicio":
          unit = "kg";
          break;
        case "volume":
          unit = "kg";
          break;
        case "frequencia":
          unit = "vezes/semana";
          break;
        default:
          unit = "";
      }
    }

    const goalData = { ...formData, unit };

    if (editingGoal) {
      setGoals(
        goals.map((g) =>
          g.id === editingGoal.id
            ? { ...g, ...goalData, updatedAt: new Date().toISOString() }
            : g
        )
      );
    } else {
      const newGoal: Goal = {
        ...goalData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setGoals([...goals, newGoal]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta meta?")) {
      setGoals(goals.filter((g) => g.id !== id));
    }
  };

  // Dados mockados para gráfico de progresso
  const progressChartData = useMemo(() => {
    return filteredGoals
      .filter((g) => g.status === "ativa")
      .map((goal) => ({
        name: goal.title.length > 15 ? goal.title.substring(0, 15) + "..." : goal.title,
        progress: calculateProgress(goal),
        target: 100,
      }));
  }, [filteredGoals]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Metas</h1>
          <p className="text-slate-400 text-sm sm:text-base">Defina e acompanhe seus objetivos</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium hover:from-orange-600 hover:to-red-700 transition-all shadow-lg shadow-orange-500/20 min-h-[44px] w-full sm:w-auto"
        >
          <Plus size={18} className="sm:w-5 sm:h-5" />
          Nova Meta
        </button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="rounded-xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-3 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex-shrink-0">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-slate-400 truncate">Total</p>
              <p className="text-lg sm:text-2xl font-bold text-white">{statistics.total}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-3 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex-shrink-0">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-slate-400 truncate">Ativas</p>
              <p className="text-lg sm:text-2xl font-bold text-white">{statistics.active}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-3 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex-shrink-0">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-slate-400 truncate">Concluídas</p>
              <p className="text-lg sm:text-2xl font-bold text-white">{statistics.completed}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-3 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex-shrink-0">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-slate-400 truncate">Progresso</p>
              <p className="text-lg sm:text-2xl font-bold text-white">{statistics.averageProgress.toFixed(0)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de Progresso */}
      {progressChartData.length > 0 && (
        <div className="rounded-xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Progresso das Metas Ativas</h3>
          <div className="h-[200px] sm:h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={progressChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={10} className="sm:text-xs" />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} className="sm:text-xs" width={80} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "12px",
                }}
                formatter={(value: number | undefined) => [value != null ? `${value.toFixed(1)}%` : "", "Progresso"]}
              />
                <Bar dataKey="progress" fill="#f97316" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 sm:w-5 sm:h-5" size={18} />
          <input
            type="text"
            placeholder="Buscar metas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 sm:pl-10 pr-4 py-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-sm sm:text-base min-h-[44px]"
          />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:flex sm:gap-4">
          <div className="relative flex-1">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 sm:w-5 sm:h-5" size={18} />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50 appearance-none cursor-pointer text-sm sm:text-base min-h-[44px]"
            >
              <option value="todos">Todos os status</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="relative flex-1">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50 appearance-none cursor-pointer text-sm sm:text-base min-h-[44px]"
            >
              <option value="todos">Todos os tipos</option>
              {Object.entries(goalTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Metas */}
      {filteredGoals.length === 0 ? (
        <div className="rounded-xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-8 sm:p-12 text-center">
          <Target className="w-12 h-12 sm:w-16 sm:h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-base sm:text-lg mb-2">
            {searchTerm || selectedStatus !== "todos" || selectedType !== "todos"
              ? "Nenhuma meta encontrada"
              : "Nenhuma meta cadastrada"}
          </p>
          <p className="text-slate-500 text-sm">
            {searchTerm || selectedStatus !== "todos" || selectedType !== "todos"
              ? "Tente ajustar os filtros"
              : "Comece criando sua primeira meta"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {filteredGoals.map((goal) => {
            const progress = calculateProgress(goal);
            const daysRemaining = getDaysRemaining(goal.targetDate);
            const StatusIcon = statusIcons[goal.status];
            const isOverdue = daysRemaining < 0 && goal.status === "ativa";

            return (
              <div
                key={goal.id}
                className="rounded-xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-4 sm:p-6 hover:border-orange-500/50 transition-all group"
              >
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <StatusIcon
                        className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${
                          goal.status === "concluida"
                            ? "text-green-400"
                            : goal.status === "pausada"
                            ? "text-yellow-400"
                            : goal.status === "cancelada"
                            ? "text-red-400"
                            : "text-blue-400"
                        }`}
                      />
                      <h3 className="text-lg sm:text-xl font-bold text-white break-words">{goal.title}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded-lg bg-gradient-to-r ${statusColors[goal.status]} text-white`}
                      >
                        {statusLabels[goal.status]}
                      </span>
                      <span className="inline-block px-2 py-1 text-xs font-medium rounded-lg bg-slate-700/50 text-slate-300">
                        {goalTypeLabels[goal.goalType]}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity ml-2">
                    <button
                      onClick={() => handleOpenModal(goal)}
                      className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="p-2 rounded-lg bg-slate-700/50 hover:bg-red-600/20 text-slate-300 hover:text-red-400 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {goal.description && (
                  <p className="text-slate-400 text-sm mb-3 sm:mb-4 leading-relaxed">{goal.description}</p>
                )}

                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Progresso</span>
                    <span className="text-white font-semibold text-xs sm:text-sm">
                      {goal.currentValue?.toFixed(1) || "0"} {goal.unit} / {goal.targetValue.toFixed(1)}{" "}
                      {goal.unit}
                    </span>
                  </div>
                  <div className="h-2.5 sm:h-3 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        progress >= 100
                          ? "bg-gradient-to-r from-green-500 to-emerald-600"
                          : isOverdue
                          ? "bg-gradient-to-r from-red-500 to-pink-600"
                          : "bg-gradient-to-r from-orange-500 to-red-600"
                      }`}
                      style={{ width: `${Math.min(100, progress)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{progress.toFixed(1)}% concluído</span>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Calendar size={12} className="sm:w-3.5 sm:h-3.5" />
                      <span className={`text-xs ${isOverdue ? "text-red-400 font-medium" : ""}`}>
                        {isOverdue
                          ? `${Math.abs(daysRemaining)}d atrasado`
                          : daysRemaining > 0
                          ? `${daysRemaining}d restantes`
                          : "Prazo finalizado"}
                      </span>
                    </div>
                  </div>
                </div>

                {goal.exerciseName && (
                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-700/50">
                    <p className="text-xs text-slate-500 mb-1">Exercício</p>
                    <p className="text-sm text-slate-300 break-words">{goal.exerciseName}</p>
                  </div>
                )}

                {goal.notes && (
                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-700/50">
                    <p className="text-xs text-slate-500 mb-1">Notas</p>
                    <p className="text-sm text-slate-300 break-words">{goal.notes}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Criar/Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-xl bg-slate-800 border border-slate-700/50 shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700/50 p-4 sm:p-6 flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {editingGoal ? "Editar Meta" : "Nova Meta"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Título da Meta *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  placeholder="Ex: Perder 5kg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none"
                  placeholder="Descreva sua meta..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Tipo de Meta *</label>
                  <select
                    required
                    value={formData.goalType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        goalType: e.target.value as Goal["goalType"],
                        unit: e.target.value === "peso" ? "kg" : e.target.value === "medida" ? "cm" : e.target.value === "frequencia" ? "vezes/semana" : "",
                      })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  >
                    {Object.entries(goalTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Status *</label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as Goal["status"] })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  >
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Valor Atual
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.currentValue || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentValue: e.target.value ? parseFloat(e.target.value) : 0,
                      })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Valor Alvo *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.1"
                    value={formData.targetValue}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        targetValue: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Unidade</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    placeholder="kg, cm, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Data Alvo *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.targetDate.split("T")[0]}
                    onChange={(e) =>
                      setFormData({ ...formData, targetDate: e.target.value + "T00:00:00" })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>
              </div>

              {formData.goalType === "exercicio" && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nome do Exercício
                  </label>
                  <input
                    type="text"
                    value={formData.exerciseName || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, exerciseName: e.target.value || undefined })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    placeholder="Ex: Supino Reto"
                  />
                </div>
              )}

              {formData.goalType === "medida" && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Tipo de Medida
                  </label>
                  <input
                    type="text"
                    value={formData.measurementType || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, measurementType: e.target.value || undefined })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    placeholder="Ex: chest, waist, etc."
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Notas</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none"
                  placeholder="Observações..."
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-700/50">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium hover:from-orange-600 hover:to-red-700 transition-all shadow-lg shadow-orange-500/20"
                >
                  {editingGoal ? "Salvar Alterações" : "Criar Meta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
