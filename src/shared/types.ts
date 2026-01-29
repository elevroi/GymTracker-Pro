import z from "zod";

/**
 * Types shared between the client and server go here.
 */

// --- Autenticação e usuário (aluno da academia) ---

export const UserProfileSchema = z.object({
  birthDate: z.string().optional(),
  height: z.number().min(0).optional(),
  goal: z.enum(["emagrecer", "ganhar_massa", "condicionamento", "forca", "outros"]).optional(),
  gender: z.enum(["M", "F", "outro"]).optional(),
  avatarUrl: z.string().url().optional(),
  planStatus: z.enum(["active", "late", "inactive"]).optional(),
  weightGoal: z.number().min(0).optional(),
  weeklyFrequency: z.number().int().min(0).optional(),
  notes: z.string().optional(),
  injuries: z.array(z.string()).optional(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().min(1, "Nome é obrigatório"),
  createdAt: z.string(),
  profile: UserProfileSchema.optional(),
});

export type User = z.infer<typeof UserSchema>;

export const AuthSessionSchema = z.object({
  user: UserSchema,
  token: z.string(),
  expiresAt: z.string(), // ISO date
});

export type AuthSession = z.infer<typeof AuthSessionSchema>;

export const LoginFormSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export type LoginForm = z.infer<typeof LoginFormSchema>;

export const RegisterFormSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
  profile: UserProfileSchema.optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export type RegisterForm = z.infer<typeof RegisterFormSchema>;

export const ExerciseSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  category: z.enum(["peito", "costas", "ombros", "braços", "pernas", "abdômen", "cardio", "outros"]),
  muscleGroups: z.array(z.string()),
  equipment: z.enum(["barra", "halteres", "máquina", "peso_livre", "corpo", "cabo", "outros"]),
  difficulty: z.enum(["iniciante", "intermediário", "avançado"]),
  instructions: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Exercise = z.infer<typeof ExerciseSchema>;

export const ExerciseFormSchema = ExerciseSchema.omit({ id: true, createdAt: true, updatedAt: true });
export type ExerciseForm = z.infer<typeof ExerciseFormSchema>;

export const WorkoutSetSchema = z.object({
  id: z.string(),
  weight: z.number().min(0, "Peso deve ser maior ou igual a 0"),
  reps: z.number().int().min(1, "Repetições deve ser pelo menos 1"),
  restSeconds: z.number().int().min(0).optional(),
  notes: z.string().optional(),
});

export type WorkoutSet = z.infer<typeof WorkoutSetSchema>;

export const WorkoutExerciseSchema = z.object({
  id: z.string(),
  exerciseId: z.string(),
  exerciseName: z.string(),
  sets: z.array(WorkoutSetSchema).min(1, "Adicione pelo menos uma série"),
  notes: z.string().optional(),
});

export type WorkoutExercise = z.infer<typeof WorkoutExerciseSchema>;

export const WorkoutSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome do treino é obrigatório"),
  date: z.string(),
  duration: z.number().int().min(0).optional(), // em minutos
  exercises: z.array(WorkoutExerciseSchema).min(1, "Adicione pelo menos um exercício"),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Workout = z.infer<typeof WorkoutSchema>;

export const WorkoutFormSchema = WorkoutSchema.omit({ id: true, createdAt: true, updatedAt: true });
export type WorkoutForm = z.infer<typeof WorkoutFormSchema>;

export const BodyMeasurementSchema = z.object({
  id: z.string(),
  date: z.string(),
  weight: z.number().min(0, "Peso deve ser maior ou igual a 0").optional(),
  height: z.number().min(0, "Altura deve ser maior que 0").optional(),
  chest: z.number().min(0).optional(),
  waist: z.number().min(0).optional(),
  hips: z.number().min(0).optional(),
  leftArm: z.number().min(0).optional(),
  rightArm: z.number().min(0).optional(),
  leftThigh: z.number().min(0).optional(),
  rightThigh: z.number().min(0).optional(),
  neck: z.number().min(0).optional(),
  shoulder: z.number().min(0).optional(),
  bodyFatPercent: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type BodyMeasurement = z.infer<typeof BodyMeasurementSchema>;

export const BodyMeasurementFormSchema = BodyMeasurementSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type BodyMeasurementForm = z.infer<typeof BodyMeasurementFormSchema>;

/** Formulário do modal "Adicionar medição" no perfil: pelo menos um campo de medida obrigatório. */
export const ProfileMeasurementFormSchema = z
  .object({
    date: z.string().min(1, "Data é obrigatória"),
    waistCm: z.number().min(0, "Deve ser ≥ 0").optional(),
    chestCm: z.number().min(0, "Deve ser ≥ 0").optional(),
    armCm: z.number().min(0, "Deve ser ≥ 0").optional(),
  })
  .refine(
    (data) =>
      (data.waistCm !== undefined && data.waistCm > 0) ||
      (data.chestCm !== undefined && data.chestCm > 0) ||
      (data.armCm !== undefined && data.armCm > 0),
    { message: "Preencha pelo menos uma medida (cintura, peito ou braço)", path: ["waistCm"] }
  );
export type ProfileMeasurementForm = z.infer<typeof ProfileMeasurementFormSchema>;

export const ProgressPhotoSchema = z.object({
  id: z.string(),
  date: z.string(),
  photoType: z.enum(["frontal", "lateral_esquerda", "lateral_direita", "posterior", "outros"]),
  imageUrl: z.string().url("URL da imagem inválida"),
  thumbnailUrl: z.string().url("URL da miniatura inválida").optional(),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ProgressPhoto = z.infer<typeof ProgressPhotoSchema>;

export const ProgressPhotoFormSchema = ProgressPhotoSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type ProgressPhotoForm = z.infer<typeof ProgressPhotoFormSchema>;

export const GoalSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  goalType: z.enum(["peso", "medida", "exercicio", "volume", "frequencia", "outros"]),
  targetValue: z.number().min(0, "Valor alvo deve ser maior ou igual a 0"),
  currentValue: z.number().min(0).optional(),
  unit: z.string().default(""),
  targetDate: z.string(),
  status: z.enum(["ativa", "concluida", "pausada", "cancelada"]),
  exerciseId: z.string().optional(), // Para metas de exercício específico
  exerciseName: z.string().optional(),
  measurementType: z.string().optional(), // Para metas de medida específica (ex: "chest", "waist")
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Goal = z.infer<typeof GoalSchema>;

export const GoalFormSchema = GoalSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type GoalForm = z.infer<typeof GoalFormSchema>;

// --- Anamnese (questionário pós-cadastro) - apenas escolhas (radio/select/checkbox) ---

export const AnamnesisAnswersSchema = z.object({
  // 1. Dados Pessoais (mantido com inputs)
  fullName: z.string().optional(),
  birthDate: z.string().optional(),
  age: z.string().optional(),
  gender: z.string().optional(),
  height: z.string().optional(),
  currentWeight: z.string().optional(),
  profession: z.string().optional(),
  maritalStatus: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  // 2. Objetivos – escolhas
  mainGoal: z.enum(["emagrecimento", "ganho_massa", "definicao", "condicionamento", "saude", "reabilitacao"]).optional(),
  goalDeadline: z.string().optional(), // curto | medio | longo | nao_definido
  trainedBefore: z.string().optional(), // nunca | menos_6m | 6m_1ano | mais_1ano
  motivation: z.string().optional(), // saude | estetica | qualidade_vida | recomendacao_medica | autoestima | outro
  // 3. Saúde geral – escolhas
  diagnosedDisease: z.string().optional(), // nao | cardiovascular | metabolica | respiratoria | outra
  medicalFollowUp: z.string().optional(), // nao | clinico | cardiologista | endocrinologista | outro
  surgery: z.string().optional(), // nao | menos_1ano | 1_5anos | mais_5anos
  // 4. Lesões e limitações – escolhas
  injuries: z.string().optional(), // nao | coluna | joelho | ombro | tornozelo | outra
  physicalLimitation: z.string().optional(), // nao | leve | moderada | severa
  // 5. Medicamentos e hormônios – escolhas
  continuousMedication: z.string().optional(), // nao | pressao | diabetes | hormonios | outro
  hormonesUse: z.string().optional(), // nunca | passado | atualmente | prefiro_nao_responder
  medicalClearance: z.string().optional(), // sim | nao | nao_sei
  // 6. Alimentação e hidratação – escolhas
  mealsPerDay: z.string().optional(), // 1_2 | 3 | 4 | 5_mais
  fastFood: z.string().optional(), // nunca | raramente | 1_2_semana | 3_mais_semana
  waterIntake: z.string().optional(), // menos_1l | 1_2l | mais_2l
  // 7. Sono e estresse – escolhas
  sleepHours: z.string().optional(), // menos_5h | 5_6h | 7_8h | mais_8h
  stressFrequency: z.string().optional(), // nunca | raramente | as_vezes | frequentemente
  alcoholFrequency: z.string().optional(), // nao | raramente | 1_2_semana | 3_mais_semana
  // 8. Disponibilidade para treinos – escolhas
  daysPerWeek: z.string().optional(), // 1_2 | 3 | 4 | 5_mais
  timePerWorkout: z.string().optional(), // ate_30min | 30_45min | 45_60min | mais_60min
  bestTime: z.string().optional(), // manha | tarde | noite | variavel
  // 9. Acompanhamento e avaliação – escolhas
  recentPhysicalAssessment: z.string().optional(), // nao | 3_meses | 6_meses | mais_6meses
  recentExams: z.string().optional(), // nao | laboratoriais | imagem | ambos
  acceptEvolutionTracking: z.string().optional(), // sim | nao | talvez
  // 10. Termos
  declareTruth: z.boolean().optional(),
  authorizeDataUse: z.boolean().optional(),
  awareOfHealthChanges: z.boolean().optional(),
}).passthrough();

export type AnamnesisAnswers = z.infer<typeof AnamnesisAnswersSchema>;

export const AnamnesisFormSchema = AnamnesisAnswersSchema.refine(
  (data) => data.declareTruth === true && data.authorizeDataUse === true && data.awareOfHealthChanges === true,
  { message: "É necessário aceitar os três termos para enviar a anamnese.", path: ["declareTruth"] }
);

export type AnamnesisForm = z.infer<typeof AnamnesisFormSchema>;
