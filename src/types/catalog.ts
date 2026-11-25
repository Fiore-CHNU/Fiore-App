export type CatalogSort = 'newest' | 'priceAscending' | 'priceDescending';

export interface CatalogProductItem {
  id: string;
  sku: string;
  name: string;
  price: number;
  currency: string;
  imageUrl: string | null;
  isAvailable: boolean;
  occasions?: string[];
  flowerTypes?: string[];
  colors?: string[];
}

export interface PaginationMetadata {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ListProductsResponse {
  items: CatalogProductItem[];
  pagination: PaginationMetadata;
}

export interface ProductImage {
  id: string;
  imageUrl: string;
  altText: string | null;
  sortOrder: number;
}

export interface ProductComposition {
  flowerName: string;
  stemCount: number;
  note: string | null;
  sortOrder: number;
}

export type FacetKind = 'occasion' | 'flowerType' | 'color' | 'Occasion' | 'FlowerType' | 'Color';

export interface ProductFacet {
  id: string;
  kind: FacetKind;
  slug: string;
  name: string;
}

export interface CatalogFacetItem {
  id: string;
  kind: FacetKind;
  slug: string;
  name: string;
}

export interface ProductDetailsResponse {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  isAvailable: boolean;
  heightCm: number | null;
  widthCm: number | null;
  images: ProductImage[];
  composition: ProductComposition[];
  facets: ProductFacet[];
  packaging?: string | null;
}

export interface FilterState {
  search: string;
  sort: CatalogSort;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly: boolean;
  occasions: string[];
  flowerTypes: string[];
  colors: string[];
}
