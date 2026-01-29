import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Calendar,
  Clock,
  Dumbbell,
  Eye,
  PlusCircle,
  MinusCircle,
} from "lucide-react";
import type { Workout, WorkoutForm, WorkoutExercise, WorkoutSet, Exercise } from "@/shared/types";

// Dados mockados de exercícios (normalmente viriam de um contexto ou API)
const mockExercises: Exercise[] = [
  {
    id: "1",
    name: "Supino Reto",
    description: "Exercício fundamental para desenvolvimento do peitoral",
    category: "peito",
    muscleGroups: ["peitoral maior", "tríceps", "ombros"],
    equipment: "barra",
    difficulty: "intermediário",
    instructions: "Deite-se no banco, segure a barra com pegada média e desça até o peito, depois empurre para cima.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Agachamento Livre",
    description: "Rei dos exercícios para pernas",
    category: "pernas",
    muscleGroups: ["quadríceps", "glúteos", "posteriores"],
    equipment: "barra",
    difficulty: "intermediário",
    instructions: "Posicione a barra nas costas, pés na largura dos ombros, desça até formar 90 graus e suba.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Remada Curvada",
    description: "Desenvolvimento da espessura das costas",
    category: "costas",
    muscleGroups: ["dorsais", "romboides", "bíceps"],
    equipment: "barra",
    difficulty: "intermediário",
    instructions: "Incline o tronco, segure a barra e puxe em direção ao abdômen.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Dados mockados de treinos
const initialWorkouts: Workout[] = [
  {
    id: "1",
    name: "Treino de Peito",
    date: new Date(2025, 0, 15, 18, 30).toISOString(),
    duration: 75,
    exercises: [
      {
        id: "ex1",
        exerciseId: "1",
        exerciseName: "Supino Reto",
        sets: [
          { id: "s1", weight: 60, reps: 10, restSeconds: 90 },
          { id: "s2", weight: 70, reps: 8, restSeconds: 90 },
          { id: "s3", weight: 75, reps: 6, restSeconds: 120 },
        ],
      },
    ],
    notes: "Bom treino, foco na execução",
    createdAt: new Date(2025, 0, 15).toISOString(),
    updatedAt: new Date(2025, 0, 15).toISOString(),
  },
];

export default function Workouts() {
  const [workouts, setWorkouts] = useState<Workout[]>(initialWorkouts);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [viewingWorkout, setViewingWorkout] = useState<Workout | null>(null);
  const [formData, setFormData] = useState<WorkoutForm>({
    name: "",
    date: new Date().toISOString().split("T")[0] + "T" + new Date().toTimeString().slice(0, 5),
    duration: undefined,
    exercises: [],
    notes: "",
  });
  const [selectedExerciseId, setSelectedExerciseId] = useState("");

  const filteredWorkouts = useMemo(() => {
    return workouts
      .filter((workout) => {
        const matchesSearch =
          workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          workout.exercises.some((ex) =>
            ex.exerciseName.toLowerCase().includes(searchTerm.toLowerCase())
          );
        return matchesSearch;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [workouts, searchTerm]);

  const calculateVolume = (workout: Workout): number => {
    return workout.exercises.reduce((total, exercise) => {
      const exerciseVolume = exercise.sets.reduce(
        (sum, set) => sum + set.weight * set.reps,
        0
      );
      return total + exerciseVolume;
    }, 0);
  };

  const handleOpenModal = (workout?: Workout) => {
    if (workout) {
      setEditingWorkout(workout);
      setFormData({
        name: workout.name,
        date: workout.date,
        duration: workout.duration,
        exercises: workout.exercises,
        notes: workout.notes || "",
      });
    } else {
      setEditingWorkout(null);
      setFormData({
        name: "",
        date: new Date().toISOString().split("T")[0] + "T" + new Date().toTimeString().slice(0, 5),
        duration: undefined,
        exercises: [],
        notes: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingWorkout(null);
    setSelectedExerciseId("");
  };

  const handleViewWorkout = (workout: Workout) => {
    setViewingWorkout(workout);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingWorkout(null);
  };

  const handleAddExercise = () => {
    if (!selectedExerciseId) return;

    const exercise = mockExercises.find((ex) => ex.id === selectedExerciseId);
    if (!exercise) return;

    const newWorkoutExercise: WorkoutExercise = {
      id: Date.now().toString(),
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      sets: [{ id: Date.now().toString() + "-set", weight: 0, reps: 10, restSeconds: 60 }],
      notes: "",
    };

    setFormData({
      ...formData,
      exercises: [...formData.exercises, newWorkoutExercise],
    });
    setSelectedExerciseId("");
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setFormData({
      ...formData,
      exercises: formData.exercises.filter((ex) => ex.id !== exerciseId),
    });
  };

  const handleAddSet = (exerciseId: string) => {
    setFormData({
      ...formData,
      exercises: formData.exercises.map((ex) => {
        if (ex.id === exerciseId) {
          const lastSet = ex.sets[ex.sets.length - 1];
          return {
            ...ex,
            sets: [
              ...ex.sets,
              {
                id: Date.now().toString(),
                weight: lastSet?.weight || 0,
                reps: lastSet?.reps || 10,
                restSeconds: lastSet?.restSeconds || 60,
              },
            ],
          };
        }
        return ex;
      }),
    });
  };

  const handleRemoveSet = (exerciseId: string, setId: string) => {
    setFormData({
      ...formData,
      exercises: formData.exercises.map((ex) => {
        if (ex.id === exerciseId) {
          const newSets = ex.sets.filter((set) => set.id !== setId);
          if (newSets.length === 0) {
            return ex; // Não remove se for a última série
          }
          return { ...ex, sets: newSets };
        }
        return ex;
      }),
    });
  };

  const handleUpdateSet = (
    exerciseId: string,
    setId: string,
    field: keyof WorkoutSet,
    value: number | string
  ) => {
    setFormData({
      ...formData,
      exercises: formData.exercises.map((ex) => {
        if (ex.id === exerciseId) {
          return {
            ...ex,
            sets: ex.sets.map((set) =>
              set.id === setId ? { ...set, [field]: value } : set
            ),
          };
        }
        return ex;
      }),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.exercises.length === 0) {
      alert("Adicione pelo menos um exercício ao treino");
      return;
    }

    if (editingWorkout) {
      setWorkouts(
        workouts.map((w) =>
          w.id === editingWorkout.id
            ? {
                ...w,
                ...formData,
                updatedAt: new Date().toISOString(),
              }
            : w
        )
      );
    } else {
      const newWorkout: Workout = {
        ...formData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setWorkouts([...workouts, newWorkout]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este treino?")) {
      setWorkouts(workouts.filter((w) => w.id !== id));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "-";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Treinos</h1>
          <p className="text-slate-400">Registre seus treinos e acompanhe seu progresso</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium hover:from-orange-600 hover:to-red-700 transition-all shadow-lg shadow-orange-500/20"
        >
          <Plus size={20} />
          Novo Treino
        </button>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Buscar treinos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
        />
      </div>

      {/* Lista de Treinos */}
      {filteredWorkouts.length === 0 ? (
        <div className="rounded-xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-12 text-center">
          <Dumbbell className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg mb-2">
            {searchTerm ? "Nenhum treino encontrado" : "Nenhum treino registrado"}
          </p>
          <p className="text-slate-500 text-sm">
            {searchTerm ? "Tente ajustar os termos de busca" : "Comece registrando seu primeiro treino"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredWorkouts.map((workout) => {
            const volume = calculateVolume(workout);
            return (
              <div
                key={workout.id}
                className="rounded-xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-6 hover:border-orange-500/50 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                      {workout.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        {formatDate(workout.date)}
                      </div>
                      {workout.duration && (
                        <div className="flex items-center gap-2">
                          <Clock size={16} />
                          {formatDuration(workout.duration)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleViewWorkout(workout)}
                      className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Ver detalhes"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleOpenModal(workout)}
                      className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(workout.id)}
                      className="p-2 rounded-lg bg-slate-700/50 hover:bg-red-600/20 text-slate-300 hover:text-red-400 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Exercícios:</span>
                    <span className="text-sm font-medium text-slate-300">{workout.exercises.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Volume Total:</span>
                    <span className="text-sm font-bold text-orange-400">{volume.toLocaleString()} kg</span>
                  </div>
                  <div className="pt-2 border-t border-slate-700/50">
                    <p className="text-xs text-slate-500 mb-2">Exercícios realizados:</p>
                    <div className="flex flex-wrap gap-2">
                      {workout.exercises.slice(0, 3).map((ex) => (
                        <span
                          key={ex.id}
                          className="px-2 py-1 text-xs rounded-lg bg-slate-700/50 text-slate-300"
                        >
                          {ex.exerciseName}
                        </span>
                      ))}
                      {workout.exercises.length > 3 && (
                        <span className="px-2 py-1 text-xs rounded-lg bg-slate-700/50 text-slate-300">
                          +{workout.exercises.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Criar/Editar Treino */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-xl bg-slate-800 border border-slate-700/50 shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700/50 p-4 sm:p-6 flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {editingWorkout ? "Editar Treino" : "Novo Treino"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nome do Treino *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    placeholder="Ex: Treino de Peito"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Data e Hora *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Duração (minutos)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.duration || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  placeholder="Ex: 75"
                />
              </div>

              {/* Adicionar Exercício */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Adicionar Exercício
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedExerciseId}
                    onChange={(e) => setSelectedExerciseId(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  >
                    <option value="">Selecione um exercício</option>
                    {mockExercises.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddExercise}
                    disabled={!selectedExerciseId}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium hover:from-orange-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Adicionar
                  </button>
                </div>
              </div>

              {/* Lista de Exercícios do Treino */}
              {formData.exercises.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Exercícios do Treino</h3>
                  {formData.exercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      className="rounded-lg bg-slate-700/30 border border-slate-600/50 p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-white">{exercise.exerciseName}</h4>
                        <button
                          type="button"
                          onClick={() => handleRemoveExercise(exercise.id)}
                          className="p-1 rounded-lg hover:bg-red-600/20 text-slate-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Séries */}
                      <div className="space-y-2">
                        <div className="grid grid-cols-12 gap-2 text-xs text-slate-400 mb-2">
                          <div className="col-span-1">#</div>
                          <div className="col-span-4">Peso (kg)</div>
                          <div className="col-span-3">Reps</div>
                          <div className="col-span-3">Descanso (s)</div>
                          <div className="col-span-1"></div>
                        </div>
                        {exercise.sets.map((set, index) => (
                          <div key={set.id} className="grid grid-cols-12 gap-2">
                            <div className="col-span-1 flex items-center text-slate-300 text-sm font-medium">
                              {index + 1}
                            </div>
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={set.weight}
                              onChange={(e) =>
                                handleUpdateSet(exercise.id, set.id, "weight", parseFloat(e.target.value) || 0)
                              }
                              className="col-span-4 px-2 py-1 rounded bg-slate-600/50 border border-slate-500/50 text-white text-sm focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                            />
                            <input
                              type="number"
                              min="1"
                              value={set.reps}
                              onChange={(e) =>
                                handleUpdateSet(exercise.id, set.id, "reps", parseInt(e.target.value) || 1)
                              }
                              className="col-span-3 px-2 py-1 rounded bg-slate-600/50 border border-slate-500/50 text-white text-sm focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                            />
                            <input
                              type="number"
                              min="0"
                              value={set.restSeconds || ""}
                              onChange={(e) =>
                                handleUpdateSet(
                                  exercise.id,
                                  set.id,
                                  "restSeconds",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="col-span-3 px-2 py-1 rounded bg-slate-600/50 border border-slate-500/50 text-white text-sm focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                              placeholder="60"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveSet(exercise.id, set.id)}
                              disabled={exercise.sets.length === 1}
                              className="col-span-1 flex items-center justify-center p-1 rounded hover:bg-red-600/20 text-slate-400 hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <MinusCircle size={16} />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => handleAddSet(exercise.id)}
                          className="flex items-center gap-1 text-sm text-orange-400 hover:text-orange-300 transition-colors mt-2"
                        >
                          <PlusCircle size={16} />
                          Adicionar série
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Notas</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none"
                  placeholder="Observações sobre o treino..."
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
                  {editingWorkout ? "Salvar Alterações" : "Criar Treino"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Visualização */}
      {isViewModalOpen && viewingWorkout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-xl bg-slate-800 border border-slate-700/50 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700/50 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">{viewingWorkout.name}</h2>
              <button
                onClick={handleCloseViewModal}
                className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Data</p>
                  <p className="text-white font-medium">{formatDate(viewingWorkout.date)}</p>
                </div>
                {viewingWorkout.duration && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Duração</p>
                    <p className="text-white font-medium">{formatDuration(viewingWorkout.duration)}</p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Exercícios</h3>
                <div className="space-y-4">
                  {viewingWorkout.exercises.map((exercise) => {
                    const exerciseVolume = exercise.sets.reduce(
                      (sum, set) => sum + set.weight * set.reps,
                      0
                    );
                    return (
                      <div
                        key={exercise.id}
                        className="rounded-lg bg-slate-700/30 border border-slate-600/50 p-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-white">{exercise.exerciseName}</h4>
                          <span className="text-sm text-orange-400 font-medium">
                            Volume: {exerciseVolume.toLocaleString()} kg
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="grid grid-cols-12 gap-2 text-xs text-slate-400 mb-2">
                            <div className="col-span-1">#</div>
                            <div className="col-span-4">Peso</div>
                            <div className="col-span-3">Reps</div>
                            <div className="col-span-4">Descanso</div>
                          </div>
                          {exercise.sets.map((set, index) => (
                            <div
                              key={set.id}
                              className="grid grid-cols-12 gap-2 text-sm text-slate-300"
                            >
                              <div className="col-span-1 font-medium">{index + 1}</div>
                              <div className="col-span-4">{set.weight} kg</div>
                              <div className="col-span-3">{set.reps} reps</div>
                              <div className="col-span-4">
                                {set.restSeconds ? `${set.restSeconds}s` : "-"}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {viewingWorkout.notes && (
                <div>
                  <p className="text-sm text-slate-500 mb-2">Notas</p>
                  <p className="text-slate-300">{viewingWorkout.notes}</p>
                </div>
              )}

              <div className="pt-4 border-t border-slate-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Volume Total</span>
                  <span className="text-2xl font-bold text-orange-400">
                    {calculateVolume(viewingWorkout).toLocaleString()} kg
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
