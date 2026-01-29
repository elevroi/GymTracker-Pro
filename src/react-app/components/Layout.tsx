import { Link, useLocation } from "react-router";
import { 
  LayoutDashboard, 
  Dumbbell, 
  ListTodo, 
  Ruler, 
  Camera, 
  FileText,
  Target,
  Lightbulb,
  Menu,
  X,
  LogOut,
  User,
  UserCircle
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/react-app/context/AuthContext";

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/workouts", label: "Treinos", icon: Dumbbell },
  { path: "/exercises", label: "Exercícios", icon: ListTodo },
  { path: "/metrics", label: "Medidas", icon: Ruler },
  { path: "/photos", label: "Fotos", icon: Camera },
  { path: "/goals", label: "Metas", icon: Target },
  { path: "/recommendations", label: "Recomendações", icon: Lightbulb },
  { path: "/reports", label: "Relatórios", icon: FileText },
  { path: "/profile", label: "Perfil", icon: UserCircle },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 text-slate-200 hover:bg-slate-700/80 transition-colors"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 sm:w-72 bg-slate-800/95 backdrop-blur-xl border-r border-slate-700/50 transform transition-transform duration-300 ease-in-out z-40 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:bg-slate-800/40`}
      >
        <div className="p-4 sm:p-6 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-8 sm:mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white">GymTracker</h1>
              <p className="text-xs text-slate-400">Pro</p>
            </div>
          </div>

          <nav className="space-y-2 sm:space-y-3 flex-1 overflow-y-auto py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl transition-all text-sm sm:text-base min-h-[44px] ${
                    isActive
                      ? "bg-gradient-to-r from-orange-500/20 to-red-600/20 text-orange-400 border border-orange-500/30 shadow-lg shadow-orange-500/10"
                      : "text-slate-300 hover:bg-slate-700/30 hover:text-white"
                  }`}
                >
                  <Icon size={20} className="sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 pt-6 border-t border-slate-700/50 space-y-3">
            {user && (
              <div className="p-3 sm:p-4 rounded-lg bg-slate-700/30 border border-slate-600/30 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <User size={18} className="text-orange-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={() => logout()}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/30 transition-all text-sm font-medium"
            >
              <LogOut size={18} />
              <span>Sair</span>
            </button>
            <div className="p-3 sm:p-4 rounded-lg bg-gradient-to-br from-slate-700/30 to-slate-800/30 border border-slate-600/30">
              <p className="text-xs text-slate-400 mb-1">Versão</p>
              <p className="text-sm font-semibold text-white">1.0.0</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content: no desktop, largura = viewport menos sidebar (18rem) para evitar faixa cinza à direita */}
      <main className="min-h-screen w-full lg:ml-72 lg:w-[calc(100%-18rem)]">
        <div className="px-5 pt-16 pb-5 sm:px-6 sm:pb-6 lg:pt-8 lg:pb-8 lg:px-10">
          {children}
        </div>
      </main>
    </div>
  );
}
