import React, { type JSX } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Navbar from "./pages/Navbar";
import UserPage from "./pages/UserPage";
import { useAuthStore } from "./store/auth.store";
import CustomerPage from "./pages/CustomerPage";
import ShoppingPage from "./pages/ShoppingPage";
import CategoryPage from "./pages/Category";
import SupplierPage from "./pages/Supplier";
import ProductPage from "./pages/ProductPage";
import PurchasePage from "./pages/PurchasePage";
import DashboardPage from "./pages/Dashboard";

// Rutas protegidas
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuthStore();
  return user ? children : <Navigate to="/login" replace />;
};

// Si está autenticado, no debe volver a /login
const AuthRedirect = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuthStore();
  return user ? <Navigate to="/dashboard" replace /> : children;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <AuthRedirect>
              <AuthPage />
            </AuthRedirect>
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navbar/>
            </ProtectedRoute>
          }
        >
         
          <Route index element={<Navigate to="/dashboard" replace />} />

          <Route path="dashboard" element={<DashboardPage/>}/>
          <Route path="user" element={<UserPage />} />
          <Route path="customer" element={<CustomerPage/>} />
           {/* <Route path="shopping" element={<ShoppingPage/>} /> */}
           <Route path="category" element={<CategoryPage/>} />
            <Route path="suppliers" element={<SupplierPage/>} />
             <Route path="product" element={<ProductPage/>} />
              <Route path="purchase" element={<PurchasePage/>} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
