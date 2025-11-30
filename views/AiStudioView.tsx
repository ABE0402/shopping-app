
import React, { useState, useRef } from 'react';
import { CartItem } from '../types';
import { generateFashionImage, editFashionImage, tryOnFashionItem, urlToBase64 } from '../services/geminiService';

interface AiStudioViewProps {
  userPhoto: string | null;
  onUpdateUserPhoto: (photo: string) => void;
  cartItems: CartItem[];
  selectedCartItemId: number | null;
  setSelectedCartItemId: (id: number | null) => void;
  onBack: () => void;
  onNavigateHome: () => void;
}

export const AiStudioView: React.FC<AiStudioViewProps> = ({
  userPhoto,
  onUpdateUserPhoto,
  cartItems,
  selectedCartItemId,
  setSelectedCartItemId,
  onBack,
  onNavigateHome
}) => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCartSelectorOpen, setIsCartSelectorOpen] = useState(false);
  const aiStudioFileRef = useRef<HTMLInputElement>(null);

  const selectedCartItem = selectedCartItemId ? cartItems.find(i => i.id === selectedCartItemId) : null;

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateUserPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiGeneration = async () => {
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      let result;
      
      // Determine Mode based on state
      // 1. Try-On: User Photo + Cart Item
      // 2. Edit: User Photo only
      // 3. Generate: No User Photo (Only Prompt)

      if (userPhoto && selectedCartItem) {
        // Mode 1: Try-On (User Photo + Product Image)
        try {
          const productBase64 = await urlToBase64(selectedCartItem.image);
          result = await tryOnFashionItem(userPhoto, productBase64, aiPrompt);
        } catch (e) {
           console.error("Image conversion failed", e);
           alert("상품 이미지를 불러오는데 실패했습니다. (CORS 보안 정책)");
           setIsGenerating(false);
           return;
        }
      } else if (userPhoto) {
        // Mode 2: Edit existing photo
        result = await editFashionImage(userPhoto, aiPrompt);
      } else {
        // Mode 3: Generate new image
        result = await generateFashionImage(aiPrompt);
      }
      
      if (result) {
        setGeneratedImage(result);
      } else {
        alert("이미지를 생성하지 못했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error(error);
      alert("오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

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
             
             {/* Model Badge */}
             <div className="flex justify-center -mt-2">
               <span className="bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 text-[10px] font-bold px-3 py-1 rounded-full border border-purple-200 flex items-center gap-1.5 shadow-sm">
                  <i className="fa-solid fa-bolt text-[9px]"></i>
                  Powered by Gemini 2.5 (Nano Banana)
               </span>
             </div>

             {/* 2-Slot Composition UI */}
             <div className="flex gap-4 items-center justify-center">
                {/* Slot 1: User Photo */}
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

                {/* Slot 2: Clothing Item */}
                <div className="flex-1 flex flex-col items-center">
                   <span className="text-xs font-bold text-gray-500 mb-2">옷 선택</span>
                   <div 
                      onClick={() => {
                        if (cartItems.length === 0) {
                          alert("장바구니가 비어있습니다. 상품을 먼저 담아주세요!");
                          onNavigateHome();
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
                      {/* Remove Button for Slot 2 */}
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

             {/* Cart Selection Toggle Area */}
             {isCartSelectorOpen && cartItems.length > 0 && (
               <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 animate-[slideDown_0.2s_ease-out]">
                  <div className="text-xs font-bold text-gray-500 mb-2">장바구니에서 선택하세요</div>
                  <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                      {cartItems.map((item) => (
                         <div 
                           key={item.id}
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
                 onChange={handlePhotoSelect}
                 className="hidden"
             />

             {/* Result Area */}
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

             {/* Prompt Input */}
             <div className="space-y-3">
               <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-gray-700">요청사항</label>
                  <span className="text-xs text-purple-600 font-medium bg-purple-50 px-2 py-1 rounded">
                     {userPhoto && selectedCartItem ? '가상 피팅 모드' : (userPhoto ? '이미지 편집 모드' : '새로운 생성 모드')}
                  </span>
               </div>
               <textarea 
                 value={aiPrompt}
                 onChange={(e) => setAiPrompt(e.target.value)}
                 placeholder={
                    userPhoto && selectedCartItem
                    ? "예: 한강 공원에서 산책하는 자연스러운 모습"
                    : (userPhoto ? "예: 배경을 벚꽃이 핀 거리로 바꿔줘" : "예: 힙한 스트릿 패션 스타일")
                 }
                 className="w-full h-20 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm bg-gray-50"
               ></textarea>
               <button 
                 onClick={handleAiGeneration}
                 disabled={isGenerating || !aiPrompt.trim() || (selectedCartItem && !userPhoto)}
                 className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                    isGenerating || !aiPrompt.trim() || (selectedCartItem && !userPhoto)
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
