import React, { useState } from 'react'; // useState 추가
import { Product } from '../types';
import { OptionModal } from '../components/OptionModal'; // Import 추가

interface DetailViewProps {
  product: Product;
  cartCount: number;
  likedProductIds: number[];
  onBack: () => void;
  onGoToCart: () => void;
  onAddToCart: (product: Product) => void;
  onGoToAiStudio: (product: Product) => void;
  onToggleLike: (e: React.MouseEvent, product: Product) => void;
  onBuyNow: (product: Product, color: string, size: string, quantity: number) => void; // props 추가
}

export const DetailView: React.FC<DetailViewProps> = ({
  product,
  cartCount,
  likedProductIds,
  onBack,
  onGoToCart,
  onAddToCart,
  onGoToAiStudio,
  onToggleLike,
  onBuyNow, // 추가
}) => {
  // 모달 상태 관리
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);

  // 구매하기 버튼 핸들러 (모달 열기)
  const handleBuyNowClick = () => {
    setIsOptionModalOpen(true);
  };

  // 모달에서 '주문하기' 눌렀을 때 실행
  const handleOptionConfirm = (color: string, size: string, quantity: number) => {
    setIsOptionModalOpen(false);
    onBuyNow(product, color, size, quantity);
  };

  return (
    <div className="bg-white min-h-screen relative pb-24 z-50">
      {/* ... 기존 Header 및 Image 섹션 코드는 그대로 유지 ... */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-white/80 backdrop-blur-md z-10 flex items-center px-4 max-w-md mx-auto">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center -ml-2 text-gray-800">
          <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <div className="flex-1 text-center font-medium truncate px-4">
          {product.name}
        </div>
        <button onClick={onGoToCart} className="w-10 h-10 flex items-center justify-center -mr-2 text-gray-800 relative">
          <i className="fa-solid fa-cart-shopping"></i>
          {cartCount > 0 && (
            <span className="absolute top-2 right-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </header>

      <div className="pt-14 overflow-y-auto">
        {/* ... 이미지 및 상품 정보 영역은 기존 코드 유지 ... */}
        <div className="w-full aspect-[4/5] bg-gray-100 relative">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          <button 
            onClick={(e) => onToggleLike(e, product)}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/60 backdrop-blur-md hover:bg-white transition-colors shadow-sm z-10"
          >
            <i className={`${likedProductIds.includes(product.id) ? 'fa-solid text-red-500' : 'fa-regular text-gray-800'} fa-heart text-xl`}></i>
          </button>
        </div>

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
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">{product.name}</h1>
          </div>
          <div className="text-2xl font-bold text-gray-900">{product.price.toLocaleString()}원</div>
          <div className="h-px bg-gray-100 my-4"></div>
          <div className="space-y-3">
            <h3 className="font-bold text-gray-800">상품 정보</h3>
            <div className="text-gray-600 leading-relaxed text-sm prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: product.description || '상품 설명이 없습니다.' }} />
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-20">
        <div className="max-w-md mx-auto flex flex-col gap-3">
           <button 
              onClick={() => onGoToAiStudio(product)}
              className="w-full bg-purple-50 text-purple-700 border border-purple-200 py-3 rounded-xl font-bold text-base hover:bg-purple-100 transition-colors flex items-center justify-center gap-2"
           >
              <i className="fa-solid fa-wand-magic-sparkles"></i>
              <span>AI 스튜디오에서 입어보기</span>
           </button>

           <div className="flex gap-3">
             <button 
               onClick={() => onAddToCart(product)}
               className="flex-1 bg-white border border-gray-300 text-gray-900 py-3.5 rounded-xl font-bold text-base active:scale-[0.98] transition-transform flex items-center justify-center gap-2 hover:bg-gray-50"
             >
                <i className="fa-solid fa-cart-plus"></i>
                <span>장바구니</span>
             </button>
             
             {/* 구매하기 버튼에 핸들러 연결 */}
             <button 
               onClick={handleBuyNowClick}
               className="flex-1 bg-black text-white py-3.5 rounded-xl font-bold text-base active:scale-[0.98] transition-transform flex items-center justify-center gap-2 hover:bg-gray-800"
             >
                <span>구매하기</span>
             </button>
           </div>
        </div>
      </div>

      {/* 옵션 선택 모달 추가 */}
      <OptionModal 
        product={product}
        isOpen={isOptionModalOpen}
        onClose={() => setIsOptionModalOpen(false)}
        onConfirm={handleOptionConfirm}
      />
    </div>
  );
};