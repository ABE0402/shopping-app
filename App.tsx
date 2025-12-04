import React, { useState, useMemo, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AdminDashboard } from './components/AdminDashboard';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { FindId } from './components/FindId';
import { FindPassword } from './components/FindPassword';
import { WishlistView } from './views/WishlistView';
import { RecentlyViewedView } from './views/RecentlyView';
import { Category, Product, ViewState, OrderItem } from './types'; // OrderItem 타입 추가
import { useProducts } from './hooks/useProducts';
import { useAuth } from './hooks/useAuth'; // 경로 확인 필요 (src/hooks/useAuth.ts 인지 src/useAuth.tsx 인지)
import { useWishlist } from './hooks/useWishlist';
import { useRecentlyViewed } from './hooks/useRecentlyViewed';
import { useCart } from './hooks/useCart';
import { useAiStudio } from './hooks/useAiStudio';
import { useAiCoordinator } from './services/useAiCoordinator';
import { HomeView } from './views/HomeView';
import { DetailView } from './views/DetailView';
import { CartView } from './views/CartView';
import { MyPageView } from './views/MyPageView';
import { MyPhotoView } from './views/MyPhotoView';
import { AiStudioView } from './views/AiStudioView';
import { AiCoordinatorView } from './views/AiCoordinatorView';
import { GlobalHeader } from './components/GlobalHeader';
import LoadingScreen from './components/LoadingScreen'; 
import { CheckoutView } from './views/CheckoutView'; 
import { useOrders } from './hooks/useOrders';
import { OrderHistoryView } from './views/OrderHistoryView'; 

