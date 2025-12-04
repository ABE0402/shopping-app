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
  items: OrderItem[];
  date: string;
  totalAmount: number;
  address: string;
  request: string;
  paymentMethod: string;
  status: '결제완료' | '배송준비중' | '배송중' | '배송완료';
}

// CHECKOUT 뷰 추가
export type ViewState = 'HOME' | 'CART' | 'MYPAGE' | 'DETAIL' | 'MY_PHOTOS' | 'AI_STUDIO' | 'ADMIN_LOGIN' | 'ADMIN_DASHBOARD' | 'LOGIN' | 'SIGNUP' | 'FIND_ID' | 'FIND_PASSWORD' | 'WISHLIST' | 'RECENTLY_VIEWED' | 'AI_COORDINATOR' | 'CHECKOUT' | 'ORDER_HISTORY';
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}