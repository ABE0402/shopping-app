import { useState } from 'react';
import { Product, Category } from '../types';
import { searchProductsWithAI, generateRecommendationComment, generateSuggestedKeywords, generateStylingCategories } from '../services/geminiService';
import { CATEGORIES } from '../constants';

export const useAiCoordinator = (allProducts: Product[]) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [recommendationComment, setRecommendationComment] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [stylingItems, setStylingItems] = useState<{ category: string, products: Product[] }[]>([]);
  const [suggestedKeywords, setSuggestedKeywords] = useState<string[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert('검색어를 입력해주세요.');
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setRecommendedProducts([]);
    setSuggestedKeywords([]);
    setStylingItems([]);
    setRecommendationComment(null);

    try {
      // Gemini를 사용하여 관련 상품 ID 검색 (RAG의 Retrieval 부분)
      const matchedIds = await searchProductsWithAI(searchQuery, allProducts);

      if (matchedIds.length === 0) {
        const suggestions = await generateSuggestedKeywords(searchQuery);
        setSuggestedKeywords(suggestions);
        setSearchError('관련 상품을 찾지 못했습니다. 다른 검색어를 시도해보세요.');
      } else {
        // ID를 기반으로 전체 상품 목록에서 상품 정보 필터링
        const recommendations = allProducts.filter(p => matchedIds.includes(p.id));
        setRecommendedProducts(recommendations);

        // 추천된 상품을 기반으로 AI 코디 설명 생성
        const comment = await generateRecommendationComment(searchQuery, recommendations);
        setRecommendationComment(comment);

        // 추천된 상품과 어울리는 스타일링 아이템 카테고리 추천
        const allCategories = [...new Set(allProducts.map(p => p.category))];
        const stylingCategories = await generateStylingCategories(searchQuery, recommendations, allCategories);
        
        const styledItemsResult = stylingCategories
          .map(category => {
            // 해당 카테고리의 상품들을 찾음 (메인 추천 상품 제외)
            const items = allProducts.filter(p => p.category === category && !matchedIds.includes(p.id));
            if (items.length > 0) {
              // 각 카테고리별로 최대 2개만 추천
              return { category, products: items.slice(0, 2) };
            }
            return null;
          })
          .filter((item): item is { category: string, products: Product[] } => item !== null && item.products.length > 0);

        setStylingItems(styledItemsResult);
      }
    } catch (error: any) {
      console.error('AI 코디네이터 검색 오류:', error);
      setSearchError(`검색 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setIsSearching(false);
    }
  };

  return { searchQuery, setSearchQuery, recommendedProducts, recommendationComment, isSearching, searchError, handleSearch, suggestedKeywords, stylingItems };
};