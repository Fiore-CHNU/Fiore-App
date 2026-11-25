import type {
  CatalogProductItem,
  ListProductsResponse,
  ProductDetailsResponse,
  CatalogSort,
  CatalogFacetItem,
  FacetKind,
} from '../types/catalog';

const API_BASE_URL = 'http://localhost:5162/api/v1';

export const DEFAULT_FACETS: CatalogFacetItem[] = [
  { id: '18e7e69d-c33a-4f99-bd09-83b152e1dbe8', kind: 'occasion', slug: 'wedding', name: 'Весілля' },
  { id: 'c6163af5-9350-44df-a029-0cabef0c5344', kind: 'occasion', slug: 'birthday', name: 'День народження' },
  { id: 'ebc63a89-dacc-430c-a481-79325bba9c80', kind: 'occasion', slug: 'gratitude', name: 'Подяка' },
  { id: 'ea59d8ec-4fd8-420b-8c34-2ee632305743', kind: 'occasion', slug: 'romantic', name: 'Романтика' },
  { id: '6ebe5034-c29e-46d0-b5c6-c4e38f5183e7', kind: 'flowerType', slug: 'hydrangeas', name: 'Гортензії' },
  { id: '7cb1301e-8830-4b87-bd7e-4d8a01811188', kind: 'flowerType', slug: 'peonies', name: 'Півонії' },
  { id: '80e850d1-f250-48ea-be4d-c3fd8bb8abf4', kind: 'flowerType', slug: 'roses', name: 'Троянди' },
  { id: 'cfe49105-8ab4-49e5-aa49-4cdf940bebf1', kind: 'flowerType', slug: 'tulips', name: 'Тюльпани' },
  { id: 'f49f3570-5779-432b-8548-f62366503902', kind: 'color', slug: 'white', name: 'Білий' },
  { id: '237cf781-1b3c-46a9-b2e6-fcbed4eb33f9', kind: 'color', slug: 'pastel', name: 'Пастельний' },
  { id: '910d9311-2b74-4999-85d4-f597d74c914f', kind: 'color', slug: 'pink', name: 'Рожевий' },
  { id: '1f3088d2-55de-472f-9bf2-21ae7b945822', kind: 'color', slug: 'red', name: 'Червоний' },
];

// Mock data matching the Figma mockups with Ukrainian attributes for local fallback
export const INITIAL_PRODUCTS: CatalogProductItem[] = [
  {
    id: 'b1e0f001-0000-0000-0000-000000000001',
    sku: 'FIO-001',
    name: 'Endless Flora Noir',
    price: 1800,
    currency: '₴',
    imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    occasions: ['romantic', 'wedding'],
    flowerTypes: ['roses'],
    colors: ['red'],
  },
  {
    id: 'b1e0f002-0000-0000-0000-000000000002',
    sku: 'FIO-002',
    name: 'Midnight Calla Harmony',
    price: 2200,
    currency: '₴',
    imageUrl: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    occasions: ['birthday', 'gratitude'],
    flowerTypes: ['peonies'],
    colors: ['pink'],
  },
  {
    id: 'b1e0f003-0000-0000-0000-000000000003',
    sku: 'FIO-003',
    name: 'Burgundy Protea & Roses',
    price: 1650,
    currency: '₴',
    imageUrl: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    occasions: ['romantic'],
    flowerTypes: ['roses'],
    colors: ['red'],
  },
  {
    id: 'b1e0f004-0000-0000-0000-000000000004',
    sku: 'FIO-004',
    name: 'White Lily Elegance',
    price: 1400,
    currency: '₴',
    imageUrl: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    occasions: ['wedding'],
    flowerTypes: ['hydrangeas'],
    colors: ['white'],
  },
  {
    id: 'b1e0f005-0000-0000-0000-000000000005',
    sku: 'FIO-005',
    name: 'Vintage Gardenia Romance',
    price: 1950,
    currency: '₴',
    imageUrl: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    occasions: ['romantic', 'birthday'],
    flowerTypes: ['peonies'],
    colors: ['pastel'],
  },
  {
    id: 'b1e0f006-0000-0000-0000-000000000006',
    sku: 'FIO-006',
    name: 'Blush Peony & Lilac Bloom',
    price: 2400,
    currency: '₴',
    imageUrl: 'https://images.unsplash.com/photo-1562690868-60bbe7293e94?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    occasions: ['birthday', 'gratitude'],
    flowerTypes: ['peonies'],
    colors: ['pink'],
  },
  {
    id: 'b1e0f007-0000-0000-0000-000000000007',
    sku: 'FIO-007',
    name: 'Royal Heritage Lilac',
    price: 1750,
    currency: '₴',
    imageUrl: 'https://images.unsplash.com/photo-1589244159943-460088ed5c92?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    occasions: ['gratitude'],
    flowerTypes: ['hydrangeas'],
    colors: ['pastel'],
  },
  {
    id: 'b1e0f008-0000-0000-0000-000000000008',
    sku: 'FIO-008',
    name: 'Wild Autumn Cascades',
    price: 1350,
    currency: '₴',
    imageUrl: 'https://images.unsplash.com/photo-1591886960571-74d43a9d4166?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    occasions: ['birthday'],
    flowerTypes: ['tulips'],
    colors: ['pastel'],
  },
  {
    id: 'b1e0f009-0000-0000-0000-000000000009',
    sku: 'FIO-009',
    name: 'Dark Velvet Meadow',
    price: 2100,
    currency: '₴',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    occasions: ['romantic'],
    flowerTypes: ['roses'],
    colors: ['red'],
  },
  {
    id: 'b1e0f010-0000-0000-0000-000000000010',
    sku: 'FIO-010',
    name: 'Silk Ranunculus & Roses',
    price: 1900,
    currency: '₴',
    imageUrl: 'https://images.unsplash.com/photo-1507290439931-a861b5a38200?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    occasions: ['wedding', 'birthday'],
    flowerTypes: ['roses', 'tulips'],
    colors: ['white', 'pink'],
  },
  {
    id: 'b1e0f011-0000-0000-0000-000000000011',
    sku: 'FIO-011',
    name: 'Crimson Orchid Splendor',
    price: 2600,
    currency: '₴',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    occasions: ['romantic', 'gratitude'],
    flowerTypes: ['roses'],
    colors: ['red'],
  },
  {
    id: 'b1e0f012-0000-0000-0000-000000000012',
    sku: 'FIO-012',
    name: 'Cobalt Twilight Thistle',
    price: 1250,
    currency: '₴',
    imageUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    occasions: ['gratitude'],
    flowerTypes: ['hydrangeas'],
    colors: ['white'],
  },
];

