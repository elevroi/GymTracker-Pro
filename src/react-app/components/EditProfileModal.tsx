import { useState, useCallback, useEffect } from "react";
import { X } from "lucide-react";
import type { User, UserProfile } from "@/shared/types";
import { UserProfileSchema } from "@/shared/types";

const GOAL_OPTIONS = [
  { value: "emagrecer", label: "Emagrecimento" },
  { value: "ganhar_massa", label: "Hipertrofia" },
  { value: "condicionamento", label: "Condicionamento" },
  { value: "forca", label: "Força" },
  { value: "outros", label: "Outros" },
];

const PLAN_OPTIONS = [
  { value: "active", label: "Ativo" },
  { value: "late", label: "Em atraso" },
  { value: "inactive", label: "Inativo" },
];

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (user: User) => void;
}

export default function EditProfileModal({ isOpen, onClose, user, onSave }: EditProfileModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [goal, setGoal] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [weightGoal, setWeightGoal] = useState<string>("");
  const [weeklyFrequency, setWeeklyFrequency] = useState<string>("");
  const [planStatus, setPlanStatus] = useState<string>("active");
  const [notes, setNotes] = useState("");
  const [injuries, setInjuries] = useState("");
  const [error, setError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    if (!user) return;
    setName(user.name);
    setEmail(user.email);
    const p = user.profile;
    setGoal(p?.goal ?? "");
    setHeight(p?.height != null ? String(p.height) : "");
    setWeightGoal((p as { weightGoal?: number })?.weightGoal != null ? String((p as { weightGoal?: number }).weightGoal) : "");
    setWeeklyFrequency((p as { weeklyFrequency?: number })?.weeklyFrequency != null ? String((p as { weeklyFrequency?: number }).weeklyFrequency) : "");
    setPlanStatus((p as { planStatus?: string })?.planStatus ?? "active");
    setNotes((p as { notes?: string })?.notes ?? "");
    setInjuries(Array.isArray((p as { injuries?: string[] })?.injuries) ? (p as { injuries?: string[] }).injuries!.join(", ") : "");
    setError(null);
  }, [user]);

  useEffect(() => {
    if (isOpen && user) resetForm();
  }, [isOpen, user, resetForm]);

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!user) return;
    const profileResult = UserProfileSchema.safeParse({
      goal: goal || undefined,
      height: height ? Number(height) : undefined,
      weightGoal: weightGoal ? Number(weightGoal) : undefined,
      weeklyFrequency: weeklyFrequency ? Number(weeklyFrequency) : undefined,
      planStatus: planStatus as UserProfile["planStatus"],
      notes: notes.trim() || undefined,
      injuries: injuries.trim() ? injuries.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
    });
    if (!profileResult.success) {
      setError(profileResult.error.errors[0]?.message ?? "Dados inválidos.");
      return;
    }
    if (!name.trim()) {
      setError("Nome é obrigatório.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setError("E-mail inválido.");
      return;
    }
    const updatedUser: User = {
      ...user,
      name: name.trim(),
      email: email.trim(),
      profile: { ...user.profile, ...profileResult.data },
    };
    await onSave(updatedUser);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-800 border border-slate-700/50 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between p-4 sm:p-6 border-b border-slate-700/50 bg-slate-800 z-10">
          <h2 id="edit-profile-title" className="text-lg font-semibold text-white">
            Editar perfil
          </h2>
          <button
            type="button"
            onClick={onClose}
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
            <label htmlFor="edit-name" className="block text-sm font-medium text-slate-300 mb-1">
              Nome
            </label>
            <input
              id="edit-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-slate-900/60 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              placeholder="Seu nome"
            />
          </div>
          <div>
            <label htmlFor="edit-email" className="block text-sm font-medium text-slate-300 mb-1">
              E-mail
            </label>
            <input
              id="edit-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-slate-900/60 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label htmlFor="edit-goal" className="block text-sm font-medium text-slate-300 mb-1">
              Objetivo
            </label>
            <select
              id="edit-goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-slate-900/60 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            >
              <option value="">Selecione</option>
              {GOAL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="edit-plan" className="block text-sm font-medium text-slate-300 mb-1">
              Status do plano
            </label>
            <select
              id="edit-plan"
              value={planStatus}
              onChange={(e) => setPlanStatus(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-slate-900/60 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            >
              {PLAN_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-height" className="block text-sm font-medium text-slate-300 mb-1">
                Altura (cm)
              </label>
              <input
                id="edit-height"
                type="number"
                min="0"
                step="1"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="Ex: 175"
                className="w-full px-4 py-2 rounded-lg bg-slate-900/60 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>
            <div>
              <label htmlFor="edit-weight-goal" className="block text-sm font-medium text-slate-300 mb-1">
                Meta de peso (kg)
              </label>
              <input
                id="edit-weight-goal"
                type="number"
                min="0"
                step="0.1"
                value={weightGoal}
                onChange={(e) => setWeightGoal(e.target.value)}
                placeholder="Ex: 78"
                className="w-full px-4 py-2 rounded-lg bg-slate-900/60 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>
          </div>
          <div>
            <label htmlFor="edit-frequency" className="block text-sm font-medium text-slate-300 mb-1">
              Frequência semanal (treinos)
            </label>
            <input
              id="edit-frequency"
              type="number"
              min="0"
              max="7"
              value={weeklyFrequency}
              onChange={(e) => setWeeklyFrequency(e.target.value)}
              placeholder="Ex: 4"
              className="w-full px-4 py-2 rounded-lg bg-slate-900/60 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>
          <div>
            <label htmlFor="edit-notes" className="block text-sm font-medium text-slate-300 mb-1">
              Notas
            </label>
            <textarea
              id="edit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Observações gerais"
              className="w-full px-4 py-2 rounded-lg bg-slate-900/60 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none"
            />
          </div>
          <div>
            <label htmlFor="edit-injuries" className="block text-sm font-medium text-slate-300 mb-1">
              Lesões / restrições (separadas por vírgula)
            </label>
            <input
              id="edit-injuries"
              type="text"
              value={injuries}
              onChange={(e) => setInjuries(e.target.value)}
              placeholder="Ex: joelho direito, lombar"
              className="w-full px-4 py-2 rounded-lg bg-slate-900/60 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
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
