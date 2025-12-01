import React, { useState, useMemo, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AdminDashboard } from './components/AdminDashboard';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { FindId } from './components/FindId';
import { FindPassword } from './components/FindPassword';
import { WishlistView } from './components/WishlistView';
import { RecentlyViewedView } from './components/RecentlyViewedView';
import { Category, Product, ViewState } from './types';
import { useProducts } from './hooks/useProducts';
import { useAuth } from './useAuth';
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


const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('HOME');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category>('전체');
  const [searchQuery, setSearchQuery] = useState('');

  // Custom Hooks
  const { products, updateProducts } = useProducts();
 const { currentUser, isAdmin, handleUserLogin, handleUserSignup, handleUserLogout } = useAuth();
 const { likedProductIds, toggleLike } = useWishlist(currentUser);
  const { recentProductIds, addToRecentlyViewed } = useRecentlyViewed(currentUser);
  const { cartItems, selectedCartItemId, setSelectedCartItemId, addToCart, removeFromCart, cartCount } = useCart();
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

  // Filter Logic
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

  // Derived Data
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

  // Handlers
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
    setCurrentView('HOME');
  };

  const handleGoToAiStudio = (product: Product) => {
    addToCart(product);
    setSelectedCartItemId(product.id);
    setCurrentView('AI_STUDIO');
  };



  const handleUserLoginWithRedirect = (user: any) => {
    const loginResult = handleUserLogin(user); // loginResult는 AuthResult | null 타입
    if (loginResult) { // loginResult가 null이 아닌 경우 (로그인 성공)
      if (loginResult.isAdmin) {
        setCurrentView('ADMIN_DASHBOARD');
      } else {
        setCurrentView('HOME');
      }
      return loginResult;
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

  // Admin views

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

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white relative shadow-2xl overflow-hidden">
      <GlobalHeader
        title={
          currentView === 'DETAIL' ? selectedProduct?.name :
          currentView === 'LOGIN' ? '로그인' :
          undefined
        }
        onBack={goBack}
        onGoToHome={() => setCurrentView('HOME')}
        onGoToDashboard={() => setCurrentView('ADMIN_DASHBOARD')}
        showBack={currentView !== 'HOME'}
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
      
      {(!['DETAIL', 'MY_PHOTOS', 'AI_STUDIO'].includes(currentView)) && (
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