export async function fetchCatalogFacets(kind?: FacetKind): Promise<CatalogFacetItem[]> {
  try {
    const url = kind
      ? `${API_BASE_URL}/catalog/facets?kind=${kind}`
      : `${API_BASE_URL}/catalog/facets`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = (await res.json()) as CatalogFacetItem[];
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch {
    // Graceful fallback to default facets
  }

  if (kind) {
    const k = kind.toLowerCase();
    return DEFAULT_FACETS.filter(f => f.kind.toLowerCase() === k);
  }
  return DEFAULT_FACETS;
}

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
  occasions?: string[];
  flowerTypes?: string[];
  colors?: string[];
}): Promise<ListProductsResponse> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 12;

  const SORT_MAPPING: Record<CatalogSort, string> = {
    newest: 'Newest',
    priceAscending: 'PriceAscending',
    priceDescending: 'PriceDescending',
  };

  const selectedOccasion = params.occasion || params.occasions?.[0];
  const selectedFlowerType = params.flowerType || params.flowerTypes?.[0];
  const selectedColor = params.color || params.colors?.[0];

  try {
    const query = new URLSearchParams();
    query.set('Page', page.toString());
    query.set('PageSize', pageSize.toString());
    if (params.search) query.set('Search', params.search);
    if (params.sort) query.set('Sort', SORT_MAPPING[params.sort] || 'Newest');
    if (params.minPrice !== undefined) query.set('MinPrice', params.minPrice.toString());
    if (params.maxPrice !== undefined) query.set('MaxPrice', params.maxPrice.toString());
    if (params.inStockOnly) query.set('InStockOnly', 'true');
    if (selectedOccasion) query.set('Occasion', selectedOccasion);
    if (selectedFlowerType) query.set('FlowerType', selectedFlowerType);
    if (selectedColor) query.set('Color', selectedColor);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`${API_BASE_URL}/catalog/products?${query.toString()}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = (await res.json()) as ListProductsResponse;
      // If the backend answered with 200 OK, respect its result (even if items is empty)
      return {
        items: data.items.map(item => ({
          ...item,
          currency: item.currency === 'UAH' ? '₴' : item.currency,
        })),
        pagination: data.pagination,
      };
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
  if (params.occasions && params.occasions.length > 0) {
    filtered = filtered.filter(p =>
      p.occasions && params.occasions!.some(occ => p.occasions!.includes(occ))
    );
  }
  if (params.flowerTypes && params.flowerTypes.length > 0) {
    filtered = filtered.filter(p =>
      p.flowerTypes && params.flowerTypes!.some(fl => p.flowerTypes!.includes(fl))
    );
  }
  if (params.colors && params.colors.length > 0) {
    filtered = filtered.filter(p =>
      p.colors && params.colors!.some(col => p.colors!.includes(col))
    );
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
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(`${API_BASE_URL}/catalog/products/${id}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = (await res.json()) as ProductDetailsResponse;
      return {
        ...data,
        currency: data.currency === 'UAH' ? '₴' : data.currency,
      };
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
      { id: 'f-1', kind: 'occasion', slug: 'birthday', name: 'День народження' },
      { id: 'f-2', kind: 'flowerType', slug: 'roses', name: 'Троянди' },
      { id: 'f-3', kind: 'color', slug: 'red', name: 'Червоний' },
    ],
    packaging: 'Преміальний матовий папір, дизайнерська атласна стрічка та захисний аквабокс для збереження свіжості',
  };
}

