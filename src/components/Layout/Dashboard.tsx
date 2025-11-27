import { useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Package,
  AlertCircle,
  Calendar,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { usePurchaseStore } from '../../store/purchase.store';
import { useCustomerStore } from '../../store/customer.store';
import { useProductStore } from '../../store/product.store';

const Dashboard = () => {
  const { purchases, fetchPurchases } = usePurchaseStore();
  const { customers, fetchCustomers } = useCustomerStore();
  const { products, fetchProducts } = useProductStore();

  useEffect(() => {
    fetchPurchases();
    fetchCustomers();
    fetchProducts();
  }, []);


  const totalVentas = purchases.filter(p => p.isActive).length;
  const totalIngresos = purchases
    .filter(p => p.isActive)
    .reduce((sum, p) => sum + parseFloat(p.total.toString()), 0);

  const clientesActivos = customers.filter(c => c.isActive).length;

  const productosStock = products.filter(p => p.isActive && p.stock > 0).length;
  const productosStockBajo = products.filter(p => p.isActive && p.stock > 0 && p.stock <= 10).length;

  const getVentasPorMes = () => {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const ventasPorMes = new Array(6).fill(0);
    const hoy = new Date();
    
    purchases.filter(p => p.isActive).forEach(p => {
      const fecha = new Date(p.date);
      const diffMeses = (hoy.getFullYear() - fecha.getFullYear()) * 12 + (hoy.getMonth() - fecha.getMonth());
      if (diffMeses >= 0 && diffMeses < 6) {
        ventasPorMes[5 - diffMeses] += parseFloat(p.total.toString());
      }
    });

    const labels = [];
    for (let i = 5; i >= 0; i--) {
      const mes = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      labels.push(meses[mes.getMonth()]);
    }

    return { labels, data: ventasPorMes };
  };

  const ventasMensuales = getVentasPorMes();

  const getTopProductos = () => {
    const productosVendidos: { [key: string]: { nombre: string; cantidad: number } } = {};
    
    purchases.filter(p => p.isActive).forEach(p => {
      p.details?.forEach(d => {
        const key = d.product.id.toString();
        if (!productosVendidos[key]) {
          productosVendidos[key] = { nombre: d.product.name, cantidad: 0 };
        }
        productosVendidos[key].cantidad += d.quantity;
      });
    });

    return Object.values(productosVendidos)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);
  };

  const topProductos = getTopProductos();

  const ventasLineChart: ApexOptions = {
    chart: {
      type: 'area',
      height: 200,
      toolbar: { show: false },
      zoom: { enabled: false },
      background: 'transparent'
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    colors: ['#14b8a6'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
      }
    },
    xaxis: {
      categories: ventasMensuales.labels,
      labels: { style: { colors: '#9ca3af', fontSize: '10px' } }
    },
    yaxis: {
      labels: {
        style: { colors: '#9ca3af', fontSize: '10px' },
        formatter: (val) => `${val.toFixed(0)}`
      }
    },
    grid: {
      borderColor: '#4b5563',
      strokeDashArray: 4,
    },
    tooltip: {
      theme: 'dark',
      y: { formatter: (v) => `${v.toFixed(2)}` }
    }
  };

  const productosBarChart: ApexOptions = {
    chart: {
      type: 'bar',
      height: 200,
      background: 'transparent'
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 3,
      }
    },
    colors: ['#3b82f6'],
    dataLabels: {
      enabled: true,
      style: { fontSize: '9px', colors: ['#e5e7eb'] }
    },
    xaxis: {
      categories: topProductos.map(p => p.nombre.length > 12 ? p.nombre.substring(0, 12) + '...' : p.nombre),
      labels: { style: { colors: '#9ca3af', fontSize: '10px' } }
    },
    yaxis: {
      labels: { style: { colors: '#9ca3af', fontSize: '10px' } }
    },
    grid: {
      borderColor: '#4b5563',
      strokeDashArray: 4
    },
    tooltip: {
      theme: 'dark',
    }
  };

  const stockDonutChart: ApexOptions = {
    chart: { type: 'donut', height: 180, background: 'transparent' },
    labels: ['Normal', 'Bajo', 'Sin Stock'],
    colors: ['#10b981', '#f59e0b', '#ef4444'],
    dataLabels: {
      enabled: true,
      style: { colors: ['#e5e7eb'] }
    },
    legend: {
      position: 'bottom',
      labels: { colors: '#e5e7eb' }
    },
    tooltip: { theme: 'dark' }
  };

  const productosNormal = products.filter(p => p.isActive && p.stock > 10).length;
  const productosSinStock = products.filter(p => p.isActive && p.stock === 0).length;

  // =============================
  // RENDER
  // =============================
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 p-3 md:p-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-3">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}
          </p>
        </div>

        {/* TARJETAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          {/* Card */}
          <div className="bg-white dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="flex items-center text-green-600 text-[10px] font-medium">
                <ArrowUp className="w-3 h-3 mr-0.5" />12%
              </span>
            </div>
            <h3 className="text-gray-500 dark:text-gray-400 text-[10px]">Total Ventas</h3>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{totalVentas}</p>
          </div>

          {/* Ingresos */}
          <div className="bg-white dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <span className="flex items-center text-green-600 text-[10px] font-medium">
                <ArrowUp className="w-3 h-3 mr-0.5" />8%
              </span>
            </div>
            <h3 className="text-gray-500 dark:text-gray-400 text-[10px]">Ingresos Totales</h3>
            <p className="text-xl font-bold text-gray-900 dark:text-white">${totalIngresos.toFixed(2)}</p>
          </div>

          {/* Clientes */}
          <div className="bg-white dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="flex items-center text-green-600 text-[10px] font-medium">
                <ArrowUp className="w-3 h-3 mr-0.5" />5%
              </span>
            </div>
            <h3 className="text-gray-500 dark:text-gray-400 text-[10px]">Clientes Activos</h3>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{clientesActivos}</p>
          </div>

          {/* Stock */}
          <div className="bg-white dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="flex items-center text-red-600 text-[10px] font-medium">
                <ArrowDown className="w-3 h-3 mr-0.5" />3%
              </span>
            </div>
            <h3 className="text-gray-500 dark:text-gray-400 text-[10px]">Productos en Stock</h3>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{productosStock}</p>
          </div>
        </div>

        {/* ======================= */}
        {/* Gráficas principales */}
        {/* ======================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3">
          <div className="bg-white dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100">Ingresos Mensuales</h3>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Últimos 6 meses</p>
              </div>
              <TrendingUp className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            </div>
            <Chart 
              options={ventasLineChart} 
              series={[{ name: 'Ingresos', data: ventasMensuales.data }]} 
              type="area" 
              height={200} 
            />
          </div>

          {/* Top Productos */}
          <div className="bg-white dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100">Top 5 Productos</h3>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Más vendidos</p>
              </div>
              <Package className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            </div>
            <Chart 
              options={productosBarChart} 
              series={[{ name: 'Unidades', data: topProductos.map(p => p.cantidad) }]} 
              type="bar" 
              height={200} 
            />
          </div>

          {/* Donut */}
          <div className="bg-white dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-lg p-3">
            <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100 mb-2">Inventario</h3>
            <Chart 
              options={stockDonutChart} 
              series={[productosNormal, productosStockBajo, productosSinStock]} 
              type="donut" 
              height={180} 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

          {/* Stock bajo */}
          <div className="bg-white dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-8 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100">Alertas de Stock</h3>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Stock bajo</p>
              </div>
            </div>

            <div className="space-y-1.5 max-h-44 overflow-y-auto">
              {products
                .filter(p => p.isActive && p.stock <= 10)
                .slice(0, 6)
                .map(p => (
                  <div 
                    key={p.id} 
                    className="flex items-center justify-between p-1.5 bg-yellow-50 dark:bg-yellow-900/20 rounded"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-900 dark:text-gray-100 truncate">{p.name}</p>
                      <p className="text-[9px] text-gray-500 dark:text-gray-400">
                        {p.category?.name || 'Sin categoría'}
                      </p>
                    </div>

                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold ml-1.5 ${
                        p.stock === 0
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}
                    >
                      {p.stock}
                    </span>
                  </div>
                ))}

              {products.filter(p => p.isActive && p.stock <= 10).length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 text-[10px] py-4">
                  ✓ No hay productos con stock bajo
                </p>
              )}
            </div>
          </div>

          {/* Ventas Recientes */}
          <div className="bg-white dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-8 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100">Ventas Recientes</h3>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Últimas transacciones</p>
              </div>
            </div>

            <div className="space-y-1.5 max-h-44 overflow-y-auto">
              {purchases
                .filter(p => p.isActive)
                .slice(0, 6)
                .map(p => (
                  <div 
                    key={p.id} 
                    className="flex items-center justify-between p-1.5 bg-gray-50 dark:bg-neutral-700 rounded hover:bg-gray-100 dark:hover:bg-neutral-600 transition"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-medium text-gray-900 dark:text-gray-100 truncate">{p.customer.fullName}</p>
                      <p className="text-[9px] text-gray-500 dark:text-gray-400">
                        {new Date(p.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                      </p>
                    </div>

                    <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 ml-1.5">
                      ${parseFloat(p.total.toString()).toFixed(2)}
                    </span>
                  </div>
                ))}

              {purchases.filter(p => p.isActive).length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 text-[10px] py-4">
                  No hay ventas registradas
                </p>
              )}
            </div>
          </div>

          {/* Resumen Rápido */}
          <div className="bg-white dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-8 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100">Resumen Rápido</h3>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Métricas clave</p>
              </div>
            </div>

            <div className="space-y-2">
              {/* Promedio */}
              <div className="p-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/10 rounded border border-green-100 dark:border-green-900/50">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] text-gray-700 dark:text-gray-300">Promedio/Venta</span>
                  <DollarSign className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-lg font-bold text-green-700 dark:text-green-400">
                  ${totalVentas > 0 ? (totalIngresos / totalVentas).toFixed(2) : '0.00'}
                </p>
              </div>

              {/* Productos activos */}
              <div className="p-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/10 rounded border border-blue-100 dark:border-blue-900/50">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] text-gray-700 dark:text-gray-300">Productos Activos</span>
                  <Package className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-lg font-bold text-blue-700 dark:text-blue-400">
                  {products.filter(p => p.isActive).length}
                </p>
              </div>

              {/* Valor inventario */}
              <div className="p-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/10 rounded border border-purple-100 dark:border-purple-900/50">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] text-gray-700 dark:text-gray-300">Valor Inventario</span>
                  <TrendingUp className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-lg font-bold text-purple-700 dark:text-purple-400">
                  ${products
                    .filter(p => p.isActive)
                    .reduce((sum, p) => sum + (p.price * p.stock), 0)
                    .toFixed(2)}
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
