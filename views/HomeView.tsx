import React from 'react';
import { ProductCard } from '../components/ProductCard';
import { Category } from '../types';
import { CATEGORIES } from '../constants';

interface HomeViewProps {
  selectedCategory: Category;
  setSelectedCategory: (category: Category) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredProducts: Product[];
  likedProductIds: number[];
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
  onToggleLike: (e: React.MouseEvent, product: Product) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  filteredProducts,
  likedProductIds,
  onAddToCart,
  onProductClick,
  onToggleLike,
}) => {
  return (
    <div className="pb-24">
      <header className="sticky top-0 bg-white z-40 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-black rounded-lg flex items-center justify-center shrink-0 shadow-md">
              <i className="fa-solid fa-shirt text-white text-sm"></i>
            </div>
            <div className="relative flex-1">
              <input 
                type="text"
                placeholder="상품 검색"
                className="w-full h-10 pl-9 pr-3 rounded-lg text-sm transition-all border border-gray-200 bg-gray-50 focus:ring-black focus:outline-none focus:ring-1"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-3 text-gray-400 text-sm"></i>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat 
                    ? 'bg-black text-white' 
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="px-4 pt-4">
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            {`상품 목록 (${filteredProducts.length})`}
          </h2>
          <span className="text-xs text-gray-500">신상품순</span>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8">
            {filteredProducts.map((product, index) => (
              <ProductCard 
                key={`product-${product.id}-${index}`} 
                product={product} 
                onAddToCart={onAddToCart} 
                onClick={onProductClick}
                isLiked={likedProductIds.includes(product.id)}
                onToggleLike={onToggleLike}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <i className="fa-regular fa-face-sad-tear text-4xl mb-3"></i>
            <p>조건에 맞는 상품이 없습니다.</p>
          </div>
        )}
      </main>
    </div>
  );
};