export async function fetchSimilarProducts(
  productId: string,
  currentProduct?: {
    price?: number;
    facets?: { kind: string; slug: string }[];
  }
): Promise<CatalogProductItem[]> {
  const flowerTypeSlug = currentProduct?.facets?.find(
    f => f.kind.toLowerCase() === 'flowertype'
  )?.slug;
  const occasionSlug = currentProduct?.facets?.find(
    f => f.kind.toLowerCase() === 'occasion'
  )?.slug;
  const targetPrice = currentProduct?.price ?? 1800;

  try {
    // Fetch products matching flower type, occasion, and general catalog in parallel
    const [sameFlowerRes, sameOccasionRes, generalRes] = await Promise.all([
      flowerTypeSlug
        ? fetchCatalogProducts({ flowerType: flowerTypeSlug, pageSize: 8 })
        : Promise.resolve({ items: [] }),
      occasionSlug
        ? fetchCatalogProducts({ occasion: occasionSlug, pageSize: 8 })
        : Promise.resolve({ items: [] }),
      fetchCatalogProducts({ pageSize: 12 }),
    ]);

    // Gather candidate items from backend
    const flowerItemIds = new Set(sameFlowerRes.items.map(p => p.id));
    const occasionItemIds = new Set(sameOccasionRes.items.map(p => p.id));

    // Combine all candidates excluding current product
    const candidateMap = new Map<string, CatalogProductItem>();
    for (const item of [...sameFlowerRes.items, ...sameOccasionRes.items, ...generalRes.items]) {
      if (item.id !== productId && !candidateMap.has(item.id)) {
        candidateMap.set(item.id, item);
      }
    }

    const candidates = Array.from(candidateMap.values());

    if (candidates.length > 0) {
      // Score candidates: same flower (+10), same occasion (+5), available (+3), closer price
      candidates.sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;

        if (flowerItemIds.has(a.id)) scoreA += 10;
        if (flowerItemIds.has(b.id)) scoreB += 10;

        if (occasionItemIds.has(a.id)) scoreA += 5;
        if (occasionItemIds.has(b.id)) scoreB += 5;

        if (a.isAvailable) scoreA += 3;
        if (b.isAvailable) scoreB += 3;

        const priceDiffA = Math.abs(a.price - targetPrice);
        const priceDiffB = Math.abs(b.price - targetPrice);

        if (scoreA !== scoreB) {
          return scoreB - scoreA;
        }
        return priceDiffA - priceDiffB;
      });

      return candidates.slice(0, 4);
    }
  } catch {
    // Fallback if network fails
  }

  // Offline / local fallback matching on INITIAL_PRODUCTS
  return [...INITIAL_PRODUCTS]
    .filter(p => p.id !== productId)
    .sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      if (flowerTypeSlug && a.flowerTypes?.includes(flowerTypeSlug)) scoreA += 10;
      if (flowerTypeSlug && b.flowerTypes?.includes(flowerTypeSlug)) scoreB += 10;

      if (occasionSlug && a.occasions?.includes(occasionSlug)) scoreA += 5;
      if (occasionSlug && b.occasions?.includes(occasionSlug)) scoreB += 5;

      if (a.isAvailable) scoreA += 3;
      if (b.isAvailable) scoreB += 3;

      const priceDiffA = Math.abs(a.price - targetPrice);
      const priceDiffB = Math.abs(b.price - targetPrice);

      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }
      return priceDiffA - priceDiffB;
    })
    .slice(0, 4);
}
