import { useState, useEffect } from "react";
import {
  Search,
  UserPlus,
  Edit2,
  UserX,
  UserCheck,
  Mail,
  Shield,
} from "lucide-react";
import { useUserStore } from "../store/user.store";
import DeleteModal from "./Delete";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

interface UserForm {
  name: string;
  email: string;
  password: string;
  role: string;
}

const User = () => {
  const {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deactivateUser,
    reactivateUser,
  } = useUserStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [selectedUser, setSelectedUser] = useState<User | null>(null);
const [loadingDelete, setLoadingDelete] = useState(false);

  const [formData, setFormData] = useState<UserForm>({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user: User) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      roleFilter === "" ||
      user.role.toLowerCase().includes(roleFilter.toLowerCase());

    const matchesStatus =
      statusFilter === "" ||
      (statusFilter === "active" && user.isActive) ||
      (statusFilter === "inactive" && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const confirmToggleStatus = async () => {
  if (!selectedUser) return;

  setLoadingDelete(true);

  try {
    if (selectedUser.isActive) {
      await deactivateUser(selectedUser.id);
    } else {
      await reactivateUser(selectedUser.id);
    }

    setShowDeleteModal(false);
    setSelectedUser(null);
  } catch (err) {
    console.error("Error al cambiar estado:", err);
  } finally {
    setLoadingDelete(false);
  }
};

  const handleCreateUser = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "", password: "", role: "" });
    setShowModal(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.role) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }

    if (!editingUser && !formData.password) {
      alert("La contraseña es requerida para crear un usuario");
      return;
    }

    try {
      if (editingUser) {
        const updateData: Partial<UserForm> = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        };

        if (formData.password.trim() !== "") {
          updateData.password = formData.password;
        }

        await updateUser(editingUser.id, updateData);
      } else {
        await createUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        });
      }

      setShowModal(false);
      setFormData({ name: "", email: "", password: "", role: "" });
    } catch (err) {
      console.error("Error al guardar usuario:", err);
    }
  };

  const handleToggleStatus = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };


  const uniqueRoles = Array.from(new Set(users.map((u: User) => u.role)));

  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-neutral-900 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-teal-600 dark:text-teal-300" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Gestión de Usuarios
                </h1>
              </div>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-300">
                Administra los usuarios del sistema y sus permisos
              </p>
            </div>

            <button
              onClick={handleCreateUser}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors font-medium w-full sm:w-auto"
            >
              <UserPlus className="w-5 h-5" />
              <span className="sm:inline">Crear nuevo usuario</span>
            </button>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-4 sm:mb-6 text-sm sm:text-base">
            {error}
          </div>
        )}

          {/* Delete / activate modal */}
          <DeleteModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={confirmToggleStatus}
            title={selectedUser?.isActive ? "Desactivar Usuario" : "Activar Usuario"}
            message="¿Estás seguro de continuar con esta acción?"
            itemName={selectedUser?.name}
            loading={loadingDelete}
          />

        {/* FILTROS */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 p-4 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 min-w-full sm:min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-teal-500 text-sm sm:text-base"
                />
              </div>
            </div>

            {/* FILTRO ROL */}
            <div className="relative w-full sm:w-auto">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="appearance-none w-full pl-10 pr-8 py-2.5 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-teal-500 text-sm sm:text-base"
              >
                <option value="">Todos los roles</option>
                {uniqueRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            </div>

            {/* FILTRO ESTADO */}
            <button
              onClick={() =>
                setStatusFilter(
                  statusFilter === ""
                    ? "active"
                    : statusFilter === "active"
                    ? "inactive"
                    : ""
                )
              }
              className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors w-full sm:w-auto"
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  statusFilter === ""
                    ? "bg-gray-400"
                    : statusFilter === "active"
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
              />
              <span className="text-sm font-medium">
                {statusFilter === ""
                  ? "Todos los estados"
                  : statusFilter === "active"
                  ? "Activos"
                  : "Inactivos"}
              </span>
            </button>
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-teal-600 dark:border-teal-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500 dark:text-gray-300 text-sm sm:text-base">
              Cargando usuarios...
            </p>
          </div>
        )}

        {/* TABLA */}
        {!loading && (
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 overflow-hidden">
            {/* Vista Desktop */}
            <div className="hidden md:block scroll-container max-h-[calc(100vh-330px)] overflow-y-scroll">
              <table className="w-full">
                <thead className="sticky top-0 z-10 bg-gray-100 dark:bg-neutral-800 border-b border-gray-300 dark:border-neutral-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                      Nombre
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                      Rol
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                  {filteredUsers.map((user: User) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {user.name}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {user.email}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`
                            px-3 py-1 rounded-full text-sm font-semibold
                            ${
                              user.role === "Admin"
                                ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                                : "bg-gray-800 text-gray-100 dark:bg-gray-200 dark:text-gray-900"
                            }
                          `}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {user.isActive ? (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">
                              Activo
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                            <span className="text-sm font-medium text-red-600 dark:text-red-400">
                              Inactivo
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={`p-2 rounded-lg ${
                              user.isActive
                                ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                                : "text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30"
                            }`}
                          >
                            {user.isActive ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No se encontraron usuarios
                </div>
              )}
            </div>

            {/* Vista Mobile - Cards */}
            <div className="md:hidden divide-y divide-gray-200 dark:divide-neutral-700 max-h-[calc(100vh-400px)] overflow-y-auto">
              {filteredUsers.map((user: User) => (
                <div key={user.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                        {user.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {user.email}
                        </span>
                      </div>
                    </div>
                    {user.isActive ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-xs font-medium text-green-600 dark:text-green-400">
                          Activo
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        <span className="text-xs font-medium text-red-600 dark:text-red-400">
                          Inactivo
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span
                      className={`
                        px-2.5 py-1 rounded-full text-xs font-semibold
                        ${
                          user.role === "Admin"
                            ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                            : "bg-gray-800 text-gray-100 dark:bg-gray-200 dark:text-gray-900"
                        }
                      `}
                    >
                      {user.role}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`p-2 rounded-lg ${
                          user.isActive
                            ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                            : "text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30"
                        }`}
                      >
                        {user.isActive ? (
                          <UserX className="w-4 h-4" />
                        ) : (
                          <UserCheck className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredUsers.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm">
                  No se encontraron usuarios
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl max-w-md w-full p-4 sm:p-6 border border-gray-200 dark:border-neutral-700 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {editingUser ? "Editar Usuario" : "Crear Nuevo Usuario"}
            </h2>

            <div className="space-y-4">
              {/* NOMBRE */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-teal-500 text-sm sm:text-base"
                  placeholder="Ej: Juan Pérez"
                />
              </div>

              {/* EMAIL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-teal-500 text-sm sm:text-base"
                  placeholder="correo@ejemplo.com"
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contraseña {!editingUser && "*"}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-teal-500 text-sm sm:text-base"
                  placeholder={
                    editingUser
                      ? "Dejar vacío para no cambiar"
                      : "Ingresa una contraseña"
                  }
                />
              </div>
            
              {/* ROL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rol *
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-teal-500 text-sm sm:text-base"
                  placeholder="Ej: admin, vendedor, gerente"
                />
              </div>

              {/* BOTONES */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 text-sm sm:text-base font-medium"
                >
                  Cancelar
                </button>

                <button
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm sm:text-base font-medium"
                >
                  {editingUser ? "Actualizar" : "Crear"}
                </button>
                
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default User;