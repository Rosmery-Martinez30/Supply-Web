import { useState, useEffect } from "react";
import {
  ShoppingCart,
  Package,
  Truck,
  TrendingUp,
  Users,
  LogOut,
  LayoutDashboard,
  Folder,
  UserCheck,
  Menu,
  X,
  Moon,
  Sun,
} from "lucide-react";
import { useAuthStore } from "../../store/auth.store";
import { useNavigate, Outlet, useLocation } from "react-router-dom";

const Navbar = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeItem, setActiveItem] = useState(location.pathname);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });


  useEffect(() => {
    document.documentElement.classList.add("transition-colors", "duration-500");

    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  const handleLogout = () => {
    const confirmed = window.confirm("¿Estás seguro que deseas cerrar sesión?");
    if (confirmed) {
      logout();
      navigate("/login");
    }
  };

  const menuItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Categorías", path: "/category", icon: Folder },
    { label: "Productos", path: "/product", icon: Package },
    { label: "Proveedores", path: "/suppliers", icon: Truck },
    { label: "Ventas", path: "/purchase", icon: ShoppingCart },
    // { label: "Compras en el carrito", path: "/shopping", icon: TrendingUp },
    { label: "Clientes", path: "/customer", icon: UserCheck },
    { label: "Usuarios", path: "/user", icon: Users },
  ];

  const handleNavigate = (path: string) => {
    setActiveItem(path);
    navigate(path);
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-black transition-colors duration-500">
      
      {/* Overlay móvil */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar negro */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 
          bg-white dark:bg-neutral-900
          border-r border-gray-200 dark:border-[#1f1f1f]
          flex flex-col transform transition-all duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-[#1f1f1f] flex items-center justify-between transition-colors duration-500">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900 dark:text-white">
              Suply App
            </span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1a1a1a]"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Menu */}
        <div className="px-4 mt-4 flex-1 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-400 dark:text-gray-300 uppercase tracking-wider mb-3 px-3 transition-colors duration-500">
            MENÚ
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.path;

              return (
                <button
                  key={item.label}
                  onClick={() => handleNavigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-teal-600 text-white shadow-md"
                      : "text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#1a1a1a]"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive ? "text-white" : "text-gray-400 dark:text-gray-300"
                    }`}
                  />
                  <span className={`text-sm font-medium ${isActive ? "text-white" : ""}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Dark mode + Logout */}
        <div className="px-4 mb-6 space-y-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg 
              text-gray-600 dark:text-gray-200 
              hover:bg-gray-50 dark:hover:bg-[#1a1a1a]
              transition-all duration-200"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-gray-300" />
            ) : (
              <Moon className="w-5 h-5 text-gray-500" />
            )}
            <span className="text-sm font-medium transition-colors">
              {darkMode ? "Modo claro" : "Modo oscuro"}
            </span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg 
              text-gray-600 dark:text-gray-200 
              hover:bg-gray-50 dark:hover:bg-[#1a1a1a]
              transition-all duration-200"
          >
            <LogOut className="w-5 h-5 text-gray-400 dark:text-gray-300" />
            <span className="text-sm font-medium">Cerrar sesión</span>
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header móvil */}
        <div className="lg:hidden bg-white dark:bg-black border-b border-gray-200 dark:border-[#1f1f1f] px-4 py-3 flex items-center justify-between transition-colors">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1a1a1a]"
          >
            <Menu className="w-6 h-6 text-gray-600 dark:text-gray-200" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-teal-600 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">Suply App</span>
          </div>

          <div className="w-10"></div>
        </div>

        {/* Contenido dinámico */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-black transition-colors duration-500">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
