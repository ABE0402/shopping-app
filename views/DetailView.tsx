
import React from 'react';
import { Product } from '../types';

interface DetailViewProps {
  product: Product | null;
  onBack: () => void;
  onAddToCart: (product: Product) => void;
  onNavigateToCart: () => void;
  cartCount: number;
  isLiked: boolean;
  onToggleLike: (e: React.MouseEvent, product: Product) => void;
  onGoToAiStudio: (product: Product) => void;
}

export const DetailView: React.FC<DetailViewProps> = ({
  product,
  onBack,
  onAddToCart,
  onNavigateToCart,
  cartCount,
  isLiked,
  onToggleLike,
  onGoToAiStudio
}) => {
  if (!product) return null;

  return (
    <div className="bg-white min-h-screen relative pb-24 z-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-white/80 backdrop-blur-md z-10 flex items-center px-4 max-w-md mx-auto">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center -ml-2 text-gray-800">
          <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <div className="flex-1 text-center font-medium truncate px-4">
          {product.name}
        </div>
        <button 
          onClick={onNavigateToCart} 
          className="w-10 h-10 flex items-center justify-center -mr-2 text-gray-800 relative"
        >
          <i className="fa-solid fa-cart-shopping"></i>
          {cartCount > 0 && (
            <span className="absolute top-2 right-1.5 bg-red-500 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full">
              {cartCount}
            </span>
          )}
        </button>
      </header>

      <div className="pt-14 overflow-y-auto">
        {/* Image */}
        <div className="w-full aspect-[4/5] bg-gray-100 relative">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
          {/* Wishlist Button in Detail View */}
          <button 
              onClick={(e) => onToggleLike(e, product)}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/60 backdrop-blur-md hover:bg-white transition-colors shadow-sm"
          >
              <i className={`${isLiked ? 'fa-solid text-red-500' : 'fa-regular text-gray-800'} fa-heart text-xl`}></i>
          </button>
        </div>

        {/* Product Info */}
        <div className="px-5 py-6 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-500">{product.category}</span>
              <div className="flex items-center space-x-1">
                 <i className="fa-solid fa-star text-yellow-400 text-xs"></i>
                 <span className="text-sm font-semibold">{product.rating}</span>
                 <span className="text-xs text-gray-400">({product.reviews} 리뷰)</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              {product.name}
            </h1>
          </div>

          <div className="text-2xl font-bold text-gray-900">
            {product.price.toLocaleString()}원
          </div>

          <div className="h-px bg-gray-100 my-4"></div>

          <div className="space-y-3">
            <h3 className="font-bold text-gray-800">상품 정보</h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              {product.description}
            </p>
          </div>
          
           {/* Dummy extra content to make it scrollable */}
          <div className="pt-4 space-y-2">
               <div className="h-40 bg-gray-50 rounded-lg flex items-center justify-center text-gray-300 text-sm">
                  상세 이미지 영역 1
               </div>
               <div className="h-40 bg-gray-50 rounded-lg flex items-center justify-center text-gray-300 text-sm">
                  상세 이미지 영역 2
               </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-20">
        <div className="max-w-md mx-auto flex gap-3">
           <button 
              onClick={() => onGoToAiStudio(product)}
              className="flex-1 bg-purple-50 text-purple-700 border border-purple-200 py-3.5 rounded-xl font-bold text-base hover:bg-purple-100 transition-colors flex items-center justify-center gap-2"
           >
              <i className="fa-solid fa-wand-magic-sparkles"></i>
              <span>AI 스튜디오</span>
           </button>
           <button 
             onClick={() => onAddToCart(product)}
             className="flex-[2] bg-black text-white py-3.5 rounded-xl font-bold text-base active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
           >
              <span>장바구니 담기</span>
           </button>
        </div>
      </div>
    </div>
  );
};
