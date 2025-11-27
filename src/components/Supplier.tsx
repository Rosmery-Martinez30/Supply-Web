import { useState, useEffect } from 'react';
import { Search, Truck, Edit2, UserX, Package, Mail, Phone } from 'lucide-react';
import DeleteModal from './Delete';
import { useSupplierStore } from '../store/supplier.store';

const Suppliers = () => {
  const { suppliers, loading, error, fetchSuppliers, createSupplier, updateSupplier, deactivateSupplier } = useSupplierStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);

  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const filteredSuppliers = suppliers.filter(supplier => {
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch =
      supplier.companyName?.toLowerCase().includes(searchLower) ||
      supplier.contactName?.toLowerCase().includes(searchLower) ||
      supplier.email?.toLowerCase().includes(searchLower) ||
      supplier.phone?.includes(searchTerm);

    const matchesStatus =
      statusFilter === '' ||
      (statusFilter === 'active' && supplier.isActive) ||
      (statusFilter === 'inactive' && !supplier.isActive);

    return matchesSearch && matchesStatus;
  });

  const handleCreateSupplier = () => {
    setEditingSupplier(null);
    setFormData({ companyName: '', contactName: '', email: '', phone: '' });
    setShowModal(true);
  };

  const handleEditSupplier = (supplier: any) => {
    setEditingSupplier(supplier);
    setFormData({
      companyName: supplier.companyName,
      contactName: supplier.contactName,
      email: supplier.email || '',
      phone: supplier.phone || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.companyName.trim()) {
      alert('El nombre de la empresa es requerido');
      return;
    }

    if (!formData.contactName.trim()) {
      alert('El nombre de contacto es requerido');
      return;
    }

    try {
      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, {
          companyName: formData.companyName,
          contactName: formData.contactName,
          email: formData.email || undefined,
          phone: formData.phone || undefined
        });
      } else {
        await createSupplier({
          companyName: formData.companyName,
          contactName: formData.contactName,
          email: formData.email,
          phone: formData.phone,
        });
      }

      setShowModal(false);
      setFormData({ companyName: '', contactName: '', email: '', phone: '' });
    } catch (err) {
      console.error('Error al guardar proveedor:', err);
      alert('Error al guardar el proveedor');
    }
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const handleDeactivate = (supplier: any) => {
    setSelectedSupplier(supplier);
    setShowDeleteModal(true);
  };

  const confirmDeactivate = async () => {
    if (!selectedSupplier) return;
    setLoadingDelete(true);
    try {
      await deactivateSupplier(selectedSupplier.id);
      setShowDeleteModal(false);
      setSelectedSupplier(null);
    } catch (err) {
      console.error('Error al desactivar proveedor:', err);
      alert('Error al desactivar el proveedor');
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
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <Truck className="w-6 h-6 text-orange-600" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Proveedores</h1>
              </div>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-300">Gestiona tus proveedores y sus productos</p>
            </div>

            <button
              onClick={handleCreateSupplier}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium w-full sm:w-auto"
            >
              <Truck className="w-5 h-5" />
              <span className="sm:inline">Nuevo Proveedor</span>
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-4 sm:mb-6 text-sm sm:text-base">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-700 p-4 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">

            <div className="flex-1 min-w-full sm:min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Buscar por empresa, contacto, email o teléfono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-neutral-700 rounded-lg 
                  bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
              </div>
            </div>

            <button
              onClick={() =>
                setStatusFilter(
                  statusFilter === 'active'
                    ? 'inactive'
                    : statusFilter === 'inactive'
                    ? ''
                    : 'active'
                )
              }
              className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-neutral-700 rounded-lg 
              bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors w-full sm:w-auto"
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  statusFilter === 'active'
                    ? 'bg-green-500'
                    : statusFilter === 'inactive'
                    ? 'bg-red-500'
                    : 'bg-gray-400 dark:bg-gray-500'
                }`}
              />

              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {statusFilter === 'active'
                  ? 'Activos'
                  : statusFilter === 'inactive'
                  ? 'Inactivos'
                  : 'Todos los estados'}
              </span>
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-700 p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500 dark:text-gray-300 text-sm sm:text-base">Cargando proveedores...</p>
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
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Empresa</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Contacto</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Teléfono</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Productos</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Estado</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Acciones</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                  {filteredSuppliers.map((supplier) => (
                    <tr key={supplier.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-orange-500" />
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{supplier.companyName}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-800 dark:text-gray-200">{supplier.contactName}</span>
                      </td>

                      <td className="px-6 py-4">
                        {supplier.email ? (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            <span className="text-sm text-gray-900 dark:text-gray-100">{supplier.email}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {supplier.phone ? (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            <span className="text-sm text-gray-900 dark:text-gray-100">{supplier.phone}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                          <span className="text-sm font-semibold text-blue-600 dark:text-blue-300">
                            {supplier.products?.length || 0}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {supplier.isActive ? (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span className="text-sm font-medium text-green-700 dark:text-green-400">Activo</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                            <span className="text-sm font-medium text-red-700 dark:text-red-400">Inactivo</span>
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditSupplier(supplier)}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                            title="Editar proveedor"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {supplier.isActive && (
                            <button
                              onClick={() => handleDeactivate(supplier)}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                              title="Desactivar proveedor"
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

              {filteredSuppliers.length === 0 && !loading && (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-300">No se encontraron proveedores</p>
                </div>
              )}
            </div>

            {/* Vista Mobile - Cards */}
            <div className="md:hidden divide-y divide-gray-200 dark:divide-neutral-700 max-h-[calc(100vh-400px)] overflow-y-auto">
              {filteredSuppliers.map((supplier) => (
                <div key={supplier.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Truck className="w-4 h-4 text-orange-500" />
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                          {supplier.companyName}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{supplier.contactName}</p>
                      
                      {supplier.email && (
                        <div className="flex items-center gap-2 mb-1">
                          <Mail className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-200 break-all">
                            {supplier.email}
                          </span>
                        </div>
                      )}
                      
                      {supplier.phone && (
                        <div className="flex items-center gap-2 mb-1">
                          <Phone className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-200">
                            {supplier.phone}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-2">
                        <Package className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-300">
                          {supplier.products?.length || 0} productos
                        </span>
                      </div>
                    </div>
                    
                    {supplier.isActive ? (
                      <div className="flex items-center gap-1.5 ml-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-xs font-medium text-green-700 dark:text-green-400">
                          Activo
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 ml-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        <span className="text-xs font-medium text-red-700 dark:text-red-400">
                          Inactivo
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => handleEditSupplier(supplier)}
                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                      title="Editar proveedor"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {supplier.isActive && (
                      <button
                        onClick={() => handleDeactivate(supplier)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                        title="Desactivar proveedor"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {filteredSuppliers.length === 0 && !loading && (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-300 text-sm">No se encontraron proveedores</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl max-w-md w-full p-4 sm:p-6 border border-neutral-700 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Nombre de la empresa *
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData({ ...formData, companyName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg 
                  bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  placeholder="Ej: Distribuidora ABC"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Nombre del contacto *
                </label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) =>
                    setFormData({ ...formData, contactName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg 
                  bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  placeholder="Ej: Carlos López"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg 
                  bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  placeholder="ejemplo@correo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg 
                  bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  placeholder="Ej: +503 1234-5678"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-neutral-700 
                  text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 font-medium text-sm sm:text-base"
                >
                  Cancelar
                </button>

                <button
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium text-sm sm:text-base"
                >
                  {editingSupplier ? 'Actualizar' : 'Crear'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Delete / Deactivate modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeactivate}
        title={selectedSupplier?.isActive ? 'Desactivar Proveedor' : 'Desactivar Proveedor'}
        message="¿Estás seguro de continuar con esta acción?"
        itemName={selectedSupplier?.companyName}
        loading={loadingDelete}
      />

    </div>
  );
};

export default Suppliers;