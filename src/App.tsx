import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { CatalogPage } from './pages/CatalogPage';
import { CartDrawer } from './components/cart/CartDrawer';
import { ProductDetailsModal } from './components/product/ProductDetailsModal';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { CheckoutPage } from './pages/checkout/CheckoutPage';
import { OrderThanksPage, PaymentPage, TrackOrderPage } from './pages/order/OrderPages';
import { PaymentExpiredPage } from './pages/order/PaymentExpiredPage';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { useCart } from './hooks/useCart';
import type { CatalogProductItem } from './types/catalog';

interface LayoutProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

/** Header, footer, and cart drawer shared by every customer page. */
function SiteLayout({ searchQuery, onSearchChange }: LayoutProps) {
  const { pathname } = useLocation();

  // A new page starts at the top instead of keeping the catalogue's scroll position.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-[#1E0B1A] text-white">
      <Header searchQuery={searchQuery} onSearchChange={onSearchChange} />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
      <CartDrawer />
    </div>
  );
}

function CatalogRoute({ searchQuery, onSearchChange }: LayoutProps) {
  const [selectedProduct, setSelectedProduct] = useState<CatalogProductItem | null>(null);
  const { addToCart } = useCart();

  const handleAddToCart = (product: CatalogProductItem) => {
    void addToCart(product);
  };

  return (
    <>
      <CatalogPage
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onAddToCart={handleAddToCart}
        onSelectProduct={setSelectedProduct}
      />
      {selectedProduct && (
        <ProductDetailsModal
          productId={selectedProduct.id}
          onClose={() => setSelectedProduct(null)}
          onSelectProduct={setSelectedProduct}
          onAddToCart={handleAddToCart}
        />
      )}
    </>
  );
}

function AppRoutes() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Searching from another page returns the customer to the catalogue with the query applied.
  const searchFromAnyPage = (query: string) => {
    setSearchQuery(query);
    if (window.location.pathname !== '/') navigate('/');
  };

  return (
    <Routes>
      <Route element={<SiteLayout searchQuery={searchQuery} onSearchChange={searchFromAnyPage} />}>
        <Route path="/" element={<CatalogRoute searchQuery={searchQuery} onSearchChange={setSearchQuery} />} />
        {/* Guest checkout (US-4.x), sandbox payment (US-5.1), expiry (US-5.2), public status link (US-6.2) */}
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order/:orderId/payment" element={<PaymentPage />} />
        <Route path="/order/:orderId/thanks" element={<OrderThanksPage />} />
        <Route path="/order/:orderId/expired" element={<PaymentExpiredPage />} />
        <Route path="/track/:trackingCode" element={<TrackOrderPage />} />
      </Route>

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
  );
}

export function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppRoutes />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
