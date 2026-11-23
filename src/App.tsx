import { useState } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { CatalogPage } from './pages/CatalogPage';
import { CartDrawer } from './components/cart/CartDrawer';
import { ProductDetailsModal } from './components/product/ProductDetailsModal';
import { CartProvider } from './context/CartContext';
import { useCart } from './hooks/useCart';
import type { CatalogProductItem } from './types/catalog';

function AppContent() {
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
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}

export default App;
