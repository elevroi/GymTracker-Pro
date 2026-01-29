import { useState, useMemo } from "react";
import {
  Lightbulb,
  Dumbbell,
  Apple,
  Heart,
  TrendingUp,
  Clock,
  Target,
  Zap,
  BookOpen,
  CheckCircle2,
  XCircle,
  Filter,
  Sparkles,
} from "lucide-react";

type RecommendationCategory = "treino" | "nutricao" | "recuperacao" | "progresso" | "geral";

interface Recommendation {
  id: string;
  category: RecommendationCategory;
  title: string;
  description: string;
  priority: "alta" | "media" | "baixa";
  isRead: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

const initialRecommendations: Recommendation[] = [
  {
    id: "1",
    category: "treino",
    title: "Varie seus exercícios de peito",
    description:
      "Você tem focado muito em supino reto. Considere adicionar supino inclinado, crucifixo e flexões para desenvolver diferentes áreas do peitoral.",
    priority: "alta",
    isRead: false,
    actionUrl: "/exercises",
    actionLabel: "Ver exercícios",
  },
  {
    id: "2",
    category: "nutricao",
    title: "Aumente a ingestão de proteína",
    description:
      "Para otimizar a recuperação muscular, tente consumir pelo menos 2g de proteína por kg de peso corporal. Isso ajudará na construção e reparo dos músculos.",
    priority: "alta",
    isRead: false,
  },
  {
    id: "3",
    category: "recuperacao",
    title: "Descanso adequado entre treinos",
    description:
      "Você está treinando muito frequentemente. Considere adicionar mais dias de descanso para permitir que seus músculos se recuperem adequadamente.",
    priority: "media",
    isRead: false,
  },
  {
    id: "4",
    category: "progresso",
    title: "Parabéns pelo progresso!",
    description:
      "Você perdeu 2.5kg nos últimos 30 dias. Continue mantendo essa consistência e você alcançará sua meta em breve!",
    priority: "baixa",
    isRead: false,
  },
  {
    id: "5",
    category: "treino",
    title: "Adicione exercícios compostos",
    description:
      "Exercícios como agachamento, levantamento terra e desenvolvimento são fundamentais para ganho de força e massa muscular.",
    priority: "media",
    isRead: false,
    actionUrl: "/exercises",
    actionLabel: "Explorar exercícios",
  },
  {
    id: "6",
    category: "nutricao",
    title: "Hidratação é essencial",
    description:
      "Beba pelo menos 35ml de água por kg de peso corporal. A hidratação adequada melhora o desempenho e a recuperação.",
    priority: "media",
    isRead: false,
  },
  {
    id: "7",
    title: "Registre suas medidas regularmente",
    category: "progresso",
    description:
      "Registrar suas medidas corporais semanalmente ajuda a acompanhar o progresso de forma mais precisa do que apenas o peso.",
    priority: "media",
    isRead: false,
    actionUrl: "/metrics",
    actionLabel: "Registrar medidas",
  },
  {
    id: "8",
    category: "recuperacao",
    title: "Alongamento e mobilidade",
    description:
      "Dedique 10-15 minutos após cada treino para alongamento. Isso melhora a flexibilidade e reduz o risco de lesões.",
    priority: "baixa",
    isRead: false,
  },
  {
    id: "9",
    category: "treino",
    title: "Progressive Overload",
    description:
      "Para continuar progredindo, aumente gradualmente a carga, repetições ou séries a cada semana. Isso força seus músculos a se adaptarem.",
    priority: "alta",
    isRead: false,
  },
  {
    id: "10",
    category: "nutricao",
    title: "Refeição pós-treino",
    description:
      "Consuma uma refeição rica em proteínas e carboidratos dentro de 30-60 minutos após o treino para otimizar a recuperação.",
    priority: "alta",
    isRead: false,
  },
];

const categoryLabels: Record<RecommendationCategory, string> = {
  treino: "Treino",
  nutricao: "Nutrição",
  recuperacao: "Recuperação",
  progresso: "Progresso",
  geral: "Geral",
};

const categoryIcons: Record<RecommendationCategory, typeof Lightbulb> = {
  treino: Dumbbell,
  nutricao: Apple,
  recuperacao: Heart,
  progresso: TrendingUp,
  geral: Lightbulb,
};

const categoryColors: Record<RecommendationCategory, string> = {
  treino: "from-orange-500 to-red-600",
  nutricao: "from-green-500 to-emerald-600",
  recuperacao: "from-blue-500 to-cyan-600",
  progresso: "from-purple-500 to-pink-600",
  geral: "from-yellow-500 to-orange-600",
};

const priorityLabels: Record<string, string> = {
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};

const priorityColors: Record<string, string> = {
  alta: "text-red-400",
  media: "text-yellow-400",
  baixa: "text-green-400",
};

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>(initialRecommendations);
  const [selectedCategory, setSelectedCategory] = useState<RecommendationCategory | "todos">("todos");
  const [showRead, setShowRead] = useState(true);

