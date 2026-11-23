import React, { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { FilterSidebar } from '../components/catalog/FilterSidebar';
import { CatalogGrid } from '../components/catalog/CatalogGrid';
import type { CatalogProductItem, FilterState, CatalogSort } from '../types/catalog';
import { fetchCatalogProducts } from '../services/api';

interface CatalogPageProps {
  onAddToCart: (product: CatalogProductItem) => void;
  onSelectProduct?: (product: CatalogProductItem) => void;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({
  onAddToCart,
  onSelectProduct,
}) => {
  const [products, setProducts] = useState<CatalogProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    sort: 'newest',
    minPrice: undefined,
    maxPrice: undefined,
    inStockOnly: false,
    occasions: [],
    flowerTypes: [],
    colors: [],
  });

  const loadData = useCallback(async (pageNum: number, isNewSearch = false) => {
    setIsLoading(true);
    try {
      const response = await fetchCatalogProducts({
        page: pageNum,
        pageSize: 9,
        search: filters.search.trim() || undefined,
        sort: filters.sort,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
      });

      if (isNewSearch) {
        setProducts(response.items);
      } else {
        setProducts(prev => (pageNum === 1 ? response.items : [...prev, ...response.items]));
      }
      setTotalPages(response.pagination.totalPages);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    setPage(1);
    loadData(1, true);
  }, [filters.sort, filters.minPrice, filters.maxPrice, loadData]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData(1, true);
  };

  const handleSortChange = (sort: CatalogSort) => {
    setFilters(prev => ({ ...prev, sort }));
    setIsSortOpen(false);
  };

  const handleLoadMore = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadData(nextPage, false);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      sort: 'newest',
      minPrice: undefined,
      maxPrice: undefined,
      inStockOnly: false,
      occasions: [],
      flowerTypes: [],
      colors: [],
    });
  };

  return (
    <main className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-8">
      {/* Top Bar: Search and Sort By matching Figma */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        {/* Search Bar pill matching Figma */}
        <form
          onSubmit={handleSearchSubmit}
          className="w-full md:max-w-xl flex items-center bg-[#FFD7F1] rounded-full overflow-hidden shadow-inner px-2 py-1"
        >
          <input
            type="text"
            value={filters.search}
            onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
            placeholder="Пошук квітів, сортів, букетів..."
            className="flex-1 bg-transparent px-4 py-1.5 text-[#1E0B1A] placeholder-[#1E0B1A]/50 focus:outline-none text-[14px] font-sans"
          />
          <button
            type="submit"
            aria-label="Пошук"
            className="w-9 h-9 rounded-full bg-[#4E1E45] hover:bg-[#68355D] flex items-center justify-center text-white transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>

        {/* Sort By Dropdown matching Figma */}
        <div className="relative self-end md:self-auto">
          <button
            onClick={() => setIsSortOpen(prev => !prev)}
            className="flex items-center gap-2 text-white hover:text-[#F5B2E2] font-sans text-[14px] tracking-wide font-medium transition-colors"
          >
            <span>Sort By</span>
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {isSortOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[#3A1633] border border-[#522149] rounded-xl shadow-2xl py-2 z-20 text-[13px] animate-scale-in">
              <button
                onClick={() => handleSortChange('newest')}
                className={`w-full text-left px-4 py-2 hover:bg-[#5C234E] transition-colors ${
                  filters.sort === 'newest' ? 'text-[#F5B2E2] font-bold' : 'text-white'
                }`}
              >
                Новинки (Newest)
              </button>
              <button
                onClick={() => handleSortChange('priceAscending')}
                className={`w-full text-left px-4 py-2 hover:bg-[#5C234E] transition-colors ${
                  filters.sort === 'priceAscending' ? 'text-[#F5B2E2] font-bold' : 'text-white'
                }`}
              >
                Ціна: від низької
              </button>
              <button
                onClick={() => handleSortChange('priceDescending')}
                className={`w-full text-left px-4 py-2 hover:bg-[#5C234E] transition-colors ${
                  filters.sort === 'priceDescending' ? 'text-[#F5B2E2] font-bold' : 'text-white'
                }`}
              >
                Ціна: від високої
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Catalog Layout: Sidebar + Grid */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <FilterSidebar
          filters={filters}
          onChangeFilters={setFilters}
          onReset={handleResetFilters}
          onApply={() => loadData(1, true)}
        />

        <CatalogGrid
          products={products}
          isLoading={isLoading}
          hasMore={page < totalPages}
          onLoadMore={handleLoadMore}
          onAddToCart={onAddToCart}
          onSelectProduct={onSelectProduct}
        />
      </div>
    </main>
  );
};
