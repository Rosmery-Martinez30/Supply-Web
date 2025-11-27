import { useState, useEffect } from 'react';
import { Search, UserPlus, Edit2, UserX, Mail, Phone, User } from 'lucide-react';
import { useCustomerStore } from '../store/customer.store';
import DeleteModal from "./Delete";

const CustomersManagement = () => {
  const { customers, loading, error, fetchCustomers, createCustomer, updateCustomer, deactivateCustomer } = useCustomerStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('active'); 
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });

  
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm);
    const matchesStatus = statusFilter === '' || 
                         (statusFilter === 'active' && customer.isActive) ||
                         (statusFilter === 'inactive' && !customer.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateCustomer = () => {
    setEditingCustomer(null);
    setFormData({ fullName: '', email: '', phone: '' });
    setShowModal(true);
  };

  const handleEditCustomer = (customer: any) => {
    setEditingCustomer(customer);
    setFormData({
      fullName: customer.fullName,
      email: customer.email,
      phone: customer.phone,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.email || !formData.phone) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Por favor ingresa un email válido');
      return;
    }

    try {
      if (editingCustomer) {
        // Actualizar cliente
        await updateCustomer(editingCustomer.id, formData);
      } else {
        // Crear nuevo cliente
        await createCustomer(formData);
      }
      
      setShowModal(false);
      setFormData({ fullName: '', email: '', phone: '' });
    } catch (err) {
      console.error('Error al guardar cliente:', err);
    }
  };

  const handleDeactivate = (customer: any) => {
    // open confirmation modal
    setSelectedCustomer(customer);
    setShowDeleteModal(true);
  };

  const confirmDeactivate = async () => {
    if (!selectedCustomer) return;

    setLoadingDelete(true);
    try {
      await deactivateCustomer(selectedCustomer.id);
      setShowDeleteModal(false);
      setSelectedCustomer(null);
    } catch (err) {
      console.error('Error al desactivar cliente:', err);
      alert('Error al desactivar el cliente');
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
                <div className="w-10 h-10 bg-teal-100 dark:bg-teal-600/20 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Gestión de Clientes
                </h1>
              </div>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-300">
                Administra la información de tus clientes
              </p>
            </div>

            <button
              onClick={handleCreateCustomer}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg transition-colors font-medium hover:bg-teal-700 w-full sm:w-auto"
            >
              <UserPlus className="w-5 h-5" />
              <span className="sm:inline">Crear nuevo cliente</span>
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
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-300" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, email o teléfono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Status Filter */}
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
              className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors w-full sm:w-auto"
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  statusFilter === 'active'
                    ? 'bg-green-500'
                    : statusFilter === 'inactive'
                    ? 'bg-red-500'
                    : 'bg-gray-400'
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

        {/* Loading State */}
        {loading && (
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-700 p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500 dark:text-gray-300 text-sm sm:text-base">Cargando clientes...</p>
          </div>
        )}

        {/* Table */}
        {!loading && (
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-700 overflow-hidden">
            {/* Vista Desktop */}
            <div className="hidden md:block scroll-container max-h-[calc(100vh-330px)] overflow-y-scroll">
              <table className="w-full">
                <thead className="sticky top-0 z-10 bg-gray-100 dark:bg-neutral-800 border-b border-gray-300 dark:border-neutral-700">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">
                        Nombre Completo
                      </span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">
                        Email
                      </span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">
                        Teléfono
                      </span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">
                        Estado
                      </span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">
                        Acciones
                      </span>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                  {filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {customer.fullName}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400 dark:text-gray-300" />
                          <span className="text-sm text-gray-600 dark:text-gray-200">
                            {customer.email}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400 dark:text-gray-300" />
                          <span className="text-sm text-gray-600 dark:text-gray-200">
                            {customer.phone}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {customer.isActive ? (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span className="text-sm font-medium text-green-700 dark:text-green-400">
                              Activo
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                            <span className="text-sm font-medium text-red-700 dark:text-red-400">
                              Inactivo
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditCustomer(customer)}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                            title="Editar cliente"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {customer.isActive && (
                            <button
                              onClick={() => handleDeactivate(customer)}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                              title="Desactivar cliente"
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

              {filteredCustomers.length === 0 && !loading && (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-300">
                    No se encontraron clientes
                  </p>
                </div>
              )}
            </div>

            {/* Vista Mobile - Cards */}
            <div className="md:hidden divide-y divide-gray-200 dark:divide-neutral-700 max-h-[calc(100vh-400px)] overflow-y-auto">
              {filteredCustomers.map((customer) => (
                <div key={customer.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                        {customer.fullName}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="w-3.5 h-3.5 text-gray-400 dark:text-gray-300" />
                        <span className="text-sm text-gray-600 dark:text-gray-200 break-all">
                          {customer.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="w-3.5 h-3.5 text-gray-400 dark:text-gray-300" />
                        <span className="text-sm text-gray-600 dark:text-gray-200">
                          {customer.phone}
                        </span>
                      </div>
                    </div>
                    {customer.isActive ? (
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
                      onClick={() => handleEditCustomer(customer)}
                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                      title="Editar cliente"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {customer.isActive && (
                      <button
                        onClick={() => handleDeactivate(customer)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                        title="Desactivar cliente"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {filteredCustomers.length === 0 && !loading && (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-300 text-sm">
                    No se encontraron clientes
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl max-w-md w-full p-4 sm:p-6 border border-neutral-700 max-h-[90vh] overflow-y-auto">

            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {editingCustomer ? 'Editar Cliente' : 'Crear Nuevo Cliente'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  placeholder="Ej: Juan Pérez García"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  placeholder="ejemplo@correo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  placeholder="Ej: +503 1234-5678"
                />
              </div>

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
                  {editingCustomer ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete / deactivate modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeactivate}
        title={selectedCustomer?.isActive ? 'Desactivar Cliente' : 'Desactivar Cliente'}
        message="¿Estás seguro de continuar con esta acción?"
        itemName={selectedCustomer?.fullName}
        loading={loadingDelete}
      />
    </div>
  );
};

export default CustomersManagement;