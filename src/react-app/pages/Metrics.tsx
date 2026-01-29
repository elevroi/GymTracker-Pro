import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Calendar,
  Ruler,
  TrendingUp,
  Eye,
  Scale,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { BodyMeasurement, BodyMeasurementForm } from "@/shared/types";

// Dados mockados para demonstração
const initialMeasurements: BodyMeasurement[] = [
  {
    id: "1",
    date: new Date(2025, 0, 1).toISOString(),
    weight: 82.5,
    height: 178,
    chest: 102,
    waist: 88,
    hips: 98,
    leftArm: 36,
    rightArm: 36,
    leftThigh: 58,
    rightThigh: 58,
    neck: 38,
    shoulder: 118,
    bodyFatPercent: 18,
    notes: "Início do mês",
    createdAt: new Date(2025, 0, 1).toISOString(),
    updatedAt: new Date(2025, 0, 1).toISOString(),
  },
  {
    id: "2",
    date: new Date(2025, 0, 8).toISOString(),
    weight: 82.0,
    height: 178,
    chest: 102,
    waist: 87,
    hips: 98,
    leftArm: 36,
    rightArm: 36,
    leftThigh: 58,
    rightThigh: 58,
    neck: 38,
    shoulder: 118,
    bodyFatPercent: 17.5,
    notes: "",
    createdAt: new Date(2025, 0, 8).toISOString(),
    updatedAt: new Date(2025, 0, 8).toISOString(),
  },
  {
    id: "3",
    date: new Date(2025, 0, 15).toISOString(),
    weight: 81.5,
    height: 178,
    chest: 103,
    waist: 86,
    hips: 97,
    leftArm: 36.5,
    rightArm: 36.5,
    leftThigh: 58,
    rightThigh: 58,
    neck: 38,
    shoulder: 119,
    bodyFatPercent: 17,
    notes: "",
    createdAt: new Date(2025, 0, 15).toISOString(),
    updatedAt: new Date(2025, 0, 15).toISOString(),
  },
];

const measurementLabels: Record<string, string> = {
  weight: "Peso (kg)",
  height: "Altura (cm)",
  chest: "Peito (cm)",
  waist: "Cintura (cm)",
  hips: "Quadril (cm)",
  leftArm: "Braço Esq. (cm)",
  rightArm: "Braço Dir. (cm)",
  leftThigh: "Coxa Esq. (cm)",
  rightThigh: "Coxa Dir. (cm)",
  neck: "Pescoço (cm)",
  shoulder: "Ombros (cm)",
  bodyFatPercent: "Gordura (%)",
};

const defaultFormData: BodyMeasurementForm = {
  date: new Date().toISOString().split("T")[0] + "T00:00:00",
  weight: undefined,
  height: undefined,
  chest: undefined,
  waist: undefined,
  hips: undefined,
  leftArm: undefined,
  rightArm: undefined,
  leftThigh: undefined,
  rightThigh: undefined,
  neck: undefined,
  shoulder: undefined,
  bodyFatPercent: undefined,
  notes: "",
};

