import { useState, useMemo, useRef } from "react";
import {
  Upload,
  Search,
  Edit2,
  Trash2,
  X,
  Camera,
  Eye,
  Image as ImageIcon,
  Grid3x3,
  Columns,
  GitCompare,
} from "lucide-react";
import type { ProgressPhoto, ProgressPhotoForm } from "@/shared/types";

// Placeholder images usando Unsplash para demonstração
const placeholderImages = {
  frontal: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop",
  lateral_esquerda: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop",
  lateral_direita: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop",
  posterior: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop",
  outros: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop",
};

// Dados mockados para demonstração
const initialPhotos: ProgressPhoto[] = [
  {
    id: "1",
    date: new Date(2025, 0, 1).toISOString(),
    photoType: "frontal",
    imageUrl: placeholderImages.frontal,
    thumbnailUrl: placeholderImages.frontal,
    notes: "Início da jornada",
    createdAt: new Date(2025, 0, 1).toISOString(),
    updatedAt: new Date(2025, 0, 1).toISOString(),
  },
  {
    id: "2",
    date: new Date(2025, 0, 15).toISOString(),
    photoType: "frontal",
    imageUrl: placeholderImages.frontal,
    thumbnailUrl: placeholderImages.frontal,
    notes: "2 semanas de treino",
    createdAt: new Date(2025, 0, 15).toISOString(),
    updatedAt: new Date(2025, 0, 15).toISOString(),
  },
  {
    id: "3",
    date: new Date(2025, 0, 1).toISOString(),
    photoType: "lateral_esquerda",
    imageUrl: placeholderImages.lateral_esquerda,
    thumbnailUrl: placeholderImages.lateral_esquerda,
    notes: "",
    createdAt: new Date(2025, 0, 1).toISOString(),
    updatedAt: new Date(2025, 0, 1).toISOString(),
  },
];

const photoTypeLabels: Record<string, string> = {
  frontal: "Frontal",
  lateral_esquerda: "Lateral Esquerda",
  lateral_direita: "Lateral Direita",
  posterior: "Posterior",
  outros: "Outros",
};

const photoTypeColors: Record<string, string> = {
  frontal: "from-blue-500 to-cyan-600",
  lateral_esquerda: "from-green-500 to-emerald-600",
  lateral_direita: "from-purple-500 to-pink-600",
  posterior: "from-orange-500 to-red-600",
  outros: "from-slate-500 to-slate-600",
};

type ViewMode = "grid" | "masonry";

