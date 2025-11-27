import { useState, useEffect } from 'react';
import { Search, Eye, UserX, ShoppingBag, Trash2, Calendar, DollarSign, ShoppingCart } from 'lucide-react';
import DeleteModal from './Delete';
import { usePurchaseStore } from '../store/purchase.store';
import { useCustomerStore } from '../store/customer.store';
import { useUserStore } from '../store/user.store';
import { useProductStore } from '../store/product.store';
import type { Purchase } from '../types/purchase.type';
import type { Product } from '../types/product.type';

const Purchases = () => {
  const { purchases, loading, error, fetchPurchases, deactivatePurchase, createPurchase } = usePurchaseStore();
  const { customers, fetchCustomers } = useCustomerStore();
  const { users, fetchUsers } = useUserStore();
  const { products, fetchProducts } = useProductStore();
  const [customerInputFocused, setCustomerInputFocused] = useState(false);
  const [userInputFocused, setUserInputFocused] = useState(false);

  const [productsSelected, setProductsSelected] = useState<any[]>([]);
  const [productInputFocused, setProductInputFocused] = useState<number | null>(null);

  const [customerInput, setCustomerInput] = useState('');
  const [userInput, setUserInput] = useState('');
  const [productInputs, setProductInputs] = useState<string[]>(['']);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | ''>('active');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState<Purchase | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const [newPurchase, setNewPurchase] = useState({
    customerId: 0,
    userId: 0,
    details: [{ productId: 0, quantity: 1, subtotal: 0 }],
  });
  
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedProducts, setSelectedProducts] = useState<Array<{ product: Product | null; quantity: number }>>([
    { product: null, quantity: 1 }
  ]);

  useEffect(() => {
    fetchPurchases();
    fetchCustomers();
    fetchUsers();
    fetchProducts();
  }, [fetchPurchases, fetchCustomers, fetchUsers, fetchProducts]);

  const filteredPurchases = purchases.filter(p => {
    const matchesSearch = p.id.toString().includes(searchTerm);
    const matchesStatus =
      statusFilter === '' ||
      (statusFilter === 'active' && p.isActive) ||
      (statusFilter === 'inactive' && !p.isActive);
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setShowDetailsModal(true);
  };

  const handleDeactivate = (purchase: Purchase) => {
    // Open confirmation modal for deleting (annulling) a purchase
    setSelectedToDelete(purchase);
    setShowDeleteModal(true);
  };

  const confirmDeactivate = async () => {
    if (!selectedToDelete) return;
    setLoadingDelete(true);
    try {
      await deactivatePurchase(selectedToDelete.id);
      setShowDeleteModal(false);
      setSelectedToDelete(null);
    } catch (err) {
      console.error('Error al anular la venta:', err);
      alert('Error al anular la venta');
    } finally {
      setLoadingDelete(false);
    }
  };

  const handleProductChange = (index: number, product: Product | null) => {
    const updated = [...selectedProducts];
    updated[index] = {
      product,
      quantity: updated[index].quantity
    };
    setSelectedProducts(updated);
    setProductInputs(prev => {
      const copy = [...prev];
      copy[index] = product ? product.name : '';
      return copy;
    });
    updatePurchaseDetails();
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const updated = [...selectedProducts];
    updated[index] = {
      ...updated[index],
      quantity: quantity > 0 ? quantity : 1
    };
    setSelectedProducts(updated);
    updatePurchaseDetails();
  };

  const updatePurchaseDetails = () => {
    const details = selectedProducts
      .filter(item => item.product !== null)
      .map(item => ({
        productId: item.product!.id,
        quantity: item.quantity,
        subtotal: item.product!.price * item.quantity
      }));
    
    setNewPurchase(prev => ({ ...prev, details: details.length > 0 ? details : [{ productId: 0, quantity: 1, subtotal: 0 }] }));
  };

  const addProductRow = () => {
    setSelectedProducts([...selectedProducts, { product: null, quantity: 1 }]);
    setProductInputs(prev => [...prev, '']);
  };

  const removeProductRow = (index: number) => {
    if (selectedProducts.length > 1) {
      const updated = [...selectedProducts];
      updated.splice(index, 1);
      setSelectedProducts(updated);

      setProductInputs(prev => {
        const copy = [...prev];
        copy.splice(index, 1);
        return copy.length ? copy : [''];
      });

      setTimeout(() => {
        const details = updated
          .filter(item => item.product !== null)
          .map(item => ({
            productId: item.product!.id,
            quantity: item.quantity,
            subtotal: item.product!.price * item.quantity
          }));

        setNewPurchase(prev => ({ ...prev, details: details.length > 0 ? details : [{ productId: 0, quantity: 1, subtotal: 0 }] }));
      }, 0);
    }
  };

  const handleCreatePurchase = async () => {
    if (!selectedCustomer || !selectedUser) {
      alert('Por favor selecciona un cliente y un usuario');
      return;
    }
    
    if (selectedProducts.every(item => item.product === null)) {
      alert('Por favor agrega al menos un producto');
      return;
    }

    const details = selectedProducts
      .filter(item => item.product !== null)
      .map(item => ({
        productId: item.product!.id,
        quantity: item.quantity,
        subtotal: item.product!.price * item.quantity
      }));

    try {
      await createPurchase({
        customerId: selectedCustomer.id,
        userId: selectedUser.id,
        total: details.reduce((sum, d) => sum + d.subtotal, 0),
        details
      });
      
      setShowCreateModal(false);
      setSelectedCustomer(null);
      setSelectedUser(null);
      setSelectedProducts([{ product: null, quantity: 1 }]);
      setNewPurchase({ customerId: 0, userId: 0, details: [{ productId: 0, quantity: 1, subtotal: 0 }] });
    } catch (err) {
      console.error('Error al crear la venta:', err);
      alert('Error al crear la venta');
    }
  };

  const calculateTotal = () => {
    return selectedProducts
      .filter(item => item.product !== null)
      .reduce((sum, item) => sum + (item.product!.price * item.quantity), 0);
  };

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numPrice.toFixed(2);
  };
  
  return (
   <>
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-700 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-teal-100 dark:bg-teal-600/20 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Historial de Ventas</h1>
              </div>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-300">
                Administra las ventas realizadas en el sistema
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg transition-colors font-medium hover:bg-teal-700 w-full sm:w-auto"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="sm:inline">Nueva venta</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-4 sm:mb-6 text-sm sm:text-base">
            {error}
          </div>
        )}

          {/* Delete / Anular Venta modal */}
          <DeleteModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={confirmDeactivate}
            title={selectedToDelete ? `Anular Venta #${selectedToDelete.id}` : 'Anular Venta'}
            message="¿Estás seguro de continuar con esta acción?"
            itemName={selectedToDelete ? `Venta #${selectedToDelete.id}` : undefined}
            loading={loadingDelete}
          />

        {/* Filters */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-700 p-4 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Search */}
            <div className="flex-1 min-w-full sm:min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-300" />
                <input
                  type="text"
                  placeholder="Buscar por ID de venta..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Status Filter */}
            <button
              onClick={() => setStatusFilter(statusFilter === 'active' ? 'inactive' : statusFilter === 'inactive' ? '' : 'active')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors w-full sm:w-auto"
            >
              <div className={`w-2 h-2 rounded-full ${
                statusFilter === 'active' ? 'bg-green-500' : statusFilter === 'inactive' ? 'bg-red-500' : 'bg-gray-400'
              }`} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {statusFilter === 'active' ? 'Activas' : statusFilter === 'inactive' ? 'Anuladas' : 'Todos los estados'}
              </span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-700 p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500 dark:text-gray-300 text-sm sm:text-base">Cargando ventas...</p>
          </div>
        )}

        {/* Table / Cards */}
        {!loading && (
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-700 overflow-hidden">
            {/* Vista Desktop */}
            <div className="hidden md:block scroll-container max-h-[calc(100vh-330px)] overflow-y-scroll">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">
                        Fecha
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">
                        Cliente
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">
                        Total
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">
                        Estado
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">
                        Acciones
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                  {filteredPurchases.map((purchase) => (
                    <tr key={purchase.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-300" />
                          <span className="text-sm text-gray-600 dark:text-gray-200">
                            {new Date(purchase.date).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {purchase.customer.fullName}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gray-400 dark:text-gray-300" />
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            ${formatPrice(purchase.total)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {purchase.isActive ? (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span className="text-sm font-medium text-green-700 dark:text-green-400">Activa</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                            <span className="text-sm font-medium text-red-700 dark:text-red-400">Anulada</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(purchase)}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {purchase.isActive && (
                            <button
                              onClick={() => handleDeactivate(purchase)}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                              title="Anular venta"
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

              {filteredPurchases.length === 0 && !loading && (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-300">No se encontraron ventas</p>
                </div>
              )}
            </div>

            {/* Vista Mobile - Cards */}
            <div className="md:hidden divide-y divide-gray-200 dark:divide-neutral-700 max-h-[calc(100vh-400px)] overflow-y-auto">
              {filteredPurchases.map((purchase) => (
                <div key={purchase.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                        {purchase.customer.fullName}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400 dark:text-gray-300" />
                        <span className="text-sm text-gray-600 dark:text-gray-200">
                          {new Date(purchase.date).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <DollarSign className="w-3.5 h-3.5 text-gray-400 dark:text-gray-300" />
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          ${formatPrice(purchase.total)}
                        </span>
                      </div>
                    </div>
                    {purchase.isActive ? (
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
                          Anulada
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => handleViewDetails(purchase)}
                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                      title="Ver detalles"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {purchase.isActive && (
                      <button
                        onClick={() => handleDeactivate(purchase)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                        title="Anular venta"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {filteredPurchases.length === 0 && !loading && (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-300 text-sm">No se encontraron ventas</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal Crear Venta */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl max-w-3xl w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-neutral-700">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Crear Nueva Venta</h2>

            <div className="space-y-4">
              {/* Autocomplete Cliente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Cliente *</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar cliente..."
                    value={customerInput}
                    onChange={(e) => { setCustomerInput(e.target.value); setSelectedCustomer(null); }}
                    onFocus={() => setCustomerInputFocused(true)}
                    onBlur={() => setTimeout(() => setCustomerInputFocused(false), 150)}
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                  {customerInputFocused && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {customers
                        .filter(c => c.isActive && (c.fullName.toLowerCase().includes(customerInput.toLowerCase()) || c.email.toLowerCase().includes(customerInput.toLowerCase())))
                        .map(c => (
                          <div
                            key={c.id}
                            onMouseDown={(e) => {
                              e.preventDefault(); 
                              setSelectedCustomer(c);
                              setCustomerInput(c.fullName);
                              setCustomerInputFocused(false);
                            }}
                            className="px-3 py-2 hover:bg-blue-50 dark:hover:bg-neutral-800 cursor-pointer text-sm border-b border-gray-100 dark:border-neutral-700 last:border-0"
                          >
                            <p className="font-medium text-gray-900 dark:text-gray-100">{c.fullName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-300">{c.email}</p>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Autocomplete Usuario */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Empleado *</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar usuario..."
                    value={userInput}
                    onChange={(e) => { setUserInput(e.target.value); setSelectedUser(null); }}
                    onFocus={() => setUserInputFocused(true)}
                    onBlur={() => setTimeout(() => setUserInputFocused(false), 150)}
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                  {userInputFocused && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {users
                        .filter(u => u.isActive && (u.name.toLowerCase().includes(userInput.toLowerCase()) || u.email.toLowerCase().includes(userInput.toLowerCase())))
                        .map(u => (
                          <div
                            key={u.id}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setSelectedUser(u);
                              setUserInput(u.name);
                              setUserInputFocused(false);
                            }}
                            className="px-3 py-2 hover:bg-blue-50 dark:hover:bg-neutral-800 cursor-pointer text-sm border-b border-gray-100 dark:border-neutral-700 last:border-0"
                          >
                            <p className="font-medium text-gray-900 dark:text-gray-100">{u.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-300">{u.email}</p>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Productos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Productos *</label>
                <div className="space-y-3">
                  {selectedProducts.map((item, index) => (
                    <div key={index} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg border border-gray-100 dark:border-neutral-700">
                      {/* Autocomplete Producto */}
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          placeholder="Buscar producto..."
                          value={productInputs[index] || ''}
                          onChange={(e) => {
                            const v = e.target.value;
                            setProductInputs(prev => {
                              const copy = [...prev];
                              copy[index] = v;
                              return copy;
                            });
                          }}
                          onFocus={() => setProductInputFocused(index)}
                          onBlur={() => setTimeout(() => setProductInputFocused(null), 150)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        {productInputFocused === index && !selectedProducts[index]?.product && (
                          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-lg shadow-lg max-h-48 overflow-auto">
                            {products
                              .filter(p => p.isActive && p.stock > 0 && p.name.toLowerCase().includes((productInputs[index] || '').toLowerCase()))
                              .map(p => (
                                <div
                                  key={p.id}
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleProductChange(index, p);
                                    setProductInputFocused(null);
                                  }}
                                  className="px-3 py-2 hover:bg-blue-50 dark:hover:bg-neutral-800 cursor-pointer text-sm border-b border-gray-100 dark:border-neutral-700 last:border-0"
                                >
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-medium text-gray-900 dark:text-gray-100">{p.name}</p>
                                      <p className="text-xs text-gray-500 dark:text-gray-300">Stock: {p.stock}</p>
                                    </div>
                                    <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">${formatPrice(p.price)}</p>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>


                {/* Cantidad */}
                 <div className="w-full sm:w-24">
                        <input
                          type="number"
                          min={1}
                          max={item.product?.stock || 999}
                          placeholder="Cant."
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

          {/* Subtotal */}
                  <div className="w-full sm:w-28">
                    <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg text-sm font-semibold text-blue-700 dark:text-blue-200 text-center">
                      ${item.product ? formatPrice(item.product.price * item.quantity) : '0.00'}
                    </div>
                  </div>

                  {/* Botón eliminar */}
                  {selectedProducts.length > 1 && (
                    <button
                      onClick={() => removeProductRow(index)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-neutral-800 rounded-lg transition-colors self-center"
                      title="Eliminar producto"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addProductRow}
              className="mt-3 px-4 py-2 bg-teal-700 text-white text-sm rounded-lg transition-colors font-medium hover:bg-teal-800 w-full sm:w-auto"
            >
              + Agregar Producto
            </button>
          </div>

          {/* Total */}
          <div className="pt-4 border-t-2 border-gray-200 dark:border-neutral-700">
            <div className="flex flex-col sm:flex-row justify-between items-center bg-blue-50 dark:bg-blue-900/5 p-4 rounded-lg gap-2">
              <span className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Total de la venta:</span>
              <span className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-300">
                ${formatPrice(calculateTotal())}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={() => {
                setShowCreateModal(false);
                setSelectedCustomer(null);
                setSelectedUser(null);
                setSelectedProducts([{ product: null, quantity: 1 }]);
              }}
              className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors font-medium text-sm sm:text-base"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreatePurchase}
              className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium text-sm sm:text-base"
            >
              Crear Venta
            </button>
          </div>
        </div>
      </div>
    </div>
  )}

  {/* Modal Detalles */}  
  {showDetailsModal && selectedPurchase && (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 p-0 overflow-y-auto">
     <div className="
  bg-white dark:bg-neutral-900 
  rounded-xl 

  w-[380px] max-w-[95vw] 
  my-8 overflow-hidden 
  border border-gray-100 
  dark:border-transparent
  print:shadow-none print:border-0 print:rounded-none
">


        {/* Header con botones */}
        <div className="bg-teal-700 p-3 flex justify-between items-center print:hidden">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            Ticket de Venta
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="p-1.5  bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title="Imprimir"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
            </button>
            <button
              onClick={() => setShowDetailsModal(false)}
              className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title="Cerrar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Contenido del Ticket */}
        <div className="p-5 max-h-[80vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-0 ticket-content">
          {/* Encabezado del negocio */}
          <div className="text-center mb-5 pb-4 border-b-2 border-gray-300 dark:border-neutral-600">
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 print:text-black mb-2">SUPPLY</h1>
            <p className="text-xs text-gray-700 dark:text-gray-300 print:text-black leading-relaxed">Sonsonate Centro</p>
            <p className="text-xs text-gray-700 dark:text-gray-300 print:text-black leading-relaxed">Tel: (+503) 63089440</p>
          </div>

          {/* Información de la venta */}
          <div className="mb-4 text-xs spacekl-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-700 dark:text-gray-300 print:text-black">Ticket:</span>
              <span className="text-gray-900 dark:text-gray-100 print:text-black font-medium">#{selectedPurchase.id}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-700 dark:text-gray-300 print:text-black">Fecha:</span>
              <span className="text-gray-900 dark:text-gray-100 print:text-black">
                {new Date(selectedPurchase.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' })}
              </span>
            </div>

          <div className="flex justify-between">
          <span className="text-gray-700 dark:text-gray-300 print:text-black">Hora:</span>
          <span className="text-gray-900 dark:text-gray-100 print:text-black">
            {new Date(selectedPurchase.date).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true
            })}
          </span>
        </div>


            <div className="flex justify-between">
              <span className="text-gray-700 dark:text-gray-300 print:text-black">Cliente:</span>
              <span className="text-gray-900 dark:text-gray-100 print:text-black font-medium">
                {selectedPurchase.customer?.fullName || "Público General"}
              </span>
            </div>
          </div>

          <div className="border-t-2 border-gray-300 dark:border-neutral-600 mb-3"></div>

          {/* Productos */}
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 print:text-black mb-3 uppercase">Productos</h3>

            <div className="space-y-3">
              {selectedPurchase.details && selectedPurchase.details.length > 0 ? (
                selectedPurchase.details.map((detail) => (
                  <div key={detail.id} className="text-xs">
                    <div className="font-medium text-gray-900 dark:text-gray-100 print:text-black mb-1">
                      {detail.product.name}
                    </div>
                    <div className="flex justify-between text-gray-700 dark:text-gray-300 print:text-black">
                      <span>Cantidad: {detail.quantity}</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100 print:text-black">
                        ${formatPrice(detail.subtotal)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-400 print:text-black">No hay productos</p>
              )}
            </div>
          </div>

          <div className="border-t-2 border-gray-300 dark:border-neutral-600 my-3"></div>

          {/* Totales */}
          <div className="mb-4 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-700 dark:text-gray-300 print:text-black">Subtotal:</span>
              <span className="text-gray-900 dark:text-gray-100 print:text-black">${formatPrice(selectedPurchase.total / 1.16)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-700 dark:text-gray-300 print:text-black">IVA (16%):</span>
              <span className="text-gray-900 dark:text-gray-100 print:text-black">${formatPrice(selectedPurchase.total - (selectedPurchase.total / 1.16))}</span>
            </div>

            <div className="border-t-2 border-gray-400 dark:border-neutral-600 pt-2 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-gray-900 dark:text-gray-100 print:text-black">TOTAL:</span>
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100 print:text-black">
                  ${formatPrice(selectedPurchase.total)}
                </span>
              </div>
            </div>
          </div>

          <div className="text-center pt-4 border-t-2 border-dashed border-gray-400 dark:border-neutral-600">
            <p className="text-xs font-medium text-gray-900 dark:text-gray-100 print:text-black mb-1.5">¡Gracias por su compra!</p>
            <p className="text-[10px] text-gray-600 dark:text-gray-400 print:text-black italic">Conserve este ticket</p>
          </div>
        </div>

        {/* Botones */}
        <div className="p-3 bg-gray-50 dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-700 flex gap-2 print:hidden">
          <button
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-teal-600  text-white rounded-lg transition-colors font-medium text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            Imprimir
          </button>
          <button
            onClick={() => setShowDetailsModal(false)}
            className="px-4 py-2 border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors font-medium text-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )}

  {/* ESTILOS PARA IMPRESIÓN */}
  <style>{`
    @media print {
      @page { 
        size: 80mm auto; 
        margin: 0; 
      }
        
      
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      body { 
        margin: 0 !important; 
        padding: 0 !important; 
      }
      
      body * { 
        visibility: hidden; 
      }
      
      .fixed, .fixed * { 
        visibility: visible; 
      }
      
      /* Make the modal use the full printable width (helps remove the
         visual side gutters in print-preview). Keep internal borders intact. */
      .fixed {
        position: absolute !important;
        left: 0 !important;
        right: 0 !important;
        top: 0 !important;
        width: 100% !important; /* fill page width */
        height: auto !important;
        background: white !important;
        overflow: visible !important;
        border: 0 !important; /* remove outer modal border when printing */
        box-shadow: none !important; /* remove any drop shadow */
      }
      
      /* Expand the ticket content to the printable width and remove the
         auto-centering so it prints flush against page edges (printer may
         still apply hardware margins). Keep separators inside the ticket. */
      .ticket-content { 
        width: 100% !important;
        max-width: 100% !important;
        padding: 4mm 4mm !important; /* small horizontal padding to avoid content being cut off */
        margin: 0 !important;
        background: white !important;
        color: black !important;
        overflow: visible !important;
        height: auto !important;
        max-height: none !important;
        font-size: 10pt !important;
      }
      
      .ticket-content,
      .ticket-content *,
      .ticket-content h1,
      .ticket-content h2,
      .ticket-content h3,
      .ticket-content p,
      .ticket-content span,
      .ticket-content div { 
        color: black !important; 
        background: white !important;
        background-color: white !important;
      }
      
      
      .print\\:text-black,
      .print\\:text-black * {
        color: black !important;
      }
      
      /* don't force border colors in print — internal separators use their
         normal border styles (keep them visible but not forced to black) */
      
      .print\\:hidden { 
        display: none !important; 
        visibility: hidden !important;
      }
      
      .print\\:max-h-none { 
        max-height: none !important; 
      }
      
      .print\\:overflow-visible { 
        overflow: visible !important; 
      }
      
      .print\\:p-0 {
        padding: 4mm !important;
      }
    }
  `}</style>

</div>
</>
);
}

export default Purchases;
