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
import { db, storage } from './firebaseConfig';
import { Product, User, CartItem, Order, UserPhoto } from '../types';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';

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

  // 사용자 저장/업데이트 (비밀번호 포함)
  async saveUser(user: User & { password?: string }): Promise<void> {
    try {
      const userRef = doc(db, 'users', user.id);
      const userData: any = { ...user };
      // 비밀번호가 있으면 저장 (로그인 검증에 필요)
      if (user.password) {
        userData.password = user.password;
      }
      
      await setDoc(userRef, {
        ...userData,
        updatedAt: Timestamp.now()
      }, { merge: true });
    } catch (error) {
      console.error('사용자 저장 실패:', error);
      throw error;
    }
  },

  // 아이디와 비밀번호로 사용자 인증
  async authenticateUser(id: string, password: string): Promise<User | null> {
    try {
      console.log('🔐 Firebase 인증 시도:', { id, passwordLength: password.length });
      
      // 방법 1: 문서 ID가 아이디인 경우
      const userRef = doc(db, 'users', id);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        console.log('📄 문서 ID로 찾은 사용자:', { 
          docId: id, 
          hasPassword: !!userData.password,
          userId: userData.id 
        });
        
        // 비밀번호 확인
        if (userData.password === password) {
          console.log('✅ 문서 ID로 인증 성공');
          // 비밀번호는 반환하지 않음
          const { password: _, ...userWithoutPassword } = userData;
          // id 필드가 없으면 문서 ID를 사용
          return { 
            id: userData.id || id, 
            ...userWithoutPassword 
          } as User;
        } else {
          console.log('❌ 비밀번호 불일치 (문서 ID 방식)');
        }
      } else {
        console.log('📭 문서 ID로 사용자를 찾을 수 없음:', id);
      }
      
      // 방법 2: id 필드로 쿼리 (문서 ID가 다를 수 있음)
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('id', '==', id));
      const querySnapshot = await getDocs(q);
      
      console.log('🔍 id 필드로 쿼리 결과:', querySnapshot.size, '개 문서 발견');
      
      if (!querySnapshot.empty) {
        for (const docSnap of querySnapshot.docs) {
          const userData = docSnap.data();
          console.log('📄 쿼리로 찾은 사용자:', { 
            docId: docSnap.id, 
            userId: userData.id,
            hasPassword: !!userData.password 
          });
          
          // 비밀번호 확인
          if (userData.password === password) {
            console.log('✅ id 필드 쿼리로 인증 성공');
            // 비밀번호는 반환하지 않음
            const { password: _, ...userWithoutPassword } = userData;
            return { 
              id: userData.id || docSnap.id, 
              ...userWithoutPassword 
            } as User;
          } else {
            console.log('❌ 비밀번호 불일치 (쿼리 방식)');
          }
        }
      }
      
      console.log('❌ 인증 실패: 일치하는 사용자를 찾을 수 없거나 비밀번호가 틀림');
      return null;
    } catch (error) {
      console.error('🚨 사용자 인증 실패:', error);
      return null;
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

// ============ Orders (주문내역) ============
export const orderService = {
  // 사용자 주문 내역 가져오기
  async getUserOrders(userId: string): Promise<Order[]> {
    try {
      console.log('🔍 주문 내역 조회 시작:', userId);
      const ordersRef = collection(db, 'orders');
      
      // orderBy 없이 먼저 시도 (인덱스 문제 방지)
      let q = query(
        ordersRef,
        where('userId', '==', userId)
      );
      
      let querySnapshot;
      try {
        querySnapshot = await getDocs(q);
      } catch (error: any) {
        // orderBy가 필요한 경우 다시 시도
        console.log('⚠️ orderBy 없이 쿼리 실패, orderBy 포함하여 재시도:', error.message);
        q = query(
          ordersRef,
          where('userId', '==', userId),
          orderBy('createdAt', 'desc') // createdAt으로 정렬 시도
        );
        querySnapshot = await getDocs(q);
      }
      
      const orders = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date instanceof Timestamp 
            ? data.date.toDate().toISOString() 
            : data.date || data.createdAt instanceof Timestamp
            ? data.createdAt.toDate().toISOString()
            : data.createdAt || new Date().toISOString()
        };
      }) as Order[];
      
      // 날짜 기준으로 정렬 (클라이언트 측)
      orders.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA; // 내림차순
      });
      
      console.log('✅ 주문 내역 조회 완료:', orders.length, '개');
      return orders;
    } catch (error: any) {
      console.error('❌ 주문 내역 가져오기 실패:', error);
      console.error('에러 상세:', error.message, error.code);
      return [];
    }
  },

  // 주문 추가
  async addOrder(order: Order): Promise<string> {
    try {
      const ordersRef = collection(db, 'orders');
      const orderDocRef = doc(ordersRef, order.id);
      
      await setDoc(orderDocRef, {
        ...order,
        date: Timestamp.fromDate(new Date(order.date)),
        createdAt: Timestamp.now()
      });
      
      return order.id;
    } catch (error) {
      console.error('주문 추가 실패:', error);
      throw error;
    }
  },

  // 주문 상태 업데이트
  async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('주문 상태 업데이트 실패:', error);
      throw error;
    }
  },

  // 주문 삭제
  async deleteOrder(orderId: string): Promise<void> {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await deleteDoc(orderRef);
    } catch (error) {
      console.error('주문 삭제 실패:', error);
      throw error;
    }
  }
};

