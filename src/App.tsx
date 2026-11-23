import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { CatalogPage } from './pages/CatalogPage';
import { CartDrawer } from './components/cart/CartDrawer';
import { ProductDetailsModal } from './components/product/ProductDetailsModal';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { useCart } from './hooks/useCart';
import type { CatalogProductItem } from './types/catalog';

function ShopLayout() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<CatalogProductItem | null>(null);
  const { addToCart } = useCart();

  const handleAddToCart = (product: CatalogProductItem) => {
    addToCart(product);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#1E0B1A] text-white">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectProduct={setSelectedProduct}
      />

      <div className="flex-1">
        <CatalogPage
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddToCart={handleAddToCart}
          onSelectProduct={setSelectedProduct}
        />
      </div>

      <Footer />
      <CartDrawer />

      {selectedProduct && (
        <ProductDetailsModal
          productId={selectedProduct.id}
          onClose={() => setSelectedProduct(null)}
          onSelectProduct={setSelectedProduct}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          {/* Client-side Catalog and Shop */}
          <Route path="/" element={<ShopLayout />} />

          {/* Admin / Staff Login (US-7.1 / EAN-426 / EAN-428) */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Protected Staff Dashboard (US-7.1 Scenario 1 & 4) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
