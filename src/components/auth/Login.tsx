import { useState } from "react";
import { Mail, Lock, LogIn, Eye, EyeOff, ShoppingCart, Apple, Carrot, Fish, Package, Beef } from "lucide-react";
import { useAuthStore } from "../../store/auth.store";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const { login, loading, error } = useAuthStore();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email, password });
    const { user } = useAuthStore.getState();
    if (user) navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-900 dark:to-neutral-800 flex">
      
      {/* Left Panel - Login Form */}
      <div className="w-full lg:w-5/12 flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-md">
          
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-600/30">
              <ShoppingCart className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Supply</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Supermercado</p>
            </div>
          </div>

          {/* Title */}
          <div className="mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Iniciar Sesión
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-neutral-800 border-2 border-gray-200 dark:border-neutral-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all"
                  
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 bg-white dark:bg-neutral-800 border-2 border-gray-200 dark:border-neutral-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all"
                 
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <div className="w-5 h-5 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold">!</span>
                </div>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3.5 rounded-xl font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-teal-600/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-6"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Iniciar Sesión</span>
                </>
              )}
            </button>
          </form>

        </div>
      </div>

      {/* Right Panel - Illustration */}
      <div className="hidden lg:flex lg:w-7/12 bg-gradient-to-br from-teal-600 to-teal-700 relative overflow-hidden">
        
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 border-4 border-white rounded-full"></div>
          <div className="absolute bottom-32 right-32 w-40 h-40 border-4 border-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 border-4 border-white rounded-full"></div>
          <div className="absolute top-1/3 right-1/4 w-28 h-28 border-4 border-white rounded-full"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white">
          
          {/* Main Illustration Area */}
          <div className="mb-12">
            <div className="relative">
              {/* Shopping Cart Illustration */}
              <div className="w-72 h-72 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/20 shadow-2xl">
                <ShoppingCart className="w-32 h-32 text-white/90" strokeWidth={1.5} />
              </div>
              
              {/* Floating Product Icons */}
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30 animate-bounce shadow-xl">
                <Apple className="w-10 h-10 text-white" />
              </div>
              
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30 shadow-xl" style={{ animationDelay: '0.2s' }}>
                <Carrot className="w-10 h-10 text-white animate-bounce" />
              </div>
              
              <div className="absolute top-1/4 -left-12 w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30 shadow-xl" style={{ animationDelay: '0.4s' }}>
                <Fish className="w-8 h-8 text-white animate-bounce" />
              </div>
              
              <div className="absolute bottom-1/4 -right-12 w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30 shadow-xl" style={{ animationDelay: '0.6s' }}>
                <Beef className="w-8 h-8 text-white animate-bounce" />
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="text-center max-w-lg">
            <h2 className="text-4xl font-bold mb-4">
              Bienvenido a Supply
            </h2>
            <p className="text-xl text-teal-50 mb-8">
              Tu supermercado digital, gestiona tu inventario y ventas de manera eficiente
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-sm mb-1">Control de Inventario</h3>
                <p className="text-xs text-teal-100">Gestión precisa de productos</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-sm mb-1">Ventas Rápidas</h3>
                <p className="text-xs text-teal-100">Procesa ventas al instante</p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}