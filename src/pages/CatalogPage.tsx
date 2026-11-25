import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { FilterSidebar } from '../components/catalog/FilterSidebar';
import { CatalogGrid } from '../components/catalog/CatalogGrid';
import { SortSelector } from '../components/catalog/SortSelector';
import type { CatalogProductItem, FilterState, CatalogSort, CatalogFacetItem } from '../types/catalog';
import { fetchCatalogProducts, fetchCatalogFacets, DEFAULT_FACETS } from '../services/api';

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
  const [facets, setFacets] = useState<CatalogFacetItem[]>(DEFAULT_FACETS);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

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

  // Load facets from backend on mount
  useEffect(() => {
    let isMounted = true;
    fetchCatalogFacets()
      .then(data => {
        if (isMounted && data && data.length > 0) {
          setFacets(data);
        }
      })
      .catch(() => {
        // Keeps DEFAULT_FACETS
      });
    return () => {
      isMounted = false;
    };
  }, []);

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
        inStockOnly: filters.inStockOnly,
        occasions: filters.occasions,
        flowerTypes: filters.flowerTypes,
        colors: filters.colors,
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

  // Trigger search/filter whenever any filter criterion changes
  useEffect(() => {
    setPage(1);
    loadData(1, true);
  }, [
    filters.sort,
    filters.minPrice,
    filters.maxPrice,
    filters.search,
    filters.occasions,
    filters.flowerTypes,
    filters.colors,
    filters.inStockOnly,
    loadData,
  ]);

  // Lock body scroll and listen for Escape when mobile filter drawer is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileFiltersOpen(false);
      }
    };
    if (isMobileFiltersOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isMobileFiltersOpen]);

  const activeFiltersCount =
    filters.occasions.length +
    filters.flowerTypes.length +
    filters.colors.length +
    (filters.minPrice !== undefined || (filters.maxPrice !== undefined && filters.maxPrice < 3500) ? 1 : 0);

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
      {/* Top Bar: Search and Sort By */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        {/* Search Bar pill */}
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
              title="Очистити"
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

        {/* Mobile Filter Trigger + Sort Selector Row */}
        <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-full bg-[#2E1229] border border-[#522149] text-white/90 hover:text-white hover:border-[#F5B2E2]/60 hover:bg-[#3D1A37] transition-all text-[13px] font-sans font-medium tracking-wide"
          >
            <Filter className="w-4 h-4 text-[#F5B2E2]" strokeWidth={2} />
            <span>Фільтри</span>
            {activeFiltersCount > 0 && (
              <span className="bg-[#F5B2E2] text-[#1E0B1A] text-[11px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                {activeFiltersCount}
              </span>
            )}
          </button>

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
            title="Скинути пошук"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Catalog Layout: Desktop Sidebar + Grid */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="hidden lg:block shrink-0">
          <FilterSidebar
            filters={filters}
            facets={facets}
            onChangeFilters={setFilters}
            onReset={handleResetFilters}
            onApply={() => loadData(1, true)}
          />
        </div>

        <CatalogGrid
          products={products}
          isLoading={isLoading}
          hasMore={page < totalPages}
          onLoadMore={handleLoadMore}
          onAddToCart={onAddToCart}
          onSelectProduct={onSelectProduct}
        />
      </div>

      {/* Mobile Filter Drawer (lg:hidden) */}
      {isMobileFiltersOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex justify-start" role="dialog" aria-modal="true">
          <div
            onClick={() => setIsMobileFiltersOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in"
          />
          <div className="relative w-full max-w-[320px] h-full bg-[#3A1633] border-r border-[#522149] overflow-y-auto z-10 shadow-2xl">
            <FilterSidebar
              filters={filters}
              facets={facets}
              onChangeFilters={setFilters}
              onReset={() => {
                handleResetFilters();
                setIsMobileFiltersOpen(false);
              }}
              onApply={() => {
                loadData(1, true);
                setIsMobileFiltersOpen(false);
              }}
              onClose={() => setIsMobileFiltersOpen(false)}
              className="border-0 shadow-none rounded-none"
            />
          </div>
        </div>
      )}
    </main>
  );
};
