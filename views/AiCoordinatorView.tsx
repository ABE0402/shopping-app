import React from 'react';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';

interface AiCoordinatorViewProps {
  searchQuery: string;
  recommendationComment: string | null;
  setSearchQuery: (query: string) => void;
  recommendedProducts: Product[];
  isSearching: boolean;
  searchError: string | null;
  stylingItems: { category: string, products: Product[] }[];
  suggestedKeywords: string[];
  handleSearch: () => void;
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  likedProductIds: number[];
  onToggleLike: (e: React.MouseEvent, product: Product) => void;
}

export const AiCoordinatorView: React.FC<AiCoordinatorViewProps> = ({
  searchQuery,
  recommendationComment,
  setSearchQuery,
  recommendedProducts,
  isSearching,
  searchError,
  stylingItems,
  suggestedKeywords,
  handleSearch,
  onProductClick,
  onAddToCart,
  likedProductIds,
  onToggleLike,
}) => {

  const handleSuggestionClick = (keyword: string) => {
    setSearchQuery(keyword);
    // setSearchQuery가 상태 업데이트를 예약하므로, 다음 렌더링 사이클에서 handleSearch를 호출하기 위해 setTimeout 사용
    setTimeout(() => handleSearch(), 0);
  };

  return (
    <div className="pb-24">
      <header className="sticky top-0 bg-white z-40 shadow-sm px-4 py-3">
        <h1 className="text-xl font-bold text-center">AI 코디네이터</h1>
        <p className="text-center text-sm text-gray-500 mt-1">
          원하는 스타일을 알려주시면 상품을 추천해드려요.
        </p>
      </header>

      <main className="px-4 pt-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="예: 겨울에 입을 따뜻한 아우터"
              className="w-full h-12 pl-4 pr-12 rounded-lg text-sm transition-all border border-gray-300 bg-white focus:ring-purple-500 focus:outline-none focus:ring-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
              disabled={isSearching}
            />
            <i className="fa-solid fa-wand-magic-sparkles absolute right-4 top-3.5 text-purple-400 text-lg"></i>
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className={`w-24 h-12 rounded-lg font-bold text-white transition-colors flex items-center justify-center ${
              isSearching ? 'bg-gray-400' : 'bg-black hover:bg-gray-800'
            }`}
          >
            {isSearching ? <i className="fa-solid fa-spinner fa-spin"></i> : '추천받기'}
          </button>
        </div>

        {isSearching && recommendedProducts.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <i className="fa-solid fa-spinner fa-spin text-3xl mb-4 text-purple-500"></i>
            <p>AI가 상품을 찾고 있어요...</p>
          </div>
        )}

        {searchError && (
          <div className="text-center py-20 text-red-500 bg-red-50 rounded-lg">
            <i className="fa-solid fa-circle-exclamation text-3xl mb-4"></i>
            <p>{searchError}</p>
            
            {(suggestedKeywords.length > 0 || ["인기 상품", "신상품"].length > 0) && (
              <div className="mt-6">
                <p className="text-sm text-gray-600 mb-3">이런 검색어는 어떠세요?</p>
                <div className="flex flex-wrap justify-center gap-2 px-4">
                  {suggestedKeywords.map((keyword, index) => (
                    <button
                      key={`sugg-${index}`}
                      onClick={() => handleSuggestionClick(keyword)}
                      className="px-3 py-1.5 bg-white border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-colors"
                    >
                      {keyword}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!isSearching && !searchError && recommendedProducts.length > 0 && (
          <>
            {recommendationComment && (
              <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg text-center">
                <p className="text-base font-semibold text-purple-800">
                  <i className="fa-solid fa-lightbulb mr-2"></i>
                  {recommendationComment}
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-x-4 gap-y-8">
              {recommendedProducts.map((product) => (
                <ProductCard
                  key={`reco-${product.id}`}
                  product={product}
                  onAddToCart={onAddToCart}
                  onClick={onProductClick}
                  isLiked={likedProductIds.includes(product.id)}
                  onToggleLike={onToggleLike}
                />
              ))}
            </div>

            {stylingItems.length > 0 && (
              <div className="mt-12">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold">함께 코디하면 좋은 아이템</h3>
                  <p className="text-sm text-gray-500">AI가 추천하는 추가 아이템으로 룩을 완성해보세요.</p>
                </div>
                <div className="space-y-8">
                  {stylingItems.map(({ category, products }) => (
                    <div key={category}>
                      <h4 className="text-md font-bold mb-4 pl-2">{category}</h4>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-8">
                        {products.map(product => (
                          <ProductCard
                            key={`style-${product.id}`}
                            product={product}
                            onAddToCart={onAddToCart}
                            onClick={onProductClick}
                            isLiked={likedProductIds.includes(product.id)}
                            onToggleLike={onToggleLike}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};