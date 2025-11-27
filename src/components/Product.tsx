import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, UserX, Package, DollarSign, Image, Upload } from 'lucide-react';
import DeleteModal from './Delete';
import { useProductStore } from '../store/product.store';
import { useCategoryStore } from '../store/category.store';
import { useSupplierStore } from '../store/supplier.store';

const Product = () => {
  const { products, loading, error, fetchProducts, createProduct, updateProduct, deactivateProduct } = useProductStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { suppliers, fetchSuppliers } = useSupplierStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    supplierId: '',
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSuppliers();
  }, [fetchProducts, fetchCategories, fetchSuppliers]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === '' || product.category?.id.toString() === categoryFilter;
    const matchesStatus = statusFilter === '' || 
                         (statusFilter === 'active' && product.isActive) ||
                         (statusFilter === 'inactive' && !product.isActive);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setImageFile(null);
    setImagePreview('');
    setFormData({ name: '', description: '', price: '', stock: '', categoryId: '', supplierId: '' });
    setShowModal(true);
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setImageFile(null);
    setImagePreview(product.imageUrl || '');
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      stock: product.stock.toString(),
      categoryId: product.category?.id.toString() || '',
      supplierId: product.supplier?.id.toString() || '',
    });
    setShowModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price || !formData.stock) {
      alert('Por favor completa los campos requeridos (nombre, precio, stock)');
      return;
    }

    const price = parseFloat(formData.price);
    const stock = parseInt(formData.stock);

    if (isNaN(price) || price <= 0) {
      alert('El precio debe ser un número mayor a 0');
      return;
    }

    if (isNaN(stock) || stock < 0) {
      alert('El stock debe ser un número mayor o igual a 0');
      return;
    }

    try {
      const productData = {
        name: formData.name,
        description: formData.description || undefined,
        price,
        stock,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : undefined,
        supplierId: formData.supplierId ? parseInt(formData.supplierId) : undefined,
        image: imageFile || undefined,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await createProduct(productData);
      }
      
      setShowModal(false);
      setFormData({ name: '', description: '', price: '', stock: '', categoryId: '', supplierId: '' });
      setImageFile(null);
      setImagePreview('');
    } catch (err) {
      console.error('Error al guardar producto:', err);
      alert('Error al guardar el producto');
    }
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProductToDelete, setSelectedProductToDelete] = useState<any>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const handleDeactivate = (product: any) => {
    setSelectedProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDeactivate = async () => {
    if (!selectedProductToDelete) return;
    setLoadingDelete(true);
    try {
      await deactivateProduct(selectedProductToDelete.id);
      setShowDeleteModal(false);
      setSelectedProductToDelete(null);
    } catch (err) {
      console.error('Error al desactivar producto:', err);
      alert('Error al desactivar el producto');
    } finally {
      setLoadingDelete(false);
    }
  };

  const getStockColor = (stock: number) => {
    if (stock === 0) return 'text-red-600 dark:text-red-400';
    if (stock <= 10) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numPrice.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-neutral-900 p-4 sm:p-8 text-gray-900 dark:text-gray-200">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-teal-200 dark:bg-teal-900 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Gestión de Productos</h1>
              </div>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Administra tu inventario de productos
              </p>
            </div>
            <button
              onClick={handleCreateProduct}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition-colors font-medium w-full sm:w-auto"
            >
              <Plus className="w-5 h-5" />
              <span className="sm:inline">Nuevo producto</span>
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900/40 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-4 sm:mb-6 text-sm sm:text-base">
            {error}
          </div>
        )}

        {/* Delete / Desactivar producto modal */}
        <DeleteModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDeactivate}
          title={selectedProductToDelete ? `Desactivar producto "${selectedProductToDelete.name}"` : 'Desactivar producto'}
          message="¿Estás seguro de continuar con esta acción?"
          itemName={selectedProductToDelete?.name}
          loading={loadingDelete}
        />

        {/* Filters */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 p-4 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 min-w-full sm:min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-600 text-sm sm:text-base"
                />
              </div>
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2.5 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-lg text-gray-900 dark:text-gray-200 hover:border-gray-400 dark:hover:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-teal-600 text-sm sm:text-base w-full sm:w-auto"
            >
              <option value="">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

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
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors w-full sm:w-auto"
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
              <span className="text-sm font-medium">
                {statusFilter === "active"
                  ? "Activos"
                  : statusFilter === "inactive"
                  ? "Inactivos"
                  : "Todos"}
              </span>
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm sm:text-base">Cargando productos...</p>
          </div>
        )}

        {/* Table / Cards */}
        {!loading && (
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 overflow-hidden">
            {/* Vista Desktop */}
            <div className="hidden md:block scroll-container max-h-[calc(100vh-330px)] overflow-y-scroll">
              <table className="w-full">
                <thead className="sticky top-0 z-10 bg-gray-100 dark:bg-neutral-800 border-b border-gray-300 dark:border-neutral-700">
                  <tr>
                    {["Imagen", "Producto", "Categoría", "Precio", "Stock", "Estado", "Acciones"].map(
                      (title) => (
                        <th key={title} className="px-6 py-4 text-left">
                          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                            {title}
                          </div>
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-neutral-800 overflow-hidden flex items-center justify-center">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Image className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {product.name}
                          </div>
                          {product.description && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                              {product.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {product.category?.name || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {formatPrice(product.price)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-bold ${getStockColor(product.stock)}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {product.isActive ? (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span className="text-sm font-medium text-green-700 dark:text-green-300">
                              Activo
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                            <span className="text-sm font-medium text-red-700 dark:text-red-300">
                              Inactivo
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="p-2 text-teal-600 dark:text-teal-400 hover:bg-gray-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                            title="Editar producto"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {product.isActive && (
                            <button
                              onClick={() => handleDeactivate(product)}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                              title="Desactivar producto"
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

              {filteredProducts.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 dark:text-neutral-700 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No se encontraron productos</p>
                </div>
              )}
            </div>

            {/* Vista Mobile - Cards */}
            <div className="md:hidden divide-y divide-gray-200 dark:divide-neutral-700 max-h-[calc(100vh-400px)] overflow-y-auto">
              {filteredProducts.map((product) => (
                <div key={product.id} className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-neutral-800 overflow-hidden flex items-center justify-center flex-shrink-0">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Image className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-base mb-1">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                          {product.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          {product.category?.name || "Sin categoría"}
                        </span>
                        <span className="text-gray-400">•</span>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-green-500" />
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {formatPrice(product.price)}
                          </span>
                        </div>
                        <span className="text-gray-400">•</span>
                        <span className={`font-bold ${getStockColor(product.stock)}`}>
                          Stock: {product.stock}
                        </span>
                      </div>
                    </div>

                    {product.isActive ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-xs font-medium text-green-700 dark:text-green-300">
                          Activo
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        <span className="text-xs font-medium text-red-700 dark:text-red-300">
                          Inactivo
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="p-2 text-teal-600 dark:text-teal-400 hover:bg-gray-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                      title="Editar producto"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {product.isActive && (
                      <button
                        onClick={() => handleDeactivate(product)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                        title="Desactivar producto"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {filteredProducts.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 dark:text-neutral-700 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No se encontraron productos</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl max-w-2xl w-full p-4 sm:p-6 my-8 border border-gray-200 dark:border-neutral-700 max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">
                {editingProduct ? "Editar Producto" : "Nuevo Producto"}
              </h2>

              <div className="space-y-4">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Imagen del Producto
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Image className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                      )}
                    </div>

                    <label className="flex-1 w-full flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-lg hover:border-teal-500 transition-colors cursor-pointer text-gray-700 dark:text-gray-300">
                      <Upload className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                      <span className="text-sm truncate">
                        {imageFile ? imageFile.name : "Seleccionar imagen..."}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Form */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm sm:text-base"
                      placeholder="Nombre del producto"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Descripción
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm sm:text-base"
                      rows={2}
                      placeholder="Descripción del producto"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Precio *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm sm:text-base"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Stock *
                    </label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData({ ...formData, stock: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm sm:text-base"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Categoría
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) =>
                        setFormData({ ...formData, categoryId: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm sm:text-base"
                    >
                      <option value="">Sin categoría</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Proveedor
                    </label>
                    <select
                      value={formData.supplierId}
                      onChange={(e) =>
                        setFormData({ ...formData, supplierId: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm sm:text-base"
                    >
                      <option value="">Sin proveedor</option>
                      {suppliers.map((sup) => (
                        <option key={sup.id} value={sup.id}>
                          {sup.companyName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors font-medium text-sm sm:text-base"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-medium text-sm sm:text-base"
                  >
                    {editingProduct ? "Actualizar" : "Crear"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Product;