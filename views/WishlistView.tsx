import React from 'react';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types';

interface WishlistViewProps {
  products: Product[];
  onBack: () => void;
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onToggleLike: (e: React.MouseEvent, product: Product) => void;
}

export const WishlistView: React.FC<WishlistViewProps> = ({ 
  products, 
  onBack, 
  onProductClick, 
  onAddToCart, 
  onToggleLike 
}) => {
  return (
    <div className="pb-24 pt-14 px-4 pt-6 min-h-screen bg-white">
      
      <h2 className="text-2xl font-bold my-4">찜한 상품</h2>
      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8">
          {products.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAddToCart={onAddToCart} 
              onClick={onProductClick}
              isLiked={true}
              onToggleLike={onToggleLike}
            />
          ))}
        </div>
      ) : (
           <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <i className="fa-regular fa-heart text-4xl mb-3"></i>
              <p>찜한 상품이 없습니다.</p>
           </div>
      )}
    </div>
  );
};
