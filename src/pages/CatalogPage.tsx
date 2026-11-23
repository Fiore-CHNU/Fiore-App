import React, { useState, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { FilterSidebar } from '../components/catalog/FilterSidebar';
import { CatalogGrid } from '../components/catalog/CatalogGrid';
import { SortSelector } from '../components/catalog/SortSelector';
import type { CatalogProductItem, FilterState, CatalogSort } from '../types/catalog';
import { fetchCatalogProducts } from '../services/api';

interface CatalogPageProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddToCart: (product: CatalogProductItem) => void;
  onSelectProduct?: (product: CatalogProductItem) => void;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({
  searchQuery,
  onSearchChange,
  onAddToCart,
  onSelectProduct,
}) => {
  const [products, setProducts] = useState<CatalogProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState<FilterState>({
    search: searchQuery,
    sort: 'newest',
    minPrice: undefined,
    maxPrice: undefined,
    inStockOnly: false,
    occasions: [],
    flowerTypes: [],
    colors: [],
  });

  // Sync internal search when top header search changes
  useEffect(() => {
    setFilters(prev => ({ ...prev, search: searchQuery }));
  }, [searchQuery]);

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
  }, [filters.sort, filters.minPrice, filters.maxPrice, filters.search, loadData]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData(1, true);
  };

  const handleSortChange = (sort: CatalogSort) => {
    setFilters(prev => ({ ...prev, sort }));
  };

  const handleLoadMore = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadData(nextPage, false);
    }
  };

  const handleResetFilters = () => {
    onSearchChange('');
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
          className="w-full md:max-w-xl flex items-center bg-[#FFD7F1] rounded-full overflow-hidden shadow-inner px-2 py-1 transition-all focus-within:ring-2 focus-within:ring-[#F5B2E2]"
        >
          <input
            type="text"
            value={filters.search}
            onChange={e => {
              const val = e.target.value;
              setFilters(prev => ({ ...prev, search: val }));
              onSearchChange(val);
            }}
            placeholder="Пошук квітів, сортів, букетів..."
            className="flex-1 bg-transparent px-4 py-1.5 text-[#1E0B1A] placeholder-[#1E0B1A]/50 focus:outline-none text-[14px] font-sans font-medium"
          />

          {filters.search && (
            <button
              type="button"
              onClick={() => {
                setFilters(prev => ({ ...prev, search: '' }));
                onSearchChange('');
              }}
              className="p-1 mr-1 text-[#1E0B1A]/60 hover:text-[#1E0B1A]"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            aria-label="Пошук"
            className="w-9 h-9 rounded-full bg-[#4E1E45] hover:bg-[#68355D] flex items-center justify-center text-white transition-colors shrink-0"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>

        {/* Dedicated Sort Selector Component (US-1.5.2) */}
        <div className="self-end md:self-auto">
          <SortSelector
            currentSort={filters.sort}
            onSortChange={handleSortChange}
          />
        </div>
      </div>

      {/* Active Search Badge */}
      {filters.search && (
        <div className="mb-6 flex items-center gap-2 text-sm text-[#FFD7F1] bg-[#35142E] px-4 py-2 rounded-xl border border-[#4F1E44] w-fit">
          <span>Результати за запитом: <strong>"{filters.search}"</strong></span>
          <button
            onClick={() => {
              setFilters(prev => ({ ...prev, search: '' }));
              onSearchChange('');
            }}
            className="ml-2 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

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
