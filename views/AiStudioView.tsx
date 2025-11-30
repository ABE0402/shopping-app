import React from 'react';
import { CartItem } from '../types';

interface AiStudioViewProps {
  userPhoto: string | null;
  cartItems: CartItem[];
  selectedCartItemId: number | null;
  setSelectedCartItemId: (id: number | null) => void;
  isCartSelectorOpen: boolean;
  setIsCartSelectorOpen: (open: boolean) => void;
  generatedImage: string | null;
  isGenerating: boolean;
  useMyPhoto: boolean;
  aiStudioFileRef: React.RefObject<HTMLInputElement>;
  onPhotoSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAiGeneration: () => void;
  onBack: () => void;
  onGoToHome: () => void;
}

export const AiStudioView: React.FC<AiStudioViewProps> = ({
  userPhoto,
  cartItems,
  selectedCartItemId,
  setSelectedCartItemId,
  isCartSelectorOpen,
  setIsCartSelectorOpen,
  generatedImage,
  isGenerating,
  useMyPhoto,
  aiStudioFileRef,
  onPhotoSelect,
  onAiGeneration,
  onBack,
  onGoToHome,
}) => {
  const selectedCartItem = selectedCartItemId ? cartItems.find(i => i.id === selectedCartItemId) : null;
  
  return (
    <div className="bg-white min-h-screen relative z-50 flex flex-col">
      <header className="flex-none h-14 bg-white border-b border-gray-100 flex items-center px-4 z-10">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center -ml-2 text-gray-800">
          <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <div className="flex-1 text-center font-bold text-lg">AI 패션 스튜디오</div>
        <div className="w-10"></div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-md mx-auto space-y-6">
          <div className="flex justify-center -mt-2">
            <span className="bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 text-[10px] font-bold px-3 py-1 rounded-full border border-purple-200 flex items-center gap-1.5 shadow-sm">
              <i className="fa-solid fa-bolt text-[9px]"></i>
              Powered by Gemini 2.5 (Nano Banana)
            </span>
          </div>

          <div className="flex gap-4 items-center justify-center">
            <div className="flex-1 flex flex-col items-center">
              <span className="text-xs font-bold text-gray-500 mb-2">내 사진</span>
              <div 
                onClick={() => aiStudioFileRef.current?.click()}
                className={`w-full aspect-[3/4] rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden relative cursor-pointer transition-all ${
                  userPhoto ? 'border-purple-500 shadow-md' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                {userPhoto ? (
                  <img src={userPhoto} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <i className="fa-solid fa-plus text-2xl mb-1"></i>
                    <span className="text-xs">사진 추가</span>
                  </div>
                )}
              </div>
            </div>

            <i className="fa-solid fa-plus text-gray-300 text-xl"></i>

            <div className="flex-1 flex flex-col items-center">
              <span className="text-xs font-bold text-gray-500 mb-2">옷 선택</span>
              <div 
                onClick={() => {
                  if (cartItems.length === 0) {
                    alert("장바구니가 비어있습니다. 상품을 먼저 담아주세요!");
                    onGoToHome();
                  } else {
                    setIsCartSelectorOpen(!isCartSelectorOpen);
                  }
                }}
                className={`w-full aspect-[3/4] rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden relative cursor-pointer transition-all ${
                  selectedCartItem ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                {selectedCartItem ? (
                  <img src={selectedCartItem.image} alt="Clothes" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <i className="fa-solid fa-shirt text-2xl mb-1"></i>
                    <span className="text-xs">장바구니 추가</span>
                  </div>
                )}
                {selectedCartItem && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCartItemId(null);
                    }}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full text-white flex items-center justify-center text-xs hover:bg-red-500"
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                )}
              </div>
            </div>
          </div>

          {isCartSelectorOpen && cartItems.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 animate-[slideDown_0.2s_ease-out]">
              <div className="text-xs font-bold text-gray-500 mb-2">장바구니에서 선택하세요</div>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                {cartItems.map((item, idx) => (
                  <div 
                    key={`cart-selector-${item.id}-${idx}`}
                    onClick={() => {
                      setSelectedCartItemId(item.id);
                      setIsCartSelectorOpen(false);
                    }}
                    className={`flex-none w-16 h-16 rounded-lg overflow-hidden border cursor-pointer ${
                      selectedCartItemId === item.id ? 'border-black ring-1 ring-black' : 'border-gray-200'
                    }`}
                  >
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <input 
            type="file" 
            accept="image/*" 
            ref={aiStudioFileRef} 
            onChange={onPhotoSelect}
            className="hidden"
          />

          <div className="w-full aspect-square bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 flex items-center justify-center relative">
            {generatedImage ? (
              <img src={generatedImage} alt="AI Generated" className="w-full h-full object-contain" />
            ) : (
              <div className="text-center text-gray-400 p-6">
                {isGenerating ? (
                  <div className="flex flex-col items-center">
                    <i className="fa-solid fa-spinner fa-spin text-3xl mb-3 text-purple-500"></i>
                    <p className="animate-pulse text-sm">AI가 열심히 작업 중입니다...</p>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <i className="fa-solid fa-wand-magic-sparkles text-2xl text-purple-300"></i>
                    </div>
                    <p className="text-sm font-medium text-gray-600">
                      {userPhoto && selectedCartItem 
                        ? "가상 피팅(Try-On) 준비 완료!" 
                        : "재료를 선택하고 이미지를 생성해보세요."}
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex justify-center">
              <span className="text-xs text-purple-600 font-medium bg-purple-50 px-3 py-1.5 rounded-full">
                {userPhoto && selectedCartItem ? '가상 피팅 모드' : (userPhoto ? '이미지 편집 모드' : '새로운 생성 모드')}
              </span>
            </div>
            <button 
              onClick={onAiGeneration}
              disabled={isGenerating || (selectedCartItem && !userPhoto)}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                isGenerating || (selectedCartItem && !userPhoto)
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-gradient-to-r from-black to-gray-800 active:scale-[0.98]'
              }`}
            >
              {isGenerating ? (
                '생성 중...' 
              ) : (
                <>
                  <i className="fa-solid fa-bolt"></i>
                  <span>AI 이미지 생성하기</span>
                </>
              )}
            </button>
            {selectedCartItem && !userPhoto && (
              <p className="text-xs text-red-500 text-center">
                <i className="fa-solid fa-triangle-exclamation mr-1"></i>
                옷을 입어보려면 '내 사진'도 함께 추가해야 합니다.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