// ============ Admin Orders (관리자 주문내역) ============
export const adminOrderService = {
  // 모든 주문 내역 가져오기 (관리자용)
  async getAllOrders(): Promise<Order[]> {
    try {
      const ordersRef = collection(db, 'adminOrders');
      const q = query(ordersRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date instanceof Timestamp 
          ? doc.data().date.toDate().toISOString() 
          : doc.data().date
      })) as Order[];
    } catch (error) {
      console.error('관리자 주문 내역 가져오기 실패:', error);
      return [];
    }
  },

  // 관리자 주문 내역에 추가
  async addAdminOrder(order: Order): Promise<string> {
    try {
      const ordersRef = collection(db, 'adminOrders');
      const orderDocRef = doc(ordersRef, order.id);
      
      await setDoc(orderDocRef, {
        ...order,
        date: Timestamp.fromDate(new Date(order.date)),
        createdAt: Timestamp.now()
      });
      
      return order.id;
    } catch (error) {
      console.error('관리자 주문 추가 실패:', error);
      throw error;
    }
  },

  // 관리자 주문 상태 업데이트
  async updateAdminOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    try {
      const orderRef = doc(db, 'adminOrders', orderId);
      await updateDoc(orderRef, {
        status,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('관리자 주문 상태 업데이트 실패:', error);
      throw error;
    }
  }
};

// ============ User Photos (내 사진 - 나노바나나로 합성된 사진) ============
export const userPhotoService = {
  // 사용자 사진 목록 가져오기
  async getUserPhotos(userId: string): Promise<UserPhoto[]> {
    try {
      const photosRef = collection(db, 'userPhotos');
      const q = query(
        photosRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt instanceof Timestamp 
          ? doc.data().createdAt.toDate().toISOString() 
          : doc.data().createdAt
      })) as UserPhoto[];
    } catch (error) {
      console.error('사용자 사진 목록 가져오기 실패:', error);
      return [];
    }
  },

  // 사진 추가 (이미지를 Firebase Storage에 업로드하고 메타데이터를 Firestore에 저장)
  async addUserPhoto(
    userId: string, 
    imageBase64: string, 
    productId?: number,
    productName?: string,
    prompt?: string
  ): Promise<UserPhoto> {
    try {
      // 1. Firebase Storage에 이미지 업로드
      const photoId = `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const storageRef = ref(storage, `userPhotos/${userId}/${photoId}.jpg`);
      
      // base64 데이터에서 data URL 부분 제거
      const base64Data = imageBase64.includes(',') 
        ? imageBase64.split(',')[1] 
        : imageBase64;
      
      await uploadString(storageRef, base64Data, 'base64', {
        contentType: 'image/jpeg',
      });
      
      // 2. 다운로드 URL 가져오기
      const imageUrl = await getDownloadURL(storageRef);
      
      // 3. Firestore에 메타데이터 저장
      const photoData: Omit<UserPhoto, 'id'> = {
        userId,
        imageUrl,
        createdAt: new Date().toISOString(),
        productId,
        productName,
        prompt
      };
      
      const photosRef = collection(db, 'userPhotos');
      const photoDocRef = doc(photosRef, photoId);
      
      await setDoc(photoDocRef, {
        ...photoData,
        createdAt: Timestamp.now()
      });
      
      return {
        id: photoId,
        ...photoData
      };
    } catch (error) {
      console.error('사용자 사진 추가 실패:', error);
      throw error;
    }
  },

  // 사진 삭제
  async deleteUserPhoto(photoId: string, userId: string): Promise<void> {
    try {
      // 1. Firestore에서 메타데이터 삭제
      const photoRef = doc(db, 'userPhotos', photoId);
      await deleteDoc(photoRef);
      
      // 2. Storage에서 이미지 삭제
      const storageRef = ref(storage, `userPhotos/${userId}/${photoId}.jpg`);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('사용자 사진 삭제 실패:', error);
      throw error;
    }
  }
};

