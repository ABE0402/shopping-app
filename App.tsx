
import React, { useState, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { Category, Product, ViewState, CartItem } from './types';
import { CATEGORIES, INITIAL_PRODUCTS } from './constants';

// Import Views
import { HomeView } from './views/HomeView';
import { DetailView } from './views/DetailView';
import { CartView } from './views/CartView';
import { MyPageView } from './views/MyPageView';
import { MyPhotoView } from './views/MyPhotoView';
import { AiStudioView } from './views/AiStudioView';
import { WishlistView } from './views/WishlistView';
import { RecentlyViewedView } from './views/RecentlyViewedView';
import { ComingSoonView } from './views/ComingSoonView';

const App: React.FC = () => {
  // Navigation State
  const [currentView, setCurrentView] = useState<ViewState>('HOME');
  
  // Data State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category>('전체');
  const [searchQuery, setSearchQuery] = useState('');
  
  // User Features State
  const [likedProductIds, setLikedProductIds] = useState<number[]>([]);
  const [recentProductIds, setRecentProductIds] = useState<number[]>([]);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  
  // AI Studio Context State (persisted when switching views)
  const [selectedCartItemId, setSelectedCartItemId] = useState<number | null>(null);

  // --- Handlers ---

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
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const removeFromCart = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
    if (selectedCartItemId === id) setSelectedCartItemId(null);
  };

  const toggleLike = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    setLikedProductIds(prev => {
      if (prev.includes(product.id)) {
        return prev.filter(id => id !== product.id);
      } else {
        return [...prev, product.id];
      }
    });
  };

  const goToDetail = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('DETAIL');
    
    // Add to Recently Viewed
    setRecentProductIds(prev => {
      const newIds = [product.id, ...prev.filter(id => id !== product.id)];
      return newIds.slice(0, 30);
    });
  };

  const handleGoToAiStudioFromDetail = (product: Product) => {
    addToCart(product);
    setSelectedCartItemId(product.id);
    setCurrentView('AI_STUDIO');
  };

  // --- Derived Data ---

  const filteredProducts = useMemo(() => {
    let result = INITIAL_PRODUCTS;

    if (selectedCategory !== '전체') {
      result = result.filter(p => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q));
    }

    // Sort Descending by ID
    return [...result].sort((a, b) => b.id - a.id);
  }, [selectedCategory, searchQuery]);

  const wishlistProducts = useMemo(() => 
    INITIAL_PRODUCTS.filter(p => likedProductIds.includes(p.id)), 
    [likedProductIds]
  );

  const recentProducts = useMemo(() => 
    recentProductIds
      .map(id => INITIAL_PRODUCTS.find(p => p.id === id))
      .filter((p): p is Product => p !== undefined),
    [recentProductIds]
  );

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // --- Render ---

  return (
    <div className="w-full max-w-md bg-white h-full min-h-screen relative shadow-2xl overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar bg-white">
        {currentView === 'HOME' && (
          <HomeView 
            products={filteredProducts}
            categories={CATEGORIES}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onProductClick={goToDetail}
            onAddToCart={addToCart}
            likedProductIds={likedProductIds}
            onToggleLike={toggleLike}
          />
        )}

        {currentView === 'DETAIL' && (
          <DetailView 
            product={selectedProduct}
            onBack={() => setCurrentView('HOME')}
            onAddToCart={addToCart}
            onNavigateToCart={() => setCurrentView('CART')}
            cartCount={cartCount}
            isLiked={selectedProduct ? likedProductIds.includes(selectedProduct.id) : false}
            onToggleLike={toggleLike}
            onGoToAiStudio={handleGoToAiStudioFromDetail}
          />
        )}

        {currentView === 'CART' && (
          <CartView 
            cartItems={cartItems}
            onRemoveFromCart={removeFromCart}
            onGoHome={() => setCurrentView('HOME')}
          />
        )}

        {currentView === 'MYPAGE' && (
          <MyPageView 
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'MY_PHOTOS' && (
          <MyPhotoView 
            userPhoto={userPhoto}
            onUpdatePhoto={setUserPhoto}
            onBack={() => setCurrentView('MYPAGE')}
          />
        )}

        {currentView === 'AI_STUDIO' && (
          <AiStudioView 
            userPhoto={userPhoto}
            onUpdateUserPhoto={setUserPhoto}
            cartItems={cartItems}
            selectedCartItemId={selectedCartItemId}
            setSelectedCartItemId={setSelectedCartItemId}
            onBack={() => setCurrentView('MYPAGE')}
            onNavigateHome={() => setCurrentView('HOME')}
          />
        )}

        {currentView === 'WISHLIST' && (
          <WishlistView 
            products={wishlistProducts}
            onBack={() => setCurrentView('MYPAGE')}
            onProductClick={goToDetail}
            onAddToCart={addToCart}
            onToggleLike={toggleLike}
          />
        )}

        {currentView === 'RECENTLY_VIEWED' && (
          <RecentlyViewedView 
            products={recentProducts}
            onBack={() => setCurrentView('MYPAGE')}
            onProductClick={goToDetail}
            onAddToCart={addToCart}
            likedProductIds={likedProductIds}
            onToggleLike={toggleLike}
          />
        )}

        {currentView === 'ORDER_HISTORY' && (
          <ComingSoonView title="주문 내역" onBack={() => setCurrentView('MYPAGE')} />
        )}
        
        {currentView === 'COUPONS' && (
          <ComingSoonView title="쿠폰함" onBack={() => setCurrentView('MYPAGE')} />
        )}

        {currentView === 'SETTINGS' && (
          <ComingSoonView title="설정" onBack={() => setCurrentView('MYPAGE')} />
        )}
      </div>
      
      {/* Bottom Navigation (Conditional) */}
      {(currentView !== 'DETAIL' && 
        currentView !== 'MY_PHOTOS' && 
        currentView !== 'AI_STUDIO' && 
        currentView !== 'WISHLIST' && 
        currentView !== 'RECENTLY_VIEWED' && 
        currentView !== 'ORDER_HISTORY' && 
        currentView !== 'COUPONS' && 
        currentView !== 'SETTINGS') && (
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
