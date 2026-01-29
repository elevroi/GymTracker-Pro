import { useState, useMemo } from "react";
import { Plus, Search, Edit2, Trash2, X, Filter, Dumbbell as DumbbellIcon } from "lucide-react";
import type { Exercise, ExerciseForm } from "@/shared/types";

// Dados mockados para demonstração
const initialExercises: Exercise[] = [
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

const categories = [
  { value: "todos", label: "Todos" },
  { value: "peito", label: "Peito" },
  { value: "costas", label: "Costas" },
  { value: "ombros", label: "Ombros" },
  { value: "braços", label: "Braços" },
  { value: "pernas", label: "Pernas" },
  { value: "abdômen", label: "Abdômen" },
  { value: "cardio", label: "Cardio" },
  { value: "outros", label: "Outros" },
];

const equipmentLabels: Record<string, string> = {
  barra: "Barra",
  halteres: "Halteres",
  máquina: "Máquina",
  peso_livre: "Peso Livre",
  corpo: "Corpo",
  cabo: "Cabo",
  outros: "Outros",
};

const difficultyLabels: Record<string, string> = {
  iniciante: "Iniciante",
  intermediário: "Intermediário",
  avançado: "Avançado",
};

const difficultyColors: Record<string, string> = {
  iniciante: "from-green-500 to-emerald-600",
  intermediário: "from-orange-500 to-red-600",
  avançado: "from-purple-500 to-pink-600",
};

export default function Exercises() {
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [formData, setFormData] = useState<ExerciseForm>({
    name: "",
    description: "",
    category: "peito",
    muscleGroups: [],
    equipment: "barra",
    difficulty: "intermediário",
    instructions: "",
  });
  const [currentMuscleGroup, setCurrentMuscleGroup] = useState("");

  const filteredExercises = useMemo(() => {
    return exercises.filter((exercise) => {
      const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "todos" || exercise.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [exercises, searchTerm, selectedCategory]);

  const handleOpenModal = (exercise?: Exercise) => {
    if (exercise) {
      setEditingExercise(exercise);
      setFormData({
        name: exercise.name,
        description: exercise.description || "",
        category: exercise.category,
        muscleGroups: exercise.muscleGroups,
        equipment: exercise.equipment,
        difficulty: exercise.difficulty,
        instructions: exercise.instructions || "",
      });
    } else {
      setEditingExercise(null);
      setFormData({
        name: "",
        description: "",
        category: "peito",
        muscleGroups: [],
        equipment: "barra",
        difficulty: "intermediário",
        instructions: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingExercise(null);
    setCurrentMuscleGroup("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingExercise) {
      // Editar exercício existente
      setExercises(
        exercises.map((ex) =>
          ex.id === editingExercise.id
            ? {
                ...ex,
                ...formData,
                updatedAt: new Date().toISOString(),
              }
            : ex
        )
      );
    } else {
      // Criar novo exercício
      const newExercise: Exercise = {
        ...formData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setExercises([...exercises, newExercise]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este exercício?")) {
      setExercises(exercises.filter((ex) => ex.id !== id));
    }
  };

  const handleAddMuscleGroup = () => {
    if (currentMuscleGroup.trim() && !formData.muscleGroups.includes(currentMuscleGroup.trim())) {
      setFormData({
        ...formData,
        muscleGroups: [...formData.muscleGroups, currentMuscleGroup.trim()],
      });
      setCurrentMuscleGroup("");
    }
  };

  const handleRemoveMuscleGroup = (muscle: string) => {
    setFormData({
      ...formData,
      muscleGroups: formData.muscleGroups.filter((m) => m !== muscle),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Exercícios</h1>
          <p className="text-slate-400">Gerencie sua biblioteca de exercícios</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium hover:from-orange-600 hover:to-red-700 transition-all shadow-lg shadow-orange-500/20"
        >
          <Plus size={20} />
          Novo Exercício
        </button>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Buscar exercícios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50 appearance-none cursor-pointer min-w-[180px]"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de Exercícios */}
      {filteredExercises.length === 0 ? (
        <div className="rounded-xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-12 text-center">
          <DumbbellIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg mb-2">
            {searchTerm || selectedCategory !== "todos"
              ? "Nenhum exercício encontrado"
              : "Nenhum exercício cadastrado"}
          </p>
          <p className="text-slate-500 text-sm">
            {searchTerm || selectedCategory !== "todos"
              ? "Tente ajustar os filtros de busca"
              : "Comece adicionando seu primeiro exercício"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map((exercise) => (
            <div
              key={exercise.id}
              className="rounded-xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-6 hover:border-orange-500/50 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-orange-400 transition-colors">
                    {exercise.name}
                  </h3>
                  <span className="inline-block px-2 py-1 text-xs font-medium rounded-lg bg-gradient-to-r from-orange-500/20 to-red-600/20 text-orange-400 border border-orange-500/30">
                    {categories.find((c) => c.value === exercise.category)?.label}
                  </span>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenModal(exercise)}
                    className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(exercise.id)}
                    className="p-2 rounded-lg bg-slate-700/50 hover:bg-red-600/20 text-slate-300 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {exercise.description && (
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">{exercise.description}</p>
              )}

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500">Equipamento:</span>
                  <span className="text-slate-300">{equipmentLabels[exercise.equipment]}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500">Dificuldade:</span>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-lg bg-gradient-to-r ${difficultyColors[exercise.difficulty]} text-white`}
                  >
                    {difficultyLabels[exercise.difficulty]}
                  </span>
                </div>
              </div>

              {exercise.muscleGroups.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 mb-2">Grupos Musculares:</p>
                  <div className="flex flex-wrap gap-2">
                    {exercise.muscleGroups.slice(0, 3).map((muscle, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs rounded-lg bg-slate-700/50 text-slate-300"
                      >
                        {muscle}
                      </span>
                    ))}
                    {exercise.muscleGroups.length > 3 && (
                      <span className="px-2 py-1 text-xs rounded-lg bg-slate-700/50 text-slate-300">
                        +{exercise.muscleGroups.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de Criar/Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-xl bg-slate-800 border border-slate-700/50 shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700/50 p-4 sm:p-6 flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {editingExercise ? "Editar Exercício" : "Novo Exercício"}
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
                  Nome do Exercício *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  placeholder="Ex: Supino Reto"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none"
                  placeholder="Breve descrição do exercício..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Categoria *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as Exercise["category"] })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  >
                    {categories
                      .filter((c) => c.value !== "todos")
                      .map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Equipamento *</label>
                  <select
                    required
                    value={formData.equipment}
                    onChange={(e) =>
                      setFormData({ ...formData, equipment: e.target.value as Exercise["equipment"] })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  >
                    {Object.entries(equipmentLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Dificuldade *</label>
                <select
                  required
                  value={formData.difficulty}
                  onChange={(e) =>
                    setFormData({ ...formData, difficulty: e.target.value as Exercise["difficulty"] })
                  }
                  className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                >
                  {Object.entries(difficultyLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Grupos Musculares
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={currentMuscleGroup}
                    onChange={(e) => setCurrentMuscleGroup(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddMuscleGroup();
                      }
                    }}
                    className="flex-1 px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    placeholder="Digite e pressione Enter"
                  />
                  <button
                    type="button"
                    onClick={handleAddMuscleGroup}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium hover:from-orange-600 hover:to-red-700 transition-all"
                  >
                    Adicionar
                  </button>
                </div>
                {formData.muscleGroups.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.muscleGroups.map((muscle, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-700/50 text-slate-300 text-sm"
                      >
                        {muscle}
                        <button
                          type="button"
                          onClick={() => handleRemoveMuscleGroup(muscle)}
                          className="hover:text-red-400 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Instruções</label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none"
                  placeholder="Passo a passo de como executar o exercício..."
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
                  {editingExercise ? "Salvar Alterações" : "Criar Exercício"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
