import { useState, useEffect } from 'react';
import { User, Product } from '../types';
import { recentlyViewedService } from '../services/dbService';

export const useRecentlyViewed = (currentUser: User | null) => {
  const [recentProductIds, setRecentProductIds] = useState<number[]>([]);

  useEffect(() => {
    if (currentUser) {
      const loadRecent = async () => {
        try {
          const recent = await recentlyViewedService.getRecentlyViewed(currentUser.id);
          setRecentProductIds(recent);
        } catch (error) {
          console.error('최근 본 상품 로드 실패:', error);
          const saved = localStorage.getItem('recentProductIds');
          if (saved) {
            try {
              setRecentProductIds(JSON.parse(saved));
            } catch {
              setRecentProductIds([]);
            }
          }
        }
      };
      loadRecent();
    } else {
      const saved = localStorage.getItem('recentProductIds');
      if (saved) {
        try {
          setRecentProductIds(JSON.parse(saved));
        } catch {
          setRecentProductIds([]);
        }
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (recentProductIds.length >= 0) {
      const saveRecent = async () => {
        try {
          if (currentUser) {
            await recentlyViewedService.updateRecentlyViewed(currentUser.id, recentProductIds);
          }
          localStorage.setItem('recentProductIds', JSON.stringify(recentProductIds));
        } catch (error) {
          console.error('최근 본 상품 저장 실패:', error);
          localStorage.setItem('recentProductIds', JSON.stringify(recentProductIds));
        }
      };
      saveRecent();
    }
  }, [recentProductIds, currentUser]);

  const addToRecentlyViewed = (product: Product) => {
    if (currentUser) {
      setRecentProductIds(prev => {
        const newIds = [product.id, ...prev.filter(id => id !== product.id)];
        return newIds.slice(0, 30);
      });
    } else {
      setRecentProductIds(prev => {
        const newIds = [product.id, ...prev.filter(id => id !== product.id)];
        const limited = newIds.slice(0, 30);
        localStorage.setItem('recentProductIds', JSON.stringify(limited));
        return limited;
      });
    }
  };

  return { recentProductIds, addToRecentlyViewed };
};

