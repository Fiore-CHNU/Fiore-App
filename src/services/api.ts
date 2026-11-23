import type { CatalogProductItem, ListProductsResponse, ProductDetailsResponse, CatalogSort } from '../types/catalog';

const API_BASE_URL = 'http://localhost:5162/api/v1';

// Mock data matching the Figma mockups (Catalog-1.png & card.png)
export const INITIAL_PRODUCTS: CatalogProductItem[] = [
  {
    id: 'b1e0f001-0000-0000-0000-000000000001',
    sku: 'FIO-001',
    name: 'Endless Flora Noir',
    price: 1800,
    currency: '₴',
    imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
  },
  {
    id: 'b1e0f002-0000-0000-0000-000000000002',
    sku: 'FIO-002',
    name: 'Midnight Calla Harmony',
    price: 2200,
    currency: '₴',
    imageUrl: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
  },
  {
    id: 'b1e0f003-0000-0000-0000-000000000003',
    sku: 'FIO-003',
    name: 'Burgundy Protea & Roses',
    price: 1650,
    currency: '₴',
    imageUrl: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
  },
  {
    id: 'b1e0f004-0000-0000-0000-000000000004',
    sku: 'FIO-004',
    name: 'White Lily Elegance',
    price: 1400,
    currency: '₴',
    imageUrl: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
  },
  {
    id: 'b1e0f005-0000-0000-0000-000000000005',
    sku: 'FIO-005',
    name: 'Vintage Gardenia Romance',
    price: 1950,
    currency: '₴',
    imageUrl: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
  },
  {
    id: 'b1e0f006-0000-0000-0000-000000000006',
    sku: 'FIO-006',
    name: 'Blush Peony & Lilac Bloom',
    price: 2400,
    currency: '₴',
    imageUrl: 'https://images.unsplash.com/photo-1562690868-60bbe7293e94?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
  },
  {
    id: 'b1e0f007-0000-0000-0000-000000000007',
    sku: 'FIO-007',
    name: 'Royal Heritage Lilac',
    price: 1750,
    currency: '₴',
    imageUrl: 'https://images.unsplash.com/photo-1589244159943-460088ed5c92?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
  },
  {
    id: 'b1e0f008-0000-0000-0000-000000000008',
    sku: 'FIO-008',
    name: 'Wild Autumn Cascades',
    price: 1350,
    currency: '₴',
    imageUrl: 'https://images.unsplash.com/photo-1591886960571-74d43a9d4166?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
  },
  {
    id: 'b1e0f009-0000-0000-0000-000000000009',
    sku: 'FIO-009',
    name: 'Dark Velvet Meadow',
    price: 2100,
    currency: '₴',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
  },
  {
    id: 'b1e0f010-0000-0000-0000-000000000010',
    sku: 'FIO-010',
    name: 'Silk Ranunculus & Roses',
    price: 1900,
    currency: '₴',
    imageUrl: 'https://images.unsplash.com/photo-1507290439931-a861b5a38200?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
  },
  {
    id: 'b1e0f011-0000-0000-0000-000000000011',
    sku: 'FIO-011',
    name: 'Crimson Orchid Splendor',
    price: 2600,
    currency: '₴',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
  },
  {
    id: 'b1e0f012-0000-0000-0000-000000000012',
    sku: 'FIO-012',
    name: 'Cobalt Twilight Thistle',
    price: 1250,
    currency: '₴',
    imageUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
  },
];

export async function fetchCatalogProducts(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: CatalogSort;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  occasion?: string;
  flowerType?: string;
  color?: string;
}): Promise<ListProductsResponse> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 12;

  const SORT_MAPPING: Record<CatalogSort, string> = {
    newest: 'Newest',
    priceAscending: 'PriceAscending',
    priceDescending: 'PriceDescending',
  };

  try {
    const query = new URLSearchParams();
    query.set('Page', page.toString());
    query.set('PageSize', pageSize.toString());
    if (params.search) query.set('Search', params.search);
    if (params.sort) query.set('Sort', SORT_MAPPING[params.sort] || 'Newest');
    if (params.minPrice !== undefined) query.set('MinPrice', params.minPrice.toString());
    if (params.maxPrice !== undefined) query.set('MaxPrice', params.maxPrice.toString());
    if (params.inStockOnly) query.set('InStockOnly', 'true');
    if (params.occasion) query.set('Occasion', params.occasion);
    if (params.flowerType) query.set('FlowerType', params.flowerType);
    if (params.color) query.set('Color', params.color);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${API_BASE_URL}/catalog/products?${query.toString()}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = (await res.json()) as ListProductsResponse;
      if (data.items && data.items.length > 0) {
        return data;
      }
    }
  } catch {
    // Graceful fallback to client-side filtering matching backend behavior
  }

  // Filter mock products
  let filtered = [...INITIAL_PRODUCTS];

  if (params.search) {
    const s = params.search.toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s));
  }
  if (params.minPrice !== undefined) {
    filtered = filtered.filter(p => p.price >= params.minPrice!);
  }
  if (params.maxPrice !== undefined) {
    filtered = filtered.filter(p => p.price <= params.maxPrice!);
  }
  if (params.inStockOnly) {
    filtered = filtered.filter(p => p.isAvailable);
  }

  // Sorting
  if (params.sort === 'priceAscending') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (params.sort === 'priceDescending') {
    filtered.sort((a, b) => b.price - a.price);
  }

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (page - 1) * pageSize;
  const items = filtered.slice(startIndex, startIndex + pageSize);

  return {
    items,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages,
    },
  };
}

export async function fetchProductDetails(id: string): Promise<ProductDetailsResponse | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${API_BASE_URL}/catalog/products/${id}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      return (await res.json()) as ProductDetailsResponse;
    }
  } catch {
    // fallback
  }

  const product = INITIAL_PRODUCTS.find(p => p.id === id) || INITIAL_PRODUCTS[0];
  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    description: 'Ексклюзивний букет ручної роботи з преміальних квітів. Створено з ніжністю та увагою до найменших деталей для незабутніх моментів.',
    price: product.price,
    currency: '₴',
    isAvailable: product.isAvailable,
    heightCm: 45,
    widthCm: 35,
    images: [
      { id: 'img-1', imageUrl: product.imageUrl || '', altText: product.name, sortOrder: 1 },
      { id: 'img-2', imageUrl: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80', altText: 'Side angle', sortOrder: 2 },
      { id: 'img-3', imageUrl: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80', altText: 'Close-up detail', sortOrder: 3 },
    ],
    composition: [
      { flowerName: 'Півонієподібна троянда', stemCount: 7, note: 'Сорт Red Piano', sortOrder: 1 },
      { flowerName: 'Калла', stemCount: 3, note: 'Black Star', sortOrder: 2 },
      { flowerName: 'Гортензія', stemCount: 2, note: 'Вінтажна бордо', sortOrder: 3 },
      { flowerName: 'Евкаліпт', stemCount: 5, note: 'Cinerea', sortOrder: 4 },
    ],
    facets: [
      { id: 'f-1', kind: 'Occasion', slug: 'birthday', name: 'День народження' },
      { id: 'f-2', kind: 'FlowerType', slug: 'roses', name: 'Троянди' },
      { id: 'f-3', kind: 'Color', slug: 'plum', name: 'Бордовий' },
    ],
  };
}