export default function Metrics() {
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>(initialMeasurements);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState<BodyMeasurement | null>(null);
  const [viewingMeasurement, setViewingMeasurement] = useState<BodyMeasurement | null>(null);
  const [formData, setFormData] = useState<BodyMeasurementForm>(defaultFormData);
  const [chartMetric, setChartMetric] = useState<string>("weight");

  const sortedMeasurements = useMemo(() => {
    return [...measurements].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [measurements]);

  const filteredMeasurements = useMemo(() => {
    if (!searchTerm.trim()) return sortedMeasurements;
    const term = searchTerm.toLowerCase();
    return sortedMeasurements.filter((m) => {
      const dateStr = new Date(m.date).toLocaleDateString("pt-BR");
      const notes = (m.notes || "").toLowerCase();
      return dateStr.includes(term) || notes.includes(term);
    });
  }, [sortedMeasurements, searchTerm]);

  const chartData = useMemo(() => {
    const sorted = [...measurements].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    return sorted.map((m) => {
      const date = new Date(m.date);
      const dateStr = date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      });
      const value = m[chartMetric as keyof BodyMeasurement];
      const numValue = typeof value === "number" ? value : undefined;
      return {
        date: dateStr,
        value: numValue,
        fullDate: m.date,
      };
    }).filter((d) => d.value !== undefined);
  }, [measurements, chartMetric]);

  const latestMeasurement = useMemo(() => {
    return sortedMeasurements[0];
  }, [sortedMeasurements]);

  const handleOpenModal = (measurement?: BodyMeasurement) => {
    if (measurement) {
      setEditingMeasurement(measurement);
      setFormData({
        date: measurement.date,
        weight: measurement.weight,
        height: measurement.height,
        chest: measurement.chest,
        waist: measurement.waist,
        hips: measurement.hips,
        leftArm: measurement.leftArm,
        rightArm: measurement.rightArm,
        leftThigh: measurement.leftThigh,
        rightThigh: measurement.rightThigh,
        neck: measurement.neck,
        shoulder: measurement.shoulder,
        bodyFatPercent: measurement.bodyFatPercent,
        notes: measurement.notes || "",
      });
    } else {
      setEditingMeasurement(null);
      setFormData({
        ...defaultFormData,
        date: new Date().toISOString().split("T")[0] + "T00:00:00",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMeasurement(null);
  };

  const handleViewMeasurement = (measurement: BodyMeasurement) => {
    setViewingMeasurement(measurement);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingMeasurement(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hasAtLeastOne = [
      formData.weight,
      formData.height,
      formData.chest,
      formData.waist,
      formData.hips,
      formData.leftArm,
      formData.rightArm,
      formData.leftThigh,
      formData.rightThigh,
      formData.neck,
      formData.shoulder,
      formData.bodyFatPercent,
    ].some((v) => v !== undefined && v !== null && !Number.isNaN(v));

    if (!hasAtLeastOne) {
      alert("Preencha pelo menos uma medida.");
      return;
    }

    if (editingMeasurement) {
      setMeasurements(
        measurements.map((m) =>
          m.id === editingMeasurement.id
            ? { ...m, ...formData, updatedAt: new Date().toISOString() }
            : m
        )
      );
    } else {
      const newMeasurement: BodyMeasurement = {
        ...formData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setMeasurements([...measurements, newMeasurement]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta medição?")) {
      setMeasurements(measurements.filter((m) => m.id !== id));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatValue = (key: string, value: number | undefined) => {
    if (value === undefined || value === null) return "-";
    if (key === "bodyFatPercent") return `${value}%`;
    if (key === "weight") return `${value} kg`;
    return `${value} cm`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Medidas Corporais</h1>
          <p className="text-slate-400">Acompanhe suas medidas e composição corporal</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium hover:from-orange-600 hover:to-red-700 transition-all shadow-lg shadow-orange-500/20"
        >
          <Plus size={20} />
          Nova Medição
        </button>
      </div>

      {/* Resumo da última medição */}
      {latestMeasurement && (
        <div className="rounded-xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-600">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Última medição</h3>
              <p className="text-sm text-slate-400">{formatDate(latestMeasurement.date)}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {latestMeasurement.weight !== undefined && (
              <div>
                <p className="text-xs text-slate-500">Peso</p>
                <p className="text-lg font-bold text-orange-400">{latestMeasurement.weight} kg</p>
              </div>
            )}
            {latestMeasurement.bodyFatPercent !== undefined && (
              <div>
                <p className="text-xs text-slate-500">Gordura</p>
                <p className="text-lg font-bold text-slate-200">{latestMeasurement.bodyFatPercent}%</p>
              </div>
            )}
            {latestMeasurement.chest !== undefined && (
              <div>
                <p className="text-xs text-slate-500">Peito</p>
                <p className="text-lg font-bold text-slate-200">{latestMeasurement.chest} cm</p>
              </div>
            )}
            {latestMeasurement.waist !== undefined && (
              <div>
                <p className="text-xs text-slate-500">Cintura</p>
                <p className="text-lg font-bold text-slate-200">{latestMeasurement.waist} cm</p>
              </div>
            )}
            {latestMeasurement.hips !== undefined && (
              <div>
                <p className="text-xs text-slate-500">Quadril</p>
                <p className="text-lg font-bold text-slate-200">{latestMeasurement.hips} cm</p>
              </div>
            )}
            {latestMeasurement.shoulder !== undefined && (
              <div>
                <p className="text-xs text-slate-500">Ombros</p>
                <p className="text-lg font-bold text-slate-200">{latestMeasurement.shoulder} cm</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Gráfico de evolução */}
      {chartData.length > 0 && (
        <div className="rounded-xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-600">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Evolução</h3>
                <p className="text-sm text-slate-400">Acompanhe sua progressão ao longo do tempo</p>
              </div>
            </div>
            <select
              value={chartMetric}
              onChange={(e) => setChartMetric(e.target.value)}
              className="px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            >
              {Object.entries(measurementLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
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
                formatter={(value: number | undefined) => {
                  if (value === undefined) return ["-", ""];
                  return [
                    chartMetric === "weight" ? `${value} kg` : chartMetric === "bodyFatPercent" ? `${value}%` : `${value} cm`,
                    measurementLabels[chartMetric] || chartMetric,
                  ];
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#f97316"
                strokeWidth={2}
                fill="url(#colorMetric)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Buscar por data ou notas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
        />
      </div>

      {/* Lista de medições */}
      {filteredMeasurements.length === 0 ? (
        <div className="rounded-xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-12 text-center">
          <Ruler className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg mb-2">
            {searchTerm ? "Nenhuma medição encontrada" : "Nenhuma medição registrada"}
          </p>
          <p className="text-slate-500 text-sm">
            {searchTerm ? "Tente ajustar os termos de busca" : "Registre sua primeira medição"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeasurements.map((measurement) => (
            <div
              key={measurement.id}
              className="rounded-xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-6 hover:border-orange-500/50 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="text-slate-400" size={20} />
                  <span className="text-lg font-bold text-white">{formatDate(measurement.date)}</span>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleViewMeasurement(measurement)}
                    className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Ver detalhes"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => handleOpenModal(measurement)}
                    className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Editar"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(measurement.id)}
                    className="p-2 rounded-lg bg-slate-700/50 hover:bg-red-600/20 text-slate-300 hover:text-red-400 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {measurement.weight !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Peso</span>
                    <span className="text-orange-400 font-semibold">{measurement.weight} kg</span>
                  </div>
                )}
                {measurement.bodyFatPercent !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Gordura</span>
                    <span className="text-slate-300">{measurement.bodyFatPercent}%</span>
                  </div>
                )}
                {(measurement.waist !== undefined || measurement.chest !== undefined) && (
                  <div className="flex justify-between text-sm text-slate-400">
                    <span>
                      {measurement.chest !== undefined && `Peito ${measurement.chest}cm`}
                      {measurement.chest !== undefined && measurement.waist !== undefined && " · "}
                      {measurement.waist !== undefined && `Cintura ${measurement.waist}cm`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Criar/Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-xl bg-slate-800 border border-slate-700/50 shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700/50 p-4 sm:p-6 flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {editingMeasurement ? "Editar Medição" : "Nova Medição"}
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
                <label className="block text-sm font-medium text-slate-300 mb-2">Data *</label>
                <input
                  type="date"
                  required
                  value={formData.date.split("T")[0]}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value + "T00:00:00" })
                  }
                  className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Peso (kg)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.weight ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        weight: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    placeholder="Ex: 82.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Altura (cm)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.height ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        height: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    placeholder="Ex: 178"
                  />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-3">Medidas (cm)</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {(["chest", "waist", "hips", "neck", "shoulder", "leftArm", "rightArm", "leftThigh", "rightThigh"] as const).map(
                    (key) => (
                      <div key={key}>
                        <label className="block text-xs text-slate-500 mb-1">
                          {measurementLabels[key]}
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={formData[key] ?? ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              [key]: e.target.value ? parseFloat(e.target.value) : undefined,
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                        />
                      </div>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Gordura corporal (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.bodyFatPercent ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bodyFatPercent: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  placeholder="Ex: 18"
                />
              </div>

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
                  {editingMeasurement ? "Salvar Alterações" : "Registrar Medição"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Visualização */}
      {isViewModalOpen && viewingMeasurement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl bg-slate-800 border border-slate-700/50 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700/50 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                Medição - {formatDate(viewingMeasurement.date)}
              </h2>
              <button
                onClick={handleCloseViewModal}
                className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {(
                [
                  "weight",
                  "height",
                  "bodyFatPercent",
                  "chest",
                  "waist",
                  "hips",
                  "shoulder",
                  "neck",
                  "leftArm",
                  "rightArm",
                  "leftThigh",
                  "rightThigh",
                ] as const
              ).map((key) => {
                const value = viewingMeasurement[key];
                if (value === undefined || value === null) return null;
                return (
                  <div key={key} className="flex justify-between items-center py-2 border-b border-slate-700/30">
                    <span className="text-slate-400">{measurementLabels[key]}</span>
                    <span className="font-semibold text-white">
                      {formatValue(key, value as number)}
                    </span>
                  </div>
                );
              })}
              {viewingMeasurement.notes && (
                <div className="pt-4 border-t border-slate-700/50">
                  <p className="text-sm text-slate-500 mb-1">Notas</p>
                  <p className="text-slate-300">{viewingMeasurement.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
