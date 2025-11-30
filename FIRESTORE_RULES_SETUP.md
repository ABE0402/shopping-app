# Firestore 보안 규칙 설정 가이드

## 현재 문제
"Missing or insufficient permissions" 오류가 발생하고 있습니다.
이는 Firestore 보안 규칙이 너무 제한적으로 설정되어 있기 때문입니다.

## 해결 방법

### 방법 1: 테스트 모드로 시작 (빠른 해결)

1. [Firebase Console](https://console.firebase.google.com/project/shopping-app-ebaa6/firestore) 접속
2. "규칙" 탭 클릭
3. 다음 규칙으로 교체:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

4. "게시" 버튼 클릭

⚠️ **주의**: 이 규칙은 모든 사용자가 모든 데이터를 읽고 쓸 수 있게 합니다. 
개발/테스트 단계에서만 사용하세요.

### 방법 2: 제한된 규칙 (권장)

1. Firebase Console → Firestore Database → 규칙 탭
2. 다음 규칙으로 교체:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Products - 모든 사용자가 읽기 가능, 쓰기는 허용
    match /products/{productId} {
      allow read: if true;
      allow write: if true; // 테스트용
    }
    
    // Users - 본인만 접근 가능
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // 장바구니
      match /cart/{cartItemId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // 기본적으로 모든 접근 허용 (테스트 모드)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. "게시" 버튼 클릭

## 규칙 적용 확인

규칙을 게시한 후:
1. 브라우저를 새로고침
2. 콘솔에서 "Missing or insufficient permissions" 오류가 사라졌는지 확인
3. Firebase Console → Firestore Database에서 상품 데이터가 저장되었는지 확인

## 프로덕션 환경 보안 규칙

현재는 **테스트 모드**로 설정되어 있어 모든 사용자가 데이터를 읽고 쓸 수 있습니다.

### 프로덕션 환경으로 전환하기

1. Firebase Console → Firestore Database → 규칙 탭
2. `firestore.rules.production` 파일의 내용을 복사하여 규칙에 붙여넣기
3. "게시" 버튼 클릭

### 프로덕션 규칙 특징:
- ✅ 모든 사용자가 상품 조회 가능 (읽기)
- ❌ 일반 사용자는 상품 추가/수정/삭제 불가 (쓰기)
- ✅ 사용자는 본인의 데이터만 접근 가능
- ✅ 장바구니는 본인만 접근 가능

### 관리자 권한 추가 (선택사항)
나중에 Firebase Authentication을 사용하여 관리자 인증을 구현하면, 
주석 처리된 부분을 활성화하여 관리자만 상품을 관리할 수 있도록 설정할 수 있습니다.

## 보안 참고사항

- **테스트 모드**: 개발/테스트 단계에서만 사용
- **프로덕션 모드**: 실제 서비스에서는 반드시 제한적인 규칙 사용
- 사용자 인증을 구현한 후 인증된 사용자만 데이터에 접근하도록 제한하세요

