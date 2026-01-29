import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, Check } from "lucide-react";
import { useAuth } from "@/react-app/context/AuthContext";
import { supabase } from "@/react-app/lib/supabase";
import { isSupabaseConfigured } from "@/react-app/lib/supabase";
import type { AnamnesisAnswers } from "@/shared/types";

interface InputScreen {
  type: "input";
  key: string;
  label: string;
  inputType: "text" | "email" | "tel" | "date";
  placeholder?: string;
}

interface RadioScreen {
  type: "radio";
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

interface TermsScreen {
  type: "terms";
  keys: ["declareTruth", "authorizeDataUse", "awareOfHealthChanges"];
  labels: [string, string, string];
}

type Screen = InputScreen | RadioScreen | TermsScreen;

const DADOS_PESSOAIS: InputScreen[] = [
  { type: "input", key: "fullName", label: "Qual é o seu nome completo?", inputType: "text", placeholder: "Digite seu nome" },
  { type: "input", key: "birthDate", label: "Data de nascimento", inputType: "date" },
  { type: "input", key: "age", label: "Idade", inputType: "text", placeholder: "Ex: 28" },
  { type: "input", key: "gender", label: "Sexo", inputType: "text", placeholder: "Ex: M ou F" },
  { type: "input", key: "height", label: "Altura (cm)", inputType: "text", placeholder: "Ex: 175" },
  { type: "input", key: "currentWeight", label: "Peso atual (kg)", inputType: "text", placeholder: "Ex: 70" },
  { type: "input", key: "profession", label: "Profissão", inputType: "text", placeholder: "Ex: Professor" },
  { type: "input", key: "maritalStatus", label: "Estado civil", inputType: "text", placeholder: "Ex: Solteiro(a)" },
  { type: "input", key: "phone", label: "Telefone / WhatsApp", inputType: "tel", placeholder: "(00) 00000-0000" },
  { type: "input", key: "email", label: "E-mail", inputType: "email", placeholder: "seu@email.com" },
];

const SCREENS: Screen[] = [
  ...DADOS_PESSOAIS,
  { type: "radio", key: "mainGoal", label: "Qual é seu principal objetivo?", options: [
    { value: "emagrecimento", label: "Emagrecimento" },
    { value: "ganho_massa", label: "Ganho de massa muscular" },
    { value: "definicao", label: "Definição" },
    { value: "condicionamento", label: "Condicionamento físico" },
    { value: "saude", label: "Saúde / qualidade de vida" },
    { value: "reabilitacao", label: "Reabilitação" },
  ]},
  { type: "radio", key: "goalDeadline", label: "Você tem algum prazo ou meta específica?", options: [
    { value: "curto", label: "Sim – curto prazo (até 3 meses)" },
    { value: "medio", label: "Sim – médio prazo (3 a 6 meses)" },
    { value: "longo", label: "Sim – longo prazo (mais de 6 meses)" },
    { value: "nao_definido", label: "Não tenho prazo definido" },
  ]},
  { type: "radio", key: "trainedBefore", label: "Você já treinou antes?", options: [
    { value: "nunca", label: "Nunca treinei" },
    { value: "menos_6m", label: "Já treinei por menos de 6 meses" },
    { value: "6m_1ano", label: "Já treinei entre 6 meses e 1 ano" },
    { value: "mais_1ano", label: "Já treinei por mais de 1 ano" },
  ]},
  { type: "radio", key: "motivation", label: "O que te motivou a começar agora?", options: [
    { value: "saude", label: "Saúde" },
    { value: "estetica", label: "Estética" },
    { value: "qualidade_vida", label: "Qualidade de vida" },
    { value: "recomendacao_medica", label: "Recomendação médica" },
    { value: "autoestima", label: "Autoestima" },
    { value: "outro", label: "Outro motivo" },
  ]},
  { type: "radio", key: "diagnosedDisease", label: "Você possui alguma doença diagnosticada?", options: [
    { value: "nao", label: "Não" },
    { value: "cardiovascular", label: "Sim – cardiovascular" },
    { value: "metabolica", label: "Sim – metabólica (diabetes, colesterol, etc.)" },
    { value: "respiratoria", label: "Sim – respiratória" },
    { value: "outra", label: "Sim – outra" },
  ]},
  { type: "radio", key: "medicalFollowUp", label: "Você faz acompanhamento médico atualmente?", options: [
    { value: "nao", label: "Não" },
    { value: "clinico", label: "Sim – clínico geral" },
    { value: "cardiologista", label: "Sim – cardiologista" },
    { value: "endocrinologista", label: "Sim – endocrinologista" },
    { value: "outro", label: "Sim – outro" },
  ]},
  { type: "radio", key: "surgery", label: "Você já realizou alguma cirurgia?", options: [
    { value: "nao", label: "Não" },
    { value: "menos_1ano", label: "Sim – há menos de 1 ano" },
    { value: "1_5anos", label: "Sim – entre 1 e 5 anos" },
    { value: "mais_5anos", label: "Sim – há mais de 5 anos" },
  ]},
  { type: "radio", key: "injuries", label: "Já teve lesões musculares ou articulares?", options: [
    { value: "nao", label: "Não" },
    { value: "coluna", label: "Sim – coluna" },
    { value: "joelho", label: "Sim – joelho" },
    { value: "ombro", label: "Sim – ombro" },
    { value: "tornozelo", label: "Sim – tornozelo" },
    { value: "outra", label: "Sim – outra" },
  ]},
  { type: "radio", key: "physicalLimitation", label: "Possui alguma limitação física atualmente?", options: [
    { value: "nao", label: "Não" },
    { value: "leve", label: "Sim – leve" },
    { value: "moderada", label: "Sim – moderada" },
    { value: "severa", label: "Sim – severa" },
  ]},
  { type: "radio", key: "continuousMedication", label: "Usa algum medicamento de forma contínua?", options: [
    { value: "nao", label: "Não" },
    { value: "pressao", label: "Sim – pressão arterial" },
    { value: "diabetes", label: "Sim – diabetes" },
    { value: "hormonios", label: "Sim – hormônios" },
    { value: "outro", label: "Sim – outro" },
  ]},
  { type: "radio", key: "hormonesUse", label: "Já utilizou ou utiliza hormônios/anabolizantes? (opcional e confidencial)", options: [
    { value: "nunca", label: "Nunca utilizei" },
    { value: "passado", label: "Já utilizei no passado" },
    { value: "atualmente", label: "Utilizo atualmente" },
    { value: "prefiro_nao_responder", label: "Prefiro não responder" },
  ]},
  { type: "radio", key: "medicalClearance", label: "Você já teve liberação médica para atividade física?", options: [
    { value: "sim", label: "Sim" },
    { value: "nao", label: "Não" },
    { value: "nao_sei", label: "Não sei" },
  ]},
  { type: "radio", key: "mealsPerDay", label: "Quantas refeições você faz por dia?", options: [
    { value: "1_2", label: "1 a 2" },
    { value: "3", label: "3" },
    { value: "4", label: "4" },
    { value: "5_mais", label: "5 ou mais" },
  ]},
  { type: "radio", key: "fastFood", label: "Você costuma consumir fast food?", options: [
    { value: "nunca", label: "Nunca" },
    { value: "raramente", label: "Raramente" },
    { value: "1_2_semana", label: "1 a 2 vezes por semana" },
    { value: "3_mais_semana", label: "3 vezes ou mais por semana" },
  ]},
  { type: "radio", key: "waterIntake", label: "Você bebe água regularmente?", options: [
    { value: "menos_1l", label: "Menos de 1 litro/dia" },
    { value: "1_2l", label: "Entre 1 e 2 litros/dia" },
    { value: "mais_2l", label: "Mais de 2 litros/dia" },
  ]},
  { type: "radio", key: "sleepHours", label: "Quantas horas você dorme por noite?", options: [
    { value: "menos_5h", label: "Menos de 5 horas" },
    { value: "5_6h", label: "5 a 6 horas" },
    { value: "7_8h", label: "7 a 8 horas" },
    { value: "mais_8h", label: "Mais de 8 horas" },
  ]},
  { type: "radio", key: "stressFrequency", label: "Você se sente estressado(a) com frequência?", options: [
    { value: "nunca", label: "Nunca" },
    { value: "raramente", label: "Raramente" },
    { value: "as_vezes", label: "Às vezes" },
    { value: "frequentemente", label: "Frequentemente" },
  ]},
  { type: "radio", key: "alcoholFrequency", label: "Você consome bebida alcoólica?", options: [
    { value: "nao", label: "Não consumo" },
    { value: "raramente", label: "Raramente" },
    { value: "1_2_semana", label: "1 a 2 vezes por semana" },
    { value: "3_mais_semana", label: "3 vezes ou mais por semana" },
  ]},
  { type: "radio", key: "daysPerWeek", label: "Quantos dias por semana você pode treinar?", options: [
    { value: "1_2", label: "1 a 2 dias" },
    { value: "3", label: "3 dias" },
    { value: "4", label: "4 dias" },
    { value: "5_mais", label: "5 dias ou mais" },
  ]},
  { type: "radio", key: "timePerWorkout", label: "Quanto tempo você tem disponível por treino?", options: [
    { value: "ate_30min", label: "Até 30 minutos" },
    { value: "30_45min", label: "30 a 45 minutos" },
    { value: "45_60min", label: "45 a 60 minutos" },
    { value: "mais_60min", label: "Mais de 60 minutos" },
  ]},
  { type: "radio", key: "bestTime", label: "Qual o melhor horário para treinar?", options: [
    { value: "manha", label: "Manhã" },
    { value: "tarde", label: "Tarde" },
    { value: "noite", label: "Noite" },
    { value: "variavel", label: "Horário variável" },
  ]},
  { type: "radio", key: "recentPhysicalAssessment", label: "Você já realizou avaliação física recentemente?", options: [
    { value: "nao", label: "Não" },
    { value: "3_meses", label: "Sim – nos últimos 3 meses" },
    { value: "6_meses", label: "Sim – nos últimos 6 meses" },
    { value: "mais_6meses", label: "Sim – há mais de 6 meses" },
  ]},
  { type: "radio", key: "recentExams", label: "Você possui exames recentes?", options: [
    { value: "nao", label: "Não" },
    { value: "laboratoriais", label: "Sim – exames laboratoriais" },
    { value: "imagem", label: "Sim – exames de imagem" },
    { value: "ambos", label: "Sim – ambos" },
  ]},
  { type: "radio", key: "acceptEvolutionTracking", label: "Você aceita acompanhamento de evolução? (fotos, medidas e peso)", options: [
    { value: "sim", label: "Sim" },
    { value: "nao", label: "Não" },
    { value: "talvez", label: "Talvez" },
  ]},
  {
    type: "terms",
    keys: ["declareTruth", "authorizeDataUse", "awareOfHealthChanges"],
    labels: [
      "Declaro que as informações acima são verdadeiras.",
      "Autorizo o uso dos dados para acompanhamento físico.",
      "Estou ciente de que devo informar qualquer mudança de saúde.",
    ],
  },
];

const TOTAL_SCREENS = SCREENS.length;

export default function Anamnesis() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [screenIndex, setScreenIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingCompleted, setCheckingCompleted] = useState(true);
  const [transitionDir, setTransitionDir] = useState<"in" | "out">("in");

