import React, { useState, useMemo, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { Category, Product, ViewState, CartItem } from './types';
import { CATEGORIES, INITIAL_PRODUCTS } from './constants';
import { searchProductsWithAI, generateFashionImage, editFashionImage, tryOnFashionItem, urlToBase64 } from './services/geminiService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('HOME');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category>('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiMode, setIsAiMode] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // My Photo Logic
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [isPhotoSheetOpen, setIsPhotoSheetOpen] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const aiStudioFileRef = useRef<HTMLInputElement>(null);

  // AI Studio Logic
  const [aiPrompt, setAiPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [useMyPhoto, setUseMyPhoto] = useState(false);
  const [selectedCartItemId, setSelectedCartItemId] = useState<number | null>(null);
  const [isCartSelectorOpen, setIsCartSelectorOpen] = useState(false);

  // Products filtered by AI search results (list of IDs)
  const [aiFilteredIds, setAiFilteredIds] = useState<number[] | null>(null);

  // Helper to add items to cart
  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    // Simple toast or vibration could go here
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const removeFromCart = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
    if (selectedCartItemId === id) setSelectedCartItemId(null);
  };

  const goToDetail = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('DETAIL');
  };

  const goBack = () => {
    setSelectedProduct(null);
    setCurrentView('HOME');
  };

  // Handle Photo File Selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserPhoto(reader.result as string);
        setIsPhotoSheetOpen(false);
        setUseMyPhoto(true); // Auto-enable my photo usage when uploading
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Search Execution
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setAiFilteredIds(null);
      return;
    }

    if (isAiMode) {
      setIsSearching(true);
      const ids = await searchProductsWithAI(searchQuery, INITIAL_PRODUCTS);
      setAiFilteredIds(ids);
      setIsSearching(false);
    } else {
      // Standard search is handled by the useMemo below immediately
      setAiFilteredIds(null);
    }
  };

  // Handle AI Image Generation
  const handleAiGeneration = async () => {
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      let result;
      
      const cartItem = selectedCartItemId ? cartItems.find(i => i.id === selectedCartItemId) : null;
      
      // Determine Mode based on state
      // 1. Try-On: User Photo + Cart Item
      // 2. Edit: User Photo only
      // 3. Generate: No User Photo

      // Prioritize explicit "useMyPhoto" toggle or presence of photo in studio context
      const shouldUsePhoto = useMyPhoto || (currentView === 'AI_STUDIO' && userPhoto !== null);

      if (shouldUsePhoto && userPhoto && cartItem) {
        // Mode 3: Try-On (User Photo + Product Image)
        try {
          const productBase64 = await urlToBase64(cartItem.image);
          result = await tryOnFashionItem(userPhoto, productBase64, aiPrompt);
        } catch (e) {
           console.error("Image conversion failed", e);
           alert("상품 이미지를 불러오는데 실패했습니다. (CORS 보안 정책)");
           setIsGenerating(false);
           return;
        }
      } else if (shouldUsePhoto && userPhoto) {
        // Mode 2: Edit existing photo
        result = await editFashionImage(userPhoto, aiPrompt);
      } else {
        // Mode 1: Generate new image
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

  // Filter Logic
  const filteredProducts = useMemo(() => {
    let result = INITIAL_PRODUCTS;

    // 1. Category Filter
    if (selectedCategory !== '전체') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // 2. Search Filter (AI vs Standard)
    if (isAiMode && aiFilteredIds !== null) {
      result = result.filter(p => aiFilteredIds.includes(p.id));
    } else if (!isAiMode && searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q));
    }

    // 3. Sort Descending (by ID for "Newest" simulation as requested)
    return [...result].sort((a, b) => b.id - a.id);
  }, [selectedCategory, searchQuery, isAiMode, aiFilteredIds]);

  // --- Views ---

  const HomeView = () => (
    <div className="pb-24">
      {/* Sticky Header */}
      <header className="sticky top-0 bg-white z-40 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
             {/* App Logo Mark */}
             <div className="w-9 h-9 bg-black rounded-lg flex items-center justify-center shrink-0 shadow-md">
                <i className="fa-solid fa-shirt text-white text-sm"></i>
             </div>

             {/* Search Area */}
             <div className="relative flex-1">
                <input 
                  type="text"
                  placeholder={isAiMode ? "AI에게 물어보세요" : "상품 검색"}
                  className={`w-full h-10 pl-9 pr-3 rounded-lg text-sm transition-all border ${
                    isAiMode ? 'border-purple-300 bg-purple-50 focus:ring-purple-500' : 'border-gray-200 bg-gray-50 focus:ring-black'
                  } focus:outline-none focus:ring-1`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <i className={`fa-solid fa-magnifying-glass absolute left-3 top-3 text-gray-400 text-sm`}></i>
             </div>

             {/* AI Toggle Button */}
             <button 
                onClick={() => {
                  setIsAiMode(!isAiMode);
                  setAiFilteredIds(null); // Reset filters when toggling
                }}
                className={`flex items-center justify-center h-10 w-10 rounded-lg border transition-colors shrink-0 ${
                  isAiMode ? 'bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-200' : 'bg-white border-gray-200 text-gray-500'
                }`}
             >
               <i className="fa-solid fa-wand-magic-sparkles"></i>
             </button>
          </div>

          {/* Categories */}
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

      {/* Main Content */}
      <main className="px-4 pt-4">
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            {isSearching ? 'AI가 상품을 찾고 있습니다...' : `상품 목록 (${filteredProducts.length})`}
          </h2>
          <span className="text-xs text-gray-500">신상품순</span>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={addToCart} 
                onClick={goToDetail}
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

  const DetailView = () => {
    if (!selectedProduct) return null;

    return (
      <div className="bg-white min-h-screen relative pb-24 z-50">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 h-14 bg-white/80 backdrop-blur-md z-10 flex items-center px-4 max-w-md mx-auto">
          <button onClick={goBack} className="w-10 h-10 flex items-center justify-center -ml-2 text-gray-800">
            <i className="fa-solid fa-arrow-left text-xl"></i>
          </button>
          <div className="flex-1 text-center font-medium truncate px-4">
            {selectedProduct.name}
          </div>
          <button 
            onClick={() => setCurrentView('CART')} 
            className="w-10 h-10 flex items-center justify-center -mr-2 text-gray-800 relative"
          >
            <i className="fa-solid fa-cart-shopping"></i>
            {cartItems.length > 0 && (
              <span className="absolute top-2 right-1.5 bg-red-500 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full">
                {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            )}
          </button>
        </header>

        <div className="pt-14 overflow-y-auto">
          {/* Image */}
          <div className="w-full aspect-[4/5] bg-gray-100">
            <img 
              src={selectedProduct.image} 
              alt={selectedProduct.name} 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Info */}
          <div className="px-5 py-6 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-500">{selectedProduct.category}</span>
                <div className="flex items-center space-x-1">
                   <i className="fa-solid fa-star text-yellow-400 text-xs"></i>
                   <span className="text-sm font-semibold">{selectedProduct.rating}</span>
                   <span className="text-xs text-gray-400">({selectedProduct.reviews} 리뷰)</span>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                {selectedProduct.name}
              </h1>
            </div>

            <div className="text-2xl font-bold text-gray-900">
              {selectedProduct.price.toLocaleString()}원
            </div>

            <div className="h-px bg-gray-100 my-4"></div>

            <div className="space-y-3">
              <h3 className="font-bold text-gray-800">상품 정보</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                {selectedProduct.description}
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
                onClick={() => {
                   addToCart(selectedProduct);
                   setSelectedCartItemId(selectedProduct.id);
                   setCurrentView('AI_STUDIO');
                }}
                className="flex-1 bg-purple-50 text-purple-700 border border-purple-200 py-3.5 rounded-xl font-bold text-base hover:bg-purple-100 transition-colors flex items-center justify-center gap-2"
             >
                <i className="fa-solid fa-wand-magic-sparkles"></i>
                <span>AI 스튜디오</span>
             </button>
             <button 
               onClick={() => addToCart(selectedProduct)}
               className="flex-[2] bg-black text-white py-3.5 rounded-xl font-bold text-base active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
             >
                <span>장바구니 담기</span>
             </button>
          </div>
        </div>
      </div>
    );
  };

  const CartView = () => {
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    return (
      <div className="pb-24 px-4 pt-6 min-h-screen bg-gray-50">
        <h2 className="text-2xl font-bold mb-6">장바구니</h2>
        {cartItems.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <i className="fa-solid fa-cart-shopping text-4xl mb-4 opacity-30"></i>
            <p>장바구니가 비어있습니다.</p>
            <button 
              onClick={() => setCurrentView('HOME')}
              className="mt-6 px-6 py-2 bg-black text-white rounded-full text-sm font-medium"
            >
              쇼핑하러 가기
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg bg-gray-100" />
                  <div className="ml-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{item.category}</p>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-bold">{item.price.toLocaleString()}원</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">수량: {item.quantity}</span>
                        <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500">
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="fixed bottom-[64px] left-0 right-0 bg-white border-t p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
              <div className="max-w-md mx-auto flex justify-between items-center mb-4">
                <span className="text-gray-600">총 결제금액</span>
                <span className="text-xl font-bold text-blue-600">{totalAmount.toLocaleString()}원</span>
              </div>
              <button className="w-full bg-black text-white py-3.5 rounded-xl font-bold text-lg active:scale-[0.99] transition-transform mx-auto max-w-md block">
                구매하기
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  const MyPageView = () => (
    <div className="pb-24 px-4 pt-8 bg-white min-h-screen">
      <div className="flex items-center mb-8">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
            <i className="fa-solid fa-user text-2xl text-gray-400"></i>
        </div>
        <div className="ml-4">
            <h2 className="text-xl font-bold">홍길동님</h2>
            <p className="text-sm text-gray-500">Gold Level</p>
        </div>
      </div>

      <div className="mb-6">
        <button 
          onClick={() => setCurrentView('AI_STUDIO')}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-xl shadow-lg shadow-purple-200 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
               <i className="fa-solid fa-wand-magic-sparkles text-lg"></i>
             </div>
             <div className="text-left">
               <div className="font-bold text-sm">AI 패션 스튜디오</div>
               <div className="text-xs text-purple-100 opacity-90">Nano Banana 모델로 스타일링</div>
             </div>
          </div>
          <i className="fa-solid fa-chevron-right text-sm opacity-50"></i>
        </button>
      </div>

      <div className="space-y-2">
        {['주문 내역', '찜한 상품', '쿠폰함', '최근 본 상품', '설정', '내 사진'].map((menu) => (
            <button 
              key={menu} 
              onClick={() => menu === '내 사진' ? setCurrentView('MY_PHOTOS') : null}
              className="w-full flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
                <span className="font-medium text-gray-700">{menu}</span>
                <i className="fa-solid fa-chevron-right text-gray-400 text-xs"></i>
            </button>
        ))}
      </div>
    </div>
  );

  const MyPhotoView = () => (
    <div className="bg-white min-h-screen relative z-50">
       <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-100 flex items-center px-4 z-10 max-w-md mx-auto">
          <button onClick={() => setCurrentView('MYPAGE')} className="w-10 h-10 flex items-center justify-center -ml-2 text-gray-800">
            <i className="fa-solid fa-arrow-left text-xl"></i>
          </button>
          <div className="flex-1 text-center font-bold text-lg">내 사진</div>
          <div className="w-10"></div>
       </header>

       <div className="pt-20 px-4 pb-24 flex flex-col items-center justify-center min-h-[80vh]">
          {userPhoto ? (
            <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-lg border border-gray-100">
               <img src={userPhoto} alt="My Photo" className="w-full h-auto object-cover" />
            </div>
          ) : (
            <div className="w-full max-w-sm aspect-[3/4] bg-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200">
               <i className="fa-regular fa-image text-5xl mb-3"></i>
               <p>등록된 사진이 없습니다.</p>
            </div>
          )}
       </div>

       <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
          <div className="max-w-md mx-auto">
            <button 
              onClick={() => setIsPhotoSheetOpen(true)}
              className="w-full bg-black text-white py-3.5 rounded-xl font-bold text-base active:scale-[0.98] transition-transform"
            >
              사진 등록
            </button>
          </div>
       </div>

       {/* Action Sheet */}
       {isPhotoSheetOpen && (
         <div className="fixed inset-0 z-[60] flex items-end justify-center">
            <div 
              className="absolute inset-0 bg-black/50 transition-opacity"
              onClick={() => setIsPhotoSheetOpen(false)}
            ></div>
            <div className="bg-white w-full max-w-md rounded-t-2xl p-4 z-10 animate-[slideUp_0.3s_ease-out] safe-pb">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
              <h3 className="text-center font-bold text-lg mb-6">사진 가져오기</h3>
              <div className="space-y-3">
                <button 
                   onClick={() => galleryInputRef.current?.click()}
                   className="w-full bg-gray-50 p-4 rounded-xl font-medium text-left flex items-center gap-3 hover:bg-gray-100"
                >
                   <i className="fa-regular fa-images text-xl w-8 text-center"></i>
                   저장된 이미지 넣기
                </button>
                <button 
                   onClick={() => cameraInputRef.current?.click()}
                   className="w-full bg-gray-50 p-4 rounded-xl font-medium text-left flex items-center gap-3 hover:bg-gray-100"
                >
                   <i className="fa-solid fa-camera text-xl w-8 text-center"></i>
                   지금 사진 찍기
                </button>
                <button 
                   onClick={() => setIsPhotoSheetOpen(false)}
                   className="w-full bg-white border border-gray-200 p-4 rounded-xl font-bold text-gray-500 mt-2"
                >
                   취소
                </button>
              </div>
            </div>
         </div>
       )}

       {/* Hidden Inputs */}
       <input 
         type="file" 
         accept="image/*" 
         className="hidden" 
         ref={galleryInputRef}
         onChange={handlePhotoSelect}
       />
       <input 
         type="file" 
         accept="image/*" 
         capture="environment"
         className="hidden" 
         ref={cameraInputRef}
         onChange={handlePhotoSelect}
       />
    </div>
  );

  const AiStudioView = () => {
    const selectedCartItem = selectedCartItemId ? cartItems.find(i => i.id === selectedCartItemId) : null;
    
    return (
      <div className="bg-white min-h-screen relative z-50 flex flex-col">
         <header className="flex-none h-14 bg-white border-b border-gray-100 flex items-center px-4 z-10">
            <button onClick={() => setCurrentView('MYPAGE')} className="w-10 h-10 flex items-center justify-center -ml-2 text-gray-800">
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
                            setCurrentView('HOME');
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

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white relative shadow-2xl overflow-hidden">
      {currentView === 'HOME' && <HomeView />}
      {currentView === 'CART' && <CartView />}
      {currentView === 'MYPAGE' && <MyPageView />}
      {currentView === 'DETAIL' && <DetailView />}
      {currentView === 'MY_PHOTOS' && <MyPhotoView />}
      {currentView === 'AI_STUDIO' && <AiStudioView />}
      
      {(currentView !== 'DETAIL' && currentView !== 'MY_PHOTOS' && currentView !== 'AI_STUDIO') && (
        <Navbar 
          currentView={currentView} 
          setCurrentView={setCurrentView}
          cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)} 
        />
      )}
    </div>
  );
};

export default App;