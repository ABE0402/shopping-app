import { useState, useEffect } from 'react';
import { User } from '../types';
import { wishlistService } from '../services/dbService';

export const useWishlist = (currentUser: User | null) => {
  const [likedProductIds, setLikedProductIds] = useState<number[]>([]);

  useEffect(() => {
    if (currentUser) {
      const loadWishlist = async () => {
        try {
          const wishlist = await wishlistService.getWishlist(currentUser.id);
          setLikedProductIds(wishlist);
        } catch (error) {
          console.error('찜한 상품 로드 실패:', error);
          const saved = localStorage.getItem('likedProductIds');
          if (saved) {
            try {
              setLikedProductIds(JSON.parse(saved));
            } catch {
              setLikedProductIds([]);
            }
          }
        }
      };
      loadWishlist();
    } else {
      const saved = localStorage.getItem('likedProductIds');
      if (saved) {
        try {
          setLikedProductIds(JSON.parse(saved));
        } catch {
          setLikedProductIds([]);
        }
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (likedProductIds.length >= 0) {
      const saveWishlist = async () => {
        try {
          if (currentUser) {
            await wishlistService.updateWishlist(currentUser.id, likedProductIds);
          }
          localStorage.setItem('likedProductIds', JSON.stringify(likedProductIds));
        } catch (error) {
          console.error('찜한 상품 저장 실패:', error);
          localStorage.setItem('likedProductIds', JSON.stringify(likedProductIds));
        }
      };
      saveWishlist();
    }
  }, [likedProductIds, currentUser]);

  const toggleLike = (productId: number) => {
    setLikedProductIds(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  return { likedProductIds, toggleLike };
};

