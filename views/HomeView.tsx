import React from 'react';
import { ProductCard } from '../components/ProductCard';
import { Category, Product } from '../types';
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
  // 각 카테고리에 대한 아이콘 경로를 정의합니다.
  // '전체'는 아이콘이 없으므로 null로 설정합니다.
  const categoryIcons: { name: Category; icon: string | null }[] = [
    { name: '전체', icon: null },
    { name: '상의', icon: '/assets/top.jpg' },
    { name: '하의', icon: '/assets/bottom.jpg' },
    { name: '아우터', icon: '/assets/outer.jpg' },
    { name: '신발', icon: '/assets/shoes.jpg' },
    { name: '모자', icon: '/assets/cap.jpg' },
    { name: '액세서리', icon: '/assets/bag.jpg' },
  ];

  return (
    <div className="pb-24 pt-14">
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <input 
              type="text"
              placeholder="상품 검색"
              className="w-full h-11 pl-10 pr-4 rounded-lg text-sm transition-all border border-gray-200 bg-gray-50 focus:ring-black focus:outline-none focus:ring-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-3.5 text-gray-400 text-sm"></i>
          </div>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {categoryIcons.map(({ name, icon }) => (
            <button
              key={name}
              onClick={() => setSelectedCategory(name)}
              className="flex flex-col items-center justify-center gap-1.5 flex-shrink-0 w-16"
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all border-2 ${
                selectedCategory === name ? 'border-black bg-gray-100' : 'border-transparent bg-gray-100'
              }`}>
                {icon ? (
                  <img src={icon} alt={name} className="w-8 h-8 object-contain" />
                ) : (
                  <span className="text-sm font-bold">ALL</span>
                )}
              </div>
              <span className={`text-xs font-medium transition-colors ${selectedCategory === name ? 'text-black' : 'text-gray-500'}`}>{name}</span>
            </button>
          ))}
        </div>
      </div>

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
