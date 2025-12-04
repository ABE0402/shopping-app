export type Category = '전체' | '상의' | '하의' | '아우터' | '신발' | '모자' | '액세서리';

export interface Product {
  id: number;
  name: string;
  price: number;
  category: Category;
  image: string;
  rating: number;
  reviews: number;
  isNew?: boolean;
  description: string;
}

export interface CartItem extends Product {
  quantity: number;
  selectedColor?: string; // 옵션 추가
  selectedSize?: string;  // 옵션 추가
}

// 주문하려는 상품 정보 타입
export interface OrderItem extends Product {
  quantity: number;
  selectedColor: string;
  selectedSize: string;
}

// [추가] 주문 정보 전체 타입
export interface Order {
  id: string;
  userId?: string; // 관리자 주문내역에서 사용
  items: OrderItem[];
  date: string;
  totalAmount: number;
  address: string;
  request: string;
  paymentMethod: string;
  status: '결제완료' | '배송준비중' | '배송중' | '배송완료';
}

// 사용자 사진 타입 (나노바나나로 합성된 사진)
export interface UserPhoto {
  id: string;
  userId: string;
  imageUrl: string; // Firebase Storage URL
  thumbnailUrl?: string; // 썸네일 URL (선택사항)
  createdAt: string; // ISO 날짜 문자열
  productId?: number; // 합성에 사용된 상품 ID (선택사항)
  productName?: string; // 합성에 사용된 상품 이름 (선택사항)
  prompt?: string; // 사용된 프롬프트 (선택사항)
}

// CHECKOUT 뷰 추가
export type ViewState = 'HOME' | 'CART' | 'MYPAGE' | 'DETAIL' | 'MY_PHOTOS' | 'AI_STUDIO' | 'ADMIN_LOGIN' | 'ADMIN_DASHBOARD' | 'LOGIN' | 'SIGNUP' | 'FIND_ID' | 'FIND_PASSWORD' | 'WISHLIST' | 'RECENTLY_VIEWED' | 'AI_COORDINATOR' | 'CHECKOUT' | 'ORDER_HISTORY';
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}