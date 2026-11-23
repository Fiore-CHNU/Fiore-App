import { useState } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { CatalogPage } from './pages/CatalogPage';
import type { CatalogProductItem } from './types/catalog';

export function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<{ product: CatalogProductItem; quantity: number }[]>([]);

  const handleAddToCart = (product: CatalogProductItem) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#1E0B1A] text-white">
      <Header
        cartItemCount={totalCartCount}
        onOpenCart={() => alert(`Кошик: ${totalCartCount} товарів`)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="flex-1">
        <CatalogPage
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddToCart={handleAddToCart}
        />
      </div>

      <Footer />
    </div>
  );
}

export default App;
