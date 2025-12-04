# Firebase 보안 규칙 설정 가이드

이 프로젝트는 Firebase Firestore와 Storage를 사용합니다. 보안 규칙을 설정해야 정상적으로 작동합니다.

## 설정 방법

### 1. Firebase 콘솔 접속
1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. 프로젝트 선택: `shopping-app-ebaa6`

### 2. Firestore 보안 규칙 설정
1. 왼쪽 메뉴에서 **Firestore Database** 클릭
2. **규칙** 탭 클릭
3. `firestore.rules` 파일의 내용을 복사하여 붙여넣기
4. **게시** 버튼 클릭

### 3. Storage 보안 규칙 설정
1. 왼쪽 메뉴에서 **Storage** 클릭
2. **규칙** 탭 클릭
3. `storage.rules` 파일의 내용을 복사하여 붙여넣기
4. **게시** 버튼 클릭

## 보안 규칙 설명

### Firestore 규칙
- **products**: 모든 사용자가 읽기 가능, 관리자만 쓰기 가능
- **users**: 자신의 정보만 읽고 쓸 수 있음
- **orders**: 자신의 주문만 읽고 쓸 수 있음
- **adminOrders**: 인증된 사용자가 읽고 추가할 수 있음 (관리자 기능은 애플리케이션 레벨에서 체크)
- **userPhotos**: 자신의 사진만 읽고 쓸 수 있음

### Storage 규칙
- **userPhotos**: 자신의 사진만 업로드/다운로드/삭제 가능
- 파일 크기 제한: 10MB
- 이미지 파일만 업로드 가능

## 개발 모드 (테스트용)
개발 중에는 임시로 모든 접근을 허용할 수도 있습니다:

### Firestore (개발용 - 프로덕션에서는 사용 금지)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### Storage (개발용 - 프로덕션에서는 사용 금지)
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **주의**: 개발용 규칙은 프로덕션 환경에서는 절대 사용하지 마세요!

