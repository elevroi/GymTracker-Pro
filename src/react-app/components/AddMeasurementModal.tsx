import { useState, useCallback } from "react";
import { X } from "lucide-react";
import { ProfileMeasurementFormSchema, type ProfileMeasurementForm } from "@/shared/types";

export interface MeasurementRow {
  id: string;
  date: string;
  waist: number | undefined;
  chest: number | undefined;
  arm: number | undefined;
}

interface AddMeasurementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { date: string; waistCm?: number; chestCm?: number; armCm?: number }) => void;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function AddMeasurementModal({ isOpen, onClose, onSave }: AddMeasurementModalProps) {
  const [date, setDate] = useState(todayISO());
  const [waistCm, setWaistCm] = useState<string>("");
  const [chestCm, setChestCm] = useState<string>("");
  const [armCm, setArmCm] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setDate(todayISO());
    setWaistCm("");
    setChestCm("");
    setArmCm("");
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) handleClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const waist = waistCm === "" ? undefined : Number(waistCm);
    const chest = chestCm === "" ? undefined : Number(chestCm);
    const arm = armCm === "" ? undefined : Number(armCm);
    const result = ProfileMeasurementFormSchema.safeParse({
      date,
      waistCm: waist,
      chestCm: chest,
      armCm: arm,
    } as ProfileMeasurementForm);
    if (!result.success) {
      setError(result.error.errors[0]?.message ?? "Dados inválidos.");
      return;
    }
    onSave({
      date: result.data.date,
      waistCm: result.data.waistCm,
      chestCm: result.data.chestCm,
      armCm: result.data.armCm,
    });
    handleClose();
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="w-full max-w-md rounded-2xl bg-slate-800 border border-slate-700/50 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-700/50">
          <h2 id="modal-title" className="text-lg font-semibold text-white">
            Adicionar medição
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-colors"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {error && (
            <div
              role="alert"
              className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
            >
              {error}
            </div>
          )}
          <div>
            <label htmlFor="measure-date" className="block text-sm font-medium text-slate-300 mb-1">
              Data
            </label>
            <input
              id="measure-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-slate-900/60 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>
          <div>
            <label htmlFor="measure-waist" className="block text-sm font-medium text-slate-300 mb-1">
              Cintura (cm)
            </label>
            <input
              id="measure-waist"
              type="number"
              min="0"
              step="0.1"
              value={waistCm}
              onChange={(e) => setWaistCm(e.target.value)}
              placeholder="Opcional"
              className="w-full px-4 py-2 rounded-lg bg-slate-900/60 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>
          <div>
            <label htmlFor="measure-chest" className="block text-sm font-medium text-slate-300 mb-1">
              Peito (cm)
            </label>
            <input
              id="measure-chest"
              type="number"
              min="0"
              step="0.1"
              value={chestCm}
              onChange={(e) => setChestCm(e.target.value)}
              placeholder="Opcional"
              className="w-full px-4 py-2 rounded-lg bg-slate-900/60 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>
          <div>
            <label htmlFor="measure-arm" className="block text-sm font-medium text-slate-300 mb-1">
              Braço (cm)
            </label>
            <input
              id="measure-arm"
              type="number"
              min="0"
              step="0.1"
              value={armCm}
              onChange={(e) => setArmCm(e.target.value)}
              placeholder="Opcional"
              className="w-full px-4 py-2 rounded-lg bg-slate-900/60 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>
          <p className="text-xs text-slate-400">Preencha pelo menos uma medida.</p>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2 px-4 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
