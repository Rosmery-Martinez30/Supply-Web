import { useState, useEffect } from 'react';
import { Search, ShoppingCart, Edit2, UserX, Package, User, DollarSign, Hash } from 'lucide-react';
import { useShoppingStore } from '../store/shopping.store';
import { useCustomerStore } from '../store/customer.store';
import { useProductStore } from '../store/product.store';

const Shopping = () => {
  const { items, loading, error, fetchItems, createItem, updateItem, deactivateItem } = useShoppingStore();
  const { customers, fetchCustomers } = useCustomerStore();
  const { products, fetchProducts } = useProductStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const [formData, setFormData] = useState({
    productId: '',
    customerId: '',
    quantity: '',
  });

  useEffect(() => {
    fetchItems();
    fetchCustomers();
    fetchProducts();
  }, [fetchItems, fetchCustomers, fetchProducts]);

  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customer.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === '' || 
      (statusFilter === 'active' && item.isActive) ||
      (statusFilter === 'inactive' && !item.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateItem = () => {
    setEditingItem(null);
    setFormData({ productId: '', customerId: '', quantity: '' });
    setShowModal(true);
  };

  const handleEditItem = (item: any) => {
    setEditingItem(item);
    setFormData({
      productId: item.product.id.toString(),
      customerId: item.customer.id.toString(),
      quantity: item.quantity.toString(),
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.productId || !formData.customerId || !formData.quantity) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    const quantity = parseInt(formData.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      alert('La cantidad debe ser un número mayor a 0');
      return;
    }

    try {
      if (editingItem) {
        // AQUÍ ESTÁ EL CAMBIO - Envía productId y customerId también
        await updateItem(editingItem.id, {
          productId: parseInt(formData.productId),
          customerId: parseInt(formData.customerId),
          quantity,
        });
      } else {
        await createItem({
          productId: parseInt(formData.productId),
          customerId: parseInt(formData.customerId),
          quantity,
        });
      }
      
      setShowModal(false);
      setFormData({ productId: '', customerId: '', quantity: '' });
    } catch (err) {
      console.error('Error al guardar item:', err);
      alert('Error al guardar el item del carrito');
    }
  };

  const handleDeactivate = async (item: any) => {
    const confirmed = window.confirm(
      `¿Estás seguro que deseas eliminar este item del carrito de ${item.customer.fullName}?`
    );
    
    if (confirmed) {
      try {
        await deactivateItem(item.id);
      } catch (err) {
        console.error('Error al eliminar item:', err);
        alert('Error al eliminar el item del carrito');
      }
    }
  };

  const calculateTotal = (price: number | string, quantity: number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return (numPrice * quantity).toFixed(2);
  };

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numPrice.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-teal-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Carrito de Compras</h1>
              </div>
              <p className="text-gray-500">
                Gestiona los items del carrito de tus clientes
              </p>
            </div>
            <button
              onClick={handleCreateItem}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <ShoppingCart className="w-5 h-5" />
              Agregar al carrito
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex gap-4 flex-wrap">
            {/* Search */}
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por producto o cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <button
              onClick={() => setStatusFilter(statusFilter === 'active' ? 'inactive' : statusFilter === 'inactive' ? '' : 'active')}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className={`w-2 h-2 rounded-full ${
                statusFilter === 'active' ? 'bg-green-500' : 
                statusFilter === 'inactive' ? 'bg-red-500' : 'bg-gray-400'
              }`} />
              <span className="text-sm font-medium text-gray-700">
                {statusFilter === 'active' ? 'Activos' : statusFilter === 'inactive' ? 'Inactivos' : 'Todos los estados'}
              </span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500">Cargando carrito...</p>
          </div>
        )}

        {/* Table */}
        {!loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase">
                      ID
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase">
                      Producto
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase">
                      Cliente
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase">
                      Cantidad
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase">
                      Precio Unit.
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase">
                      Total
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase">
                      Estado
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase">
                      Acciones
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">#{item.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-900">{item.product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{item.customer.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-semibold text-gray-900">{item.quantity}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-900">{formatPrice(item.product.price)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-blue-600">
                        ${calculateTotal(item.product.price, item.quantity)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {item.isActive ? (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span className="text-sm font-medium text-green-700">Activo</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full" />
                          <span className="text-sm font-medium text-red-700">Inactivo</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditItem(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar cantidad"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {item.isActive && (
                          <button
                            onClick={() => handleDeactivate(item)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar del carrito"
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
            
            {filteredItems.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-gray-500">No se encontraron items en el carrito</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal - SIN disabled EN LOS SELECTS */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingItem ? 'Editar Item del Carrito' : 'Agregar al Carrito'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Producto *
                </label>
                <select
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar producto...</option>
                  {products
                    .filter(product => product.isActive && product.stock > 0)
                    .map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente *
                </label>
                <select
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar cliente...</option>
                  {customers
                    .filter(customer => customer.isActive)
                    .map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.fullName}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad *
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: 5"
                  min="1"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {editingItem ? 'Actualizar' : 'Agregar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shopping;