  const filteredRecommendations = useMemo(() => {
    return recommendations.filter((rec) => {
      const matchesCategory = selectedCategory === "todos" || rec.category === selectedCategory;
      const matchesRead = showRead || !rec.isRead;
      return matchesCategory && matchesRead;
    });
  }, [recommendations, selectedCategory, showRead]);

  const unreadCount = useMemo(() => {
    return recommendations.filter((r) => !r.isRead).length;
  }, [recommendations]);

  const categoryCounts = useMemo(() => {
    const counts: Record<RecommendationCategory, number> = {
      treino: 0,
      nutricao: 0,
      recuperacao: 0,
      progresso: 0,
      geral: 0,
    };
    recommendations.forEach((rec) => {
      if (!rec.isRead) {
        counts[rec.category]++;
      }
    });
    return counts;
  }, [recommendations]);

  const handleToggleRead = (id: string) => {
    setRecommendations(
      recommendations.map((rec) =>
        rec.id === id ? { ...rec, isRead: !rec.isRead } : rec
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setRecommendations(recommendations.map((rec) => ({ ...rec, isRead: true })));
  };

  const sortedRecommendations = useMemo(() => {
    return [...filteredRecommendations].sort((a, b) => {
      // Prioridade: alta > média > baixa
      const priorityOrder = { alta: 3, media: 2, baixa: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      // Não lidas primeiro
      if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
      return 0;
    });
  }, [filteredRecommendations]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Recomendações</h1>
          <p className="text-slate-400 text-sm sm:text-base">Dicas personalizadas para otimizar seus resultados</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 font-medium transition-colors text-sm sm:text-base w-full sm:w-auto"
          >
            <CheckCircle2 size={18} className="sm:w-5 sm:h-5" />
            <span className="sm:hidden">Marcar todas lidas</span>
            <span className="hidden sm:inline">Marcar todas como lidas</span>
          </button>
        )}
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
        <div className="rounded-xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex-shrink-0">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400 truncate">Novas</p>
              <p className="text-lg sm:text-xl font-bold text-white">{unreadCount}</p>
            </div>
          </div>
        </div>
        {(Object.keys(categoryCounts) as RecommendationCategory[]).map((category) => {
          const count = categoryCounts[category];
          if (count === 0) return null;
          const Icon = categoryIcons[category];
          return (
            <div
              key={category}
              className="rounded-xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-3 sm:p-4"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`p-1.5 sm:p-2 rounded-lg bg-gradient-to-br ${categoryColors[category]} flex-shrink-0`}>
                  <Icon className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400 truncate">{categoryLabels[category]}</p>
                  <p className="text-lg sm:text-xl font-bold text-white">{count}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory("todos")}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors min-h-[44px] ${
              selectedCategory === "todos"
                ? "bg-gradient-to-r from-orange-500 to-red-600 text-white"
                : "bg-slate-700/50 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Todas
          </button>
          {(Object.keys(categoryLabels) as RecommendationCategory[]).map((category) => {
            const Icon = categoryIcons[category];
            const count = categoryCounts[category];
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors min-h-[44px] ${
                  selectedCategory === category
                    ? `bg-gradient-to-r ${categoryColors[category]} text-white`
                    : "bg-slate-700/50 text-slate-300 hover:bg-slate-700"
                }`}
              >
                <Icon size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden xs:inline">{categoryLabels[category]}</span>
                <span className="xs:hidden">{categoryLabels[category].substring(0, 3)}</span>
                {count > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-xs flex-shrink-0">{count}</span>
                )}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={showRead}
              onChange={(e) => setShowRead(e.target.checked)}
              className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-slate-700 border-slate-600 text-orange-500 focus:ring-orange-500"
            />
            Mostrar lidas
          </label>
        </div>
      </div>

      {/* Lista de Recomendações */}
      {sortedRecommendations.length === 0 ? (
        <div className="rounded-xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-8 sm:p-12 text-center">
          <Lightbulb className="w-12 h-12 sm:w-16 sm:h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-base sm:text-lg mb-2">
            {selectedCategory !== "todos" || !showRead
              ? "Nenhuma recomendação encontrada"
              : "Todas as recomendações foram lidas"}
          </p>
          <p className="text-slate-500 text-sm">
            {selectedCategory !== "todos" || !showRead
              ? "Tente ajustar os filtros"
              : "Novas recomendações aparecerão aqui"}
          </p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {sortedRecommendations.map((recommendation) => {
            const CategoryIcon = categoryIcons[recommendation.category];
            return (
              <div
                key={recommendation.id}
                className={`rounded-xl bg-slate-800/40 backdrop-blur-sm border transition-all ${
                  recommendation.isRead
                    ? "border-slate-700/50 opacity-60"
                    : `border-slate-700/50 hover:border-orange-500/50`
                } p-4 sm:p-6`}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div
                    className={`p-2 sm:p-3 rounded-lg bg-gradient-to-br ${categoryColors[recommendation.category]} flex-shrink-0`}
                  >
                    <CategoryIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 sm:gap-4 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                          <h3 className="text-base sm:text-lg font-bold text-white break-words">{recommendation.title}</h3>
                          {!recommendation.isRead && (
                            <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-medium whitespace-nowrap">
                              Nova
                            </span>
                          )}
                          <span
                            className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[recommendation.priority]} bg-slate-700/50 whitespace-nowrap`}
                          >
                            {priorityLabels[recommendation.priority]}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed">{recommendation.description}</p>
                      </div>
                      <button
                        onClick={() => handleToggleRead(recommendation.id)}
                        className={`p-2 rounded-lg transition-colors flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center ${
                          recommendation.isRead
                            ? "bg-slate-700/50 hover:bg-slate-700 text-slate-400"
                            : "bg-orange-500/20 hover:bg-orange-500/30 text-orange-400"
                        }`}
                        title={recommendation.isRead ? "Marcar como não lida" : "Marcar como lida"}
                      >
                        {recommendation.isRead ? (
                          <XCircle size={20} />
                        ) : (
                          <CheckCircle2 size={20} />
                        )}
                      </button>
                    </div>
                    {recommendation.actionUrl && recommendation.actionLabel && (
                      <div className="mt-3 sm:mt-4">
                        <a
                          href={recommendation.actionUrl}
                          className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500/20 to-red-600/20 text-orange-400 border border-orange-500/30 hover:from-orange-500/30 hover:to-red-600/30 transition-all text-xs sm:text-sm font-medium min-h-[44px]"
                        >
                          <Zap size={14} className="sm:w-4 sm:h-4" />
                          {recommendation.actionLabel}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dicas Gerais */}
      <div className="rounded-xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-4 sm:p-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 flex-shrink-0">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white">Dicas Gerais</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="p-3 sm:p-4 rounded-lg bg-slate-700/30 border border-slate-600/30">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-orange-400 flex-shrink-0" />
              <h4 className="font-semibold text-white text-sm">Consistência</h4>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Treinar regularmente é mais importante do que treinar intensamente ocasionalmente.
            </p>
          </div>
          <div className="p-3 sm:p-4 rounded-lg bg-slate-700/30 border border-slate-600/30">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <h4 className="font-semibold text-white text-sm">Metas Realistas</h4>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Defina metas alcançáveis e comemore cada pequeno progresso ao longo do caminho.
            </p>
          </div>
          <div className="p-3 sm:p-4 rounded-lg bg-slate-700/30 border border-slate-600/30">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-green-400 flex-shrink-0" />
              <h4 className="font-semibold text-white text-sm">Recuperação</h4>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              O descanso é tão importante quanto o treino. Seus músculos crescem durante a recuperação.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
