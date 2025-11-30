# 데이터베이스 연결 가이드

## Firebase 설정 방법

### 1. Firebase 프로젝트 생성
1. [Firebase Console](https://console.firebase.google.com/) 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름 입력 및 설정 완료

### 2. Firestore 데이터베이스 활성화
1. Firebase Console에서 "Firestore Database" 메뉴 선택
2. "데이터베이스 만들기" 클릭
3. 테스트 모드로 시작 (나중에 보안 규칙 설정 가능)
4. 위치 선택 (asia-northeast3 권장 - 서울)

### 3. 웹 앱 등록
1. Firebase Console에서 설정(톱니바퀴) 아이콘 클릭
2. "프로젝트 설정" 선택
3. "내 앱" 섹션에서 웹 아이콘(</>) 클릭
4. 앱 닉네임 입력 후 등록
5. Firebase SDK 설정 정보 복사

### 4. 환경 변수 설정
`.env` 파일에 Firebase 설정 정보 입력:

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 5. Firestore 보안 규칙 설정 (선택사항)
Firebase Console → Firestore Database → 규칙 탭에서:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 사용자 데이터는 본인만 접근 가능
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // 장바구니
      match /cart/{cartItemId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // 상품은 모든 사용자가 읽기 가능, 관리자만 쓰기 가능
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

## 사용 방법

### App.tsx에서 Firebase 사용하기

기존 localStorage 코드를 Firebase 호출로 교체:

```typescript
import { productService, userService, cartService, wishlistService } from './services/dbService';

// 상품 가져오기
const products = await productService.getAllProducts();

// 상품 저장
await productService.saveProduct(product);

// 사용자 정보 저장
await userService.saveUser(user);

// 장바구니 가져오기
const cartItems = await cartService.getCart(userId);
```

## 데이터 구조

### Products Collection
```
products/{productId}
  - id: number
  - name: string
  - price: number
  - category: string
  - image: string
  - rating: number
  - reviews: number
  - description: string
  - updatedAt: Timestamp
```

### Users Collection
```
users/{userId}
  - id: string
  - name: string
  - email: string
  - phone?: string
  - likedProductIds: number[]
  - recentProductIds: number[]
  - updatedAt: Timestamp
  
  cart/{productId}
    - id: number
    - quantity: number
    - ... (Product fields)
```

## 다음 단계

1. Firebase 프로젝트 설정 완료
2. `.env` 파일에 Firebase 설정 추가
3. `App.tsx`에서 localStorage를 Firebase 호출로 교체
4. 서버 재시작 후 테스트