  const [form, setForm] = useState<AnamnesisAnswers & Record<string, unknown>>({
    fullName: "", birthDate: "", age: "", gender: "", height: "", currentWeight: "",
    profession: "", maritalStatus: "", phone: "", email: "",
    mainGoal: undefined, goalDeadline: undefined, trainedBefore: undefined, motivation: undefined,
    diagnosedDisease: undefined, medicalFollowUp: undefined, surgery: undefined,
    injuries: undefined, physicalLimitation: undefined,
    continuousMedication: undefined, hormonesUse: undefined, medicalClearance: undefined,
    mealsPerDay: undefined, fastFood: undefined, waterIntake: undefined,
    sleepHours: undefined, stressFrequency: undefined, alcoholFrequency: undefined,
    daysPerWeek: undefined, timePerWorkout: undefined, bestTime: undefined,
    recentPhysicalAssessment: undefined, recentExams: undefined, acceptEvolutionTracking: undefined,
    declareTruth: false, authorizeDataUse: false, awareOfHealthChanges: false,
  });

  useEffect(() => {
    if (!user?.id) {
      setCheckingCompleted(false);
      return;
    }
    if (!isSupabaseConfigured) {
      if (localStorage.getItem("anamnesis_completed") === user.id) navigate("/", { replace: true });
      setCheckingCompleted(false);
      return;
    }
    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      if (!cancelled) setCheckingCompleted(false);
    }, 8000);
    void (async () => {
      try {
        const { data, error: err } = await supabase
          .from("anamnesis")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
        if (cancelled) return;
        if (err) {
          setCheckingCompleted(false);
          return;
        }
        if (data) navigate("/", { replace: true });
        else setCheckingCompleted(false);
      } catch {
        if (!cancelled) setCheckingCompleted(false);
      }
    })();
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [user?.id, navigate]);

  useEffect(() => {
    if (user?.name) setForm((f) => ({ ...f, fullName: user.name }));
    if (user?.email) setForm((f) => ({ ...f, email: user.email }));
  }, [user?.name, user?.email]);

  if (!isAuthenticated && !authLoading) {
    navigate("/login", { replace: true });
    return null;
  }
  if (authLoading || checkingCompleted) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="text-slate-500 text-lg">Carregando...</div>
      </div>
    );
  }

  const update = (key: string, value: unknown) => {
    setForm((f) => ({ ...f, [key]: value }));
    setError(null);
  };

  const goNext = () => {
    setTransitionDir("out");
    setTimeout(() => {
      setScreenIndex((i) => Math.min(i + 1, TOTAL_SCREENS - 1));
      setTransitionDir("in");
    }, 150);
  };

  const goPrev = () => {
    setTransitionDir("out");
    setTimeout(() => {
      setScreenIndex((i) => Math.max(i - 1, 0));
      setTransitionDir("in");
    }, 150);
  };

  const handleRadioSelect = (key: string, value: string) => {
    update(key, value);
    const isLastScreen = screenIndex === TOTAL_SCREENS - 1;
    if (!isLastScreen) {
      setTimeout(goNext, 380);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    if (!form.declareTruth || !form.authorizeDataUse || !form.awareOfHealthChanges) {
      setError("É necessário aceitar os três termos para enviar a anamnese.");
      return;
    }
    if (!user?.id) return;
    setSaving(true);
    if (isSupabaseConfigured) {
      const { error: err } = await supabase.from("anamnesis").upsert(
        { user_id: user.id, answers: form, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );
      if (err) {
        setError(err.message);
        setSaving(false);
        return;
      }
    } else {
      localStorage.setItem("anamnesis_completed", user.id);
    }
    setSaving(false);
    navigate("/", { replace: true });
  };

  const progress = ((screenIndex + 1) / TOTAL_SCREENS) * 100;
  const screen = SCREENS[screenIndex];
  const isFirst = screenIndex === 0;
  const isLast = screenIndex === TOTAL_SCREENS - 1;

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col">
      {/* Barra de progresso fina – estilo Typeform */}
      <div className="h-1 w-full bg-white/10 flex-shrink-0">
        <div
          className="h-full bg-white transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-2xl mx-auto w-full">
        {error && (
          <div
            role="alert"
            className="mb-6 p-4 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-sm"
          >
            {error}
          </div>
        )}

        <div
          key={screenIndex}
          className={`w-full text-center transition-all duration-300 ease-out ${
            transitionDir === "in"
              ? "animate-[typeformIn_0.35s_ease-out] opacity-100"
              : "opacity-0 translate-y-2"
          }`}
          style={{ animationFillMode: "backwards" }}
        >
          {screen.type === "input" && (
            <>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-normal text-white leading-tight mb-8 md:mb-10">
                {screen.label}
              </h2>
              <input
                type={screen.inputType}
                value={(form[screen.key] as string) ?? ""}
                onChange={(e) => update(screen.key, e.target.value)}
                placeholder={screen.placeholder}
                autoFocus
                className="w-full max-w-md mx-auto px-0 py-3 md:py-4 bg-transparent border-0 border-b-2 border-white/30 text-white text-xl md:text-2xl placeholder-white/40 focus:outline-none focus:border-white focus:placeholder-white/60 transition-colors text-center md:text-left"
              />
            </>
          )}

          {screen.type === "radio" && (
            <>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-normal text-white leading-tight mb-8 md:mb-10">
                {screen.label}
              </h2>
              <div className="space-y-3 max-w-xl mx-auto">
                {screen.options.map(({ value, label }) => {
                  const selected = (form[screen.key] as string) === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleRadioSelect(screen.key, value)}
                      className={`w-full block text-left px-5 py-4 md:py-5 rounded-2xl border-2 text-lg md:text-xl transition-all duration-200 ${
                        selected
                          ? "bg-white text-[#0d0d0d] border-white"
                          : "bg-white/5 text-white border-white/20 hover:border-white/40 hover:bg-white/10"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {screen.type === "terms" && (
            <>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-normal text-white leading-tight mb-8 md:mb-10">
                Para finalizar, declare que concorda com os termos abaixo.
              </h2>
              <div className="space-y-4 max-w-xl mx-auto text-left">
                {screen.keys.map((key, i) => (
                  <label
                    key={key}
                    className="flex items-start gap-4 p-4 rounded-2xl border-2 border-white/20 hover:border-white/40 hover:bg-white/5 cursor-pointer transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={form[key] as boolean}
                      onChange={(e) => update(key, e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-2 border-white/40 bg-transparent text-white focus:ring-white/50"
                    />
                    <span className="text-lg text-white/90">{screen.labels[i]}</span>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Navegação */}
        <div className="mt-10 md:mt-14 w-full max-w-xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={goPrev}
            disabled={isFirst}
            className={`flex items-center gap-1 text-white/60 hover:text-white text-sm transition-colors ${
              isFirst ? "invisible" : ""
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            Anterior
          </button>

          {screen.type === "input" && !isLast && (
            <button
              type="button"
              onClick={goNext}
              className="px-6 py-2.5 rounded-full bg-white text-[#0d0d0d] font-medium text-sm hover:bg-white/90 transition-colors"
            >
              OK, próximo
            </button>
          )}

          {screen.type === "radio" && !isLast && (form[screen.key] as string) && (
            <button
              type="button"
              onClick={goNext}
              className="px-6 py-2.5 rounded-full bg-white text-[#0d0d0d] font-medium text-sm hover:bg-white/90 transition-colors"
            >
              Próximo
            </button>
          )}

          {isLast && screen.type === "terms" && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-[#0d0d0d] font-medium text-sm hover:bg-white/90 disabled:opacity-50 transition-colors"
            >
              {saving ? "Enviando..." : "Enviar"}
              <Check className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes typeformIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