const App: React.FC = () => {
  // 1. 기본 상태 (State)
  const [currentView, setCurrentView] = useState<ViewState>('HOME');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category>('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [orderItem, setOrderItem] = useState<OrderItem | null>(null);

  // 2. 로딩 효과 (useEffect)
  useEffect(() => {    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // 3. Custom Hooks (순서 중요!)
  
  // (1) 인증 훅 (가장 먼저 실행되어 currentUser를 만듦)
  const { currentUser, isAdmin, handleUserLogin, handleUserSignup, handleUserLogout } = useAuth();

  // (2) currentUser를 사용하는 훅들
  const { orders, addOrder } = useOrders(currentUser?.id); // 여기서 currentUser 사용
  const { likedProductIds, toggleLike } = useWishlist(currentUser);
  const { recentProductIds, addToRecentlyViewed } = useRecentlyViewed(currentUser);

  // (3) 나머지 훅들
  const { products, updateProducts } = useProducts();
  const { cartItems, selectedCartItemId, setSelectedCartItemId, addToCart, removeFromCart, cartCount } = useCart();
  
  // (4) AI 관련 훅들
  const {
    userPhoto,
    isPhotoSheetOpen,
    setIsPhotoSheetOpen,
    aiPrompt,
    setAiPrompt,
    generatedImage,
    isGenerating,
    useMyPhoto,
    isCartSelectorOpen,
    setIsCartSelectorOpen,
    galleryInputRef,
    cameraInputRef,
    aiStudioFileRef,
    handlePhotoSelect,
    handleAiGeneration,
  } = useAiStudio(cartItems, selectedCartItemId);

  const { 
    searchQuery: aiSearchQuery, 
    setSearchQuery: setAiSearchQuery, 
    recommendedProducts, 
    recommendationComment,
    isSearching: isAiSearching, 
    searchError: aiSearchError, 
    suggestedKeywords,
    stylingItems,
    handleSearch: handleAiSearch 
  } = useAiCoordinator(products);

  // 4. 비즈니스 로직 (Handlers & Filters)

  const filteredProducts = useMemo(() => {
    let result = products;
    if (selectedCategory !== '전체') {
      result = result.filter(p => p.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q));
    }
    return [...result].sort((a, b) => b.id - a.id);
  }, [selectedCategory, searchQuery, products]);

  const wishlistProducts = useMemo(() => 
    products.filter(p => likedProductIds.includes(p.id)), 
    [likedProductIds, products]
  );

  const recentProducts = useMemo(() => 
    recentProductIds
      .map(id => products.find(p => p.id === id))
      .filter((p): p is Product => p !== undefined),
    [recentProductIds, products]
  );

  const goToDetail = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('DETAIL');
    addToRecentlyViewed(product);
  };

  const handleToggleLike = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    toggleLike(product.id);
  };

  const goBack = () => {
    setSelectedProduct(null);
    const fromAiCoordinator = currentView === 'AI_COORDINATOR';
    setCurrentView(fromAiCoordinator ? 'HOME' : 'HOME');
  };

  const handleGoToAiStudio = (product: Product) => {
    addToCart(product);
    setSelectedCartItemId(product.id);
    setCurrentView('AI_STUDIO');
  };

  const handleBuyNow = (product: Product, color: string, size: string, quantity: number) => {
    setOrderItem({
      ...product,
      selectedColor: color,
      selectedSize: size,
      quantity: quantity
    });
    setCurrentView('CHECKOUT');
  };

  const handlePaymentComplete = (address: string, request: string, paymentMethod: string) => {
    if (orderItem) {
      // 1. 주문 내역 저장
      const totalAmount = orderItem.price * orderItem.quantity + 3000;
      addOrder([orderItem], totalAmount, address, request, paymentMethod);
      
      alert("주문이 완료되었습니다! 주문 내역에서 확인해주세요.");
      
      // 2. 초기화 및 이동
      setOrderItem(null);
      setCurrentView('ORDER_HISTORY'); 
    }
  };

  const handleUserLoginWithRedirect = (user: any) => {
    handleUserLogin(user);

    if (user) {
      if (user.isAdmin || user.id === 'admin') {
        setCurrentView('ADMIN_DASHBOARD');
      } else {
        setCurrentView('HOME');
      }
      return user; 
    }
    return null;
  };

  const handleUserSignupWithRedirect = (user: any) => {
    handleUserSignup(user);
    setCurrentView('HOME');
  };

  const handleUserLogoutWithRedirect = () => {
    handleUserLogout();
    setCurrentView('HOME');
  };

  // 5. 렌더링 (View)

  if (currentView === 'ADMIN_DASHBOARD') {
    return (
      <AdminDashboard
        products={products}
        onUpdateProducts={updateProducts}
        onLogout={handleUserLogoutWithRedirect}
        onGoToHome={() => setCurrentView('HOME')}
      />
    );
  }

  if (isLoading && currentView !== 'ADMIN_DASHBOARD') {
    return <LoadingScreen />;
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white relative shadow-2xl overflow-hidden">
      <GlobalHeader
        title={
          currentView === 'DETAIL' ? selectedProduct?.name :
          currentView === 'WISHLIST' ? '찜한 상품' :
          currentView === 'RECENTLY_VIEWED' ? '최근 본 상품' :
          currentView === 'MY_PHOTOS' ? '내 사진' :
          currentView === 'AI_COORDINATOR' ? 'AI 코디네이터' :
          currentView === 'LOGIN' ? '로그인' : 
          currentView === 'CHECKOUT' ? '주문/결제' : 
          currentView === 'ORDER_HISTORY' ? '주문 내역' : 
          undefined
        }
        onBack={goBack}
        onGoToHome={() => setCurrentView('HOME')}
        onGoToDashboard={() => setCurrentView('ADMIN_DASHBOARD')}
        showBack={!['HOME', 'CART', 'MYPAGE', 'AI_COORDINATOR'].includes(currentView)}
        isAdmin={isAdmin}
      />
      
      {currentView === 'HOME' && (
        <HomeView
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredProducts={filteredProducts}
          likedProductIds={likedProductIds}
          onAddToCart={addToCart}
          onProductClick={goToDetail}
          onToggleLike={handleToggleLike}
        />
      )}
      
      {currentView === 'LOGIN' && (
        <Login
          onLogin={handleUserLoginWithRedirect}
          onSwitchToSignup={() => setCurrentView('SIGNUP')}
          onSwitchToFindId={() => setCurrentView('FIND_ID')}
          onSwitchToFindPassword={() => setCurrentView('FIND_PASSWORD')}
        />
      )}

      {currentView === 'SIGNUP' && (
        <Signup
          onSignup={handleUserSignupWithRedirect}
          onSwitchToLogin={() => setCurrentView('LOGIN')}
        />
      )}

      {currentView === 'FIND_ID' && (
        <FindId
          onSwitchToLogin={() => setCurrentView('LOGIN')}
          onSwitchToFindPassword={() => setCurrentView('FIND_PASSWORD')}
        />
      )}

      {currentView === 'FIND_PASSWORD' && (
        <FindPassword
          onSwitchToLogin={() => setCurrentView('LOGIN')}
          onSwitchToFindId={() => setCurrentView('FIND_ID')}
        />
      )}

      {currentView === 'DETAIL' && selectedProduct && (
        <DetailView
          product={selectedProduct}
          cartCount={cartCount}
          likedProductIds={likedProductIds}
          onBack={goBack}
          onGoToCart={() => setCurrentView('CART')}
          onAddToCart={addToCart}
          onGoToAiStudio={handleGoToAiStudio}
          onToggleLike={handleToggleLike}
          onBuyNow={handleBuyNow}
        />
      )}
      
      {currentView === 'CART' && (
        <CartView
          cartItems={cartItems}
          onRemoveFromCart={removeFromCart}
          onGoToHome={() => setCurrentView('HOME')}
        />
      )}

      {currentView === 'MYPAGE' && (
        <MyPageView
          currentUser={currentUser}
          isAdmin={isAdmin}
          onLogout={handleUserLogoutWithRedirect}
          onGoToLogin={() => setCurrentView('LOGIN')}
          onGoToAiStudio={() => setCurrentView('AI_STUDIO')}
          onGoToMyPhotos={() => setCurrentView('MY_PHOTOS')}
          onGoToWishlist={() => setCurrentView('WISHLIST')}
          onGoToRecentlyViewed={() => setCurrentView('RECENTLY_VIEWED')}
          onGoToOrderHistory={() => setCurrentView('ORDER_HISTORY')}
        />
      )}

      {currentView === 'ORDER_HISTORY' && (
        <OrderHistoryView 
          orders={orders}
          onBack={() => setCurrentView('MYPAGE')}
        />
      )}

      {currentView === 'MY_PHOTOS' && (
        <MyPhotoView
          userPhoto={userPhoto}
          isPhotoSheetOpen={isPhotoSheetOpen}
          setIsPhotoSheetOpen={setIsPhotoSheetOpen}
          galleryInputRef={galleryInputRef}
          cameraInputRef={cameraInputRef}
          onPhotoSelect={handlePhotoSelect}
          onBack={() => setCurrentView('MYPAGE')}
        />
      )}

      {currentView === 'AI_STUDIO' && (
        <AiStudioView
          userPhoto={userPhoto}
          cartItems={cartItems}
          selectedCartItemId={selectedCartItemId}
          setSelectedCartItemId={setSelectedCartItemId}
          isCartSelectorOpen={isCartSelectorOpen}
          setIsCartSelectorOpen={setIsCartSelectorOpen}
          aiPrompt={aiPrompt}
          setAiPrompt={setAiPrompt}
          generatedImage={generatedImage}
          isGenerating={isGenerating}
          useMyPhoto={useMyPhoto}
          aiStudioFileRef={aiStudioFileRef}
          onPhotoSelect={handlePhotoSelect}
          onAiGeneration={handleAiGeneration}
          onBack={() => setCurrentView('MYPAGE')}
          onGoToHome={() => setCurrentView('HOME')}
        />
      )}

      {currentView === 'WISHLIST' && (
        <WishlistView
          products={wishlistProducts}
          onBack={() => setCurrentView('MYPAGE')}
          onProductClick={goToDetail}
          onAddToCart={addToCart}
          onToggleLike={handleToggleLike}
        />
      )}

      {currentView === 'RECENTLY_VIEWED' && (
        <RecentlyViewedView
          products={recentProducts}
          onBack={() => setCurrentView('MYPAGE')}
          onProductClick={goToDetail}
          onAddToCart={addToCart}
          likedProductIds={likedProductIds}
          onToggleLike={handleToggleLike}
        />
      )}

      {currentView === 'AI_COORDINATOR' && (
        <AiCoordinatorView
          searchQuery={aiSearchQuery}
          setSearchQuery={setAiSearchQuery}
          recommendationComment={recommendationComment}
          recommendedProducts={recommendedProducts}
          isSearching={isAiSearching}
          suggestedKeywords={suggestedKeywords}
          stylingItems={stylingItems}
          searchError={aiSearchError}
          handleSearch={handleAiSearch}
          onProductClick={goToDetail}
          onAddToCart={addToCart}
          likedProductIds={likedProductIds}
          onToggleLike={handleToggleLike}
        />
      )}

      {currentView === 'CHECKOUT' && orderItem && (
        <CheckoutView 
          orderItem={orderItem}
          onBack={() => setCurrentView('DETAIL')}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
      
      {(!['DETAIL', 'MY_PHOTOS', 'AI_STUDIO', 'CHECKOUT', 'ORDER_HISTORY'].includes(currentView)) && (
        <Navbar 
          currentView={currentView} 
          setCurrentView={setCurrentView}
          cartCount={cartCount} 
        />
      )}
    </div>
  );
};

export default App;