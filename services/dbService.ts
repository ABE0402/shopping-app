import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Product, User, CartItem } from '../types';

// ============ Products ============
export const productService = {
  // 모든 상품 가져오기
  async getAllProducts(): Promise<Product[]> {
    try {
      const productsRef = collection(db, 'products');
      const q = query(productsRef, orderBy('id', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.data().id,
        ...doc.data()
      })) as Product[];
    } catch (error) {
      console.error('상품 목록 가져오기 실패:', error);
      return [];
    }
  },

  // 상품 ID로 가져오기
  async getProductById(id: number): Promise<Product | null> {
    try {
      const productRef = doc(db, 'products', id.toString());
      const productSnap = await getDoc(productRef);
      
      if (productSnap.exists()) {
        return { id: productSnap.data().id, ...productSnap.data() } as Product;
      }
      return null;
    } catch (error) {
      console.error('상품 가져오기 실패:', error);
      return null;
    }
  },

  // 상품 추가/업데이트
  async saveProduct(product: Product): Promise<void> {
    try {
      const productRef = doc(db, 'products', product.id.toString());
      await setDoc(productRef, {
        ...product,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('상품 저장 실패:', error);
      throw error;
    }
  },

  // 상품 삭제
  async deleteProduct(id: number): Promise<void> {
    try {
      const productRef = doc(db, 'products', id.toString());
      await deleteDoc(productRef);
    } catch (error) {
      console.error('상품 삭제 실패:', error);
      throw error;
    }
  },

  // 카테고리별 상품 가져오기
  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const productsRef = collection(db, 'products');
      const q = query(
        productsRef, 
        where('category', '==', category),
        orderBy('id', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.data().id,
        ...doc.data()
      })) as Product[];
    } catch (error) {
      console.error('카테고리별 상품 가져오기 실패:', error);
      return [];
    }
  }
};

// ============ Users ============
export const userService = {
  // 사용자 가져오기
  async getUser(userId: string): Promise<User | null> {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return { id: userSnap.data().id, ...userSnap.data() } as User;
      }
      return null;
    } catch (error) {
      console.error('사용자 가져오기 실패:', error);
      return null;
    }
  },

  // 사용자 저장/업데이트
  async saveUser(user: User & { password?: string }): Promise<void> {
    try {
      const userRef = doc(db, 'users', user.id);
      const userData = { ...user };
      delete userData.password; // 비밀번호는 별도로 저장하지 않음 (Firebase Auth 사용)
      
      await setDoc(userRef, {
        ...userData,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('사용자 저장 실패:', error);
      throw error;
    }
  },

  // 이메일로 사용자 찾기
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        return { id: userDoc.data().id, ...userDoc.data() } as User;
      }
      return null;
    } catch (error) {
      console.error('이메일로 사용자 찾기 실패:', error);
      return null;
    }
  }
};

// ============ Cart ============
export const cartService = {
  // 사용자 장바구니 가져오기
  async getCart(userId: string): Promise<CartItem[]> {
    try {
      const cartRef = collection(db, 'users', userId, 'cart');
      const querySnapshot = await getDocs(cartRef);
      
      return querySnapshot.docs.map(doc => ({
        ...doc.data()
      })) as CartItem[];
    } catch (error) {
      console.error('장바구니 가져오기 실패:', error);
      return [];
    }
  },

  // 장바구니에 상품 추가/업데이트
  async addToCart(userId: string, item: CartItem): Promise<void> {
    try {
      const cartRef = doc(db, 'users', userId, 'cart', item.id.toString());
      await setDoc(cartRef, item);
    } catch (error) {
      console.error('장바구니 추가 실패:', error);
      throw error;
    }
  },

  // 장바구니에서 상품 제거
  async removeFromCart(userId: string, productId: number): Promise<void> {
    try {
      const cartRef = doc(db, 'users', userId, 'cart', productId.toString());
      await deleteDoc(cartRef);
    } catch (error) {
      console.error('장바구니 제거 실패:', error);
      throw error;
    }
  }
};

// ============ Wishlist ============
export const wishlistService = {
  // 찜한 상품 목록 가져오기
  async getWishlist(userId: string): Promise<number[]> {
    try {
      const wishlistRef = doc(db, 'users', userId);
      const wishlistSnap = await getDoc(wishlistRef);
      
      if (wishlistSnap.exists()) {
        return wishlistSnap.data().likedProductIds || [];
      }
      return [];
    } catch (error) {
      console.error('찜한 상품 가져오기 실패:', error);
      return [];
    }
  },

  // 찜한 상품 업데이트
  async updateWishlist(userId: string, productIds: number[]): Promise<void> {
    try {
      const wishlistRef = doc(db, 'users', userId);
      // 문서가 없으면 생성하고, 있으면 업데이트
      await setDoc(wishlistRef, {
        likedProductIds: productIds,
        updatedAt: Timestamp.now()
      }, { merge: true }); // merge: true로 기존 데이터 유지하면서 업데이트
    } catch (error) {
      console.error('찜한 상품 업데이트 실패:', error);
      throw error;
    }
  }
};

// ============ Recently Viewed ============
export const recentlyViewedService = {
  // 최근 본 상품 목록 가져오기
  async getRecentlyViewed(userId: string): Promise<number[]> {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return userSnap.data().recentProductIds || [];
      }
      return [];
    } catch (error) {
      console.error('최근 본 상품 가져오기 실패:', error);
      return [];
    }
  },

  // 최근 본 상품 업데이트
  async updateRecentlyViewed(userId: string, productIds: number[]): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      // 문서가 없으면 생성하고, 있으면 업데이트
      await setDoc(userRef, {
        recentProductIds: productIds.slice(0, 30), // 최대 30개
        updatedAt: Timestamp.now()
      }, { merge: true }); // merge: true로 기존 데이터 유지하면서 업데이트
    } catch (error) {
      console.error('최근 본 상품 업데이트 실패:', error);
      throw error;
    }
  }
};

