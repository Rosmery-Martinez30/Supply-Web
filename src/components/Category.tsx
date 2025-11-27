import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, UserX, BarChart3, Package } from 'lucide-react';
import DeleteModal from './Delete';
import { useCategoryStore } from '../store/category.store';

const Category = () => {
  const { categories, loading, error, fetchCategories, createCategory, updateCategory, deactivateCategory } = useCategoryStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || 
                         (statusFilter === 'active' && category.isActive) ||
                         (statusFilter === 'inactive' && !category.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
    setShowModal(true);
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      alert('Por favor ingresa el nombre de la categoría');
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
      } else {
        await createCategory(formData);
      }
      
      setShowModal(false);
      setFormData({ name: '', description: '' });
    } catch (err) {
      console.error('Error al guardar categoría:', err);
      alert('Error al guardar la categoría');
    }
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategoryToDelete, setSelectedCategoryToDelete] = useState<any>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const handleDeactivate = (category: any) => {
    setSelectedCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const confirmDeactivate = async () => {
    if (!selectedCategoryToDelete) return;
    setLoadingDelete(true);
    try {
      await deactivateCategory(selectedCategoryToDelete.id);
      setShowDeleteModal(false);
      setSelectedCategoryToDelete(null);
    } catch (err) {
      console.error('Error al desactivar categoría:', err);
      alert('Error al desactivar la categoría');
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-700 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-teal-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Gestión de Categorías
                </h1>
              </div>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-300">
                Organiza tus productos por categorías
              </p>
            </div>

            <button
              onClick={handleCreateCategory}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium w-full sm:w-auto"
            >
              <Plus className="w-5 h-5" />
              <span className="sm:inline">Nueva categoría</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-4 sm:mb-6 text-sm sm:text-base">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-700 p-4 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">

            {/* Search */}
            <div className="flex-1 min-w-full sm:min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Buscar categorías..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-600 text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Status Filter */}
            <button
              onClick={() =>
                setStatusFilter(
                  statusFilter === "active"
                    ? "inactive"
                    : statusFilter === "inactive"
                    ? ""
                    : "active"
                )
              }
              className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors w-full sm:w-auto"
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  statusFilter === "active"
                    ? "bg-green-500"
                    : statusFilter === "inactive"
                    ? "bg-red-500"
                    : "bg-gray-400"
                }`}
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {statusFilter === "active"
                  ? "Activas"
                  : statusFilter === "inactive"
                  ? "Inactivas"
                  : "Todas"}
              </span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-700 p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500 dark:text-gray-300 text-sm sm:text-base">
              Cargando categorías...
            </p>
          </div>
        )}

        {/* Table / Cards */}
        {!loading && (
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-700 overflow-hidden">
            
            {/* Vista Desktop */}
            <div className="hidden md:block scroll-container max-h-[calc(100vh-330px)] overflow-y-scroll">
              <table className="w-full">
                <thead className="sticky top-0 z-10 bg-gray-100 dark:bg-neutral-800 border-b border-gray-300 dark:border-neutral-700">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">
                        Nombre
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">
                        Descripción
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">
                        Productos
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">
                        Estado
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">
                        Acciones
                      </div>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                  {filteredCategories.map((category) => (
                    <tr
                      key={category.id}
                      className="hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-teal-500 dark:text-teal-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {category.name}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {category.description || "-"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {category.products?.length || 0}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {category.isActive ? (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span className="text-sm font-medium text-green-700 dark:text-green-400">
                              Activa
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                            <span className="text-sm font-medium text-red-700 dark:text-red-400">
                              Inactiva
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                            title="Editar categoría"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {category.isActive && (
                            <button
                              onClick={() => handleDeactivate(category)}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                              title="Desactivar categoría"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredCategories.length === 0 && !loading && (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-300">
                    No se encontraron categorías
                  </p>
                </div>
              )}
            </div>

            {/* Vista Mobile - Cards */}
            <div className="md:hidden divide-y divide-gray-200 dark:divide-neutral-700 max-h-[calc(100vh-400px)] overflow-y-auto">
              {filteredCategories.map((category) => (
                <div key={category.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <BarChart3 className="w-4 h-4 text-teal-500 dark:text-teal-400" />
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                          {category.name}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        {category.description || "Sin descripción"}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <Package className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {category.products?.length || 0} productos
                        </span>
                      </div>
                    </div>
                    
                    {category.isActive ? (
                      <div className="flex items-center gap-1.5 ml-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-xs font-medium text-green-700 dark:text-green-400">
                          Activa
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 ml-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        <span className="text-xs font-medium text-red-700 dark:text-red-400">
                          Inactiva
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                      title="Editar categoría"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {category.isActive && (
                      <button
                        onClick={() => handleDeactivate(category)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                        title="Desactivar categoría"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {filteredCategories.length === 0 && !loading && (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-300 text-sm">No se encontraron categorías</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl max-w-md w-full p-4 sm:p-6 border dark:border-neutral-700 max-h-[90vh] overflow-y-auto">

            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
            </h2>

            <div className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-600 text-sm sm:text-base"
                  placeholder="Ej: Lácteos"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-600 text-sm sm:text-base"
                  placeholder="Descripción de la categoría (opcional)"
                  rows={3}
                />
              </div>

              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors font-medium text-sm sm:text-base"
                >
                  Cancelar
                </button>

                <button
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium text-sm sm:text-base"
                >
                  {editingCategory ? "Actualizar" : "Crear"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Delete / Desactivar categoría modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeactivate}
        title={selectedCategoryToDelete ? `Desactivar Categoría \"${selectedCategoryToDelete.name}\"` : 'Desactivar categoría'}
        message="¿Estás seguro de continuar con esta acción?"
        itemName={selectedCategoryToDelete?.name}
        loading={loadingDelete}
      />
    </div>
  );
};

export default Category;