export default function Photos() {
  const [photos, setPhotos] = useState<ProgressPhoto[]>(initialPhotos);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("todos");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<ProgressPhoto | null>(null);
  const [viewingPhoto, setViewingPhoto] = useState<ProgressPhoto | null>(null);
  const [comparingPhotos, setComparingPhotos] = useState<ProgressPhoto[]>([]);
  const [formData, setFormData] = useState<ProgressPhotoForm>({
    date: new Date().toISOString().split("T")[0] + "T00:00:00",
    photoType: "frontal",
    imageUrl: "",
    thumbnailUrl: "",
    notes: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredPhotos = useMemo(() => {
    return photos
      .filter((photo) => {
        const matchesSearch =
          photo.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          new Date(photo.date).toLocaleDateString("pt-BR").includes(searchTerm);
        const matchesType = selectedType === "todos" || photo.photoType === selectedType;
        return matchesSearch && matchesType;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [photos, searchTerm, selectedType]);

  const groupedPhotos = useMemo(() => {
    const groups: Record<string, ProgressPhoto[]> = {};
    filteredPhotos.forEach((photo) => {
      const dateKey = new Date(photo.date).toLocaleDateString("pt-BR", {
        year: "numeric",
        month: "long",
      });
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(photo);
    });
    return groups;
  }, [filteredPhotos]);

  const handleOpenModal = (photo?: ProgressPhoto) => {
    if (photo) {
      setEditingPhoto(photo);
      setFormData({
        date: photo.date,
        photoType: photo.photoType,
        imageUrl: photo.imageUrl,
        thumbnailUrl: photo.thumbnailUrl,
        notes: photo.notes || "",
      });
    } else {
      setEditingPhoto(null);
      setFormData({
        date: new Date().toISOString().split("T")[0] + "T00:00:00",
        photoType: "frontal",
        imageUrl: "",
        thumbnailUrl: "",
        notes: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPhoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleViewPhoto = (photo: ProgressPhoto) => {
    setViewingPhoto(photo);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingPhoto(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Em produção, isso seria feito no backend
      // Por enquanto, criamos uma URL local temporária
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setFormData({
          ...formData,
          imageUrl: result,
          thumbnailUrl: result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl) {
      alert("Selecione uma imagem");
      return;
    }

    if (editingPhoto) {
      setPhotos(
        photos.map((p) =>
          p.id === editingPhoto.id
            ? { ...p, ...formData, updatedAt: new Date().toISOString() }
            : p
        )
      );
    } else {
      const newPhoto: ProgressPhoto = {
        ...formData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setPhotos([...photos, newPhoto]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta foto?")) {
      setPhotos(photos.filter((p) => p.id !== id));
    }
  };

  const handleStartCompare = () => {
    if (filteredPhotos.length >= 2) {
      // Seleciona as duas fotos mais antigas e mais recentes do mesmo tipo
      const frontalPhotos = filteredPhotos.filter((p) => p.photoType === "frontal");
      if (frontalPhotos.length >= 2) {
        const sorted = [...frontalPhotos].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        setComparingPhotos([sorted[0], sorted[sorted.length - 1]]);
        setIsCompareModalOpen(true);
      } else {
        alert("Adicione pelo menos 2 fotos frontais para comparar");
      }
    } else {
      alert("Adicione pelo menos 2 fotos para comparar");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Fotos de Progresso</h1>
          <p className="text-slate-400">Documente sua transformação visual</p>
        </div>
        <div className="flex gap-2">
          {filteredPhotos.length >= 2 && (
            <button
              onClick={handleStartCompare}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
            >
              <GitCompare size={20} />
              Comparar
            </button>
          )}
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium hover:from-orange-600 hover:to-red-700 transition-all shadow-lg shadow-orange-500/20"
          >
            <Upload size={20} />
            Upload Foto
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por data ou notas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          />
        </div>
        <div className="relative">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="pl-4 pr-10 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50 appearance-none cursor-pointer min-w-[180px]"
          >
            <option value="todos">Todos os tipos</option>
            {Object.entries(photoTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "grid"
                ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                : "bg-slate-700/50 text-slate-400 hover:text-white"
            }`}
            title="Grid"
          >
            <Grid3x3 size={20} />
          </button>
          <button
            onClick={() => setViewMode("masonry")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "masonry"
                ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                : "bg-slate-700/50 text-slate-400 hover:text-white"
            }`}
            title="Masonry"
          >
            <Columns size={20} />
          </button>
        </div>
      </div>

      {/* Galeria */}
      {filteredPhotos.length === 0 ? (
        <div className="rounded-xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-12 text-center">
          <Camera className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg mb-2">
            {searchTerm || selectedType !== "todos" ? "Nenhuma foto encontrada" : "Nenhuma foto registrada"}
          </p>
          <p className="text-slate-500 text-sm">
            {searchTerm || selectedType !== "todos"
              ? "Tente ajustar os filtros"
              : "Comece documentando seu progresso"}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedPhotos).map(([month, monthPhotos]) => (
            <div key={month}>
              <h2 className="text-xl font-bold text-white mb-4 capitalize">{month}</h2>
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    : "columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4"
                }
              >
                {monthPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className={`rounded-xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 overflow-hidden hover:border-orange-500/50 transition-all group ${
                      viewMode === "masonry" ? "break-inside-avoid mb-4" : ""
                    }`}
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-slate-900">
                      <img
                        src={photo.thumbnailUrl || photo.imageUrl}
                        alt={`Foto ${photoTypeLabels[photo.photoType]} - ${formatDate(photo.date)}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-lg bg-gradient-to-r ${photoTypeColors[photo.photoType]} text-white`}
                        >
                          {photoTypeLabels[photo.photoType]}
                        </span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-sm font-medium">{formatDate(photo.date)}</p>
                        {photo.notes && (
                          <p className="text-white/80 text-xs mt-1 line-clamp-2">{photo.notes}</p>
                        )}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                        <button
                          onClick={() => handleViewPhoto(photo)}
                          className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                          title="Ver foto"
                        >
                          <Eye size={20} />
                        </button>
                        <button
                          onClick={() => handleOpenModal(photo)}
                          className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={20} />
                        </button>
                        <button
                          onClick={() => handleDelete(photo.id)}
                          className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-white transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Upload/Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-xl bg-slate-800 border border-slate-700/50 shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700/50 p-4 sm:p-6 flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {editingPhoto ? "Editar Foto" : "Nova Foto"}
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
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Tipo de Foto *</label>
                  <select
                    required
                    value={formData.photoType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        photoType: e.target.value as ProgressPhoto["photoType"],
                      })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  >
                    {Object.entries(photoTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Imagem *</label>
                <div className="space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-500 file:text-white hover:file:bg-orange-600"
                  />
                  {formData.imageUrl && (
                    <div className="relative rounded-lg overflow-hidden border border-slate-600/50">
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-full max-h-64 object-contain bg-slate-900"
                      />
                    </div>
                  )}
                  {!formData.imageUrl && (
                    <div className="flex flex-col items-center justify-center p-12 rounded-lg border-2 border-dashed border-slate-600/50 bg-slate-700/20">
                      <ImageIcon className="w-12 h-12 text-slate-500 mb-3" />
                      <p className="text-slate-400 text-sm">Selecione uma imagem</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Notas</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none"
                  placeholder="Observações sobre esta foto..."
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
                  {editingPhoto ? "Salvar Alterações" : "Upload Foto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Visualização */}
      {isViewModalOpen && viewingPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col">
            <button
              onClick={handleCloseViewModal}
              className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-black/50 hover:bg-black/70 text-white transition-colors"
            >
              <X size={24} />
            </button>
            <div className="flex-1 overflow-auto rounded-lg">
              <img
                src={viewingPhoto.imageUrl}
                alt={`Foto ${photoTypeLabels[viewingPhoto.photoType]} - ${formatDate(viewingPhoto.date)}`}
                className="w-full h-auto object-contain"
              />
            </div>
            <div className="p-6 bg-slate-800 border-t border-slate-700/50">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {photoTypeLabels[viewingPhoto.photoType]}
                  </h3>
                  <p className="text-slate-400">{formatDate(viewingPhoto.date)}</p>
                </div>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-lg bg-gradient-to-r ${photoTypeColors[viewingPhoto.photoType]} text-white`}
                >
                  {photoTypeLabels[viewingPhoto.photoType]}
                </span>
              </div>
              {viewingPhoto.notes && (
                <p className="text-slate-300 mt-3">{viewingPhoto.notes}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Comparação */}
      {isCompareModalOpen && comparingPhotos.length === 2 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="relative w-full max-w-6xl max-h-[90vh] flex flex-col">
            <button
              onClick={() => setIsCompareModalOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-black/50 hover:bg-black/70 text-white transition-colors"
            >
              <X size={24} />
            </button>
            <div className="p-6 bg-slate-800 border-b border-slate-700/50">
              <h3 className="text-2xl font-bold text-white mb-2">Comparação de Progresso</h3>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span>{formatDate(comparingPhotos[0].date)}</span>
                <span className="text-orange-400">→</span>
                <span>{formatDate(comparingPhotos[1].date)}</span>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4 p-6 overflow-auto">
              <div className="space-y-2">
                <p className="text-slate-400 text-sm text-center">
                  {formatDate(comparingPhotos[0].date)}
                </p>
                <div className="rounded-lg overflow-hidden border border-slate-700/50">
                  <img
                    src={comparingPhotos[0].imageUrl}
                    alt="Antes"
                    className="w-full h-auto object-contain bg-slate-900"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-slate-400 text-sm text-center">
                  {formatDate(comparingPhotos[1].date)}
                </p>
                <div className="rounded-lg overflow-hidden border border-slate-700/50">
                  <img
                    src={comparingPhotos[1].imageUrl}
                    alt="Depois"
                    className="w-full h-auto object-contain bg-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
