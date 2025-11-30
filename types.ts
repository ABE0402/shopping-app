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
}

export type ViewState = 'HOME' | 'CART' | 'MYPAGE' | 'DETAIL' | 'MY_PHOTOS' | 'AI_STUDIO' | 'ADMIN_LOGIN' | 'ADMIN_DASHBOARD';