import React from 'react';
import { ProductCard } from './ProductCard';
import { Product } from '../types';

interface RecentlyViewedViewProps {
  products: Product[];
  onBack: () => void;
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  likedProductIds: number[];
  onToggleLike: (e: React.MouseEvent, product: Product) => void;
}

export const RecentlyViewedView: React.FC<RecentlyViewedViewProps> = ({ 
  products, 
  onBack, 
  onProductClick, 
  onAddToCart, 
  likedProductIds,
  onToggleLike 
}) => {
  return (
    <div className="pb-24 px-4 pt-6 min-h-screen bg-white">
      <header className="flex items-center mb-6">
          <button onClick={onBack} className="w-10 h-10 flex items-center justify-center -ml-2 text-gray-800">
              <i className="fa-solid fa-arrow-left text-xl"></i>
          </button>
          <h2 className="text-2xl font-bold ml-2">최근 본 상품</h2>
      </header>
      
      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8">
          {products.map(product => (
            <ProductCard 
              key={product.id} 
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
              <i className="fa-regular fa-clock text-4xl mb-3"></i>
              <p>최근 본 상품이 없습니다.</p>
           </div>
      )}
    </div>
  );
};

